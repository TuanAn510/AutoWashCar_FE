import type { GalleryItem } from '../../data/home-page-data';
import styles from '../home-page.module.css';

interface GallerySectionProps {
  items: GalleryItem[];
}

export function GallerySection({ items }: GallerySectionProps) {
  return (
    <section id="gallery" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>Thư viện</span>
          <h2>Thư viện dịch vụ rửa xe</h2>
        </div>
        <div className={styles.galleryGrid}>
          {items.map((item) => (
            <figure key={`${item.image}-${item.label}`} className={styles.galleryItem}>
              <img src={item.image} alt={item.label} />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
