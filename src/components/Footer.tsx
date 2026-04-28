import React from 'react';
import { Facebook, MessageCircle, MapPin, Phone, Mail, Instagram, Youtube } from 'lucide-react';
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
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Chính sách bảo hành</a>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-fuji-accent mb-6">Liên hệ</h4>
            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <Phone size={18} className="text-fuji-accent shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white/40 mb-1">Hotline</p>
                  <p className="font-bold text-sm">{companyInfo.hotline}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail size={18} className="text-fuji-accent shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white/40 mb-1">Email</p>
                  <p className="font-bold text-sm truncate">{companyInfo.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin size={18} className="text-fuji-accent shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white/40 mb-1">Trụ sở</p>
                  <p className="text-xs text-slate-400 leading-tight">{companyInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Small Map inside Footer */}
            <div className="mt-8 relative h-40 rounded-2xl overflow-hidden group cursor-pointer border border-white/10 shadow-lg">
              <a 
                href={companyInfo.mapShareLink}
                target="_blank" 
                rel="noreferrer"
                className="absolute inset-0 z-20 flex items-center justify-center bg-fuji-blue/40 group-hover:bg-fuji-blue/60 transition-colors duration-500"
              >
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

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <p>© {new Date().getFullYear()} Fujirise.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
