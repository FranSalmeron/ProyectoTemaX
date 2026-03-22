import React, { useState, useEffect } from "react";
import { useDarkMode } from "../context/DarkModeContext";

const Home = () => {
  const { isDarkMode } = useDarkMode();

  const bgMain = isDarkMode ? "bg-[#1C1C1E] text-white" : "bg-[#F5EFEB] text-black";
  const cardBg = isDarkMode ? "bg-[#2C2C2E]" : "bg-white";
  const border = isDarkMode ? "border-gray-600" : "border-gray-300";

  const BACKEND_URL = import.meta.env.REACT_APP_API_URL || "/api";

  // =========================
  // CLASES
  // =========================
  const classes = [
    "perro", "caballo", "elefante", "mariposa",
    "gallina", "gato", "vaca", "oveja",
    "araña", "ardilla"
  ];

  // =========================
  // STATES
  // =========================
  const [singleFile, setSingleFile] = useState(null);
  const [singlePreview, setSinglePreview] = useState(null);
  const [singleResult, setSingleResult] = useState(null);

  const [multipleFiles, setMultipleFiles] = useState([]);
  const [multiplePreviews, setMultiplePreviews] = useState([]);
  const [multipleResults, setMultipleResults] = useState([]);

  const [imageBank, setImageBank] = useState([]);

  const [dragSingle, setDragSingle] = useState(false);
  const [dragMultiple, setDragMultiple] = useState(false);

  // =========================
  // PREDICT SINGLE
  // =========================
  const handleSinglePredict = async () => {
    if (!singleFile) return;

    const formData = new FormData();
    formData.append("file", singleFile);

    const res = await fetch(`${BACKEND_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setSingleResult(data);

    setSingleFile(null);
    setSinglePreview(null);

    fetchImageBank();
  };

  // =========================
  // PREDICT MULTIPLE
  // =========================
  const handleMultiplePredict = async () => {
    if (multipleFiles.length === 0) return;

    const formData = new FormData();
    multipleFiles.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(`${BACKEND_URL}/predict-multiple`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Error en la predicción múltiple");
        return;
      }

      const data = await res.json();
      setMultipleResults(data.results);

      setMultipleFiles([]);
      setMultiplePreviews([]);

      fetchImageBank();
    } catch {
      alert("Error de conexión");
    }
  };

  // =========================
  // IMAGE BANK
  // =========================
  const fetchImageBank = async () => {
    const res = await fetch(`${BACKEND_URL}/get-image-bank`);
    const data = await res.json();
    setImageBank(data.items);
  };

  useEffect(() => {
    fetchImageBank();
  }, []);

  // =========================
  // HANDLERS
  // =========================
  const handleSingleChange = (file) => {
    if (!file) return;
    setSingleFile(file);
    setSinglePreview(URL.createObjectURL(file));
  };

  const handleMultipleChange = (files) => {
    let list = Array.from(files);

    if (list.length > 5) {
      alert("Máximo 5 imágenes");
      list = list.slice(0, 5);
    }

    setMultipleFiles(list);
    setMultiplePreviews(list.map((f) => URL.createObjectURL(f)));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDropSingle = (e) => {
    e.preventDefault();
    setDragSingle(false);
    const file = e.dataTransfer.files[0];
    handleSingleChange(file);
  };

  const handleDropMultiple = (e) => {
    e.preventDefault();
    setDragMultiple(false);
    let files = Array.from(e.dataTransfer.files);

    if (files.length > 5) {
      alert("Máximo 5 imágenes");
      files = files.slice(0, 5);
    }

    handleMultipleChange(files);
  };

  return (
    <div className={`${bgMain} min-h-screen p-6`}>
      <h1 className="text-4xl font-bold text-center mb-8">
        🐾 Animal Classifier
      </h1>

      {/* ========================= */}
      {/* CLASES */}
      {/* ========================= */}
      <div className={`${cardBg} ${border} border p-6 rounded-xl shadow mb-6`}>
        <h2 className="text-xl font-semibold mb-4 text-center">
          🧠 Clases disponibles
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {classes.map((c, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* PREDICCIONES */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* SINGLE */}
        <div className={`${cardBg} ${border} border p-6 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4">📷 Individual</h2>

          <div
            className={`border-2 border-dashed p-6 text-center rounded-lg cursor-pointer transition
            ${dragSingle ? "border-blue-500 bg-blue-100 dark:bg-blue-900" : ""}`}
            onClick={() => document.getElementById("singleInput").click()}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragSingle(true)}
            onDragLeave={() => setDragSingle(false)}
            onDrop={handleDropSingle}
          >
            <p>Arrastra o haz clic para subir imagen</p>
            <input
              id="singleInput"
              type="file"
              hidden
              onChange={(e) => handleSingleChange(e.target.files[0])}
            />
          </div>

          {singlePreview && (
            <img src={singlePreview} className="mt-4 rounded h-40 w-full object-cover" />
          )}

          <button
            onClick={handleSinglePredict}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Predecir
          </button>

          {singleResult && (
            <div className="mt-4 text-center">
              <p>{singleResult.predicted_label_es}</p>
              <p>{(singleResult.confidence * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>

        {/* MULTIPLE */}
        <div className={`${cardBg} ${border} border p-6 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4">🧠 Múltiple</h2>

          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">
            ⚠️ Usa imágenes del mismo formato (ej: todas .jpg o todas .png)
          </div>

          <div
            className={`border-2 border-dashed p-6 text-center rounded-lg cursor-pointer transition
            ${dragMultiple ? "border-green-500 bg-green-100 dark:bg-green-900" : ""}`}
            onClick={() => document.getElementById("multiInput").click()}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragMultiple(true)}
            onDragLeave={() => setDragMultiple(false)}
            onDrop={handleDropMultiple}
          >
            <p>Arrastra hasta 5 imágenes o haz clic</p>
            <input
              id="multiInput"
              type="file"
              multiple
              hidden
              onChange={(e) => handleMultipleChange(e.target.files)}
            />
          </div>

          {multiplePreviews.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {multiplePreviews.map((src, i) => (
                <img key={i} src={src} className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          )}

          <button
            onClick={handleMultiplePredict}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          >
            Predecir múltiples
          </button>

          {multipleResults.length > 0 && (
            <div className="mt-4 text-sm">
              {multipleResults.map((r, i) => (
                <div key={i}>
                  {r.filename} → {r.predicted_label_es}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* IMAGE BANK */}
      {/* ========================= */}
      <div className={`${cardBg} ${border} border p-6 rounded-xl shadow`}>
        <h2 className="text-xl font-semibold mb-4 text-center">
          🖼️ Banco de imágenes
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {imageBank.map((item) => (
            <div key={item.id}>
              <img
                src={`${BACKEND_URL}${item.image_url}`}
                className="h-32 w-full object-cover rounded"
              />
              <p className="text-center text-xs mt-1">
                {item.predicted_label_es}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;