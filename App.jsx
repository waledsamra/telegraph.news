
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
  PieChart as PieChartIcon, BarChart as BarChartIcon, Briefcase, Zap
} from 'lucide-react';
import { supabase } from './supabaseClient';

/**
 * =================================================================
 * نظام كشف الإنتاج المطور - الإصدار الاحترافي (V1.2.0)
 * تصميم وهندسة برمجية: Senior Frontend Engineer
 * =================================================================
 */

// --- الثوابت الرئيسية للنظام ---
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
  { id: 'web', name: 'الموقع الإلكتروني', icon: Globe, color: 'text-blue-600' },
  { id: 'facebook', name: 'فيسبوك', icon: Smartphone, color: 'text-blue-800' },
  { id: 'instagram', name: 'انستجرام', icon: Smartphone, color: 'text-pink-600' },
  { id: 'tiktok', name: 'تيك توك', icon: Smartphone, color: 'text-black' },
  { id: 'youtube', name: 'يوتيوب', icon: Monitor, color: 'text-red-600' },
  { id: 'twitter', name: 'تويتر (X)', icon: Globe, color: 'text-slate-900' }
];

const STATUSES = [
  { id: 'published', name: 'نشرت', color: 'green', label: 'تم النشر' },
  { id: 'desk', name: 'ديسك', color: 'orange', label: 'في المراجعة' },
  { id: 'scheduled', name: 'مجدول', color: 'blue', label: 'مجدول زمنياً' },
  { id: 'draft', name: 'مسودة', color: 'gray', label: 'مسودة عمل' },
  { id: 'urgent', name: 'عاجل', color: 'red', label: 'تغطية عاجلة' }
];

const ROLES = { ADMIN: 'admin', EDITOR: 'editor', JOURNALIST: 'journalist' };

// --- وظائف المساعدة والتهيئة ---
const formatDateTime = (dateStr) => {
  if (!dateStr) return '---';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const diffInSeconds = Math.floor((now - then) / 1000);
  if (diffInSeconds < 60) return 'منذ ثوانٍ';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  return formatDateTime(dateStr);
};

// --- المكونات الذرية (UI Atoms) ---
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', icon: Icon, loading = false }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:scale-[1.02]',
    secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'text-slate-500 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs rounded-xl', md: 'px-6 py-3 text-sm rounded-2xl', lg: 'px-8 py-4 text-lg rounded-3xl' };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${variants[variant]} ${sizes[size]} font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 ${className}`}>
      {loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 20} /> : Icon && <Icon size={size === 'sm' ? 14 : 20} />}
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
  <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100 ${className}`}>
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

// --- شاشة تسجيل الدخول والاشتراك ---
function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '', name: '', agencyId: '' });

  const validate = () => {
    if (!formData.username || !formData.password) return 'يرجى إدخال اسم المستخدم وكلمة المرور';
    if (isRegistering && !formData.name) return 'الاسم الكامل مطلوب للتسجيل';
    if (isRegistering && joinExisting && !formData.agencyId) return 'كود المؤسسة مطلوب للانضمام لفريق';
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    
    setLoading(true); setError('');

    try {
      if (isRegistering) {
        if (joinExisting) {
          // محاولة الانضمام لمؤسسة
          const { data: agency, error: agencyErr } = await supabase.from('agencies').select('id').eq('id', formData.agencyId).single();
          if (agencyErr || !agency) throw new Error('كود المؤسسة غير صحيح أو غير موجود');

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
          if (insErr) {
            if (insErr.code === '23505') throw new Error('اسم المستخدم محجوز مسبقاً');
            throw insErr;
          }
          alert('تم تقديم طلبك بنجاح! يرجى التواصل مع مدير مؤسستك للموافقة على حسابك.');
          setIsRegistering(false);
        } else {
          // إنشاء مؤسسة جديدة بالكامل
          const newAgencyId = Math.floor(100000 + Math.random() * 900000);
          const { error: agErr } = await supabase.from('agencies').insert([{ id: newAgencyId, name: `مؤسسة ${formData.name}` }]);
          if (agErr) throw new Error('حدث خطأ أثناء إنشاء المؤسسة. يرجى المحاولة لاحقاً.');
          
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
        // تسجيل دخول عادي
        const { data: users, error: dbErr } = await supabase
          .from('users')
          .select('*')
          .eq('username', formData.username.toLowerCase().trim())
          .eq('password', formData.password);

        if (dbErr) throw dbErr;
        if (users && users.length > 0) {
          if (!users[0].approved) throw new Error('حسابك لا يزال قيد المراجعة من قبل الإدارة');
          onLogin(users[0]);
        } else {
          throw new Error('بيانات الدخول غير صحيحة، تأكد من اسم المستخدم وكلمة المرور');
        }
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('Failed to fetch')) {
        setError('تعذر الاتصال بقاعدة البيانات. تأكد من إعدادات الربط والجداول.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-200 transform rotate-6 hover:rotate-0 transition-all duration-500">
            {isRegistering ? <UserPlus size={40} /> : <Lock size={40} />}
          </div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tight">Newsroom</h2>
          <p className="text-slate-400 mt-4 font-black uppercase text-[10px] tracking-[0.4em]">Advanced Production Control</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-3xl mb-8 text-xs font-bold text-center border border-red-100 flex flex-col items-center gap-2">
            <AlertTriangle size={18} />
            {error}
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
                <Input label="كود المؤسسة (Agency ID)" icon={Hash} type="number" placeholder="أدخل الكود المكون من 6 أرقام" value={formData.agencyId} onChange={e => setFormData({...formData, agencyId: e.target.value})} />
              )}
              <Input label="الاسم الكامل" icon={User} type="text" placeholder="مثال: محمد علي" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </>
          )}
          
          <Input label="اسم المستخدم" icon={Smartphone} type="text" placeholder="أدخل اسم المستخدم" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          <Input label="كلمة المرور" icon={Key} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <Button type="submit" loading={loading} className="w-full py-5 text-lg" icon={Send} disabled={loading}>
            {isRegistering ? 'إنشاء حسابي الآن' : 'دخول للمنصة'}
          </Button>
        </form>

        <button onClick={() => {setIsRegistering(!isRegistering); setError('');}} className="w-full mt-10 text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          {isRegistering ? 'لديك حساب بالفعل؟ سجل دخولك' : 'لا تملك حساباً؟ انضم لمؤسستك أو ابدأ الآن'}
        </button>
      </div>
    </div>
  );
}

// --- التطبيق الرئيسي المتقدم ---
function MainApp({ user, onLogout }) {
  const [production, setProduction] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ headline: '', section: 'عام', status: 'نشرت', platform: 'الموقع الإلكتروني', url: '' });
  const [stats, setStats] = useState({ today: 0, total: 0, activeUsers: 0 });

  // جلب البيانات الأساسية
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, usersRes] = await Promise.all([
        supabase.from('daily_production').select('*').eq('agency_id', user.agency_id).order('timestamp', { ascending: false }),
        supabase.from('users').select('*').eq('agency_id', user.agency_id)
      ]);

      const prodData = prodRes.data || [];
      const usersData = usersRes.data || [];
      
      setProduction(prodData);
      setUsers(usersData);

      // حساب الإحصائيات
      const today = new Date().toISOString().split('T')[0];
      setStats({
        today: prodData.filter(p => p.date_string === today).length,
        total: prodData.length,
        activeUsers: usersData.length
      });
    } catch (e) {
      console.error('Data loading error:', e);
    } finally {
      setLoading(false);
    }
  }, [user.agency_id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // منطق الفلترة والبحث
  const filteredProduction = useMemo(() => {
    return production.filter(item => {
      const matchesSearch = item.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.journalist_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === 'all' || item.section === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [production, searchQuery, filterDept]);

  // إضافة خبر جديد
  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.headline) return alert('يرجى إدخال عنوان الخبر');
    
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
      const { error } = await supabase.from('daily_production').insert([entry]);
      if (error) throw error;
      setProduction([entry, ...production]);
      setShowAddModal(false);
      setNewArticle({ headline: '', section: 'عام', status: 'نشرت', platform: 'الموقع الإلكتروني', url: '' });
      loadInitialData(); // تحديث الإحصائيات
    } catch (err) {
      alert('فشل حفظ الخبر: ' + err.message);
    }
  };

  const approveUser = async (uid) => {
    try {
      await supabase.from('users').update({ approved: true }).eq('id', uid);
      setUsers(users.map(u => u.id === uid ? { ...u, approved: true } : u));
    } catch (e) { alert(e.message); }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) return;
    try {
      await supabase.from('daily_production').delete().eq('id', id);
      setProduction(production.filter(p => p.id !== id));
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-blue-100" dir="rtl">
      
      {/* Sidebar - القائمة الجانبية */}
      <aside className="w-full md:w-80 bg-white border-l border-slate-200 p-8 flex flex-col shadow-sm z-50">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-2xl text-white shadow-xl shadow-blue-100">
            <Megaphone size={28}/>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Newsroom</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <LayoutDashboard size={22}/> لوحة التحكم
          </button>
          <button onClick={() => setActiveTab('production')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'production' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <FileText size={22}/> سجل الإنتاج
          </button>
          {user.role === 'admin' && (
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Users size={22}/> إدارة الفريق
              {users.filter(u => !u.approved).length > 0 && <span className="mr-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">{users.filter(u => !u.approved).length}</span>}
            </button>
          )}
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <BarChart3 size={22}/> التقارير الإحصائية
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-lg">
              {user.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-blue-500"/>
                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-black transition-all">
            <LogOut size={22}/> خروج آمن
          </button>
        </div>
      </aside>

      {/* Main Content - المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Bar */}
        <header className="h-24 bg-white border-b border-slate-200 px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md hidden lg:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="text" 
                placeholder="ابحث عن خبر، صحفي، أو عنوان..." 
                className="w-full pr-12 pl-4 py-3 bg-slate-100 rounded-2xl border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge color="blue">Agency: {user.agency_id}</Badge>
            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-xl shadow-blue-100 hover:scale-110 active:scale-95 transition-all">
              <Plus size={24}/>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card title="إنتاج اليوم" icon={TrendingUp} className="border-r-4 border-r-emerald-500">
                  <div className="flex items-end justify-between">
                    <h4 className="text-6xl font-black text-slate-800">{stats.today}</h4>
                    <p className="text-emerald-500 text-xs font-black mb-2 flex items-center gap-1"><Zap size={14}/> أخبار مسجلة</p>
                  </div>
                </Card>
                <Card title="إجمالي الأرشيف" icon={FileText} className="border-r-4 border-r-blue-500">
                   <div className="flex items-end justify-between">
                    <h4 className="text-6xl font-black text-slate-800">{stats.total}</h4>
                    <p className="text-blue-500 text-xs font-black mb-2 uppercase">Total Entry</p>
                  </div>
                </Card>
                <Card title="فريق العمل" icon={Users} className="border-r-4 border-r-purple-500">
                   <div className="flex items-end justify-between">
                    <h4 className="text-6xl font-black text-slate-800">{stats.activeUsers}</h4>
                    <p className="text-purple-500 text-xs font-black mb-2">عضو مفعل</p>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card title="آخر الأخبار" subtitle="أحدث 5 تقارير تم تسجيلها" icon={Activity} actions={<Button onClick={() => setActiveTab('production')} size="sm" variant="ghost">عرض الكل</Button>}>
                   <div className="space-y-4">
                      {production.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-default">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><FileText size={16}/></div>
                              <div>
                                 <p className="text-sm font-black text-slate-700 truncate max-w-xs">{item.headline}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">{item.journalist_name} • {getRelativeTime(item.timestamp)}</p>
                              </div>
                           </div>
                           <Badge color={item.status === 'نشرت' ? 'green' : 'orange'}>{item.status}</Badge>
                        </div>
                      ))}
                      {production.length === 0 && <div className="text-center py-10 text-slate-300 font-black">لا يوجد إنتاج بعد</div>}
                   </div>
                </Card>

                <Card title="كود الدعوة للمؤسسة" icon={Share2} className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white border-none shadow-2xl shadow-blue-100">
                   <div className="text-center py-6">
                      <p className="text-blue-300 text-xs font-black mb-4 uppercase tracking-[0.3em]">Share this with your team</p>
                      <h3 className="text-7xl font-black tracking-[0.2em] mb-8">{user.agency_id}</h3>
                      <button onClick={() => {navigator.clipboard.writeText(user.agency_id); alert('تم نسخ الكود!');}} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl text-xs font-black border border-white/10 transition-all flex items-center gap-3 mx-auto">
                        <Copy size={16}/> نسخ الكود للفريق
                      </button>
                   </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="animate-in fade-in slide-in-from-left-6 duration-700">
               <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">سجل الإنتاج العام</h2>
                    <p className="text-slate-500 mt-2 font-medium">متابعة كافة التقارير الصحفية المسجلة لمؤسستك</p>
                  </div>
                  <div className="flex gap-4">
                    <select 
                      className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-500 transition-all shadow-sm"
                      value={filterDept}
                      onChange={e => setFilterDept(e.target.value)}
                    >
                      <option value="all">جميع الأقسام</option>
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <Button onClick={() => setShowAddModal(true)} icon={Plus}>إضافة خبر</Button>
                  </div>
               </div>

               <Card className="shadow-2xl no-padding overflow-visible" title={`إجمالي السجلات (${filteredProduction.length})`} icon={FileText}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-6">الصحفي</th>
                          <th className="px-8 py-6">عنوان التقرير</th>
                          <th className="px-8 py-6">القسم</th>
                          <th className="px-8 py-6">المنصة</th>
                          <th className="px-8 py-6">الحالة</th>
                          <th className="px-8 py-6 text-center">التوقيت</th>
                          <th className="px-8 py-6 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loading ? (
                          <tr><td colSpan="7" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48}/></td></tr>
                        ) : filteredProduction.length === 0 ? (
                          <tr><td colSpan="7" className="p-20 text-center text-slate-300 font-black">لا توجد سجلات مطابقة للبحث</td></tr>
                        ) : filteredProduction.map(item => (
                          <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                            <td className="px-8 py-6 font-black text-slate-800 whitespace-nowrap">{item.journalist_name}</td>
                            <td className="px-8 py-6 max-w-sm"><p className="font-bold text-slate-600 leading-relaxed truncate">{item.headline}</p></td>
                            <td className="px-8 py-6"><Badge color="blue">{item.section}</Badge></td>
                            <td className="px-8 py-6"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Globe size={14}/> {item.platform}</div></td>
                            <td className="px-8 py-6"><Badge color={item.status === 'نشرت' ? 'green' : (item.status === 'عاجل' ? 'red' : 'orange')}>{item.status}</Badge></td>
                            <td className="px-8 py-6 text-[10px] text-slate-400 font-black text-center whitespace-nowrap">{formatDateTime(item.timestamp)}</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => deleteEntry(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-right-6 duration-700">
               <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-12">إدارة الفريق</h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <Card className="lg:col-span-2 shadow-2xl" title="أعضاء المؤسسة" icon={Users}>
                     <div className="space-y-6">
                        {users.map(u => (
                          <div key={u.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-blue-100 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">{u.name[0]}</div>
                                <div>
                                   <p className="font-black text-slate-800">{u.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">@{u.username} • {u.role}</p>
                                </div>
                             </div>
                             {!u.approved ? (
                               <Button variant="success" size="sm" onClick={() => approveUser(u.id)} icon={Check}>موافقة</Button>
                             ) : (
                               <Badge color="green">نشط</Badge>
                             )}
                          </div>
                        ))}
                     </div>
                  </Card>
                  
                  <Card title="مستويات الوصول" icon={Shield}>
                     <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                           <p className="text-xs font-black text-purple-700 uppercase mb-1">Admin</p>
                           <p className="text-[10px] text-purple-500 font-medium leading-relaxed">تحكم كامل في الفريق، الأقسام، وحذف البيانات.</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                           <p className="text-xs font-black text-blue-700 uppercase mb-1">Editor</p>
                           <p className="text-[10px] text-blue-500 font-medium leading-relaxed">مراجعة إنتاج الفريق وتعديل الحالات.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-xs font-black text-slate-700 uppercase mb-1">Journalist</p>
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">تسجيل الإنتاج اليومي الخاص به فقط.</p>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
               <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-12">التقارير التحليلية</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card title="توزيع الإنتاج حسب الأقسام" icon={PieChartIcon}>
                     <div className="space-y-4 pt-4">
                        {DEPARTMENTS.map(dept => {
                          const count = production.filter(p => p.section === dept.name).length;
                          const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          if (count === 0) return null;
                          return (
                            <div key={dept.id} className="space-y-2">
                               <div className="flex justify-between text-[11px] font-black">
                                  <span className="text-slate-600">{dept.name}</span>
                                  <span className="text-blue-600">{count} خبر ({percent.toFixed(1)}%)</span>
                               </div>
                               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${dept.color}`} style={{ width: `${percent}%` }}></div>
                               </div>
                            </div>
                          );
                        })}
                        {stats.total === 0 && <p className="text-center py-10 text-slate-300 font-black">لا توجد بيانات للتحليل</p>}
                     </div>
                  </Card>
                  
                  <Card title="أداء الصحفيين (الأكثر إنتاجاً)" icon={BarChartIcon}>
                     <div className="space-y-4 pt-4">
                        {users.map(u => {
                          const count = production.filter(p => p.journalist_username === u.username).length;
                          if (count === 0) return null;
                          return (
                            <div key={u.id} className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs">{u.name[0]}</div>
                               <div className="flex-1">
                                  <div className="flex justify-between text-[11px] font-black mb-1">
                                     <span className="text-slate-700">{u.name}</span>
                                     <span className="text-slate-400">{count}</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-600" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                                  </div>
                               </div>
                            </div>
                          );
                        }).slice(0, 10)}
                     </div>
                  </Card>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal - نافذة إضافة خبر */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white flex items-center justify-between">
               <div>
                  <h3 className="text-3xl font-black tracking-tight">إضافة إنتاج جديد</h3>
                  <p className="text-blue-100 mt-2 font-medium opacity-80">أدخل تفاصيل الخبر لتسجيلها في النظام</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all shadow-lg">
                  <X size={24}/>
               </button>
            </div>
            <form onSubmit={handleAddArticle} className="p-10 space-y-8">
              <Input 
                label="عنوان التقرير الصحفي" 
                required 
                placeholder="أدخل عنواناً شاملاً ودقيقاً..." 
                value={newArticle.headline} 
                onChange={e => setNewArticle({...newArticle, headline: e.target.value})}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">القسم المختص</label>
                  <select 
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer transition-all" 
                    value={newArticle.section} 
                    onChange={e => setNewArticle({...newArticle, section: e.target.value})}
                  >
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">حالة النشر</label>
                  <select 
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer transition-all" 
                    value={newArticle.status} 
                    onChange={e => setNewArticle({...newArticle, status: e.target.value})}
                  >
                    {STATUSES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">المنصة الرئيسية</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {PLATFORMS.map(p => (
                    <button 
                      type="button" 
                      key={p.id} 
                      onClick={() => setNewArticle({...newArticle, platform: p.name})}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5 ${newArticle.platform === p.name ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm scale-105' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                      <p.icon size={16}/>
                      <span className="text-[8px] font-black uppercase whitespace-nowrap">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input 
                label="رابط الخبر (اختياري)" 
                icon={ExternalLink} 
                placeholder="https://..." 
                value={newArticle.url} 
                onChange={e => setNewArticle({...newArticle, url: e.target.value})}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full py-5 text-lg" icon={Send}>حفظ السجل ونشره</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}

// --- المدخل الرئيسي للمنصة ---
export default function App() {
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('newsroom_session_v1_2');
    if (savedSession) {
      try { setUser(JSON.parse(savedSession)); } 
      catch { localStorage.removeItem('newsroom_session_v1_2'); }
    }
    setInit(true);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('newsroom_session_v1_2', JSON.stringify(u));
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      setUser(null);
      localStorage.removeItem('newsroom_session_v1_2');
    }
  };

  if (!init) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
       <div className="w-16 h-16 bg-blue-600 rounded-3xl animate-bounce flex items-center justify-center text-white shadow-2xl">
          <Loader2 size={32} className="animate-spin" />
       </div>
       <p className="font-black text-slate-400 animate-pulse uppercase tracking-[0.4em] text-xs">Loading Newsroom</p>
    </div>
  );

  return (
    <div className="antialiased text-slate-900" dir="rtl">
      {!user ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <MainApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
