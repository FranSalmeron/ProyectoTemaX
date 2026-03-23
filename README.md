# ProyectoTemaX
Proyecto tarea PIA 

## Explicacion
Este modelo usa un dataset de kaggle con 20.000 imagenes de animales nosotros para entrenamiento usamos todas, y un 20% de validacion, en cuanto a los tipos de animales que hay son:

### Enlace al github:
https://github.com/FranSalmeron/ProyectoTemaX

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
No es necesario entrenarlo porque esta guardado pero si  quieres intentar mejorarlo aqui esta el comando para entrenarlo
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

### Desplegar Contenedores
```
docker compose build
docker compose up
```

### Ver página front
http://localhost:3000

---

## Arquitectura y diseño del sistema

### Servicios
El sistema está compuesto por **dos servicios**:

1. **Backend (Servicio de IA)**
   - Implementado en Python con FastAPI.
   - Carga un modelo de IA previamente entrenado.
   - Procesa imágenes y devuelve predicciones.
   - Endpoints principales: `/predict`, `/predict-multiple`, `/login`, `/register`, `/get-image-bank`.
   - Incluye validación de datos, logging y manejo de excepciones.
   - Persistencia de datos mediante volúmenes para usuarios y imágenes.

2. **Frontend (Servicio Intermediario)**
   - Implementado en React y servido con Nginx.
   - Recibe imágenes de los usuarios y comunica con el backend vía HTTP.
   - Muestra resultados de predicción, banco de imágenes, y previsualización de archivos.
   - Mejora adicional: límite de 5 imágenes por subida, validación de formato y visualización de clases identificables.

### Comunicación entre servicios
- Flujo de datos: Cliente → Frontend → Backend → Predicción → Frontend → Cliente
- Se usa HTTP y JSON para el intercambio de datos.
- Validación de entrada y manejo de errores garantizan la robustez del sistema.

### Contenerización
- **Dockerfiles independientes** para frontend y backend.
- Contenedores se comunican mediante una red interna.
- Backend: puerto 8000, frontend: puerto 80 (Nginx).
- Los datos persistentes (usuarios e imágenes) se montan en volúmenes para que sobrevivan a reinicios de contenedores.

### Despliegue en Kubernetes
- **Deployments:** controlan réplicas de frontend y backend.
- **Services:** exponen los pods dentro del clúster y permiten acceso externo solo al frontend.
- **Horizontal Pod Autoscaler (HPA):** autoescalado del backend según uso de CPU.
- **Persistent Volume Claims (PVC):** almacenamiento persistente para datos de usuarios y archivos de imagen.
- Permite un sistema autoescalable, tolerante a fallos y mantenible.

### Pruebas y validación
- Peticiones con datos correctos → resultados esperados.
- Peticiones con datos incorrectos → manejo de errores (400, 401, 404).
- Pruebas con múltiples peticiones → HPA escala pods automáticamente.
- Restricciones:
- Predicciones múltiples solo funcionan si las imágenes son del mismo formato.
- Límite máximo de 5 imágenes por subida.

### Mejora adicional
- UI estilo drag & drop.
- Previsualización de imágenes antes de predecir.
- Visualización de las clases que puede identificar el modelo:
- Login y registro con passwords hasheadas.
- Validación avanzada de archivos e imágenes múltiples.

---

## Kubernetes

### Construir imágenes
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