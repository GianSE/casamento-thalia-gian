import { AuthProvider } from './AuthContext';
import { AdminLayout } from './AdminLayout';

/**
 * Raiz do painel, carregada sob demanda.
 *
 * O router precisa de um único componente para poder fazer `lazy()` do painel
 * inteiro — provider de sessão junto. Enquanto o `AuthProvider`/`AdminLayout`
 * eram importados direto no router, o site público baixava o CSS do admin e o
 * framer-motion em toda visita.
 */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <AdminLayout />
    </AuthProvider>
  );
}
