import cv2
import os
import numpy as np
from tensorflow.keras.models import load_model

# Tentukan jalur folder utama dan model
dataset_folder = 'expression_dataset'
prototxt_path = 'deploy.prototxt.txt'
caffemodel_path = 'res10_300x300_ssd_iter_140000.caffemodel'
emotion_model_path = 'emotion_model.h5'

# Muat model deteksi wajah
print("[INFO] Memuat model deteksi wajah...")
try:
    face_net = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)
except cv2.error as e:
    print(f"Error: Gagal memuat model deteksi wajah. Pastikan file '{prototxt_path}' dan '{caffemodel_path}' berada di folder yang sama.")
    print(f"Detail error: {e}")
    exit()

# Muat model klasifikasi emosi
print("[INFO] Memuat model klasifikasi emosi...")
print(f"Path model: {os.path.abspath(emotion_model_path)}")  # Debug path
try:
    emotion_model = load_model(emotion_model_path)
except Exception as e:
    print(f"Error: Gagal memuat model klasifikasi emosi. Pastikan file '{emotion_model_path}' berada di folder yang sama.")
    print(f"Detail error: {e}")
    exit()

# Tentukan label emosi
emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# Analisis gambar dari dataset
for emotion_folder in os.listdir(dataset_folder):
    folder_path = os.path.join(dataset_folder, emotion_folder)
    if os.path.isdir(folder_path):
        print(f"\n[INFO] Menganalisis gambar di folder '{emotion_folder}'...")
        image_files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

        for image_file in image_files:
            image_path = os.path.join(folder_path, image_file)
            frame = cv2.imread(image_path)
            if frame is None:
                print(f"Peringatan: Tidak dapat membaca gambar '{image_file}'. Melanjutkan ke gambar berikutnya.")
                continue

            (h, w) = frame.shape[:2]
            blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))

            face_net.setInput(blob)
            detections = face_net.forward()

            for i in range(0, detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > 0.5:
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")

                    face = frame[startY:endY, startX:endX]
                    if face.size > 0:
                        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
                        face = cv2.resize(face, (48, 48))
                        face = face.astype("float") / 255.0
                        face = np.expand_dims(face, axis=-1)
                        face = np.expand_dims(face, axis=0)
                        if len(emotion_model.input_shape) == 5:
                            face = np.expand_dims(face, axis=1)

                        preds = emotion_model.predict(face, verbose=0)[0]
                        emotion_probability = np.max(preds)
                        emotion_label = emotion_labels[np.argmax(preds)]

                        text = f"Prediksi: {emotion_label} ({emotion_probability:.2f})"
                        y = startY - 10 if startY - 10 > 10 else startY + 10
                        cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 255, 0), 2)
                        cv2.putText(frame, text, (startX, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            cv2.imshow(f"Analisis Emosi: {emotion_folder} - {image_file}", frame)
            key = cv2.waitKey(0)
            cv2.destroyAllWindows()
            if key == ord('q'):
                break

    if 'key' in locals() and key == ord('q'):
        break

cv2.destroyAllWindows()