import React from 'react';
import { Facebook, MessageCircle, MapPin, Phone, Mail, Instagram, Youtube, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTACT_INFO, NAVIGATION } from '../constants';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [logo, setLogo] = React.useState('/logo.svg');
  const [companyInfo, setCompanyInfo] = React.useState({
    hotline: CONTACT_INFO.hotline,
    email: CONTACT_INFO.email,
    address: CONTACT_INFO.address,
    facebook: CONTACT_INFO.facebook,
    zalo: CONTACT_INFO.zalo,
    mapIframeSrc: `https://maps.google.com/maps?q=${encodeURIComponent(CONTACT_INFO.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
    mapShareLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`
  });
  const [showWarranty, setShowWarranty] = React.useState(false);
  const [warrantyContent, setWarrantyContent] = React.useState({ content: '', updatedAt: '' });

  React.useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.web_content) {
        const wc = data.content_dict.web_content;
        if (wc.logoImage) setLogo(wc.logoImage);
        setCompanyInfo({
          hotline: wc.hotline || CONTACT_INFO.hotline,
          email: wc.email || CONTACT_INFO.email,
          address: wc.address || CONTACT_INFO.address,
          facebook: wc.facebook || CONTACT_INFO.facebook,
          zalo: wc.zalo || CONTACT_INFO.zalo,
          mapIframeSrc: wc.mapIframeSrc || `https://maps.google.com/maps?q=${encodeURIComponent(wc.address || CONTACT_INFO.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          mapShareLink: wc.mapShareLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wc.address || CONTACT_INFO.address)}`
        });
      }
      if (data?.content_dict?.warranty) {
        setWarrantyContent(data.content_dict.warranty);
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="bg-fuji-blue text-white pt-24 pb-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuji-accent to-transparent opacity-30" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuji-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <a href="/" className="inline-block group">
              <img 
                src={logo} 
                alt="Fujirise Logo" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }}
                className="h-16 md:h-24 w-auto object-contain hover:scale-105 transition-transform duration-500 shadow-xl bg-white p-2.5 rounded-2xl"
              />
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Kiến tạo những giải pháp di chuyển thông minh, an toàn và sang trọng bậc nhất cho không gian kiến trúc Việt.
            </p>
            <div className="flex gap-4">
              <a href={companyInfo.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-white rounded-full flex items-center justify-center transition-all border border-white/10">
                <Facebook size={18} />
              </a>
              <a href={companyInfo.zalo} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-white rounded-full flex items-center justify-center transition-all border border-white/10">
                <MessageCircle size={18} />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-white rounded-full flex items-center justify-center transition-all border border-white/10">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-fuji-accent mb-8">Điều hướng</h4>
            <nav className="flex flex-col gap-4">
              {NAVIGATION.map(item => (
                <a key={item.name} href={item.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group/link">
                  <div className="w-1 h-1 bg-fuji-accent rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Services/Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-fuji-accent mb-8">Hỗ trợ</h4>
            <nav className="flex flex-col gap-4">
              <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Câu hỏi thường gặp</a>
              <a href="#careers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cơ hội nghề nghiệp</a>
              <a href="#contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Yêu cầu báo giá</a>
              <button onClick={() => setShowWarranty(true)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors text-left flex items-center gap-2">
                <ShieldCheck size={16} className="text-fuji-accent" /> Chính sách bảo hành
              </button>
            </nav>

            {/* Small Map inside Footer */}
            <div className="mt-8 relative h-32 rounded-2xl overflow-hidden group cursor-pointer border border-white/10 shadow-lg">
              <a href={companyInfo.mapShareLink} target="_blank" rel="noreferrer" className="absolute inset-0 z-20 flex items-center justify-center bg-fuji-blue/40 group-hover:bg-fuji-blue/60 transition-colors duration-500">
                <div className="bg-white text-fuji-blue px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <MapPin size={14} className="text-fuji-accent" /> Chỉ đường
                </div>
              </a>
              <iframe 
                src={companyInfo.mapIframeSrc}
                className="absolute inset-0 w-full h-full border-0 pointer-events-none grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Column */}
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-fuji-accent mb-6 leading-relaxed">CÔNG TY TRÁCH NHIỆM HỮU HẠ FUJIRISE</h4>
            <div className="space-y-4 flex-1 text-slate-400 text-sm font-medium leading-relaxed">
              <p>MST: <span className="text-white/80">0111416765</span> cấp ngày <span className="text-white/80">17/03/2026</span> bởi Sở Kế hoạch và Đầu tư Thành phố Hà Nội</p>
              <p>Hotline: <a href={`tel:${companyInfo.hotline}`} className="hover:text-fuji-accent transition-colors text-white/80 font-bold">{companyInfo.hotline}</a></p>
              <p>Email: <a href={`mailto:${companyInfo.email}`} className="hover:text-fuji-accent transition-colors text-white/80">{companyInfo.email}</a></p>
              <p>Địa chỉ: <span className="text-white/80">{companyInfo.address}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <p>© {new Date().getFullYear()} fujirise.vn</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>

      {/* Warranty Modal */}
      <AnimatePresence>
        {showWarranty && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWarranty(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden text-slate-800">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                     <ShieldCheck size={24} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-fuji-blue uppercase tracking-tighter">Chính sách bảo hành</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cập nhật: {warrantyContent.updatedAt || 'N/A'}</p>
                   </div>
                 </div>
                 <button onClick={() => setShowWarranty(false)} className="w-10 h-10 bg-white text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm transition-colors"><X size={20} /></button>
               </div>
               <div className="p-8 md:p-12 overflow-y-auto">
                 <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                   {warrantyContent.content || 'Chưa có thông tin chính sách bảo hành.'}
                 </div>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
