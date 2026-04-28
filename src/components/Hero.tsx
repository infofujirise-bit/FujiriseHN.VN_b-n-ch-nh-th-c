import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { supabase } from '../lib/supabase';

export default function Hero() {
  const [content, setContent] = React.useState({
    heroTitle: "NÂNG TẦM KHÔNG GIAN SỐNG",
    heroDesc: "Giải pháp thang máy gia đình hiện đại, an toàn và sang trọng bậc nhất. Kiến tạo đẳng cấp vượt trội cho không gian kiến trúc Việt.",
    heroImage: "https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=2000"
  });

  React.useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.web_content) {
        const wc = data.content_dict.web_content;
        setContent(prev => ({
          heroTitle: wc.heroTitle || prev.heroTitle,
          heroDesc: wc.heroDesc || prev.heroDesc,
          heroImage: wc.heroImage || prev.heroImage
        }));
      }
    };
    fetchContent();
  }, []);

  const formatTitle = (title: string) => {
    // Tách tiêu đề thành 3 dòng, nhấn mạnh dòng giữa
    const parts = title.split(' '); // "NÂNG TẦM KHÔNG GIAN SỐNG"
    const line1 = parts.slice(0, 2).join(' '); // NÂNG TẦM
    const highlight = parts.slice(2, 4).join(' '); // KHÔNG GIAN
    const rest = parts.slice(4).join(' '); // SỐNG

    return (
      <>
        <span className="block">{line1}</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuji-accent to-yellow-400 drop-shadow-[0_0_25px_rgba(197,160,89,0.6)] py-1">{highlight}</span>
        <span className="block">{rest}</span>
      </>
    );
  };

  return (
    <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={content.heroImage}
          alt="Modern Home Elevator"
          className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-[10s]"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-fuji-blue/80 via-transparent to-fuji-blue/80 z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-fuji-accent" />
            <span className="text-fuji-accent text-[10px] md:text-sm uppercase font-black tracking-[0.4em]">
              Fujirise Global Excellence
            </span>
            <div className="w-12 h-[1px] bg-fuji-accent" />
          </div>
          
          <h1 className="text-6xl md:text-[100px] font-black text-white leading-[1.1] md:leading-[1.15] tracking-tighter mb-10 drop-shadow-xl">
            {formatTitle(content.heroTitle)}
          </h1>
          
          <p className="text-white/80 text-lg md:text-2xl mb-14 leading-relaxed max-w-3xl mx-auto font-medium">
            {content.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#contact" className="px-12 py-5 bg-fuji-accent text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-fuji-dark transition-all rounded-[20px] shadow-2xl shadow-fuji-accent/20">
              YÊU CẦU TƯ VẤN THIẾT KẾ
            </a>
            <a href="#products" className="px-12 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-[20px]">
              BỘ SƯU TẬP 2026
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 cursor-pointer hidden md:flex flex-col items-center gap-3 z-20"
      >
        <span className="text-[9px] font-black uppercase tracking-widest">Khám phá tiếp</span>
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
