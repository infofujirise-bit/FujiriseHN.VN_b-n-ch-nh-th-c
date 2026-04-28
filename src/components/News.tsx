import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, Post } from '../lib/supabase';
import { ArrowRight, X, ExternalLink, ThumbsUp, MessageCircle, Facebook, Twitter, Linkedin, Link2, Clock, Quote, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sendToTelegram } from '../lib/telegram';

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

function CommentSection({ post, onNewComment }: { post: any, onNewComment: (c: any) => void }) {
  const { register, handleSubmit, reset } = useForm<{ name: string; content: string }>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const onSubmit = async (data: { name: string; content: string }) => {
    setIsSubmitting(true);
    const newComment = {
      id: Date.now().toString(),
      name: data.name,
      content: data.content,
      createdAt: new Date().toISOString(),
      isApproved: false
    };
    
    try {
      const { data: dbData } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (dbData?.content_dict?.posts) {
        const updatedPosts = dbData.content_dict.posts.map((p: any) => p.id === post.id ? { ...p, comments: [...(p.comments || []), newComment] } : p);
        await supabase.from('site_settings').update({ content_dict: { ...dbData.content_dict, posts: updatedPosts } }).eq('id', 'default');
        
        onNewComment(newComment);
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000);
        
        await sendToTelegram(`💬 <b>BÌNH LUẬN MỚI</b>\n----------------------------\n<b>Bài viết:</b> ${post.title}\n<b>Người gửi:</b> ${data.name}\n<b>Nội dung:</b> ${data.content}\n----------------------------\n<i>Vào Admin -> Tin tức & Sự kiện để duyệt bình luận.</i>`);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const approvedComments = (post.comments || []).filter((c: any) => c.isApproved);

  return (
    <div className="mt-12 pt-12 border-t border-slate-100">
      <h4 className="text-2xl font-black text-fuji-blue mb-8">Bình luận ({approvedComments.length})</h4>
      <div className="space-y-6 mb-10">
        {approvedComments.map((c: any) => (
          <div key={c.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-fuji-blue">{c.name}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</p>
          </div>
        ))}
        {approvedComments.length === 0 && <p className="text-sm text-slate-400 italic font-medium">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>}
      </div>
      <div className="bg-fuji-line/50 p-8 rounded-[30px] border border-slate-100">
        <h5 className="font-black text-fuji-blue mb-6">Gửi bình luận của bạn</h5>
        {success ? (
          <div className="p-4 bg-green-100 text-green-600 rounded-xl text-sm font-bold text-center">Đã gửi bình luận thành công! Vui lòng chờ quản trị viên phê duyệt.</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('name', { required: true })} placeholder="Họ và tên *" className="w-full px-5 py-4 rounded-xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-fuji-accent/20 bg-white" />
            <textarea {...register('content', { required: true })} placeholder="Nội dung bình luận *" rows={3} className="w-full px-5 py-4 rounded-xl border-none outline-none font-medium text-sm resize-none focus:ring-2 focus:ring-fuji-accent/20 bg-white" />
            <button disabled={isSubmitting} type="submit" className="px-8 py-4 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-all disabled:opacity-50">
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function News() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(selectedPost?.title || 'Tin tức Fujirise');
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        alert('Đã sao chép đường dẫn bài viết!');
        break;
    }
  };

  React.useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.posts && data.content_dict.posts.length > 0) {
        const sortedPosts = data.content_dict.posts.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(sortedPosts);
      } else {
        // Nếu Database chưa có bài viết nào, tự động hiển thị 10 bài mẫu trên Web
        const postData = [
          { title: "Triển lãm Công nghệ Thang máy Gia đình Quốc tế 2024", cat: "Sự kiện", sum: "Fujirise hân hạnh góp mặt tại triển lãm công nghệ lớn nhất năm với hệ sinh thái thang máy thông minh mới nhất." },
          { title: "Ra mắt dòng thang máy kính không hố pit hoàn toàn mới", cat: "Tin tức", sum: "Giải pháp đột phá cho nhà cải tạo: Thang máy kính 360 độ không yêu cầu đào sâu nền móng, giữ nguyên cấu trúc nhà." },
          { title: "Fujirise ký kết đối tác chiến lược với hãng linh kiện Nhật Bản", cat: "Hoạt động", sum: "Đánh dấu bước ngoặt trong việc nâng cấp tiêu chuẩn vật tư, đảm bảo độ bền bỉ và tuổi thọ trên 20 năm cho mỗi công trình." },
          { title: "Hội thảo: Giải pháp di chuyển an toàn cho người cao tuổi", cat: "Sự kiện", sum: "Cùng các chuyên gia y tế và kỹ sư phân tích tầm quan trọng của hệ thống cứu hộ tự động trong thang máy gia đình." },
          { title: "Cải tiến công nghệ ARD: Cứu hộ tự động thế hệ mới", cat: "Tin tức", sum: "Hệ thống UPS siêu tụ điện giúp thang máy tự động về bờ an toàn ngay cả khi sự cố mất điện kéo dài xảy ra." },
          { title: "Lễ bàn giao dự án thang máy nghệ thuật tại Vinhomes", cat: "Hoạt động", sum: "Fujirise hoàn thiện kiệt tác thang máy mạ vàng PVD, trở thành điểm nhấn xa hoa giữa không gian biệt thự tân cổ điển." },
          { title: "Ngày hội tri ân: Bảo dưỡng miễn phí, an tâm trọn đời", cat: "Sự kiện", sum: "Chương trình chăm sóc đặc biệt dành cho 500 khách hàng đầu tiên trong năm với gói bảo dưỡng chuyên sâu 12 bước." },
          { title: "Thang máy cá nhân hóa: Lên ngôi trong giới tinh hoa", cat: "Tin tức", sum: "Khám phá xu hướng tự thiết kế cabin thang máy theo phong thủy và gu thẩm mỹ độc bản của gia chủ." },
          { title: "Kỹ sư Fujirise hoàn thành khóa đào tạo tại Châu Âu", cat: "Hoạt động", sum: "Đội ngũ nòng cốt vừa trở về sau 3 tháng tu nghiệp, mang theo chuẩn mực lắp đặt thang máy gia đình khắt khe nhất." },
          { title: "Khai trương Showroom trải nghiệm thang máy thực tế ảo", cat: "Sự kiện", sum: "Khách hàng giờ đây có thể tự do phối màu, chọn vật liệu cabin bằng công nghệ VR ngay tại showroom mới của Fujirise." }
        ];
        const dummyPosts = postData.map((d, i) => ({
          id: Date.now() + i,
          title: d.title,
          category: d.cat,
          summary: d.sum,
          content: `Đây là nội dung chi tiết cho bài viết: **${d.title}**.\n\nSự kiện này đánh dấu sự phát triển vượt bậc của hệ sinh thái thang máy gia đình. Fujirise cam kết mang đến sự an toàn, thiết kế sang trọng và trải nghiệm dịch vụ xuất sắc.\n\n[img:1]\n\nKính mời quý khách hàng theo dõi thêm các hoạt động sắp tới của chúng tôi.`,
          images: [`https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=400&sig=${i}`, `https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=400&sig=${i+1}`, `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400&sig=${i+2}`],
          imageUrl: `https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=400&sig=${i}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }));
        setPosts(dummyPosts as Post[]);
      }
    };
    fetchPosts();
  }, []);

  if (posts.length === 0) {
    return null;
  }

  const handleLike = async (postId: number) => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.includes(postId)) return;

    setPosts(posts.map(p => p.id === postId ? { ...p, likes: ((p as any).likes || 0) + 1 } : p));
    if (selectedPost?.id === postId) setSelectedPost({ ...selectedPost, likes: ((selectedPost as any).likes || 0) + 1 } as any);
    
    likedPosts.push(postId);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

    const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
    if (data?.content_dict?.posts) {
      const updatedPosts = data.content_dict.posts.map((p: any) => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p);
      await supabase.from('site_settings').update({ content_dict: { ...data.content_dict, posts: updatedPosts } }).eq('id', 'default');
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const relatedPosts = selectedPost 
    ? posts.filter(p => p.category === selectedPost.category && p.id !== selectedPost.id).slice(0, 3) 
    : [];

  const categories = ['Tất cả', ...Array.from(new Set(posts.map(p => p.category)))];
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="news" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-fuji-accent mb-2 block">Updates & Activities</span>
            <h2 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter leading-tight">
              TIN TỨC <span className="text-slate-300">&</span> SỰ KIỆN
            </h2>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-fuji-blue hover:text-fuji-accent transition-colors">
            Xem tất cả <ArrowRight size={16} />
          </a>
        </div>

        {/* Bộ lọc & Tìm kiếm */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-fuji-blue text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 text-xs font-bold text-fuji-blue focus:border-fuji-blue focus:ring-2 focus:ring-fuji-blue/20 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPosts.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-400 font-bold italic">Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.</p>
            </div>
          )}
          {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-slate-100 group flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="h-32 md:h-40 rounded-xl overflow-hidden mb-3 relative flex gap-1">
                  {post.images && post.images.length > 1 ? (
                    <>
                      <img src={post.images[0]} alt={post.title} className="w-2/3 h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="w-1/3 flex flex-col gap-1">
                        <img src={post.images[1]} className="w-full h-1/2 object-cover group-hover:scale-105 transition-transform duration-500" />
                        {post.images[2] ? (
                          <img src={post.images[2]} className="w-full h-1/2 object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-1/2 bg-slate-50" />
                        )}
                      </div>
                    </>
                  ) : (
                    <img src={post.images?.[0] || post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2 py-0.5 bg-fuji-accent/10 text-fuji-accent rounded text-[9px] font-black uppercase tracking-wider">{post.category}</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <h4 className="font-serif font-bold text-slate-800 text-xs md:text-sm tracking-tighter leading-tight mb-2 line-clamp-2 group-hover:text-fuji-accent transition-colors">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-sans leading-snug line-clamp-3 mb-3 flex-1">
                  {post.summary}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1 text-[10px] font-bold"><ThumbsUp size={12} /> {(post as any).likes || 0}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold"><MessageCircle size={12} /> {((post as any).comments || []).filter((c: any) => c.isApproved).length}</span>
                    </div>
                  <span className="text-fuji-blue group-hover:text-fuji-accent transition-colors"><ArrowRight size={14} /></span>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Full Article Modal - Dạng Tờ Báo Hiện Đại */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl h-full md:h-[90vh] bg-white md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-white/50 backdrop-blur-md text-slate-800 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-50 shadow-lg">
                <X size={24} />
              </button>

              <div className="w-full h-full flex flex-col overflow-y-auto scroll-smooth">
                <div className="px-6 py-12 md:p-16 lg:p-24 bg-white relative z-10 w-full max-w-4xl mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <span className="px-4 py-1.5 bg-fuji-accent/10 text-fuji-accent rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPost.category}</span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-fuji-blue tracking-tighter leading-[1.15] mb-8 text-center">{selectedPost.title}</h1>
                  <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed text-center max-w-2xl mx-auto mb-10">{selectedPost.summary}</p>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-slate-100 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white text-fuji-blue border border-slate-100 rounded-full flex items-center justify-center shadow-md">
                        <svg viewBox="14 -151 112 152" className="w-4 h-4 fill-current">
                          <path d="M 46.078125 -125.8125 L 46.078125 -79.359375 L 123 -79.359375 L 123 -55.078125 L 46.078125 -55.078125 L 46.078125 0 L 14.609375 0 L 14.609375 -150.09375 L 125.453125 -150.09375 L 125.453125 -125.8125 Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-black text-fuji-blue text-sm uppercase tracking-widest">Fujirise Editorial</p>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          <span>{new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="flex items-center gap-1"><Clock size={12}/> 5 phút đọc</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Chia sẻ:</span>
                      <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-slate-50 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all"><Facebook size={16} /></button>
                      <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-slate-50 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all"><Twitter size={16} /></button>
                      <button onClick={() => handleShare('linkedin')} className="w-10 h-10 rounded-full bg-slate-50 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all"><Linkedin size={16} /></button>
                      <button onClick={() => handleShare('copy')} className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"><Link2 size={16} /></button>
                    </div>
                  </div>

                  {selectedPost.images && selectedPost.images.length > 0 && !selectedPost.content?.includes('[img:1]') && (
                    <figure className="mb-12">
                      <img src={selectedPost.images[0]} alt="Cover" className="w-full rounded-3xl shadow-xl object-cover max-h-[600px]" />
                    </figure>
                  )}

                  <div className="w-full">
                      {(selectedPost.content || selectedPost.summary).split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={idx} className="h-2" />;
                        
                        const imgMatch = trimmed.match(/^\[img:(\d+)\]/i);
                        if (imgMatch) {
                          const imgIndex = parseInt(imgMatch[1]) - 1;
                          const caption = imgMatch[2].trim();
                          const imgSrc = selectedPost.images?.[imgIndex];
                          
                          if (imgSrc) {
                            return (
                              <figure key={idx} className="my-8 flex flex-col items-center">
                                <img src={imgSrc} alt={caption || 'Illustration'} className="w-full max-w-4xl rounded-2xl shadow-lg object-cover" />
                                {caption && (
                                  <figcaption className="text-center text-sm font-medium text-slate-500 italic mt-4 px-6 border-l-2 border-fuji-accent py-1">
                                    {caption}
                                  </figcaption>
                                )}
                              </figure>
                            );
                          }
                          return null;
                        }

                        if (trimmed.startsWith('>')) {
                          return (
                            <blockquote key={idx} className="my-6 pl-5 md:pl-8 border-l-4 border-fuji-accent bg-slate-50 py-4 pr-4 rounded-r-2xl">
                              <Quote size={24} className="text-fuji-accent/30 mb-2" />
                              <p className="text-lg md:text-xl italic font-medium text-slate-700 leading-[1.6]">{trimmed.substring(1).trim()}</p>
                            </blockquote>
                          );
                        }

                        if (/^\d+\.\s+/.test(trimmed)) {
                          return <h3 key={idx} className="text-2xl md:text-3xl font-black text-fuji-blue mt-8 mb-4 leading-tight tracking-tight">{trimmed}</h3>;
                        }
                        
                        if (/^\d+\.\d+\.\s+/.test(trimmed)) {
                          return <h4 key={idx} className="text-xl md:text-2xl font-bold text-fuji-blue mt-6 mb-3 leading-tight tracking-tight">{trimmed}</h4>;
                        }
                        
                        return <p key={idx} className="text-slate-700 text-[1.05rem] md:text-[1.1rem] font-medium leading-[1.6] mb-4">{renderText(trimmed)}</p>;
                      })}
                  </div>
                    
                  <div className="flex flex-col md:flex-row items-center justify-between mt-16 pt-8 border-t border-slate-200 gap-6">
                    <button 
                      onClick={() => handleLike(selectedPost.id)}
                      className={`flex items-center gap-3 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg ${
                        JSON.parse(localStorage.getItem('likedPosts') || '[]').includes(selectedPost.id)
                        ? 'bg-fuji-blue text-white'
                        : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-fuji-blue hover:text-fuji-blue'
                      }`}
                    >
                      <ThumbsUp size={18} /> Đã Hữu Ích ({(selectedPost as any).likes || 0})
                    </button>

                    {selectedPost.link && (
                      <a href={selectedPost.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-10 py-4 bg-fuji-accent text-white hover:bg-fuji-blue rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1">
                        <ExternalLink size={18} /> Link Sản Phẩm Liên Quan
                      </a>
                    )}
                  </div>

                  <CommentSection 
                    post={selectedPost} 
                    onNewComment={(newComment) => {
                      const updatedPost = { ...selectedPost, comments: [...((selectedPost as any).comments || []), newComment] };
                      setSelectedPost(updatedPost as Post);
                      setPosts(posts.map(p => p.id === updatedPost.id ? (updatedPost as Post) : p));
                    }} 
                  />

                  {relatedPosts.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-slate-200 pb-8">
                      <h3 className="text-2xl font-black text-fuji-blue mb-8 uppercase tracking-tight">Bài viết liên quan</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {relatedPosts.map(rp => (
                          <div key={rp.id} onClick={() => setSelectedPost(rp)} className="cursor-pointer group">
                            <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
                              <img src={rp.images?.[0] || rp.imageUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                              <span className="text-fuji-accent">{rp.category}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span>{new Date(rp.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <h4 className="font-black text-fuji-blue leading-snug line-clamp-2 group-hover:text-fuji-accent transition-colors">{rp.title}</h4>
                          </div>
                        ))}
                      </div>
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