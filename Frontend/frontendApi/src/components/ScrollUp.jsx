import React, { useState, useEffect } from 'react';

const ScrollUp = () => {
  // Estado para verificar si el usuario ha desplazado hacia abajo
  const [isVisible, setIsVisible] = useState(false);

  // Esta función muestra el botón cuando el usuario se desplaza hacia abajo
  const checkScrollTop = () => {
    if (window.scrollY > 200) { // Si el desplazamiento es mayor
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Esta función desplaza la página hasta la parte superior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Animación suave
    });
  };

  // Usamos useEffect para escuchar el desplazamiento de la página
  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);

    // Limpiamos el evento cuando el componente se desmonte
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 w-12 h-12 flex items-center justify-center bg-[#43697a] text-white text-3xl rounded-full shadow-xl hover:bg-[#567C8D] transition-all z-50"
      >
        ↑
      </button>
      )}
    </>
  );
};

export default ScrollUp;