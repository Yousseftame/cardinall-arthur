import HeroSection from "../../components/sections/HeroSection";
import AboutSection from "../../components/sections/AboutSection";
import MarqueeSection from "../../components/sections/MarqueeSection";
import ProductsSection from "../../components/sections/ProductsSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <MarqueeSection />
      <ProductsSection />
    </div>
  );
}
