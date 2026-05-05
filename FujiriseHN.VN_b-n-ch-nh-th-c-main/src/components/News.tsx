import React from 'react';
import { supabase, Post } from '../lib/supabase';
import { ArrowRight, ThumbsUp, MessageCircle, Search } from 'lucide-react';
import { getCachedSettings, DUMMY_POSTS } from '../constants';
import { Link } from 'react-router-dom';

export default function News() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Ngày ${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  React.useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await getCachedSettings(supabase);
      if (data?.content_dict?.posts && data.content_dict.posts.length > 0) {
        const sortedPosts = data.content_dict.posts.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(sortedPosts);
      } else {
        setPosts(DUMMY_POSTS as Post[]);
      }
    };
    fetchPosts();
  }, []);

  if (posts.length === 0) {
    return (
      <section id="news" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-sm font-bold uppercase tracking-wide text-fuji-accent mb-2 block">Updates & Activities</span>
              <h2 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tight leading-tight">
                TIN TỨC <span className="text-slate-300">&</span> SỰ KIỆN
              </h2>
            </div>
          </div>
          <div className="py-12 text-center">
            <p className="text-slate-400 font-bold italic">Nội dung đang được cập nhật. Vui lòng quay lại sau!</p>
          </div>
        </div>
      </section>
    );
  }

  const categories = ['Tất cả', ...Array.from(new Set(posts.map(p => p.category)))];
  const filteredPosts = posts.filter(post => {
    const summaryText = post.summary || '';
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || summaryText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="news" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-sm font-bold uppercase tracking-wide text-fuji-accent mb-2 block">Updates & Activities</span>
            <h2 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tight leading-tight">
              TIN TỨC <span className="text-slate-300">&</span> SỰ KIỆN
            </h2>
          </div>
          <a href="/#news" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-wide text-fuji-blue hover:text-fuji-accent transition-colors">
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
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wide transition-all ${activeCategory === cat ? 'bg-fuji-blue text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
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

        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 font-bold italic">Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Top Section: Hero + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Featured Post */}
              {(() => {
                const featuredPost = filteredPosts[0];
                return (
                  <Link
                    to={`/news/${featuredPost.id}`}
                    className="lg:col-span-8 group cursor-pointer flex flex-col"
                  >
                    <div className="relative h-[300px] md:h-[450px] lg:h-[500px] rounded-[40px] overflow-hidden mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 pointer-events-none" />
                      <img src={featuredPost.images?.[0] || featuredPost.imageUrl} alt={featuredPost.title} loading="lazy" className="w-full h-full object-cover" />
                      <div className="absolute top-6 left-6 z-20">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-fuji-blue rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg">{featuredPost.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">
                      <span>{formatDate(featuredPost.createdAt)}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="flex items-center gap-1"><MessageCircle size={14} /> {((featuredPost as any).comments || []).filter((c: any) => c.isApproved).length} bình luận</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-fuji-blue tracking-tight leading-tight mb-4 group-hover:text-fuji-accent transition-colors break-words">
                      {featuredPost.title}
                    </h3>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed tracking-tight line-clamp-3">
                      {featuredPost.summary}
                    </p>
                  </Link>
                );
              })()}

              {/* Right: Sidebar Posts */}
              {filteredPosts.length > 1 && (
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b-2 border-fuji-blue pb-3 mb-2">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">Tiêu điểm</h4>
                  </div>
                  {filteredPosts.slice(1, 5).map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/news/${post.id}`}
                      className="group cursor-pointer flex gap-5 items-start bg-transparent hover:bg-white p-3 -ml-3 rounded-2xl transition-all"
                    >
                      <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                        <div className="absolute inset-0 bg-slate-900/10 z-10 pointer-events-none group-hover:bg-transparent transition-colors" />
                        <img src={post.images?.[0] || post.imageUrl} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center h-full">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-fuji-accent mb-1.5 block">{post.category}</span>
                        <h5 className="font-bold text-fuji-blue text-sm md:text-base tracking-tight leading-snug line-clamp-3 group-hover:text-fuji-accent transition-colors break-words">
                          {post.title}
                        </h5>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Grid for the rest */}
            {filteredPosts.length > 5 && (
              <>
                <div className="w-full flex items-center justify-between border-t-2 border-slate-100 pt-4 mt-8 mb-4">
                  <h4 className="text-xl font-bold uppercase tracking-wide text-slate-800">Khám phá thêm</h4>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                  {filteredPosts.slice(5).map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/news/${post.id}`}
                      className="shrink-0 w-[280px] md:w-[320px] snap-start bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <div className="h-32 md:h-40 rounded-xl overflow-hidden mb-4 relative flex gap-1 shadow-inner">
                        <div className="absolute inset-0 bg-slate-900/10 z-10 pointer-events-none group-hover:bg-transparent transition-colors" />
                        {post.images && post.images.length > 1 ? (
                          <>
                            <img src={post.images[0]} alt={post.title} loading="lazy" className="w-2/3 h-full object-cover" />
                            <div className="w-1/3 flex flex-col gap-1">
                              <img src={post.images[1]} loading="lazy" className="w-full h-1/2 object-cover" />
                              {post.images[2] ? (
                                <img src={post.images[2]} loading="lazy" className="w-full h-1/2 object-cover" />
                              ) : (
                                <div className="w-full h-1/2 bg-slate-50" />
                              )}
                            </div>
                          </>
                        ) : (
                          <img src={post.images?.[0] || post.imageUrl} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2 py-1 bg-fuji-accent/10 text-fuji-accent rounded text-[10px] font-bold uppercase tracking-wide">{post.category}</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-slate-800 text-base tracking-tight leading-snug mb-2 line-clamp-2 group-hover:text-fuji-accent transition-colors break-words">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed tracking-tight line-clamp-3 mb-4 flex-1">
                        {post.summary}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="flex items-center gap-1 text-[10px] font-bold"><ThumbsUp size={12} /> {(post as any).likes || 0}</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold"><MessageCircle size={12} /> {((post as any).comments || []).filter((c: any) => c.isApproved).length}</span>
                        </div>
                        <span className="text-fuji-blue group-hover:text-fuji-accent transition-colors"><ArrowRight size={14} /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}