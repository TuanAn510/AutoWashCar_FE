import type { BookingStep } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface BookingProcessSectionProps {
  steps: BookingStep[];
}

export function BookingProcessSection({ steps }: BookingProcessSectionProps) {
  return (
    <section id="process" className={styles.processSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>Quy trình</span>
          <h2>Quy trình đặt lịch dễ dàng</h2>
        </div>
        <div className={styles.processGrid}>
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article key={step.title} className={styles.processStep}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <Icon size={30} />
                <h3>{step.title}</h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
