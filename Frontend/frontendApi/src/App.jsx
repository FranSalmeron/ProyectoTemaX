import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import ScrollUp from "./components/ScrollUp";
import { DarkModeProvider } from "./context/DarkModeContext";
import { UserProvider } from "./context/UserContext";

function App() {
 
  return (
    <div className="bg-[#F5EFEB] min-h-screen flex flex-col">
      <ToastContainer />
      <DarkModeProvider> {/* Proveedor de modo oscuro */}
              <UserProvider>
                <RouterProvider router={router} />
                <ScrollUp />
              </UserProvider>
      </DarkModeProvider>
    </div>
  );
}

export default App;