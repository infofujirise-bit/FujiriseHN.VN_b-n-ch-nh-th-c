import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, User, Phone, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useForm } from 'react-hook-form';
import { sendToTelegram } from '../lib/telegram';

const DEFAULT_CONFIGS = [
  {
    id: 'gold',
    name: 'Luxury Gold',
    subtitle: 'Premium Finish',
    primary: '#C5A059',
    bg: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200',
    description: 'Chất liệu Inox gương vàng PVD cao cấp, họa tiết vân mây sang trọng.'
  },
  {
    id: 'glass',
    name: 'Modern Glass',
    subtitle: 'Panoramic View',
    primary: '#A0A0A0',
    bg: 'https://images.unsplash.com/photo-1518177581177-380e2270dd7a?auto=format&fit=crop&q=80&w=1200',
    description: 'Vách kính cường lực panorama, ôm trọn tầm nhìn và ánh sáng tự nhiên.'
  },
  {
    id: 'silver',
    name: 'Classic Silver',
    subtitle: 'Standard Edition',
    primary: '#64748b',
    bg: 'https://images.unsplash.com/photo-1544427920-c49ccf08c334?auto=format&fit=crop&q=80&w=1200',
    description: 'Inox sọc nhuyễn tinh tế, bền bỉ với thời gian, dễ dàng vệ sinh.'
  }
];

export default function Configurator() {
  const [configs, setConfigs] = React.useState(DEFAULT_CONFIGS);
  const [active, setActive] = React.useState(DEFAULT_CONFIGS[0]);
  const [showForm, setShowForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const message = `Yêu cầu Catalogue Nội thất: ${active.name}`;
      await supabase.from('leads').insert([{ name: data.name, phone: data.phone, message, status: 'new' }]);
      await sendToTelegram(`
🔥 <b>YÊU CẦU CATALOGUE</b>
----------------------------
<b>Họ tên:</b> ${data.name}
<b>Điện thoại:</b> ${data.phone}
<b>Mẫu quan tâm:</b> ${active.name}
----------------------------
<i>Hệ thống tự động thông báo.</i>
      `);
      setIsSuccess(true);
      setTimeout(() => { 
        setIsSuccess(false); 
        setShowForm(false); 
        reset(); 
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const loadConfigs = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.configurator && data.content_dict.configurator.length > 0) {
        setConfigs(data.content_dict.configurator);
        setActive(data.content_dict.configurator[0]);
      }
    };
    loadConfigs();
  }, []);

  return (
    <section className="py-24 bg-fuji-blue overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Visual Showcase */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="relative aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(197,160,89,0.2)] border-4 border-fuji-accent/20"
              >
                <img 
                  src={active.bg} 
                  alt={active.name} 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200' }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fuji-blue via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-fuji-accent text-xs font-bold uppercase tracking-wider mb-2">Đang trình diễn</p>
                    <h3 className="text-white text-3xl font-black">{active.name}</h3>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-[450px]">
            <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-4 block">Tính năng đặc biệt</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8 uppercase">
              BỘ MÔ PHỎNG <br /><span className="text-fuji-accent italic">NỘI THẤT</span>
            </h2>
            <p className="text-white/60 mb-10 font-medium">Tùy chọn phong cách thiết kế phù hợp với kiến trúc ngôi nhà của bạn. Trải nghiệm không gian thang máy ảo ngay lập tức.</p>

            <div className="space-y-4">
              {configs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setActive(config)}
                  className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition-all duration-300 text-left ${
                    active.id === config.id 
                    ? 'border-fuji-accent bg-fuji-accent/10' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-xl shadow-inner border border-white/20" 
                        style={{ backgroundColor: config.primary }} 
                    />
                    <div>
                        <h4 className={`font-black text-sm uppercase tracking-widest ${active.id === config.id ? 'text-fuji-accent' : 'text-white'}`}>
                            {config.name}
                        </h4>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">{config.subtitle || 'Premium Finish'}</p>
                    </div>
                  </div>
                  {active.id === config.id && (
                    <div className="w-6 h-6 bg-fuji-accent rounded-full flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowForm(true)}
              className="mt-8 w-full py-4 bg-white text-fuji-blue rounded-xl font-black text-xs uppercase tracking-widest hover:bg-fuji-accent hover:text-white transition-all flex items-center justify-center gap-3"
            >
                NHẬN CATALOGUE MẪU NỘI THẤT <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-fuji-blue/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-fuji-blue transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-fuji-accent mb-2 block">Catalogue Request</span>
                <h3 className="text-2xl font-black text-fuji-blue tracking-tighter">Nhận Catalogue</h3>
                <p className="text-slate-400 font-medium mt-2 text-sm">Mẫu nội thất: <span className="text-fuji-blue font-black">{active.name}</span></p>
              </div>

              {!isSuccess ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><User size={12} /> Họ và tên *</label>
                    <input 
                      {...register('name', { required: true })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-5 py-3 rounded-2xl bg-fuji-line border-transparent focus:bg-white focus:border-fuji-accent outline-none transition-all font-bold text-fuji-blue text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Phone size={12} /> Số điện thoại *</label>
                    <input 
                      {...register('phone', { required: true })}
                      placeholder="0987 654 321"
                      className="w-full px-5 py-3 rounded-2xl bg-fuji-line border-transparent focus:bg-white focus:border-fuji-accent outline-none transition-all font-bold text-fuji-blue text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all mt-6 ${isSubmitting ? "bg-slate-100 text-slate-400" : "bg-fuji-blue text-white hover:bg-fuji-accent shadow-xl shadow-fuji-blue/20"}`}
                  >
                    {isSubmitting ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
                  </button>
                </form>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-fuji-blue mb-2">Đã Gửi Thành Công!</h4>
                  <p className="text-slate-500 font-medium text-sm">Chúng tôi sẽ gửi Catalogue mẫu {active.name} qua Zalo/Email cho bạn sớm nhất.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
