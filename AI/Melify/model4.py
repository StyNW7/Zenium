import os, sys, time, json, random, traceback
from typing import List, Tuple, Dict, Any, Optional

# load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# core
import joblib
import numpy as np
import pandas as pd
import re
import ast

# sklearn TF-IDF
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Transformers / HF
try:
    import openai
except Exception:
    openai = None

try:
    from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM, set_seed
    transformers_available = True
except Exception:
    transformers_available = False

# optional sentence-transformers (for embedding retrieval)
try:
    from sentence_transformers import SentenceTransformer
    sbert_available = True
except Exception:
    sbert_available = False

# optional audio (ASR + TTS)
try:
    import speech_recognition as sr
    import edge_tts
    from playsound import playsound
    AUDIO_AVAILABLE = True
except Exception:
    AUDIO_AVAILABLE = False

# ---------------- Config ----------------
BOT_NAME = "Melify"
SESSIONS_DIR = "sessions"
MEMORY_PATH = "user_memory.jsonl"
VECTORIZER_PATH = "vectorizer.joblib"
INDEX_PATH = "index_store.joblib"
CLASSIFIER_PATH = "theme_classifier.joblib"

TRAIN1_PATH = "train1.csv"
TRAIN2_PATHS = ["train2.csv", "fb891404-73ce-4411-9cb0-4183035d75aa.csv"]
TRAIN2_PATH = next((p for p in TRAIN2_PATHS if os.path.exists(p)), None)
INTENTS_PATHS = ["intents.json"]
COMBINED_PATHS = ["combined_dataset.json"]

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
USE_OPENAI = (openai is not None and OPENAI_API_KEY is not None)
if USE_OPENAI:
    openai.api_key = OPENAI_API_KEY

HF_CASUAL_FALLBACK = os.environ.get("HF_CASUAL_MODEL", "microsoft/DialoGPT-medium")

SIMILARITY_THRESHOLD = 0.35
TOP_K_RETRIEVE = 4

# risk patterns (en + id)
RISK_PATTERNS = [
    r"suicid|kill myself|want to die|i want to die|i'm going to die|bunuh diri|mau mati|mengakhiri hidup",
    r"kill someone|hurt someone|membunuh|menyakiti orang"
]
CRISIS_RESPONSE = ("I'm very concerned about your safety. If you are in immediate danger, please contact local emergency services now. "
                   "If you're in the U.S., call 988. Are you in a safe place right now?")

# normalize helpers
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

# ---------------- Load & extract datasets ----------------
def robust_parse_conversations(s: str):
    if not s or not isinstance(s, str): return []
    try:
        parsed = ast.literal_eval(s)
        if isinstance(parsed, (list, tuple)): return parsed
    except Exception:
        pass
    try:
        js = s.replace("None","null").replace("True","true").replace("False","false")
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

def extract_pairs_from_train2(path: str):
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
            a=conv[i]; b=conv[i+1]
            ra=(a.get('from') or a.get('role') or '').lower() if isinstance(a, dict) else ''
            rb=(b.get('from') or b.get('role') or '').lower() if isinstance(b, dict) else ''
            va=(a.get('value') or a.get('text') or a.get('message') or '') if isinstance(a, dict) else ''
            vb=(b.get('value') or b.get('text') or b.get('message') or '') if isinstance(b, dict) else ''
            if 'human' in ra and ('assistant' in rb or 'bot' in rb or 'therapist' in rb):
                out.append((str(va).strip(), str(vb).strip()))
    return out

def load_and_merge_datasets():
    pairs=[]
    # train1.csv expected columns: Context, Response
    if os.path.exists(TRAIN1_PATH):
        try:
            df = pd.read_csv(TRAIN1_PATH)
            if 'Context' in df.columns and 'Response' in df.columns:
                pairs.extend([(str(c).strip(), str(r).strip()) for c,r in df[['Context','Response']].dropna().values])
        except Exception:
            pass
    # train2 style conversations
    if TRAIN2_PATH:
        pairs.extend(extract_pairs_from_train2(TRAIN2_PATH))
    # intents.json
    for p in INTENTS_PATHS:
        if os.path.exists(p):
            try:
                d = json.load(open(p,'r',encoding='utf-8'))
                for intent in d.get('intents', []):
                    for pattern in intent.get('patterns', []):
                        rsp = intent.get('responses', ["I'm listening."])[0]
                        pairs.append((str(pattern).strip(), str(rsp).strip()))
                break
            except Exception:
                pass
    # combined_dataset.json
    for cp in COMBINED_PATHS:
        if os.path.exists(cp):
            try:
                data = json.load(open(cp,'r',encoding='utf-8'))
                items = data if isinstance(data, list) else [data]
                for it in items:
                    if isinstance(it, dict) and 'Context' in it and 'Response' in it:
                        pairs.append((str(it['Context']).strip(), str(it['Response']).strip()))
                break
            except Exception:
                pass
    # memory
    if os.path.exists(MEMORY_PATH):
        try:
            with open(MEMORY_PATH,'r',encoding='utf-8') as f:
                for line in f:
                    rec = json.loads(line)
                    pairs.append((rec.get('input',''), rec.get('response','')))
        except Exception:
            pass
    # clean
    seen=set(); cleaned=[]
    for a,b in pairs:
        na = normalize(a); nb = str(b).strip()
        if not na or not nb: continue
        key=(na,nb)
        if key in seen: continue
        seen.add(key); cleaned.append((na,nb))
    print(f"[i] Loaded {len(cleaned)} pairs into KB")
    return cleaned

# ---------------- Build / Load TF-IDF index ----------------
def build_or_load_index():
    if os.path.exists(VECTORIZER_PATH) and os.path.exists(INDEX_PATH):
        try:
            store = joblib.load(INDEX_PATH)
            vect = joblib.load(VECTORIZER_PATH)
            return vect, store['contexts'], store['responses'], store['tfidf']
        except Exception:
            pass
    pairs = load_and_merge_datasets()
    contexts = [p[0] for p in pairs]
    responses = [p[1] for p in pairs]
    if contexts:
        vect = TfidfVectorizer(ngram_range=(1,2), min_df=1)
        tfidf = vect.fit_transform(contexts)
        joblib.dump(vect, VECTORIZER_PATH)
        joblib.dump({'contexts':contexts,'responses':responses,'tfidf':tfidf}, INDEX_PATH)
        print("[i] Vectorizer and index built and cached.")
        return vect, contexts, responses, tfidf
    return None, [], [], None

# ---------------- Optional SBERT embeddings for better retrieval ----------------
sbert_model = None
sbert_embeddings = None
if sbert_available:
    try:
        sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("[i] SBERT model loaded for better retrieval.")
    except Exception:
        sbert_model = None

# ---------------- Retrieval helper ----------------
def get_retrieved_examples(user_text: str, vectorizer, contexts, responses, tfidf, top_k:int=TOP_K_RETRIEVE):
    # If sbert available and cached embeddings exist, prefer embedding similarity
    if sbert_model and contexts:
        try:
            # compute embeddings for contexts if not cached
            global sbert_embeddings
            if sbert_embeddings is None:
                sbert_embeddings = sbert_model.encode(contexts, show_progress_bar=False)
            q_emb = sbert_model.encode([user_text], show_progress_bar=False)[0]
            sims = np.dot(sbert_embeddings, q_emb) / (np.linalg.norm(sbert_embeddings, axis=1) * np.linalg.norm(q_emb) + 1e-9)
            idxs = np.argsort(sims)[-top_k:][::-1]
            out=[]
            for i in idxs:
                out.append((contexts[i], responses[i], float(sims[i])))
            return out
        except Exception:
            pass
    # fallback TF-IDF cosine similarity
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

# ---------------- Local HF fallback model (causal) ----------------
local_tokenizer = None
local_model = None
if transformers_available:
    try:
        set_seed(42)
        local_tokenizer = AutoTokenizer.from_pretrained(HF_CASUAL_FALLBACK)
        local_model = AutoModelForCausalLM.from_pretrained(HF_CASUAL_FALLBACK)
        if local_tokenizer.pad_token is None:
            local_tokenizer.pad_token = local_tokenizer.eos_token
        print(f"[i] Local HF causal model loaded: {HF_CASUAL_FALLBACK}")
    except Exception as e:
        print("[!] Could not load local HF causal model:", e)
        local_model = None
        local_tokenizer = None

def generate_with_local_model(prompt: str, max_new_tokens:int=180, temperature:float=0.8) -> str:
    if not local_model or not local_tokenizer:
        return ""
    try:
        input_ids = local_tokenizer.encode(prompt, return_tensors='pt')
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
        out = local_tokenizer.decode(gen_ids[0][input_ids.shape[-1]:], skip_special_tokens=True)
        return out.strip()
    except Exception as e:
        print("[local gen error]", e)
        return ""

# ---------------- OpenAI helper ----------------
def openai_chat_completion(system: str, user_prompt: str, max_tokens:int=256, temperature:float=0.7) -> Optional[str]:
    if not USE_OPENAI:
        return None
    try:
        messages = [
            {"role":"system","content":system},
            {"role":"user","content": user_prompt}
        ]
        resp = openai.ChatCompletion.create(model=OPENAI_MODEL, messages=messages, max_tokens=max_tokens, temperature=temperature)
        text = resp["choices"][0]["message"]["content"].strip()
        return text
    except Exception as e:
        print("[openai] error:", e)
        return None

# ---------------- Compose prompt using retrieved refs (RefNet-style) ----------------
SYSTEM_PROMPT = (
    f"You are {BOT_NAME}, an empathetic, trauma-informed therapist. Keep responses warm, human, and concise (3-6 sentences). "
    "Reflect, validate feelings, and offer small, practical coping steps when appropriate. If safety concerns are present, prioritize crisis instructions."
)

def compose_rag_prompt(user_text: str, retrieved: List[Tuple[str,str,float]], history: List[Dict[str,str]]) -> str:
    # Build reference block
    refs=[]
    for i,(ctx,resp,score) in enumerate(retrieved, start=1):
        refs.append(f"[Ref{i}] User: {ctx}\n[Ref{i}] Assistant: {resp}")
    refs_block = "\n\n".join(refs)
    # history block last few turns
    hist_lines=[]
    for m in history[-6:]:
        role = "User" if m['role']=='user' else "Assistant"
        hist_lines.append(f"{role}: {m['content']}")
    hist_block = "\n".join(hist_lines)
    prompt_parts = []
    prompt_parts.append(SYSTEM_PROMPT)
    if refs_block:
        prompt_parts.append("Use the examples below as style + content references when relevant:\n" + refs_block)
    if hist_block:
        prompt_parts.append("Conversation so far:\n" + hist_block)
    prompt_parts.append("Now respond to the user's last message below in a warm, human, empathetic way. Use reflections and ask a follow-up to encourage more sharing when useful. Avoid sounding robotic.")
    prompt_parts.append("User: " + user_text)
    prompt = "\n\n".join(prompt_parts)
    return prompt

# small coping step
def small_coping_step(theme: str):
    theme = (theme or "").lower()
    if "anxi" in theme or "panic" in theme:
        return ("Box breathing", "Inhale 4 / Hold 4 / Exhale 4 / Hold 4. Repeat 3 times.")
    if "sad" in theme:
        return ("List 3 small things", "Write 3 tiny things that went okay today.")
    if "lonely" in theme:
        return ("Send a message", "Send one short message: 'Are you free to talk?'")
    return ("Short breathing", "Take 4 slow breaths, focusing on the exhale. Repeat 3 times.")

# simple reflect fallback
def reflect_and_validate(user_text: str):
    t = normalize(user_text)
    if any(x in t for x in ["sad","depress","cry","hurt","bully","bullied","bullying","sadness"]):
        return "I'm sorry you're feeling so sad — that sounds really painful."
    if any(x in t for x in ["anx","anxiety","panic","scared","nervous","worried"]):
        return "You sound anxious and overwhelmed. That must be exhausting."
    return "I'm here to listen. Tell me more about what's been happening."

# detect risk
def detect_risk(txt: str):
    t = normalize(txt)
    hits=[]
    for p in RISK_PATTERNS:
        if re.search(p, t):
            hits.append(p)
    return (len(hits)>0, hits)

# ---------------- Main generator glue ----------------
def generate_response(user_text: str, vectorizer, contexts, responses, tfidf, history):
    # risk check
    risk, flags = detect_risk(user_text)
    if risk:
        return CRISIS_RESPONSE

    # retrieve references
    retrieved = get_retrieved_examples(user_text, vectorizer, contexts, responses, tfidf, TOP_K_RETRIEVE)

    # compose prompt
    rag_prompt = compose_rag_prompt(user_text, retrieved, history)

    # 1) try OpenAI
    if USE_OPENAI:
        out = openai_chat_completion(SYSTEM_PROMPT, rag_prompt, max_tokens=300, temperature=0.7)
        if out and len(out.strip())>0:
            return out.strip()

    # 2) local model fallback
    # add system + rag_prompt prefix + BOT_NAME tag
    if local_model and local_tokenizer:
        local_prompt = SYSTEM_PROMPT + "\n\n" + rag_prompt + f"\n\n{BOT_NAME}:"
        out = generate_with_local_model(local_prompt, max_new_tokens=200, temperature=0.8)
        if out and len(out.strip())>0:
            return out.strip()

    # 3) fallback to best retrieved response + reflection
    if retrieved:
        top_resp = retrieved[0][1]
        return f"{reflect_and_validate(user_text)}\n\n{top_resp}\n\nWould you like to tell me more about that?"
    return reflect_and_validate(user_text) + "\n\nWould you like to tell me more about that?"

# ---------------- CLI loop with optional voice ----------------
def main():
    print(f"\n=== {BOT_NAME} (RAG + LLM therapist) ===")
    # select mode
    mode = ""
    while mode not in {"text","audio"}:
        mode = input("Choose mode (text/audio): ").strip().lower()
    if mode=="audio" and not AUDIO_AVAILABLE:
        print("[!] Audio libraries not available — falling back to text.")
        mode="text"

    # build index & classifier
    vectorizer, contexts, responses, tfidf = build_or_load_index()
    # simple classifier: use patterns from intents or fallback
    classifier = None
    try:
        if os.path.exists(CLASSIFIER_PATH):
            classifier = joblib.load(CLASSIFIER_PATH)
        else:
            # minimal training from small template if no intents
            X = ["i feel sad","i am anxious","i feel lonely","i want to hurt someone"]
            y = ["sadness","anxiety","lonely","anger"]
            vect = TfidfVectorizer()
            Xv = vect.fit_transform(X)
            clf = LogisticRegression(max_iter=400)
            clf.fit(Xv,y)
            classifier = Pipeline([('vect', vect), ('clf', clf)])
            joblib.dump(classifier, CLASSIFIER_PATH)
    except Exception:
        classifier = None

    session_history=[]
    print("Type 'exit' to quit. Reply 'yes' to accept a suggested short step. Type 'good' to save helpful reply.")
    turns=0
    permission_requested=False

    # optional TTS greeting
    if mode=="audio" and AUDIO_AVAILABLE:
        try:
            async def say_greet(txt):
                comm = edge_tts.Communicate(txt, "en-US-AriaNeural")
                tmp="mely_tmp.mp3"
                await comm.save(tmp)
                playsound(tmp)
                os.remove(tmp)
            import asyncio
            asyncio.run(say_greet(f"Hello, I'm {BOT_NAME}. I'm here to listen."))
        except Exception:
            pass

    while True:
        if mode=="audio":
            # simple ASR
            recognizer = sr.Recognizer()
            try:
                with sr.Microphone() as src:
                    recognizer.adjust_for_ambient_noise(src, duration=0.6)
                    print("[i] Listening... (speak now)")
                    audio = recognizer.listen(src, timeout=7, phrase_time_limit=12)
                user_text = recognizer.recognize_google(audio)
                print("\nYou:", user_text)
            except Exception as e:
                print("[i] Could not hear clearly. Try typing or speak again.")
                continue
        else:
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

        # check permission flow (simple)
        if permission_requested and normalize(user_text) in {"yes","sure","ok","okay","ya"}:
            # provide step
            theme = "general"
            if classifier:
                try:
                    theme = classifier.predict([normalize(user_text)])[0]
                except Exception:
                    theme = "general"
            title, instr = small_coping_step(theme)
            plan = f"Okay — short step: {title} — {instr}\n\nWould you like to name one small action you could try?"
            print(f"\n{BOT_NAME}: {plan}")
            log_session("bot", plan, {"phase":"provide_step"})
            session_history.append({"role":"bot","content":plan})
            permission_requested=False
            if mode=="audio" and AUDIO_AVAILABLE:
                # speak
                try:
                    import asyncio
                    async def say(txt):
                        comm = edge_tts.Communicate(txt, "en-US-AriaNeural")
                        tmp="mely_tmp.mp3"
                        await comm.save(tmp)
                        playsound(tmp)
                        os.remove(tmp)
                    asyncio.run(say(plan))
                except Exception:
                    pass
            continue

        # detect risk
        risk, flags = detect_risk(user_text)
        if risk:
            print(f"\n{BOT_NAME}: {CRISIS_RESPONSE}")
            log_session("bot", CRISIS_RESPONSE, {"phase":"crisis", "flags":flags})
            session_history.append({"role":"user","content":user_text})
            session_history.append({"role":"bot","content":CRISIS_RESPONSE})
            continue

        # generate reply
        reply = generate_response(user_text, vectorizer, contexts, responses, tfidf, session_history)

        # offer permission heuristics
        offer = False
        if any(k in normalize(user_text) for k in ["help","help me","i need help","please help","tolong","bantu"]):
            offer=True
        if turns >= 3:
            offer=True
        if offer:
            title, instr = small_coping_step("general")
            permission_text = f"May I offer a short, practical step that often helps? (If yes, reply 'yes' or 'sure')\nExample: {title}: {instr}"
            if not permission_text in reply:
                reply = f"{reply}\n\n{permission_text}\n\nWe can keep talking if you'd prefer not to try a step now."
            permission_requested=True

        # print & speak
        print(f"\n{BOT_NAME}: {reply}")
        log_session("bot", reply, {"phase":"response"})
        session_history.append({"role":"user","content":user_text})
        session_history.append({"role":"bot","content":reply})

        # TTS if audio mode
        if mode=="audio" and AUDIO_AVAILABLE:
            try:
                import asyncio
                async def say(txt):
                    comm = edge_tts.Communicate(txt, "en-US-AriaNeural")
                    tmp="mely_tmp.mp3"
                    await comm.save(tmp)
                    playsound(tmp)
                    os.remove(tmp)
                asyncio.run(say(reply))
            except Exception:
                pass

        # feedback
        if mode=="text":
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
                    if any(tok in normalize(fb) for tok in ["good","thanks","thank","helpful","great"]):
                        rec = {"input": user_text, "response": reply, "t": time.time()}
                        try:
                            with open(MEMORY_PATH,"a",encoding="utf-8") as mo:
                                mo.write(json.dumps(rec, ensure_ascii=False) + "\n")
                            # clear caches to rebuild index next run
                            for p in (VECTORIZER_PATH, INDEX_PATH, CLASSIFIER_PATH):
                                try:
                                    if os.path.exists(p): os.remove(p)
                                except: pass
                            print("[i] saved example to memory")
                        except Exception as e:
                            print("[!] failed to save memory", e)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Fatal:", e)
        traceback.print_exc()
