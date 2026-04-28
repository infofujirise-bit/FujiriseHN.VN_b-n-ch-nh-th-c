import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Products from '../components/Products';
import Contact from '../components/Contact';
import Careers from '../components/Careers';
import FAQ from '../components/FAQ';
import Configurator from '../components/Configurator';
import News from '../components/News';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [aboutImage, setAboutImage] = React.useState("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000");

  React.useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.web_content?.aboutImage) {
        setAboutImage(data.content_dict.web_content.aboutImage);
      }
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Products />
      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <img 
                src={aboutImage} 
                alt="Fujirise Office" 
                className="rounded-[40px] shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuji-accent/10 rounded-full blur-3xl z-0" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-fuji-blue/5 rounded-[60px] z-0" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-fuji-accent mb-6 block">Về chúng tôi</span>
              <h2 className="text-5xl md:text-7xl font-black text-fuji-blue tracking-tighter leading-[1.1] mb-10">
                THIẾT LẬP <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500 italic pr-2">
                  TIÊU CHUẨN SỐNG
                </span>
              </h2>
              <p className="text-slate-600 text-xl font-medium leading-relaxed mb-8">
                Fujirise không chỉ kiến tạo giải pháp di động, chúng tôi định hình phong cách sống hiện đại và an tâm bậc nhất cho mọi gia đình Việt.
              </p>
              <div className="flex gap-12 border-t border-slate-100 pt-10">
                <div>
                  <p className="text-3xl font-black text-fuji-blue">Tín nhiệm</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Linh kiện Nhập khẩu</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-fuji-blue">Tận tâm</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Hỗ trợ kỹ thuật</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-fuji-line p-12 rounded-[40px] group hover:bg-fuji-blue transition-colors duration-500 shadow-sm hover:shadow-2xl"
            >
              <div className="w-12 h-1 bg-fuji-accent mb-8 group-hover:w-24 transition-all" />
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-fuji-accent mb-6">Sứ mệnh</h3>
              <p className="text-2xl font-black text-fuji-blue group-hover:text-white leading-tight mb-6 tracking-tighter">
                Setting the Standard for Living <br/>
                <span className="text-fuji-accent italic">Thiết lập tiêu chuẩn sống</span>
              </p>
              <p className="text-slate-500 group-hover:text-white/60 font-medium leading-relaxed">
                Mang đến những giải pháp thang máy an toàn, bền bỉ và dễ tiếp cận, góp phần thiết lập một chuẩn mực sống tiện nghi cho mọi gia đình.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-fuji-blue p-12 rounded-[40px] relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuji-accent/10 rounded-bl-full" />
              <div className="w-12 h-1 bg-fuji-accent mb-8" />
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-fuji-accent mb-6">Tầm nhìn</h3>
              <p className="text-3xl font-black text-white leading-tight mb-8 tracking-tighter">
                Định hình tiêu chuẩn sống <br/>
                <span className="text-fuji-accent italic">hiện đại tại Việt Nam</span>
              </p>
              <p className="text-white/60 font-medium leading-relaxed">
                Trở thành thương hiệu tiên phong trong việc định hình tiêu chuẩn sống hiện đại tại Việt Nam, nơi tiện nghi không còn là đặc quyền mà là điều hiển nhiên.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Configurator />
      <News />
      <FAQ />
      <Careers />
      <Contact />
      <Footer />
      <FloatingActions />
    </main>
  );
}
