import { CheckCircle2 } from 'lucide-react';

import styles from '../home-page.module.css';

export function AboutSection() {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutContent}>
            <span className={styles.sectionKicker}>Về AutoWash Pro</span>
            <h2>Giải pháp rửa xe thông minh và chăm sóc khách hàng thân thiết</h2>
            <p>
              AutoWash Pro giúp hệ thống rửa xe số hóa quy trình đặt lịch, quản lý khách hàng, theo
              dõi lịch sử dịch vụ và chăm sóc khách hàng sau mỗi lần sử dụng. Hệ thống phù hợp cho
              trung tâm rửa xe ô tô, detailing và chăm sóc ngoại thất.
            </p>
            <div className={styles.aboutChecklist}>
              <span>
                <CheckCircle2 size={18} /> Quản lý lịch hẹn và trạng thái xử lý rõ ràng
              </span>
              <span>
                <CheckCircle2 size={18} /> Hồ sơ xe, khách hàng và ưu đãi tập trung
              </span>
              <span>
                <CheckCircle2 size={18} /> Nhắc lịch chăm sóc xe định kỳ
              </span>
            </div>
            <a href="#booking" className={styles.primaryButton}>
              Tìm hiểu thêm
            </a>
          </div>

          <div>
            <img src="/images/about/a4.png" alt="Xe đang được rửa tại AutoWash Pro" />
          </div>
        </div>
      </div>
    </section>
  );
}
