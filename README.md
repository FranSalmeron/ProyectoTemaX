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
```
pip install matplotlib
pip install tensorflow
pip install python-multipart
pip install fastapi uvicorn pillow tensorflow
```

### Entrenar modelo
```
cd ProyectoModelo
python -m model.model   --data_dir data/raw-img   --output_dir checkpoints   --epochs 15   --batch_size 64
```

### Levantar la Api (LOCAL)
```
python api.py
```

### Prueba rapida (LOCAL)
```
curl -F "file=@dog001.jpg" http://127.0.0.1:8000/predict
```

### Desplegar Contenedores (PROD)
```
docker compose build
docker compose up
```

### ver pagina front (PROD)
http://localhost:3000

### Kubernetes
Importante activar kubernetes en visual o en docker desktop
Construir imagenes:
```
docker build -t animales-backend -f ProyectoModelo/Dockerfile.backend ProyectoModelo
docker build -t animales-frontend -f Frontend/Dockerfile.frontend .
```

### Levantar Kubernetes
```
kubectl apply -f k8s/
```

### Abrir puerto frontend
```
kubectl port-forward svc/frontend 3000:80
```

### Apagar los pods o contenedores:
```
kubectl scale deployment frontend --replicas=0, 1 para levantar
kubectl scale deployment backend --replicas=0
```

