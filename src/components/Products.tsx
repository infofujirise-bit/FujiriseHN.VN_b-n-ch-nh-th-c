import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from '../constants';
import { ArrowRight, X, Cog, Zap, MoveUp, Globe, User, Phone, CheckCircle2 } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useForm } from 'react-hook-form';
import { sendToTelegram } from '../lib/telegram';

function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`${title} - ${index + 1}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full object-contain bg-slate-50/50"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-fuji-blue via-transparent to-transparent opacity-60" />
      
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-fuji-accent w-4' : 'bg-white/40'}`} 
          />
        ))}
      </div>
    </div>
  );
}

export default function Products() {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS as unknown as Product[]);
  const [showQuoteForm, setShowQuoteForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; phone: string }>();

  const onSubmit = async (data: { name: string; phone: string }) => {
    setIsSubmitting(true);
    try {
      const message = `Yêu cầu Báo giá: ${selectedProduct?.title}`;
      await supabase.from('leads').insert([{ name: data.name, phone: data.phone, message, status: 'new' }]);
      await sendToTelegram(`
💰 <b>YÊU CẦU BÁO GIÁ SẢN PHẨM</b>
----------------------------
<b>Họ tên:</b> ${data.name}
<b>Điện thoại:</b> ${data.phone}
<b>Sản phẩm:</b> ${selectedProduct?.title}
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

  React.useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
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
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group cursor-pointer flex flex-col"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative h-[550px] rounded-[40px] overflow-hidden mb-10 shadow-2xl transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-fuji-blue/20">
                <ImageCarousel images={product.images || []} title={product.title} />
                
                <div className="absolute top-8 left-8">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                    Luxury
                  </span>
                </div>

                <div className="absolute bottom-10 left-10 right-10 z-20">
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">{product.title}</h3>
                  <button className="flex items-center gap-3 text-fuji-accent text-[10px] font-black uppercase tracking-widest group-hover:gap-6 transition-all">
                    Xem thông số chi tiết <ArrowRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
              
              <div className="px-4 text-center">
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-fuji-blue/40 border-t border-slate-100 pt-8">
                  <span>Capacity: {product.specs?.load || '--'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-fuji-accent/30" />
                  <span>Speed: {product.specs?.speed || '--'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-fuji-blue/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-6xl h-[90vh] lg:h-[85vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setShowQuoteForm(false);
                  setIsSuccess(false);
                  reset();
                }}
                className="absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 bg-white/50 lg:bg-fuji-blue backdrop-blur-md text-fuji-blue lg:text-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-50 shadow-xl"
              >
                <X size={24} />
              </button>

                <div className="w-full lg:w-1/2 h-[40%] lg:h-full relative shrink-0">
                   <ImageCarousel images={selectedProduct.images || []} title={selectedProduct.title} />
                </div>

                <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col overflow-y-auto bg-white relative z-10">
                  {showQuoteForm ? (
                    <div className="flex flex-col h-full justify-center">
                      <button 
                        onClick={() => setShowQuoteForm(false)}
                        className="self-start mb-8 text-slate-400 hover:text-fuji-blue flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                      >
                        <ArrowRight size={16} className="rotate-180" /> Quay lại
                      </button>

                      <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-fuji-accent mb-2 block">Exclusive Quote</span>
                        <h3 className="text-3xl lg:text-4xl font-black text-fuji-blue tracking-tighter">Nhận Báo Giá</h3>
                        <p className="text-slate-400 font-medium mt-2 text-sm">Sản phẩm: <span className="text-fuji-blue font-black">{selectedProduct.title}</span></p>
                      </div>

                      {!isSuccess ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><User size={12} /> Họ và tên *</label>
                            <input 
                              {...register('name', { required: true })}
                              placeholder="Nguyễn Văn A"
                              className="w-full px-6 py-4 rounded-2xl bg-fuji-line border-transparent focus:bg-white focus:border-fuji-accent outline-none transition-all font-bold text-fuji-blue"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Phone size={12} /> Số điện thoại *</label>
                            <input 
                              {...register('phone', { required: true })}
                              placeholder="0987 654 321"
                              className="w-full px-6 py-4 rounded-2xl bg-fuji-line border-transparent focus:bg-white focus:border-fuji-accent outline-none transition-all font-bold text-fuji-blue"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all mt-4 ${isSubmitting ? "bg-slate-100 text-slate-400" : "bg-fuji-blue text-white hover:bg-fuji-accent shadow-2xl shadow-fuji-blue/20"}`}
                          >
                            {isSubmitting ? "ĐANG GỬI..." : "NHẬN BÁO GIÁ NGAY"}
                          </button>
                        </form>
                      ) : (
                        <div className="py-20 text-center">
                          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 size={56} />
                          </div>
                          <h4 className="text-3xl font-black text-fuji-blue mb-4">Gửi Thành Công!</h4>
                          <p className="text-slate-500 font-medium">Chuyên viên của chúng tôi sẽ liên hệ báo giá đặc quyền cho bạn trong ít phút.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-fuji-accent text-sm font-bold uppercase tracking-wider mb-6 block">Masterpiece Specification</span>
                      <h3 className="text-4xl lg:text-6xl font-black text-fuji-blue tracking-tighter leading-none mb-8 uppercase">
                        {selectedProduct.title}
                      </h3>
                      <p className="text-slate-500 text-base lg:text-lg mb-8 font-medium leading-relaxed">{selectedProduct.description}</p>

                      <div className="flex flex-col mb-10 border-t border-fuji-line">
                        {selectedProduct.specs?.load && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <MoveUp size={14} className="text-fuji-accent" /> Tải trọng
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right">
                              {selectedProduct.specs.load}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.speed && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <Zap size={14} className="text-fuji-accent" /> Tốc độ
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right">
                              {selectedProduct.specs.speed}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.pit && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <Cog size={14} className="text-fuji-accent" /> Hố Pit
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right">
                              {selectedProduct.specs.pit}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.oh && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <MoveUp size={14} className="text-fuji-accent" /> OH
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right">
                              {selectedProduct.specs.oh}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.travel && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <Globe size={14} className="text-fuji-accent" /> Hành trình
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right">
                              {selectedProduct.specs.travel}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.stops && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <Zap size={14} className="text-fuji-accent" /> Điểm dừng
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right">
                              {selectedProduct.specs.stops}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.door && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <Cog size={14} className="text-fuji-accent" /> Cửa mở
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right max-w-sm">
                              {selectedProduct.specs.door}
                            </p>
                          </div>
                        )}
                        {selectedProduct.specs?.structure && (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 border-b border-fuji-line gap-2">
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-3 shrink-0 sm:mt-1">
                              <Globe size={14} className="text-fuji-accent" /> Cấu trúc
                            </p>
                            <p className="font-bold text-sm lg:text-base text-fuji-blue sm:text-right max-w-sm">
                              {selectedProduct.specs.structure}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedProduct.cabin?.material && (
                        <div className="p-8 bg-fuji-line/50 border border-fuji-line rounded-[30px] mb-12 space-y-4">
                            <p className="text-[11px] font-black uppercase text-fuji-blue/50 mb-4 tracking-widest">Chi tiết cấu hình Cabin</p>
                            <div className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                              {selectedProduct.cabin.material}
                            </div>
                        </div>
                      )}

                      <button 
                        onClick={() => setShowQuoteForm(true)}
                        className="w-full shrink-0 py-6 bg-fuji-blue text-white rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-fuji-accent transition-all shadow-3xl shadow-fuji-blue/20 flex items-center justify-center gap-4 group"
                      >
                        NHẬN BÁO GIÁ ĐẶC QUYỀN <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
                      </button>
                    </>
                  )}
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
