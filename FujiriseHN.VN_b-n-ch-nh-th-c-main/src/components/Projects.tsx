// Đã kiểm tra và đồng bộ - Component Danh sách Công Trình
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, ArrowRight, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';

function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) setCurrentIndex(Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 group/carousel">
      <div ref={scrollRef} onScroll={handleScroll} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {images.map((img, i) => (
          <div key={i} className="w-full h-full shrink-0 snap-center relative">
            <img src={img} alt={`${title} - ${i + 1}`} className="w-full h-full object-cover bg-slate-50" loading="lazy" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); scroll('left'); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white text-white hover:text-fuji-blue rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all z-20 shadow-lg"><ChevronLeft size={24} /></button>
          <button onClick={(e) => { e.stopPropagation(); scroll('right'); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white text-white hover:text-fuji-blue rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all z-20 shadow-lg"><ChevronRight size={24} /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); if (scrollRef.current) scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' }); }} className={`w-2 h-2 rounded-full transition-all duration-300 shadow-md ${i === currentIndex ? 'bg-fuji-accent w-6' : 'bg-white/60 hover:bg-white'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = React.useState<any>(null);
  const [projects, setProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.projects && data.content_dict.projects.length > 0) {
        setProjects(data.content_dict.projects);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-24 md:py-32 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-4 block">Dự án tiêu biểu</span>
          <h2 className="text-4xl md:text-6xl font-black text-fuji-blue tracking-tighter leading-tight uppercase">
            CÔNG TRÌNH <span className="text-slate-300">THỰC TẾ</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed mt-6">
            Chiêm ngưỡng những kiệt tác di chuyển được Fujirise kiến tạo và lắp đặt tại các không gian kiến trúc đẳng cấp nhất Việt Nam.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => setSelectedProject(project)}
              className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer group"
            >
              <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={project.images?.[0] || project.image} 
                  alt={project.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 z-20">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-fuji-blue rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    {project.type}
                  </span>
                </div>
                <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-fuji-accent text-white rounded-full flex items-center justify-center shadow-xl">
                    <ArrowRight size={20} className="-rotate-45" />
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-2 text-fuji-accent text-xs font-bold uppercase tracking-wider mb-4">
                  <MapPin size={16} /> {project.location}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-fuji-blue mb-4 tracking-tight leading-snug group-hover:text-fuji-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-white/80 backdrop-blur-md text-slate-800 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-50 shadow-lg">
                <X size={24} />
              </button>

              <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 h-[40%] md:h-full relative shrink-0">
                  {selectedProject.images && selectedProject.images.length > 0 ? (
                    <ImageCarousel images={selectedProject.images} title={selectedProject.title} />
                  ) : (
                    <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-fuji-blue/80 via-transparent to-transparent pointer-events-none z-10" />
                  <div className="absolute bottom-8 left-8 right-8 text-white z-20 pointer-events-none">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
                      {selectedProject.type}
                    </span>
                    <h3 className="text-3xl font-black tracking-tight leading-tight">{selectedProject.title}</h3>
                  </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-slate-50 flex flex-col">
                  <div className="flex items-center gap-2 text-fuji-accent text-sm font-bold uppercase tracking-wider mb-6">
                    <MapPin size={18} /> {selectedProject.location}
                  </div>
                  
                  <div className="prose prose-slate max-w-none mb-10 flex-1">
                    <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
                      {selectedProject.description}
                    </p>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-8 space-y-4">
                      <h4 className="font-black text-fuji-blue uppercase tracking-wider text-sm flex items-center gap-2">
                        <Images size={16} className="text-fuji-accent" /> Chi tiết công trình
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Đây là dự án tiêu biểu được đội ngũ kỹ sư Fujirise trực tiếp tư vấn, thiết kế và thi công lắp đặt. Công trình đáp ứng các tiêu chuẩn khắt khe nhất về an toàn và thẩm mỹ, hài hòa tuyệt đối với không gian kiến trúc tổng thể.
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-200 mt-auto">
                    <Link 
                      to="/#contact" 
                      className="w-full py-5 bg-fuji-blue text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-fuji-accent transition-all shadow-xl shadow-fuji-blue/20 flex items-center justify-center gap-3 group"
                    >
                      LIÊN HỆ TƯ VẤN DỰ ÁN TƯƠNG TỰ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}