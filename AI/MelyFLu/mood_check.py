"""
mood_dataset_analyzer_minimal.py
Mood analyzer untuk dataset gambar (minimal, tanpa moviepy, kompatibel Python 3.13)
Dependencies:
    pip install fer opencv-python pandas numpy
"""

import os
import csv
import json
from datetime import datetime
import cv2
from fer_model import FER

# Config
DATASET_DIR = "archive"
LOG_DIR = "logs"
LOG_CSV = os.path.join(LOG_DIR, "mood_dataset_log.csv")

# Helper functions
def ensure_dirs():
    os.makedirs(LOG_DIR, exist_ok=True)

def init_csv_if_needed():
    if not os.path.exists(LOG_CSV):
        with open(LOG_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp_utc", "image_path", "dominant_emotion",
                "emotion_scores_json"
            ])

def log_detection(timestamp_utc, image_path, dominant, scores):
    scores_json = json.dumps(scores, ensure_ascii=False)
    with open(LOG_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            timestamp_utc, image_path, dominant, scores_json
        ])

# Main
def main():
    ensure_dirs()
    init_csv_if_needed()

    image_paths = []
    for root, _, files in os.walk(DATASET_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_paths.append(os.path.join(root, file))

    if not image_paths:
        print("❌ Tidak ada gambar ditemukan.")
        return

    print(f"✅ Ditemukan {len(image_paths)} gambar untuk dianalisis.")

    detector = FER(mtcnn=True)  # hanya untuk gambar, tidak butuh moviepy

    for i, image_path in enumerate(image_paths):
        print(f"[{i+1}/{len(image_paths)}] {image_path}")
        try:
            img = cv2.imread(image_path)
            if img is None:
                print("⚠️ Gagal membaca gambar.")
                continue

            results = detector.detect_emotions(img)

            if not results:
                dominant = "no_face"
                scores = {}
            else:
                face = results[0]
                scores = {k: float(v) for k, v in face["emotions"].items()}
                dominant = max(scores, key=scores.get)

            timestamp = datetime.utcnow().isoformat()
            log_detection(timestamp, image_path, dominant, scores)

            print(f"   ✓ Dominant: {dominant}, Scores: {scores}")

        except Exception as e:
            print(f"   ❌ Gagal menganalisis: {e}")

    print("Selesai. Log tersimpan di:", LOG_CSV)

if __name__ == "__main__":
    main()
