import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useDarkMode } from "../context/DarkModeContext";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem("username");
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("username"); // Limpiamos usuario
    navigate(ROUTES.HOME);
  };

  return (
    <header
      className={`sticky top-0 z-50 shadow-md transition-colors duration-300 ${
        isDarkMode ? "bg-[#1C1C1E] text-white" : "bg-[#4a90e2] text-white"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <button onClick={() => navigate(ROUTES.HOME)} className="flex items-center">
          <img
            src={isDarkMode ? "/images/logo-dark.png" : "/images/logo-light.png"}
            alt="apiAnimals"
            className="h-12 w-auto"
          />
          <span className="ml-2 font-bold text-xl">apiAnimals</span>
        </button>

        {/* Menú escritorio */}
        <nav className="hidden md:flex gap-6 items-center">
          <NavLink
            to={ROUTES.HOME}
            className={({ isActive }) =>
              `hover:underline ${isActive ? "underline font-bold" : ""}`
            }
          >
            Inicio
          </NavLink>
          {!userName ? (
            <>
              <NavLink
                to={ROUTES.LOGIN}
                className={({ isActive }) =>
                  `hover:underline ${isActive ? "underline font-bold" : ""}`
                }
              >
                Login
              </NavLink>
              <NavLink
                to={ROUTES.REGISTER}
                className={({ isActive }) =>
                  `hover:underline ${isActive ? "underline font-bold" : ""}`
                }
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to={ROUTES.PROFILE}
                className={({ isActive }) =>
                  `hover:underline ${isActive ? "underline font-bold" : ""}`
                }
              >
                {userName}
              </NavLink>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors"
              >
                Logout
              </button>
            </>
          )}
          {/* Toggle Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="ml-4 p-2 rounded-full border border-white"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </nav>

        {/* Menú hamburguesa móvil */}
        <button
          className="md:hidden text-2xl"
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar móvil */}
      {isMenuOpen && (
        <div
          className={`md:hidden bg-gray-800 text-white w-full p-4 flex flex-col gap-4`}
        >
          <NavLink
            to={ROUTES.HOME}
            onClick={closeMenu}
            className="hover:underline"
          >
            Inicio
          </NavLink>
          {!userName ? (
            <>
              <NavLink
                to={ROUTES.LOGIN}
                onClick={closeMenu}
                className="hover:underline"
              >
                Login
              </NavLink>
              <NavLink
                to={ROUTES.REGISTER}
                onClick={closeMenu}
                className="hover:underline"
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to={ROUTES.PROFILE}
                onClick={closeMenu}
                className="hover:underline"
              >
                {userName}
              </NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors"
              >
                Logout
              </button>
            </>
          )}
          {/* Dark Mode móvil */}
          <button
            onClick={toggleDarkMode}
            className="mt-2 p-2 rounded-full border border-white"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>
      )}
    </header>
  );
};

export default NavBar;