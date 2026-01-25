
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, User, Trash2, FileText, CheckCircle,
  BarChart3, LogOut, Star, Shield, Check, X, Lock, Users, 
  MessageSquare, Megaphone, AlertTriangle, Settings, TrendingUp, 
  Plus, Lightbulb, Activity, RefreshCw, Hash, Database, Smartphone, 
  Key, UserPlus, Send, Loader2, History, Filter, Search, Download, 
  Printer, FileSpreadsheet, Calendar, ChevronRight, ChevronLeft, 
  MoreVertical, Edit3, Eye, Copy, Share2, Globe, Clock, Monitor, 
  Layers, Target, Award, Bell, Mail, Info, Save, Undo, ExternalLink
} from 'lucide-react';
import { supabase } from './supabaseClient';

// =================================================================
// 1. الثوابت والإعدادات الافتراضية (Configuration)
// =================================================================

const DEPARTMENTS = [
  { id: 'politics', name: 'السياسة', color: 'bg-red-500' },
  { id: 'economy', name: 'الاقتصاد', color: 'bg-green-500' },
  { id: 'sports', name: 'الرياضة', color: 'bg-blue-500' },
  { id: 'culture', name: 'الفن والثقافة', color: 'bg-purple-500' },
  { id: 'accidents', name: 'الحوادث', color: 'bg-orange-500' },
  { id: 'world', name: 'عربي ودولي', color: 'bg-indigo-500' },
  { id: 'investigations', name: 'تحقيقات', color: 'bg-yellow-600' },
  { id: 'desk', name: 'ديسك مركزي', color: 'bg-slate-700' },
  { id: 'tech', name: 'تكنولوجيا', color: 'bg-cyan-500' },
  { id: 'general', name: 'عام', color: 'bg-gray-500' }
];

const PLATFORMS = [
  { id: 'web', name: 'الموقع الإلكتروني', icon: Globe },
  { id: 'facebook', name: 'فيسبوك', icon: Smartphone },
  { id: 'instagram', name: 'انستجرام', icon: Smartphone },
  { id: 'tiktok', name: 'تيك توك', icon: Smartphone },
  { id: 'youtube', name: 'يوتيوب', icon: Monitor },
  { id: 'twitter', name: 'تويتر (X)', icon: Globe },
  { id: 'other', name: 'منصات أخرى', icon: Layers }
];

const STATUSES = [
  { id: 'published', name: 'نشرت', color: 'green' },
  { id: 'desk', name: 'ديسك', color: 'orange' },
  { id: 'scheduled', name: 'مجدول', color: 'blue' },
  { id: 'draft', name: 'مسودة', color: 'gray' },
  { id: 'urgent', name: 'عاجل', color: 'red' }
];

const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  JOURNALIST: 'journalist'
};

// =================================================================
// 2. وظائف المساعدة (Utility Functions)
// =================================================================

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const getRelativeTime = (dateStr) => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  if (diffInSeconds < 60) return 'منذ ثوانٍ';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  return formatDateTime(dateStr);
};

// =================================================================
// 3. مكونات الواجهة الأساسية (Atomic UI Components)
// =================================================================

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', icon: Icon }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-800',
    secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'text-slate-500 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-3xl'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-black transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 20} />}
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
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${colorMap[color] || colorMap.blue}`}>
      {children}
    </span>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-black text-slate-700 mr-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />}
      <input 
        {...props} 
        className={`w-full ${Icon ? 'pr-12' : 'px-6'} pl-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner`} 
      />
    </div>
  </div>
);

const Card = ({ children, className = '', title, subtitle, icon: Icon, actions }) => (
  <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {(title || actions) && (
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          {Icon && <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Icon size={20}/></div>}
          <div>
            <h3 className="text-lg font-black text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-bold">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    )}
    <div className="p-8">{children}</div>
  </div>
);

// =================================================================
// 4. مكونات واجهة المستخدم المتقدمة (Feature Components)
// =================================================================

// مكون الرسم البياني (SVG) المبسط لمحاكاة البيانات
const SimpleBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between h-48 gap-2 pt-6">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center group relative">
          <div className="absolute -top-8 bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {item.value} خبر
          </div>
          <div 
            className={`w-full rounded-t-lg transition-all duration-700 group-hover:brightness-110 ${item.color || 'bg-blue-500'}`}
            style={{ height: `${(item.value / max) * 100}%` }}
          ></div>
          <span className="text-[10px] font-black text-slate-400 mt-2 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// مكون عرض التنبيهات
const NotificationItem = ({ type, message, time }) => (
  <div className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
    <div className={`p-2 rounded-xl ${type === 'alert' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
      {type === 'alert' ? <AlertTriangle size={18}/> : <Bell size={18}/>}
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-slate-700 leading-relaxed">{message}</p>
      <span className="text-[10px] text-slate-400 font-black flex items-center gap-1 mt-1">
        <Clock size={10}/> {getRelativeTime(time)}
      </span>
    </div>
  </div>
);

// =================================================================
// 5. شاشات المصادقة (Auth Screens)
// =================================================================

function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '', name: '', agencyId: '' });

  const validate = () => {
    if (!formData.username || !formData.password || (isRegistering && !formData.name)) {
      setError('جميع الحقول مطلوبة');
      return false;
    }
    if (isRegistering && joinExisting && !formData.agencyId) {
      setError('كود المؤسسة مطلوب للانضمام');
      return false;
    }
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setError('');

    try {
      if (isRegistering) {
        if (joinExisting) {
          // التحقق من المؤسسة أولاً
          const { data: agency } = await supabase.from('agencies').select('id').eq('id', formData.agencyId).single();
          if (!agency) throw new Error('كود المؤسسة هذا غير صحيح');

          const newUser = {
            id: String(Date.now()),
            name: formData.name,
            username: formData.username.toLowerCase().trim(),
            password: formData.password,
            role: ROLES.JOURNALIST,
            agency_id: formData.agencyId,
            approved: false,
            created_at: new Date().toISOString()
          };
          const { error: err } = await supabase.from('users').insert([newUser]);
          if (err) throw err;
          alert('تم تقديم طلب الانضمام بنجاح! انتظر موافقة المدير.');
          setIsRegistering(false);
        } else {
          // إنشاء مؤسسة جديدة
          const newAgencyId = Math.floor(100000 + Math.random() * 900000); // كود عشوائي من 6 أرقام
          await supabase.from('agencies').insert([{ id: newAgencyId, name: `مؤسسة ${formData.name}`, created_at: new Date().toISOString() }]);
          await supabase.from('agency_settings').insert([{ agency_id: newAgencyId, timezone: 'Cairo' }]);
          
          const adminUser = {
            id: String(Date.now()),
            name: formData.name,
            username: formData.username.toLowerCase().trim(),
            password: formData.password,
            role: ROLES.ADMIN,
            agency_id: newAgencyId,
            approved: true,
            created_at: new Date().toISOString()
          };
          const { error: err } = await supabase.from('users').insert([adminUser]);
          if (err) throw err;
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
          const u = users[0];
          if (!u.approved) throw new Error('حسابك بانتظار موافقة المدير');
          onLogin(u);
        } else {
          throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-slate-100 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-200 transform rotate-6 hover:rotate-0 transition-all duration-500">
            {isRegistering ? <UserPlus size={40} /> : <Lock size={40} />}
          </div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tight">Newsroom</h2>
          <p className="text-slate-400 mt-4 font-black uppercase text-xs tracking-[0.3em]">Advanced Production Control</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-3xl mb-8 text-sm font-bold text-center border border-red-100 animate-in fade-in slide-in-from-top-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          {isRegistering && (
            <>
              <div className="flex gap-2 p-2 bg-slate-100 rounded-[2rem] mb-4">
                <button type="button" onClick={() => setJoinExisting(false)} className={`flex-1 py-3 text-xs font-black rounded-[1.5rem] transition-all ${!joinExisting ? 'bg-white shadow-sm text-blue-600 scale-100' : 'text-slate-500 hover:text-slate-800 scale-95'}`}>مؤسسة جديدة</button>
                <button type="button" onClick={() => setJoinExisting(true)} className={`flex-1 py-3 text-xs font-black rounded-[1.5rem] transition-all ${joinExisting ? 'bg-white shadow-sm text-blue-600 scale-100' : 'text-slate-500 hover:text-slate-800 scale-95'}`}>انضمام لفريق</button>
              </div>
              
              {joinExisting && (
                <Input label="كود المؤسسة (Agency ID)" icon={Hash} type="number" placeholder="مثال: 123456" value={formData.agencyId} onChange={e => setFormData({...formData, agencyId: e.target.value})} />
              )}
              
              <Input label="الاسم الكامل" icon={User} type="text" placeholder="مثال: محمد أحمد" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </>
          )}
          
          <Input label="اسم المستخدم" icon={Smartphone} type="text" placeholder="أدخل اسم المستخدم" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          <Input label="كلمة المرور" icon={Key} type="password" placeholder="أدخل كلمة المرور" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <Button type="submit" loading={loading} className="w-full py-5 text-lg" icon={Send} disabled={loading}>
            {loading ? 'جاري التحميل...' : (isRegistering ? 'إنشاء الحساب والبدء' : 'دخول للمنصة')}
          </Button>
        </form>

        <button onClick={() => {setIsRegistering(!isRegistering); setError('');}} className="w-full mt-10 text-sm font-black text-slate-400 hover:text-blue-600 transition-colors">
          {isRegistering ? 'هل تملك حساباً بالفعل؟ سجل دخول' : 'لا تملك حساباً؟ انضم لمؤسسة أو أنشئ مؤسستك الآن'}
        </button>
      </div>
    </div>
  );
}

// =================================================================
// 6. التطبيق الرئيسي (The Main Platform)
// =================================================================

function MainApp({ user, onLogout }) {
  // State Management
  const [production, setProduction] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ headline: '', section: 'عام', status: 'نشرت', platform: 'الموقع الإلكتروني', url: '' });
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialization
  useEffect(() => {
    loadAllData();
    // Simulate initial notifications
    setNotifications([
      { id: 1, type: 'info', message: 'نظام كشف الإنتاج المطور جاهز للعمل الآن.', time: new Date().toISOString() },
      { id: 2, type: 'alert', message: 'يرجى مراجعة تقارير القسم الرياضي لليوم.', time: new Date(Date.now() - 3600000).toISOString() }
    ]);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, usersRes] = await Promise.all([
        supabase.from('daily_production').select('*').eq('agency_id', user.agency_id).order('timestamp', { ascending: false }),
        supabase.from('users').select('*').eq('agency_id', user.agency_id)
      ]);
      setProduction(prodRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) { console.error('Data Fetch Error:', e); }
    setLoading(false);
  };

  // Logic: Advanced Filtering
  const filteredProduction = useMemo(() => {
    return production.filter(item => {
      const matchesSearch = item.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.journalist_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === 'all' || item.section === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [production, searchQuery, filterDept]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: production.length,
      today: production.filter(p => p.date_string === today).length,
      users: users.length,
      pendingUsers: users.filter(u => !u.approved).length,
      deptBreakdown: DEPARTMENTS.map(d => ({
        label: d.name,
        value: production.filter(p => p.section === d.name).length,
        color: d.color.replace('bg-', 'bg-[#').replace('500', ']') // Dummy conversion for simulation
      }))
    };
  }, [production, users]);

  // Handlers
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
      const { error } = await supabase.from('daily_production').insert([entry]);
      if (error) throw error;
      setProduction([entry, ...production]);
      setShowAddModal(false);
      setNewArticle({ headline: '', section: 'عام', status: 'نشرت', platform: 'الموقع الإلكتروني', url: '' });
      // Add a success notification
      setNotifications([{ id: Date.now(), type: 'info', message: `تم تسجيل خبر جديد: ${entry.headline}`, time: new Date().toISOString() }, ...notifications]);
    } catch (err) { alert(err.message); }
  };

  const approveUser = async (uid) => {
    try {
      await supabase.from('users').update({ approved: true }).eq('id', uid);
      setUsers(users.map(u => u.id === uid ? { ...u, approved: true } : u));
    } catch (e) { alert(e.message); }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الخبر نهائياً؟')) return;
    try {
      await supabase.from('daily_production').delete().eq('id', id);
      setProduction(production.filter(p => p.id !== id));
    } catch (e) { alert(e.message); }
  };

  const exportToCSV = () => {
    const headers = ['الصحفي', 'العنوان', 'القسم', 'الحالة', 'المنصة', 'التوقيت'];
    const rows = filteredProduction.map(p => [
      p.journalist_name, p.headline, p.section, p.status, p.platform, p.timestamp
    ]);
    const content = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob(["\ufeff" + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `production_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const printReport = () => window.print();

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'production', label: 'سجل الإنتاج', icon: FileText },
    { id: 'reports', label: 'التقارير الإحصائية', icon: BarChart3 },
    { id: 'users', label: 'إدارة الفريق', icon: Users, badge: stats.pendingUsers > 0 ? stats.pendingUsers : null },
    { id: 'calendar', label: 'الخطة التحريرية', icon: Calendar },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-full md:w-80' : 'w-0 md:w-24'} bg-white border-l border-slate-200 transition-all duration-500 flex flex-col shadow-sm z-50 overflow-hidden relative group`}>
        <div className="p-8 flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-2xl text-white shadow-xl shadow-blue-100">
            <Megaphone size={28}/>
          </div>
          <h1 className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} text-2xl font-black text-slate-800 tracking-tighter transition-opacity whitespace-nowrap`}>
            Newsroom <span className="text-blue-600">.</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all relative ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : ''} />
              <span className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity whitespace-nowrap`}>{item.label}</span>
              {item.badge && sidebarOpen && (
                <span className="mr-auto bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg animate-bounce">{item.badge}</span>
              )}
              {activeTab === item.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full"></div>}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100">
          <div className={`flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-xl shadow-sm border border-white">
              {user.name[0]}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield size={10} className="text-blue-500"/>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-black transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut size={22}/>
            {sidebarOpen && <span>خروج آمن</span>}
          </button>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -left-3 top-20 bg-white border border-slate-200 p-1.5 rounded-full shadow-md text-slate-400 hover:text-blue-600 hidden md:block"
        >
          {sidebarOpen ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 px-12 flex items-center justify-between z-40 sticky top-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md hidden lg:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="text" 
                placeholder="ابحث عن خبر، صحفي، أو عنوان..." 
                className="w-full pr-12 pl-4 py-3 bg-slate-100 rounded-2xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-bold text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <Badge color="blue">إصدار v1.0 Enterprise</Badge>
               <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
               <span className="text-xs text-slate-400 font-bold">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl relative transition-all">
              <Bell size={22}/>
              {notifications.length > 0 && <span className="absolute top-2.5 left-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
            </button>
            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 hover:scale-110 active:scale-95 transition-all">
              <Plus size={24}/>
            </button>
          </div>
        </header>

        {/* Dynamic Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              
              {/* Welcome & Stats Row */}
              <section className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-1 bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                  <div className="relative z-10">
                    <h2 className="text-5xl font-black mb-4 leading-tight">أهلاً بك، {user.name} 👋</h2>
                    <p className="text-blue-100 text-lg font-medium max-w-lg mb-10">نظام كشف الإنتاج المتطور يوفر لك رؤية شاملة لأداء مؤسستك الصحفية في الوقت الفعلي.</p>
                    <div className="flex gap-4">
                      <Button onClick={() => setActiveTab('production')} variant="primary" className="!bg-white !text-blue-900 !shadow-none !rounded-2xl">استعراض السجلات</Button>
                      <Button onClick={() => setShowAddModal(true)} variant="secondary" className="!bg-transparent !border-white/20 !text-white !rounded-2xl">إضافة خبر سريع</Button>
                    </div>
                  </div>
                  <div className="absolute bottom-10 left-10 opacity-10">
                    <Activity size={200}/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full lg:w-96">
                  <StatCard title="إنتاج اليوم" value={stats.today} icon={TrendingUp} colorClass="text-emerald-600 bg-emerald-600" />
                  <StatCard title="إجمالي الأرشيف" value={stats.total} icon={FileText} colorClass="text-blue-600 bg-blue-600" />
                  <StatCard title="فريق العمل" value={stats.users} icon={Users} colorClass="text-purple-600 bg-purple-600" />
                  <StatCard title="كود المؤسسة" value={user.agency_id} icon={Hash} colorClass="text-orange-600 bg-orange-600" />
                </div>
              </section>

              {/* Data Visualization & Alerts */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                <Card title="توزيع الإنتاج حسب الأقسام" className="lg:col-span-2 shadow-xl" subtitle="بيانات تراكمية للأقسام العشرة الرئيسية" icon={PieChart} actions={<Button variant="ghost" size="sm" onClick={loadAllData}><RefreshCw size={14}/></Button>}>
                   <SimpleBarChart data={stats.deptBreakdown} />
                </Card>

                <Card title="آخر التنبيهات" className="shadow-xl" icon={BellRing}>
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length > 0 ? notifications.map(n => (
                      <NotificationItem key={n.id} type={n.type} message={n.message} time={n.time} />
                    )) : (
                      <div className="text-center py-10 text-slate-400 font-bold">لا توجد تنبيهات جديدة</div>
                    )}
                  </div>
                </Card>

              </section>

              {/* Recent Activity Table Preview */}
              <section>
                <Card title="آخر الأخبار المسجلة" className="shadow-2xl" subtitle="أحدث 5 تقارير تم تسجيلها في النظام" actions={<Button onClick={() => setActiveTab('production')} size="sm" variant="secondary" icon={ExternalLink}>عرض الكل</Button>}>
                  <div className="overflow-x-auto -mx-8 -mb-8">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase">
                        <tr>
                          <th className="px-8 py-5">الصحفي</th>
                          <th className="px-8 py-5">العنوان</th>
                          <th className="px-8 py-5">القسم</th>
                          <th className="px-8 py-5">الحالة</th>
                          <th className="px-8 py-5 text-center">التوقيت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {production.slice(0, 5).map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-all cursor-pointer">
                            <td className="px-8 py-6 font-black text-slate-800">{item.journalist_name}</td>
                            <td className="px-8 py-6 max-w-sm"><p className="truncate font-bold text-slate-600">{item.headline}</p></td>
                            <td className="px-8 py-6"><Badge color="blue">{item.section}</Badge></td>
                            <td className="px-8 py-6"><Badge color={item.status === 'نشرت' ? 'green' : 'orange'}>{item.status}</Badge></td>
                            <td className="px-8 py-6 text-[10px] text-slate-400 font-black text-center">{getRelativeTime(item.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </section>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="animate-in fade-in slide-in-from-left-6 duration-700">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">سجل الإنتاج الكامل</h2>
                    <p className="text-slate-500 mt-2 font-medium">إدارة ومراجعة كافة التقارير الصحفية المسجلة في مؤسستك</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="secondary" icon={Download} onClick={exportToCSV}>تصدير CSV</Button>
                    <Button variant="secondary" icon={Printer} onClick={printReport}>طباعة الكشف</Button>
                    <Button icon={Plus} onClick={() => setShowAddModal(true)}>إضافة خبر</Button>
                  </div>
               </div>

               <Card className="shadow-2xl no-padding overflow-visible" icon={Filter} title="الفلترة والبحث المتقدم">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                       <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18}/>
                       <input 
                         type="text" 
                         placeholder="ابحث بالعنوان أو اسم الصحفي..." 
                         className="w-full pr-12 pl-4 py-4 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                       />
                    </div>
                    <div className="w-full lg:w-72">
                      <select 
                        className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-black"
                        value={filterDept}
                        onChange={e => setFilterDept(e.target.value)}
                      >
                        <option value="all">جميع الأقسام</option>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
               </Card>

               <div className="mt-12 bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-8">تاريخ التسجيل</th>
                          <th className="px-8 py-8">اسم الصحفي</th>
                          <th className="px-8 py-8">عنوان التقرير</th>
                          <th className="px-8 py-8">القسم المختص</th>
                          <th className="px-8 py-8">المنصة</th>
                          <th className="px-8 py-8">الحالة</th>
                          <th className="px-8 py-8 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loading ? (
                          <tr><td colSpan="7" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={64}/></td></tr>
                        ) : filteredProduction.length === 0 ? (
                          <tr><td colSpan="7" className="p-32 text-center text-slate-300 font-black text-2xl">لم يتم العثور على أي نتائج</td></tr>
                        ) : filteredProduction.map(item => (
                          <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                            <td className="px-8 py-6 text-xs text-slate-400 font-black whitespace-nowrap">{formatDateTime(item.timestamp)}</td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">{item.journalist_name[0]}</div>
                                <span className="font-black text-slate-800">{item.journalist_name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 max-w-md"><p className="font-bold text-slate-600 leading-relaxed group-hover:text-blue-600 transition-colors">{item.headline}</p></td>
                            <td className="px-8 py-6"><Badge color="blue">{item.section}</Badge></td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
                                <Globe size={14}/> {item.platform}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <Badge color={item.status === 'نشرت' ? 'green' : 'orange'}>{item.status}</Badge>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18}/></button>
                                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Copy size={18}/></button>
                                <button onClick={() => deleteEntry(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Simulation */}
                  <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                     <p className="text-xs text-slate-400 font-black">إجمالي النتائج: {filteredProduction.length} سجل</p>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="sm" icon={ChevronRight} className="rotate-180"></Button>
                        <div className="flex items-center px-4 font-black text-xs text-blue-600">صفحة 1 من 1</div>
                        <Button variant="ghost" size="sm" icon={ChevronLeft} className="rotate-180"></Button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-right-6 duration-700">
               <header className="mb-12">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة فريق العمل</h2>
                  <p className="text-slate-500 mt-2 font-medium">التحكم في صلاحيات المستخدمين والموافقة على طلبات الانضمام الجديدة لمؤسستك</p>
               </header>

               <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  <Card className="xl:col-span-2 shadow-2xl" title="قائمة الأعضاء" subtitle={`يوجد ${users.length} مستخدم مسجل في النظام`} icon={Users} actions={<Button variant="ghost" size="sm" onClick={loadAllData}><RefreshCw size={14}/></Button>}>
                     <div className="overflow-x-auto -mx-8 -mb-8">
                        <table className="w-full text-right">
                           <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                              <tr>
                                 <th className="px-8 py-5">المستخدم</th>
                                 <th className="px-8 py-5">الدور الوظيفي</th>
                                 <th className="px-8 py-5 text-center">الحالة</th>
                                 <th className="px-8 py-5 text-center">الإجراءات</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {users.map(u => (
                                 <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 shadow-inner">{u.name[0]}</div>
                                          <div>
                                             <p className="font-black text-slate-800">{u.name}</p>
                                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">@{u.username}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <Badge color={u.role === 'admin' ? 'purple' : 'blue'}>{u.role}</Badge>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       {u.approved ? <Badge color="green">نشط</Badge> : <Badge color="orange">قيد المراجعة</Badge>}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       {!u.approved ? (
                                          <Button variant="success" size="sm" onClick={() => approveUser(u.id)} icon={Check}>موافقة</Button>
                                       ) : (
                                          u.id !== user.id && <Button variant="danger" size="sm" icon={Trash2}>حذف</Button>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>

                  <Card className="shadow-2xl h-fit" title="دعوة فريق العمل" icon={Share2}>
                     <div className="space-y-8">
                        <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-center relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                           <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">كود المؤسسة الخاص بك</p>
                           <h4 className="text-5xl font-black text-blue-700 tracking-widest mb-6">{user.agency_id}</h4>
                           <Button variant="primary" size="sm" className="w-full" icon={Copy}>نسخ الكود وإرساله للفريق</Button>
                        </div>
                        <div className="space-y-4">
                           <h5 className="text-sm font-black text-slate-700 flex items-center gap-2"><Info size={16} className="text-blue-500"/> كيف ينضم الفريق؟</h5>
                           <ul className="space-y-3">
                              {['تحميل الرابط الخاص بالمنصة.', 'اختيار "انضمام لفريق" عند التسجيل.', 'إدخال كود المؤسسة أعلاه.', 'انتظار موافقتك كمدير من هذه اللوحة.'].map((step, i) => (
                                 <li key={i} className="flex gap-3 text-xs font-bold text-slate-500">
                                    <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-black">{i+1}</span>
                                    {step}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
               <header className="mb-12">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">التقارير الإحصائية</h2>
                  <p className="text-slate-500 mt-2 font-medium">تحليل بيانات الأداء والإنتاج التراكمي للمؤسسة</p>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  <StatCard title="كفاءة النشر" value="94%" icon={CheckCircle} colorClass="text-emerald-600 bg-emerald-600" />
                  <StatCard title="متوسط الإنتاج اليومي" value={Math.round(stats.total / (stats.total > 0 ? 1 : 1))} icon={TrendingUp} colorClass="text-blue-600 bg-blue-600" />
                  <StatCard title="أكثر قسم تفاعلاً" value="السياسة" icon={Award} colorClass="text-red-600 bg-red-600" />
                  <StatCard title="ساعات الذروة" value="12 PM" icon={Clock} colorClass="text-purple-600 bg-purple-600" />
               </div>

               <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <Card title="مؤشر الأداء الشهري" icon={TrendingUp}>
                     <div className="h-64 flex items-center justify-center text-slate-300 font-black flex-col gap-4">
                        <BarChart3 size={64}/>
                        <span>سيتم عرض المخططات البيانية التفصيلية عند تراكم بيانات الشهر</span>
                     </div>
                  </Card>
                  <Card title="أفضل 5 صحفيين" icon={Star}>
                     <div className="space-y-6">
                        {users.slice(0, 5).map((u, i) => (
                           <div key={u.id} className="flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">{i+1}</div>
                                 <p className="font-black text-slate-700">{u.name}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${80 - (i*15)}%` }}></div>
                                 </div>
                                 <span className="text-xs font-black text-blue-600">{20 - (i*3)} خبر</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               </section>
            </div>
          )}

          {activeTab === 'calendar' && (
             <div className="animate-in fade-in zoom-in duration-500 text-center py-40">
                <CalendarIcon size={120} className="mx-auto text-slate-200 mb-8 animate-bounce"/>
                <h3 className="text-4xl font-black text-slate-800">الخطة التحريرية</h3>
                <p className="text-slate-400 mt-4 text-xl font-medium">ميزة الجدولة الزمنية للأخبار تحت التطوير حالياً.</p>
                <Button onClick={() => setActiveTab('dashboard')} variant="secondary" className="mt-10" icon={Undo}>العودة للرئيسية</Button>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-top-6 duration-700 max-w-4xl mx-auto">
               <header className="mb-12">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">إعدادات المنصة</h2>
                  <p className="text-slate-500 mt-2 font-medium">تخصيص هوية المؤسسة والتحكم في خيارات العرض</p>
               </header>

               <div className="space-y-8">
                  <Card title="بيانات المؤسسة" icon={Building}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="اسم المؤسسة" value={`مؤسسة ${user.name}`} readOnly />
                        <Input label="كود التعريف" value={user.agency_id} readOnly />
                        <Input label="البريد الإلكتروني للإدارة" type="email" placeholder="admin@newsroom.com" />
                        <Input label="رقم التواصل" type="tel" placeholder="01XXXXXXXXX" />
                     </div>
                     <div className="mt-8 pt-8 border-t border-slate-100">
                        <Button icon={Save}>حفظ التغييرات</Button>
                     </div>
                  </Card>

                  <Card title="تفضيلات النظام" icon={Settings}>
                     <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                           <div>
                              <p className="font-black text-slate-800">التنبيهات البريدية</p>
                              <p className="text-xs text-slate-400 font-bold">استلام ملخص يومي بالإنتاج على البريد</p>
                           </div>
                           <div className="w-16 h-8 bg-blue-600 rounded-full relative cursor-pointer">
                              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all translate-x-8"></div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                           <div>
                              <p className="font-black text-slate-800">الوضع الليلي (قريباً)</p>
                              <p className="text-xs text-slate-400 font-bold">تغيير واجهة المستخدم للوضع الداكن</p>
                           </div>
                           <div className="w-16 h-8 bg-slate-200 rounded-full relative cursor-not-allowed">
                              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full"></div>
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Modern Modal: Add Article */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 text-white flex items-center justify-between relative">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div className="relative z-10">
                  <h3 className="text-4xl font-black tracking-tight">تسجيل إنتاج جديد</h3>
                  <p className="text-blue-100 mt-2 font-medium">أضف تفاصيل الخبر ليظهر في كشف الإنتاج العام لمؤسستك</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="bg-white/10 p-5 rounded-3xl hover:bg-white/20 transition-all shadow-xl relative z-10">
                  <X size={28}/>
               </button>
            </div>
            <form onSubmit={handleAddArticle} className="p-12 space-y-10">
              <Input 
                label="عنوان التقرير أو الخبر" 
                required 
                placeholder="أدخل عنواناً جذاباً وشاملاً للخبر..." 
                value={newArticle.headline} 
                onChange={e => setNewArticle({...newArticle, headline: e.target.value})}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-700 mr-1">القسم المختص</label>
                  <select 
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer" 
                    value={newArticle.section} 
                    onChange={e => setNewArticle({...newArticle, section: e.target.value})}
                  >
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-700 mr-1">حالة النشر</label>
                  <select 
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer" 
                    value={newArticle.status} 
                    onChange={e => setNewArticle({...newArticle, status: e.target.value})}
                  >
                    {STATUSES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-slate-700 mr-1">منصة النشر الرئيسية</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PLATFORMS.slice(0, 4).map(p => (
                    <button 
                      type="button" 
                      key={p.id} 
                      onClick={() => setNewArticle({...newArticle, platform: p.name})}
                      className={`py-4 px-2 rounded-[1.5rem] text-[10px] font-black transition-all border-2 flex flex-col items-center justify-center gap-2 ${newArticle.platform === p.name ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <p.icon size={18}/>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <Input 
                label="رابط الخبر (اختياري)" 
                icon={LinkIcon} 
                placeholder="https://example.com/news/123" 
                value={newArticle.url} 
                onChange={e => setNewArticle({...newArticle, url: e.target.value})}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full py-6 text-xl" icon={Send}>تسجيل ونشر التقرير الآن</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS Overrides for custom components */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @media print {
          aside, header, button, .no-print { display: none !important; }
          main { padding: 0 !important; width: 100% !important; }
          .shadow-2xl, .shadow-xl { shadow: none !important; border: 1px solid #eee !important; }
          .bg-slate-50, .bg-[#f8fafc] { background: white !important; }
        }
      `}} />
    </div>
  );
}

// =================================================================
// 7. المدخل الرئيسي (Main Entry Point)
// =================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('newsroom_session_v1');
    if (saved) {
      try { setUser(JSON.parse(saved)); } 
      catch { localStorage.removeItem('newsroom_session_v1'); }
    }
    setInit(true);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('newsroom_session_v1', JSON.stringify(u));
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      setUser(null);
      localStorage.removeItem('newsroom_session_v1');
    }
  };

  if (!init) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
       <div className="w-20 h-20 bg-blue-600 rounded-[2rem] animate-bounce flex items-center justify-center text-white shadow-2xl">
          <Loader2 size={40} className="animate-spin" />
       </div>
       <p className="font-black text-slate-400 animate-pulse uppercase tracking-[0.5em]">Initializing Newsroom</p>
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

// Dummy Icons for standard compatibility
const LinkIcon = ({ size, className }) => <ExternalLink size={size} className={className} />;
const PieChart = ({ size, className }) => <BarChart3 size={size} className={className} />;
const BellRing = ({ size, className }) => <Bell size={size} className={className} />;
const Building = ({ size, className }) => <Monitor size={size} className={className} />;
