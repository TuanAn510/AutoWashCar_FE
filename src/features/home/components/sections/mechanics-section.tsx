import { Globe, Mail, MessageCircle, Share2 } from 'lucide-react';

import type { MechanicProfile } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface MechanicsSectionProps {
  items: MechanicProfile[];
}

export function MechanicsSection({ items }: MechanicsSectionProps) {
  return (
    <section id="mechanics" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>Đội ngũ</span>
          <h2>Đội ngũ chăm sóc xe</h2>
        </div>
        <div className={styles.mechanicGrid}>
          {items.map((mechanic) => (
            <article key={mechanic.name} className={styles.mechanicCard}>
              <img src={mechanic.image} alt={mechanic.name} />
              <div>
                <h3>{mechanic.name}</h3>
                <p>{mechanic.role}</p>
                <span>
                  <MessageCircle size={15} />
                  <Globe size={15} />
                  <Share2 size={15} />
                  <Mail size={15} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
