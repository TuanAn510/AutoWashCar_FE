import { Star } from 'lucide-react';

import type { CustomerTestimonial } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface TestimonialsSectionProps {
  items: CustomerTestimonial[];
}

export function TestimonialsSection({ items }: TestimonialsSectionProps) {
  return (
    <section className={styles.testimonialSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeadingDark}>
          <span className={styles.sectionKicker}>Nhận xét</span>
          <h2>Khách hàng nói gì về AutoWash Pro</h2>
        </div>
        <div className={styles.testimonialGrid}>
          {items.map((testimonial) => (
            <article key={testimonial.author} className={styles.testimonialCard}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p>&ldquo;{testimonial.quote}&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <img src={testimonial.image} alt={testimonial.author} />
                <strong>{testimonial.author}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
