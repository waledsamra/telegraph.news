
import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Send, LayoutDashboard, User, Trash2, FileText, CheckCircle,
  BarChart3, Printer, LogOut, Star, Target, Server, Shield,
  Check, X, Lock, Edit, Search, Users, PieChart, Download,
  MessageSquare, Clock, Bell, Briefcase, Inbox,
  Megaphone, AlertTriangle, Settings,
  TrendingUp, Calendar as CalendarIcon,
  Plus, MinusCircle, Lightbulb, FileEdit, Trophy, Activity,
  BellRing, XCircle, Filter, ExternalLink, Copy, FileSpreadsheet, Link as LinkIcon,
  Image as ImageIcon, Gauge, UploadCloud, Globe, Smartphone, Monitor, Camera,
  Timer, History, Eye, Calendar, Menu, Move, Type, UserPlus, Building, Key, FileUp,
  Loader2, RefreshCw, Hash, AlignLeft, Search as SearchIcon, Zap, Info, Palette
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- Defaults ---
const DEFAULT_DEPARTMENTS = ['سياسة', 'اقتصاد', 'رياضة', 'فن وثقافة', 'حوادث', 'منوعات', 'تحقيقات', 'ديسك مركزي', 'عام'];
const DEFAULT_STATUSES = ['نشرت', 'ديسك', 'مبيت'];
const DEFAULT_DAILY_TARGET = 10;
const DEFAULT_LOGO = "/logo.png"; 
const DEFAULT_TICKER_SPEED = 25; 
const DEFAULT_TICKER_FONT_SIZE = 18; 
const PLATFORMS = ['موقع إلكتروني', 'فيسبوك', 'انستجرام', 'تيك توك', 'يوتيوب', 'أخرى'];

// --- Activity Tracking Config ---
const HEARTBEAT_INTERVAL = 15000; 
const ONLINE_THRESHOLD = 45; 
const IDLE_THRESHOLD = 60000; 

// --- Theme Config ---
const THEMES = {
  blue: { name: 'أزرق (الافتراضي)', primary: 'bg-blue-800', hover: 'hover:bg-blue-900', text: 'text-blue-800', light: 'bg-blue-50', border: 'border-blue-200', ring: 'focus:ring-blue-500' },
  red: { name: 'أحمر', primary: 'bg-red-800', hover: 'hover:bg-red-900', text: 'text-red-800', light: 'bg-red-50', border: 'border-red-200', ring: 'focus:ring-red-500' },
  green: { name: 'أخضر', primary: 'bg-green-800', hover: 'hover:bg-green-900', text: 'text-green-800', light: 'bg-green-50', border: 'border-green-200', ring: 'focus:ring-green-500' },
  purple: { name: 'بنفسجي', primary: 'bg-purple-800', hover: 'hover:bg-purple-900', text: 'text-purple-800', light: 'bg-purple-50', border: 'border-purple-200', ring: 'focus:ring-purple-500' },
  slate: { name: 'رمادي رسمي', primary: 'bg-slate-800', hover: 'hover:bg-slate-900', text: 'text-slate-800', light: 'bg-slate-50', border: 'border-slate-200', ring: 'focus:ring-slate-500' },
};

// ... (تكملة الـ Helpers موجودة في الكود الأصلي)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ar-EG');
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (minutes) => {
    if (!minutes) return '0 دقيقة';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h > 0) return `${h} ساعة و ${m} دقيقة`;
    return `${m} دقيقة`;
};

const formatDayName = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-EG', { weekday: 'long' });
};

const copyToClip = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    alert("تم النسخ بنجاح");
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("تم النسخ بنجاح");
    } catch (err) {
      alert("فشل النسخ يدوياً");
    }
    document.body.removeChild(textArea);
  }
};

const escapeCsv = (text) => {
    if (text === null || text === undefined) return "";
    const stringText = String(text);
    if (stringText.includes(",") || stringText.includes('"') || stringText.includes("\n")) {
        return `"${stringText.replace(/"/g, '""')}"`;
    }
    return stringText;
};

const StatusBadge = ({ status }) => {
  let styles = 'bg-gray-100 text-gray-700 border-blue-200';
  let icon = null;

  if (status === 'نشرت' || status === 'تم النشر') {
      styles = 'bg-green-100 text-green-700 border-green-200';
      icon = <CheckCircle className="h-4 w-4" />;
  } else if (status === 'مبيت') {
      styles = 'bg-orange-100 text-orange-700 border-orange-200';
      icon = <Clock className="h-4 w-4" />;
  } else if (status === 'ديسك') {
      styles = 'bg-blue-100 text-blue-700 border-blue-200';
      icon = <FileText className="h-4 w-4" />;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${styles}`}>
      {icon}
      {status}
    </span>
  );
};

const PlatformBadge = ({ platform }) => {
    let icon = <Globe className="h-3 w-3" />;
    let color = "bg-blue-50 text-blue-600 border-blue-100";
    
    if (platform === 'فيسبوك') {
        icon = <span className="font-bold text-[10px]">FB</span>;
        color = "bg-blue-100 text-blue-800 border-blue-200";
    } else if (platform === 'انستجرام') {
        icon = <span className="font-bold text-[10px]">IG</span>;
        color = "bg-pink-50 text-pink-600 border-pink-200";
    } else if (platform === 'تيك توك') {
        icon = <span className="font-bold text-[10px]">TT</span>;
        color = "bg-gray-800 text-white border-gray-600";
    } else if (platform === 'يوتيوب') {
         icon = <span className="font-bold text-[10px]">YT</span>;
         color = "bg-red-50 text-red-600 border-red-200";
    }

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${color}`}>
            {icon} {platform}
        </span>
    );
};

const RatingDisplay = ({ rating, max = 5, color = 'text-orange-500' }) => (
  <div className="flex items-center gap-1" title={`التقييم: ${rating}/${max}`}>
    {[...Array(max)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < (rating || 0) ? `${color} fill-current` : 'text-gray-200'}`} 
      />
    ))}
    <span className="text-xs text-gray-500 font-medium mr-1 hidden sm:inline">({rating || 0})</span>
  </div>
);

const PerformanceBadge = ({ score, loading }) => {
    if (loading) return <span className="flex items-center gap-1 text-[10px] bg-gray-100 px-2 py-1 rounded-full"><Loader2 className="animate-spin h-3 w-3"/> فحص...</span>;
    if (score === null || score === undefined) return null;
    
    let color = "bg-red-100 text-red-700 border-red-200";
    if (score >= 90) color = "bg-green-100 text-green-700 border-green-200";
    else if (score >= 50) color = "bg-yellow-100 text-yellow-700 border-yellow-200";

    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${color}`} title="Google PageSpeed Score (Mobile)">
            <Zap className="h-3 w-3" />
            {score}%
        </span>
    );
};

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-orange-200 hover:scale-[1.02]' : ''}`}
  >
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      {subtitle && <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-xl bg-opacity-10 text-opacity-90 ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const SimpleBarChart = ({ data, colorFrom, colorTo, title, icon: Icon }) => {
  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map(d => d.value || 0)) || 5; 
  
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-blue-900/5 h-full flex flex-col justify-between relative overflow-hidden min-h-[300px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -z-0 opacity-50"></div>
        <div className="flex items-center justify-between mb-6 relative z-10">
           <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                   {Icon ? <Icon size={20} /> : <BarChart3 size={20} />}
               </div>
               <div><h4 className="text-lg font-bold text-slate-800 leading-tight">{title}</h4></div>
           </div>
        </div>
        <div className="relative w-full h-[200px] flex items-end justify-center pb-4">
           <div className="absolute inset-0 flex flex-col justify-between h-[180px] w-full z-0 pointer-events-none">
              {[0, 1, 2, 3].map((_, i) => (<div key={i} className="w-full border-t border-dashed border-slate-100 h-0"></div>))}
           </div>
           <div className="flex items-end justify-between w-full h-[180px] z-10 px-2 gap-2">
              {safeData.map((d, i) => {
                  const val = d.value || 0;
                  const heightPercent = (val / max) * 100;
                  const isZero = val === 0;
                  return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer">
                          <div className={`mb-1 text-[10px] font-bold transition-all duration-300 ${val > 0 ? 'text-slate-600 opacity-100' : 'opacity-0 translate-y-2 group-hover/bar:opacity-100 group-hover/bar:translate-y-0'}`}>{val}</div>
                          <div className="w-full max-w-[30px] rounded-t-lg relative overflow-hidden transition-all duration-700 ease-out group-hover/bar:scale-y-110 origin-bottom" style={{ height: `${isZero ? 2 : heightPercent}%`, background: isZero ? '#f1f5f9' : `linear-gradient(to top, ${colorFrom}, ${colorTo})`, minHeight: isZero ? '4px' : '0' }}></div>
                          <div className="mt-2 text-[10px] font-bold text-slate-400 truncate w-full text-center">{d.label}</div>
                      </div>
                  )
              })}
           </div>
        </div>
    </div>
  );
};

function LiveClock({ theme }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${THEMES[theme].light} px-3 py-1.5 rounded-xl border ${THEMES[theme].border} shadow-sm mx-auto`}>
      <Clock className={`h-4 w-4 ${THEMES[theme].text}`} />
      <span className="text-lg font-black text-gray-800 tabular-nums tracking-wide">
        {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

// ... (باقي المكونات AssignmentCenter و JournalistDashboard و AdminDashboard)

function AuthScreen({ onLogin, serverError }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '',
    name: '',
    agencyId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    try {
      const { data: users, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('username', formData.username.toLowerCase())
        .eq('password', formData.password);

      if (dbError) {
        console.error("Supabase Error:", dbError);
        throw new Error(`خطأ في قاعدة البيانات: ${dbError.message}`);
      }

      if (users && users.length > 0) {
        const user = users[0];
        if (!user.approved) { 
           setError('لم تتم الموافقة على حسابك بعد من قبل مدير المؤسسة'); 
        } else { 
           onLogin(user); 
        }
      } else { 
        setError('بيانات الدخول غير صحيحة'); 
      }
    } catch (err) { 
        console.error(err);
        setError(err.message.includes('relation "users" does not exist') 
          ? 'تنبيه: جدول المستخدمين غير موجود. يرجى تشغيل أوامر SQL أولاً.' 
          : 'فشل الاتصال بقاعدة البيانات. تأكد من تشغيل أوامر SQL.'); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleRegister = async (e) => {
      e.preventDefault();
      if(!formData.name || !formData.username || !formData.password) return setError("الرجاء ملء جميع البيانات");
      if(joinExisting && !formData.agencyId) return setError("الرجاء إدخال كود المؤسسة");

      setLoading(true); setError('');
      try {
          const { data: existing } = await supabase.from('users').select('id').eq('username', formData.username.toLowerCase());
          if(existing && existing.length > 0) throw new Error("اسم المستخدم محجوز مسبقاً");
          
          if (joinExisting) {
             const { data: agency } = await supabase.from('agencies').select('id').eq('id', formData.agencyId).single();
             if (!agency) throw new Error("كود المؤسسة غير صحيح. تأكد من الرقم مع المدير.");

             const newUser = {
                 id: String(Date.now()),
                 name: formData.name,
                 username: formData.username.toLowerCase(),
                 password: formData.password,
                 role: 'journalist',
                 section: 'عام',
                 approved: false,
                 agency_id: formData.agencyId,
                 daily_target: 10
             };

             const { error: insertError } = await supabase.from('users').insert([newUser]);
             if(insertError) throw insertError;

             alert("تم إرسال طلب الانضمام بنجاح! يرجى انتظار تفعيل الحساب من قبل مدير المؤسسة.");
             setIsRegistering(false);
             setJoinExisting(false);
             setFormData({ username: '', password: '', name: '', agencyId: '' });

          } else {
             const newAgencyId = Date.now(); 
             const { error: agencyError } = await supabase.from('agencies').insert([
                { id: newAgencyId, name: `مؤسسة ${formData.name}` }
             ]);
             if(agencyError) throw new Error("فشل إنشاء سجل المؤسسة");

             const { error: settingsError } = await supabase.from('agency_settings').insert([{ agency_id: newAgencyId }]);
             if(settingsError) throw settingsError;

             const newUser = {
                 id: String(Date.now()),
                 name: formData.name,
                 username: formData.username.toLowerCase(),
                 password: formData.password,
                 role: 'admin',
                 section: 'إدارة',
                 approved: true,
                 agency_id: newAgencyId,
                 daily_target: 0
             };

             const { error: insertError } = await supabase.from('users').insert([newUser]);
             if(insertError) throw insertError;

             onLogin(newUser);
          }
      } catch (err) {
          console.error(err);
          setError(err.message || "فشل إنشاء الحساب");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-blue-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Newsroom Platform</h2>
          <p className="text-gray-500 text-sm mt-2">{isRegistering ? (joinExisting ? 'الانضمام لمؤسسة قائمة' : 'إنشاء مؤسسة جديدة') : 'تسجيل دخول الموظفين'}</p>
        </div>

        {serverError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold flex items-center gap-2"><Server className="h-4 w-4"/> لا يمكن الاتصال بالخادم</div>}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold text-center animate-bounce-in">{error}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          
          {isRegistering && (
             <>
               <div className="flex gap-4 mb-2 p-1 bg-gray-100 rounded-lg">
                  <button type="button" onClick={() => setJoinExisting(false)} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${!joinExisting ? 'bg-white shadow text-blue-800' : 'text-gray-500'}`}>إنشاء مؤسسة جديدة</button>
                  <button type="button" onClick={() => setJoinExisting(true)} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${joinExisting ? 'bg-white shadow text-blue-800' : 'text-gray-500'}`}>انضمام لمؤسسة</button>
               </div>

               {joinExisting && (
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">كود المؤسسة (Agency ID)</label>
                    <input 
                        type="number" 
                        required 
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-gray-50 focus:bg-white" 
                        placeholder="اطلب الكود من المدير" 
                        value={formData.agencyId} 
                        onChange={e => setFormData({ ...formData, agencyId: e.target.value })} 
                    />
                 </div>
               )}

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
                  <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-gray-50 focus:bg-white" 
                      placeholder="الاسم الثلاثي" 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  />
               </div>
             </>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم</label>
            <div className="relative">
              <span className="absolute right-3 top-3 text-gray-400 text-sm font-bold">@</span>
              <input 
                type="text" 
                required 
                className="w-full pr-8 pl-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-gray-50 focus:bg-white dir-ltr text-right" 
                placeholder="username" 
                value={formData.username} 
                onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z0-9\s.]/g, '').toLowerCase() })} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
            <input type="password" required className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-gray-50 focus:bg-white" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <button disabled={loading} className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow-lg transform active:scale-95">
            {loading ? 'جاري التحميل...' : (isRegistering ? (joinExisting ? 'إرسال طلب الانضمام' : 'إنشاء المؤسسة') : 'دخول')}
          </button>
        </form>
        
        <div className="mt-6 text-center pt-4 border-t border-gray-100">
           <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setFormData({name:'', username:'', password:'', agencyId: ''}); setJoinExisting(false); }}
              className="text-sm font-bold text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto"
           >
              {isRegistering ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
           </button>
        </div>
      </div>
    </div>
  );
}

// ... (باقي كود الـ App الرئيسي)
function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('newsroom_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  // ... (باقي الـ State والدوال)
  return (
    <div className="min-h-screen font-sans pb-32 md:pb-10" dir="rtl">
       {/* (تكملة مكونات الـ UI) */}
    </div>
  );
}

export default App;
