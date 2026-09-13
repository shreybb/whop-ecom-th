import { Accordion } from "#/components/accordion";

const faqs = [
  {
    title: "Is this program suitable for beginners?",
    body: "Yes. The Northstar Method scales from beginner to intermediate. Week 1 includes an assessment to calibrate your starting weights and intensity.",
  },
  {
    title: "What equipment do I need?",
    body: "A barbell, dumbbells, and a pull-up bar cover 95% of the program. Most commercial gyms have everything you need. Home gym modifications are included.",
  },
  {
    title: "How much time per week?",
    body: "4 training sessions per week, 45-60 minutes each. The program is designed for people with real schedules.",
  },
  {
    title: "Is nutrition coaching included?",
    body: "Yes. Every plan includes macro targets, meal-timing guidelines, and a grocery list template. Monthly and Annual members also get live Q&A to dial in specifics.",
  },
  {
    title: "What if I need to cancel?",
    body: "Monthly members can cancel at any time through the Northstar dashboard. The 12-Week Program is a one-time purchase with lifetime access.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="section-padding gradient-bg">
      <div className="container mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          Common <span className="glow-text">Questions</span>
        </h2>
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
