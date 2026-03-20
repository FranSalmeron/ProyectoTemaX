import React, { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Footer, NavBar } from "../components/indexComponents.jsx";

const RootLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;