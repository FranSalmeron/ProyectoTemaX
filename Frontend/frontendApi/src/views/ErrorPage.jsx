import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext.jsx";

const ErrorPage = () => {

  const { isDarkMode } = useDarkMode();

  // Modo oscuro clases
  const bgPage = isDarkMode ? "bg-[#1C1C1E] text-white" : "bg-gray-100 text-black";
  const textPrimary = isDarkMode ? "text-red-400" : "text-red-600";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-700";
  const btnPrimary = isDarkMode
    ? "bg-green-600 hover:bg-green-700"
    : "bg-green-500 hover:bg-green-600";
  const btnSecondary = isDarkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-700";

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${bgPage} transition-colors duration-300`}>
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold ${textPrimary}`}>
          ¡Vaya! Algo salió mal...
        </h1>
        <p className={`mt-4 text-lg ${textSecondary}`}>
          Parece que hemos tenido un problema. No te preocupes, puedes volver al
          inicio.
        </p>
      </div>

      <p className={`top-4 left-4 text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
        {`Score: ${score}`}
      </p>

      <NavLink
        to="/"
        className={`mt-4 text-white py-2 px-6 rounded-lg transition duration-300 ${btnSecondary}`}
      >
        Volver al Inicio
      </NavLink>
    </div>
  );
};

export default ErrorPage;