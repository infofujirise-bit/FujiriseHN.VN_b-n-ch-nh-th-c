import React from 'react';
import { ShieldCheck, Target, Eye } from 'lucide-react';
import { getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';

export default function About() {
  const [aboutImage, setAboutImage] = React.useState('https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80&w=1000');

  React.useEffect(() => {
    const fetchImage = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.web_content?.aboutImage) {
        setAboutImage(data.content_dict.web_content.aboutImage);
      }
    };
    fetchImage();
  }, []);

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-4 block">Về chúng tôi</span>
            <h2 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter leading-tight mb-8 uppercase">
              Sứ mệnh <span className="text-slate-300">&</span> Tầm nhìn
            </h2>
            
            <div className="space-y-10">
              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-fuji-blue shrink-0 group-hover:bg-fuji-accent group-hover:text-white transition-all duration-300 shadow-sm">
                  <Target size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Sứ mệnh</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Trở thành biểu tượng của sự tinh tế trong không gian sống cao cấp, nơi mọi chi tiết đều đạt đến chuẩn mực mà sự thanh lịch trở thành điều hiển nhiên.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-fuji-blue shrink-0 group-hover:bg-fuji-accent group-hover:text-white transition-all duration-300 shadow-sm">
                  <Eye size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Tầm nhìn</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Kiến tạo những hệ thống thang máy tinh tế, nơi công nghệ, thiết kế và cảm xúc hòa quyện để nâng tầm trải nghiệm sống trong từng chuyển động.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-fuji-blue shrink-0 group-hover:bg-fuji-accent group-hover:text-white transition-all duration-300 shadow-sm">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Giá trị cốt lõi</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    An toàn tuyệt đối - Trách nhiệm tận tâm - Sáng tạo không ngừng - Đồng hành trọn đời.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-fuji-accent/10 translate-x-4 translate-y-4 rounded-[40px] -z-10" />
            <img 
              src={aboutImage} 
              alt="Fujirise Sứ mệnh và Tầm nhìn" 
              className="w-full h-auto object-cover rounded-[40px] shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}