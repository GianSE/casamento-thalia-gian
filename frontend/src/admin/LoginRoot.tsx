import { AuthProvider } from './AuthContext';
import LoginPage from './LoginPage';

/** Login fora do layout do painel — mas ainda dentro do provider de sessão. */
export default function LoginRoot() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}
