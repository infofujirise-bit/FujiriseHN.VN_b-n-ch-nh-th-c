import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PRODUCTS, getCachedSettings } from '../constants';
import { supabase, Product } from '../lib/supabase';
import { ArrowLeft, Cog, Zap, MoveUp, Globe, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sendToTelegram } from '../lib/telegram';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [showQuoteForm, setShowQuoteForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; phone: string }>();
  const [activeImage, setActiveImage] = React.useState(0);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      let allProds: Product[] = [...PRODUCTS] as unknown as Product[];
      try {
        const { data } = await getCachedSettings(supabase);
        if (data?.content_dict?.products && data.content_dict.products.length > 0) {
          allProds = data.content_dict.products;
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
      }
      
      setAllProducts(allProds);
      const foundProduct = allProds.find(p => p.id.toString() === id);

      if (!foundProduct) {
        navigate('/', { replace: true });
        return;
      }
      setProduct(foundProduct as Product);
      setActiveImage(0);
    };
    fetchProduct();
  }, [id, navigate]);

  const onSubmit = async (data: { name: string; phone: string }) => {
    setIsSubmitting(true);
    try {
      const message = `Yêu cầu Báo giá: ${product?.title}`;
      await supabase.from('leads').insert([{ name: data.name, phone: data.phone, message, status: 'new' }]);
      await sendToTelegram(`
💰 <b>YÊU CẦU BÁO GIÁ SẢN PHẨM (Từ Trang Chi Tiết)</b>
----------------------------
<b>Họ tên:</b> ${data.name}
<b>Điện thoại:</b> ${data.phone}
<b>Sản phẩm:</b> ${product?.title}
----------------------------
<i>Hệ thống tự động thông báo.</i>
      `);
      setIsSuccess(true);
      setTimeout(() => { 
        setIsSuccess(false); 
        setShowQuoteForm(false); 
        reset(); 
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-fuji-blue rounded-full animate-spin" />
      </div>
    );
  }

  const images = product.images || [product.image].filter(Boolean) as string[];
  const relatedProducts = allProducts.filter(p => p.id.toString() !== id);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Image Section - Tràn viền, khổng lồ */}
        <div className="relative w-full h-[70vh] lg:h-[90vh] bg-slate-900 group overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110" 
            style={{ backgroundImage: `url(${images[activeImage]})` }} 
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center pt-24 pb-8 pointer-events-none">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={images[activeImage]} 
              alt={product.title} 
              className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] pointer-events-auto px-4 md:px-12"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />
          
          {/* Overlay Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white text-white hover:text-fuji-blue rounded-full flex items-center justify-center backdrop-blur-md md:opacity-0 group-hover:opacity-100 transition-all z-30 shadow-lg"><ChevronLeft size={24} className="md:w-7 md:h-7" /></button>
              <button onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white text-white hover:text-fuji-blue rounded-full flex items-center justify-center backdrop-blur-md md:opacity-0 group-hover:opacity-100 transition-all z-30 shadow-lg"><ChevronRight size={24} className="md:w-7 md:h-7" /></button>
            </>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-30 py-12 md:py-20">
            {/* Content Section */}
            <div className="relative">
              <button onClick={() => navigate(-1)} className="mb-8 md:mb-12 inline-flex items-center gap-3 text-slate-400 hover:text-fuji-blue font-black text-[10px] uppercase tracking-widest transition-colors group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-fuji-blue group-hover:text-white transition-colors shadow-sm">
                  <ArrowLeft size={16} />
                </div>
                Quay lại danh mục
              </button>

              <div className="text-center mb-16">
                <span className="px-4 py-2 bg-fuji-accent/10 text-fuji-accent rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 inline-block">
                  {product.category || 'Homelift'}
                </span>
                <h1 className="text-4xl lg:text-6xl font-black text-fuji-blue tracking-tighter leading-tight mb-6 uppercase">
                  {product.title}
                </h1>
                <p className="text-slate-500 text-lg lg:text-xl font-medium leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              <div className="bg-slate-50 rounded-[30px] p-6 md:p-8 lg:p-12 mb-16">
                <h3 className="text-2xl font-black text-fuji-blue mb-8 uppercase tracking-tight flex items-center gap-3">
                  <Cog className="text-fuji-accent" /> Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {product.specs?.load && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><MoveUp size={14}/> Tải trọng</span>
                      <span className="font-black text-fuji-blue text-right">{product.specs.load}</span>
                    </div>
                  )}
                  {product.specs?.speed && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Zap size={14}/> Tốc độ</span>
                      <span className="font-black text-fuji-blue text-right">{product.specs.speed}</span>
                    </div>
                  )}
                  {product.specs?.pit && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Cog size={14}/> Hố Pit</span>
                      <span className="font-black text-fuji-blue text-right">{product.specs.pit}</span>
                    </div>
                  )}
                  {product.specs?.oh && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><MoveUp size={14}/> OH</span>
                      <span className="font-black text-fuji-blue text-right">{product.specs.oh}</span>
                    </div>
                  )}
                  {product.specs?.travel && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Globe size={14}/> Hành trình</span>
                      <span className="font-black text-fuji-blue text-right">{product.specs.travel}</span>
                    </div>
                  )}
                  {product.specs?.stops && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Zap size={14}/> Điểm dừng</span>
                      <span className="font-black text-fuji-blue text-right">{product.specs.stops}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cabin Details */}
              {product.cabin?.material && (
                <div className="mb-16">
                  <h3 className="text-2xl font-black text-fuji-blue mb-6 uppercase tracking-tight flex items-center gap-3">
                    <Globe className="text-fuji-accent" /> Vật liệu & Cấu hình Cabin
                  </h3>
                  <div className="p-6 md:p-8 bg-fuji-line/30 rounded-[30px] border border-fuji-line">
                    <p className="text-base text-slate-600 leading-loose whitespace-pre-line font-medium">
                      {product.cabin.material}
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Section */}
              <div className="bg-fuji-blue rounded-[30px] p-6 md:p-8 lg:p-12 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuji-accent/20 rounded-full blur-[80px]" />
                {!showQuoteForm ? (
                  <div className="relative z-10">
                    <h3 className="text-3xl lg:text-4xl font-black mb-6 uppercase">Bạn quan tâm đến sản phẩm này?</h3>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn chi tiết về cấu hình, kỹ thuật và cung cấp báo giá tốt nhất cho bạn.</p>
                    <button 
                      onClick={() => setShowQuoteForm(true)}
                      className="w-full sm:w-auto px-10 py-5 bg-white text-fuji-blue rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:bg-fuji-accent hover:text-white transition-all inline-flex items-center justify-center gap-3"
                    >
                      Yêu cầu báo giá ngay <ArrowRight size={18} />
                    </button>
                  </div>
                ) : !isSuccess ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 max-w-md mx-auto text-left">
                    <h4 className="text-2xl font-black mb-6 text-center uppercase">Thông tương liên hệ</h4>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-2 mb-2 block">Họ và tên</label>
                        <input 
                          {...register('name', { required: true })}
                          placeholder="Nguyễn Văn A"
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:bg-white/20 focus:border-fuji-accent outline-none transition-all font-bold text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-2 mb-2 block">Số điện thoại</label>
                        <input 
                          {...register('phone', { required: true })}
                          placeholder="0987 654 321"
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:bg-white/20 focus:border-fuji-accent outline-none transition-all font-bold text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button type="button" onClick={() => setShowQuoteForm(false)} className="w-full sm:flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all">Hủy</button>
                      <button type="submit" disabled={isSubmitting} className="w-full sm:flex-[2] py-4 bg-fuji-accent text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl hover:bg-white hover:text-fuji-blue transition-all disabled:opacity-50">
                        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="relative z-10 py-10">
                    <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-2xl font-black mb-4 uppercase">Gửi thành công!</h4>
                    <p className="text-white/80">Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
                  </div>
                )}
              </div>

              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div className="mt-16 pt-12 border-t border-slate-100">
                  <h3 className="text-2xl font-black text-fuji-blue mb-8 uppercase tracking-tight text-center">Sản phẩm liên quan</h3>
                  <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
                    {relatedProducts.map(rp => (
                      <div 
                        key={rp.id} 
                        onClick={() => navigate(`/product/${rp.id}`)}
                        className="shrink-0 w-[280px] md:w-[320px] snap-start cursor-pointer group bg-slate-50 rounded-3xl p-4 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
                      >
                        <div className="h-48 md:h-56 rounded-2xl overflow-hidden mb-4 relative bg-slate-800 shrink-0">
                          <div className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110" style={{ backgroundImage: `url(${rp.images?.[0] || rp.image})` }} />
                          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                            <img src={rp.images?.[0] || rp.image} alt={rp.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl" />
                          </div>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-20 pointer-events-none" />
                        </div>
                        <div className="text-center flex-1 flex flex-col justify-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-fuji-accent block mb-2">{rp.category || 'Homelift'}</span>
                          <h4 className="font-black text-fuji-blue leading-snug line-clamp-2 group-hover:text-fuji-accent transition-colors">{rp.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}