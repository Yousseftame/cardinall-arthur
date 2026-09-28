import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import SpecularButton from '../SpecularButton';

export default function CartSidebar() {
  const { isOpen, closeCart, items, getCartTotal } = useCartStore();

  // Animation variants for the empty state elements
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Stark Black Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#f8f7f3] shadow-2xl z-[100] flex flex-col"
          >
            {/* Ultra-Minimal Header */}
            <div className="flex items-center justify-between px-10 pt-10 pb-6">
              <h2 className="font-heading text-2xl font-medium tracking-tight uppercase text-[#1a1a1a] flex items-center gap-4">
                Cart
                <span className="text-sm font-light tracking-normal text-[#1a1a1a]/50">
                  {items.length > 0 ? `(${items.length})` : ''}
                </span>
              </h2>
              <button 
                onClick={closeCart}
                className="group p-2 -mr-2 flex items-center justify-center transition-transform hover:rotate-90 duration-500 ease-out"
              >
                <X className="w-6 h-6 text-[#1a1a1a] stroke-[1.5]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-10">
              {items.length === 0 ? (
                <motion.div 
                  variants={containerVars}
                  initial="hidden"
                  animate="show"
                  className="h-full flex flex-col justify-center pb-20"
                >
                  <motion.p 
                    variants={itemVars}
                    className="font-heading text-[#1a1a1a] text-3xl md:text-4xl font-medium tracking-tight uppercase mb-6"
                  >
                    Your cart is empty.
                  </motion.p>
                  
                  <motion.p 
                    variants={itemVars}
                    className="text-[#6a6a6a] text-sm tracking-wide font-light leading-relaxed mb-12 max-w-[280px]"
                    style={{ fontFamily: '"Outfit", sans-serif' }}
                  >
                    It appears you haven't added any pieces to your collection yet.
                  </motion.p>

                  <motion.div variants={itemVars}>
                    <div onClick={closeCart} className="w-full">
                      <SpecularButton 
                        size="lg"
                        radius={14}
                        tintOpacity={0}
                        blur={0}
                        baseColor="#B28558"
                        lineColor="#B28558"
                        intensity={1.5}
                        className="w-full text-xs tracking-widest font-medium uppercase !bg-[#1a1a1a] !text-[#f8f7f3] shadow-lg hover:!bg-black transition-colors duration-300"
                      >
                        Discover Collection
                      </SpecularButton>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-8 py-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      {/* Image */}
                      <div className="w-28 h-32 bg-[#EBE8E3]/50 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-heading text-lg font-medium tracking-tight uppercase text-[#1a1a1a]">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-xs text-[#6a6a6a] tracking-widest uppercase mb-4">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-sm text-[#1a1a1a]" style={{ fontFamily: '"Outfit", sans-serif' }}>
                          {item.price} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-10 bg-[#f8f7f3] border-t border-[#1a1a1a]/10">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#6a6a6a]">Subtotal</span>
                  <span className="font-medium text-xl text-[#1a1a1a]" style={{ fontFamily: '"Outfit", sans-serif' }}>
                    {getCartTotal().toFixed(2)} EGP
                  </span>
                </div>
                <div className="w-full">
                  <SpecularButton 
                    size="lg"
                    radius={14}
                    tintOpacity={0}
                    blur={0}
                    baseColor="#B28558"
                    lineColor="#B28558"
                    intensity={1.5}
                    className="w-full text-xs tracking-widest font-medium uppercase !bg-[#1a1a1a] !text-[#f8f7f3] shadow-lg hover:!bg-black transition-colors duration-300"
                  >
                    Proceed to Checkout
                  </SpecularButton>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-center text-[#1a1a1a]/40 mt-6">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
