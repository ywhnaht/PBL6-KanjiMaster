import json
import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights
from torchvision import transforms
import os, json
from collections import Counter
from fugashi import Tagger
import pickle
# ==== LOAD CLASS NAMES ====
with open("core/class_names.json", "r", encoding="utf-8") as f:
    labels = json.load(f)
idx2label = {i: l for i, l in enumerate(labels)}
num_classes = len(labels)

# ==== BUILD MODEL ====
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def build_model(num_classes: int):
    model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(512),
        nn.Dropout(0.3),
        nn.Linear(512, num_classes)
    )
    return model

model = build_model(num_classes).to(device)
state = torch.load("core/best_model_69.pth", map_location=device)
if any(k.startswith("module.") for k in state.keys()):
    from collections import OrderedDict
    new_state = OrderedDict()
    for k,v in state.items():
        new_state[k.replace("module.", "", 1)] = v
    state = new_state
model.load_state_dict(state)
model.eval()

IMG_SIZE = 224
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

# ==== IMAGE PROCESSING ====
def preprocess_canvas_image(img):
    if img.mode != "RGB":
        img = img.convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    return transform(img).unsqueeze(0).to(device)

def recognize_char(img, k=5):
    """Nhận diện ký tự và trả về top-k nhãn dự đoán"""
    x = preprocess_canvas_image(img)
    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]
        top_probs, top_idxs = torch.topk(probs, k)
    results = [(idx2label[top_idxs[i].item()], float(top_probs[i].item())) for i in range(k)]
    return results  # list [(label, prob), ...]


def merge_boxes(boxes, min_dist=10):
    merged = []
    for (x, y, w, h) in sorted(boxes, key=lambda b: b[0]):
        if not merged:
            merged.append([x, y, w, h])
        else:
            px, py, pw, ph = merged[-1]
            dist = x - (px + pw)
            if dist < -10:  # overlap
                nx = min(x, px)
                ny = min(y, py)
                nw = max(x + w, px + pw) - nx
                nh = max(y + h, py + ph) - ny
                merged[-1] = [nx, ny, nw, nh]
            else:
                merged.append([x, y, w, h])
    return merged


def recognize_and_merge_boxes_exhaustive(gray, boxes, threshold=0.7, max_span=None, k=5):
    n = len(boxes)
    merged_boxes = []
    i = 0
    cache = {}
    H, W = gray.shape[:2]

    while i < n:
        best_prob = -1
        best_box = None
        best_j = i
        best_preds = None

        nx, ny, nx2, ny2 = boxes[i][0], boxes[i][1], boxes[i][0] + boxes[i][2], boxes[i][1] + boxes[i][3]
        j_limit = n if max_span is None else min(n, i + max_span)

        for j in range(i, j_limit):
            if j > i:
                bx, by, bw, bh = boxes[j]
                nx = min(nx, bx)
                ny = min(ny, by)
                nx2 = max(nx2, bx + bw)
                ny2 = max(ny2, by + bh)

            x1 = max(0, int(nx))
            y1 = max(0, int(ny))
            x2c = min(W, int(nx2))
            y2c = min(H, int(ny2))
            if x2c <= x1 or y2c <= y1:
                continue

            key = (x1, y1, x2c, y2c)
            if key in cache:
                preds = cache[key]
            else:
                crop = Image.fromarray(gray[y1:y2c, x1:x2c]).convert("RGB")
                preds = recognize_char(crop, k=k)  # list [(label, prob), ...]
                cache[key] = preds

            top_label, top_p = preds[0]
            if top_p > best_prob:
                best_prob = top_p
                best_box = [x1, y1, x2c - x1, y2c - y1]
                best_j = j
                best_preds = preds

        if best_box is None:
            merged_boxes.append(([0, 0, 0, 0], [("?", 0.0)]))
            i += 1
        elif best_j == i:
            merged_boxes.append((best_box, best_preds))
            i += 1
        else:
            if best_prob >= threshold:
                merged_boxes.append((best_box, best_preds))
                i = best_j + 1
            else:
                merged_boxes.append((boxes[i], [("?", 0.0)]))
                i += 1

    return merged_boxes  # [(box, predictions)]


def segment_characters_from_image(img, k=5):
    gray = np.array(img.convert("L"))
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = np.ones((2, 2), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=0)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = [cv2.boundingRect(c) for c in contours]
    boxes = merge_boxes(boxes, min_dist=5)
    boxes = sorted(boxes, key=lambda b: b[0])
    merged = recognize_and_merge_boxes_exhaustive(gray, boxes, threshold=0.7, k=k)
    return merged  # [(box, predictions)]


def strokes_to_image(strokes, canvas_size=600):
    img = np.zeros((canvas_size, canvas_size, 3), dtype=np.uint8)
    for stroke in strokes:
        for i in range(1, len(stroke)):
            x1, y1 = stroke[i - 1]
            x2, y2 = stroke[i]
            cv2.line(img, (x1, y1), (x2, y2), (255, 255, 255), thickness=25, lineType=cv2.LINE_AA)
    return Image.fromarray(img)
import os
import json
import pickle
from collections import Counter

# ==== Hàm tiện ích ====
def is_kanji(word):
    """Kiểm tra từ toàn bộ là Kanji"""
    return all('\u4e00' <= c <= '\u9fff' for c in word)


# ==== Load dữ liệu từ pickle ====
token_file = "core/kanji_tokens_list.pkl"
ngram_file = "core/ngram_counter.pkl"

with open(token_file, "rb") as f:
    kanji_tokens_list = pickle.load(f)

with open(ngram_file, "rb") as f:
    ngram_counter = pickle.load(f)

print("✅ Đã load dữ liệu từ pickle")
print("   Số token list:", len(kanji_tokens_list))
print("   Số n-grams   :", len(ngram_counter))


# ==== Load JMdict (tiếng Anh) ====
jmdict_dir = "core/JMdict_english"

term_entries = []
for fname in os.listdir(jmdict_dir):
    if fname.startswith("term_bank") and fname.endswith(".json"):
        with open(os.path.join(jmdict_dir, fname), "r", encoding="utf-8") as f:
            term_entries.extend(json.load(f))

# Tạo set để tra cứu nhanh
all_terms = set(entry[0] for entry in term_entries)  # entry[0] là từ Kanji/Kana


# ==== Hàm lọc từ hợp lệ ====
def filter_valid_words(words):
    """Lọc ra những từ ghép có nghĩa dựa trên JMdict"""
    return [w for w in words if w in all_terms]


# ==== Hàm gợi ý từ ghép Kanji ====
def suggest_compounds(kanji, top_n=10, min_freq=2):
    filtered_ngrams = {
        ngram: count
        for ngram, count in ngram_counter.items()
        if kanji in ngram and count >= min_freq
    }

    sorted_ngrams = sorted(filtered_ngrams.items(), key=lambda x: x[1], reverse=True)
    top_ngrams = sorted_ngrams[:top_n]

    top_words = ["".join(ngram) for ngram, _ in top_ngrams]
    return top_words
