import type { FeatureCardItem } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface FeatureCardsSectionProps {
  items: FeatureCardItem[];
}

export function FeatureCardsSection({ items }: FeatureCardsSectionProps) {
  return (
    <section className={styles.featureCardSection} aria-label="Tính năng nổi bật">
      <div className={styles.container}>
        <div className={styles.featureCards}>
          {items.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className={styles.featureCard}>
                <Icon size={34} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
