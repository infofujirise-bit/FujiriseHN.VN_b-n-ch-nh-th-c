import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { FAQS as DEFAULT_FAQS, getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function FAQ() {
  const [faqs, setFaqs] = React.useState(DEFAULT_FAQS);
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  React.useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.faqs && data.content_dict.faqs.length > 0) {
        setFaqs(data.content_dict.faqs);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <section id="faq" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuji-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-fuji-blue mx-auto mb-6 shadow-xl shadow-fuji-blue/5">
            <MessageCircleQuestion size={32} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-4 block">Hỏi & Đáp</span>
          <h2 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter uppercase mb-6">Câu hỏi thường gặp</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Giải đáp nhanh những thắc mắc phổ biến nhất về giải pháp thang máy gia đình cao cấp Fujirise.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={cn(
                "bg-white rounded-3xl transition-all duration-300 border",
                openIndex === index ? "border-fuji-accent/30 shadow-xl shadow-fuji-accent/5" : "border-slate-100 shadow-sm hover:border-fuji-blue/20 hover:shadow-md"
              )}
            >
              <button
                className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={cn(
                  "font-bold text-base md:text-lg pr-8 transition-colors",
                  openIndex === index ? "text-fuji-accent" : "text-fuji-blue"
                )}>
                  {faq.q}
                </span>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                  openIndex === index ? "bg-fuji-accent text-white rotate-180" : "bg-slate-50 text-slate-400"
                )}>
                  <ChevronDown size={20} />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-8 pb-8 pt-2 text-slate-600 font-medium leading-relaxed whitespace-pre-line border-t border-slate-50 mt-2">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}