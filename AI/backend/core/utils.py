# vit_version_of_code2.py
import os
import json
import pickle
from collections import Counter, OrderedDict

import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models
from torchvision.models import ViT_B_16_Weights
import threading
from huggingface_hub import hf_hub_download

# ==== LOAD FILES FROM HUGGING FACE HUB ====
REPO_ID = "TuanVu219/Vit_Model"

vit_ckpt_path = hf_hub_download(repo_id=REPO_ID, filename="vit_checkpoint.pth")

# ==== LOAD CLASS NAMES ====
with open("core/class_names.json", "r", encoding="utf-8") as f:
    labels = json.load(f)
idx2label = {i: l for i, l in enumerate(labels)}
num_classes = len(labels)

# ==== DEVICE ====
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Device:", device)

# ==== BUILD ViT MODEL (match training head) ====
def build_vit_model(num_classes: int, pretrained=True, device=None):
    if pretrained:
        vit = models.vit_b_16(weights=ViT_B_16_Weights.IMAGENET1K_V1)
    else:
        vit = models.vit_b_16(weights=None)
    # get input features of original head
    try:
        in_features = vit.heads.head.in_features
    except Exception:
        # fall back if torchvision version different
        in_features = vit.heads.in_features if hasattr(vit.heads, "in_features") else vit.heads.head.in_features

    vit.heads.head = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(512),
        nn.Dropout(0.3),
        nn.Linear(512, num_classes)
    )
    if device is not None:
        vit.to(device)
    return vit

# ==== ROBUST CHECKPOINT LOADER ====
def load_checkpoint_to_model(model, ckpt_path, use_ema_if_available=True, map_location=None):
    """
    Load checkpoint robustly:
     - ckpt can be state_dict
     - or dict with keys 'model' or 'ema'
    Will try to use EMA if available and requested.
    """
    map_location = map_location or device
    print("Loading checkpoint:", ckpt_path)
    ckpt = torch.load(ckpt_path, map_location=map_location, weights_only=False)

    # choose correct dict
    if isinstance(ckpt, dict):
        if use_ema_if_available and 'ema' in ckpt:
            sd = ckpt['ema']
            print("🔁 Loading 'ema' weights from checkpoint")
        elif 'model' in ckpt:
            sd = ckpt['model']
            print("🔁 Loading 'model' weights from checkpoint")
        else:
            sd = ckpt
            print("🔁 Loading raw state_dict from checkpoint (dict without 'model'/'ema')")
    else:
        sd = ckpt

    # strip "module." if present
    new_sd = {}
    for k, v in sd.items():
        if k.startswith("module."):
            new_sd[k.replace("module.", "", 1)] = v
        else:
            new_sd[k] = v

    # try load with strict=False to allow head mismatches
    try:
        model.load_state_dict(new_sd, strict=False)
        print("✅ state_dict loaded (strict=False).")
    except Exception as e:
        print("Warning: load_state_dict with strict=False raised:", e)
        # last resort: try to partially load keys
        model_dict = model.state_dict()
        loaded_keys = {k: v for k, v in new_sd.items() if k in model_dict and v.size() == model_dict[k].size()}
        model_dict.update(loaded_keys)
        model.load_state_dict(model_dict)
        print("✅ Partial keys loaded into model.")

    model.to(device)
    model.eval()
    return model

# ==== INSTANTIATE MODEL & LOAD WEIGHTS ====
_model=None
_model_lock=threading.Lock()
# ** UPDATE THIS PATH TO YOUR ViT CHECKPOINT **
def get_vit_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                print("🔹 Loading ViT model (only once)...")
                model=build_vit_model(num_classes=num_classes, pretrained=True, device=device)
                ckpt_path = vit_ckpt_path
                if os.path.exists(ckpt_path):
                    model=load_checkpoint_to_model(model, ckpt_path, use_ema_if_available=True, map_location=device)
                else:
                    print("⚠️ ViT checkpoint not found at:", ckpt_path)
                model.to(device)
                model.eval()
                _model=model
    return _model
                

# ==== TRANSFORM / PREPROCESS ====
IMG_SIZE = 224
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def preprocess_canvas_image(img):
    """PIL.Image -> tensor [1,C,H,W] on device"""
    if img.mode != "RGB":
        img = img.convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    return transform(img).unsqueeze(0).to(device)

# ==== RECOGNITION (top-k) ====
def recognize_char(img, k=5):
    """Nhận diện ký tự và trả về top-k nhãn dự đoán"""
    model=get_vit_model()
    x = preprocess_canvas_image(img)
    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]
        top_probs, top_idxs = torch.topk(probs, k)
    results = [(idx2label[top_idxs[i].item()], float(top_probs[i].item())) for i in range(k)]
    return results  # list [(label, prob), ...]

# ==== MERGE BOXES / RECOGNIZE & MERGE (giữ logic như code2) ====
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

# ==== SEGMENT CHARACTERS ====
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

# ==== STROKES -> IMAGE ====
def strokes_to_image(strokes, canvas_size=600):
    img = np.zeros((canvas_size, canvas_size, 3), dtype=np.uint8)
    for stroke in strokes:
        for i in range(1, len(stroke)):
            x1, y1 = stroke[i - 1]
            x2, y2 = stroke[i]
            # Ép kiểu an toàn
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            cv2.line(img, (x1, y1), (x2, y2), (255, 255, 255), thickness=25, lineType=cv2.LINE_AA)
    return Image.fromarray(img)

# ==== Các hàm hỗ trợ n-gram / JMdict (giữ nguyên từ code2) ====
def is_kanji(word):
    """Kiểm tra từ toàn bộ là Kanji"""
    return all('\u4e00' <= c <= '\u9fff' for c in word)





# Nếu muốn dùng trong callback (ví dụ notebook/web), có thể gọi segment_characters_from_image/strokes_to_image
