import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS, getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';

export default function ProductsPage() {
  const [products, setProducts] = React.useState(PRODUCTS);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.products && data.content_dict.products.length > 0) {
        setProducts(data.content_dict.products);
      }
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 py-24 md:py-32 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 mt-10 gap-6">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-2 block">BỘ SƯU TẬP 2026</span>
            <h1 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter leading-tight">
              GIẢI PHÁP <span className="text-slate-300">THANG MÁY</span>
            </h1>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group block bg-slate-50 rounded-[40px] p-6 hover:bg-fuji-blue transition-colors duration-500 hover:shadow-2xl hover:-translate-y-2">
              <div className="h-64 rounded-[30px] overflow-hidden mb-6 relative flex gap-1 shadow-inner bg-slate-900">
                {product.images && product.images.length > 1 ? (
                  <>
                    <div className="relative w-2/3 h-full overflow-hidden bg-slate-800">
                       <div className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${product.images[0]})` }} />
                       <img src={product.images[0]} alt={product.title} className="relative z-10 w-full h-full object-contain pt-6 group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="w-1/3 flex flex-col gap-1">
                       <div className="relative w-full h-1/2 overflow-hidden bg-slate-800">
                         <div className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${product.images[1]})` }} />
                         <img src={product.images[1]} className="relative z-10 w-full h-full object-contain pt-4 group-hover:scale-105 transition-transform duration-700" />
                       </div>
                       {product.images[2] ? (
                         <div className="relative w-full h-1/2 overflow-hidden bg-slate-800">
                           <div className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${product.images[2]})` }} />
                           <img src={product.images[2]} className="relative z-10 w-full h-full object-contain pt-4 group-hover:scale-105 transition-transform duration-700" />
                         </div>
                       ) : <div className="w-full h-1/2 bg-slate-800" />}
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full overflow-hidden bg-slate-800">
                     <div className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${product.images?.[0] || product.image})` }} />
                     <img src={product.images?.[0] || product.image} alt={product.title} className="relative z-10 w-full h-full object-contain pt-6 group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
              </div>
              <div className="px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-fuji-accent group-hover:text-white/60 mb-2 block transition-colors">{product.category || 'Homelift'}</span>
                <h3 className="text-xl font-black text-fuji-blue group-hover:text-white tracking-tight mb-3 transition-colors">{product.title}</h3>
                <p className="text-sm text-slate-500 group-hover:text-white/80 line-clamp-2 font-medium transition-colors mb-6">{product.description}</p>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-fuji-blue group-hover:text-white transition-colors">Khám phá ngay <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" /></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
      <FloatingActions />
    </main>
  );
}