// Contexto de usuario
import { createContext, useContext, useState, useEffect } from "react";

const userContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Guardamos un solo usuario (no un array)

  const addUser = (newUser) => {
    if (user?.id === newUser.id) {
      return; // Si el usuario ya está en el contexto, no hacemos nada
    }
    setUser(newUser); // Añadimos el nuevo usuario
  };

  const removeUserData = () => {
    setUser(null); // Eliminamos al usuario del contexto
  };

  return (
    <userContext.Provider value={{ user, addUser, removeUserData }}>
      {children}
    </userContext.Provider>
  );
}

// Hook para consumir el contexto
export const useUser = () => {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};