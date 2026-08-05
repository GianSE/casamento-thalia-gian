import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from './layout/RootLayout';
import { Loader } from './components/Loader/Loader';

// ---- Públicas ----
const HomePage = lazy(() => import('./pages/HomePage'));
const HistoriaPage = lazy(() => import('./pages/HistoriaPage'));
const GaleriaPage = lazy(() => import('./pages/GaleriaPage'));
const PresentesPage = lazy(() => import('./pages/PresentesPage'));
const RsvpPage = lazy(() => import('./pages/RsvpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ---- Admin ----
// Raízes carregadas sob demanda: o painel (com o provider de sessão, o CSS do
// admin e o framer-motion) fica fora do bundle do site público.
const AdminRoot = lazy(() => import('./admin/AdminRoot'));
const LoginRoot = lazy(() => import('./admin/LoginRoot'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const RsvpsAdmin = lazy(() => import('./admin/RsvpsAdmin'));
const MessagesAdmin = lazy(() => import('./admin/MessagesAdmin'));
const GalleryAdmin = lazy(() => import('./admin/GalleryAdmin'));
const GiftsAdmin = lazy(() => import('./admin/GiftsAdmin'));
const TimelineAdmin = lazy(() => import('./admin/TimelineAdmin'));
const EventsAdmin = lazy(() => import('./admin/EventsAdmin'));
const SettingsAdmin = lazy(() => import('./admin/SettingsAdmin'));
const UsersAdmin = lazy(() => import('./admin/UsersAdmin'));

function page(el: React.ReactNode) {
  return <Suspense fallback={<Loader />}>{el}</Suspense>;
}

export const router = createBrowserRouter([
  // ---------- Site público ----------
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: page(<HomePage />) },
      { path: '/historia', element: page(<HistoriaPage />) },
      { path: '/galeria', element: page(<GaleriaPage />) },
      { path: '/presentes', element: page(<PresentesPage />) },
      { path: '/rsvp', element: page(<RsvpPage />) },
      { path: '*', element: page(<NotFoundPage />) },
    ],
  },

  // ---------- Login (sem layout admin) ----------
  {
    path: '/admin/login',
    element: page(<LoginRoot />),
  },

  // ---------- Painel admin (protegido) ----------
  {
    path: '/admin',
    element: page(<AdminRoot />),
    children: [
      { index: true, element: page(<DashboardPage />) },
      { path: 'rsvps', element: page(<RsvpsAdmin />) },
      { path: 'mensagens', element: page(<MessagesAdmin />) },
      { path: 'galeria', element: page(<GalleryAdmin />) },
      { path: 'presentes', element: page(<GiftsAdmin />) },
      { path: 'historia', element: page(<TimelineAdmin />) },
      { path: 'detalhes', element: page(<EventsAdmin />) },
      { path: 'configuracoes', element: page(<SettingsAdmin />) },
      { path: 'usuarios', element: page(<UsersAdmin />) },
    ],
  },
]);
