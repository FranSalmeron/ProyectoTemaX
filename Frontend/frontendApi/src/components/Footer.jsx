import React from 'react';
import { useDarkMode } from '../context/DarkModeContext'; // Asegúrate de tener este contexto

function Footer() {
  const { isDarkMode } = useDarkMode();

  const bgFooter = isDarkMode ? "bg-[#1C1C1E]" : "bg-[#567C8D]";
  const textFooter = isDarkMode ? "text-gray-300" : "text-white";

  return (
    <>
      <footer className={`${bgFooter} p-4 w-full`}>
        <p className={`text-center py-4 ${textFooter}`}>
          © Todos los derechos reservados.
        </p>
      </footer>
    </>
  );
}

export default Footer;