// router.js
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import { Home, Login, Register, ErrorPage, } from '../views/indexViews.jsx';
import { ROUTES } from './paths.jsx';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ROUTES.HOME, // "/"
        element: <Home />,
      },
      {
        path: ROUTES.LOGIN, // "/login"
        element: <Login />,
      },
      {
        path: ROUTES.REGISTER, // "/register"
        element: <Register />,
      },
    ],
  },
]);