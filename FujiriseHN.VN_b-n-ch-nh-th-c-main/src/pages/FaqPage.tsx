import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQS, getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';

export default function FaqPage() {
  const [faqs, setFaqs] = React.useState<any[]>(FAQS);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.faqs) {
        setFaqs(data.content_dict.faqs);
      }
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-24 md:py-32 max-w-4xl mx-auto px-6 w-full">
        <div className="text-center mb-16 mt-10">
          <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-4 block">HỎI ĐÁP</span>
          <h1 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter uppercase">Câu hỏi thường gặp</h1>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:border-fuji-accent/30 transition-colors" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
              <div className="flex justify-between items-center gap-4">
                <h4 className="font-bold text-fuji-blue">{faq.q}</h4>
                {openFaq === index ? <ChevronUp className="text-fuji-accent shrink-0" size={20} /> : <ChevronDown className="text-slate-400 shrink-0" size={20} />}
              </div>
              {openFaq === index && (
                <p className="mt-4 text-slate-500 font-medium leading-relaxed whitespace-pre-line">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <FloatingActions />
    </main>
  );
}