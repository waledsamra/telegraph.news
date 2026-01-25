
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
  PieChart as PieChartIcon, BarChart as BarChartIcon, Briefcase, Zap, Terminal, Code
} from 'lucide-react';
import { supabase } from './supabaseClient';

/**
 * Newsroom Platform V1.2.1 - Enhanced Connectivity
 */

const DEPARTMENTS = [
  { id: 'politics', name: 'السياسة', color: 'bg-red-500', icon: Globe },
  { id: 'economy', name: 'الاقتصاد', color: 'bg-green-500', icon: TrendingUp },
  { id: 'sports', name: 'الرياضة', color: 'bg-blue-500', icon: Award },
  { id: 'culture', name: 'الفن والثقافة', color: 'bg-purple-500', icon: Star },
  { id: 'accidents', name: 'الحوادث', color: 'bg-orange-500', icon: AlertTriangle },
  { id: 'general', name: 'عام', color: 'bg-gray-500', icon: FileText }
];

const ROLES = { ADMIN: 'admin', EDITOR: 'editor', JOURNALIST: 'journalist' };

// --- SQL Script Generator for User ---
const SQL_SETUP_SCRIPT = `-- نسخ هذا الكود بالكامل ولصقه في Supabase SQL Editor

-- 1. جدول المؤسسات
CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'journalist',
  agency_id TEXT REFERENCES agencies(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الإنتاج اليومي
CREATE TABLE IF NOT EXISTS daily_production (
  id TEXT PRIMARY KEY,
  agency_id TEXT REFERENCES agencies(id),
  journalist_name TEXT,
  journalist_username TEXT,
  headline TEXT NOT NULL,
  section TEXT,
  status TEXT,
  platform TEXT,
  url TEXT,
  date_string TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. إعدادات إضافية
CREATE TABLE IF NOT EXISTS agency_settings (
  agency_id TEXT PRIMARY KEY REFERENCES agencies(id),
  settings JSONB DEFAULT '{}'::jsonb
);`;

// --- Components ---
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', icon: Icon, loading = false }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:scale-[1.02]',
    secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
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

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-black text-slate-700 mr-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />}
      <input {...props} className={`w-full ${Icon ? 'pr-12' : 'px-6'} pl-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner`} />
    </div>
  </div>
);

// --- Auth Screen with Diagnostic ---
function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSQL, setShowSQL] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', agencyId: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return setError({ message: 'يرجى إدخال البيانات' });
    setLoading(true); setError(null);

    try {
      // 1. فحص الاتصال وقراءة جدول المستخدمين
      const { data, error: dbErr } = await supabase
        .from('users')
        .select('*')
        .eq('username', formData.username.toLowerCase().trim())
        .eq('password', formData.password);

      if (dbErr) {
        if (dbErr.code === '42P01') {
          throw new Error('MISSING_TABLES: الجداول غير موجودة في قاعدة البيانات. يرجى تهيئتها.');
        }
        throw dbErr;
      }

      if (data && data.length > 0) {
        if (!data[0].approved) throw new Error('حسابك بانتظار تفعيل الإدارة');
        onLogin(data[0]);
      } else {
        throw new Error('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      console.error('Diagnostic:', err);
      let msg = err.message;
      if (msg.includes('Failed to fetch')) msg = 'فشل الاتصال: تأكد من صحة الرابط (URL) في supabaseClient.js أو أغلق مانع الإعلانات.';
      setError({ message: msg, code: err.message.includes('MISSING_TABLES') ? 'SQL' : 'NET' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 font-cairo">
      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
            <Lock size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-800">Newsroom</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-widest">Database Sync Active</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mb-8 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-xs font-black">{error.message}</p>
            </div>
            
            {error.code === 'SQL' && (
              <Button variant="danger" size="sm" className="w-full" icon={Code} onClick={() => setShowSQL(!showSQL)}>
                {showSQL ? 'إخفاء كود الإصلاح' : 'إظهار كود إصلاح الجداول (SQL)'}
              </Button>
            )}
            
            {showSQL && (
              <div className="relative">
                <textarea 
                  readOnly 
                  className="w-full h-40 bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[10px] font-mono leading-relaxed"
                  value={SQL_SETUP_SCRIPT}
                />
                <button 
                  onClick={() => {navigator.clipboard.writeText(SQL_SETUP_SCRIPT); alert('تم النسخ! الصقه في SQL Editor بموقع Supabase');}}
                  className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  <Copy size={14}/>
                </button>
                <p className="text-[9px] text-slate-500 font-bold mt-2">انسخ الكود أعلاه وضعه في "SQL Editor" داخل مشروعك في Supabase ثم اضغط "Run".</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <Input label="اسم المستخدم" icon={Smartphone} placeholder="admin" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          <Input label="كلمة المرور" icon={Key} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <Button type="submit" loading={loading} className="w-full py-5 text-lg" icon={Send}>دخول للمنصة</Button>
        </form>

        <p className="text-center text-[10px] text-slate-400 font-black mt-8 uppercase tracking-widest">Advanced Production Management System</p>
      </div>
    </div>
  );
}

// --- Main App ---
function MainApp({ user, onLogout }) {
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('daily_production').select('*').eq('agency_id', user.agency_id);
      setProduction(data || []);
      setLoading(false);
    };
    load();
  }, [user.agency_id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" dir="rtl">
       <aside className="w-full md:w-80 bg-white border-l p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
             <div className="bg-blue-600 p-2 rounded-xl text-white"><Megaphone size={20}/></div>
             <h1 className="text-xl font-black">Newsroom</h1>
          </div>
          <div className="flex-1 space-y-2">
             <button className="w-full text-right p-4 bg-blue-50 text-blue-600 rounded-2xl font-black flex items-center gap-3"><LayoutDashboard size={18}/> الرئيسية</button>
             <button className="w-full text-right p-4 text-slate-500 hover:bg-slate-50 rounded-2xl font-black flex items-center gap-3"><FileText size={18}/> الإنتاج</button>
          </div>
          <button onClick={onLogout} className="mt-auto p-4 text-red-500 font-black flex items-center gap-3"><LogOut size={18}/> خروج</button>
       </aside>
       <main className="flex-1 p-10">
          <header className="flex justify-between items-center mb-10">
             <h2 className="text-3xl font-black text-slate-800">مرحباً {user.name}</h2>
             <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-black text-xs">ID: {user.agency_id}</div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <p className="text-slate-400 font-black text-xs uppercase mb-2">إجمالي الإنتاج</p>
                <h3 className="text-5xl font-black">{production.length}</h3>
             </div>
          </div>
       </main>
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

  if (!init) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48}/></div>;

  return (
    <div className="antialiased text-slate-900 font-cairo">
      {!user ? (
        <AuthScreen onLogin={(u) => { setUser(u); localStorage.setItem('newsroom_session_v1_2', JSON.stringify(u)); }} />
      ) : (
        <MainApp user={user} onLogout={() => { setUser(null); localStorage.removeItem('newsroom_session_v1_2'); }} />
      )}
    </div>
  );
}
