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

// ==========================================
// 1. Helpers
// ==========================================

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

// ==========================================
// 6. Live Clock Component
// ==========================================
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

// ==========================================
// 2. Assignment Center
// ==========================================
function AssignmentCenter({ currentUser, departments, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientType, setRecipientType] = useState('user'); 
  const [recipientId, setRecipientId] = useState('');
  const [priority, setPriority] = useState('normal'); 
  const [activeTab, setActiveTab] = useState('inbox_private'); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentPopup, setUrgentPopup] = useState(null); 
  
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 100 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const lastCheckedTimeRef = useRef(new Date().toISOString());
  const canSend = currentUser.role === 'admin' || currentUser.role === 'managing_editor';

  const themeClasses = THEMES[theme];

  const fetchMessages = async () => {
    try {
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('agency_id', currentUser.agency_id);

      if (error) throw error;
      
      const myMessages = allMessages.filter(msg => {
        if (msg.priority === 'idea') return false; 
        const isToMe = msg.to_user_id === currentUser.id;
        const mySection = currentUser.section || 'عام'; 
        const isToMySection = msg.to_section === mySection || msg.to_section === 'all';
        const isToDesk = canSend && msg.to_section === 'ديسك مركزي'; 
        const isFromMe = msg.from_user_id === currentUser.id;
        return isToMe || isToMySection || isToDesk || isFromMe;
      }).sort((a, b) => {
          const tA = new Date(a.timestamp).getTime() || 0;
          const tB = new Date(b.timestamp).getTime() || 0;
          return tB - tA;
      });

      setMessages(myMessages);

      const newIncoming = myMessages.filter(m => 
        m.from_user_id !== currentUser.id && 
        (new Date(m.timestamp).getTime() || 0) > (new Date(lastCheckedTimeRef.current).getTime() || 0)
      );

      if (newIncoming.length > 0) {
        const latestMsg = newIncoming[0];
        if (latestMsg.priority === 'urgent') setUrgentPopup(latestMsg);
        lastCheckedTimeRef.current = new Date().toISOString();
      }

      const unread = myMessages.filter(m => m.from_user_id !== currentUser.id && !m.read_by?.includes(currentUser.id)).length;
      setUnreadCount(unread);
    } catch (e) { console.error("Chat error:", e); }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('agency_id', currentUser.agency_id)
        .eq('approved', true);

      if (error) throw error;
      setUsers(data.filter(u => u.id !== currentUser.id));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isOpen && canSend) fetchUsers();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); 
    return () => clearInterval(interval);
  }, [isOpen, currentUser.id, canSend]);

  const handleTouchStart = (e) => {
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const handleTouchMove = (e) => {
    isDragging.current = true;
    const touch = e.touches[0];
    let newX = touch.clientX - dragOffset.current;
    let newY = touch.clientY - dragOffset.current;
    newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => { };

  const handleClick = () => {
    if (!isDragging.current) {
        setIsOpen(true);
    }
    isDragging.current = false;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (recipientType === 'user' && !recipientId) return alert('اختر المستلم');
    if (recipientType === 'section' && !recipientId) return alert('اختر القسم');

    const msgData = {
      id: String(Date.now()),
      agency_id: currentUser.agency_id,
      from_user_id: currentUser.id,
      from_name: currentUser.name,
      to_user_id: recipientType === 'user' ? recipientId : null,
      to_section: recipientType === 'section' ? recipientId : null,
      text: newMessage,
      priority: priority,
      timestamp: new Date().toISOString(),
      read_by: [], 
    };

    await supabase.from('messages').insert([msgData]);

    setNewMessage('');
    setPriority('normal');
    fetchMessages();
    alert('تم الإرسال');
    setActiveTab('inbox_private'); 
  };

  const markAsRead = async (msg) => {
    if (msg.read_by?.includes(currentUser.id)) return;
    const updatedReadBy = [...(msg.read_by || []), currentUser.id];
    await supabase.from('messages').update({ read_by: updatedReadBy }).eq('id', msg.id);
    fetchMessages();
  };

  const handleClaimTask = async (msg) => {
    if (msg.assigned_to) return; 
    if(window.confirm("هل تريد استلام هذه المهمة؟")) {
        const updatedReadBy = msg.read_by?.includes(currentUser.id) ? msg.read_by : [...(msg.read_by || []), currentUser.id];
        await supabase.from('messages').update({ 
            assigned_to: currentUser.id, 
            assigned_to_name: currentUser.name, 
            read_by: updatedReadBy 
        }).eq('id', msg.id);
        fetchMessages();
    }
  };

  const handleDeleteMsg = async (msgId) => {
    if(window.confirm("حذف هذه الرسالة نهائياً؟")) {
      await supabase.from('messages').delete().eq('id', msgId);
      fetchMessages();
    }
  };

  const privateMessages = messages.filter(m => m.to_user_id === currentUser.id || m.from_user_id === currentUser.id);
  const sectionMessages = messages.filter(m => (m.to_section === currentUser.section || m.to_section === 'all' || m.to_section === 'ديسك مركزي') && !m.to_user_id);

  return (
    <>
      {urgentPopup && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border-t-8 border-red-600 animate-bounce-in">
            <h2 className="text-2xl font-bold mb-2 text-red-600 flex items-center gap-2"><AlertTriangle /> تكليف عاجل!</h2>
            <p className="text-gray-800 mb-4">{urgentPopup.text}</p>
            <p className="text-xs text-gray-500 mb-4">من: {urgentPopup.from_name}</p>
            <button onClick={() => {markAsRead(urgentPopup); setUrgentPopup(null); setIsOpen(true)}} className="w-full bg-red-600 text-white py-2 rounded font-bold">علم وجاري التنفيذ</button>
          </div>
        </div>
      )}

      {!isOpen && (
        <div 
            className="fixed z-[100] no-print"
            style={{ left: position.x, top: position.y, touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg animate-bounce font-bold border border-white z-10 pointer-events-none">
              {unreadCount}
            </div>
          )}
          <button 
            onClick={handleClick}
            className={`${themeClasses.primary} text-white p-3 md:p-4 rounded-full md:rounded-2xl shadow-xl flex items-center gap-2 transition-transform hover:scale-105 border-2 border-orange-500 active:scale-95`}
          >
            <Inbox className="h-6 w-6 text-white" />
            <span className="font-bold hidden md:inline">مركز التكليفات</span>
            <span className="md:hidden"><Move size={14} className="opacity-50"/></span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:left-6 z-[200] bg-white w-full md:w-96 h-full md:h-[600px] md:rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 font-sans">
          <div className={`text-white p-4 flex justify-between items-center ${themeClasses.primary}`}>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-white" />
              <div>
                <h3 className="font-bold text-sm">منصة التكليفات</h3>
                <p className="text-[10px] text-blue-200">{currentUser.name}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex bg-gray-100 p-1 gap-1 text-xs font-bold border-b">
            <button onClick={() => setActiveTab('inbox_private')} className={`flex-1 py-2 rounded ${activeTab === 'inbox_private' ? `bg-white shadow ${themeClasses.text}` : 'text-gray-500'}`}>خاص</button>
            <button onClick={() => setActiveTab('inbox_section')} className={`flex-1 py-2 rounded ${activeTab === 'inbox_section' ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}>القسم</button>
            {canSend && <button onClick={() => setActiveTab('compose')} className={`flex-1 py-2 rounded ${activeTab === 'compose' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>جديد</button>}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3 pb-20 md:pb-3">
             {activeTab === 'compose' && canSend ? (
                <form onSubmit={handleSendMessage} className="space-y-3">
                   <select className="w-full p-2 border rounded" value={recipientId} onChange={e => setRecipientId(e.target.value)}>
                      <option value="">اختر المستلم...</option>
                      {recipientType === 'user' ? users.map(u => <option key={u.id} value={u.id}>{u.name}</option>) : departments.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                   <div className="flex gap-2 text-xs font-bold">
                      <label className="flex items-center gap-1"><input type="radio" name="rec" checked={recipientType === 'user'} onChange={() => setRecipientType('user')} /> موظف</label>
                      <label className="flex items-center gap-1"><input type="radio" name="rec" checked={recipientType === 'section'} onChange={() => setRecipientType('section')} /> قسم</label>
                   </div>
                   <div className="flex gap-2 text-xs font-bold">
                      <label className="flex items-center gap-1"><input type="radio" name="prio" checked={priority === 'normal'} onChange={() => setPriority('normal')} /> عادي</label>
                      <label className="flex items-center gap-1 text-red-600"><input type="radio" name="prio" checked={priority === 'urgent'} onChange={() => setPriority('urgent')} /> عاجل</label>
                   </div>
                   <textarea className="w-full p-2 border rounded h-32 text-sm" placeholder="نص التكليف..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                   <button type="submit" className={`w-full ${themeClasses.primary} text-white py-2 rounded font-bold ${themeClasses.hover}`}>إرسال</button>
                </form>
             ) : (
                (activeTab === 'inbox_private' ? privateMessages : sectionMessages).length === 0 ? <div className="text-center text-gray-400 py-10">لا توجد رسائل</div> :
                (activeTab === 'inbox_private' ? privateMessages : sectionMessages).map(msg => (
                   <div key={msg.id} onClick={() => !msg.read_by?.includes(currentUser.id) && markAsRead(msg)} className={`p-3 rounded border bg-white ${msg.priority === 'urgent' ? 'border-red-400 bg-red-50' : 'border-blue-200'} cursor-pointer relative group`}>
                      <div className="flex justify-between mb-1">
                         <span className="font-bold text-xs flex items-center gap-1"><User size={10}/> {msg.from_name}</span>
                         <span className="text-[9px] text-gray-400">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      
                      {activeTab === 'inbox_section' && !canSend && !msg.assigned_to && <button onClick={(e) => {e.stopPropagation(); handleClaimTask(msg)}} className="w-full mt-2 bg-blue-50 text-blue-700 text-xs py-1.5 rounded font-bold hover:bg-blue-100 border border-blue-200">استلام المهمة</button>}
                      
                      {msg.assigned_to && <div className="text-xs text-green-600 mt-2 flex items-center gap-1 bg-green-50 p-1 rounded w-fit"><Lock size={10}/> {msg.assigned_to === currentUser.id ? 'جاري التنفيذ (أنا)' : `مع ${msg.assigned_to_name}`}</div>}

                      {canSend && (
                        <div className="absolute top-2 left-2 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow">
                           <button onClick={(e)=>{e.stopPropagation(); handleDeleteMsg(msg.id)}} className="text-red-500"><Trash2 size={12}/></button>
                        </div>
                      )}
                   </div>
                ))
             )}
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 3. Journalist Dashboard
// ==========================================
function JournalistDashboard({ user, departments, articleStatuses, theme }) {
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]); 
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]); 

  const [headline, setHeadline] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState(user.section || departments[0]);
  const [status, setStatus] = useState(articleStatuses[0] || 'نشرت'); 
  const [platform, setPlatform] = useState(PLATFORMS[0]); 
  const [submitting, setSubmitting] = useState(false);
  const [myArticles, setMyArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [ideaReply, setIdeaReply] = useState(''); 
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [note, setNote] = useState(''); // New state for notes to hold fetched data
  
  // Performance Checks State
  const [performanceLoading, setPerformanceLoading] = useState({});
  const [performanceScores, setPerformanceScores] = useState({});

  const userDailyTarget = user.daily_target || DEFAULT_DAILY_TARGET;
  const themeClasses = THEMES[theme];

  const fetchData = async () => {
    try {
      // Fetch Articles
      const { data: articles } = await supabase
        .from('daily_production')
        .select('*')
        .eq('agency_id', user.agency_id)
        .eq('journalist_username', user.username)
        .eq('date_string', viewDate);
        
      if(articles) setMyArticles(articles.reverse());
      
      // Fetch Ideas
      const { data: allMsgs } = await supabase
        .from('messages')
        .select('*')
        .eq('agency_id', user.agency_id)
        .eq('priority', 'idea');

      if(allMsgs) {
          const myIdeas = allMsgs.filter(m => m.to_user_id === user.id || m.to_section === user.section || m.to_section === 'all');
          setIdeas(myIdeas);
      }
    } catch (error) { console.error("Error fetching", error); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user.username, viewDate]);

  useEffect(() => {
      if(!editingArticle) setFormDate(viewDate);
  }, [viewDate, editingArticle]);

  const handleFetchUrl = async () => {
      if (!url.trim()) return alert("الرجاء إدخال الرابط أولاً");
      setIsFetching(true);
      try {
          // Using a proxy to bypass CORS and fetch title
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
          if (!response.ok) throw new Error("Network error");
          const data = await response.json();
          const html = data.contents;
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // 1. Fetch Title
          let fetchedTitle = 
              doc.querySelector('meta[property="og:title"]')?.content || 
              doc.querySelector('title')?.innerText || 
              "";
          // Cleanup title (remove site name if separated by | or -)
          if(fetchedTitle) fetchedTitle = fetchedTitle.split('|')[0].split(' - ')[0].trim();

          // 2. Fetch Date
          // Try different meta tags for date
          const dateMeta = 
              doc.querySelector('meta[property="article:published_time"]')?.content || 
              doc.querySelector('meta[name="date"]')?.content ||
              doc.querySelector('time[itemprop="datePublished"]')?.dateTime;
          
          let fetchedDateStr = "";
          let fetchedTimeStr = "";

          if (dateMeta) {
              const d = new Date(dateMeta);
              if (!isNaN(d.getTime())) {
                  fetchedDateStr = d.toISOString().split('T')[0];
                  fetchedTimeStr = d.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});
              }
          }

          // 3. Fetch Tags/Keywords
          let fetchedTags = [];
          const tagMetas = doc.querySelectorAll('meta[property="article:tag"]');
          if (tagMetas.length > 0) {
              tagMetas.forEach(t => fetchedTags.push(t.content));
          } else {
              const keywords = doc.querySelector('meta[name="keywords"]')?.content;
              if (keywords) fetchedTags = keywords.split(',').map(k => k.trim()).slice(0, 5); // limit to 5
          }

          // 4. Fetch Word Count (Heuristic: count words in P tags)
          let wordCount = 0;
          const paragraphs = doc.querySelectorAll('p');
          if (paragraphs.length > 0) {
              const fullText = Array.from(paragraphs)
                  .map(p => p.innerText)
                  .filter(text => text.length > 50) // Filter out short snippets like nav items
                  .join(' ');
              wordCount = fullText.split(/\s+/).length;
          }

          // --- APPLY TO STATE ---
          if (fetchedTitle) setHeadline(fetchedTitle);
          if (fetchedDateStr) setFormDate(fetchedDateStr);
          
          // Construct Info Note
          let infoParts = [];
          if (fetchedTimeStr) infoParts.push(`نشر الساعة: ${fetchedTimeStr}`);
          if (wordCount > 0) infoParts.push(`عدد الكلمات: ~${wordCount}`);
          if (fetchedTags.length > 0) infoParts.push(`الوسوم: ${fetchedTags.join('، ')}`);
          
          if (infoParts.length > 0) {
              const newNote = infoParts.join('\n') + (note ? `\n---\n${note}` : '');
              setNote(newNote);
          }

      } catch (err) {
          console.error(err);
          alert("فشل جلب البيانات من الرابط. تأكد من صحة الرابط.");
      } finally {
          setIsFetching(false);
      }
  };

  const handleCheckPerformance = async (articleId, url) => {
      if(!url) return alert("لا يوجد رابط لهذا المقال");
      setPerformanceLoading(prev => ({ ...prev, [articleId]: true }));
      
      try {
          // Use Google PageSpeed Insights API (Public)
          // Strategy: mobile (since most news traffic is mobile)
          const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`;
          const response = await fetch(endpoint);
          const data = await response.json();
          
          if (data.lighthouseResult && data.lighthouseResult.categories.performance) {
              const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
              setPerformanceScores(prev => ({ ...prev, [articleId]: score }));
          } else {
              alert("تعذر جلب بيانات الأداء. تأكد من أن الرابط علني ويعمل.");
          }
      } catch (err) {
          console.error(err);
          alert("فشل الاتصال بخدمة Google PageSpeed.");
      } finally {
          setPerformanceLoading(prev => ({ ...prev, [articleId]: false }));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline.trim()) return;

    // --- Confirmation Dialog ---
    const confirmMessage = `برجاء مراجعة البيانات قبل الحفظ:\n\n` +
      `- العنوان: ${headline}\n` +
      `- المنصة: ${platform}\n` +
      `- القسم: ${section}\n` +
      `- الحالة: ${status}\n` +
      `- تاريخ النشر: ${formatDate(formDate)}\n\n` +
      `هل تريد الاستمرار والحفظ؟`;

    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);
    try {
      const payload = {
        headline: headline.trim(),
        url: url.trim(),
        section: section,
        status: status, 
        platform: platform,
        date_string: formDate,
        note: note // Save the fetched notes
      };
      
      if (editingArticle) {
        await supabase.from('daily_production').update(payload).eq('id', editingArticle.id);
        setEditingArticle(null);
      } else {
        payload.id = String(Date.now());
        payload.agency_id = user.agency_id;
        payload.journalist_name = user.name;
        payload.journalist_username = user.username;
        payload.rating = 0;
        payload.timestamp = new Date().toISOString();
        
        await supabase.from('daily_production').insert([payload]);
      }
      setHeadline(''); setUrl(''); setStatus('نشرت'); setPlatform(PLATFORMS[0]); setNote(''); fetchData();
    } catch (error) { alert("حدث خطأ في الاتصال"); } finally { setSubmitting(false); }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setHeadline(article.headline);
    setUrl(article.url || '');
    setSection(article.section || user.section);
    setStatus(article.status || 'نشرت'); 
    setPlatform(article.platform || PLATFORMS[0]);
    setFormDate(article.date_string);
    setNote(article.note || ''); // Set Note
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('حذف هذا الخبر؟')) {
      await supabase.from('daily_production').delete().eq('id', id);
      fetchData();
    }
  };

  const handleReplyToIdea = async (idea) => {
    if (!ideaReply.trim()) return;
    const newReply = {
      text: ideaReply,
      sender: user.name,
      time: new Date().toISOString()
    };
    const updatedReplies = [...(idea.replies || []), newReply];
    
    await supabase.from('messages').update({ replies: updatedReplies }).eq('id', idea.id);
    setIdeaReply('');
    fetchData();
  };

  const progressPercent = Math.min((myArticles.length / userDailyTarget) * 100, 100);
  const isTargetMet = myArticles.length >= userDailyTarget;

  return (
    <div className="space-y-6">
      {/* Target Card */}
      <div className={`bg-gradient-to-r rounded-xl p-6 text-white shadow-lg no-print ${theme === 'blue' ? 'from-blue-900 to-blue-800' : theme === 'red' ? 'from-red-900 to-red-800' : theme === 'green' ? 'from-green-900 to-green-800' : theme === 'purple' ? 'from-purple-900 to-purple-800' : 'from-slate-800 to-slate-700'}`}>
         <div className="flex justify-between items-end mb-2">
           <div>
             <h2 className="text-lg font-bold flex items-center gap-2"><Target className="h-5 w-5 text-orange-400" /> هدفك اليومي</h2>
             <p className="text-sm text-blue-100">تاريخ العرض: {formatDate(viewDate)}</p>
           </div>
           <div className="text-2xl font-bold text-orange-400">{myArticles.length} <span className="text-sm text-white font-normal">/ {userDailyTarget}</span></div>
         </div>
         <div className="w-full bg-black/20 rounded-full h-3">
           <div className={`h-3 rounded-full transition-all duration-500 ${isTargetMet ? 'bg-green-400' : 'bg-orange-500'}`} style={{ width: `${progressPercent}%` }}></div>
         </div>
      </div>
      
      {/* Ideas Section */}
      {ideas.length > 0 && (
         <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 no-print shadow-sm">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4"/> أفكار مقترحة لك</h3>
            <div className="space-y-3">
               {ideas.map(idea => (
                   <div key={idea.id} className="bg-white p-3 rounded-lg border border-orange-100 text-sm shadow-sm flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800">{idea.text}</p>
                          <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded">من: {idea.from_name}</span>
                       </div>
                       
                       {idea.replies && idea.replies.length > 0 && (
                         <div className="bg-gray-50 p-2 rounded text-xs space-y-2 mt-1 border border-gray-100 max-h-40 overflow-y-auto">
                            {idea.replies.map((reply, i) => {
                              const isMe = reply.sender === user.name;
                              return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-2 rounded-lg max-w-[85%] ${isMe ? 'bg-blue-100 text-blue-800' : 'bg-blue-200 text-gray-800'}`}>
                                    <p className="font-bold text-[10px] mb-0.5">{reply.sender}</p>
                                    <p>{reply.text}</p>
                                  </div>
                                </div>
                              );
                            })}
                         </div>
                       )}

                       <div className="flex gap-2 mt-1">
                          <input 
                            type="text" 
                            className="flex-1 border rounded px-2 py-1 text-xs" 
                            placeholder="اكتب تعليقاً أو رداً..." 
                            value={expandedIdea === idea.id ? ideaReply : ''}
                            onChange={(e) => {setExpandedIdea(idea.id); setIdeaReply(e.target.value)}}
                            onFocus={() => setExpandedIdea(idea.id)}
                          />
                          <button 
                            onClick={() => handleReplyToIdea(idea)} 
                            className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90"
                          >
                            رد
                          </button>
                       </div>
                   </div>
               ))}
            </div>
         </div>
      )}

      {/* Main Form */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border ${themeClasses.border} no-print`}>
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               {editingArticle ? <Edit className="h-5 w-5 text-orange-500" /> : <PenTool className={`h-5 w-5 ${themeClasses.text}`} />} 
               {editingArticle ? 'تعديل الخبر' : 'إضافة إنتاج جديد'}
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-gray-400">تاريخ العرض:</span>
               <div className={`flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border ${themeClasses.border}`}>
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <input 
                      type="date" 
                      className="bg-transparent text-sm text-gray-700 font-medium outline-none"
                      value={viewDate}
                      onChange={(e) => setViewDate(e.target.value)}
                  />
               </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
             {/* Row 0: URL with Fetcher */}
             <div className="col-span-1 md:col-span-12">
               <label className="block text-sm text-gray-600 mb-1">الرابط (اختياري - لجلب البيانات تلقائياً)</label>
               <div className="flex gap-2">
                   <input 
                      type="url" 
                      value={url} 
                      onChange={(e) => setUrl(e.target.value)} 
                      className={`flex-1 p-3 border rounded-lg dir-ltr text-right focus:ring-2 ${themeClasses.ring} bg-gray-50 focus:bg-white transition`} 
                      placeholder="ضع رابط الخبر هنا لجلب العنوان..." 
                   />
                   <button 
                      type="button" 
                      onClick={handleFetchUrl}
                      disabled={isFetching}
                      className={`bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition flex items-center gap-2 border border-blue-200`}
                      title="جلب عنوان الخبر تلقائياً"
                   >
                       {isFetching ? <Loader2 className="animate-spin h-5 w-5"/> : <RefreshCw className="h-5 w-5" />}
                       <span className="hidden sm:inline">جلب البيانات</span>
                   </button>
               </div>
             </div>

            {/* Row 1: Headline Full Width */}
            <div className="col-span-1 md:col-span-12">
              <label className="block text-sm text-gray-600 mb-1">عنوان الخبر <span className="text-red-500">*</span></label>
              <input type="text" required value={headline} onChange={(e) => setHeadline(e.target.value)} className={`w-full p-3 border rounded-lg focus:ring-2 ${themeClasses.ring} bg-gray-50 focus:bg-white transition`} placeholder="عنوان المادة..." />
            </div>
            
            {/* Row 2: Selects and Date */}
            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">المنصة</label>
              <select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white text-gray-700 cursor-pointer"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">القسم</label>
              <select 
                value={section} 
                onChange={(e) => setSection(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white text-gray-700 cursor-pointer"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">الحالة</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white text-gray-700 cursor-pointer"
              >
                {articleStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-3">
               <label className="block text-sm text-gray-600 mb-1">تاريخ النشر</label>
               <input 
                  type="date" 
                  className="w-full p-3 border rounded-lg bg-white text-gray-700 cursor-pointer"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  title="تاريخ نشر هذا الخبر تحديداً"
               />
            </div>

            {/* Row 3: Notes (where extra data goes) */}
            <div className="col-span-1 md:col-span-12">
               <label className="block text-sm text-gray-600 mb-1">ملاحظات / بيانات إضافية</label>
               <textarea 
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white text-sm" 
                  rows="2"
                  placeholder="ملاحظات، عدد الكلمات، وسوم..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
               />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className={`flex-1 text-white py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md ${editingArticle ? 'bg-orange-500 hover:bg-orange-600' : `${themeClasses.primary} ${themeClasses.hover}`}`}>
              {submitting ? 'جاري الحفظ...' : editingArticle ? 'حفظ التعديلات' : <><Send className="h-4 w-4" /> حفظ</>}
            </button>
            {editingArticle && (
              <button type="button" onClick={() => { setEditingArticle(null); setHeadline(''); setUrl(''); setStatus('نشرت'); setPlatform(PLATFORMS[0]); setFormDate(viewDate); setNote(''); }} className="bg-gray-100 text-gray-600 px-6 rounded-xl font-bold hover:bg-blue-200">إلغاء</button>
            )}
          </div>
        </form>
      </div>

      {/* Production List */}
      <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border ${themeClasses.border}`}>
         <div className="flex justify-between items-center mb-6 border-b pb-4 no-print">
            <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /><h3 className="text-lg font-bold text-gray-800">سجل اليوم: {formatDate(viewDate)}</h3></div>
            <button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-gray-600 border px-3 py-1.5 rounded hover:bg-gray-50"><Printer className="h-4 w-4" /> طباعة</button>
         </div>
         
         {/* Mobile View (Cards) */}
         <div className="block md:hidden space-y-4">
            {myArticles.map((article, idx) => (
                <div key={article.id} className={`border ${themeClasses.border} rounded-xl p-4 bg-gray-50 shadow-sm relative`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`${themeClasses.light} ${themeClasses.text} text-xs font-bold px-2 py-1 rounded-full`}>#{idx + 1}</span>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleEdit(article)} className={`text-blue-600 bg-white p-1.5 rounded border ${themeClasses.border} shadow-sm`}><Edit className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleDelete(article.id)} className={`text-red-500 bg-white p-1.5 rounded border ${themeClasses.border} shadow-sm`}><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{article.headline}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-white border px-2 py-1 rounded text-xs font-bold text-gray-600">{article.section}</span>
                        <PlatformBadge platform={article.platform || 'موقع إلكتروني'} />
                        <StatusBadge status={article.status} />
                    </div>
                    {article.url && (
                        <div className="mb-3 space-y-2">
                            <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100">
                                <LinkIcon size={12} className="text-gray-400 shrink-0" />
                                <a href={article.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate dir-ltr flex-1">{article.url}</a>
                            </div>
                            
                            {/* SEO & Performance Actions Mobile */}
                            <div className="flex gap-2 justify-end no-print">
                                <PerformanceBadge score={performanceScores[article.id]} loading={performanceLoading[article.id]} />
                                <button 
                                    onClick={() => handleCheckPerformance(article.id, article.url)}
                                    className="bg-purple-100 text-purple-700 text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1 border border-purple-200 hover:bg-purple-200"
                                    title="فحص سرعة الصفحة (Google PageSpeed)"
                                >
                                    <Zap size={12} /> فحص السرعة
                                </button>
                                <a 
                                    href={`https://www.google.com/search?q=site:${article.url}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="bg-blue-100 text-blue-700 text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1 border border-blue-200 hover:bg-blue-200"
                                    title="التحقق من الفهرسة في جوجل"
                                >
                                    <SearchIcon size={12} /> هل تمت الفهرسة؟
                                </a>
                            </div>
                        </div>
                    )}
                    <div className={`flex justify-between items-end mt-2 pt-2 border-t ${themeClasses.border} text-xs text-gray-500`}>
                        <div className="flex flex-col">
                            <span>النشر: {formatDate(article.date_string)}</span>
                            <span>الإضافة: {formatTime(article.timestamp)}</span>
                        </div>
                        {article.rating > 0 && <RatingDisplay rating={article.rating} />}
                    </div>
                    {article.note && <div className="mt-2 text-orange-600 text-xs bg-orange-50 p-2 rounded border border-orange-100 flex gap-1 whitespace-pre-wrap"><MessageSquare size={12}/> {article.note}</div>}
                </div>
            ))}
         </div>

         {/* Desktop View (Table) */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-right border-collapse min-w-[600px]">
              <thead className={`bg-gray-50 text-gray-700 border-b ${themeClasses.border}`}>
                <tr>
                  <th className="py-3 px-4 font-bold">#</th>
                  <th className="py-3 px-4 font-bold w-1/3">العنوان</th>
                  <th className="py-3 px-4 font-bold">المنصة / القسم</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold">تاريخ النشر</th>
                  <th className="py-3 px-4 font-bold">وقت الإضافة</th>
                  <th className="py-3 px-4 font-bold">ملاحظات</th>
                  <th className="py-3 px-4 font-bold no-print text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myArticles.map((article, idx) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800 mb-1">{article.headline}</div>
                      {article.url && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-start gap-2 mt-1 bg-gray-50 p-1 rounded border border-gray-100 w-fit no-print">
                                <LinkIcon size={12} className="text-gray-400" />
                                <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                title={article.url}
                                className="text-xs text-blue-600 hover:underline truncate max-w-[200px] dir-ltr block"
                                >
                                {article.url}
                                </a>
                                <button type="button" onClick={() => copyToClip(article.url)} className="text-gray-400 hover:text-blue-600 transition" title="نسخ"><Copy size={12} /></button>
                            </div>
                            
                            {/* Desktop SEO Actions */}
                            <div className="flex gap-2 no-print">
                                <PerformanceBadge score={performanceScores[article.id]} loading={performanceLoading[article.id]} />
                                <button 
                                    onClick={() => handleCheckPerformance(article.id, article.url)}
                                    className="text-[10px] text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 flex items-center gap-1 transition"
                                >
                                    <Zap size={10} /> جودة الصفحة
                                </button>
                                <a 
                                    href={`https://www.google.com/search?q=site:${article.url}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 flex items-center gap-1 transition"
                                >
                                    <SearchIcon size={10} /> حالة الفهرسة
                                </a>
                            </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">{article.section}</span>
                            <PlatformBadge platform={article.platform || 'موقع إلكتروني'} />
                        </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={article.status} />
                        {article.rating && article.rating > 0 ? <RatingDisplay rating={article.rating} /> : null}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-700 text-xs">{formatDayName(article.date_string || article.timestamp)}</div>
                      <div className="font-mono text-[10px] text-gray-500 dir-ltr text-right">{article.date_string}</div>
                    </td>
                    <td className="py-3 px-4">
                        <div className={`font-mono text-xs ${themeClasses.text} ${themeClasses.light} px-2 py-1 rounded border ${themeClasses.border} dir-ltr text-right w-fit mx-auto`}>
                            {formatTime(article.timestamp)}
                        </div>
                    </td>
                    <td className="py-3 px-4">
                      {article.note && (
                        <div className="flex items-start gap-1 text-orange-600 text-xs bg-orange-50 p-1.5 rounded border border-orange-100 whitespace-pre-wrap">
                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" /> {article.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 no-print">
                        <div className="flex gap-2 justify-center">
                          <button type="button" onClick={() => handleEdit(article)} className={`text-blue-600 hover:bg-blue-50 p-1.5 rounded transition`} title="تعديل"><Edit className="h-4 w-4" /></button>
                          <button type="button" onClick={() => handleDelete(article.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded transition" title="حذف"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
         {myArticles.length === 0 && <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2"><Inbox className="h-10 w-10 opacity-20"/> لا يوجد إنتاج لهذا التاريخ</div>}
      </div>
    </div>
  );
}

// ==========================================
// 5. Admin Dashboard (CLEAN + SAFE)
// ==========================================
function AdminDashboard({
  user,
  departments,
  setDepartments,
  announcement,
  setAnnouncement,
  articleStatuses,
  setArticleStatuses,
  logoUrl,
  setLogoUrl,
  tickerSpeed,
  setTickerSpeed,
  tickerFontSize,
  setTickerFontSize,
  theme,
  setTheme
}) {
  const notifiedRef = useRef(false);

  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateFilterMode, setDateFilterMode] = useState("today");

  const [editingUser, setEditingUser] = useState(null);

  // Idea Bank
  const [sentIdeas, setSentIdeas] = useState([]);
  const [expandedIdea, setExpandedIdea] = useState(null);

  // Activity Log
  const [activityLogs, setActivityLogs] = useState([]);

  // Settings
  const [newDeptName, setNewDeptName] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Permission Check
  const isAdmin = user?.role === "admin";
  const themeClasses = (typeof THEMES !== "undefined" && THEMES[theme]) ? THEMES[theme] : { primary: "bg-blue-800" };

  // Safe arrays
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeIdeas = Array.isArray(sentIdeas) ? sentIdeas : [];
  const safeLogs = Array.isArray(activityLogs) ? activityLogs : [];

  // Helpers
  const setQuickDate = (type) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    let start = today;
    let end = today;

    if (type === "today") {
      // same day
    } else if (type === "month") {
      start = today.substring(0, 7) + "-01";
    } else if (type === "year") {
      start = today.substring(0, 4) + "-01-01";
    } else if (type === "all") {
      start = "2023-01-01";
    }
    setStartDate(start);
    setEndDate(end);
    setDateFilterMode(type);
  };

  const pendingUsers = safeUsers.filter((u) => u && u.approved === false);
  const activeUsers = safeUsers
    .filter((u) => u && u.approved !== false && u.role !== "admin")
    .filter((u) => {
      const s = (searchTerm || "").toLowerCase();
      const name = (u.name || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      return !s || name.includes(s) || username.includes(s);
    });

  const getFilteredArticles = () => {
    let base = safeArticles;

    base = base.filter((a) => {
      if (!a || !a.date_string) return false;
      return a.date_string >= startDate && a.date_string <= endDate;
    });

    return base;
  };

  const filteredArticles = getFilteredArticles();

  // =========================
  // Fetch Data (ONLY ONE VERSION)
  // =========================
  const fetchData = async () => {
    try {
      // Users
      const { data: uData, error: uErr } = await supabase
        .from("users")
        .select("*")
        .eq("agency_id", user.agency_id);

      if (uErr) throw uErr;
      setUsers(Array.isArray(uData) ? uData : []);

      // Articles
      const { data: aData, error: aErr } = await supabase
        .from("daily_production")
        .select("*")
        .eq("agency_id", user.agency_id);

      if (aErr) throw aErr;

      const list = Array.isArray(aData) ? aData : [];
      list.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());
      setArticles(list);

      // Ideas
      const { data: ideasData, error: ideasErr } = await supabase
        .from("messages")
        .select("*")
        .eq("agency_id", user.agency_id)
        .eq("priority", "idea");

      if (ideasErr) throw ideasErr;
      setSentIdeas(Array.isArray(ideasData) ? ideasData : []);

      // Activity Logs
      const { data: actData, error: actErr } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("agency_id", user.agency_id);

      if (actErr) throw actErr;
      setActivityLogs(Array.isArray(actData) ? actData : []);
    } catch (e) {
      console.error("Data fetch failed", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.agency_id]);

  // Notify once when pending exists
  useEffect(() => {
    if (pendingUsers.length > 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      alert(`يوجد ${pendingUsers.length} طلب/طلبات انضمام جديدة`);
    }
    if (pendingUsers.length === 0) {
      notifiedRef.current = false;
    }
  }, [pendingUsers.length]);

  // =========================
  // Actions
  // =========================
  const handleApprove = async (targetUser) => {
    if (!targetUser) return;
    const confirmMsg = `هل تريد الموافقة على انضمام الموظف التالي؟\n\n- الاسم: ${targetUser.name}\n- البريد: ${targetUser.username}`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from("users")
      .update({ approved: true })
      .eq("id", targetUser.id)
      .eq("agency_id", user.agency_id);

    if (error) {
      alert(error.message || "فشل الموافقة");
      return;
    }
    fetchData();
  };

  const handleReject = async (id) => {
    if (!id) return;
    if (!window.confirm("حذف هذا الطلب نهائياً؟")) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("agency_id", user.agency_id);

    if (error) {
      alert(error.message || "فشل الرفض");
      return;
    }
    fetchData();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const payload = {
      name: editingUser.name,
      role: editingUser.role,
      section: editingUser.section,
      daily_target: Number(editingUser.daily_target || 0)
    };

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", editingUser.id)
      .eq("agency_id", user.agency_id);

    if (error) {
      alert(error.message || "فشل تحديث المستخدم");
      return;
    }
    setEditingUser(null);
    fetchData();
  };

  const saveSettings = async (newDepts, newAnnouncement, newStatuses) => {
    setSavingSettings(true);
    try {
      const { error } = await supabase.from("agency_settings").upsert({
        agency_id: user.agency_id,
        departments: newDepts,
        announcement: newAnnouncement,
        article_statuses: newStatuses,
        logo_url: logoUrl,
        ticker_speed: tickerSpeed,
        ticker_font_size: tickerFontSize,
        theme_color: theme
      });

      if (error) throw error;

      setDepartments(newDepts);
      setAnnouncement(newAnnouncement);
      if (newStatuses) setArticleStatuses(newStatuses);

      alert("تم حفظ الإعدادات بنجاح ✅");
    } catch (e) {
      console.error(e);
      alert("فشل حفظ الإعدادات");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. استخدم صورة أقل من 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setLogoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch (_) {}
    window.location.reload();
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow p-4 border flex items-center justify-between">
        <div>
          <div className="font-black text-gray-800">لوحة المدير</div>
          <div className="text-sm font-bold text-gray-500">Agency: {user.agency_id}</div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition"
        >
          تسجيل خروج
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-2 border flex gap-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === "users" ? `${themeClasses.primary} text-white` : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          الموظفين
          {pendingUsers.length > 0 && (
            <span className="inline-flex ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === "stats" ? `${themeClasses.primary} text-white` : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          الإحصائيات
        </button>

        <button
          onClick={() => setActiveTab("ideas")}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === "ideas" ? `${themeClasses.primary} text-white` : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          بنك الأفكار
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === "activity" ? `${themeClasses.primary} text-white` : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          النشاط
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 rounded-xl font-bold transition ${
            activeTab === "settings" ? `${themeClasses.primary} text-white` : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          الإعدادات
        </button>
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow p-4 border space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-black text-gray-800">إدارة الموظفين</div>
            <input
              className="border rounded-xl px-3 py-2 font-bold text-sm w-64"
              placeholder="بحث بالاسم أو الإيميل…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {pendingUsers.length > 0 && (
            <div className="space-y-2">
              <div className="font-black text-red-700">طلبات انضمام جديدة</div>
              {pendingUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-xl bg-red-50">
                  <div>
                    <div className="font-black text-gray-800">{u.name}</div>
                    <div className="text-sm font-bold text-gray-500">{u.username}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(u)}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
                    >
                      موافقة
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="font-black text-gray-800">الموظفين النشطين</div>
            {activeUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 border rounded-xl">
                <div>
                  <div className="font-black text-gray-800">
                    {u.name} <span className="text-xs font-bold text-gray-500">({u.role})</span>
                  </div>
                  <div className="text-sm font-bold text-gray-500">{u.username}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingUser({ ...u })}
                    className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
                  >
                    تعديل
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingUser && (
            <div className="p-4 border rounded-2xl bg-gray-50 space-y-3">
              <div className="font-black text-gray-800">تعديل المستخدم</div>

              <input
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={editingUser.name || ""}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                placeholder="الاسم"
              />

              <input
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={editingUser.section || ""}
                onChange={(e) => setEditingUser({ ...editingUser, section: e.target.value })}
                placeholder="القسم"
              />

              <select
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={editingUser.role || "journalist"}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="journalist">journalist</option>
                <option value="admin">admin</option>
              </select>

              <input
                type="number"
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={editingUser.daily_target ?? 10}
                onChange={(e) => setEditingUser({ ...editingUser, daily_target: e.target.value })}
                placeholder="الهدف اليومي"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-800"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="bg-white rounded-2xl shadow p-4 border space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setQuickDate("today")} className="px-3 py-2 rounded-xl border font-bold">اليوم</button>
            <button onClick={() => setQuickDate("month")} className="px-3 py-2 rounded-xl border font-bold">الشهر</button>
            <button onClick={() => setQuickDate("year")} className="px-3 py-2 rounded-xl border font-bold">السنة</button>
            <button onClick={() => setQuickDate("all")} className="px-3 py-2 rounded-xl border font-bold">الكل</button>

            <div className="ml-auto flex items-center gap-2">
              <input type="date" className="border rounded-xl px-3 py-2 font-bold" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="border rounded-xl px-3 py-2 font-bold" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gray-50 border">
              <div className="text-sm font-bold text-gray-500">عدد المقالات</div>
              <div className="text-2xl font-black">{filteredArticles.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border">
              <div className="text-sm font-bold text-gray-500">عدد الموظفين</div>
              <div className="text-2xl font-black">{activeUsers.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border">
              <div className="text-sm font-bold text-gray-500">وضع التاريخ</div>
              <div className="text-2xl font-black">{dateFilterMode}</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-bold">
            (إحصائيات متقدمة موجودة في النسخة القديمة، لكن دي نسخة مستقرة تمنع الأعطال. لو تحب نرجّع الرسوم/التقييمات نضيفها تدريجيًا بعد ما يثبت النظام.)
          </div>
        </div>
      )}

      {activeTab === "ideas" && (
        <div className="bg-white rounded-2xl shadow p-4 border space-y-3">
          <div className="font-black text-gray-800">بنك الأفكار</div>

          {safeIdeas.length === 0 ? (
            <div className="font-bold text-gray-600">لا توجد أفكار مرسلة.</div>
          ) : (
            safeIdeas.map((idea) => (
              <div key={idea.id} className="border rounded-2xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-black text-gray-800">{idea.title || "فكرة"}</div>
                  <button
                    className="text-sm font-bold text-blue-700"
                    onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                  >
                    {expandedIdea === idea.id ? "إغلاق" : "عرض"}
                  </button>
                </div>
                {expandedIdea === idea.id && (
                  <div className="text-sm font-bold text-gray-600 mt-2">
                    {idea.content || idea.text || "—"}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-2xl shadow p-4 border space-y-3">
          <div className="font-black text-gray-800">سجل النشاط</div>
          {safeLogs.length === 0 ? (
            <div className="font-bold text-gray-600">لا يوجد نشاط مسجل.</div>
          ) : (
            safeLogs.map((log) => (
              <div key={log.id} className="border rounded-2xl p-3">
                <div className="font-black text-gray-800">{log.user_name || "—"}</div>
                <div className="text-sm font-bold text-gray-500">{log.date_string || ""}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl shadow p-4 border space-y-4">
          <div className="font-black text-gray-800">الإعدادات</div>

          <div className="space-y-2">
            <div className="font-bold text-gray-700">الإعلان</div>
            <textarea
              className="w-full border rounded-2xl p-3 font-bold"
              rows={3}
              value={announcement || ""}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="font-bold text-gray-700">الأقسام</div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-3 py-2 font-bold"
                placeholder="قسم جديد"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold"
                onClick={() => {
                  const name = (newDeptName || "").trim();
                  if (!name) return;
                  if (safeDepartments.includes(name)) return;
                  setDepartments([...safeDepartments, name]);
                  setNewDeptName("");
                }}
              >
                إضافة
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {safeDepartments.map((d) => (
                <span key={d} className="px-3 py-1 rounded-full bg-gray-100 border font-bold text-sm">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-gray-700">حالات المقالات</div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-3 py-2 font-bold"
                placeholder="حالة جديدة"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold"
                onClick={() => {
                  const name = (newStatusName || "").trim();
                  if (!name) return;
                  const list = Array.isArray(articleStatuses) ? articleStatuses : [];
                  if (list.includes(name)) return;
                  setArticleStatuses([...list, name]);
                  setNewStatusName("");
                }}
              >
                إضافة
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Array.isArray(articleStatuses) ? articleStatuses : []).map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-gray-100 border font-bold text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-gray-700">اللوجو</div>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {logoUrl && (
              <img src={logoUrl} alt="logo" className="h-16 rounded-xl border" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="font-bold text-gray-700">سرعة الشريط</div>
              <input
                type="number"
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={tickerSpeed ?? 50}
                onChange={(e) => setTickerSpeed(Number(e.target.value))}
              />
            </div>
            <div>
              <div className="font-bold text-gray-700">حجم الخط</div>
              <input
                type="number"
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={tickerFontSize ?? 16}
                onChange={(e) => setTickerFontSize(Number(e.target.value))}
              />
            </div>
            <div>
              <div className="font-bold text-gray-700">الثيم</div>
              <input
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={theme || ""}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={savingSettings}
            className="w-full px-4 py-3 rounded-2xl bg-blue-800 text-white font-black hover:bg-blue-900 disabled:opacity-60"
            onClick={() => saveSettings(
              safeDepartments,
              announcement || "",
              Array.isArray(articleStatuses) ? articleStatuses : []
            )}
          >
            {savingSettings ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>

          {!isAdmin && (
            <div className="text-sm font-bold text-red-600">
              تنبيه: حسابك ليس Admin. لن تستطيع اعتماد الموظفين.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ==========================================
// 4. Auth Screen (SaaS Edition) - AUTO LOGIN + SAFE UPSERT
// ==========================================
function AuthScreen({ onLogin, serverError }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    agencyId: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeEmail = (v) => (v || "").trim().toLowerCase();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = normalizeEmail(formData.email);

      // 1) Login via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      });
      if (authError) throw authError;

      const authUserId = authData?.user?.id;
      if (!authUserId) throw new Error("تعذر تحديد هوية المستخدم بعد تسجيل الدخول");

      // 2) Fetch profile by id (أفضل من username)
      const { data: users, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserId)
        .limit(1);

      if (profileError) throw profileError;

      if (users && users.length > 0) {
        const user = users[0];

        if (!user.approved) {
          setError("لم تتم الموافقة على حسابك بعد من قبل مدير المؤسسة");
          try { await supabase.auth.signOut(); } catch (_) {}
        } else {
          onLogin(user);
        }
      } else {
        setError("تم تسجيل الدخول لكن لا يوجد ملف مستخدم في النظام. تواصل مع المدير.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return setError("الرجاء ملء جميع البيانات");
    }
    if (joinExisting && !formData.agencyId) {
      return setError("الرجاء إدخال كود المؤسسة");
    }

    setLoading(true);
    setError("");

    try {
      const email = normalizeEmail(formData.email);

      // 0) منع تكرار الإيميل في جدول users
      const { data: existing, error: existingError } = await supabase
        .from("users")
        .select("id")
        .eq("username", email)
        .limit(1);

      if (existingError) throw existingError;
      if (existing && existing.length > 0) throw new Error("البريد الإلكتروني مستخدم مسبقاً");

      // 1) Sign Up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password
      });
      if (signUpError) throw signUpError;

      // ✅ 2) AUTO LOGIN مباشرة بعد التسجيل (دي اللي بتحل RLS/session)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      });
      if (loginError) throw loginError;

      const authUserId = loginData?.user?.id;
      if (!authUserId) throw new Error("تعذر إنشاء جلسة للمستخدم بعد التسجيل");

      if (joinExisting) {
        // --- JOIN EXISTING AGENCY FLOW ---
        const agencyId = Number(formData.agencyId);
        if (!Number.isFinite(agencyId)) throw new Error("كود المؤسسة غير صالح");

        // 3) Verify agency exists
        const { data: agency, error: agencyFetchError } = await supabase
          .from("agencies")
          .select("id")
          .eq("id", agencyId)
          .maybeSingle();

        if (agencyFetchError) throw agencyFetchError;
        if (!agency) throw new Error("كود المؤسسة غير صحيح. تأكد من الرقم مع المدير.");

        // 4) Upsert profile (Pending)
        const newUser = {
          id: authUserId,
          name: formData.name,
          username: email,
          role: "journalist",
          section: "عام",
          approved: false,
          agency_id: agencyId,
          daily_target: 10
        };

        const { error: upsertError } = await supabase
          .from("users")
          .upsert([newUser], { onConflict: "id" });

        if (upsertError) throw upsertError;

        alert("تم إرسال طلب الانضمام بنجاح! يرجى انتظار تفعيل الحساب من قبل مدير المؤسسة.");
        setIsRegistering(false);
        setJoinExisting(false);
        setFormData({ email: "", password: "", name: "", agencyId: "" });

        // (اختياري) تسيبه داخل أو تخرجه لحد الموافقة
        try { await supabase.auth.signOut(); } catch (_) {}

      } else {
        // --- CREATE NEW AGENCY FLOW (ADMIN) ---
        const newAgencyId = Date.now();

        // 3) Create agency
        const { error: agencyError } = await supabase
          .from("agencies")
          .insert([{ id: newAgencyId, name: `مؤسسة ${formData.name}` }]);

        if (agencyError) throw new Error("فشل إنشاء سجل المؤسسة");

        // 4) Create settings
        const { error: settingsError } = await supabase
          .from("agency_settings")
          .insert([{ agency_id: newAgencyId }]);

        if (settingsError) throw settingsError;

        // 5) Upsert admin profile
        const newUser = {
          id: authUserId,
          name: formData.name,
          username: email,
          role: "admin",
          section: "إدارة",
          approved: true,
          agency_id: newAgencyId,
          daily_target: 0
        };

        const { error: upsertError } = await supabase
          .from("users")
          .upsert([newUser], { onConflict: "id" });

        if (upsertError) throw upsertError;

        onLogin(newUser);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "فشل إنشاء الحساب");
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
          <p className="text-gray-500 text-sm mt-2">
            {isRegistering ? (joinExisting ? "الانضمام لمؤسسة قائمة" : "إنشاء مؤسسة جديدة") : "تسجيل دخول الموظفين"}
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold flex items-center gap-2">
            <Server className="h-4 w-4" /> لا يمكن الاتصال بالخادم
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold text-center animate-bounce-in">
            {error}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <>
              <div className="flex gap-4 mb-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setJoinExisting(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                    !joinExisting ? "bg-white shadow text-blue-800" : "text-gray-500"
                  }`}
                >
                  إنشاء مؤسسة جديدة
                </button>
                <button
                  type="button"
                  onClick={() => setJoinExisting(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                    joinExisting ? "bg-white shadow text-blue-800" : "text-gray-500"
                  }`}
                >
                  انضمام لمؤسسة
                </button>
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
                    onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-gray-50 focus:bg-white dir-ltr text-right"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.trim().toLowerCase() })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-gray-50 focus:bg-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow-lg transform active:scale-95"
          >
            {loading ? "جاري التحميل..." : isRegistering ? (joinExisting ? "إرسال طلب الانضمام" : "إنشاء المؤسسة") : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              setFormData({ name: "", email: "", password: "", agencyId: "" });
              setJoinExisting(false);
            }}
            className="text-sm font-bold text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            {isRegistering ? "لديك حساب بالفعل؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء حساب جديد"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ==========================================
// App Component
// ==========================================
function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('newsroom_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [announcement, setAnnouncement] = useState('');
  const [articleStatuses, setArticleStatuses] = useState(DEFAULT_STATUSES);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [tickerSpeed, setTickerSpeed] = useState(DEFAULT_TICKER_SPEED);
  const [tickerFontSize, setTickerFontSize] = useState(DEFAULT_TICKER_FONT_SIZE);
  const [serverError, setServerError] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isUserIdle, setIsUserIdle] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState('blue');

  const currentLogIdRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());

  useEffect(() => {
    const fetchSettings = async () => {
      if(!user?.agency_id) return;
      try {
        const { data: settings } = await supabase.from('agency_settings').select('*').eq('agency_id', user.agency_id).single();
        if (settings) {
          if (settings.departments) setDepartments(settings.departments);
          if (settings.announcement) setAnnouncement(settings.announcement);
          if (settings.article_statuses) setArticleStatuses(settings.article_statuses);
          if (settings.logo_url) setLogoUrl(settings.logo_url);
          if (settings.ticker_speed) setTickerSpeed(settings.ticker_speed);
          if (settings.ticker_font_size) setTickerFontSize(settings.ticker_font_size);
          if (settings.theme_color) setTheme(settings.theme_color);
        }
      } catch (e) {
        console.error("Settings fetch error", e);
      }
    };
    fetchSettings();
  }, [user]);

  // --- Activity Tracking Logic ---
  const recordActivity = async (currentUser) => {
     if (!currentUser || currentUser.role === 'admin') return; 

     const today = new Date().toISOString().split('T')[0];
     
     try {
         const { data: logs } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('date_string', today);

         let logEntry = logs && logs.length > 0 ? logs[0] : null;

         if (logEntry) {
             currentLogIdRef.current = logEntry.id;
             const lastSession = logEntry.sessions[logEntry.sessions.length - 1];
             const now = new Date();
             const lastEnd = new Date(lastSession.end);
             const diffSeconds = (now.getTime() - lastEnd.getTime()) / 1000;

             if (diffSeconds > ONLINE_THRESHOLD) {
                 const updatedSessions = [...logEntry.sessions, { start: now.toISOString(), end: now.toISOString() }];
                 await supabase.from('activity_logs').update({ sessions: updatedSessions }).eq('id', logEntry.id);
             }
         } else {
             const now = new Date();
             const newLog = {
                 id: String(Date.now()),
                 agency_id: currentUser.agency_id,
                 user_id: currentUser.id,
                 user_name: currentUser.name,
                 date_string: today,
                 sessions: [{ start: now.toISOString(), end: now.toISOString() }]
             };
             await supabase.from('activity_logs').insert([newLog]);
             currentLogIdRef.current = newLog.id;
         }
     } catch (e) {
         console.error("Activity logging failed", e);
     }
  };

  const handleHeartbeat = async () => {
      if (!user || !user.id) return;
      if (Date.now() - lastInteractionRef.current > IDLE_THRESHOLD) {
          if (!isUserIdle) setIsUserIdle(true);
          return;
      }
      if (isUserIdle) setIsUserIdle(false);
      if (!currentLogIdRef.current) await recordActivity(user);
      if (!currentLogIdRef.current) return; 

      const now = new Date().toISOString();

      try {
          await supabase.from('users').update({ last_active: now }).eq('id', user.id);

          const { data: log } = await supabase.from('activity_logs').select('*').eq('id', currentLogIdRef.current).single();
          if (log) {
              const sessions = [...log.sessions];
              if (sessions.length > 0) {
                  sessions[sessions.length - 1].end = now;
                  await supabase.from('activity_logs').update({ sessions }).eq('id', currentLogIdRef.current);
              }
          }
      } catch (e) { console.error("Heartbeat failed", e); }
  };

  useEffect(() => {
      if (!user) return;
      const handleUserActivity = () => {
          const now = Date.now();
          const timeSinceLastInteraction = now - lastInteractionRef.current;
          lastInteractionRef.current = now;
          if (timeSinceLastInteraction > IDLE_THRESHOLD) {
              setIsUserIdle(false);
              handleHeartbeat();
          }
      };
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove', 'click'];
      events.forEach(event => window.addEventListener(event, handleUserActivity));
      return () => { events.forEach(event => window.removeEventListener(event, handleUserActivity)); };
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
        localStorage.setItem('newsroom_user', JSON.stringify(user));
        setProfileImage(user.profile_picture || null);
        recordActivity(user);
        const interval = setInterval(handleHeartbeat, HEARTBEAT_INTERVAL); 
        return () => clearInterval(interval);
    } else {
        localStorage.removeItem('newsroom_user');
        setProfileImage(null);
        currentLogIdRef.current = null;
    }
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); };

  const handleLogout = () => {
    localStorage.removeItem('newsroom_user');
    setUser(null);
    setProfileImage(null);
  };

  const handleProfileImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) { 
          alert("حجم الصورة كبير جداً. يرجى استخدام صورة أقل من 2 ميجابايت."); 
          return; 
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
  };

  const handleSaveProfile = async () => {
      if(!user) return;
      try {
          const updatedUser = { ...user, profile_picture: profileImage };
          await supabase.from('users').update({ profile_picture: profileImage }).eq('id', user.id);
          setUser(updatedUser);
          setShowProfileModal(false);
          alert("تم تحديث الصورة الشخصية بنجاح");
      } catch (e) {
          console.error(e);
          alert("حدث خطأ أثناء حفظ الصورة");
      }
  };

  return (
    <div className="min-h-screen font-sans pb-32 md:pb-10" dir="rtl">
      
      {/* FULL WIDTH TOP TICKER */}
      {announcement && user && (
        <div className="w-full bg-orange-100 border-b border-orange-200 overflow-hidden relative h-12 flex items-center no-print">
           <style>{`
             @keyframes ticker-ltr-force {
               0% { transform: translateX(-100%); } 
               100% { transform: translateX(100vw); } 
             }
           `}</style>
           
           <div className="absolute right-0 z-20 h-full bg-orange-100 px-4 flex items-center border-l border-orange-200 shadow-sm">
              <Megaphone className="text-orange-600 animate-pulse h-5 w-5" />
           </div>
           
           <div className="ticker-container w-full" style={{ direction: 'ltr' }}>
               <div 
                  className="animate-ticker text-orange-900 font-bold whitespace-nowrap" 
                  style={{ 
                      animationName: 'ticker-ltr-force', 
                      animationDuration: `${tickerSpeed}s`,
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                      fontSize: `${tickerFontSize}px`,
                      display: 'inline-block'
                  }}
               >
                  {announcement}
               </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-blue-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-1 rounded-lg">
                <img src={logoUrl || DEFAULT_LOGO} alt="Logo" className="h-16 md:h-20 object-contain" onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_LOGO}} />
             </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
               {/* Clock now visible on mobile */}
               <LiveClock theme={theme} />

               {user.role !== 'admin' && (
                   <div className={`flex items-center gap-1 px-2 py-1 rounded-full border transition-all duration-300 ${isUserIdle ? 'bg-gray-100 border-blue-200' : 'bg-green-50 border-green-100'}`} title="حالة الاتصال">
                       <span className="relative flex h-2 w-2">
                          {!isUserIdle && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${isUserIdle ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                        </span>
                        <span className={`text-[10px] font-bold hidden sm:block ${isUserIdle ? 'text-gray-500' : 'text-green-700'}`}>
                            {isUserIdle ? 'خامل' : 'متصل'}
                        </span>
                   </div>
               )}

               <button onClick={() => { setProfileImage(user.profile_picture); setShowProfileModal(true); }} className="relative group focus:outline-none" title="تعديل الملف الشخصي">
                  {/* Larger Profile Picture */}
                  <div className="w-14 h-14 rounded-full bg-blue-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                      {user.profile_picture ? (
                          <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                          <User className="text-gray-400" size={24} />
                      )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                      <Settings size={12} className="text-gray-500" />
                  </div>
               </button>

              <div className="text-left hidden sm:block">
                <div className="text-sm font-bold text-blue-900">{user.name}</div>
              
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="تسجيل خروج"
              >
                <LogOut size={24} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!user ? (
          <AuthScreen onLogin={handleLogin} serverError={serverError} />
        ) : (
          <>
            {user.role === 'admin' || user.role === 'managing_editor' ? (
              <AdminDashboard 
                 user={user} 
                 departments={departments} 
                 setDepartments={setDepartments}
                 announcement={announcement}
                 setAnnouncement={setAnnouncement}
                 articleStatuses={articleStatuses}
                 setArticleStatuses={setArticleStatuses}
                 logoUrl={logoUrl}
                 setLogoUrl={setLogoUrl}
                 tickerSpeed={tickerSpeed}
                 setTickerSpeed={setTickerSpeed}
                 tickerFontSize={tickerFontSize}
                 setTickerFontSize={setTickerFontSize}
                 theme={theme}
                 setTheme={setTheme}
              />
            ) : (
              <JournalistDashboard user={user} departments={departments} articleStatuses={articleStatuses} theme={theme} />
            )}
            <AssignmentCenter currentUser={user} departments={departments} theme={theme} />
          </>
        )}
      </main>
      
      <footer className="text-center text-gray-400 text-xs py-6 mt-auto border-t no-print">
        &copy; {new Date().getFullYear()} Eng.waledsamra .Tel: 01015492722 .Platform. All rights reserved.
      </footer>

      {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-in fade-in zoom-in duration-200">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                  <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  <h3 className="text-lg font-bold mb-6 text-center text-gray-800 border-b pb-4">إعدادات الملف الشخصي</h3>
                  
                  <div className="flex flex-col items-center mb-6">
                      <label className="cursor-pointer relative group">
                          <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                              {profileImage ? (
                                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <User className="text-gray-300" size={40} />
                              )}
                          </div>
                          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition">
                              <Camera size={14} />
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">اضغط لتغيير الصورة (Max 2MB)</p>
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">الاسم</p>
                          <p className="font-bold text-gray-800">{user.name}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">اسم المستخدم</p>
                          <p className="font-bold text-gray-800 dir-ltr text-right">{user.username}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-4">
                          <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">القسم</p>
                              <p className="font-bold text-gray-800">{user.section}</p>
                          </div>
                          <div className="flex-1 border-r border-blue-200 pr-4">
                              <p className="text-xs text-gray-500 mb-1">الوظيفة</p>
                              <p className="font-bold text-gray-800">{user.role === 'journalist' ? 'صحفي' : user.role === 'editor' ? 'رئيس قسم' : 'مدير'}</p>
                          </div>
                      </div>
                  </div>

                  <button onClick={handleSaveProfile} className={`w-full text-white py-2.5 rounded-lg font-bold shadow-md ${THEMES[theme].primary} ${THEMES[theme].hover}`}>
                      حفظ التغييرات
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;



