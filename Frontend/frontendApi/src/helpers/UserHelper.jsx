const API_URL = import.meta.env.REACT_APP_API_URL || "/api";

// Función para registrar un nuevo usuario
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || "Error al registrar el usuario");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
