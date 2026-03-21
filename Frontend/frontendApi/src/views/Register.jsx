import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createUser } from "../helpers/UserHelper";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { FaUser, FaLock, FaSpinner } from "react-icons/fa";

function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      username: name,
      password: password,
    };

    try {
      const result = await createUser(userData);
      toast.success(result.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  // --- Estilos ---
  const bgMain = isDarkMode ? "bg-[#1C1C1E] text-white" : "bg-[#F5EFEB] text-black";
  const formBg = "bg-[#2F4156]";
  const inputBg = "bg-gray-800 text-white placeholder-gray-400";
  const btnBg = isDarkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600";
  const btnFocusRing = "focus:ring-2 focus:ring-red-500";
  const inputIconClass = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";

  return (
    <div
      className={`${bgMain} min-h-screen p-5 flex items-center justify-center transition-all duration-300`}
    >
      <div
        className={`w-11/12 max-w-md mx-auto ${formBg} p-8 rounded-lg shadow-xl transform transition-all duration-300 hover:shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-105">
            <FaUser className="text-white text-3xl" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-8">Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="relative">
            <label htmlFor="name" className="block text-lg font-medium mb-2">
              Nombre de usuario:
            </label>
            <div className="relative">
              <FaUser className={inputIconClass} />
              <input
                id="name"
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg ${inputBg} focus:outline-none ${btnFocusRing} transition-all duration-300`}
                placeholder="Escribe tu nombre de usuario"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="relative">
            <label htmlFor="password" className="block text-lg font-medium mb-2">
              Contraseña:
            </label>
            <div className="relative">
              <FaLock className={inputIconClass} />
              <input
                id="password"
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg ${inputBg} focus:outline-none ${btnFocusRing} transition-all duration-300`}
                placeholder="Crea tu contraseña"
              />
            </div>
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none ${btnBg} ${btnFocusRing} ${
              loading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Procesando...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;