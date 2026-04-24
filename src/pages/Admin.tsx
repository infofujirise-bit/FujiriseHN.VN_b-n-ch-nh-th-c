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
  Palette
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
import { supabase, Lead, Product } from '../lib/supabase';
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
}

const CHART_DATA = [
  { name: 'Th2', leads: 400 },
  { name: 'Th3', leads: 300 },
  { name: 'Th4', leads: 200 },
  { name: 'Th5', leads: 278 },
  { name: 'Th6', leads: 189 },
  { name: 'Th7', leads: 239 },
  { name: 'CN', leads: 349 },
];

const DISTRIBUTION_DATA = [
  { name: 'Mini', value: 400 },
  { name: 'Kính', value: 300 },
  { name: 'Inox', value: 200 },
];

type Tab = 'dashboard' | 'content' | 'jobs' | 'users' | 'images' | 'settings' | 'warranty' | 'web_content' | 'configurator';

const ADMIN_EMAIL = 'info.fujirise@gmail.com';

export default function Admin() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = React.useState(false);
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
        setUser(JSON.parse(localSession));
        setIsAdminUser(true);
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await checkAdmin(session.user);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (session) {
        await checkAdmin(session.user);
      } else {
        // Chỉ đăng xuất nếu không có phiên đăng nhập cục bộ
        if (!localStorage.getItem('fuji_admin_session')) {
          setUser(null);
          setIsAdminUser(false);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (u: User) => {
    // Specific check for the admin email
    if (u.email === ADMIN_EMAIL) {
      setIsAdminUser(true);
      setUser(u);
      return;
    }

    try {
      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('id', u.id)
        .single();

      if (data) {
        setIsAdminUser(true);
        setUser(u);
      } else {
        setError(`Tài khoản ${u.email} không có quyền truy cập.`);
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Admin check error:", err);
      setError("Lỗi xác thực quyền admin.");
    }
  };

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

      if (fetchError || !data) {
        setError('Email hoặc mật khẩu không chính xác.');
        return;
      }

      // 2. Set user session (using dummy metadata to match existing code)
      const adminUser = {
        email: data.email,
        user_metadata: { full_name: data.role === 'admin' ? 'Administrator' : data.email },
        id: data.id
      };
      setUser(adminUser as unknown as User);
      setIsAdminUser(true);
      // Lưu lại phiên đăng nhập để tránh bị thoát khi load lại trang
      localStorage.setItem('fuji_admin_session', JSON.stringify(adminUser));
      
      // Notify Telegram about admin login
      await sendToTelegram(`🔐 <b>ADMIN LOGIN</b>\n----------------------------\n<b>User:</b> ${data.email}\n<b>Time:</b> ${new Date().toLocaleString('vi-VN')}`, 'auth');
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Lỗi kết nối tới hệ thống.');
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAdminUser(false);
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

  if (!user || !isAdminUser) {
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
          <NavBtn icon={<ShieldCheck size={20} />} label="Chính sách" active={activeTab === 'warranty'} onClick={() => setActiveTab('warranty')} />
          
          <div className="h-4" />
          <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Cấu hình</p>
          <NavBtn icon={<Briefcase size={20} />} label="Đăng tuyển" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <NavBtn icon={<Type size={20} />} label="Nội dung Web" active={activeTab === 'web_content'} onClick={() => setActiveTab('web_content')} />
          <NavBtn icon={<Settings size={20} />} label="Cài đặt" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-6 shrink-0 border-t border-white/5">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-4">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full border-2 border-fuji-accent overflow-hidden bg-fuji-line flex items-center justify-center">
                 {user?.user_metadata?.avatar_url ? (
                   <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                 ) : (
                   <Users size={16} className="text-white/30" />
                 )}
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black truncate">{user?.user_metadata?.full_name || 'Admin'}</p>
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
  const [stats, setStats] = React.useState({ totalLeads: 0, newLeads: 0, conversion: '3.2%' });
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      const { count: newCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new');
      setStats({ totalLeads: count || 0, newLeads: newCount || 0, conversion: '3.2%' });
    };
    fetchStats();
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
        <StatCard icon={<MessageSquare className="text-blue-500" />} label="Tổng yêu cầu" value={stats.totalLeads} trend="+12%" positive={true} />
        <StatCard icon={<AlertCircle className="text-orange-500" />} label="Chờ xử lý" value={stats.newLeads} trend="Urgent" positive={false} />
        <StatCard icon={<Activity className="text-green-500" />} label="Chuyển đổi" value={stats.conversion} trend="+0.5%" positive={true} />
        <StatCard icon={<ShieldCheck className="text-indigo-500" />} label="Hệ thống" value="Active" trend="Stable" positive={true} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={CHART_DATA}>
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
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#C5A059" strokeWidth="10" strokeDasharray="210 283" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-fuji-blue">75%</span>
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
          model: 'GEH100S - Thang không đối trọng, công nghệ cáp dẹt',
          category: 'Thang máy Homelife',
          technology: 'Cáp kéo',
          specs: { load: '350kg', speed: '0.4 m/s', pit: '250mm', oh: '2850 mm', travel: '< hoặc = 15m', stops: '< hoặc = 6', door: 'Mở tâm 2 cánh, mở 1 cánh, mở bản lề tự động', structure: 'Hố thang xây hoặc hố sử dụng khung hợp kim nhôm / Khung thép' },
          cabin: {
            material: 'Lựa chọn linh hoạt giữa inox sọc nhuyễn, inox hoa văn tinh xảo hoặc kính cường lực hiện đại, phù hợp nhiều phong cách thiết kế.',
            backWall: 'Tạo điểm nhấn đẳng cấp, nâng tầm thẩm mỹ không gian nội thất.',
            floor: 'Chống trơn trượt, dễ vệ sinh, đảm bảo an toàn và độ bền trong quá trình sử dụng.',
            ceiling: 'Hệ thống chiếu sáng với hiệu ứng ánh sáng hiện đại, mang lại cảm giác ấm cúng và sang trọng.'
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
            model: '', 
            category: 'Thang máy Homelife', 
            technology: 'Cáp kéo', 
            specs: { load: '', speed: '', pit: '', oh: '', travel: '', stops: '', door: '', structure: '' }, 
            cabin: { material: '', backWall: '', floor: '', ceiling: '' } 
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
              <img src={product.images?.[0] || product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-fuji-blue/20" />
            </div>
            <div className="md:col-span-3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-black text-fuji-accent uppercase tracking-widest">{product.category}</span>
                  <h3 className="text-xl font-black text-fuji-blue uppercase tracking-tight">{product.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Model: {product.model} - {product.technology}</p>
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
                <p className="text-[10px] text-slate-500 line-clamp-2 italic font-medium leading-relaxed">Vật liệu: {product.cabin?.material || 'Chưa cập nhật'}</p>
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
                    model: (formData.get('model') as string) || isEditing?.model,
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
                      backWall: (formData.get('backWall') as string) || isEditing?.cabin?.backWall,
                      floor: (formData.get('floor') as string) || isEditing?.cabin?.floor,
                      ceiling: (formData.get('ceiling') as string) || isEditing?.cabin?.ceiling,
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
                       <Input name="model" label="Model" defaultValue={isEditing?.model} />
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
                       <Textarea name="material" label="Chất liệu cabin cao cấp" defaultValue={isEditing?.cabin?.material} />
                       <Textarea name="backWall" label="Vách sau ốp đá" defaultValue={isEditing?.cabin?.backWall} />
                       <Textarea name="floor" label="Sàn PVC" defaultValue={isEditing?.cabin?.floor} />
                       <Textarea name="ceiling" label="Trần đèn trang trí" defaultValue={isEditing?.cabin?.ceiling} />
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight flex items-center gap-3">
          <BrainCircuit size={20} className="text-fuji-accent" /> Cấu hình API Hệ thống
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
           <Input label="Supabase Project URL" value={supaUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupaUrl(e.target.value)} />
           <Input label="Supabase Anon Key" type="password" value={supaKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupaKey(e.target.value)} />
           <Input label="Gemini AI API Key" type="password" value={aiKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiKey(e.target.value)} />
        </div>
        <div className="mt-6 flex justify-end">
           <button className="px-8 py-4 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all">
             Lưu cấu hình API
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
             <button className="text-[10px] font-black uppercase tracking-widest text-fuji-accent hover:underline">Gửi tin nhắn test</button>
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
    address: "Tầng 2, VA03B-6 Villa Hoàng Thành, Mỗ Lao, Hà Đông, Hà Nội"
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
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-10 py-4 bg-fuji-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all active:scale-95">
          Lưu thay đổi nội dung
        </button>
      </div>
    </form>
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
       <input {...props} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-fuji-blue focus:bg-white focus:ring-2 focus:ring-fuji-accent/10 transition-all" />
    </div>
  );
}

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1">
       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1 block">{label}</label>
       <textarea {...props} rows={2} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-fuji-blue focus:bg-white focus:ring-2 focus:ring-fuji-accent/10 transition-all resize-none" />
    </div>
  );
}

const MapPin = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
