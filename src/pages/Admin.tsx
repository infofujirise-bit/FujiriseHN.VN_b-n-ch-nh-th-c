import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Users, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  Activity,
  Calendar,
  Lock,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  PieChart,
  BrainCircuit,
  FileDown,
  Type,
  Briefcase,
  X,
  Palette,
  Users2,
  Newspaper,
  ThumbsUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn } from '../lib/utils';
import { PRODUCTS } from '../constants';
import { supabase, Lead, Product, Post } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { sendToTelegram } from '../lib/telegram';
import { analyzeMarketingData } from '../services/geminiService';

interface Job {
  id: number;
  title: string;
  location: string;
  type: string;
  description: string;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor';
}

interface FAQ {
  q: string;
  a: string;
}

interface ConfiguratorOption {
  id: string;
  name: string;
  subtitle: string;
  primary: string;
  bg: string;
  description: string;
}

interface WebContent {
  logoImage?: string;
  heroTitle?: string;
  heroDesc?: string;
  heroImage?: string;
  aboutImage?: string;
  hotline?: string;
  email?: string;
  zalo?: string;
  facebook?: string;
  address?: string;
  mapIframeSrc?: string;
  mapShareLink?: string;
}

type Tab = 'dashboard' | 'content' | 'jobs' | 'users' | 'images' | 'settings' | 'warranty' | 'web_content' | 'configurator' | 'faq' | 'accounts' | 'news';
const ADMIN_EMAIL = 'info.fujirise@gmail.com';

// --- BẢO MẬT: MÃ HÓA SESSION (CƠ CHẾ ANTI-TAMPER TOKEN) ---
const SECRET_SALT = "FujiRise_Secure_Secret_2026_@!"; // Khóa bí mật chống làm giả

const encodeSession = (userData: AdminUser) => {
  const payload = btoa(encodeURIComponent(JSON.stringify(userData)));
  const signature = btoa(encodeURIComponent(payload + SECRET_SALT));
  return `${payload}.${signature}`; // Tạo token định dạng: payload.signature
};

const decodeSession = (token: string): AdminUser | null => {
  try {
    const [payload, signature] = token.split('.');
    const expectedSignature = btoa(encodeURIComponent(payload + SECRET_SALT));
    if (signature !== expectedSignature) return null; // Sai chữ ký -> Đã bị hacker can thiệp sửa đổi
    return JSON.parse(decodeURIComponent(atob(payload)));
  } catch (err) {
    return null;
  }
};

export default function Admin() {
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<Tab>('dashboard');
  const [error, setError] = React.useState('');
  const [resetSent, setResetSent] = React.useState(false);
  const [sysLogo, setSysLogo] = React.useState('/logo.svg');

  React.useEffect(() => {
    const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (isMock) {
      setError("Hệ thống chưa được cấu hình Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào Secrets.");
      setLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        // Lấy Logo từ Database ngay khi load trang
        const { data: settings } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
        if (settings?.content_dict?.web_content?.logoImage) {
          setSysLogo(settings.content_dict.web_content.logoImage);
        }
      } catch (e) {}

      // 1. Kiểm tra và phục hồi phiên đăng nhập cục bộ nếu dùng đăng nhập tắt
      const localSession = localStorage.getItem('fuji_admin_session');
      if (localSession) {
        const u = decodeSession(localSession);
        if (u && u.id && u.email && u.role) {
          // Tự động cấp lại quyền admin nếu là email gốc của hệ thống
          if (u.email === ADMIN_EMAIL && u.role !== 'admin') {
            u.role = 'admin';
          }
          setUser(u);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('fuji_admin_session');
        }
      }
      setLoading(false);
    };

    getSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const emailInput = formData.get('email') as string;
    const passwordInput = formData.get('password') as string;

    setError('');
    
    try {
      // 1. Check in admins table (simplified for user request)
      const { data, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', emailInput)
        .eq('password', passwordInput)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
           setError('Sai thông tin hoặc bị khóa bởi RLS. Vui lòng kiểm tra lại Database.');
        } else {
           setError(`Lỗi hệ thống: ${fetchError.message}`);
        }
        return;
      }
      if (!data) {
        setError('Email hoặc mật khẩu không chính xác.');
        return;
      }

      // 2. Set user session (using dummy metadata to match existing code)
      const userRole = data.role || (data.email === ADMIN_EMAIL ? 'admin' : 'editor');
      const adminUser: AdminUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name || data.email,
        role: userRole,
      };
      setUser(adminUser);
      // Lưu lại phiên đăng nhập để tránh bị thoát khi load lại trang
      localStorage.setItem('fuji_admin_session', encodeSession(adminUser));
      
      // Notify Telegram about admin login
      await sendToTelegram(`🔐 <b>ADMIN LOGIN</b>\n----------------------------\n<b>User:</b> ${data.email}\n<b>Time:</b> ${new Date().toLocaleString('vi-VN')}`, 'auth');
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Lỗi kết nối tới hệ thống.');
    }
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('fuji_admin_session');
    await supabase.auth.signOut();
  };

  const handleForgotPassword = async () => {
    const email = prompt("Nhập email admin để yêu cầu cấp lại mật khẩu qua Telegram:");
    if (!email) return;

    try {
      // 1. Kiểm tra xem email có tồn tại không
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        alert("Email không tồn tại trong hệ thống.");
        return;
      }

      // 2. Tạo mật khẩu mới ngẫu nhiên (Ví dụ: 8XF9D@fuji)
      const newPassword = Math.random().toString(36).slice(-6).toUpperCase() + "@fuji";
      
      // 3. Lưu mật khẩu mới vào Supabase
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password: newPassword })
        .eq('email', email);

      if (updateError) throw updateError;

      // 4. Gửi mật khẩu mới qua Telegram
      const msg = `🔐 <b>CẤP LẠI MẬT KHẨU ADMIN</b>\n----------------------------\n<b>Tài khoản:</b> ${email}\n<b>Mật khẩu mới:</b> <code>${newPassword}</code>\n----------------------------\n<i>Hệ thống tự động tạo và cấp lại mật khẩu. Bạn có thể copy mật khẩu trên để đăng nhập.</i>`;
      await sendToTelegram(msg, 'auth');

      alert("Mật khẩu mới đã được tạo và gửi thẳng tới Telegram của Admin. Vui lòng kiểm tra tin nhắn Bot!");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi cấp lại mật khẩu. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-fuji-blue rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/logo.svg" alt="Loading" className="w-10 h-10 object-contain animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-fuji-blue relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuji-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-3xl border border-white/20 w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <img src={sysLogo} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }} alt="Fujirise Logo" className="h-16 md:h-20 w-auto object-contain mx-auto mb-6 rounded-2xl bg-white p-3 shadow-2xl hover:scale-110 transition-transform duration-500" />
            <p className="text-white/70 text-[10px] uppercase font-black tracking-[0.3em] mt-4">Hệ quản trị an toàn</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Email</label>
              <input 
                name="email"
                type="email" 
                required
                defaultValue="info.fujirise@gmail.com"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                placeholder="admin@fujirise.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Mật khẩu</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-fuji-blue py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-fuji-accent hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              <Smartphone size={18} />
              Đăng nhập hệ thống
            </button>
            
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="w-full py-2 text-white/50 text-[10px] uppercase font-black tracking-widest hover:text-fuji-accent transition-all"
            >
              Quên mật khẩu? (Báo Telegram)
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-[10px] font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      <aside className="w-72 bg-fuji-blue text-white flex flex-col h-full shrink-0 z-40 relative shadow-2xl">
        <div className="p-8 pb-12 flex items-center justify-center gap-3 shrink-0">
          <img src={sysLogo} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }} alt="Logo" className="h-10 md:h-12 w-auto object-contain bg-white rounded-xl p-2 shadow-xl hover:scale-105 transition-transform cursor-pointer" />
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-6">
          <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Tổng quan</p>
          <NavBtn icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          
          <div className="h-4" />
          <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Quản lý Leads</p>
          <NavBtn icon={<FileText size={20} />} label="Leads & Tư vấn" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
          <NavBtn icon={<Users size={20} />} label="Ứng tuyển" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          
          <div className="h-4" />
          <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Danh mục</p>
          <NavBtn icon={<ImageIcon size={20} />} label="Sản phẩm" active={activeTab === 'images'} onClick={() => setActiveTab('images')} />
          <NavBtn icon={<Palette size={20} />} label="Mô phỏng" active={activeTab === 'configurator'} onClick={() => setActiveTab('configurator')} />
          <NavBtn icon={<HelpCircle size={20} />} label="Hỏi đáp (FAQ)" active={activeTab === 'faq'} onClick={() => setActiveTab('faq')} />
          <NavBtn icon={<Newspaper size={20} />} label="Tin tức & Sự kiện" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
          <NavBtn icon={<ShieldCheck size={20} />} label="Chính sách" active={activeTab === 'warranty'} onClick={() => setActiveTab('warranty')} />
          
          <div className="h-4" />
          <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Cấu hình</p>
          <NavBtn icon={<Briefcase size={20} />} label="Đăng tuyển" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <NavBtn icon={<Type size={20} />} label="Nội dung Web" active={activeTab === 'web_content'} onClick={() => setActiveTab('web_content')} />
          <NavBtn icon={<Settings size={20} />} label="Cài đặt" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          {user?.role === 'admin' && <NavBtn icon={<Users2 size={20} />} label="Tài khoản" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />}
        </nav>

        <div className="p-6 shrink-0 border-t border-white/5">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-4">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full border-2 border-fuji-accent overflow-hidden bg-fuji-line flex items-center justify-center">
                 {user?.full_name ? (
                   <span className="font-black text-white">{user.full_name.charAt(0)}</span>
                 ) : (
                   <Users size={16} className="text-white/30" />
                 )}
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black truncate">{user?.full_name || 'Admin'}</p>
                 <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
               </div>
             </div>
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 transition-all text-[10px] font-black uppercase tracking-widest"
             >
               <LogOut size={16} /> Đăng xuất
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-fuji-blue tracking-tighter uppercase">
              {activeTab === 'dashboard' ? 'Bảng Điều Khiển' : 
               activeTab === 'content' ? 'Quản lý Leads' :
               activeTab === 'jobs' ? 'Quản lý Tuyển dụng' :
               activeTab === 'images' ? 'Sản phẩm' :
               activeTab === 'users' ? 'Ứng tuyển' : 
               activeTab === 'faq' ? 'Hỏi & Đáp (FAQ)' :
               activeTab === 'news' ? 'Tin tức & Sự kiện' :
               activeTab === 'accounts' && user?.role === 'admin' ? 'Quản lý Tài khoản' :
               activeTab === 'configurator' ? 'Mô phỏng Nội thất' :
               activeTab === 'warranty' ? 'Chính sách' : 
               activeTab === 'web_content' ? 'Nội dung Web' : 'Cài đặt'}
            </h2>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-400">Enterprise v3.0</div>
          </div>

          <div className="flex items-center gap-6">
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Tìm kiếm..." 
                 className="bg-slate-50 border-none rounded-xl h-10 w-64 pl-10 text-xs font-medium focus:ring-2 focus:ring-fuji-blue transition-all"
               />
             </div>
             <div className="w-px h-6 bg-slate-100" />
             <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-fuji-blue transition-colors">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-fuji-blue transition-colors">
                <Calendar size={20} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'content' && <LeadManager type="consultation" />}
              {activeTab === 'users' && <LeadManager type="recruitment" />}
              {activeTab === 'jobs' && <JobManager />}
              {activeTab === 'images' && <ProductManager />}
              {activeTab === 'faq' && <FAQManager />}
              {activeTab === 'news' && <NewsManager />}
              {activeTab === 'accounts' && user?.role === 'admin' && <UserManager />}
              {activeTab === 'configurator' && <ConfiguratorManager />}
              {activeTab === 'warranty' && <WarrantyManager />}
              {activeTab === 'web_content' && <WebContentManager />}
              {activeTab === 'settings' && <SettingsManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick, disabled }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left group",
        active 
          ? "bg-white text-fuji-blue shadow-2xl shadow-white/5" 
          : "text-white/50 hover:bg-white/5 hover:text-white",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-fuji-blue text-white" : "bg-white/5 text-white/50 group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function Dashboard() {
  const [stats, setStats] = React.useState({ totalLeads: 0, newLeads: 0, conversion: '0.0%', completionRate: 0 });
  const [chartData, setChartData] = React.useState<{name: string, leads: number}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: leadsData } = await supabase.from('leads').select('status, created_at');
      
      if (leadsData) {
        const total = leadsData.length;
        const newLeads = leadsData.filter((l: Lead) => l.status === 'new').length;
        const completedLeads = leadsData.filter((l: Lead) => l.status === 'completed').length;
        
        // Tỉ lệ hoàn thành công việc (Số lead đã xử lý xong so với tổng)
        const processedLeads = total - newLeads;
        const completionRate = total > 0 ? Math.round((processedLeads / total) * 100) : 0;
        // Tỉ lệ chốt sale thành công
        const conversionRate = total > 0 ? ((completedLeads / total) * 100).toFixed(1) : '0.0';

        setStats({
          totalLeads: total,
          newLeads: newLeads,
          conversion: `${conversionRate}%`,
          completionRate: completionRate
        });

        // Tạo dữ liệu biểu đồ 7 tháng gần nhất
        const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
        const currentMonth = new Date().getMonth();
        const cData: { name: string, monthIndex: number, year: number, leads: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          let mIndex = currentMonth - i;
          let yearOffset = 0;
          if (mIndex < 0) { mIndex += 12; yearOffset = -1; }
          cData.push({ name: months[mIndex], monthIndex: mIndex, year: new Date().getFullYear() + yearOffset, leads: 0 });
        }

        // Phân bổ Lead vào các tháng
        leadsData.forEach((lead: Lead) => {
          const date = new Date(lead.created_at as string);
          const target = cData.find(d => d.monthIndex === date.getMonth() && d.year === date.getFullYear());
          if (target) target.leads++;
        });

        setChartData(cData.map(d => ({ name: d.name, leads: d.leads })));
      }
    };
    
    fetchDashboardData();
    
    // Đăng ký nhận realtime data để tự làm mới Dashboard khi có người gửi Form
    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchDashboardData)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAIMarketing = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeMarketingData();
    await sendToTelegram(`📊 <b>BÁO CÁO MARKETING AI (Real-time)</b>\n\n${analysis}`, 'marketing');
    alert("Báo cáo AI đã được gửi tới Telegram.");
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-fuji-blue text-2xl tracking-tighter uppercase mb-1">Tổng quan hoạt động</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time Data Stream</p>
        </div>
        <button 
          onClick={handleAIMarketing}
          disabled={isAnalyzing}
          className="flex items-center gap-3 px-6 py-4 bg-fuji-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-fuji-blue/20 hover:bg-fuji-accent transition-all active:scale-95 disabled:opacity-50"
        >
          <BrainCircuit size={18} /> {isAnalyzing ? 'Đang phân tích...' : 'Phân tích Marketing AI'}
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard icon={<MessageSquare className="text-blue-500" />} label="Tổng yêu cầu" value={stats.totalLeads} trend="Thực tế" positive={true} />
        <StatCard icon={<AlertCircle className="text-orange-500" />} label="Chờ xử lý" value={stats.newLeads} trend={stats.newLeads > 0 ? "Cần xử lý" : "An toàn"} positive={stats.newLeads === 0} />
        <StatCard icon={<Activity className="text-green-500" />} label="Tỉ lệ Chuyển đổi" value={stats.conversion} trend="Thành công" positive={true} />
        <StatCard icon={<ShieldCheck className="text-indigo-500" />} label="Hệ thống" value="Active" trend="Stable" positive={true} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={10} />
                 <YAxis hide />
                 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 900 }} />
                 <Area type="monotone" dataKey="leads" stroke="#1b2a43" strokeWidth={4} fill="#1b2a43" fillOpacity={0.1} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="font-black text-fuji-blue text-sm uppercase tracking-widest mb-8">Tỉ lệ hoàn thành</h3>
            <div className="relative w-48 h-48 mx-auto">
               <svg className="w-full h-full" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#C5A059" strokeWidth="10" strokeDasharray={`${(stats.completionRate / 100) * 282.74} 283`} strokeLinecap="round" className="transition-all duration-1000" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-fuji-blue">{stats.completionRate}%</span>
                 <span className="text-[10px] text-slate-400 font-black uppercase">Goal</span>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function LeadManager({ type }: { type: 'consultation' | 'recruitment' }) {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = React.useState(true);

  React.useEffect(() => {
    const fetchLeads = async () => {
      setLoadingLeads(true);
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data) {
        if (type === 'recruitment') {
          setLeads(data.filter((l: Lead) => l.message?.startsWith('Ứng tuyển:')));
        } else {
          setLeads(data.filter((l: Lead) => !l.message?.startsWith('Ứng tuyển:')));
        }
      }
      setLoadingLeads(false);
    };
    fetchLeads();
  }, [type]);

  const updateStatus = async (id: string, status: Lead['status']) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (!error) setLeads(prev => prev.map((l: Lead) => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center">
         <div>
           <h3 className="text-lg font-black text-fuji-blue tracking-tighter uppercase">{type === 'consultation' ? 'Danh sách Tư vấn & Katalog' : 'Danh sách Ứng viên'}</h3>
           <p className="text-xs text-slate-400 mt-1 font-medium italic">Quản lý trạng thái và liên hệ khách hàng</p>
         </div>
         <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
               <FileDown size={14} /> Xuất CSV
            </button>
         </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Thông tin</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nội dung / Địa chỉ</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm", lead.status === 'new' ? "bg-fuji-accent text-white" : "bg-fuji-blue text-white")}>
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm tracking-tight">{lead.name || 'Khách vãng lai'}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{lead.phone || 'N/A'}</p>
                      <p className="text-[9px] text-slate-400 italic">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="max-w-xs space-y-1">
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2">{lead.message}</p>
                  </div>
                </td>
                <td className="p-8">
                   <select 
                     value={lead.status}
                     onChange={(e) => updateStatus(lead.id!, e.target.value as Lead['status'])}
                     className={cn(
                       "text-[9px] font-black uppercase tracking-widest border-none px-3 py-2 rounded-lg outline-none cursor-pointer",
                       lead.status === 'new' ? "bg-blue-100 text-blue-600" :
                       lead.status === 'contacted' ? "bg-purple-100 text-purple-600" :
                       lead.status === 'completed' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                     )}
                   >
                     <option value="new">Mới nhận</option>
                     <option value="contacted">Đang xử lý</option>
                     <option value="completed">Hoàn thành</option>
                     <option value="cancelled">Đã hủy</option>
                   </select>
                </td>
                <td className="p-8 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-fuji-accent hover:text-white transition-all flex items-center justify-center">
                      <Edit2 size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {loadingLeads && <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-black italic">Đang tải dữ liệu...</td></tr>}
            {!loadingLeads && leads.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black italic">Chưa có yêu cầu nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FAQManager() {
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);

  React.useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.faqs) {
        setFaqs(data.content_dict.faqs);
      }
    };
    fetchFaqs();
  }, []);

  const saveFaqs = async () => {
    const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
    const currentDict = data?.content_dict || {};
    currentDict.faqs = faqs;
    
    await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
    alert('Đã lưu danh sách Hỏi & Đáp!');
  };

  const addFaq = () => setFaqs([...faqs, { q: 'Câu hỏi mới', a: 'Câu trả lời...' }]);
  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
         <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-black text-fuji-blue uppercase tracking-tight flex items-center gap-3">
             <HelpCircle size={20} className="text-fuji-accent" /> Quản lý Hỏi & Đáp (FAQ)
           </h3>
           <button onClick={addFaq} className="px-6 py-3 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-all flex items-center gap-2">
             <Plus size={14} /> Thêm câu hỏi
           </button>
         </div>
         <div className="space-y-6">
           {faqs.map((faq, index) => (
             <div key={index} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
               <button onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
               <div className="space-y-4">
                 <Input label={`Câu hỏi ${index + 1}`} value={faq.q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFaq(index, 'q', e.target.value)} />
                 <Textarea label="Câu trả lời" value={faq.a} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFaq(index, 'a', e.target.value)} rows={4} />
               </div>
             </div>
           ))}
           {faqs.length === 0 && <p className="text-center text-slate-400 py-10 font-bold italic">Chưa có câu hỏi nào. Hãy thêm mới!</p>}
         </div>
      </div>
      
      <div className="flex justify-end">
         <button onClick={saveFaqs} className="px-10 py-4 bg-fuji-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all active:scale-95">Lưu danh sách FAQ</button>
      </div>
    </div>
  );
}

function JobManager() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [formConfig, setFormConfig] = React.useState({ 
    showExperience: true, 
    requireExperience: false,
    showEmail: false,
    formTitle: "Nộp Hồ Sơ Trực Tuyến" 
  });

  React.useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.careers) {
        setJobs(data.content_dict.careers);
      }
      if (data?.content_dict?.careerForm) {
        setFormConfig({
          showExperience: true,
          requireExperience: false,
          showEmail: false,
          formTitle: "Nộp Hồ Sơ Trực Tuyến",
          ...data.content_dict.careerForm
        });
      }
    };
    fetchJobs();
  }, []);

  const saveSettings = async () => {
    const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
    const currentDict = data?.content_dict || {};
    currentDict.careers = jobs;
    currentDict.careerForm = formConfig;
    
    await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
    alert('Đã lưu cấu hình tuyển dụng!');
  };

  const addJob = () => setJobs([...jobs, { id: Date.now(), title: 'Vị trí mới', location: 'Hà Nội', type: 'Toàn thời gian', description: 'Mô tả công việc...' } as Job]);
  const updateJob = (id: number, field: keyof Job, value: string) => setJobs(jobs.map((j: Job) => j.id === id ? { ...j, [field]: value } : j));
  const removeJob = (id: number) => setJobs(jobs.filter((j: Job) => j.id !== id));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
         <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-black text-fuji-blue uppercase tracking-tight flex items-center gap-3">
             <Briefcase size={20} className="text-fuji-accent" /> Quản lý Vị trí Tuyển dụng
           </h3>
           <button onClick={addJob} className="px-6 py-3 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-all flex items-center gap-2">
             <Plus size={14} /> Thêm vị trí
           </button>
         </div>
         <div className="space-y-6">
           {jobs.map(job => (
             <div key={job.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
               <button onClick={() => removeJob(job.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
               <div className="grid md:grid-cols-3 gap-4 mb-4">
                 <Input label="Tên vị trí" value={job.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateJob(job.id, 'title', e.target.value)} />
                 <Input label="Địa điểm" value={job.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateJob(job.id, 'location', e.target.value)} />
                 <Input label="Hình thức" value={job.type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateJob(job.id, 'type', e.target.value)} />
               </div>
               <Textarea label="Mô tả công việc" value={job.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateJob(job.id, 'description', e.target.value)} />
             </div>
           ))}
           {jobs.length === 0 && <p className="text-center text-slate-400 py-10 font-bold italic">Chưa có vị trí tuyển dụng nào. Hãy thêm mới!</p>}
         </div>
      </div>
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight flex items-center gap-3"><Settings size={20} className="text-fuji-accent" /> Cấu hình Form Ứng Tuyển</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <Input label="Tiêu đề Form" value={formConfig.formTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormConfig({...formConfig, formTitle: e.target.value})} />
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl">
              <input type="checkbox" id="showEmail" checked={formConfig.showEmail} onChange={(e) => setFormConfig({...formConfig, showEmail: e.target.checked})} className="w-5 h-5 accent-fuji-accent cursor-pointer" />
              <label htmlFor="showEmail" className="text-xs font-black text-fuji-blue uppercase tracking-widest cursor-pointer">Hiển thị ô Email</label>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl">
              <input type="checkbox" id="showExp" checked={formConfig.showExperience} onChange={(e) => setFormConfig({...formConfig, showExperience: e.target.checked})} className="w-5 h-5 accent-fuji-accent cursor-pointer" />
              <label htmlFor="showExp" className="text-xs font-black text-fuji-blue uppercase tracking-widest cursor-pointer">Hiển thị ô nhập Kinh nghiệm / Link CV</label>
            </div>
            {formConfig.showExperience && (
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl ml-4">
                <input type="checkbox" id="reqExp" checked={formConfig.requireExperience} onChange={(e) => setFormConfig({...formConfig, requireExperience: e.target.checked})} className="w-5 h-5 accent-fuji-accent cursor-pointer" />
                <label htmlFor="reqExp" className="text-xs font-black text-fuji-blue uppercase tracking-widest cursor-pointer">Bắt buộc nhập Kinh nghiệm</label>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
         <button onClick={saveSettings} className="px-10 py-4 bg-fuji-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all active:scale-95">Lưu cấu hình tuyển dụng</button>
      </div>
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isEditing, setIsEditing] = React.useState<Product | null>(null);

  React.useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.products && data.content_dict.products.length > 0) {
        setProducts(data.content_dict.products);
      } else {
        setProducts(PRODUCTS.map((p: any) => ({
          ...p,
          category: 'Thang máy Homelife',
          technology: 'Cáp kéo',
          specs: { load: '350kg', speed: '0.4 m/s', pit: '250mm', oh: '2850 mm', travel: '< hoặc = 15m', stops: '< hoặc = 6', door: 'Mở tâm 2 cánh, mở 1 cánh, mở bản lề tự động', structure: 'Hố thang xây hoặc hố sử dụng khung hợp kim nhôm / Khung thép' },
          cabin: {
            material: 'Lựa chọn linh hoạt giữa inox sọc nhuyễn, inox hoa văn tinh xảo hoặc kính cường lực hiện đại, phù hợp nhiều phong cách thiết kế.\nTạo điểm nhấn đẳng cấp, nâng tầm thẩm mỹ không gian nội thất.\nChống trơn trượt, dễ vệ sinh, đảm bảo an toàn và độ bền trong quá trình sử dụng.'
          }
        })) as Product[]);
      }
    };
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentImages = isEditing?.images || [];
    const slotsLeft = 10 - currentImages.length;
    const filesToUpload = files.slice(0, slotsLeft);

    if (files.length > slotsLeft) {
      alert(`Chỉ có thể thêm tối đa 10 ảnh. Đã bỏ qua ${files.length - slotsLeft} ảnh.`);
    }

    try {
      const newUrls = await Promise.all(filesToUpload.map(async (file: File) => {
        const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (isMock) {
          // Trả về local object URL để xem trước ngay lập tức nếu chưa cấu hình Supabase
          return URL.createObjectURL(file);
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        return publicUrl;
      }));

      setIsEditing(prev => {
        if (!prev) return null;
        const updatedImages = [...(prev.images || []), ...newUrls].slice(0, 10);
        return { ...prev, images: updatedImages, image: updatedImages[0] };
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi khi tải ảnh lên. Vui lòng thử lại.');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setIsEditing(prev => {
      if (!prev) return null;
      const updatedImages = (prev.images || []).filter((_, index) => index !== indexToRemove);
      return { ...prev, images: updatedImages, image: updatedImages[0] || '' };
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-fuji-blue tracking-tighter uppercase">Danh Mục Sản Phẩm</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest italic">Hố Pit: 250mm | OH: 2850mm | Công nghệ Hiện đại</p>
        </div>
        <button 
          onClick={() => setIsEditing({ 
            id: 0, 
            title: '', 
            description: '', 
            images: [], 
            image: '', 
            category: 'Thang máy Homelife', 
            technology: 'Cáp kéo', 
            specs: { load: '', speed: '', pit: '', oh: '', travel: '', stops: '', door: '', structure: '' }, 
            cabin: { material: '' } 
          } as Product)}
          className="px-6 py-3 bg-fuji-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 group hover:bg-fuji-blue transition-all"
        >
          <Plus size={16} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-[50px] p-8 shadow-sm border border-slate-100 grid md:grid-cols-5 gap-8 group">
            <div className="md:col-span-2 h-64 rounded-[40px] overflow-hidden relative">
              <img src={product.images?.[0] || product.image} className="w-full h-full object-contain bg-slate-50 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-fuji-blue/20" />
            </div>
            <div className="md:col-span-3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-black text-fuji-accent uppercase tracking-widest">{product.category}</span>
                  <h3 className="text-xl font-black text-fuji-blue uppercase tracking-tight">{product.title}</h3>
                  {product.technology && <p className="text-[10px] text-slate-400 font-bold">Công nghệ: {product.technology}</p>}
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setIsEditing(product)} className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-fuji-blue hover:text-white transition-all"><Edit2 size={14} /></button>
                   <button 
                     onClick={async () => {
                        if(confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                          const newProducts = products.filter((p: Product) => p.id !== product.id);
                          setProducts(newProducts);
                          try {
                            const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
                            const currentDict = data?.content_dict || {};
                            currentDict.products = newProducts;
                            await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
                          } catch(err) {
                            console.error(err);
                          }
                        }
                     }}
                     className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                   ><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-fuji-line rounded-2xl">
                  <p className="text-[8px] text-slate-400 font-black uppercase">Tải trọng</p>
                  <p className="text-xs font-black text-fuji-blue">{product.specs?.load || '--'}</p>
                </div>
                <div className="p-3 bg-fuji-line rounded-2xl">
                  <p className="text-[8px] text-slate-400 font-black uppercase">Hố Pit</p>
                  <p className="text-xs font-black text-fuji-blue">{product.specs?.pit || '--'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-fuji-accent font-black uppercase">Cabin Detail</p>
                <p className="text-[10px] text-slate-500 line-clamp-2 italic font-medium leading-relaxed">{product.cabin?.material || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fuji-blue/80 backdrop-blur-md">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[50px] p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button 
                onClick={() => setIsEditing(null)}
                className="absolute top-10 right-10 text-slate-300 hover:text-fuji-blue transition-all"
              >
                <Trash2 size={24} />
              </button>
              <h3 className="text-3xl font-black text-fuji-blue uppercase tracking-tighter mb-10">Chỉnh sửa sản phẩm</h3>
              <form className="space-y-8" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.target as HTMLFormElement);
                  const updatedProduct = {
                    ...isEditing,
                    title: (formData.get('title') as string) || isEditing?.title || '',
                    description: (formData.get('description') as string) || isEditing?.description,
                    category: (formData.get('category') as string) || isEditing?.category,
                    technology: (formData.get('technology') as string) || isEditing?.technology,
                    specs: {
                      ...(isEditing?.specs || {}),
                      load: (formData.get('load') as string) || isEditing?.specs?.load,
                      speed: (formData.get('speed') as string) || isEditing?.specs?.speed,
                      pit: (formData.get('pit') as string) || isEditing?.specs?.pit,
                      oh: (formData.get('oh') as string) || isEditing?.specs?.oh,
                      travel: (formData.get('travel') as string) || isEditing?.specs?.travel,
                      stops: (formData.get('stops') as string) || isEditing?.specs?.stops,
                      door: (formData.get('door') as string) || isEditing?.specs?.door,
                      structure: (formData.get('structure') as string) || isEditing?.specs?.structure,
                    },
                    cabin: {
                      ...(isEditing?.cabin || {}),
                      material: (formData.get('material') as string) || isEditing?.cabin?.material,
                    }
                  };

                  let newProducts;
                  if (updatedProduct.id === 0) {
                    updatedProduct.id = Date.now();
                    newProducts = [...products, updatedProduct];
                  } else {
                  newProducts = products.map((p: Product) => p.id === updatedProduct.id ? updatedProduct : p);
                  }

                  const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
                  const currentDict = data?.content_dict || {};
                  currentDict.products = newProducts;
                  
                  await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
                  
                  setProducts(newProducts);
                  alert('Cập nhật sản phẩm thành công!');
                  setIsEditing(null);
                } catch(err) {
                  console.error(err);
                  alert('Lỗi khi lưu sản phẩm!');
                }
              }}>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-fuji-accent border-b pb-2">Thông tin cơ bản</p>
                       <Input name="title" label="Tên sản phẩm" defaultValue={isEditing?.title} />
                       <Textarea name="description" label="Mô tả ngắn" defaultValue={isEditing?.description} />
                       <Input name="category" label="Danh mục" defaultValue={isEditing?.category} />
                       <Input name="technology" label="Công nghệ" defaultValue={isEditing?.technology} />
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Hình ảnh sản phẩm (Tối đa 10 ảnh)</label>
                          <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            { (isEditing.images && isEditing.images.length > 0) && (
                              <div className="flex flex-wrap gap-3">
                                {isEditing.images.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={img} alt={`Preview ${idx}`} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm shrink-0" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {(!isEditing.images || isEditing.images.length < 10) && (
                              <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full text-xs font-bold text-slate-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-fuji-blue file:shadow-sm hover:file:bg-fuji-blue hover:file:text-white file:cursor-pointer cursor-pointer" 
                              />
                            )}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-fuji-accent border-b pb-2">Đặc tính kỹ thuật</p>
                       <div className="grid grid-cols-2 gap-4">
                          <Input name="load" label="Tải trọng" defaultValue={isEditing?.specs?.load} />
                          <Input name="speed" label="Tốc độ" defaultValue={isEditing?.specs?.speed} />
                          <Input name="pit" label="Pit" defaultValue={isEditing?.specs?.pit} />
                          <Input name="oh" label="OH" defaultValue={isEditing?.specs?.oh} />
                          <Input name="travel" label="Hành trình" defaultValue={isEditing?.specs?.travel} />
                          <Input name="stops" label="Điểm dừng" defaultValue={isEditing?.specs?.stops} />
                          <Input name="door" label="Cửa mở" defaultValue={isEditing?.specs?.door} />
                          <Input name="structure" label="Cấu trúc" defaultValue={isEditing?.specs?.structure} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-fuji-accent border-b pb-2">Chi tiết Cabin</p>
                    <div className="grid md:grid-cols-1 gap-6">
                       <Textarea name="material" label="Mô tả chi tiết cấu hình Cabin (Vật liệu, vách, sàn, trần...)" defaultValue={isEditing?.cabin?.material} rows={5} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsEditing(null)} className="flex-1 py-5 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Hủy bỏ</button>
                    <button type="submit" className="flex-1 py-5 rounded-2xl bg-fuji-blue text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-fuji-blue/20 hover:bg-fuji-accent transition-all active:scale-95">Lưu thay đổi</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function ConfiguratorManager() {
  const [configs, setConfigs] = React.useState<ConfiguratorOption[]>([]);
  const [isEditing, setIsEditing] = React.useState<ConfiguratorOption | null>(null);

  React.useEffect(() => {
    const loadConfigs = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.configurator && data.content_dict.configurator.length > 0) {
        setConfigs(data.content_dict.configurator);
      } else {
        // Default if none exists
        setConfigs([
          { id: 'gold', name: 'Luxury Gold', subtitle: 'Premium Finish', primary: '#C5A059', bg: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200', description: 'Chất liệu Inox gương vàng PVD cao cấp.' },
          { id: 'glass', name: 'Modern Glass', subtitle: 'Panoramic View', primary: '#A0A0A0', bg: 'https://images.unsplash.com/photo-1518177581177-380e2270dd7a?auto=format&fit=crop&q=80&w=1200', description: 'Vách kính cường lực panorama.' },
        ]);
      }
    };
    loadConfigs();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (isMock) {
        setIsEditing((prev: any) => ({ ...prev, bg: URL.createObjectURL(file) }));
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `config-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      setIsEditing((prev: any) => ({ ...prev, bg: publicUrl }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi khi tải ảnh lên. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-fuji-blue tracking-tighter uppercase">Bộ Mô Phỏng Nội Thất</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest italic">Quản lý các tùy chọn thiết kế cho khách hàng trải nghiệm</p>
        </div>
        <button 
          onClick={() => setIsEditing({ id: `conf_${Date.now()}`, name: '', subtitle: 'Premium Finish', primary: '#C5A059', bg: '', description: '' })}
          className="px-6 py-3 bg-fuji-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 group hover:bg-fuji-blue transition-all"
        >
          <Plus size={16} /> Thêm tùy chọn mới
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {configs.map((config) => (
          <div key={config.id} className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 group relative">
            <div className="absolute top-8 right-8 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => setIsEditing(config)} className="w-8 h-8 bg-white text-fuji-blue rounded-lg flex items-center justify-center shadow-lg hover:bg-fuji-blue hover:text-white transition-all"><Edit2 size={14} /></button>
               <button 
                 onClick={async () => {
                    if(confirm('Xóa tùy chọn thiết kế này?')) {
                      const newConfigs = configs.filter((c: ConfiguratorOption) => c.id !== config.id);
                      setConfigs(newConfigs);
                      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
                      const currentDict = data?.content_dict || {};
                      currentDict.configurator = newConfigs;
                      await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
                    }
                 }}
                 className="w-8 h-8 bg-white text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
               ><Trash2 size={14} /></button>
            </div>
            <div className="h-48 rounded-2xl overflow-hidden mb-6 relative">
              {config.bg ? (
                <img src={config.bg} alt={config.name} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200' }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No Image</div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl shadow-inner border border-slate-200 shrink-0" style={{ backgroundColor: config.primary }} />
              <div>
                <h4 className="font-black text-fuji-blue uppercase tracking-tight">{config.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-1">{config.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fuji-blue/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsEditing(null)} className="absolute top-8 right-8 text-slate-300 hover:text-fuji-blue transition-all">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-fuji-blue uppercase tracking-tighter mb-8">Tùy chỉnh Mô phỏng</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const formData = new FormData(e.target as HTMLFormElement);
                const updatedConfig = {
                  ...isEditing,
                  name: formData.get('name') as string,
                  subtitle: formData.get('subtitle') as string,
                  description: formData.get('description') as string,
                  primary: formData.get('primary') as string,
                };

                const exists = configs.find((c: ConfiguratorOption) => c.id === updatedConfig.id);
                const newConfigs = exists 
                  ? configs.map((c: ConfiguratorOption) => c.id === updatedConfig.id ? updatedConfig : c)
                  : [...configs, updatedConfig];

                const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
                const currentDict = data?.content_dict || {};
                currentDict.configurator = newConfigs;
                await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
                
                setConfigs(newConfigs);
                alert('Lưu thành công!');
                setIsEditing(null);
              } catch(err) {
                console.error(err);
                alert('Lỗi khi lưu!');
              }
            }} className="space-y-6">
              <Input name="name" label="Tên kiểu thiết kế" defaultValue={isEditing.name} required />
              <Input name="subtitle" label="Phụ đề (VD: Premium Finish)" defaultValue={isEditing.subtitle} />
              <Textarea name="description" label="Mô tả chất liệu/đặc điểm" defaultValue={isEditing.description} />
              
              <div className="grid grid-cols-2 gap-6">
                <Input name="primary" type="color" label="Màu chủ đạo (Icon)" defaultValue={isEditing.primary} className="h-16" />
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Ảnh nền mô phỏng</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer" />
                  {isEditing.bg && <img src={isEditing.bg} alt="Preview" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200' }} className="h-20 w-auto rounded-xl mt-2 object-cover" />}
                </div>
              </div>

              <button type="submit" className="w-full py-5 rounded-2xl bg-fuji-blue text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-fuji-blue/20 hover:bg-fuji-accent transition-all active:scale-95 mt-4">Lưu Tùy Chọn</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function WarrantyManager() {
  const [content, setContent] = React.useState('Chính sách bảo hành Fujirise: 24 tháng cho mọi linh kiện...');
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState('');

  React.useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.warranty) {
        setContent(data.content_dict.warranty.content);
        setLastUpdated(data.content_dict.warranty.updatedAt);
      }
    };
    loadContent();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      const currentDict = data?.content_dict || {};
      const now = new Date().toLocaleString('vi-VN');
      currentDict.warranty = { content, updatedAt: now };
      
      await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
      setLastUpdated(now);
      alert('Đã cập nhật chính sách bảo hành!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi lưu!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[50px] p-12 border shadow-sm max-w-4xl mx-auto">
       <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-fuji-blue tracking-tighter uppercase">Chính sách bảo hành</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest italic">Quy định & Điều khoản</p>
          </div>
       </div>
       <div className="space-y-6">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-8 bg-slate-50 rounded-[30px] border-none outline-none font-medium text-slate-600 leading-relaxed focus:bg-white focus:ring-4 focus:ring-fuji-accent/10 transition-all"
            placeholder="Nhập nội dung chính sách bảo hành chi tiết..."
          />
          <div className="flex justify-between items-center bg-fuji-line p-6 rounded-3xl">
             <div className="flex items-center gap-2 text-slate-400">
               <Clock size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">
                 {lastUpdated ? `Cập nhật: ${lastUpdated}` : 'Chưa có bản cập nhật nào'}
               </span>
             </div>
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="px-12 py-5 bg-fuji-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all active:scale-95 disabled:opacity-50"
             >
               {isSaving ? 'Đang lưu...' : 'Cập nhật chính sách'}
             </button>
          </div>
       </div>
    </div>
  );
}

function SettingsManager() {
  const [font, setFont] = React.useState('Montserrat');
  const [accent, setAccent] = React.useState('#C5A059');
  const [tgToken, setTgToken] = React.useState('8650537472:AAEL9KW4PazTORaf05am8dti6OsIQcA12mo');
  const [tgChatId, setTgChatId] = React.useState('YOUR_CHAT_ID');
  const [supaUrl, setSupaUrl] = React.useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [supaKey, setSupaKey] = React.useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [aiKey, setAiKey] = React.useState('AIzaSyDzUO_-yu0h0gWMSB5asCZjOuYXviXpBus');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const loadConfigs = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.api_config) {
        const api = data.content_dict.api_config;
        if (api.aiKey) setAiKey(api.aiKey);
        if (api.tgToken) setTgToken(api.tgToken);
        if (api.tgChatId) setTgChatId(api.tgChatId);
      }
    };
    loadConfigs();
  }, []);

  const handleSaveAPI = async () => {
    setIsSaving(true);
    try {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      const currentDict = data?.content_dict || {};
      currentDict.api_config = { aiKey, tgToken, tgChatId };
      
      await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
      alert('Lưu cấu hình API thành công! Các dịch vụ sẽ tự động sử dụng Key mới.');
    } catch (error) {
      console.error(error);
      alert('Có lỗi khi lưu cấu hình.');
    } finally {
      setIsSaving(false);
    }
  };

  const testTelegram = async () => {
    if (!tgToken || !tgChatId) {
      alert('Vui lòng nhập đủ Token và Chat ID');
      return;
    }
    try {
      const url = `https://api.telegram.org/bot${tgToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: "✅ Kết nối Telegram với website Fujirise thành công!"
        })
      });
      if (res.ok) alert("Gửi tin nhắn test thành công! Hãy kiểm tra ứng dụng Telegram.");
      else alert("Lỗi gửi tin. Vui lòng kiểm tra lại Token hoặc Chat ID.");
    } catch (err) {
      alert("Lỗi kết nối đến Telegram API.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight flex items-center gap-3">
          <BrainCircuit size={20} className="text-fuji-accent" /> Cấu hình API Hệ thống
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
           <Input label="Supabase Project URL (Cố định trong Vercel)" value={supaUrl} disabled />
           <Input label="Supabase Anon Key (Cố định trong Vercel)" type="password" value={supaKey} disabled />
           <Input label="Gemini AI API Key" type="password" value={aiKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiKey(e.target.value)} />
        </div>
        <div className="mt-6 flex justify-end">
           <button onClick={handleSaveAPI} disabled={isSaving} className="px-8 py-4 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all disabled:opacity-50">
             {isSaving ? 'Đang lưu...' : 'Lưu cấu hình API'}
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-10 uppercase tracking-tight flex items-center gap-3">
          <Settings size={20} className="text-fuji-accent" /> Cấu hình thương hiệu
        </h3>
        <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phông chữ hệ thống</label>
                 <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none font-bold text-fuji-blue outline-none">
                    <option value="Montserrat">Strong & Geometric (Montserrat)</option>
                    <option value="Inter">Clean & Minimal (Inter)</option>
                    <option value="Playfair Display">Elegant Serif (Playfair)</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Màu chủ đạo (Accent)</label>
                 <div className="flex gap-4">
                    <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-16 h-16 rounded-2xl border-none p-0 overflow-hidden cursor-pointer bg-transparent" />
                    <input value={accent} onChange={(e) => setAccent(e.target.value)} className="flex-1 px-6 py-5 rounded-2xl bg-slate-50 border-none font-mono text-xs font-bold" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-fuji-blue rounded-[50px] p-12 shadow-sm text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuji-accent/10 rounded-full blur-[100px]" />
        <h3 className="text-xl font-black mb-10 uppercase tracking-tight flex items-center gap-3 relative z-10">
          <Smartphone size={20} className="text-fuji-accent" /> Tích hợp Telegram (Master Control)
        </h3>
        <div className="space-y-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Bot Token</label>
              <input type="text" value={tgToken} onChange={(e) => setTgToken(e.target.value)} className="w-full px-6 py-5 rounded-3xl bg-white/10 border border-white/10 outline-none font-mono text-xs text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Chat ID</label>
              <input type="text" value={tgChatId} onChange={(e) => setTgChatId(e.target.value)} className="w-full px-6 py-5 rounded-3xl bg-white/10 border border-white/10 outline-none font-mono text-xs text-white" />
            </div>
          </div>
          <div className="p-6 bg-white/5 rounded-[30px] border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={20} />
                <p className="text-[10px] font-black uppercase tracking-widest">Kết nối ổn định</p>
             </div>
         <button onClick={testTelegram} className="text-[10px] font-black uppercase tracking-widest text-fuji-accent hover:underline">Gửi tin nhắn test</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebContentManager() {
  const [content, setContent] = React.useState<WebContent>({
    logoImage: "/logo.svg",
    heroTitle: "THIẾT LẬP TIÊU CHUẨN SỐNG",
    heroDesc: "Fujirise không chỉ kiến tạo giải pháp di động, chúng tôi định hình phong cách sống hiện đại và an tâm bậc nhất cho mọi gia đình Việt.",
    heroImage: "",
    aboutImage: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80&w=1000",
    hotline: "0868822210",
    email: "info.fujirise@gmail.com",
    zalo: "https://zalo.me/0868822210",
    facebook: "https://facebook.com/fujirise",
    address: "Tầng 2, VA03B-6 Villa Hoàng Thành, Mỗ Lao, Hà Đông, Hà Nội",
    mapIframeSrc: "",
    mapShareLink: ""
  });

  React.useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.web_content) {
        setContent((prev) => ({ ...prev, ...data.content_dict.web_content }));
      }
    };
    loadContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newContent = {
      ...content,
      heroTitle: formData.get('heroTitle') as string,
      heroDesc: formData.get('heroDesc') as string,
      hotline: formData.get('hotline') as string,
      email: formData.get('email') as string,
      zalo: formData.get('zalo') as string,
      facebook: formData.get('facebook') as string,
      address: formData.get('address') as string,
      mapIframeSrc: formData.get('mapIframeSrc') as string,
      mapShareLink: formData.get('mapShareLink') as string,
    };

    try {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      const currentDict = data?.content_dict || {};
      currentDict.web_content = newContent;
      await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
      setContent(newContent);
      alert('Đã lưu nội dung Website thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi lưu!');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof WebContent) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (isMock) {
        setContent((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
        return;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `web-${field}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      setContent((prev) => ({ ...prev, [field]: publicUrl }));
    } catch (error) {
      console.error(error);
      alert('Lỗi upload ảnh!');
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight flex items-center gap-3">
          <Type size={20} className="text-fuji-accent" /> Quản lý Nội dung Trang chủ
        </h3>
        <div className="space-y-6">
          <Input name="heroTitle" label="Tiêu đề Banner (Hero)" defaultValue={content.heroTitle} />
          <Textarea name="heroDesc" label="Đoạn mô tả ngắn (Slogan)" defaultValue={content.heroDesc} />
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
             <div className="space-y-2 col-span-2 md:col-span-1">
               <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Logo Website</label>
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoImage')} className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer" />
               {content.logoImage && <img src={content.logoImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.svg'; }} alt="Logo" className="h-16 w-auto object-contain mt-2 p-2 bg-slate-100 rounded-xl" />}
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Ảnh nền Trang chủ (Hero/Menu)</label>
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer" />
               {content.heroImage && <img src={content.heroImage} alt="Hero" className="h-24 w-auto rounded-xl object-cover mt-2" />}
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Ảnh Giới thiệu (Về chúng tôi)</label>
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'aboutImage')} className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer" />
               {content.aboutImage && <img src={content.aboutImage} alt="About" className="h-24 w-auto rounded-xl object-cover mt-2" />}
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight flex items-center gap-3">
          <Type size={20} className="text-fuji-accent" /> Thông tin Liên hệ (Footer & Contact)
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Input name="hotline" label="Số điện thoại (Hotline)" defaultValue={content.hotline} />
          <Input name="email" label="Email" defaultValue={content.email} />
          <Input name="zalo" label="Link Zalo" defaultValue={content.zalo} />
          <Input name="facebook" label="Link Facebook" defaultValue={content.facebook} />
        </div>
        <Textarea name="address" label="Địa chỉ văn phòng" defaultValue={content.address} />
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Input name="mapIframeSrc" label="Link nhúng bản đồ (Iframe URL)" defaultValue={content.mapIframeSrc} placeholder="Bỏ trống để tự động tạo từ địa chỉ" />
          <Input name="mapShareLink" label="Link Google Maps (Share Link)" defaultValue={content.mapShareLink} placeholder="Bỏ trống để tự động tạo từ địa chỉ" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-10 py-4 bg-fuji-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all active:scale-95">
          Lưu thay đổi nội dung
        </button>
      </div>
    </form>
  );
}

function NewsManager() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isEditing, setIsEditing] = React.useState<Post | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (data?.content_dict?.posts && data.content_dict.posts.length > 0) {
        setPosts(data.content_dict.posts);
      } else {
        // Tạo 10 tin tức mẫu để kiểm thử
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
          images: [
            `https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=400&sig=${i}`,
            `https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=400&sig=${i+1}`,
            `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400&sig=${i+2}`
          ],
          imageUrl: `https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=400&sig=${i}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }));
        setPosts(dummyPosts as Post[]);
        // Tự động lưu 10 bài viết mẫu vào DB
        const currentDict = data?.content_dict || {};
        currentDict.posts = dummyPosts;
        await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
      }
    };
    fetchPosts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !isEditing) return;

    const currentImages = isEditing?.images || [];
    const slotsLeft = 30 - currentImages.length;
    const filesToUpload = files.slice(0, slotsLeft);

    if (files.length > slotsLeft) {
      alert(`Chỉ có thể thêm tối đa 30 ảnh. Đã bỏ qua ${files.length - slotsLeft} ảnh.`);
    }

    try {
      const newUrls = await Promise.all(filesToUpload.map(async (file: File) => {
        const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (isMock) return URL.createObjectURL(file);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `post-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        return publicUrl;
      }));

      setIsEditing(prev => {
        if (!prev) return null;
        const updatedImages = [...(prev.images || []), ...newUrls].slice(0, 30);
        return { ...prev, images: updatedImages, imageUrl: updatedImages[0] };
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi upload ảnh!');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setIsEditing(prev => {
      if (!prev) return null;
      const updatedImages = (prev.images || []).filter((_, index) => index !== indexToRemove);
      return { ...prev, images: updatedImages, imageUrl: updatedImages[0] || '' };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedPost: Post = {
        ...isEditing,
        title: formData.get('title') as string,
        category: formData.get('category') as string,
        summary: formData.get('summary') as string,
        content: formData.get('content') as string,
        link: formData.get('link') as string,
        createdAt: formData.get('createdAt') ? new Date(formData.get('createdAt') as string).toISOString() : isEditing.createdAt,
      };

      let newPosts;
      const exists = posts.find(p => p.id === updatedPost.id);
      if (exists) {
        newPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
      } else {
        newPosts = [...posts, updatedPost];
      }

      const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      const currentDict = data?.content_dict || {};
      currentDict.posts = newPosts;
      await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');

      setPosts(newPosts);
      setIsEditing(null);
      alert('Lưu bài viết thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu bài viết!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    const newPosts = posts.filter(p => p.id !== id);
    
    const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
    const currentDict = data?.content_dict || {};
    currentDict.posts = newPosts;
    await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');

    setPosts(newPosts);
  };

  const handleApproveComment = (commentId: string) => {
    setIsEditing(prev => {
      if (!prev) return prev;
      const updatedComments = (prev.comments || []).map((c: any) => c.id === commentId ? { ...c, isApproved: true } : c);
      return { ...prev, comments: updatedComments };
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    setIsEditing(prev => {
      if (!prev) return prev;
      const updatedComments = (prev.comments || []).filter((c: any) => c.id !== commentId);
      return { ...prev, comments: updatedComments };
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-fuji-blue tracking-tighter uppercase">Tin tức & Sự kiện</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest italic">Quản lý bài viết, hoạt động, quảng cáo</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if(!confirm('Thêm 10 bài viết mẫu về thang máy vào danh sách?')) return;
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
                id: Date.now() + i, title: d.title, category: d.cat, summary: d.sum, content: `Đây là nội dung chi tiết cho bài viết: **${d.title}**.\n\nSự kiện này đánh dấu sự phát triển vượt bậc của hệ sinh thái thang máy gia đình. Fujirise cam kết mang đến sự an toàn, thiết kế sang trọng và trải nghiệm dịch vụ xuất sắc.\n\n[img:1]\n\nKính mời quý khách hàng theo dõi thêm các hoạt động sắp tới của chúng tôi.`,
                images: [`https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=400&sig=${i}`, `https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=400&sig=${i+1}`, `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400&sig=${i+2}`],
                imageUrl: `https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=400&sig=${i}`,
                createdAt: new Date(Date.now() - i * 86400000).toISOString(),
              }));
              const newPosts = [...dummyPosts, ...posts];
              const { data } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
              const currentDict = data?.content_dict || {};
              currentDict.posts = newPosts;
              await supabase.from('site_settings').update({ content_dict: currentDict }).eq('id', 'default');
              setPosts(newPosts);
              alert('Đã thêm 10 bài viết mẫu thành công!');
            }}
            className="px-4 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Tạo 10 bài test
          </button>
          <button
            onClick={() => setIsEditing({ id: Date.now(), title: '', category: 'Tin tức', summary: '', content: '', images: [], imageUrl: '', createdAt: new Date().toISOString() })}
            className="px-6 py-3 bg-fuji-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 group hover:bg-fuji-blue transition-all"
          >
            <Plus size={16} /> Thêm bài viết
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group flex flex-col">
            <div className="h-28 rounded-xl overflow-hidden mb-3 relative flex gap-1">
              {post.images && post.images.length > 1 ? (
                <>
                  <img src={post.images[0]} alt={post.title} className="w-2/3 h-full object-cover" />
                  <div className="w-1/3 flex flex-col gap-1">
                    <img src={post.images[1]} className="w-full h-1/2 object-cover" />
                    {post.images[2] ? (
                      <img src={post.images[2]} className="w-full h-1/2 object-cover" />
                    ) : (
                      <div className="w-full h-1/2 bg-slate-50" />
                    )}
                  </div>
                </>
              ) : (
                <img src={post.images?.[0] || post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(post)} className="w-6 h-6 bg-white/80 backdrop-blur-sm text-fuji-blue rounded flex items-center justify-center shadow hover:bg-fuji-blue hover:text-white"><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(post.id)} className="w-6 h-6 bg-white/80 backdrop-blur-sm text-red-500 rounded flex items-center justify-center shadow hover:bg-red-500 hover:text-white"><Trash2 size={12} /></button>
              </div>
            </div>
        <div className="flex justify-between items-center mb-2">
          <span className="px-2 py-0.5 bg-fuji-accent/10 text-fuji-accent rounded text-[8px] font-black uppercase tracking-wider">{post.category}</span>
          <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
            <span className="flex items-center gap-0.5"><ThumbsUp size={10} /> {(post as any).likes || 0}</span>
            <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {((post as any).comments || []).length}</span>
          </div>
        </div>
        <h4 className="font-serif font-bold text-slate-800 text-xs tracking-tighter leading-tight mb-1 line-clamp-2">{post.title}</h4>
        <p className="text-[10px] text-slate-500 font-sans leading-snug line-clamp-3">{post.summary}</p>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fuji-blue/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsEditing(null)} className="absolute top-8 right-8 text-slate-300 hover:text-fuji-blue"><X size={24} /></button>
            <h3 className="text-2xl font-black text-fuji-blue uppercase tracking-tighter mb-8">Soạn thảo Bài viết</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <Input name="title" label="Tiêu đề bài viết" defaultValue={isEditing.title} required />
              <div className="grid grid-cols-2 gap-6">
                <Input name="category" label="Chuyên mục" defaultValue={isEditing.category} placeholder="Tin tức, Sự kiện,..." />
                <Input name="link" label="Link chi tiết (nếu có)" defaultValue={isEditing.link} />
              </div>
              <Input name="createdAt" type="datetime-local" label="Ngày giờ đăng bài" defaultValue={isEditing.createdAt ? new Date(new Date(isEditing.createdAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} required />
              <Textarea name="summary" label="Mô tả ngắn" defaultValue={isEditing.summary} rows={3} />
              <RichTextEditor name="content" label="Nội dung chi tiết (Bôi đen chữ và sử dụng thanh công cụ bên dưới)" defaultValue={isEditing.content} />
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Hình ảnh bài viết (Tối đa 30 ảnh - Dùng [img:1], [img:2] để chèn)</label>
                <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  { (isEditing.images && isEditing.images.length > 0) && (
                    <div className="flex flex-wrap gap-3">
                      {isEditing.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Preview ${idx}`} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm shrink-0" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!isEditing.images || isEditing.images.length < 30) && (
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-xs font-bold text-slate-500 cursor-pointer" />
                  )}
                </div>
              </div>
              <button type="submit" className="w-full py-5 rounded-2xl bg-fuji-blue text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-fuji-blue/20 hover:bg-fuji-accent transition-all active:scale-95 mt-4">Lưu Bài viết</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function UserManager() {
  const [accounts, setAccounts] = React.useState<AdminUser[]>([]);
  const [isEditing, setIsEditing] = React.useState<Partial<AdminUser> | null>(null);
  const [newPassword, setNewPassword] = React.useState('');

  const fetchAccounts = async () => {
    const { data } = await supabase.from('admins').select('id, email, full_name, role');
    if (data) setAccounts(data as AdminUser[]);
  };

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    const payload: Partial<AdminUser> & { password?: string } = {
      email: isEditing.email,
      full_name: isEditing.full_name,
      role: isEditing.role,
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    if (isEditing.id) { // Update
      await supabase.from('admins').update(payload).eq('id', isEditing.id);
    } else { // Create
      if (!newPassword) { alert('Vui lòng nhập mật khẩu cho tài khoản mới.'); return; }
      await supabase.from('admins').insert(payload);
    }
    
    if (newPassword) {
      const msg = `🔐 <b>CẬP NHẬT MẬT KHẨU</b>\n----------------------------\n<b>Tài khoản:</b> ${payload.email}\n<b>Mật khẩu mới:</b> <code>${newPassword}</code>\n----------------------------\n<i>Mật khẩu được cấp bởi Quản trị viên.</i>`;
      await sendToTelegram(msg, 'auth');
      alert(`Đã cập nhật và gửi thông báo mật khẩu mới cho tài khoản ${payload.email} qua Telegram.`);
    }

    await fetchAccounts();
    setIsEditing(null);
    setNewPassword('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) return;
    await supabase.from('admins').delete().eq('id', id);
    await fetchAccounts();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-fuji-blue uppercase tracking-tight flex items-center gap-3">
            <Users2 size={20} className="text-fuji-accent" /> Quản lý Tài khoản Nhân viên
          </h3>
          <button onClick={() => setIsEditing({ role: 'editor' })} className="px-6 py-3 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-all flex items-center gap-2">
            <Plus size={14} /> Thêm tài khoản
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nhân viên</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} className="border-b border-slate-50 last:border-none">
                  <td className="p-4 font-bold text-fuji-blue">{acc.full_name}<p className="font-medium text-xs text-slate-400">{acc.email}</p></td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${acc.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{acc.role}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsEditing(acc)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-fuji-blue hover:text-white"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(acc.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-fuji-blue/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setIsEditing(null)} className="absolute top-8 right-8 text-slate-300 hover:text-fuji-blue"><X size={24} /></button>
            <h3 className="text-2xl font-black text-fuji-blue uppercase tracking-tighter mb-8">{isEditing.id ? 'Cập nhật' : 'Tạo mới'} Tài khoản</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <Input label="Họ và tên" value={isEditing.full_name || ''} onChange={(e: any) => setIsEditing({...isEditing, full_name: e.target.value})} required />
              <Input label="Email" type="email" value={isEditing.email || ''} onChange={(e: any) => setIsEditing({...isEditing, email: e.target.value})} required />
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">Vai trò</label>
                <select value={isEditing.role} onChange={(e: any) => setIsEditing({...isEditing, role: e.target.value as 'admin' | 'editor'})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-fuji-blue">
                  <option value="editor">Editor (Soạn thảo)</option>
                  <option value="admin">Admin (Quản trị)</option>
                </select>
              </div>
              <Input label="Mật khẩu mới" type="text" placeholder={isEditing.id ? "Bỏ trống nếu không đổi" : "Bắt buộc cho tài khoản mới"} value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
              <button type="submit" className="w-full py-5 rounded-2xl bg-fuji-blue text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all mt-4">Lưu Tài khoản</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, trend, positive }: { icon: React.ReactNode; label: string; value: string | number; trend: string; positive: boolean }) {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
          positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        )}>
          {trend}
        </div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h4>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1 cursor-text">
       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">{label}</label>
     <input {...props} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-fuji-blue focus:bg-white focus:ring-2 focus:ring-fuji-accent/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
    </div>
  );
}

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1">
       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">{label}</label>
       <textarea {...props} rows={props.rows || 2} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-fuji-blue focus:bg-white focus:ring-2 focus:ring-fuji-accent/10 transition-all resize-none" />
    </div>
  );
}

function RichTextEditor({ name, label, defaultValue }: { name: string, label: string, defaultValue?: string }) {
  const [val, setVal] = React.useState(defaultValue || '');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const newVal = text.substring(0, start) + before + selected + after + text.substring(end);
    setVal(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className="space-y-1">
       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">{label}</label>
       <div className="bg-slate-50 rounded-2xl border-none overflow-hidden focus-within:ring-2 focus-within:ring-fuji-accent/10 transition-all border border-slate-100">
          <div className="flex flex-wrap gap-2 p-3 bg-slate-200/50 border-b border-slate-100">
            <button type="button" onClick={() => insertText('**', '**')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black hover:bg-fuji-blue hover:text-white transition-colors" title="In đậm">B</button>
            <button type="button" onClick={() => insertText('1. ')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black hover:bg-fuji-blue hover:text-white transition-colors" title="Tiêu đề lớn (Heading 1)">H1</button>
            <button type="button" onClick={() => insertText('1.1. ')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black hover:bg-fuji-blue hover:text-white transition-colors" title="Tiêu đề phụ (Heading 2)">H2</button>
            <button type="button" onClick={() => insertText('> ')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black hover:bg-fuji-blue hover:text-white transition-colors flex items-center gap-1" title="Khối trích dẫn (Quote)"><Quote size={12} /> Quote</button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button type="button" onClick={() => insertText('[img:1]\n', '')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black text-fuji-accent hover:bg-fuji-accent hover:text-white transition-colors" title="Chèn vị trí Ảnh 1">Ảnh 1</button>
            <button type="button" onClick={() => insertText('[img:2]\n', '')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black text-fuji-accent hover:bg-fuji-accent hover:text-white transition-colors" title="Chèn vị trí Ảnh 2">Ảnh 2</button>
            <button type="button" onClick={() => insertText('[img:3]\n', '')} className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black text-fuji-accent hover:bg-fuji-accent hover:text-white transition-colors" title="Chèn vị trí Ảnh 3">Ảnh 3</button>
          </div>
          <textarea ref={textareaRef} name={name} value={val} onChange={(e) => setVal(e.target.value)} rows={20} className="w-full px-6 py-4 bg-transparent border-none outline-none font-medium text-slate-700 resize-y leading-relaxed" />
       </div>
    </div>
  );
}

const MapPin = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);