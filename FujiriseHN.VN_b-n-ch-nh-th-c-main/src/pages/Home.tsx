import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Products from '../components/Products';
import Projects from '../components/Projects';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import News from '../components/News';
import Careers from '../components/Careers';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import { supabase } from '../lib/supabase';
import { getCachedSettings } from '../constants';

export default function Home() {
  const [theme, setTheme] = React.useState({ font: 'Montserrat', lineHeight: '1.6' });
  const [isReady, setIsReady] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const loadData = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.theme_settings) {
        const themeConfig = data.content_dict.theme_settings;
        setTheme({ font: themeConfig.font || 'Montserrat', lineHeight: themeConfig.lineHeight || '1.6' });
        
        const fontUrl = `https://fonts.googleapis.com/css2?family=${(themeConfig.font || 'Montserrat').replace(/ /g, '+')}:wght@400;500;700;900&display=swap`;
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
          const link = document.createElement('link');
          link.href = fontUrl; link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
      }
      // Thêm độ trễ nhỏ để phông chữ tải xong, tránh hiện tượng nhấp nháy chữ (FOUT)
      setTimeout(() => setIsReady(true), 50);
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (isReady) {
      if (location.hash) {
        const id = location.hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          }
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location.hash, isReady]);

  return (
    <main className={`min-h-screen flex flex-col transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: `"${theme.font}", sans-serif`, lineHeight: theme.lineHeight }}>
      <Navbar />
      <div className="flex-grow">
        <Hero />
        <About />
        <Products />
        <Projects />
        <News />
        <Careers />
        <FAQ />
        <Contact />
      </div>
      <Footer />
      <FloatingActions />
    </main>
  );
}
