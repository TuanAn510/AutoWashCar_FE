import type { GarageService } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface ServicesSectionProps {
  items: GarageService[];
}

export function ServicesSection({ items }: ServicesSectionProps) {
  return (
    <section id="services" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>Dịch vụ</span>
          <h2>Dịch vụ của chúng tôi</h2>
          <p>Cung cấp các dịch vụ rửa xe và chăm sóc ngoại thất chuyên nghiệp.</p>
        </div>
        <div className={styles.serviceGrid}>
          {items.map((service) => (
            <article key={service.title} className={styles.serviceCard}>
              <img src={service.image} alt={service.title} />
              <div className={styles.serviceCardBody}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
