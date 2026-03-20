import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext";

const Home = () => {
  // Modo oscuro — VARIABLES PARA CLASES (nuevo)
  const { isDarkMode } = useDarkMode();
  const bgMain = isDarkMode
    ? "bg-[#1C1C1E] text-white"
    : "bg-[#F5EFEB] text-black"; // fondo principal y texto
  const borderFilters = isDarkMode
    ? "border-gray-600 text-white placeholder-gray-400 bg-[#2C2C2E]" // Fondo oscuro y texto blanco
    : "border-gray-300 text-black placeholder-gray-700  bg-white"; // Fondo blanco y texto negro
  // bordes y texto inputs/select
  const btnClear = isDarkMode
    ? "bg-red-600 hover:bg-red-700"
    : "bg-red-500 hover:bg-red-600"; // botón limpiar filtros
  const bgFilters = isDarkMode ? "bg-[#2C2C2E]" : "bg-gray-100"; // Fondo del panel de filtros

  return (
    <div
      className={`${bgMain} flex flex-col sm:flex-row p-4 transition-colors duration-300`}
    >
      <p className="text-2xl font-bold mb-4">Bienvenido a la página de inicio</p>
      <p className="text-lg">
        Explora nuestros productos y disfruta de una experiencia de compra única.
      </p>
    </div>    
  );
};

export default Home;