import { useState } from "react";
import type { Product } from "#/lib/catalog";
import { AboutSection } from "#/components/about-section";
import { CTASection } from "#/components/cta-section";
import { CurriculumSection } from "#/components/curriculum-section";
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
    <div className="min-h-screen bg-background pb-24 text-foreground md:pb-0">
      <Navbar />
      <HeroSection onOpenModal={() => setModalOpen(true)} />
      <AboutSection />
      <SkillsSection />
      <ProgramsSection />
      <CurriculumSection />
      <PricingSection products={products} />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
      <LeadCaptureModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="glow-button fixed right-6 bottom-6 z-50 md:hidden"
      >
        Free kit
      </button>
    </div>
  );
}
