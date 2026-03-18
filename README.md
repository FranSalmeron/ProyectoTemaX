# ProyectoTemaX
Proyecto tarea PIA 

## Explicacion
Este modelo usa un dataset de kaggle con 20.000 imagenes de animales nosotros para entrenamiento usamos 10.000, y un 20% de validacion osea 8.000, ademas pasamos las imagenes a negro, en cuanto a los tipos de animales que hay son

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


### Entrenar modelo
cd ProyectoModelo
python ProyectoModelo/model/model.py   --data_dir data/raw-img   --output_dir checkpoints   --epochs 5   --batch_size 64

###
