import { useSeo } from '../hooks/useSeo';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  useSeo({ title: 'Página não encontrada' });
  return (
    <div className={styles.wrap}>
      <span className="eyebrow">Erro 404</span>
      <h1 className={styles.title}>Página não encontrada</h1>
      <p className={styles.text}>
        O endereço que você procura não existe ou foi movido.
      </p>
      <Button to="/" variant="secondary">
        <Icon name="home" size={18} /> Voltar ao início
      </Button>
    </div>
  );
}
