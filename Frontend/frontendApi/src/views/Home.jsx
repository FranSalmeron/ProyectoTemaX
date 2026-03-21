import React, { useState, useEffect } from "react";
import { useDarkMode } from "../context/DarkModeContext";

const Home = () => {
  const { isDarkMode } = useDarkMode();

  const bgMain = isDarkMode
    ? "bg-[#1C1C1E] text-white"
    : "bg-[#F5EFEB] text-black";

  const cardBg = isDarkMode
    ? "bg-[#2C2C2E]"
    : "bg-white";

  const border = isDarkMode ? "border-gray-600" : "border-gray-300";

  // STATES
  const [singleFile, setSingleFile] = useState(null);
  const [singleResult, setSingleResult] = useState(null);

  const [multipleFiles, setMultipleFiles] = useState([]);
  const [multipleResults, setMultipleResults] = useState([]);

  const [imageBank, setImageBank] = useState([]);

  const BACKEND_URL = import.meta.env.REACT_APP_API_URL || "/api";

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
    fetchImageBank(); // actualizar banco
  };

  // =========================
  // PREDICT MULTIPLE
  // =========================
  const handleMultiplePredict = async () => {
  if (multipleFiles.length === 0) return;

  try {
    const formData = new FormData();
    multipleFiles.forEach((file) => formData.append("files", file));

    const res = await fetch(`${BACKEND_URL}/predict-multiple`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error:", errorText);
      alert(`Error en predicción múltiple: ${res.status}`);
      return;
    }

    const data = await res.json();
    setMultipleResults(data.results);
    fetchImageBank();
  } catch (err) {
    console.error(err);
    alert("Error de conexión o archivo demasiado grande");
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

  return (
    <div className={`${bgMain} min-h-screen p-6 transition-colors duration-300`}>
      
      <h1 className="text-3xl font-bold mb-6 text-center">
        🐾 Animal Classifier
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================= */}
        {/* SINGLE */}
        {/* ========================= */}
        <div className={`${cardBg} ${border} border p-4 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4">📷 Predicción individual</h2>

          <input
            type="file"
            onChange={(e) => setSingleFile(e.target.files[0])}
            className="mb-3"
          />

          <button
            onClick={handleSinglePredict}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Predecir
          </button>

          {singleResult && (
            <div className="mt-4">
              <p><strong>Animal:</strong> {singleResult.predicted_label_es}</p>
              <p><strong>Confianza:</strong> {(singleResult.confidence * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* MULTIPLE */}
        {/* ========================= */}
        <div className={`${cardBg} ${border} border p-4 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4">🧠 Predicción múltiple</h2>

          <input
            type="file"
            multiple
            onChange={(e) => setMultipleFiles([...e.target.files])}
            className="mb-3"
          />

          <button
            onClick={handleMultiplePredict}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Predecir múltiples
          </button>

          {multipleResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {multipleResults.map((res, i) => (
                <div key={i} className="text-sm border-b pb-1">
                  {res.filename} → {res.predicted_label_es} ({(res.confidence * 100).toFixed(1)}%)
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* IMAGE BANK */}
        {/* ========================= */}
        <div className={`${cardBg} ${border} border p-4 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4">🖼️ Banco de imágenes</h2>

          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
            {imageBank.map((item) => (
              <div key={item.id} className="text-center text-xs">
                <img
                  src={`${BACKEND_URL}${item.image_url}`}
                  alt=""
                  className="w-full h-24 object-cover rounded"
                />
                <p>{item.predicted_label_es}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;