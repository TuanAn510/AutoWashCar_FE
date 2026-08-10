import { useState } from 'react';

import { DatePicker } from '@/components/ui/date-picker';

import styles from '../home-page.module.css';

export function BookingFormSection() {
  const [preferredDate, setPreferredDate] = useState('');

  return (
    <section id="booking" className={styles.bookingSection}>
      <div className={styles.container}>
        <div className={styles.bookingGrid}>
          <div className={styles.bookingImage}>
            <img src="/images/about/a2.png" alt="Dịch vụ rửa xe AutoWash Pro" />
          </div>
          <form className={styles.bookingForm}>
            <span className={styles.sectionKicker}>Đặt lịch</span>
            <h2>Đặt lịch rửa xe ngay hôm nay</h2>
            <div className={styles.formGrid}>
              <input required aria-label="Họ tên" placeholder="Họ tên" />
              <input required aria-label="Số điện thoại" placeholder="Số điện thoại" />
              <input aria-label="Dòng xe" placeholder="Dòng xe" />
              <select required aria-label="Dịch vụ cần đặt" defaultValue="">
                <option value="" disabled>
                  Dịch vụ cần đặt
                </option>
                <option>Rửa xe toàn diện</option>
                <option>Rửa Cao Cấp (350K)</option>
                <option>Chăm Sóc Toàn Diện (850K)</option>
                <option>Vệ sinh nội thất</option>
                <option>Rửa gầm xe</option>
              </select>
              <DatePicker
                aria-label="Ngày mong muốn"
                className={styles.bookingDatePicker}
                value={preferredDate}
                onChange={setPreferredDate}
                disabledDates={{ before: new Date() }}
                placeholder="Ngày mong muốn"
              />
              <input type="hidden" name="preferredDate" value={preferredDate} />
              <textarea aria-label="Ghi chú" placeholder="Ghi chú" rows={4} />
            </div>
            <button type="submit" className={styles.primaryButton}>
              Gửi lịch hẹn
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
