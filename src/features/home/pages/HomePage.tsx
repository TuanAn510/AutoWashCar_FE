import { Footer } from '@/app/layouts/Footer';
import { Header } from '@/app/layouts/Header';

import {
  bookingSteps,
  featureCards,
  gallery,
  headerLinks,
  mechanics,
  pricingPlans,
  services,
  stats,
  testimonials,
} from '../data/home-page-data';
import {
  AboutSection,
  BookingFormSection,
  BookingProcessSection,
  ContactStripSection,
  FeatureCardsSection,
  GallerySection,
  HeroSection,
  MechanicsSection,
  PricingSection,
  ServicesSection,
  StatsSection,
  TestimonialsSection,
} from '../components/sections';
import styles from '../components/home-page.module.css';

function HomePage() {
  return (
    <div className={styles.page}>
      <Header links={headerLinks} />
      <main>
        <HeroSection />
        <FeatureCardsSection items={featureCards} />
        <AboutSection />
        <ServicesSection items={services} />
        <StatsSection items={stats} />
        <PricingSection plans={pricingPlans} />
        <MechanicsSection items={mechanics} />
        <BookingProcessSection steps={bookingSteps} />
        <GallerySection items={gallery} />
        <TestimonialsSection items={testimonials} />
        <BookingFormSection />
        <ContactStripSection />
      </main>
      <Footer links={headerLinks} />
    </div>
  );
}

export default HomePage;
