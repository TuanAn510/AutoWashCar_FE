import styles from '../home-page.module.css';

export function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroOverlay} />
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              Hệ thống rửa xe & chăm sóc khách hàng thân thiết
            </span>
            <h1>Đặt lịch rửa xe chuyên nghiệp và tích điểm ưu đãi</h1>
            <p>
              AutoWash Pro giúp khách hàng đặt lịch rửa xe nhanh chóng, theo dõi lịch sử chăm sóc
              xe, tích điểm thành viên và nhận ưu đãi độc quyền theo từng hạng.
            </p>
            <div className={styles.heroActions}>
              <a href="#booking" className={styles.primaryButton}>
                Đặt lịch ngay
              </a>
              <a href="#services" className={styles.outlineButton}>
                Khám phá dịch vụ
              </a>
            </div>
            <div className={styles.heroStats}>
              <strong>
                5,000+ <span>lượt rửa xe</span>
              </strong>
              <strong>
                8+ <span>dịch vụ</span>
              </strong>
              <strong>
                99% <span>hài lòng</span>
              </strong>
            </div>
          </div>

          <div>
            <img src="/images/about/a1.png" alt="Dịch vụ rửa xe AutoWash Pro" />
          </div>
        </div>
      </div>
    </section>
  );
}
