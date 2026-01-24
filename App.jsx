
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
import { GoogleGenAI } from "@google/genai";

// --- الإعدادات الافتراضية ---
const DEFAULT_DEPARTMENTS = ['سياسة', 'اقتصاد', 'رياضة', 'فن وثقافة', 'حوادث', 'منوعات', 'تحقيقات', 'ديسك مركزي', 'عام'];
const PLATFORMS = ['موقع إلكتروني', 'فيسبوك', 'انستجرام', 'تيك توك', 'يوتيوب', 'أخرى'];

const THEMES = {
  blue: { name: 'أزرق', primary: 'bg-blue-800', hover: 'hover:bg-blue-900', text: 'text-blue-800', light: 'bg-blue-50', border: 'border-blue-200' },
  red: { name: 'أحمر', primary: 'bg-red-800', hover: 'hover:bg-red-900', text: 'text-red-800', light: 'bg-red-50', border: 'border-red-200' },
  green: { name: 'أخضر', primary: 'bg-green-800', hover: 'hover:bg-green-900', text: 'text-green-800', light: 'bg-green-50', border: 'border-green-200' },
};

// --- المكونات الصغيرة ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-90`}>
      <Icon size={24} />
    </div>
  </div>
);

// --- شاشة تسجيل الدخول ---
function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', agencyId: '' });
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

      if (dbError) throw dbError;

      if (users && users.length > 0) {
        const user = users[0];
        if (!user.approved) {
          setError('حسابك قيد المراجعة من قبل الإدارة');
        } else {
          onLogin(user);
        }
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      console.error(err);
      setError('فشل الاتصال بقاعدة البيانات. تأكد من تشغيل أوامر SQL في Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (joinExisting) {
        // انضمام لمؤسسة
        const { data: agency } = await supabase.from('agencies').select('id').eq('id', formData.agencyId).single();
        if (!agency) throw new Error("كود المؤسسة غير صحيح");

        const newUser = {
          id: String(Date.now()),
          name: formData.name,
          username: formData.username.toLowerCase(),
          password: formData.password,
          role: 'journalist',
          agency_id: formData.agencyId,
          approved: false
        };
        const { error: insErr } = await supabase.from('users').insert([newUser]);
        if (insErr) throw insErr;
        alert("تم إرسال طلب الانضمام! انتظر موافقة المدير.");
        setIsRegistering(false);
      } else {
        // إنشاء مؤسسة جديدة
        const newId = Date.now();
        await supabase.from('agencies').insert([{ id: newId, name: `مؤسسة ${formData.name}` }]);
        await supabase.from('agency_settings').insert([{ agency_id: newId }]);
        const adminUser = {
          id: String(Date.now()),
          name: formData.name,
          username: formData.username.toLowerCase(),
          password: formData.password,
          role: 'admin',
          agency_id: newId,
          approved: true
        };
        await supabase.from('users').insert([adminUser]);
        onLogin(adminUser);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-200">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Newsroom</h2>
          <p className="text-slate-500 mt-2">{isRegistering ? 'إنشاء حساب جديد' : 'تسجيل دخول الموظفين'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold text-center border border-red-100">{error}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button type="button" onClick={() => setJoinExisting(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${!joinExisting ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>مؤسسة جديدة</button>
                <button type="button" onClick={() => setJoinExisting(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${joinExisting ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>انضمام لمؤسسة</button>
              </div>
              {joinExisting && (
                <input type="number" placeholder="كود المؤسسة" className="w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white outline-none ring-blue-500 focus:ring-2" value={formData.agencyId} onChange={e => setFormData({...formData, agencyId: e.target.value})} />
              )}
              <input type="text" placeholder="الاسم الكامل" className="w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white outline-none ring-blue-500 focus:ring-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </>
          )}
          <input type="text" placeholder="اسم المستخدم" className="w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white outline-none ring-blue-500 focus:ring-2" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          <input type="password" placeholder="كلمة المرور" className="w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white outline-none ring-blue-500 focus:ring-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'إنشاء الحساب' : 'دخول')}
          </button>
        </form>

        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 text-sm font-bold text-blue-600 hover:underline">
          {isRegistering ? 'لديك حساب؟ سجل دخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
        </button>
      </div>
    </div>
  );
}

// --- المكون الرئيسي للمنصة ---
function MainApp({ user, onLogout }) {
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ headline: '', url: '', section: 'عام', status: 'نشرت', platform: 'موقع إلكتروني' });
  const [aiIdea, setAiIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('daily_production')
      .select('*')
      .eq('agency_id', user.agency_id)
      .order('timestamp', { ascending: false });
    setProduction(data || []);
    setLoading(false);
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    const item = {
      id: String(Date.now()),
      agency_id: user.agency_id,
      journalist_name: user.name,
      journalist_username: user.username,
      ...newArticle,
      date_string: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    await supabase.from('daily_production').insert([item]);
    setShowAddModal(false);
    fetchData();
  };

  const generateIdea = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "اعطني 3 أفكار لمقالات صحفية ترند اليوم باللغة العربية مع عناوين جذابة",
      });
      setAiIdea(response.text);
    } catch (err) {
      setAiIdea("فشل توليد الأفكار، تأكد من مفتاح API Key");
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><LayoutDashboard size={20}/></div>
          <h1 className="text-xl font-black text-slate-800">Newsroom</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold transition">
            <Activity size={18}/> الرئيسية
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition">
            <MessageSquare size={18}/> الرسائل
          </button>
          {user.role === 'admin' && (
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition">
              <Settings size={18}/> الإعدادات
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase">{user.name[0]}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition">
            <LogOut size={16}/> تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">أهلاً بك، {user.name} 👋</h2>
            <p className="text-slate-500">متابعة الإنتاج اليومي للمؤسسة الصحفية</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center gap-2 transition transform active:scale-95">
            <Plus size={20}/> إضافة خبر جديد
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="إجمالي الأخبار" value={production.length} icon={FileText} colorClass="text-blue-600 bg-blue-600" />
          <StatCard title="أخبار اليوم" value={production.filter(i => i.date_string === new Date().toISOString().split('T')[0]).length} icon={TrendingUp} colorClass="text-emerald-600 bg-emerald-600" />
          <StatCard title="كود المؤسسة" value={user.agency_id} icon={Hash} colorClass="text-orange-600 bg-orange-600" />
          <StatCard title="الصحفيين" value="-" icon={Users} colorClass="text-purple-600 bg-purple-600" />
        </div>

        {/* AI Ideas Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Lightbulb size={24}/></div>
              <h3 className="text-xl font-bold">أفكار ذكية بـ Gemini</h3>
            </div>
            <button onClick={generateIdea} disabled={isGenerating} className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition">
              {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>}
              توليد أفكار
            </button>
          </div>
          {aiIdea && <div className="bg-white/10 p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap">{aiIdea}</div>}
        </div>

        {/* Production Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800">سجل الإنتاج الأخير</h3>
            <button onClick={fetchData} className="text-slate-400 hover:text-blue-600 transition"><RefreshCw size={18}/></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">الصحفي</th>
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">القسم</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">المنصة</th>
                  <th className="px-6 py-4">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan="6" className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600"/></td></tr>
                ) : production.length === 0 ? (
                   <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-bold">لا يوجد إنتاج مسجل حالياً</td></tr>
                ) : production.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-700">{item.journalist_name}</td>
                    <td className="px-6 py-4 max-w-xs"><p className="truncate font-medium text-slate-600">{item.headline}</p></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.section}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === 'نشرت' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{item.platform}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(item.timestamp).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">إضافة إنتاج جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 transition"><X/></button>
            </div>
            <form onSubmit={handleAddArticle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">عنوان الخبر</label>
                <input required type="text" className="w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white outline-none" placeholder="اكتب العنوان هنا..." value={newArticle.headline} onChange={e => setNewArticle({...newArticle, headline: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">القسم</label>
                  <select className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" value={newArticle.section} onChange={e => setNewArticle({...newArticle, section: e.target.value})}>
                    {DEFAULT_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">الحالة</label>
                  <select className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" value={newArticle.status} onChange={e => setNewArticle({...newArticle, status: e.target.value})}>
                    <option value="نشرت">نشرت</option>
                    <option value="ديسك">ديسك</option>
                    <option value="مبيت">مبيت</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition">حفظ الإنتاج</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- المكون الرئيسي للمدخل ---
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('newsroom_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('newsroom_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('newsroom_user');
  };

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

export default App;
