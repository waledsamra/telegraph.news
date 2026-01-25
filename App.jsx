
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, User, Trash2, FileText, CheckCircle,
  BarChart3, LogOut, Star, Shield, Check, X, Lock, Users, 
  MessageSquare, Megaphone, AlertTriangle, Settings, TrendingUp, 
  Plus, Lightbulb, Activity, RefreshCw, Hash, Database, Smartphone, 
  Key, UserPlus, Send, Loader2, History, Filter, Search, Download, 
  Printer, FileSpreadsheet, Calendar, ChevronRight, ChevronLeft, 
  MoreVertical, Edit3, Eye, Copy, Share2, Globe, Clock, Monitor, 
  Layers, Target, Award, Bell, Mail, Info, Save, Undo, ExternalLink,
  PieChart as PieChartIcon, BarChart as BarChartIcon, Briefcase, Zap, Terminal
} from 'lucide-react';
import { supabase } from './supabaseClient';

/**
 * =================================================================
 * نظام كشف الإنتاج المطور - الإصدار الاحترافي (V1.2.0)
 * =================================================================
 */

// --- الثوابت الرئيسية ---
const DEPARTMENTS = [
  { id: 'politics', name: 'السياسة', color: 'bg-red-500', icon: Globe },
  { id: 'economy', name: 'الاقتصاد', color: 'bg-green-500', icon: TrendingUp },
  { id: 'sports', name: 'الرياضة', color: 'bg-blue-500', icon: Award },
  { id: 'culture', name: 'الفن والثقافة', color: 'bg-purple-500', icon: Star },
  { id: 'accidents', name: 'الحوادث', color: 'bg-orange-500', icon: AlertTriangle },
  { id: 'world', name: 'عربي ودولي', color: 'bg-indigo-500', icon: Globe },
  { id: 'investigations', name: 'تحقيقات', color: 'bg-yellow-600', icon: Search },
  { id: 'desk', name: 'ديسك مركزي', color: 'bg-slate-700', icon: Layers },
  { id: 'tech', name: 'تكنولوجيا', color: 'bg-cyan-500', icon: Monitor },
  { id: 'general', name: 'عام', color: 'bg-gray-500', icon: FileText }
];

const PLATFORMS = [
  { id: 'web', name: 'الموقع الإلكتروني', icon: Globe },
  { id: 'facebook', name: 'فيسبوك', icon: Smartphone },
  { id: 'instagram', name: 'انستجرام', icon: Smartphone },
  { id: 'tiktok', name: 'تيك توك', icon: Smartphone },
  { id: 'youtube', name: 'يوتيوب', icon: Monitor },
  { id: 'twitter', name: 'تويتر (X)', icon: Globe }
];

const STATUSES = [
  { id: 'published', name: 'نشرت', color: 'green' },
  { id: 'desk', name: 'ديسك', color: 'orange' },
  { id: 'scheduled', name: 'مجدول', color: 'blue' },
  { id: 'draft', name: 'مسودة', color: 'gray' },
  { id: 'urgent', name: 'عاجل', color: 'red' }
];

const ROLES = { ADMIN: 'admin', EDITOR: 'editor', JOURNALIST: 'journalist' };

// --- وظائف المساعدة ---
const formatDateTime = (dateStr) => {
  if (!dateStr) return '---';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateStr));
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diffInSeconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diffInSeconds < 60) return 'منذ ثوانٍ';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  return formatDateTime(dateStr);
};

// --- المكونات الذرية ---
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', icon: Icon, loading = false }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:scale-[1.02]',
    secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'text-slate-500 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700'
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs rounded-xl', md: 'px-6 py-3 text-sm rounded-2xl', lg: 'px-8 py-4 text-lg rounded-3xl' };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${variants[variant]} ${sizes[size]} font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 ${className}`}>
      {loading ? <Loader2 className="animate-spin" size={20} /> : Icon && <Icon size={size === 'sm' ? 14 : 20} />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-slate-50 text-slate-500 border-slate-100'
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${colorMap[color] || colorMap.blue}`}>{children}</span>;
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-black text-slate-700 mr-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />}
      <input {...props} className={`w-full ${Icon ? 'pr-12' : 'px-6'} pl-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner`} />
    </div>
  </div>
);

const Card = ({ children, className = '', title, subtitle, icon: Icon, actions }) => (
  <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl ${className}`}>
    {(title || actions) && (
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          {Icon && <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icon size={20}/></div>}
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-none">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    )}
    <div className="p-8">{children}</div>
  </div>
);

// --- شاشة تسجيل الدخول المحدثة ---
function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', agencyId: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return setError({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    
    setLoading(true); setError(null);

    try {
      // فحص سريع لجودة المفتاح في Client
      const key = (await import('./supabaseClient')).supabase.supabaseKey;
      if (!key || !key.startsWith('eyJ')) {
        throw new Error('CONFIG_ERROR: مفتاح Supabase Key غير صالح. يجب أن يبدأ بـ eyJ. يرجى تعديل supabaseClient.js');
      }

      if (isRegistering) {
        if (joinExisting) {
          const { data: agency, error: agencyErr } = await supabase.from('agencies').select('id').eq('id', formData.agencyId).single();
          if (agencyErr || !agency) throw new Error('كود المؤسسة غير موجود، تأكد من الرقم الصحيح.');

          const newUser = {
            id: String(Date.now()),
            name: formData.name,
            username: formData.username.toLowerCase().trim(),
            password: formData.password,
            role: ROLES.JOURNALIST,
            agency_id: formData.agencyId,
            approved: false
          };
          const { error: insErr } = await supabase.from('users').insert([newUser]);
          if (insErr) throw insErr;
          alert('تم تقديم الطلب بنجاح! انتظر تفعيل حسابك من الإدارة.');
          setIsRegistering(false);
        } else {
          const newAgencyId = Math.floor(100000 + Math.random() * 900000);
          const { error: agErr } = await supabase.from('agencies').insert([{ id: newAgencyId, name: `مؤسسة ${formData.name}` }]);
          if (agErr) throw agErr;
          
          await supabase.from('agency_settings').insert([{ agency_id: newAgencyId }]);
          
          const adminUser = {
            id: String(Date.now()),
            name: formData.name,
            username: formData.username.toLowerCase().trim(),
            password: formData.password,
            role: ROLES.ADMIN,
            agency_id: newAgencyId,
            approved: true
          };
          const { error: uErr } = await supabase.from('users').insert([adminUser]);
          if (uErr) throw uErr;
          onLogin(adminUser);
        }
      } else {
        const { data: users, error: dbErr } = await supabase
          .from('users')
          .select('*')
          .eq('username', formData.username.toLowerCase().trim())
          .eq('password', formData.password);

        if (dbErr) throw dbErr;
        if (users && users.length > 0) {
          if (!users[0].approved) throw new Error('حسابك بانتظار تفعيل الإدارة');
          onLogin(users[0]);
        } else {
          throw new Error('خطأ في اسم المستخدم أو كلمة المرور');
        }
      }
    } catch (err) {
      console.error('Login Error Detail:', err);
      let msg = err.message;
      if (msg.includes('Failed to fetch')) {
        msg = 'فشل الاتصال: تأكد من مفتاح API في supabaseClient.js (يجب أن يبدأ بـ eyJ).';
      }
      setError({ message: msg, raw: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-200 transform rotate-6 hover:rotate-0 transition-all">
            {isRegistering ? <UserPlus size={40} /> : <Lock size={40} />}
          </div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tight">Newsroom</h2>
          <p className="text-slate-400 mt-4 font-black uppercase text-[10px] tracking-[0.4em]">Advanced Production Control</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-3xl mb-8 text-xs font-bold border border-red-100 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>{error.message}</span>
            </div>
            {error.raw && (
              <div className="w-full mt-2 p-2 bg-red-100/50 rounded-xl text-[8px] font-mono overflow-auto max-h-20 select-all">
                DEBUG: {JSON.stringify(error.raw)}
              </div>
            )}
            <button onClick={() => window.location.reload()} className="text-[10px] underline hover:no-underline">تحديث الصفحة ↻</button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          {isRegistering && (
            <>
              <div className="flex gap-2 p-2 bg-slate-100 rounded-[2rem] mb-4">
                <button type="button" onClick={() => setJoinExisting(false)} className={`flex-1 py-3 text-[10px] font-black rounded-[1.5rem] transition-all ${!joinExisting ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>مؤسسة جديدة</button>
                <button type="button" onClick={() => setJoinExisting(true)} className={`flex-1 py-3 text-[10px] font-black rounded-[1.5rem] transition-all ${joinExisting ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>انضمام لفريق</button>
              </div>
              {joinExisting && (
                <Input label="كود المؤسسة" icon={Hash} type="number" placeholder="6 أرقام" value={formData.agencyId} onChange={e => setFormData({...formData, agencyId: e.target.value})} />
              )}
              <Input label="الاسم الكامل" icon={User} type="text" placeholder="اسمك الثلاثي" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </>
          )}
          
          <Input label="اسم المستخدم" icon={Smartphone} type="text" placeholder="أدخل اسم المستخدم" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          <Input label="كلمة المرور" icon={Key} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <Button type="submit" loading={loading} className="w-full py-5 text-lg" icon={Send} disabled={loading}>
            {isRegistering ? 'إنشاء حساب جديد' : 'دخول للمنصة'}
          </Button>
        </form>

        <button onClick={() => {setIsRegistering(!isRegistering); setError(null);}} className="w-full mt-10 text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          {isRegistering ? 'لديك حساب؟ سجل دخولك' : 'لا تملك حساباً؟ انضم الآن'}
        </button>
      </div>
    </div>
  );
}

// --- التطبيق الرئيسي ---
function MainApp({ user, onLogout }) {
  const [production, setProduction] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ headline: '', section: 'عام', status: 'نشرت', platform: 'الموقع الإلكتروني' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, usersRes] = await Promise.all([
        supabase.from('daily_production').select('*').eq('agency_id', user.agency_id).order('timestamp', { ascending: false }),
        supabase.from('users').select('*').eq('agency_id', user.agency_id)
      ]);
      setProduction(prodRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) { console.error('Load Error:', e); }
    setLoading(false);
  }, [user.agency_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.headline) return;
    const entry = {
      id: String(Date.now()),
      agency_id: user.agency_id,
      journalist_name: user.name,
      journalist_username: user.username,
      ...newArticle,
      date_string: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    try {
      await supabase.from('daily_production').insert([entry]);
      setProduction([entry, ...production]);
      setShowAddModal(false);
      setNewArticle({ headline: '', section: 'عام', status: 'نشرت', platform: 'الموقع الإلكتروني' });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans" dir="rtl">
      <aside className="w-full md:w-80 bg-white border-l border-slate-200 p-8 flex flex-col shadow-sm">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-2xl text-white shadow-xl shadow-blue-100"><Megaphone size={28}/></div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Newsroom</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard size={22}/> لوحة التحكم
          </button>
          <button onClick={() => setActiveTab('production')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'production' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileText size={22}/> سجل الإنتاج
          </button>
          {user.role === 'admin' && (
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Users size={22}/> الفريق
            </button>
          )}
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-100">
          <p className="text-sm font-black text-slate-800 text-center mb-4">{user.name}</p>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-black transition-all"><LogOut size={22}/> خروج آمن</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-slate-800">أهلاً بك 👋</h2>
          <div className="flex gap-4">
             <Badge color="blue">ID: {user.agency_id}</Badge>
             <Button onClick={() => setShowAddModal(true)} icon={Plus}>إضافة خبر</Button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card title="إنتاج اليوم" icon={TrendingUp} className="shadow-xl">
              <h4 className="text-5xl font-black text-blue-600">{production.filter(p => p.date_string === new Date().toISOString().split('T')[0]).length}</h4>
            </Card>
            <Card title="إجمالي الأرشيف" icon={FileText} className="shadow-xl">
              <h4 className="text-5xl font-black text-indigo-600">{production.length}</h4>
            </Card>
            <Card title="الأعضاء" icon={Users} className="shadow-xl">
              <h4 className="text-5xl font-black text-orange-600">{users.length}</h4>
            </Card>
          </div>
        ) : (
          <Card className="shadow-2xl no-padding" title="سجل الإنتاج">
             <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6">الصحفي</th>
                      <th className="px-8 py-6">العنوان</th>
                      <th className="px-8 py-6">القسم</th>
                      <th className="px-8 py-6">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {production.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-8 py-6 font-black text-slate-800 whitespace-nowrap">{p.journalist_name}</td>
                        <td className="px-8 py-6 font-bold text-slate-600 max-w-md truncate">{p.headline}</td>
                        <td className="px-8 py-6"><Badge color="blue">{p.section}</Badge></td>
                        <td className="px-8 py-6"><Badge color={p.status === 'نشرت' ? 'green' : 'orange'}>{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </Card>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl animate-in zoom-in duration-300" title="إضافة إنتاج">
            <form onSubmit={handleAddArticle} className="space-y-6">
              <Input label="العنوان" required value={newArticle.headline} onChange={e => setNewArticle({...newArticle, headline: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black">القسم</label>
                  <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold" value={newArticle.section} onChange={e => setNewArticle({...newArticle, section: e.target.value})}>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black">الحالة</label>
                  <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold" value={newArticle.status} onChange={e => setNewArticle({...newArticle, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full py-4 text-xl" icon={Send}>حفظ التقرير</Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('newsroom_session_v1_2');
    if (saved) setUser(JSON.parse(saved));
    setInit(true);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('newsroom_session_v1_2', JSON.stringify(u));
  };

  if (!init) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48}/></div>;

  return (
    <div className="antialiased text-slate-900" dir="rtl">
      {!user ? <AuthScreen onLogin={handleLogin} /> : <MainApp user={user} onLogout={() => {setUser(null); localStorage.removeItem('newsroom_session_v1_2');}} />}
    </div>
  );
}
