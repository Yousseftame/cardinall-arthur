import { useNavigate } from 'react-router-dom';

import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import { useFavoriteStore } from '../../store/favoriteStore';
import { useCartStore } from '../../store/cartStore';
import { Eye, ShoppingCart } from 'lucide-react';
import PulseHeart from '../../components/PulseHeart';
import SpecularButton from '../../components/SpecularButton';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { items: favoriteItems, toggleItem: toggleFavorite, isFavorite } = useFavoriteStore();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      description: product.description,
      stock: 99,
    });
    openCart();
  };

  return (
    <>
      <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-20 overflow-x-hidden text-white">
        <section className="px-4 md:px-12 w-full max-w-[1920px] mx-auto">
          <div className="flex flex-col mb-12 mt-12 md:mt-16 text-center items-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[56px] uppercase mb-8 font-light tracking-tighter">
              <DiaTextReveal 
                text="YOUR FAVORITES" 
                textColor="#ffffff" 
                colors={["#ffffff", "#ffffff", "transparent"]} 
              />
            </h1>
            <p className="text-white/60 font-light text-base max-w-xl text-center">
              A curated collection of the pieces you love most.
            </p>
          </div>

          {favoriteItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-white/40 mb-8 font-light text-lg">Your favorites list is currently empty.</p>
              <SpecularButton 
                onClick={() => navigate('/marketplace')}
                size="lg"
                radius={14}
                tintOpacity={0}
                blur={0}
                baseColor="#B28558"
                lineColor="#B28558"
                intensity={1.5}
                className="text-xs tracking-widest font-medium uppercase !bg-white !text-black shadow-lg hover:!bg-gray-200 transition-colors duration-300"
              >
                Explore Collection
              </SpecularButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
              {favoriteItems.map((product) => (
                <div 
                  key={product.id} 
                  className="flex flex-col items-center group w-full flex-shrink-0 relative"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/5] md:aspect-square mb-6 overflow-hidden bg-[#f8f7f3] rounded-[2rem] flex items-center justify-center pointer-events-none">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      draggable={false}
                      className="w-full h-full object-contain p-6 md:p-8 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer pointer-events-auto"
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                    
                    {/* Quick Action Pill */}
                    <div className="absolute left-3 top-3 md:left-4 md:top-4 flex flex-col items-center justify-center gap-3 md:gap-5 bg-gradient-to-br from-white/10 via-white/30 to-white/80 backdrop-blur-2xl rounded-full py-4 px-2.5 md:py-5 md:px-3.5 opacity-100 scale-100 md:opacity-0 md:scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 ease-out pointer-events-auto z-10 shadow-sm border border-white/40">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                        className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Quick view"
                      >
                        <Eye strokeWidth={1.5} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Add to cart"
                      >
                        <ShoppingCart strokeWidth={1.5} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                      </button>
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center -m-2">
                        <PulseHeart 
                          liked={isFavorite(product.id.toString())}
                          onChange={() => toggleFavorite(product)}
                          showCount={false} 
                          size={22} 
                          pillColor="transparent" 
                          idleColor="rgba(26,26,26,0.7)" 
                          likedColor="#ff4d6d" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col items-center text-center px-4 w-full cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-heading text-lg md:text-xl font-medium tracking-tight uppercase text-white mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-white/60 font-light text-sm md:text-base">
                      {product.price} EGP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
