import { MapPin, Phone, Sparkles } from 'lucide-react';

import styles from '../home-page.module.css';

export function ContactStripSection() {
  return (
    <section className={styles.contactStrip}>
      <div className={styles.container}>
        <div>
          <Sparkles size={22} />
          <strong>
            AutoWash Pro giúp đặt lịch rửa xe, tích điểm và chăm sóc khách hàng thân thiết dễ dàng
            hơn.
          </strong>
        </div>
        <div>
          <span>
            <Phone size={16} /> 0900 000 000
          </span>
          <span>
            <MapPin size={16} /> TP. Hồ Chí Minh
          </span>
        </div>
      </div>
    </section>
  );
}
