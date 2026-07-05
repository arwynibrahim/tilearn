import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero';
import { StatsSection } from '@/components/landing/stats';
import { PartnersMarquee } from '@/components/landing/partners';
import { CategoriesSection } from '@/components/landing/categories';
import { CoursesSection } from '@/components/landing/courses';
import { ForOrganizationsSection } from '@/components/landing/for-organizations';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { PricingSection } from '@/components/landing/pricing';
import { FaqSection } from '@/components/landing/faq';
import { CtaSection } from '@/components/landing/cta';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <PartnersMarquee />
        <CategoriesSection />
        <CoursesSection />
        <ForOrganizationsSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
