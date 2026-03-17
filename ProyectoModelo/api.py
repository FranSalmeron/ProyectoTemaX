"""FastAPI service to serve the trained animal classifier.

Usage:
  pip install fastapi uvicorn pillow tensorflow
  python api.py

Then open:
  http://127.0.0.1:8000/docs

The API expects a multipart/form-data upload with a single file field named `file`.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

# Traducciones para etiquetas (español <-> inglés)
try:
    from data.translate import translate as TRANSLATE
except ImportError:  # pragma: no cover
    TRANSLATE = {}

app = FastAPI(title="Animal Classifier API", version="1.0")


def load_model_and_classes(model_path: Path) -> tuple[tf.keras.Model, Optional[list[str]]]:
    model = tf.keras.models.load_model(model_path)

    class_names_path = model_path.parent / "class_names.json"
    if class_names_path.exists():
        import json

        with open(class_names_path, "r", encoding="utf-8") as f:
            class_names = json.load(f)
    else:
        class_names = None

    return model, class_names


DEFAULT_MODEL_PATH = Path(__file__).resolve().parent / "checkpoints" / "animal_classifier.h5"

try:
    MODEL, CLASS_NAMES = load_model_and_classes(DEFAULT_MODEL_PATH)
except Exception as exc:  # pragma: no cover
    MODEL = None
    CLASS_NAMES = None
    print(f"No se pudo cargar el modelo desde {DEFAULT_MODEL_PATH}: {exc}")


def preprocess_image(image: Image.Image, target_size: tuple[int, int] = (224, 224)) -> np.ndarray:
    # Convert to grayscale to match the model input used during training
    image = image.convert("L").resize(target_size)
    arr = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=(0, -1))


@app.get("/")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "model_loaded": bool(MODEL)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> JSONResponse:
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado. Entrena primero y vuelve a iniciar el servidor.")

    try:
        image = Image.open(file.file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"No se puede leer la imagen: {exc}")

    batch = preprocess_image(image, target_size=(224, 224))
    preds = MODEL.predict(batch)

    top_idx = int(np.argmax(preds[0]))
    confidence = float(np.max(preds[0]))
    label = CLASS_NAMES[top_idx] if CLASS_NAMES else str(top_idx)

    # Si existe traducción al español, úsala (no requiere reentrenar)
    label_es = TRANSLATE.get(label, TRANSLATE.get(label.lower(), label))

    return JSONResponse(
        {
            "predicted_label": label,
            "predicted_label_es": label_es,
            "confidence": confidence,
            "scores": preds[0].tolist(),
            "class_names": CLASS_NAMES,
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
