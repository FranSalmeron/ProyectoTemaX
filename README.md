# ProyectoTemaX
Proyecto tarea PIA 

## Explicacion
Este modelo usa un dataset de kaggle con 20.000 imagenes de animales nosotros para entrenamiento usamos todas, y un 20% de validacion, en cuanto a los tipos de animales que hay son:

```
[
  "Perro",
  "Caballo",
  "Elefante",
  "Mariposa",
  "Gallina",
  "Gato",
  "Vaca",
  "Oveja",
  "Ardilla"
]
```
### Dependencias
pip install matplotlib
pip install tensorflow
pip install fastapi uvicorn pillow tensorflow

### Entrenar modelo
cd ProyectoModelo
python -m model.model   --data_dir data/raw-img   --output_dir checkpoints   --epochs 15   --batch_size 64

### Levantar la Api
python api.py

### Prueba rapida
curl -F "file=@dog001.jpg" http://127.0.0.1:8000/predict
