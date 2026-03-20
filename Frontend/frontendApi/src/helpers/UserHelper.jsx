const symfonyUrl = import.meta.env.VITE_API_URL;

// Función para registrar un nuevo usuario
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${symfonyUrl}/user/new`, {
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

// Función para obtener la información de un usuario
export const getUserInfo = async (user, userId, addUser) => {
  // Verificamos si el usuario ya está en el contexto
  if (user && user.id == userId) {
    return user; // Si el usuario ya está en el contexto, devolvemos directamente los datos
  }

  // Si no está en el contexto, hacemos la solicitud al backend
  try {
    const response = await fetch(`${symfonyUrl}/user/${userId}/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      addUser(data); // Agregamos el usuario al contexto si la solicitud es exitosa
      console.log("Usuario agregado al contexto");
      return data;
    } else {
      throw new Error(
        data.error || "Error al obtener la información del usuario"
      );
    }
  } catch (error) {
    console.error("Error en la solicitud al backend:", error);
    throw error;
  }
};

// Función para editar un usuario,
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${symfonyUrl}/user/${userId}/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || "Error al actualizar el usuario");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await fetch(`${symfonyUrl}/user/${userId}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }), // Enviar las contraseñas
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || "Error al cambiar la contraseña");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};