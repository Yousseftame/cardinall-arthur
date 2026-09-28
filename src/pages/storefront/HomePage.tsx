import HeroSection from "../../components/sections/HeroSection";
import AboutSection from "../../components/sections/AboutSection";
import MarqueeSection from "../../components/sections/MarqueeSection";
import ProductsSection from "../../components/sections/ProductsSection";
import WorkProcessSection from "../../components/sections/WorkProcessSection";
import ServicesSection from "../../components/sections/ServicesSection";
import LatestProjectsSection from "../../components/sections/LatestProjectsSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <MarqueeSection />
      <ProductsSection />
      <WorkProcessSection />
      <ServicesSection />
      <LatestProjectsSection />
    </div>
  );
}
