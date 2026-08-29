import {
  Capabilities,
  Hero,
  SecuritySection,
  Navbar,
} from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Capabilities />
        <SecuritySection />
      </main>
    </>
  );
}