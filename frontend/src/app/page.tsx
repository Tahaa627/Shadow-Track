import {
  Hero,
  Navbar,
} from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
      </main>
    </>
  );
}