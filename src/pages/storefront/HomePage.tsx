import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../../components/sections/HeroSection";
import ProductsSection from "../../components/sections/ProductsSection";
import ServicesSection from "../../components/sections/ServicesSection";
import LatestProjectsSection from "../../components/sections/LatestProjectsSection";
import ClientFeedbackSection from "../../components/sections/ClientFeedbackSection";
import BreakSection from "../../components/sections/BreakSection";
import LetsTalkSection from "../../components/sections/LetsTalkSection";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo === 'letstalk') {
      setTimeout(() => {
        document.querySelector('#letstalk')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      // Clean up state so we don't scroll again on browser back/forward
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div>
      <HeroSection />
      <ProductsSection />
      <LatestProjectsSection />
      <ServicesSection />
      <ClientFeedbackSection />
      <BreakSection />
      <LetsTalkSection />
    </div>
  );
}
