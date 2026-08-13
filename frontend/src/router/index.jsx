import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import Create from '../pages/Create';
import Preview from '../pages/Preview';
import PublicProfile from '../pages/PublicProfile';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'create', element: <Create /> },
      { path: 'preview/:publicId', element: <Preview /> },
      { path: 'id/:publicId', element: <PublicProfile /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
