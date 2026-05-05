import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getCachedSettings } from '../constants';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<any>(null);
  const [activeImage, setActiveImage] = React.useState(0);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.projects) {
        const found = data.content_dict.projects.find((p: any) => p.id.toString() === id);
        if (found) setProject(found);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-fuji-blue rounded-full animate-spin" />
      </div>
    );
  }

  const images = project.images || [project.image].filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-fuji-blue font-bold text-xs uppercase tracking-wider mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            {/* Hero Image Section */}
            <div className="relative w-full h-[50vh] lg:h-[70vh] bg-slate-900">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={images[activeImage]} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-10 left-10 right-10">
                <span className="px-4 py-2 bg-fuji-accent text-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
                  {project.type}
                </span>
                <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight mb-4 uppercase shadow-sm">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 text-white/80 font-bold tracking-wider">
                  <MapPin size={18} /> {project.location}
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-16 max-w-5xl mx-auto">
              <div className="mb-16">
                <h3 className="text-2xl font-black text-fuji-blue mb-6 uppercase tracking-tight">Về công trình này</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {images.length > 1 && (
                <div>
                  <h3 className="text-2xl font-black text-fuji-blue mb-8 uppercase tracking-tight">Thư viện ảnh</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setActiveImage(idx);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-fuji-accent shadow-md' : 'border-transparent hover:opacity-80'}`}
                      >
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}