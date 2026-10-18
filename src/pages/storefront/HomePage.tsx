import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../../components/sections/HeroSection";
import ProductsSection from "../../components/sections/ProductsSection";
import MakeYourPerfumeSection from "../../components/sections/MakeYourPerfumeSection";
// import ServicesSection from "../../components/sections/ServicesSection";
import LatestProjectsSection from "../../components/sections/LatestProjectsSection";
import ClientFeedbackSection from "../../components/sections/ClientFeedbackSection";
// import BreakSection from "../../components/sections/BreakSection";
// import TrustedPartnersSection from "../../components/sections/TrustedPartnersSection";
import LetsTalkSection from "../../components/sections/LetsTalkSection";
import CheckoutFeedbackModal from "../../components/modals/CheckoutFeedbackModal";

export default function HomePage() {
  const location = useLocation();
  const [feedbackData, setFeedbackData] = useState<{
    orderNumber?: string;
    customerName?: string;
    email?: string;
    phone?: string;
  } | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    if (location.state && location.state.scrollTo === 'letstalk') {
      setTimeout(() => {
        document.querySelector('#letstalk')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      // Clean up state so we don't scroll again on browser back/forward
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Check if customer just placed an order (via localStorage) or testing via query param (?openFeedback=true)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('openFeedback') === 'true' || searchParams.get('feedback') === 'true') {
        const orderId = searchParams.get('orderId') || 'CA-99836705';
        const customer = searchParams.get('customerName') || searchParams.get('customer') || 'Youssef Tamer';
        const email = searchParams.get('email') || 'tamerosama73@gmail.com';
        const phone = searchParams.get('phone') || '+20 10 11151366';
        setFeedbackData({ orderNumber: orderId, customerName: customer, email, phone });
        setIsFeedbackModalOpen(true);
        return;
      }

      const stored = localStorage.getItem('pending_checkout_feedback');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.orderNumber) {
          setFeedbackData(parsed);
          const timer = setTimeout(() => {
            setIsFeedbackModalOpen(true);
          }, 650);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.warn("Could not check pending checkout feedback:", e);
    }
  }, [location.search]);

  // Expose global test trigger for convenient dev testing
  useEffect(() => {
    (window as any).triggerCheckoutFeedback = (
      orderNumber = 'CA-2025', 
      customerName = 'Youssef Tamer',
      email = 'tamerosama73@gmail.com',
      phone = '+20 10 11151366'
    ) => {
      setFeedbackData({ orderNumber, customerName, email, phone });
      setIsFeedbackModalOpen(true);
    };
    return () => {
      delete (window as any).triggerCheckoutFeedback;
    };
  }, []);

  const handleCloseFeedback = () => {
    setIsFeedbackModalOpen(false);
    try {
      localStorage.removeItem('pending_checkout_feedback');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div>
      <HeroSection />

      {/* Products: full FAFAFA → 2B3133 fade + noise */}
      <div className="site-atmosphere site-atmosphere--fade">
        <ProductsSection />
      </div>

      {/* Rest of home continues on the deep end color + same noise */}
      <div className="site-atmosphere site-atmosphere--deep">
        <MakeYourPerfumeSection />
        <LatestProjectsSection />
        {/* <ServicesSection /> */}
        <ClientFeedbackSection />
        {/* <BreakSection /> */}
        {/* <TrustedPartnersSection /> */}
        <LetsTalkSection />
      </div>

      {/* Checkout Experience Feedback Modal */}
      <CheckoutFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedback}
        orderNumber={feedbackData?.orderNumber}
        customerName={feedbackData?.customerName}
        email={feedbackData?.email}
        phone={feedbackData?.phone}
      />
    </div>
  );
}
