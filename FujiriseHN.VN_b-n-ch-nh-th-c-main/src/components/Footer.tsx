import React from 'react';
import { Facebook, MessageCircle, MapPin, Instagram, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CONTACT_INFO, NAVIGATION, getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';

export default function Footer() {
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
  const [warrantyContent, setWarrantyContent] = React.useState({ content: '', monthsOverall: '12 Tháng', yearsMotor: '5 Năm', yearsCable: '10 Năm' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
        window.history.pushState(null, '', href);
      } else {
        navigate(href);
      }
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.web_content) {
        const wc = data.content_dict.web_content;
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
        setWarrantyContent({
          content: data.content_dict.warranty.content || '',
          monthsOverall: data.content_dict.warranty.monthsOverall || '12 Tháng',
          yearsMotor: data.content_dict.warranty.yearsMotor || '5 Năm',
          yearsCable: data.content_dict.warranty.yearsCable || '10 Năm'
        });
      }
    };
    fetchData();
  }, []);

  const formatHotline = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
    return phone;
  };

  return (
    <footer className="bg-fuji-blue text-white pt-16 pb-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuji-accent to-transparent opacity-30" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuji-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
          {/* Company Info & Socials */}
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-bold uppercase tracking-wider text-fuji-accent mb-6">CÔNG TY TNHH FUJIRISE</h4>
              <div className="space-y-4 text-slate-400 text-sm font-medium leading-relaxed">
                <p>MST: <span className="text-white/80">0111416765</span></p>
                <p>Hotline: <a href={`tel:${companyInfo.hotline}`} className="hover:text-fuji-accent transition-colors text-white/80 font-bold">{formatHotline(companyInfo.hotline)}</a></p>
                <p>Email: <a href={`mailto:${companyInfo.email}`} className="hover:text-fuji-accent transition-colors text-white/80">{companyInfo.email}</a></p>
                <p>Địa chỉ: <span className="text-white/80">{companyInfo.address}</span></p>
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t border-white/5">
              <a href={companyInfo.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:scale-110 hover:shadow-[0_0_20px_rgba(197,160,89,0.4)]">
                <Facebook size={16} />
              </a>
              <a href={companyInfo.zalo} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:scale-110 hover:shadow-[0_0_20px_rgba(197,160,89,0.4)]">
                <MessageCircle size={16} />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:scale-110 hover:shadow-[0_0_20px_rgba(197,160,89,0.4)]">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-8">Điều hướng</h4>
            <nav className="flex flex-col gap-4">
              {NAVIGATION.map(item => (
                <div key={item.name} className="flex flex-col gap-2">
                  {item.href.startsWith('/#') ? (
                    <a href={item.href} onClick={(e) => handleNavClick(e, item.href)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group/link">
                      <div className="w-1 h-1 bg-fuji-accent rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      {item.name}
                    </a>
                  ) : (
                    <Link to={item.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group/link">
                      <div className="w-1 h-1 bg-fuji-accent rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      {item.name}
                    </Link>
                  )}
                  {item.children && (
                    <div className="pl-4 flex flex-col gap-3 border-l border-white/10 ml-1 mt-2 mb-2">
                      {item.children.map(child => (
                        child.href.startsWith('/#') ? (
                          <a key={child.name} href={child.href} onClick={(e) => handleNavClick(e, child.href)} className="text-xs font-medium text-slate-500 hover:text-fuji-accent transition-colors">
                            {child.name}
                          </a>
                        ) : (
                          <Link key={child.name} to={child.href} className="text-xs font-medium text-slate-500 hover:text-fuji-accent transition-colors">
                            {child.name}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Services/Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-8">Hỗ trợ</h4>
            <nav className="flex flex-col gap-4">
              <a href="/#faq" onClick={(e) => handleNavClick(e, '/#faq')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Câu hỏi thường gặp</a>
              <a href="/#careers" onClick={(e) => handleNavClick(e, '/#careers')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cơ hội nghề nghiệp</a>
              <a href="/#contact" onClick={(e) => handleNavClick(e, '/#contact')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Yêu cầu báo giá</a>
              <button onClick={() => setShowWarranty(true)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors text-left flex items-center gap-2">
                Chính sách bảo hành
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
        </div>

        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <p>© {new Date().getFullYear()} fujirise.vn</p>
        </div>
      </div>

      {/* Warranty Modal */}
      <AnimatePresence>
        {showWarranty && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWarranty(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden text-slate-800">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                 <div className="flex items-center gap-4">
                   <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-fuji-accent mb-1 block">Thang máyFujirise </span>
                     <h3 className="text-2xl font-black text-fuji-blue uppercase tracking-tighter">Cam kết chất lượng</h3>
                   </div>
                 </div>
                 <button onClick={() => setShowWarranty(false)} className="w-10 h-10 bg-white text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm transition-colors"><X size={20} /></button>
               </div>
               <div className="p-8 md:p-12 overflow-y-auto bg-white">
                 <div className="grid md:grid-cols-3 gap-8 mb-16">
                   <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 hover:border-fuji-accent/30 transition-all group">
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Bảo hành toàn diện</p>
                     <h4 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter">{warrantyContent.monthsOverall}</h4>
                   </div>

                   <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 hover:border-fuji-accent/30 transition-all group">
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Cụm máy kéo (Động cơ)</p>
                     <h4 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter">{warrantyContent.yearsMotor}</h4>
                   </div>

                   <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 hover:border-fuji-accent/30 transition-all group">
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Hệ thống Ray & Cáp tải</p>
                     <h4 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter">{warrantyContent.yearsCable}</h4>
                   </div>
                 </div>
                 
                 <div className="relative p-10 md:p-12 bg-slate-50 rounded-[40px] border border-slate-100">
                   <div className="absolute top-0 left-10 md:left-12 -translate-y-1/2 bg-fuji-accent text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                     Điều khoản chi tiết
                   </div>
                   <div className="text-slate-600 text-lg md:text-[1.1rem] font-medium leading-[2] whitespace-pre-line pt-2">
                     {warrantyContent.content || 'Chưa có thông tin chính sách bảo hành.'}
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
