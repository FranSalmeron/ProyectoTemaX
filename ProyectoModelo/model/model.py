import argparse
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers
import matplotlib.pyplot as plt


# ----------------------------
# MODELO (desde cero)
# ----------------------------
def build_model(num_classes, input_shape=(224, 224, 3)):
    model = tf.keras.Sequential([
        layers.Rescaling(1./255, input_shape=input_shape),

        layers.Conv2D(32, 3, activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(),

        layers.Conv2D(64, 3, activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(),

        layers.Conv2D(128, 3, activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(),

        layers.GlobalAveragePooling2D(),
        layers.Dense(64, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.2),
        
        layers.Dense(num_classes, activation="softmax")
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


# ----------------------------
# DATASETS
# ----------------------------
def load_datasets(data_dir, image_size, batch_size, validation_split):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=validation_split,
        subset="training",
        seed=42,
        image_size=image_size,
        batch_size=batch_size
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=validation_split,
        subset="validation",
        seed=42,
        image_size=image_size,
        batch_size=batch_size
    )

    class_names = train_ds.class_names

    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, class_names


# ----------------------------
# GRAFICAS DE ENTRENAMIENTO
# ----------------------------
def plot_history(history, output_dir):
    metrics = history.history
    epochs = range(1, len(metrics['loss']) + 1)

    plt.figure(figsize=(10, 4))

    # Pérdida
    plt.subplot(1, 2, 1)
    plt.plot(epochs, metrics['loss'], 'o-', label='train_loss')
    plt.plot(epochs, metrics['val_loss'], 'o-', label='val_loss')
    plt.title("Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)

    # Precisión
    plt.subplot(1, 2, 2)
    plt.plot(epochs, metrics['accuracy'], 'o-', label='train_acc')
    plt.plot(epochs, metrics['val_accuracy'], 'o-', label='val_acc')
    plt.title("Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig(Path(output_dir) / "training_history.png")
    plt.close()
    print(f"[INFO] Gráfico de entrenamiento guardado en {output_dir}/training_history.png")


# ----------------------------
# TRAIN
# ----------------------------
def train(data_dir, output_dir, epochs, batch_size, image_size):
    print(f"[INFO] Cargando datos desde: {data_dir}")

    train_ds, val_ds, class_names = load_datasets(
        data_dir=data_dir,
        image_size=image_size,
        batch_size=batch_size,
        validation_split=0.2
    )

    print(f"[INFO] Clases detectadas: {class_names}")

    model = build_model(num_classes=len(class_names), input_shape=(*image_size, 3))

    model.summary()

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    checkpoint_path = output_dir / "model.keras"
    checkpoint_cb = tf.keras.callbacks.ModelCheckpoint(
        filepath=str(checkpoint_path),
        save_best_only=True,
        monitor="val_accuracy",
        mode="max"
    )

    print("[INFO] Iniciando entrenamiento...\n")

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=[checkpoint_cb]
    )

    final_model_path = output_dir / "final_model.h5"
    model.save(final_model_path)
    print(f"[INFO] Modelo guardado en: {final_model_path}")

    # Guardar gráfico de pérdida y precisión
    plot_history(history, output_dir)


# ----------------------------
# MAIN
# ----------------------------
def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("--data_dir", required=True)
    parser.add_argument("--output_dir", default="./checkpoints")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--image_size", type=int, nargs=2, default=[224, 224])

    args = parser.parse_args()

    train(
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        image_size=tuple(args.image_size)
    )


if __name__ == "__main__":
    main()