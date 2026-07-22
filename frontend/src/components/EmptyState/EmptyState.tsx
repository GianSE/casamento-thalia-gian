import { Icon, type IconName } from '../Icon/Icon';
import styles from './EmptyState.module.css';

interface Props {
  icon?: IconName;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'heart', title, description }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <Icon name={icon} size={28} />
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  );
}
