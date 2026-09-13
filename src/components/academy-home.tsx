import { useState } from "react";
import type { Product } from "#/lib/catalog";
import { AboutSection } from "#/components/about-section";
import { BlogSection } from "#/components/blog-section";
import { CTASection } from "#/components/cta-section";
import { CurriculumSection } from "#/components/curriculum-section";
import { DashboardPreview } from "#/components/dashboard-preview";
import { FAQSection } from "#/components/faq-section";
import { FooterSection } from "#/components/footer-section";
import { HeroSection } from "#/components/hero-section";
import { LeadCaptureModal } from "#/components/lead-capture-modal";
import { Navbar } from "#/components/navbar";
import { PricingSection } from "#/components/pricing-section";
import { ProgramsSection } from "#/components/programs-section";
import { SkillsSection } from "#/components/skills-section";
import { TestimonialsSection } from "#/components/testimonials-section";

export function AcademyHome({ products }: { products: Product[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection onOpenModal={() => setModalOpen(true)} />
      <AboutSection />
      <SkillsSection />
      <ProgramsSection products={products} />
      <CurriculumSection />
      <PricingSection products={products} />
      <DashboardPreview />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
      <LeadCaptureModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="glow-button fixed right-6 bottom-6 z-50 rounded-full px-5 py-3 text-sm font-bold md:hidden"
      >
        Free Kit 🎁
      </button>
    </div>
  );
}
