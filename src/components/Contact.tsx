import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { sendToTelegram } from '../lib/telegram';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

type FormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [companyInfo, setCompanyInfo] = React.useState({
    hotline: CONTACT_INFO.hotline,
    address: CONTACT_INFO.address,
    mapIframeSrc: `https://maps.google.com/maps?q=${encodeURIComponent(CONTACT_INFO.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
    mapShareLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`
  });

  React.useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.web_content) {
        const wc = data.content_dict.web_content;
        setCompanyInfo({
          hotline: wc.hotline || CONTACT_INFO.hotline,
          address: wc.address || CONTACT_INFO.address,
          mapIframeSrc: wc.mapIframeSrc || `https://maps.google.com/maps?q=${encodeURIComponent(wc.address || CONTACT_INFO.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          mapShareLink: wc.mapShareLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wc.address || CONTACT_INFO.address)}`
        });
      }
    };
    fetchContent();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Supabase
      const { error: supabaseError } = await supabase
        .from('leads')
        .insert([
          { 
            name: data.name, 
            phone: data.phone, 
            email: data.email, 
            message: data.message,
            status: 'new'
          }
        ]);

      if (supabaseError) throw supabaseError;

      // 2. Send to Telegram
      const telegramMessage = `
🔥 <b>LEAD MỚI TỪ WEBSITE FUJIRISE</b>
----------------------------
<b>Họ tên:</b> ${data.name}
<b>Điện thoại:</b> ${data.phone}
<b>Email:</b> ${data.email || 'Không có'}
<b>Nội dung:</b> ${data.message}
----------------------------
<i>Hệ thống tự động thông báo & Đã lưu vào Supabase.</i>
      `;
      
      await sendToTelegram(telegramMessage);
      
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Contact error:', error);
      // alert("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-white relative">
      {/* Background decoration */}
      <div className="absolute left-0 bottom-0 w-1/3 h-px bg-slate-100" />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Info Side */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-6 block"
            >
              Consultation
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-fuji-blue tracking-tighter leading-tight mb-10"
            >
              YÊU CẦU <br/><span className="text-slate-300">TƯ VẤN</span>
            </motion.h2>
            <p className="text-slate-500 mb-12 text-lg leading-relaxed max-w-md font-medium">
              Đội ngũ chuyên gia của Fujirise luôn sẵn sàng hỗ trợ bạn để tìm ra giải pháp thang máy hoàn mỹ nhất cho ngôi nhà của bạn.
            </p>

            <div className="space-y-10">
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-fuji-line text-fuji-blue rounded-full flex items-center justify-center group-hover:bg-fuji-accent group-hover:text-white transition-all shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hotline Chăm </h4>
                  <p className="text-fuji-blue font-black text-2xl tracking-tighter">{companyInfo.hotline}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-fuji-line text-fuji-blue rounded-full flex items-center justify-center group-hover:bg-fuji-accent group-hover:text-white transition-all shadow-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Văn phòng</h4>
                  <p className="text-fuji-blue font-black text-lg tracking-tight leading-tight">{companyInfo.address.split(',')[0]}</p>
                  <p className="text-slate-400 text-xs font-medium">{companyInfo.address.split(',').slice(1).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="relative">
            <div className="bg-fuji-blue p-10 md:p-14 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Họ và tên *</label>
                    <input
                      {...register("name", { required: true })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-fuji-accent focus:bg-white/10 focus:ring-4 focus:ring-fuji-accent/20 outline-none transition-all font-bold text-white placeholder:text-white/20 backdrop-blur-sm"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Số điện thoại *</label>
                    <input
                      {...register("phone", { required: true })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-fuji-accent focus:bg-white/10 focus:ring-4 focus:ring-fuji-accent/20 outline-none transition-all font-bold text-white placeholder:text-white/20 backdrop-blur-sm"
                      placeholder="0868 822 210"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Yêu cầu của bạn</label>
                  <textarea
                    {...register("message")}
                    rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-fuji-accent focus:bg-white/10 focus:ring-4 focus:ring-fuji-accent/20 outline-none transition-all resize-none font-bold text-white placeholder:text-white/20 backdrop-blur-sm"
                    placeholder="Tôi muốn báo giá thang máy..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all duration-300",
                isSubmitting ? "bg-white/10 text-white/30" : "bg-fuji-accent text-white hover:bg-white hover:text-fuji-blue shadow-[0_0_40px_rgba(197,160,89,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] hover:-translate-y-1"
                  )}
                >
                  {isSubmitting ? "SENDING..." : (
                    <>GỬI YÊU CẦU NGAY <ArrowRight size={20} strokeWidth={3} /></>
                  )}
                </button>
              </form>

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, scale: 1, backdropFilter: "blur(16px)" }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-fuji-blue/90 flex flex-col items-center justify-center text-center p-8 z-20 rounded-[40px] border border-white/10"
              >
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 text-white shadow-[0_0_50px_rgba(74,222,128,0.5)] rounded-full flex items-center justify-center mb-8"
                >
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </motion.div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tight">Gửi Thành Công!</h3>
                <p className="text-white/70 font-medium text-lg leading-relaxed max-w-sm">
                  Cảm ơn bạn đã tin tưởng Fujirise. <br />
                  Đội ngũ chuyên viên sẽ liên hệ lại trong vòng 15 phút.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
