import type { GarageStat } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface StatsSectionProps {
  items: GarageStat[];
}

export function StatsSection({ items }: StatsSectionProps) {
  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        <div>
          <img
            src="/images/photos/4.png"
            alt="Dịch vụ rửa xe AutoWash Pro"
            className={styles.mechanicImage}
          />
        </div>

        <div className={styles.statsGrid}>
          {items.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className={styles.statItem}>
                <Icon size={32} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
