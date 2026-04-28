import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, Post } from '../lib/supabase';
import { ArrowRight, X, ExternalLink } from 'lucide-react';

function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images?.length]);

  if (!images || images.length === 0) return <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Không có ảnh</div>;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      <AnimatePresence mode="wait">
        <motion.img key={index} src={images[index]} alt={`${title} - ${index + 1}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full object-contain bg-slate-50" />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-fuji-accent w-4' : 'bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function News() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.posts && data.content_dict.posts.length > 0) {
        const sortedPosts = data.content_dict.posts.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(sortedPosts);
      }
    };
    fetchPosts();
  }, []);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="news" className="py-24 bg-fuji-line">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-6 block">Updates & Activities</span>
          <h2 className="text-5xl md:text-7xl font-black text-fuji-blue tracking-tighter leading-tight">
            TIN TỨC & <span className="text-slate-300">SỰ KIỆN</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden group flex flex-col"
            >
              <div className="h-56 overflow-hidden relative">
                <img src={post.images?.[0] || post.imageUrl} alt={post.title} className="w-full h-full object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-fuji-accent/10 text-fuji-accent rounded-full text-[9px] font-black uppercase tracking-widest">{post.category}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <h3 className="text-lg font-black text-fuji-blue tracking-tight mb-3 flex-1 group-hover:text-fuji-accent transition-colors">{post.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">{post.summary}</p>
                <button onClick={() => setSelectedPost(post)} className="mt-auto flex items-center gap-2 text-fuji-blue text-[10px] font-black uppercase tracking-widest group-hover:text-fuji-accent group-hover:gap-4 transition-all">
                  Xem chi tiết <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Article Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} className="absolute inset-0 bg-fuji-blue/95 backdrop-blur-xl" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-6xl h-[90vh] lg:h-[85vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
              <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 bg-white/50 lg:bg-fuji-blue backdrop-blur-md text-fuji-blue lg:text-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-50 shadow-xl">
                <X size={24} />
              </button>

              <div className="w-full lg:w-1/2 h-[40%] lg:h-full relative shrink-0">
                <ImageCarousel images={selectedPost.images?.length ? selectedPost.images : (selectedPost.imageUrl ? [selectedPost.imageUrl] : [])} title={selectedPost.title} />
              </div>

              <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col overflow-y-auto bg-white relative z-10">
                <div className="max-w-2xl mx-auto w-full">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-2 bg-fuji-accent/10 text-fuji-accent rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPost.category}</span>
                    <span className="text-xs text-slate-400 font-bold">{new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-fuji-blue tracking-tighter leading-tight mb-8">{selectedPost.title}</h2>
                  <div className="text-slate-600 text-base md:text-lg font-medium leading-relaxed whitespace-pre-line pb-12">
                    {selectedPost.content || selectedPost.summary}
                  </div>
                  
                  {selectedPost.link && (
                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-start gap-4 pb-12">
                      <a href={selectedPost.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-4 bg-fuji-line text-fuji-blue hover:bg-fuji-blue hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <ExternalLink size={16} /> Nguồn / Bài viết gốc
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}