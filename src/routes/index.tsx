import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import LoginPage from '../pages/login';
import HomePage from '../pages/home';
import CreateDealPage from '../pages/deals/create-deal';
import DealDetailsPage from '../pages/deals/deal-details';
import MyDealsPage from '../pages/deals/my-deals';
import InvitesPage from '../pages/invites';
import LogoutPage from '../pages/logout'; // se você criou a página de logout

const router = createBrowserRouter([
  /** ===== ROTA PÚBLICA (SEM LAYOUT) ===== */
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },

  /** ===== ROTAS PRIVADAS (COM LAYOUT) ===== */
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'deals/create', element: <CreateDealPage /> },
      { path: 'deals/create/:id', element: <CreateDealPage /> },
      { path: 'deals/:id', element: <DealDetailsPage /> },
      { path: 'deals/my-deals', element: <MyDealsPage /> },
      { path: 'invites', element: <InvitesPage /> },
      { path: 'logout', element: <LogoutPage /> },
    ],
  },

  /** ===== CATCH-ALL ===== */
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;
