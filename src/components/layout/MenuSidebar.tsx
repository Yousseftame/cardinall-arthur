import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMenuStore } from "../../store/menuStore";

const NAV_LINKS = [
  { id: "home", label: "Home", href: "/" },
  { id: "marketplace", label: "Marketplace", href: "/marketplace" },
  { id: "about", label: "Our Story", href: "/about" },
  { id: "cant-find-it", label: "Community", href: "/cant-find-it" },
];

const SECONDARY_LINKS = [
  { label: "Cardinal Arthur" },
  { label: "Crafted with Intention" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "Journal", href: "#" },
];

const linkVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function MenuSidebar() {
  const { isMenuOpen, closeMenu } = useMenuStore();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    closeMenu();
    // Allow animation to finish before navigating
    setTimeout(() => {
      navigate(href);
    }, 400);
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={closeMenu}
          />
          <motion.aside
            className="fixed top-0 left-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-[#f8f7f3] text-[#1a1a1a] shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Elegant Header */}
            <div className="flex items-center justify-between px-12 pt-10 pb-6">
              <a href="#" className="flex items-center" onClick={(e) => { e.preventDefault(); closeMenu(); }}>
                <img
                  src="/logo-removebg-preview.png"
                  alt="Cardinal Arthur"
                  className="h-14 w-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </a>
              <button
                type="button"
                onClick={closeMenu}
                className="group p-2 -mr-2 flex items-center justify-center transition-transform hover:rotate-90 duration-500 ease-out"
                aria-label="Close menu"
              >
                <X className="w-7 h-7 stroke-[1]" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-12 py-8">
              <ul className="flex flex-col gap-6">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={linkVariants}
                  >
                    <button 
                      onClick={() => handleNavigation(link.href)} 
                      className="w-full text-left font-heading text-3xl md:text-4xl font-medium tracking-tight uppercase hover:text-primary transition-colors duration-300"
                    >
                      <span>{link.label}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>

              {/* Symmetric Footer */}
              <div className="mt-auto pt-16">
                <div className="flex items-end justify-between border-t border-[#1a1a1a]/10 pt-8 pb-4">
                  
                  {/* Left: Secondary Links */}
                  <ul className="flex flex-col gap-3">
                    {SECONDARY_LINKS.map((link, i) => (
                      <motion.li
                        key={link.label}
                        custom={i + NAV_LINKS.length}
                        initial="hidden"
                        animate="visible"
                        variants={linkVariants}
                      >
                        <span className="text-xs uppercase tracking-[0.2em] text-[#6a6a6a] cursor-default" style={{ fontFamily: '"Outfit", sans-serif' }}>
                          {link.label}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Right: Social Links */}
                  <div className="flex flex-col items-end gap-3">
                    {SOCIAL_LINKS.map((social, i) => (
                      <motion.a
                        key={social.label}
                        custom={i + NAV_LINKS.length + SECONDARY_LINKS.length}
                        initial="hidden"
                        animate="visible"
                        variants={linkVariants}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs uppercase tracking-[0.2em] text-[#1a1a1a] hover:text-primary transition-colors"
                        style={{ fontFamily: '"Outfit", sans-serif' }}
                        onClick={closeMenu}
                      >
                        {social.label}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
