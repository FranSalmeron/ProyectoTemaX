"""Modelo de clasificación de imágenes de animales.

Este módulo crea y entrena un modelo de red neuronal para clasificar imágenes de animales en distintas categorías.

Estructura de datos esperada (ejemplo):

  data/
    perro/
    gato/
    elefante/

(Actualmente el modelo entrena usando todos los datos disponibles.)

Uso:
  python -m model.model --data_dir ../data --output_dir ./checkpoints --epochs 10

Puedes descargar un dataset de Kaggle y colocarlo en `../data` o usar `--kaggle_dataset`.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers


def build_model(
    num_classes: int,
    input_shape: tuple[int, int, int] = (224, 224, 3),
    learning_rate: float = 1e-3,
) -> tf.keras.Model:
    """Builds a simple image classification model.

    Args:
        num_classes: Number of output classes.
        input_shape: Expected input image shape.
        learning_rate: Learning rate for the optimizer.

    Returns:
        A compiled keras Model.
    """

    inputs = layers.Input(shape=input_shape)

    # Base feature extractor
    x = layers.Rescaling(1.0 / 255)(inputs)
    x = layers.Conv2D(32, 3, activation="relu", padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)

    x = layers.Conv2D(64, 3, activation="relu", padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)

    x = layers.Conv2D(128, 3, activation="relu", padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Flatten()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="animal_classifier")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


def save_class_names(class_names: list[str], output_dir: Path) -> None:
    """Save class names to disk (used by the API)."""

    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_dir / "class_names.json", "w", encoding="utf-8") as f:
        json.dump(class_names, f, ensure_ascii=False, indent=2)


def plot_training_history(history: tf.keras.callbacks.History, output_dir: Path) -> None:
    """Create and save loss/accuracy plots from the training history."""

    try:
        import matplotlib.pyplot as plt
    except ImportError:  # pragma: no cover
        print("matplotlib no está instalado; omitiendo gráficas.")
        return

    output_dir.mkdir(parents=True, exist_ok=True)

    metrics = history.history
    epochs = range(1, len(metrics.get("loss", [])) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    # Use markers so a single-epoch run still shows a visible point.
    axes[0].plot(epochs, metrics.get("loss", []), "o-", label="train_loss")
    axes[0].plot(epochs, metrics.get("val_loss", []), "o-", label="val_loss")
    axes[0].set_title("Loss")
    axes[0].set_xlabel("Época")
    axes[0].set_ylabel("Loss")
    axes[0].set_xlim(1, max(1, len(epochs)))
    axes[0].grid(True, linestyle="--", alpha=0.3)
    axes[0].legend()

    axes[1].plot(epochs, metrics.get("accuracy", []), "o-", label="train_accuracy")
    axes[1].plot(epochs, metrics.get("val_accuracy", []), "o-", label="val_accuracy")
    axes[1].set_title("Accuracy")
    axes[1].set_xlabel("Época")
    axes[1].set_ylabel("Accuracy")
    axes[1].set_xlim(1, max(1, len(epochs)))
    axes[1].grid(True, linestyle="--", alpha=0.3)
    axes[1].legend()

    fig.tight_layout()
    fig.savefig(output_dir / "training_history.png")
    plt.close(fig)


def download_kaggle_dataset(kaggle_dataset: str, dest_dir: Path) -> None:
    """Download and unzip a Kaggle dataset into the destination folder.

    Requires the `kaggle` CLI and valid credentials in `~/.kaggle/kaggle.json`.

    Args:
        kaggle_dataset: Dataset slug, e.g. "nehaprabhavalkar/animals10".
        dest_dir: Directory where the dataset will be downloaded and unzipped.
    """

    dest_dir.mkdir(parents=True, exist_ok=True)

    print(f"Descargando dataset de Kaggle: {kaggle_dataset} → {dest_dir}")

    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "kaggle",
            "datasets",
            "download",
            "-d",
            kaggle_dataset,
            "-p",
            str(dest_dir),
            "--unzip",
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(
            "Error al descargar el dataset de Kaggle. Asegúrate de tener configurado `kaggle.json` y la CLI instalada."
        )


def _count_image_files(data_dir: str | os.PathLike) -> int:
    """Count the number of image files under `data_dir`.

    This is used to cap the number of images used for training/validation.
    """

    data_dir = Path(data_dir)
    if not data_dir.exists():
        return 0

    exts = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}
    return sum(
        1
        for p in data_dir.rglob("*")
        if p.is_file() and p.suffix.lower() in exts
    )


def prepare_datasets(
    data_dir: str | os.PathLike,
    image_size: tuple[int, int] = (224, 224),
    batch_size: int = 32,
    validation_split: float = 0.2,
    seed: int = 42,
) -> tuple[tf.data.Dataset, tf.data.Dataset, list[str]]:
    """Loads images from disk using a directory structure and returns train/validation datasets.

    Images are loaded as RGB (3 channels) and resized to `image_size`.

    The training pipeline includes caching/prefetching for performance.

    Args:
        data_dir: Root folder containing class subfolders.
        image_size: Size to resize images to.
        batch_size: Batch size.
        validation_split: Fraction of data to reserve for validation.
        seed: Random seed for shuffling.

    Returns:
        Tuple of (train_ds, val_ds, class_names).
    """

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="int",
        batch_size=batch_size,
        image_size=image_size,
        validation_split=validation_split,
        subset="training",
        seed=seed,
        color_mode="rgb",
    )

    class_names = train_ds.class_names

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="int",
        batch_size=batch_size,
        image_size=image_size,
        validation_split=validation_split,
        subset="validation",
        seed=seed,
        color_mode="rgb",
    )

    # Cache + prefetch for performance.
    # Note: Caching can use a lot of RAM if the dataset is large; if this is a problem,
    # remove `.cache()` or set it to a filename to cache on disk.
    train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, class_names


def train(
    data_dir: str,
    output_dir: str,
    epochs: int = 10,
    batch_size: int = 32,
    image_size: tuple[int, int] = (224, 224),
    validation_split: float = 0.2,
    learning_rate: float = 1e-3,
) -> tuple[tf.keras.callbacks.History, list[str], Path]:
    """Train the animal classifier and save checkpoints."""

    output_dir_path = Path(output_dir)
    output_dir_path.mkdir(parents=True, exist_ok=True)

    total_images = _count_image_files(data_dir)
    if total_images == 0:
        raise ValueError(f"No se encontraron imágenes en: {data_dir}")

    train_ds, val_ds, class_names = prepare_datasets(
        data_dir,
        image_size=image_size,
        batch_size=batch_size,
        validation_split=validation_split,
    )

    model = build_model(
        num_classes=len(class_names),
        input_shape=(*image_size, 3),
        learning_rate=learning_rate,
    )

    checkpoint_path = output_dir_path / "checkpoint.keras"
    checkpoint_cb = tf.keras.callbacks.ModelCheckpoint(
        filepath=str(checkpoint_path),
        save_best_only=True,
        monitor="val_accuracy",
        mode="max",
    )

    # Keras can automatically determine the number of steps from the dataset.
    # By not passing `steps_per_epoch`/`validation_steps`, we avoid mismatch warnings.
    steps_per_epoch = None
    validation_steps = None

    history = model.fit(
        train_ds,
        epochs=epochs,
        callbacks=[checkpoint_cb],
    )

    final_model_path = output_dir_path / "animal_classifier.h5"
    model.save(final_model_path)

    save_class_names(class_names, output_dir_path)
    plot_training_history(history, output_dir_path)

    print("\nTraining complete.")
    print(f"Classes: {class_names}")
    print(f"Saved best checkpoint to: {checkpoint_path}")
    print(f"Saved final model to: {final_model_path}")

    return history, class_names, final_model_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Entrena un modelo de clasificación de animales.")
    parser.add_argument(
        "--data_dir",
        type=str,
        default=None,
        help=(
            "Directorio que contiene subcarpetas por clase (e.g., data/raw-img/<clase>/). "
            "Si no se especifica, usa ../data/raw-img relativo a este archivo."
        ),
    )
    parser.add_argument(
        "--kaggle_dataset",
        type=str,
        default=None,
        help=(
            "Slug de Kaggle para descargar un dataset (e.g., nehaprabhavalkar/animals10). "
            "Si se especifica, se descargará en --data_dir antes de entrenar."
        ),
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./checkpoints",
        help="Directorio donde se guardarán los modelos y checkpoints.",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=10,
        help="Número de épocas de entrenamiento.",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=32,
        help="Tamaño de lote para el entrenamiento.",
    )
    parser.add_argument(
        "--image_size",
        type=int,
        nargs=2,
        default=[224, 224],
        help="Tamaño (alto ancho) al que se redimensionarán las imágenes.",
    )
    parser.add_argument(
        "--validation_split",
        type=float,
        default=0.2,
        help="Fracción de los datos que se reservará para validación.",
    )
    parser.add_argument(
        "--learning_rate",
        type=float,
        default=1e-3,
        help="Tasa de aprendizaje para el optimizador Adam.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Default data directory: ../data relative to this script
    data_dir = (
        args.data_dir
        if args.data_dir is not None
        else str(Path(__file__).resolve().parent.parent / "data" / "raw-img")
    )

    if args.kaggle_dataset:
        download_kaggle_dataset(args.kaggle_dataset, Path(data_dir))

    train(
        data_dir=data_dir,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        image_size=tuple(args.image_size),
        validation_split=args.validation_split,
        learning_rate=args.learning_rate,
    )


if __name__ == "__main__":
    main()
