"""Modelo de clasificación de imágenes de animales.

Este módulo crea y entrena un modelo de red neuronal para clasificar imágenes de animales en distintas categorías.

Estructura de datos esperada (ejemplo):

  data/
    perro/
    gato/
    elefante/

(El split train/validation se hace automáticamente mediante `--validation_split`.)

Uso:
  python -m model.model --data_dir ../data --output_dir ./checkpoints --epochs 10

Puedes descargar un dataset de Kaggle y colocarlo en `../data` o usar `--kaggle_dataset`.

"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers


def build_model(num_classes: int, input_shape: tuple[int, int, int] = (224, 224, 3)) -> tf.keras.Model:
    """Builds a simple image classification model.

    Args:
        num_classes: Number of output classes.
        input_shape: Expected input image shape.

    Returns:
        A compiled keras Model.
    """

    inputs = layers.Input(shape=input_shape)

    # Base feature extractor
    x = layers.Rescaling(1.0 / 255)(inputs)
    x = layers.Conv2D(32, 3, activation="relu", padding="same")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(64, 3, activation="relu", padding="same")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(128, 3, activation="relu", padding="same")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Flatten()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="animal_classifier")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


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


def prepare_datasets(
    data_dir: str | os.PathLike,
    image_size: tuple[int, int] = (224, 224),
    batch_size: int = 32,
    validation_split: float = 0.2,
    seed: int = 42,
) -> tuple[tf.data.Dataset, tf.data.Dataset, list[str]]:
    """Loads images from disk using a directory structure and returns train/validation datasets.

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
        shuffle=True,
        validation_split=validation_split,
        subset="training",
        seed=seed,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="int",
        batch_size=batch_size,
        image_size=image_size,
        shuffle=True,
        validation_split=validation_split,
        subset="validation",
        seed=seed,
    )

    class_names = train_ds.class_names
    return train_ds, val_ds, class_names


def train(
    data_dir: str,
    output_dir: str,
    epochs: int = 10,
    batch_size: int = 32,
    image_size: tuple[int, int] = (224, 224),
    validation_split: float = 0.2,
) -> None:
    """Train the animal classifier and save checkpoints."""

    output_dir_path = Path(output_dir)
    output_dir_path.mkdir(parents=True, exist_ok=True)

    train_ds, val_ds, class_names = prepare_datasets(
        data_dir,
        image_size=image_size,
        batch_size=batch_size,
        validation_split=validation_split,
    )

    model = build_model(num_classes=len(class_names), input_shape=(*image_size, 3))

    checkpoint_path = output_dir_path / "checkpoint"
    checkpoint_cb = tf.keras.callbacks.ModelCheckpoint(
        filepath=str(checkpoint_path),
        save_best_only=True,
        monitor="val_accuracy",
        mode="max",
    )

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=[checkpoint_cb],
    )

    final_model_path = output_dir_path / "animal_classifier.h5"
    model.save(final_model_path)

    print("\nTraining complete.")
    print(f"Classes: {class_names}")
    print(f"Saved best checkpoint to: {checkpoint_path}")
    print(f"Saved final model to: {final_model_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Entrena un modelo de clasificación de animales.")
    parser.add_argument(
        "--data_dir",
        type=str,
        default=None,
        help=(
            "Directorio que contiene subcarpetas por clase (e.g., data/<clase>/). "
            "Si no se especifica, usa ../data relativo a este archivo."
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
        help="Fracción de datos a utilizar para validación.",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Default data directory: ../data relative to this script
    data_dir = (
        args.data_dir
        if args.data_dir is not None
        else str(Path(__file__).resolve().parent.parent / "data")
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
    )


if __name__ == "__main__":
    main()
