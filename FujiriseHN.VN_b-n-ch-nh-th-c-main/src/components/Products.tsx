import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, getCachedSettings } from '../constants';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';

function ImageCarousel({ images, title, objectFit = 'object-contain' }: { images: string[], title: string, objectFit?: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      setCurrentIndex(index);
    }
  };

  if (!images || images.length === 0) return <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Không có ảnh</div>;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 group/carousel">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, i) => (
          <div key={i} className="w-full h-full shrink-0 snap-center relative">
            <img
              src={img}
              alt={`${title} - ${i + 1}`}
              className={`w-full h-full bg-slate-50 ${objectFit}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-fuji-blue via-transparent to-transparent opacity-60 pointer-events-none" />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white text-white hover:text-fuji-blue rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all z-20 shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white text-white hover:text-fuji-blue rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all z-20 shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, i) => (
              <button 
                key={i} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 shadow-md ${i === currentIndex ? 'bg-fuji-accent w-6' : 'bg-white/60 hover:bg-white'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS as unknown as Product[]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.products && data.content_dict.products.length > 0) {
        setProducts(data.content_dict.products);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section id="products" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-fuji-line to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-6 block">Our Collection</span>
            <h2 className="text-6xl md:text-8xl font-black text-fuji-blue tracking-tighter leading-tight">
              BỘ SƯU TẬP <br /><span className="text-slate-200">THANG MÁY</span>
            </h2>
          </div>
          <div className="md:w-1/3">
            <p className="text-slate-500 text-lg font-medium leading-relaxed italic border-l-4 border-fuji-accent pl-8 py-2">
              Chạm tới đỉnh cao của sự sang trọng với những kiệt tác di chuyển trong không gian sống hiện đại.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative h-[550px] rounded-[40px] overflow-hidden mb-10 shadow-2xl transition-all duration-500">
                <ImageCarousel images={product.images || []} title={product.title} />
                
                <div className="absolute top-8 left-8">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                    {product.category || 'Homelift'}
                  </span>
                </div>

                <div className="absolute bottom-10 left-10 right-10 z-20">
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">{product.title}</h3>
                  <button className="flex items-center gap-3 text-fuji-accent text-[10px] font-bold uppercase tracking-wider group-hover:gap-6 transition-all">
                    Khám phá chi tiết <ArrowRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
              
              <div className="px-4 text-center">
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-wider text-fuji-blue/40 border-t border-slate-100 pt-8">
                  <span>Capacity: {product.specs?.load || '--'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-fuji-accent/30" />
                  <span>Speed: {product.specs?.speed || '--'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
