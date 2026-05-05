import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCachedSettings, DUMMY_POSTS } from '../constants';
import { supabase, Post } from '../lib/supabase';
import { ArrowLeft, Clock, ThumbsUp, ExternalLink, Facebook, Twitter, Linkedin, Link2, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sendToTelegram } from '../lib/telegram';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cn } from '../lib/utils';
import { clearSettingsCache } from '../constants';

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
        clearSettingsCache();
        
        onNewComment(newComment);
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000);
        
        await sendToTelegram(`💬 <b>BÌNH LUẬN MỚI</b>\n----------------------------\n<b>Bài viết:</b> ${post.title}\n<b>Người gửi:</b> ${data.name}\n<b>Nội dung:</b> ${data.content}\n----------------------------\n<i>Vào Admin -> Tin tức & Sự kiện để duyệt bình luận.</i>`, 'marketing');
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const approvedComments = (post.comments || []).filter((c: any) => c.isApproved);

  return (
    <div className="mt-16 pt-12 border-t border-slate-100">
      <h4 className="text-2xl font-bold text-slate-900 mb-8">Bình luận ({approvedComments.length})</h4>
      <div className="space-y-6 mb-10">
        {approvedComments.map((c: any) => (
          <div key={c.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-slate-900">{c.name}</span>
              <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{c.content}</p>
          </div>
        ))}
        {approvedComments.length === 0 && <p className="text-slate-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>}
      </div>
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <h5 className="font-bold text-slate-900 mb-6 text-lg">Viết bình luận</h5>
        {success ? (
          <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center border border-green-100">Đã gửi bình luận thành công! Vui lòng chờ phê duyệt.</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('name', { required: true })} placeholder="Họ và tên *" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-fuji-blue focus:ring-1 focus:ring-fuji-blue bg-slate-50/50" />
            <textarea {...register('content', { required: true })} placeholder="Nội dung bình luận *" rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-fuji-blue focus:ring-1 focus:ring-fuji-blue bg-slate-50/50" />
            <button disabled={isSubmitting} type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-fuji-blue transition-all disabled:opacity-50">
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = React.useState<Post | null>(null);
  const [allPosts, setAllPosts] = React.useState<Post[]>([]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      try {
        const { data } = await getCachedSettings(supabase);
        let postsToSearch = data?.content_dict?.posts || [];
        if (postsToSearch.length === 0) {
          postsToSearch = DUMMY_POSTS;
        }
        
        setAllPosts(postsToSearch);
        const foundPost = postsToSearch.find((p: Post) => p.id.toString() === id);
        if (foundPost) {
          setPost(foundPost);
        } else {
          navigate('/#news', { replace: true });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu bài viết:", err);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || 'Tin tức Fujirise');
    
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

  const handleLike = async () => {
    if (!post) return;
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.some((id: any) => id.toString() === post.id.toString())) return;

    setPost({ ...post, likes: ((post as any).likes || 0) + 1 } as any);
    
    likedPosts.push(post.id);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

    const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
    if (data?.content_dict?.posts) {
      const updatedPosts = data.content_dict.posts.map((p: any) => p.id === post.id ? { ...p, likes: (p.likes || 0) + 1 } : p);
      await supabase.from('site_settings').update({ content_dict: { ...data.content_dict, posts: updatedPosts } }).eq('id', 'default');
      clearSettingsCache();
    }
  };

  const renderText = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/__(.*?)__/g, '<u class="underline decoration-fuji-accent decoration-2 underline-offset-4">$1</u>');
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-fuji-blue rounded-full animate-spin" />
      </div>
    );
  }

  const relatedPosts = allPosts 
    ? allPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3) 
    : [];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 md:pt-32 pb-16 bg-white">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate('/#news')} className="mb-8 inline-flex items-center gap-2 text-slate-500 hover:text-fuji-blue font-bold text-sm transition-colors">
              <ArrowLeft size={16} />
              Quay lại
          </button>

          <header className="mb-10">
            <span className="px-3 py-1 bg-fuji-accent/10 text-fuji-accent rounded-full text-xs font-bold uppercase tracking-wide mb-6 inline-block">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed tracking-tight mb-8">
              {post.summary}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-100 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-fuji-blue rounded-full flex items-center justify-center">
                  <svg viewBox="14 -151 112 152" className="w-5 h-5 fill-current">
                    <path d="M 46.078125 -125.8125 L 46.078125 -79.359375 L 123 -79.359375 L 123 -55.078125 L 46.078125 -55.078125 L 46.078125 0 L 14.609375 0 L 14.609375 -150.09375 L 125.453125 -150.09375 L 125.453125 -125.8125 Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Fujirise Editorial</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> 5 phút đọc</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-2">Chia sẻ:</span>
                <button onClick={() => handleShare('facebook')} className="w-9 h-9 rounded-full bg-slate-50 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all"><Facebook size={16} /></button>
                <button onClick={() => handleShare('twitter')} className="w-9 h-9 rounded-full bg-slate-50 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all"><Twitter size={16} /></button>
                <button onClick={() => handleShare('linkedin')} className="w-9 h-9 rounded-full bg-slate-50 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all"><Linkedin size={16} /></button>
                <button onClick={() => handleShare('copy')} className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"><Link2 size={16} /></button>
              </div>
            </div>
          </header>

          {post.images && post.images.length > 0 && !post.content?.includes('[img:1]') && (
            <figure className="mb-12">
              <img src={post.images[0]} alt="Cover" className="w-full rounded-2xl object-cover max-h-[500px]" />
            </figure>
          )}

          <div className="text-slate-800">
              {(() => {
                return (post.content || post.summary).split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={idx} className="h-6" />;
                  
                  const imgMatch = trimmed.match(/^\[img:(\d+)\](.*)/i);
                  if (imgMatch) {
                    const imgIndex = parseInt(imgMatch[1]) - 1;
                    const caption = imgMatch[2] ? imgMatch[2].trim() : '';
                    const imgSrc = post.images?.[imgIndex];
                    
                    if (imgSrc) {
                      return (
                        <figure key={idx} className="my-10">
                          <img src={imgSrc} alt={caption || 'Illustration'} className="w-full rounded-2xl object-cover shadow-sm" />
                          {caption && (
                            <figcaption className="text-center text-sm text-slate-500 italic mt-4">
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
                      <blockquote key={idx} className="my-10 pl-6 border-l-4 border-fuji-accent">
                        <p className="text-xl md:text-2xl italic font-medium text-slate-700 leading-relaxed">{trimmed.substring(1).trim()}</p>
                      </blockquote>
                    );
                  }

                  if (/^\d+\.\s+/.test(trimmed)) {
                    return <h2 key={idx} className="text-2xl md:text-3xl font-bold text-slate-900 mt-12 mb-6">{trimmed}</h2>;
                  }
                  
                  if (/^\d+\.\d+\.\s+/.test(trimmed)) {
                    return <h3 key={idx} className="text-xl md:text-2xl font-bold text-slate-900 mt-8 mb-4">{trimmed}</h3>;
                  }
                  
                  return (
                    <p key={idx} className="text-lg leading-relaxed tracking-tight mb-6 text-slate-800">
                      {renderText(trimmed)}
                    </p>
                  );
                });
              })()}
          </div>
            
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-16 pt-8 border-t border-slate-100">
            <button 
              onClick={handleLike}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all ${
                JSON.parse(localStorage.getItem('likedPosts') || '[]').some((id: any) => id.toString() === post.id.toString())
                ? 'bg-fuji-blue text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ThumbsUp size={18} /> Đã Hữu Ích ({(post as any).likes || 0})
            </button>

            {post.link && (
              <a href={post.link} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-fuji-accent text-white hover:bg-fuji-blue rounded-full text-sm font-bold transition-all">
                <ExternalLink size={18} /> Xem Chi Tiết Sản Phẩm
              </a>
            )}
          </div>

          <CommentSection 
            post={post} 
            onNewComment={(newComment) => {
              const updatedPost = { ...post, comments: [...((post as any).comments || []), newComment] };
              setPost(updatedPost as Post);
            }} 
          />
        </article>

        {relatedPosts.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-20 pt-16 border-t border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Bài viết liên quan</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map(rp => (
                <Link key={rp.id} to={`/news/${rp.id}`} className="group block">
                  <div className="h-48 rounded-2xl overflow-hidden mb-4 relative bg-slate-100">
                    <img src={rp.images?.[0] || rp.imageUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                    <span className="text-fuji-accent font-bold uppercase tracking-wide">{rp.category}</span>
                    <span>•</span>
                    <span>{new Date(rp.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-fuji-accent transition-colors line-clamp-2">{rp.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}