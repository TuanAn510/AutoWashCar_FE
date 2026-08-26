import { CheckCircle2 } from 'lucide-react';

import type { PricingPlan } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface PricingSectionProps {
  plans: PricingPlan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>Bảng giá</span>
          <h2>Bảng giá dịch vụ</h2>
          <p>
            Chọn gói rửa xe phù hợp để đặt lịch nhanh và nhận ưu đãi thành viên. Gói Chăm Sóc Toàn
            Diện đi kèm phòng chờ VIP, đồ uống miễn phí và nhân 3 điểm thưởng.
          </p>
        </div>
        <div className={styles.pricingGrid}>
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.pricingCard} ${plan.featured ? styles.pricingFeatured : ''}`}
            >
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#booking"
                className={plan.featured ? styles.primaryButton : styles.secondaryButton}
              >
                Đặt lịch
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
