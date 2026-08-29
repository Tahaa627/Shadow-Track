import {
  Capabilities,
  Hero,
  SecuritySection,
  Navbar,
  FinalCTA,
  Footer,
} from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Capabilities />
        <SecuritySection />
        <FinalCTA />
      </main>
      
      <Footer />
    </>
  );
}