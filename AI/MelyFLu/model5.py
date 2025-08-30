# melyflu_rag.py
"""
Melyflu RAG — Retrieval-Augmented Generation Therapist
- Uses datasets: train1.csv, train2.csv, combined_dataset.json, intents.json
- Retrieval: TF-IDF (fast)
- Generation: OpenAI ChatCompletion (preferred) OR local causal HF model (fallback)
- Save as: melyflu_rag.py
Run: python melyflu_rag.py
"""
import os, sys, time, json, random, traceback
from typing import List, Tuple, Dict, Any, Optional

# Optional dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# Core
import joblib
import numpy as np
import pandas as pd
import re

# NLP & ML
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Transformers/OpenAI
try:
    import openai
except Exception:
    openai = None

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM, set_seed
    transformers_available = True
except Exception:
    transformers_available = False

# Optional: sentence-transformers (not required but helpful)
try:
    from sentence_transformers import SentenceTransformer
    sbert_available = True
except Exception:
    sbert_available = False

# Config
BOT_NAME = "Melyflu"
SESSIONS_DIR = "sessions"
MEMORY_PATH = "user_memory.jsonl"
VECTORIZER_PATH = "vectorizer.joblib"
INDEX_PATH = "index_store.joblib"
CLASSIFIER_PATH = "theme_classifier.joblib"

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
USE_OPENAI = (openai is not None and OPENAI_API_KEY is not None)
if USE_OPENAI:
    openai.api_key = OPENAI_API_KEY

HF_MODEL_NAME = os.environ.get("HF_CASUAL_MODEL", "microsoft/DialoGPT-medium")  # fallback causal
SEED = 42

# Therapeutic prompt
SYSTEM_PROMPT = (
    f"You are {BOT_NAME}, a professional trauma-informed therapist. "
    "Be empathetic, validate feelings, use reflective listening, and offer low-burden coping steps when appropriate. "
    "Keep responses conversational, warm, and concise (3-6 sentences). If safety risk detected, prioritize crisis instructions."
)

# Risk detection
RISK_PATTERNS = [
    r"suicid|kill myself|want to die|mau mati|bunuh diri|mengakhiri hidup",
    r"kill someone|hurt someone|membunuh|menyakiti orang"
]
CRISIS_RESPONSE = ("I'm very concerned about your safety. If you are in immediate danger, please contact local emergency services now. "
                   "If you're in the U.S., call 988. Are you in a safe place right now?")

# Utilities
_non_alnum_re = re.compile(r"[^a-z0-9'\- \n\r\t.,!?:;()]+", re.IGNORECASE)
_whitespace_re = re.compile(r"\s+")

def normalize(text: str) -> str:
    if text is None: return ""
    s = str(text).strip().lower()
    s = s.replace('\u2019', "'").replace('\u201c','"').replace('\u201d','"')
    s = _non_alnum_re.sub(' ', s)
    s = _whitespace_re.sub(' ', s)
    return s

def ensure_dirs():
    os.makedirs(SESSIONS_DIR, exist_ok=True)

def log_session(role: str, text: str, meta: Dict[str,Any]=None):
    ensure_dirs()
    rec = {"t": time.time(), "role": role, "text": text}
    if meta: rec.update(meta)
    try:
        path = os.path.join(SESSIONS_DIR, f"session_{time.strftime('%Y%m%d')}.jsonl")
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except Exception:
        pass

# ---------------- Data extraction from files (train1.csv, train2.csv, combined_dataset.json, intents.json)
def robust_parse_conversations(s: str):
    if not s or not isinstance(s, str): return []
    try:
        import ast
        parsed = ast.literal_eval(s)
        if isinstance(parsed, (list, tuple)): return parsed
    except Exception:
        pass
    try:
        js = s.replace("None", "null").replace("True", "true").replace("False", "false")
        js = js.replace("'", '"')
        parsed = json.loads(js)
        if isinstance(parsed, list): return parsed
    except Exception:
        pass
    items=[]
    for m in re.finditer(r"\{[^}]*\}", s):
        try:
            obj = m.group(0).replace("'", '"')
            d = json.loads(obj)
            items.append(d)
        except Exception:
            continue
    return items

def extract_pairs_from_train2(path: str) -> List[Tuple[str,str]]:
    out=[]
    if not path or not os.path.exists(path): return out
    try:
        df = pd.read_csv(path)
    except Exception:
        return out
    if "conversations" not in df.columns: return out
    for s in df["conversations"].astype(str).tolist():
        conv = robust_parse_conversations(s)
        for i in range(len(conv)-1):
            a = conv[i]; b = conv[i+1]
            ra = (a.get('from') or a.get('role') or '').lower() if isinstance(a, dict) else ''
            rb = (b.get('from') or b.get('role') or '').lower() if isinstance(b, dict) else ''
            va = (a.get('value') or a.get('text') or a.get('message') or '') if isinstance(a, dict) else ''
            vb = (b.get('value') or b.get('text') or b.get('message') or '') if isinstance(b, dict) else ''
            if 'human' in ra and ('assistant' in rb or 'bot' in rb or 'therapist' in rb):
                out.append((str(va).strip(), str(vb).strip()))
    return out

def load_and_merge_datasets() -> List[Tuple[str,str]]:
    pairs=[]
    # train1.csv (Context, Response)
    if os.path.exists("train1.csv"):
        try:
            df = pd.read_csv("train1.csv")
            if 'Context' in df.columns and 'Response' in df.columns:
                pairs.extend([(str(c).strip(), str(r).strip()) for c,r in df[['Context','Response']].dropna().values])
        except Exception:
            pass
    # train2.csv with conversations
    if os.path.exists("train2.csv"):
        pairs.extend(extract_pairs_from_train2("train2.csv"))
    # combined_dataset.json
    if os.path.exists("combined_dataset.json"):
        try:
            data = json.load(open("combined_dataset.json","r",encoding="utf-8"))
            items = data if isinstance(data, list) else [data]
            for it in items:
                if isinstance(it, dict) and 'Context' in it and 'Response' in it:
                    pairs.append((str(it['Context']).strip(), str(it['Response']).strip()))
        except Exception:
            pass
    # intents.json (patterns -> responses)
    if os.path.exists("intents.json"):
        try:
            d = json.load(open("intents.json","r",encoding="utf-8"))
            for intent in d.get('intents', []):
                for p in intent.get('patterns', []):
                    resp = intent.get('responses', ["I'm listening."])[0]
                    pairs.append((str(p).strip(), str(resp).strip()))
        except Exception:
            pass
    # memory
    if os.path.exists(MEMORY_PATH):
        try:
            with open(MEMORY_PATH,"r",encoding="utf-8") as f:
                for line in f:
                    rec=json.loads(line)
                    pairs.append((rec.get('input',''), rec.get('response','')))
        except Exception:
            pass
    # clean & uniq
    seen=set(); cleaned=[]
    for a,b in pairs:
        na=normalize(a); nb=str(b).strip()
        if not na or not nb: continue
        key=(na,nb)
        if key in seen: continue
        seen.add(key); cleaned.append((na,nb))
    print(f"[i] Loaded {len(cleaned)} training pairs into KB")
    return cleaned

# ---------------- Build / load TF-IDF index
def build_or_load_index():
    if os.path.exists(VECTORIZER_PATH) and os.path.exists(INDEX_PATH):
        try:
            store = joblib.load(INDEX_PATH)
            vect = joblib.load(VECTORIZER_PATH)
            return vect, store['contexts'], store['responses'], store['tfidf']
        except Exception:
            pass
    pairs = load_and_merge_datasets()
    contexts=[p[0] for p in pairs]
    responses=[p[1] for p in pairs]
    if contexts:
        vect = TfidfVectorizer(ngram_range=(1,2), min_df=1)
        tfidf = vect.fit_transform(contexts)
        joblib.dump(vect, VECTORIZER_PATH)
        joblib.dump({'contexts':contexts,'responses':responses,'tfidf':tfidf}, INDEX_PATH)
        print("[i] Vectorizer and index built and cached.")
        return vect, contexts, responses, tfidf
    return None, [], [], None

def get_retrieved_examples(user_text: str, vectorizer, contexts, responses, tfidf, top_k:int=4):
    if vectorizer is None or tfidf is None or not responses:
        return []
    qv = vectorizer.transform([normalize(user_text)])
    sims = (qv @ tfidf.T).toarray()[0]
    idxs = np.argsort(sims)[-top_k:][::-1]
    out=[]
    for i in idxs:
        if sims[i] > 0:
            out.append((contexts[i], responses[i], float(sims[i])))
    return out

# ----------------- Generators -----------------
def openai_chat_completion(system:str, user:str, max_tokens:int=200, temperature:float=0.7) -> Optional[str]:
    if not USE_OPENAI:
        return None
    try:
        messages = [{"role":"system","content":system},
                    {"role":"user","content":user}]
        resp = openai.ChatCompletion.create(model=OPENAI_MODEL, messages=messages, max_tokens=max_tokens, temperature=temperature)
        text = resp["choices"][0]["message"]["content"].strip()
        return text
    except Exception as e:
        print("[openai error]", e)
        return None

# Local causal submit (HF)
local_tokenizer = None
local_model = None
if transformers_available:
    try:
        set_seed(SEED)
        local_tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_NAME)
        local_model = AutoModelForCausalLM.from_pretrained(HF_MODEL_NAME)
        # ensure pad token
        if local_tokenizer.pad_token is None:
            local_tokenizer.pad_token = local_tokenizer.eos_token
        print(f"[i] Local HF causal model loaded: {HF_MODEL_NAME}")
    except Exception as e:
        print("[!] Could not load local HF causal model:", e)
        local_model = None
        local_tokenizer = None

def generate_with_local_model(prompt: str, max_new_tokens:int=180, temperature:float=0.8) -> str:
    if not local_model or not local_tokenizer:
        return ""
    try:
        input_ids = local_tokenizer.encode(prompt, return_tensors="pt")
        gen_ids = local_model.generate(
            input_ids,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=temperature,
            top_p=0.95,
            top_k=50,
            pad_token_id=local_tokenizer.eos_token_id,
            eos_token_id=local_tokenizer.eos_token_id,
        )
        # decode only the new tokens
        out = local_tokenizer.decode(gen_ids[0][input_ids.shape[-1]:], skip_special_tokens=True)
        return out.strip()
    except Exception as e:
        print("[local gen error]", e)
        return ""

# Compose few-shot prompt using retrieved examples + history
def compose_prompt(user_text: str, retrieved: List[Tuple[str,str,float]], history: List[Dict[str,str]]) -> str:
    # Build few-shot examples section
    examples=[]
    for ctx, resp, score in retrieved:
        examples.append(f"User: {ctx}\nAssistant: {resp}")
    # include last n messages of history
    hist_lines=[]
    for m in history[-6:]:
        role = "User" if m['role']=='user' else "Assistant"
        hist_lines.append(f"{role}: {m['content']}")
    hist_txt = "\n".join(hist_lines)
    ex_txt = "\n\n".join(examples)
    prompt_parts = []
    prompt_parts.append("You are Melyflu, a warm trauma-informed therapist. Be empathic, reflective, and conversational.")
    if ex_txt:
        prompt_parts.append("Examples of similar exchanges (use these as style + content guides):\n" + ex_txt)
    if hist_txt:
        prompt_parts.append("Conversation so far:\n" + hist_txt)
    prompt_parts.append("Now respond to the user below in a conversational, empathetic, and helpful way. Keep it natural and not robotic; 3-6 sentences.")
    prompt_parts.append("User: " + user_text)
    return "\n\n".join(prompt_parts)

# risk detection
def detect_risk(txt: str) -> Tuple[bool, List[str]]:
    t = normalize(txt)
    hits=[]
    for p in RISK_PATTERNS:
        if re.search(p, t):
            hits.append(p)
    return (len(hits)>0, hits)

# small coping step
def small_coping_step(theme: str):
    theme = (theme or "").lower()
    if "anxi" in theme or "panic" in theme:
        return ("Box breathing", "Inhale 4 / Hold 4 / Exhale 4 / Hold 4. Repeat 3 times.")
    if "sad" in theme:
        return ("List 3 small things", "Write 3 tiny things that went okay today.")
    if "lonely" in theme:
        return ("Send a message", "Send one short message: 'Hey, are you free to talk?'")
    return ("Short breathing", "Take 4 slow breaths, focusing on the exhale. Repeat 3 times.")

# simple classifier fallback
def build_or_load_classifier(contexts: List[str]):
    if os.path.exists(CLASSIFIER_PATH):
        try:
            return joblib.load(CLASSIFIER_PATH)
        except Exception:
            pass
    # very small fake training
    X=["i am anxious","i feel sad","i am lonely","i want to hurt someone"]
    y=["anxiety","sadness","lonely","anger"]
    vect = TfidfVectorizer(ngram_range=(1,2), min_df=1)
    Xv = vect.fit_transform(X)
    clf = LogisticRegression(max_iter=400)
    clf.fit(Xv,y)
    pipe = Pipeline([('vect', vect), ('clf', clf)])
    joblib.dump(pipe, CLASSIFIER_PATH)
    return pipe

# compose system/user and call appropriate generator
def generate_reply(user_text: str, vectorizer, contexts, responses, tfidf, history: List[Dict[str,str]], classifier) -> str:
    # risk check
    risk, flags = detect_risk(user_text)
    if risk:
        return CRISIS_RESPONSE

    # 1) retrieve examples
    retrieved = get_retrieved_examples(user_text, vectorizer, contexts, responses, tfidf, top_k=4)

    # 2) compose prompt for generator
    prompt = compose_prompt(user_text, retrieved, history)

    # 3) try OpenAI first
    if USE_OPENAI:
        try:
            openai_system = SYSTEM_PROMPT
            # use the prompt as user content
            resp = openai_chat_completion(openai_system, prompt, max_tokens=300, temperature=0.7)
            if resp and len(resp.strip())>0:
                return resp.strip()
        except Exception as e:
            print("[openai generate error]", e)

    # 4) fallback to local model
    if local_model:
        # prefix with system instructions
        local_prompt = f"{SYSTEM_PROMPT}\n\n{prompt}\n\n{BOT_NAME}:"
        out = generate_with_local_model(local_prompt, max_new_tokens=200, temperature=0.8)
        if out and len(out.strip())>0:
            return out.strip()

    # 5) final fallback: use retrieved response top-1 plus reflection
    if retrieved:
        top_resp = retrieved[0][1]
        return f"{top_resp}\n\nIf you'd like, tell me more about that."
    # ultimate fallback
    return "I'm here to listen. Can you say a bit more about what's been happening?"

# ---------------- Main interactive loop
def main():
    print(f"\n=== {BOT_NAME} (RAG-enhanced) ===")
    mode=""
    while mode not in {"text","audio"}:
        mode = input("Choose mode (text/audio): ").strip().lower()
    if mode=="audio":
        print("[i] Audio currently not implemented in this script—switching to text mode.")
        mode="text"

    vectorizer, contexts, responses, tfidf = build_or_load_index()
    classifier = build_or_load_classifier(contexts)
    session_history: List[Dict[str,str]] = []
    turns = 0
    permission_requested = False
    permission_granted = False

    print("Type 'exit' to quit. Reply 'yes' to accept a suggested step. Type 'good' to save example.")

    while True:
        try:
            user_text = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n{BOT_NAME}: Thank you for sharing. Take care.")
            break
        if not user_text:
            continue
        if user_text.lower() in {"exit","quit","stop","keluar"}:
            print(f"{BOT_NAME}: Thank you for sharing. Remember you are not alone. Take care.")
            break

        turns += 1

        # permission granted path
        if permission_requested and normalize(user_text) in {"yes","sure","ok","okay","ya"}:
            permission_granted = True
            # provide step based on last intent if possible
            try:
                theme = classifier.predict([normalize(session_history[-1]['content'])])[0] if session_history else "general"
            except Exception:
                theme = "general"
            title, instr = small_coping_step(theme)
            step_txt = f"Okay — short step: {title} — {instr}\n\nWould you like to name one small action you could try?"
            print(f"\n{BOT_NAME}: {step_txt}")
            log_session("bot", step_txt, {"phase":"provide_step"})
            session_history.append({"role":"bot","content":step_txt})
            permission_requested = False
            continue

        # generate reply using RAG
        reply = generate_reply(user_text, vectorizer, contexts, responses, tfidf, session_history, classifier)

        # decide whether to offer short coping step (heuristic)
        offer = False
        low_thresh = any(k in normalize(user_text) for k in ["help","help me","tolong","bantu","i need help"])
        if low_thresh or turns>=3:
            offer=True
        if offer:
            title, instr = small_coping_step("general")
            perm_txt = permission_offer = f"May I offer a short, practical step that often helps? (If yes, reply 'yes' or 'sure')\nExample: {title}: {instr}"
            reply = f"{reply}\n\n{perm_txt}\n\nWe can keep talking if you'd prefer not to try a step now."
            permission_requested = True

        print(f"\n{BOT_NAME}: {reply}")
        log_session("bot", reply, {"phase":"response"})
        session_history.append({"role":"user","content":user_text})
        session_history.append({"role":"bot","content":reply})

        # feedback prompt
        fb = input("\nFeedback (type 'good' to save, 'summary' to export, Enter to continue): ").strip()
        if fb:
            if fb.lower()=="summary":
                fname = os.path.join(SESSIONS_DIR, f"summary_{int(time.time())}.txt")
                try:
                    with open(fname,"w",encoding="utf-8") as fo:
                        fo.write(f"{BOT_NAME} session\n\n")
                        for m in session_history:
                            fo.write(f"{m['role']}: {m['content']}\n\n")
                    print("[i] exported:", fname)
                except Exception as e:
                    print("[!] failed export", e)
            else:
                f = normalize(fb)
                if any(tok in f for tok in ["good","thanks","thank","helpful","great"]):
                    rec={"input": user_text, "response": reply, "t": time.time()}
                    try:
                        with open(MEMORY_PATH,"a",encoding="utf-8") as mo:
                            mo.write(json.dumps(rec, ensure_ascii=False)+"\n")
                        # clear caches to rebuild
                        for p in (VECTORIZER_PATH, INDEX_PATH, CLASSIFIER_PATH):
                            try:
                                if os.path.exists(p): os.remove(p)
                            except:
                                pass
                        print("[i] saved example to memory")
                    except Exception as e:
                        print("[!] failed to save memory", e)

if __name__=="__main__":
    try:
        main()
    except Exception as e:
        print("Fatal:", e)
        traceback.print_exc()
