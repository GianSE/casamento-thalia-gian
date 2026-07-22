import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './Navbar/Navbar';
import { Footer } from './Footer/Footer';
import { MobileTabBar } from './MobileTabBar/MobileTabBar';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <ScrollRestoration />
      <Navbar />
      <main id="conteudo" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
