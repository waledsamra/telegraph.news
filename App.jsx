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
// 5. Admin Dashboard 
// ==========================================
function AdminDashboard({ user, departments, setDepartments, announcement, setAnnouncement, articleStatuses, setArticleStatuses, logoUrl, setLogoUrl, tickerSpeed, setTickerSpeed, tickerFontSize, setTickerFontSize, theme, setTheme }) {
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilterMode, setDateFilterMode] = useState('today');

  const [statsFilterType, setStatsFilterType] = useState('all'); 
  const [statsFilterValue, setStatsFilterValue] = useState(''); 

  const [editingUser, setEditingUser] = useState(null);
  const [resetPassUser, setResetPassUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [targetDept, setTargetDept] = useState(departments ? departments[0] : '');
  const [targetValue, setTargetValue] = useState(10); 
  const [newDeptName, setNewDeptName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingTarget, setUpdatingTarget] = useState(false);

  // Content Review Vars
  const [filterSection, setFilterSection] = useState('الكل');
  const [reviewArticle, setReviewArticle] = useState(null); 
  const [reviewData, setReviewData] = useState({ rating: 0, note: '' });
  const [filterJournalist, setFilterJournalist] = useState('الكل');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [printTarget, setPrintTarget] = useState(''); 
  
  const [drillDownUser, setDrillDownUser] = useState(null); 
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentToEdit, setContentToEdit] = useState(null);

  // Idea Bank
  const [ideaText, setIdeaText] = useState('');
  const [ideaTarget, setIdeaTarget] = useState(''); 
  const [ideaType, setIdeaType] = useState('section'); 
  const [sentIdeas, setSentIdeas] = useState([]);
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [ideaReply, setIdeaReply] = useState('');

  // Activity Log
  const [activityLogs, setActivityLogs] = useState([]);
  
  // CSV Import State
  const [isImporting, setIsImporting] = useState(false);

  // Permission Check
  const isAdmin = user.role === 'admin';
  const themeClasses = THEMES[theme];

  // Ensure arrays are safe
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeArticles = Array.isArray(articles) ? articles : [];

  // --- Filtering Helper ---
  const setQuickDate = (type) => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      let start = today;
      let end = today;

      if (type === 'today') {
      } else if (type === 'month') {
          start = today.substring(0, 7) + '-01';
      } else if (type === 'year') {
          start = today.substring(0, 4) + '-01-01';
      } else if (type === 'all') {
          start = '2023-01-01'; 
      }
      setStartDate(start);
      setEndDate(end);
      setDateFilterMode(type);
  };

  const getFilteredArticles = () => {
    let base = safeArticles;
    base = base.filter(a => {
        if (!a.date_string) return false;
        return a.date_string >= startDate && a.date_string <= endDate;
    });

    if (statsFilterType === 'journalist' && statsFilterValue) {
        base = base.filter(a => a.journalist_name === statsFilterValue);
    } else if (statsFilterType === 'section' && statsFilterValue) {
        base = base.filter(a => a.section === statsFilterValue);
    }
    return base;
  };
  
  const filteredArticles = getFilteredArticles();
  const pendingUsers = safeUsers.filter(u => u.approved === false);
  const activeUsers = safeUsers.filter(u => u.approved !== false && u.role !== 'admin').filter(u => u.name && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase())));
  
  const isOnline = (lastActive) => {
    if (!lastActive) return false;
    const lastDate = new Date(lastActive);
    if(isNaN(lastDate.getTime())) return false;
    const now = new Date();
    const diffSeconds = (now.getTime() - lastDate.getTime()) / 1000;
    return diffSeconds <= ONLINE_THRESHOLD; 
  };

  const reviewArticles = safeArticles.filter(a => {
      if (a.date_string < startDate || a.date_string > endDate) return false;
      if (filterJournalist !== 'الكل') {
          if (a.journalist_name !== filterJournalist && a.journalist_username !== filterJournalist) return false;
      }
      if (filterSection !== 'الكل' && a.section !== filterSection) return false;
      return true;
  });

  const getFilteredActivity = () => {
    let logs = activityLogs.filter(log => {
        if (!log.date_string) return false;
        return log.date_string >= startDate && log.date_string <= endDate;
    });

    if (filterJournalist !== 'الكل') {
        logs = logs.filter(log => log.user_name === filterJournalist);
    }
    return logs.map(log => {
       const sessions = log.sessions || [];
       const loginCount = sessions.length;
       const totalDurationMinutes = sessions.reduce((acc, sess) => {
           if (!sess || !sess.start || !sess.end) return acc;
           const start = new Date(sess.start).getTime();
           const end = new Date(sess.end).getTime();
           if(isNaN(start) || isNaN(end)) return acc;
           return acc + (end - start);
       }, 0) / 1000 / 60;

       return { ...log, loginCount, totalDurationMinutes };
    });
  };

  const filteredActivityLogs = getFilteredActivity();

  const getWeeklyData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
        const count = filteredArticles.filter(a => a.date_string === date).length;
        const dayName = new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' });
        return { label: dayName, value: count }; 
    });
  };

  const sectionData = safeDepartments.map(dept => ({
      label: dept,
      value: filteredArticles.filter(a => a.section === dept).length
  }));

  const getTopProducers = () => {
    const counts = {};
    filteredArticles.forEach(a => {
      const name = a.journalist_name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, value: count }));
  };

  const getTopRated = () => {
    const ratings = {};
    filteredArticles.forEach(a => {
      if (a.rating && a.rating > 0) {
        const name = a.journalist_name || 'Unknown';
        if (!ratings[name]) ratings[name] = { total: 0, count: 0 };
        ratings[name].total += a.rating;
        ratings[name].count += 1;
      }
    });
    return Object.entries(ratings)
      .map(([name, data]) => ({ name, value: data.total / data.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const getPerformanceData = () => {
      return activeUsers.map(user => {
          const userArticles = filteredArticles.filter(a => 
              a.journalist_username === user.username || a.journalist_name === user.name
          );
          const achieved = userArticles.length;
          // Calculate Target based on date range (approximate)
          const daysDiff = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);
          const totalTarget = (user.daily_target || DEFAULT_DAILY_TARGET) * daysDiff;
          
          const percent = Math.round((achieved / totalTarget) * 100);
          const autoRating = Math.min(5, Math.round((percent / 100) * 5));

          return {
              name: user.name,
              section: user.section,
              target: totalTarget,
              achieved: achieved,
              percent: percent,
              autoRating: autoRating
          };
      }).sort((a,b) => b.percent - a.percent);
  };

  const performanceData = getPerformanceData();

  const getQuickStats = () => {
    const totalArticles = filteredArticles.length;
    const onlineUsers = safeUsers.filter(u => isOnline(u.last_active));
    const onlineUsersCount = onlineUsers.length;
    
    const totalTarget = safeUsers.filter(u => u.role !== 'admin' && u.approved).reduce((acc, user) => acc + (user.daily_target || DEFAULT_DAILY_TARGET), 0);
    const achievementRate = totalTarget > 0 ? Math.round((totalArticles / totalTarget) * 100) : 0;

    const topSection = sectionData.length > 0 
        ? sectionData.reduce((prev, current) => (prev.value > current.value) ? prev : current, {label: '-', value: 0})
        : {label: '-', value: 0};
        
    return { totalArticles, onlineUsersCount, topSection, achievementRate, totalTarget, onlineUsers };
  };
  
  const weeklyData = getWeeklyData();
  const topProducers = getTopProducers();
  const topRated = getTopRated();
  const quickStats = getQuickStats();

  const fetchData = async () => {
    try {
        const { data: uData } = await supabase.from('users').select('*').eq('agency_id', user.agency_id);
        if(uData) setUsers(uData);

        const { data: aData } = await supabase.from('daily_production').select('*').eq('agency_id', user.agency_id);
        if(aData) setArticles(aData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        const { data: mData } = await supabase.from('messages').select('*').eq('agency_id', user.agency_id).eq('priority', 'idea');
        if(mData) setSentIdeas(mData);

        const { data: actData } = await supabase.from('activity_logs').select('*').eq('agency_id', user.agency_id);
        if(actData) setActivityLogs(actData);

    } catch(e) { console.error("Data fetch failed", e); }
  };

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (targetUser) => {
    const confirmMsg = `هل تريد الموافقة على انضمام الموظف التالي؟\n\n- الاسم: ${targetUser.name}\n- اسم المستخدم: ${targetUser.username}\n- الوظيفة: ${targetUser.role}\n- القسم: ${targetUser.section}`;
    if (!window.confirm(confirmMsg)) return;

    await supabase.from('users').update({ approved: true }).eq('id', targetUser.id);
    fetchData();
  };

  const handleReject = async (id) => {
    if (window.confirm('حذف هذا الطلب نهائياً؟')) {
      await supabase.from('users').delete().eq('id', id);
      fetchData();
    }
  };

  const handleUpdateUser = async () => {
      await supabase.from('users').update({ 
          name: editingUser.name, 
          role: editingUser.role, 
          section: editingUser.section,
          daily_target: Number(editingUser.daily_target) 
        }).eq('id', editingUser.id);
      setEditingUser(null); fetchData();
  };
  
  const handleUpdateDeptTarget = async () => {
     if (!window.confirm(`هل أنت متأكد من تغيير الهدف اليومي لقسم ${targetDept} إلى ${targetValue}؟`)) return;
     const targetUsers = safeUsers.filter(u => u.section === targetDept && u.role !== 'admin');
     if(targetUsers.length === 0) return alert('لا يوجد موظفين');
     
     for (const u of targetUsers) {
         await supabase.from('users').update({ daily_target: Number(targetValue) }).eq('id', u.id);
     }
     alert('تم التحديث'); fetchData();
  };

  const handleResetPassword = async () => {
      if (!resetPassUser || !newPassword) return;
      await supabase.from('users').update({ password: newPassword }).eq('id', resetPassUser.id);
      setResetPassUser(null); setNewPassword(''); alert('تم'); fetchData();
  };

  // Settings Handlers
  const saveSettings = async (newDepts, newAnnouncement, newStatuses) => {
    setSavingSettings(true);
    try {
        const { error } = await supabase.from('agency_settings').upsert({
             agency_id: user.agency_id,
             departments: newDepts,
             announcement: newAnnouncement,
             article_statuses: newStatuses,
             logo_url: logoUrl,
             ticker_speed: tickerSpeed,
             ticker_font_size: tickerFontSize,
             theme_color: theme // Save theme
        });
        if (error) throw error;
        
        setDepartments(newDepts);
        setAnnouncement(newAnnouncement);
        if(newStatuses) setArticleStatuses(newStatuses);
        alert('تم حفظ الإعدادات بنجاح');
    } catch (e) { console.error(e); alert('فشل الحفظ'); } finally { setSavingSettings(false); }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("حجم الصورة كبير جداً. يرجى استخدام صورة أقل من 2 ميجابايت."); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setLogoUrl(reader.result); };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddDept = () => { if(newDeptName && !safeDepartments.includes(newDeptName)) { saveSettings([...safeDepartments, newDeptName], announcement, articleStatuses); setNewDeptName(''); }};
  const handleDeleteDept = (dept) => { if(window.confirm('حذف؟')) saveSettings(safeDepartments.filter(d=>d!==dept), announcement, articleStatuses); };
  const handleAddStatus = () => { if(newStatusName && !articleStatuses.includes(newStatusName)) { saveSettings(safeDepartments, announcement, [...articleStatuses, newStatusName]); setNewStatusName(''); }};
  const handleDeleteStatus = (status) => { if(window.confirm('حذف؟')) saveSettings(safeDepartments, announcement, articleStatuses.filter(s=>s!==status)); };

  // --- RESTORED CSV HANDLERS (Defined inside AdminDashboard to fix ReferenceError) ---
  const handleImportContentCSV = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target.result;
          const rows = text.split('\n').filter(r => r.trim() !== '');
          const dataToInsert = [];
          
          for (let i = 1; i < rows.length; i++) {
              const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
              if(cols.length < 2) continue; 

              const journalistName = cols[0] || 'Unknown';
              const headline = cols[1] || 'No Headline';
              const platform = cols[2] || 'موقع إلكتروني';
              const section = cols[3] || 'عام';
              const status = cols[4] || 'نشرت';
              const rating = parseInt(cols[5]) || 0;
              const dateString = cols[6] || new Date().toISOString().split('T')[0];
              const note = cols[8] || '';
              const url = cols[9] || '';

              const journalistUser = safeUsers.find(u => u.name === journalistName);

              dataToInsert.push({
                  id: String(Date.now() + i),
                  agency_id: user.agency_id,
                  journalist_name: journalistName,
                  journalist_username: journalistUser ? journalistUser.username : 'imported_user',
                  headline: headline,
                  url: url,
                  section: section,
                  status: status,
                  platform: platform,
                  date_string: dateString,
                  timestamp: new Date().toISOString(),
                  rating: rating,
                  note: note
              });
          }

          if (dataToInsert.length > 0) {
              const { error } = await supabase.from('daily_production').insert(dataToInsert);
              if (error) {
                  alert('حدث خطأ أثناء الاستيراد: ' + error.message);
              } else {
                  alert(`تم استيراد ${dataToInsert.length} خبر (شامل التقييمات) بنجاح!`);
                  fetchData();
              }
          } else {
              alert('لم يتم العثور على بيانات صالحة في الملف.');
          }
          setIsImporting(false);
          event.target.value = null; 
      };
      reader.readAsText(file);
  };

  const handleImportUsersCSV = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target.result;
          const rows = text.split('\n').filter(r => r.trim() !== '');
          const usersToInsert = [];
          
          for (let i = 1; i < rows.length; i++) {
              const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
              if(cols.length < 3) continue;

              const name = cols[0];
              const username = cols[1]?.toLowerCase();
              const password = cols[2];
              const role = cols[3] || 'journalist';
              const section = cols[4] || 'عام';
              const dailyTarget = parseInt(cols[5]) || 10;

              if(name && username && password) {
                  usersToInsert.push({
                      id: String(Date.now() + i),
                      agency_id: user.agency_id,
                      name: name,
                      username: username,
                      password: password,
                      role: role,
                      section: section,
                      daily_target: dailyTarget,
                      approved: true 
                  });
              }
          }

          if (usersToInsert.length > 0) {
              try {
                  const { error } = await supabase.from('users').insert(usersToInsert);
                  if (error) throw error;
                  alert(`تم استيراد ${usersToInsert.length} موظف بنجاح!`);
                  fetchData();
              } catch(err) {
                  alert('حدث خطأ. ربما يوجد "اسم مستخدم" مكرر بالفعل. تفاصيل: ' + err.message);
              }
          } else {
              alert('لا توجد بيانات صالحة. تأكد من ترتيب الأعمدة: الاسم، اليوزر، الباسورد، الوظيفة، القسم، التارجت');
          }
          setIsImporting(false);
          event.target.value = null; 
      };
      reader.readAsText(file);
  };

  // Review & Content Handlers
  const openReviewModal = (article) => { setReviewArticle(article); setReviewData({ rating: article.rating || 0, note: article.note || '' }); };
  const handleSaveReview = async () => { await supabase.from('daily_production').update(reviewData).eq('id', reviewArticle.id); setReviewArticle(null); fetchData(); };
  const handleAdminDeleteContent = async (id) => { if(window.confirm('حذف؟')) { await supabase.from('daily_production').delete().eq('id', id); fetchData(); }};
  const openAdminEditContent = (article) => { setContentToEdit(article); setIsEditingContent(true); };
  const handleSaveAdminEditContent = async () => { await supabase.from('daily_production').update({ headline: contentToEdit.headline, url: contentToEdit.url, section: contentToEdit.section, platform: contentToEdit.platform, date_string: contentToEdit.date_string }).eq('id', contentToEdit.id); setIsEditingContent(false); setContentToEdit(null); fetchData(); };
  
  // Ideas Handlers
  const handleSendIdea = async () => { 
      await supabase.from('messages').insert([{ 
          id: String(Date.now()), 
          agency_id: user.agency_id,
          from_user_id: user.id, 
          from_name: user.name, 
          text: ideaText, 
          priority: 'idea', 
          timestamp: new Date().toISOString(), 
          to_user_id: ideaType === 'user'?ideaTarget:null, 
          to_section: ideaType==='section'?ideaTarget:null, 
          replies:[] 
      }]); 
      setIdeaText(''); alert('تم'); fetchData(); 
  };
  const handleReplyToIdeaAdmin = async (idea) => { const updated = [...(idea.replies||[]), {text: ideaReply, sender: user.name, time: new Date().toISOString()}]; await supabase.from('messages').update({replies: updated}).eq('id', idea.id); setIdeaReply(''); fetchData(); };

  const getDrillDownArticles = () => {
      if (!drillDownUser) return [];
      const userArts = filteredArticles.filter(a => a.journalist_name === drillDownUser.user);
      if (drillDownUser.type === 'rated') return userArts.filter(a => a.rating > 0);
      return userArts;
  };

  const handleExportUsersCSV = () => {
      const headers = ['الاسم', 'اسم المستخدم', 'القسم', 'الوظيفة', 'الحالة', 'آخر نشاط'];
      const rows = activeUsers.map(u => [
          escapeCsv(u.name),
          escapeCsv(u.username),
          escapeCsv(u.section),
          escapeCsv(u.role),
          isOnline(u.last_active) ? 'متصل' : 'غير متصل',
          escapeCsv(u.last_active ? new Date(u.last_active).toLocaleString() : '-')
      ]);
      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `users_list.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${isPrintMode ? 'bg-white' : ''}`}>
      {!isPrintMode && (
      <>
        <div className="hidden md:flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-blue-200 overflow-x-auto no-print">
            <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 rounded-lg font-bold flex justify-center gap-2 transition whitespace-nowrap px-4 ${activeTab === 'stats' ? `${themeClasses.primary} text-white` : 'hover:bg-gray-100 text-gray-600'}`}><PieChart className="h-5 w-5" /> الإحصائيات</button>
            <button onClick={() => setActiveTab('review')} className={`flex-1 py-2 rounded-lg font-bold flex justify-center gap-2 transition whitespace-nowrap px-4 ${activeTab === 'review' ? `${themeClasses.primary} text-white` : 'hover:bg-gray-100 text-gray-600'}`}><FileEdit className="h-5 w-5" /> إدارة المحتوى</button>
            <button onClick={() => setActiveTab('ideas')} className={`flex-1 py-2 rounded-lg font-bold flex justify-center gap-2 transition whitespace-nowrap px-4 ${activeTab === 'ideas' ? `${themeClasses.primary} text-white` : 'hover:bg-gray-100 text-gray-600'}`}><Lightbulb className="h-5 w-5" /> بنك الأفكار</button>
            <button onClick={() => setActiveTab('activity')} className={`flex-1 py-2 rounded-lg font-bold flex justify-center gap-2 transition whitespace-nowrap px-4 ${activeTab === 'activity' ? `${themeClasses.primary} text-white` : 'hover:bg-gray-100 text-gray-600'}`}><History className="h-5 w-5" /> سجل النشاط</button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 py-2 rounded-lg font-bold flex justify-center gap-2 transition whitespace-nowrap px-4 ${activeTab === 'users' ? `${themeClasses.primary} text-white` : 'hover:bg-gray-100 text-gray-600'}`}><Users className="h-5 w-5" /> الموظفين</button>
            {isAdmin && <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 rounded-lg font-bold flex justify-center gap-2 transition whitespace-nowrap px-4 ${activeTab === 'settings' ? `${themeClasses.primary} text-white` : 'hover:bg-gray-100 text-gray-600'}`}><Settings className="h-5 w-5" /> الإعدادات</button>}
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-200 z-50 flex justify-around p-2 pb-safe shadow-xl">
            <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'stats' ? `${themeClasses.text} ${themeClasses.light}` : 'text-gray-400'}`}>
                <PieChart size={20} />
                <span className="text-[10px] font-bold">إحصائيات</span>
            </button>
            <button onClick={() => setActiveTab('review')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'review' ? `${themeClasses.text} ${themeClasses.light}` : 'text-gray-400'}`}>
                <FileEdit size={20} />
                <span className="text-[10px] font-bold">محتوى</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'users' ? `${themeClasses.text} ${themeClasses.light}` : 'text-gray-400'}`}>
                <Users size={20} />
                <span className="text-[10px] font-bold">موظفين</span>
            </button>
            <button onClick={() => setActiveTab('activity')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'activity' ? `${themeClasses.text} ${themeClasses.light}` : 'text-gray-400'}`}>
                <History size={20} />
                <span className="text-[10px] font-bold">نشاط</span>
            </button>
            {(isAdmin || activeTab === 'settings' || activeTab === 'ideas') && (
                <button onClick={() => setActiveTab(activeTab === 'settings' ? 'ideas' : 'settings')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${['settings', 'ideas'].includes(activeTab) ? `${themeClasses.text} ${themeClasses.light}` : 'text-gray-400'}`}>
                    <Menu size={20} />
                    <span className="text-[10px] font-bold">المزيد</span>
                </button>
            )}
        </div>
      </>
      )}
      
      {isAdmin && !isPrintMode && activeTab !== 'settings' && activeTab !== 'users' && activeTab !== 'ideas' && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 no-print flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-1"><Filter size={16}/> تصفية بـ:</span>
                  <button onClick={() => setQuickDate('today')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${dateFilterMode === 'today' ? `${themeClasses.light} ${themeClasses.text} ${themeClasses.border} border` : 'bg-gray-50 text-gray-600 border border-blue-200 hover:bg-gray-100'}`}>اليوم</button>
                  <button onClick={() => setQuickDate('month')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${dateFilterMode === 'month' ? `${themeClasses.light} ${themeClasses.text} ${themeClasses.border} border` : 'bg-gray-50 text-gray-600 border border-blue-200 hover:bg-gray-100'}`}>الشهر</button>
                  <button onClick={() => setQuickDate('year')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${dateFilterMode === 'year' ? `${themeClasses.light} ${themeClasses.text} ${themeClasses.border} border` : 'bg-gray-50 text-gray-600 border border-blue-200 hover:bg-gray-100'}`}>السنة</button>
                  <button onClick={() => setQuickDate('all')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${dateFilterMode === 'all' ? `${themeClasses.light} ${themeClasses.text} ${themeClasses.border} border` : 'bg-gray-50 text-gray-600 border border-blue-200 hover:bg-gray-100'}`}>الكل</button>
              </div>
              <div className="flex items-center gap-2 border-r pr-4 mr-2">
                  <span className="text-xs font-bold text-gray-500">مخصص:</span>
                  <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setDateFilterMode('custom')}} className="border p-1.5 rounded text-sm outline-none focus:border-blue-500" />
                  <span className="text-gray-400">-</span>
                  <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setDateFilterMode('custom')}} className="border p-1.5 rounded text-sm outline-none focus:border-blue-500" />
              </div>
          </div>
      )}

      {activeTab === 'stats' && !isPrintMode && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="إجمالي المقالات" value={quickStats.totalArticles} icon={FileText} colorClass="bg-blue-500 text-blue-600" />
                <StatCard title="نسبة تحقيق الهدف" value={`${quickStats.achievementRate}%`} icon={Target} colorClass="bg-green-500 text-green-600" />
                <StatCard title="المتواجدون الآن" value={quickStats.onlineUsersCount} icon={Users} colorClass="bg-orange-500 text-orange-600 cursor-pointer" onClick={() => setShowOnlineModal(true)} />
                <StatCard title="القسم الأنشط" value={quickStats.topSection.label} subtitle={`${quickStats.topSection.value} مقال`} icon={Trophy} colorClass="bg-purple-500 text-purple-600" />
            </div>
            
            {/* --- NEW: PERFORMANCE TABLE --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="text-green-600"/> تقرير أداء الموظفين (تقييم النظام)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="p-3">الموظف</th>
                                <th className="p-3">القسم</th>
                                <th className="p-3">الهدف (في الفترة)</th>
                                <th className="p-3">تم إنجازه</th>
                                <th className="p-3">نسبة الإنجاز</th>
                                <th className="p-3">تقييم النظام</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {performanceData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-3 font-bold">{row.name}</td>
                                    <td className="p-3">{row.section}</td>
                                    <td className="p-3 font-mono">{row.target}</td>
                                    <td className={`p-3 font-bold ${row.achieved >= row.target ? 'text-green-600' : 'text-orange-600'}`}>{row.achieved}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold w-8">{row.percent}%</span>
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${row.percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${Math.min(row.percent, 100)}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <RatingDisplay rating={row.autoRating} color="text-yellow-400" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart title="الأداء الأسبوعي" data={weeklyData} colorFrom="#3b82f6" colorTo="#1d4ed8" />
                <SimpleBarChart title="الأقسام" data={sectionData} colorFrom="#f97316" colorTo="#c2410c" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Trophy className="text-yellow-500"/> الأكثر إنتاجاً</h3>
                    <div className="space-y-3">
                        {topProducers.map((p, i) => (
                            <div key={i} onClick={() => setDrillDownUser({ user: p.name, type: 'all' })} className="flex justify-between items-center p-2 rounded bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-700">#{i+1} {p.name}</span>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{p.value} مقال</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Star className="text-orange-500"/> الأعلى تقييماً (يدوي)</h3>
                    <div className="space-y-3">
                        {topRated.map((p, i) => (
                            <div key={i} onClick={() => setDrillDownUser({ user: p.name, type: 'rated' })} className="flex justify-between items-center p-2 rounded bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-700">#{i+1} {p.name}</span>
                                </div>
                                <RatingDisplay rating={Math.round(p.value)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {(activeTab === 'review' || (isPrintMode && printTarget === 'review')) && (
          <div className={`bg-white p-6 rounded-xl shadow-sm border border-blue-200 ${isPrintMode ? 'border-none shadow-none p-0' : ''}`}>
              {!isPrintMode && (
              <div className="flex flex-wrap gap-4 mb-4 items-end no-print">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">الصحفي</label>
                    <select value={filterJournalist} onChange={e=>setFilterJournalist(e.target.value)} className="border p-2 rounded min-w-[150px]">
                        <option value="الكل">الكل</option>
                        {activeUsers.map(u=><option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500 block mb-1">القسم</label>
                     <select value={filterSection} onChange={e=>setFilterSection(e.target.value)} className="border p-2 rounded min-w-[150px]">
                        <option value="الكل">الكل</option>
                        {safeDepartments.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                   <div className="flex gap-2 mt-auto">
                       <button onClick={() => handleExportCSV()} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm flex gap-2 h-[42px] items-center"><FileSpreadsheet size={16}/> Excel</button>
                       <button onClick={() => handlePrintReport('review')} className="bg-slate-800 text-white px-4 py-2 rounded font-bold text-sm flex gap-2 h-[42px] items-center"><Printer size={16}/> PDF</button>
                   </div>
              </div>
              )}
              
              <div className={isPrintMode ? 'block' : 'block'}>
                  {isPrintMode && <h2 className="text-2xl font-bold mb-4 text-center">تقرير المحتوى ({startDate} إلى {endDate})</h2>}
                  
                  {/* MOBILE VIEW (CARDS) FOR ADMIN REVIEW */}
                  <div className="block md:hidden space-y-4 mb-20">
                      {reviewArticles.length === 0 ? <div className="text-center text-gray-400 py-10">لا توجد بيانات</div> : 
                        reviewArticles.map(article => (
                          <div key={article.id} className="border border-blue-200 rounded-xl p-4 bg-gray-50 shadow-sm relative">
                              <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                  <div>
                                      <p className="font-bold text-sm text-gray-800">{article.journalist_name}</p>
                                      <p className="text-[10px] text-gray-400 dir-ltr text-right">{users.find(u => u.name === article.journalist_name)?.username || 'user'}</p>
                                  </div>
                                  <div className="flex gap-1">
                                      <button onClick={()=>openReviewModal(article)} title="تقييم المدير" className="text-blue-600 bg-white p-1.5 rounded border border-blue-200 shadow-sm"><Star size={14}/></button>
                                      <button onClick={()=>openAdminEditContent(article)} title="تعديل المحتوى" className="text-green-600 bg-white p-1.5 rounded border border-blue-200 shadow-sm"><Edit size={14}/></button>
                                      <button onClick={()=>handleAdminDeleteContent(article.id)} title="حذف نهائي" className="text-red-500 bg-white p-1.5 rounded border border-blue-200 shadow-sm"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                              <h4 className="font-bold text-gray-900 mb-2">{article.headline}</h4>
                              {article.url && (
                                  <div className="flex items-center gap-2 mb-2 bg-white p-2 rounded border border-gray-100">
                                      <LinkIcon size={12} className="text-gray-400 shrink-0" />
                                      <a href={article.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate dir-ltr flex-1">{article.url}</a>
                                  </div>
                              )}
                              <div className="flex justify-between items-end mt-2 pt-2 border-t border-blue-200 text-xs text-gray-500">
                                  <div className="flex flex-col">
                                      <span>نشر: {formatDate(article.date_string)}</span>
                                      <span className="text-blue-800 font-bold">إضافة: {formatTime(article.timestamp)}</span>
                                  </div>
                                  {article.rating > 0 && <RatingDisplay rating={article.rating} />}
                              </div>
                              {article.note && <div className="mt-2 text-orange-600 text-xs bg-orange-50 p-2 rounded border border-orange-100 flex gap-1"><MessageSquare size={12}/> {article.note}</div>}
                          </div>
                        ))
                      }
                  </div>

                  {/* DESKTOP VIEW (TABLE) */}
                  <div className="hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3">الصحفي</th>
                                <th className="p-3 w-1/4">المحتوى</th>
                                <th className="p-3 w-1/4">التفاصيل / ملاحظات</th>
                                <th className="p-3">الحالة</th>
                                <th className="p-3">تاريخ النشر (المحدد)</th>
                                <th className="p-3">توقيت السيستم (الفعلي)</th>
                                <th className="p-3 no-print">تحكم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewArticles.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-400">لا توجد بيانات في هذه الفترة</td></tr> :
                            reviewArticles.map(article => {
                                const isDateMismatch = article.date_string !== (article.timestamp ? article.timestamp.split('T')[0] : '');
                                return (
                                <tr key={article.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="font-bold">{article.journalist_name}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold text-gray-800">{article.headline}</div>
                                        {article.url && (
                                            <a href={article.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs dir-ltr block mt-1" title={article.url}>
                                                {article.url.length > 30 ? article.url.substring(0, 30) + '...' : article.url}
                                            </a>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {article.note ? (
                                            <div className="bg-orange-50 p-2 rounded border border-orange-100 text-xs text-gray-600 whitespace-pre-wrap max-h-20 overflow-y-auto">
                                                {article.note}
                                            </div>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="p-3"><StatusBadge status={article.status} /></td>
                                    <td className="p-3 font-bold">{formatDate(article.date_string)}</td>
                                    <td className="p-3">
                                        <div className={`font-mono text-xs dir-ltr text-right ${isDateMismatch ? 'text-orange-700 font-bold bg-orange-100 p-1 rounded w-fit ml-auto' : 'text-blue-800'}`}>
                                            {formatDate(article.timestamp)} <br/>
                                            {formatTime(article.timestamp)}
                                        </div>
                                    </td>
                                    <td className="p-3 no-print">
                                        <div className="flex gap-2">
                                            <button onClick={()=>openReviewModal(article)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded border border-transparent hover:border-blue-200 transition" title="تقييم المدير (نجوم)"><Star size={16}/></button>
                                            <button onClick={()=>openAdminEditContent(article)} className="text-green-600 hover:bg-green-50 p-1.5 rounded border border-transparent hover:border-green-200 transition" title="تعديل المحتوى"><Edit size={16}/></button>
                                            <button onClick={()=>handleAdminDeleteContent(article.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded border border-transparent hover:border-red-200 transition" title="حذف نهائي"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {/* ... Users Tab (unchanged) ... */}
      {activeTab === 'users' && !isPrintMode && (
        <div className="space-y-6">
            {pendingUsers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <h3 className="font-bold text-yellow-800 mb-3">طلبات انضمام جديدة</h3>
                    {pendingUsers.map(u => (
                        <div key={u.id} className="flex justify-between items-center bg-white p-3 rounded mb-2 shadow-sm">
                            <div><span className="font-bold">{u.name}</span> <span className="text-sm text-gray-500">({u.role} - {u.section})</span></div>
                            <div className="flex gap-2">
                                <button onClick={()=>handleApprove(u)} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">قبول</button>
                                <button onClick={()=>handleReject(u.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">رفض</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <div className="flex justify-between mb-4">
                    <input type="text" placeholder="بحث عن موظف..." className="border p-2 rounded w-64" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                    <button onClick={handleExportUsersCSV} className={`text-white px-4 py-2 rounded text-sm font-bold ${themeClasses.primary}`}>تصدير الموظفين</button>
                </div>
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50"><tr><th className="p-3">الاسم</th><th className="p-3">القسم</th><th className="p-3">الحالة</th><th className="p-3">تحكم</th></tr></thead>
                    <tbody>
                        {activeUsers.map(u => (
                        <tr key={u.id} className="border-b">
                            <td className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isOnline(u.last_active) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div>
                                        <div className="font-bold">{u.name}</div>
                                        <div className="text-[10px] text-gray-400 dir-ltr text-right">{u.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-3">{u.section}</td>
                            <td className="p-3">{isOnline(u.last_active) ? <span className="text-green-600 font-bold text-xs">متصل</span> : <span className="text-gray-400 text-xs">غير متصل</span>}</td>
                            <td className="p-3 flex gap-2">
                                <button onClick={()=>setEditingUser(u)} className="text-blue-600"><Edit size={16}/></button>
                                <button onClick={()=>{setResetPassUser(u); setNewPassword('');}} className="text-orange-600"><Lock size={16}/></button>
                                <button onClick={()=>handleReject(u.id)} className="text-red-600"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* ... Activity Tab (unchanged) ... */}
      {(activeTab === 'activity' || (isPrintMode && printTarget === 'activity')) && (
          <div className="space-y-6">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 mb-4 no-print">
                <div className="flex flex-wrap gap-4 justify-between items-end">
                    <div className="flex flex-wrap gap-3 items-end flex-1">
                         <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">الصحفي</label>
                            <select value={filterJournalist} onChange={(e) => setFilterJournalist(e.target.value)} className="border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-800 min-w-[120px]">
                                <option value="الكل">الكل</option>
                                {activeUsers.filter(u => u.role !== 'admin').map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                            </select>
                         </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleExportCSV()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-green-700 h-[40px] mt-auto"><FileSpreadsheet size={16}/> Excel</button>
                        <button onClick={() => handlePrintReport('activity')} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-slate-700 h-[40px] mt-auto"><Printer size={16}/> PDF</button>
                    </div>
                </div>
            </div>

            <div className={`bg-white p-4 rounded-xl shadow-sm overflow-x-auto ${isPrintMode ? 'border-none shadow-none p-0' : ''}`}>
                {isPrintMode && <h2 className="text-2xl font-bold mb-4 text-center">تقرير نشاط المستخدمين ({startDate} إلى {endDate})</h2>}
                <table className="w-full text-sm text-right border-collapse">
                <thead className="bg-gray-50 border-b border-blue-200 text-gray-700 font-bold">
                    <tr>
                        <th className="p-4">الصحفي</th>
                        <th className="p-4">التاريخ</th>
                        <th className="p-4">عدد مرات الدخول</th>
                        <th className="p-4">إجمالي المدة</th>
                        <th className="p-4">تفاصيل الجلسات (البدء - الانتهاء)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredActivityLogs.length === 0 ? 
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا يوجد نشاط مسجل في هذه الفترة</td></tr>
                    : filteredActivityLogs.sort((a,b) => a.date_string.localeCompare(b.date_string)).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{log.user_name}</td>
                        <td className="p-4 text-gray-600">{formatDate(log.date_string)}</td>
                        <td className="p-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">{log.loginCount} مرة</span>
                        </td>
                        <td className="p-4 font-bold text-gray-800">{formatDuration(log.totalDurationMinutes)}</td>
                        <td className="p-4 text-xs text-gray-500">
                            <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                                {log.sessions.map((sess, idx) => (
                                    <span key={idx} className="block whitespace-nowrap dir-ltr text-right">
                                        {formatTime(sess.start)} - {formatTime(sess.end)}
                                    </span>
                                ))}
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
      )}

      {activeTab === 'settings' && isAdmin && !isPrintMode && (
        <div className="space-y-6">
             
             {/* Agency ID Display */}
             <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg text-white">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Key className="h-5 w-5 text-yellow-400" /> كود المؤسسة (للموظفين)</h3>
                <p className="text-sm text-slate-300 mb-4">أرسل هذا الكود للموظفين الجدد ليتمكنوا من الانضمام إلى مؤسستك.</p>
                <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/10 w-fit">
                    <code className="font-mono text-xl font-bold tracking-widest px-2">{user.agency_id}</code>
                    <button onClick={() => copyToClip(String(user.agency_id))} className="p-2 hover:bg-white/10 rounded transition text-yellow-400" title="نسخ الكود">
                        <Copy size={20} />
                    </button>
                </div>
             </div>

             {/* Theme Settings */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-purple-600" /> تخصيص ألوان النظام</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(THEMES).map(([key, t]) => (
                        <button 
                            key={key}
                            onClick={() => { setTheme(key); saveSettings(safeDepartments, announcement, articleStatuses); }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${theme === key ? 'border-black bg-gray-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className={`w-8 h-8 rounded-full ${t.primary} shadow-md`}></div>
                            <span className="text-xs font-bold text-gray-600">{t.name}</span>
                        </button>
                    ))}
                </div>
             </div>

             {/* CSV Import/Export Section */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileUp className="h-5 w-5 text-green-600" /> إدارة البيانات (استيراد/تصدير)</h3>
                <p className="text-sm text-gray-500 mb-4">يمكنك نقل البيانات من النظام القديم (Excel) أو تصدير نسخة احتياطية.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Content Import */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">1. استيراد المحتوى والتقييمات</label>
                        <p className="text-xs text-gray-400 mb-3">ترتيب الأعمدة (CSV): الاسم، العنوان، المنصة، القسم، الحالة، <span className="text-red-500">التقييم</span>، التاريخ، ...</p>
                        <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg cursor-pointer transition ${isImporting ? 'bg-blue-200 text-gray-500' : 'bg-white border border-blue-200 hover:border-green-500 text-green-700 shadow-sm'}`}>
                            {isImporting ? 'جاري التحميل...' : <><UploadCloud size={18}/> <span>رفع ملف المحتوى (CSV)</span></>}
                            <input type="file" accept=".csv" className="hidden" onChange={handleImportContentCSV} disabled={isImporting} />
                        </label>
                    </div>

                    {/* Users Import */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">2. استيراد الموظفين (Users)</label>
                        <p className="text-xs text-gray-400 mb-3">ترتيب الأعمدة (CSV): الاسم، اسم المستخدم، كلمة المرور، الوظيفة، القسم، التارجت</p>
                        <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg cursor-pointer transition ${isImporting ? 'bg-blue-200 text-gray-500' : 'bg-white border border-blue-200 hover:border-blue-500 text-blue-700 shadow-sm'}`}>
                            {isImporting ? 'جاري التحميل...' : <><Users size={18}/> <span>رفع ملف الموظفين (CSV)</span></>}
                            <input type="file" accept=".csv" className="hidden" onChange={handleImportUsersCSV} disabled={isImporting} />
                        </label>
                    </div>
                    
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-blue-200 flex flex-col justify-center items-center">
                        <label className="block text-sm font-bold text-gray-700 mb-2">نسخة احتياطية كاملة</label>
                        <button onClick={() => handleExportCSV()} className={`text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-md transition w-full md:w-auto ${themeClasses.primary} ${themeClasses.hover}`}>
                            <Download size={18}/> تحميل كل البيانات (CSV)
                        </button>
                    </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-indigo-600" /> إعدادات المظهر</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">اللوجو</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-bold">اضغط لرفع صورة</span></p>
                                    <p className="text-xs text-gray-400">PNG, JPG (MAX. 2MB)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                            
                            <input type="text" className="w-full border p-2 rounded-lg text-xs dir-ltr text-gray-400" placeholder="أو ضع رابط مباشر هنا..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                <span>سرعة الشريط (ثواني)</span>
                                <span className="text-blue-600">{tickerSpeed}s</span>
                            </label>
                            <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                step="5"
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                value={tickerSpeed} 
                                onChange={(e) => setTickerSpeed(Number(e.target.value))} 
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                <span>حجم خط الشريط (px)</span>
                                <span className="text-blue-600">{tickerFontSize}px</span>
                            </label>
                            <input 
                                type="range" 
                                min="12" 
                                max="48" 
                                step="2"
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                value={tickerFontSize} 
                                onChange={(e) => setTickerFontSize(Number(e.target.value))} 
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={() => saveSettings(safeDepartments, announcement, articleStatuses)} 
                                disabled={savingSettings}
                                className={`text-white px-6 py-2 rounded-lg font-bold transition shadow-md ${themeClasses.primary} ${themeClasses.hover}`}
                            >
                                {savingSettings ? 'جاري الحفظ...' : 'حفظ المظهر'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5 text-orange-500" /> شريط التنبيهات</h3>
                <div className="flex gap-2">
                    <input type="text" className="flex-1 border p-3 rounded-lg text-lg h-12 outline-none focus:ring-2 focus:ring-orange-500" placeholder="اكتب التنبيه هنا..." value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
                    <button onClick={() => saveSettings(safeDepartments, announcement, articleStatuses)} disabled={savingSettings} className="bg-orange-500 text-white px-6 rounded-lg font-bold hover:opacity-90 transition">حفظ الكل</button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-blue-700" /> إدارة الأقسام</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" className="flex-1 border p-2 rounded-lg" placeholder="اسم القسم الجديد..." value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
                    <button onClick={handleAddDept} disabled={savingSettings} className={`text-white px-4 rounded-lg flex items-center gap-1 ${themeClasses.primary} ${themeClasses.hover}`}><Plus className="h-4 w-4" /> إضافة</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {safeDepartments.map(dept => (<div key={dept} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2">{dept}<button onClick={() => handleDeleteDept(dept)} className="text-red-500 hover:text-red-700"><MinusCircle className="h-4 w-4" /></button></div>))}
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-purple-600" /> حالات الأخبار</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" className="flex-1 border p-2 rounded-lg" placeholder="اسم الحالة الجديدة..." value={newStatusName} onChange={(e) => setNewStatusName(e.target.value)} />
                    <button onClick={handleAddStatus} disabled={savingSettings} className="bg-purple-600 text-white px-4 rounded-lg flex items-center gap-1"><Plus className="h-4 w-4" /> إضافة</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {articleStatuses.map(status => (<div key={status} className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2 border border-purple-100">{status}<button onClick={() => handleDeleteStatus(status)} className="text-red-500 hover:text-red-700"><MinusCircle className="h-4 w-4" /></button></div>))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-green-500" /> تحديث التارجت</h3>
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 block mb-1">القسم</label>
                        <select className="w-full border p-2 rounded-lg bg-white outline-none" value={targetDept} onChange={(e) => setTargetDept(e.target.value)}>{safeDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    </div>
                    <div className="w-24">
                        <label className="text-xs font-bold text-gray-500 block mb-1">العدد</label>
                        <input type="number" min="1" className="w-full border p-2 rounded-lg text-center outline-none" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} />
                    </div>
                    <button onClick={handleUpdateDeptTarget} disabled={updatingTarget} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold h-[42px] hover:bg-green-700 transition">تطبيق</button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'ideas' && !isPrintMode && (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 bg-orange-50/50">
                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Lightbulb className="text-orange-500"/> طرح فكرة جديدة</h3>
                   <div className="space-y-4">
                      <textarea className="w-full border p-3 rounded-lg h-24 outline-none focus:ring-2 focus:ring-orange-400" placeholder="اكتب الفكرة هنا..." value={ideaText} onChange={e => setIdeaText(e.target.value)} />
                      <div className="flex gap-4 items-end">
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">توجيه إلى:</label>
                              <div className="flex gap-2 mb-2">
                                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={ideaType === 'section'} onChange={() => setIdeaType('section')} /> قسم</label>
                                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={ideaType === 'user'} onChange={() => setIdeaType('user')} /> صحفي</label>
                              </div>
                              <select className="w-full border p-2 rounded bg-white outline-none focus:ring-2 focus:ring-orange-400" value={ideaTarget} onChange={e => setIdeaTarget(e.target.value)}>
                                  <option value="">-- اختر --</option>
                                  {ideaType === 'section' ? safeDepartments.map(d => <option key={d} value={d}>{d}</option>) : activeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                              </select>
                          </div>
                          <button onClick={handleSendIdea} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition h-fit">إرسال الفكرة</button>
                      </div>
                   </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold mb-4">الأفكار المطروحة سابقاً</h3>
                  <div className="space-y-3">
                      {sentIdeas.map(idea => (
                          <div key={idea.id} className="p-3 border rounded-lg bg-gray-50 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                  <div><p className="font-bold text-gray-800">{idea.text}</p><p className="text-xs text-gray-500">موجهة لـ: {idea.to_section || 'مستخدم محدد'} - {formatDate(idea.timestamp)}</p></div>
                                  <button onClick={() => { if(window.confirm('حذف؟')) supabase.from('messages').delete().eq('id', idea.id).then(fetchData) }} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><Trash2 size={16}/></button>
                              </div>
                              {idea.replies && idea.replies.length > 0 && (<div className="bg-white p-2 rounded border mt-1 max-h-60 overflow-y-auto space-y-2"><p className="text-[10px] text-gray-400 font-bold mb-1">المحادثة:</p>{idea.replies.map((reply, i) => (<div key={i} className={`flex ${reply.sender === user.name ? 'justify-end' : 'justify-start'}`}><div className={`p-2 rounded-lg max-w-[85%] text-xs ${reply.sender === user.name ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}><span className="block font-bold text-[9px] mb-0.5 opacity-70">{reply.sender}</span><span>{reply.text}</span></div></div>))}</div>)}
                              <div className="flex gap-2 mt-1"><input type="text" className="flex-1 border rounded px-2 py-1 text-xs" placeholder="اكتب رداً..." value={expandedIdea === idea.id ? ideaReply : ''} onChange={(e) => {setExpandedIdea(idea.id); setIdeaReply(e.target.value)}} onFocus={() => setExpandedIdea(idea.id)} /><button onClick={() => handleReplyToIdeaAdmin(idea)} className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90">رد</button></div>
                          </div>
                      ))}
                      {sentIdeas.length === 0 && <div className="text-center text-gray-400 py-10">لا توجد أفكار</div>}
                  </div>
              </div>
          </div>
      )}

      {reviewArticle && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-bounce-in">
                <h3 className="text-lg font-bold text-gray-800 mb-4">تقييم: {reviewArticle.headline}</h3>
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-600 mb-2">التقييم (من 5)</label>
                    <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setReviewData({ ...reviewData, rating: star })} className={`transition transform hover:scale-110 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                <Star size={32} fill={star <= reviewData.rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-600 mb-2">ملاحظات</label>
                    <textarea 
                        className="w-full border p-2 rounded-lg text-sm" 
                        rows="3" 
                        value={reviewData.note} 
                        onChange={e => setReviewData({ ...reviewData, note: e.target.value })} 
                        placeholder="أضف ملاحظاتك للصحفي..."
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSaveReview} className={`flex-1 ${themeClasses.primary} text-white py-2 rounded-lg font-bold`}>حفظ التقييم</button>
                    <button onClick={() => setReviewArticle(null)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold">إلغاء</button>
                </div>
            </div>
        </div>
      )}

      {isEditingContent && contentToEdit && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">تعديل المحتوى</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">العنوان</label>
                        <input type="text" className="w-full border p-2 rounded" value={contentToEdit.headline} onChange={e => setContentToEdit({ ...contentToEdit, headline: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">الرابط</label>
                        <input type="text" className="w-full border p-2 rounded dir-ltr text-right" value={contentToEdit.url} onChange={e => setContentToEdit({ ...contentToEdit, url: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">القسم</label>
                            <select className="w-full border p-2 rounded" value={contentToEdit.section} onChange={e => setContentToEdit({ ...contentToEdit, section: e.target.value })}>
                                {safeDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">المنصة</label>
                            <select className="w-full border p-2 rounded" value={contentToEdit.platform} onChange={e => setContentToEdit({ ...contentToEdit, platform: e.target.value })}>
                                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">التاريخ</label>
                        <input type="date" className="w-full border p-2 rounded" value={contentToEdit.date_string} onChange={e => setContentToEdit({ ...contentToEdit, date_string: e.target.value })} />
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={handleSaveAdminEditContent} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">حفظ التعديلات</button>
                    <button onClick={() => { setIsEditingContent(false); setContentToEdit(null); }} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold">إلغاء</button>
                </div>
            </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 animate-bounce-in">
                <h3 className="text-lg font-bold mb-4">تعديل بيانات: {editingUser.name}</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">الاسم</label>
                        <input className="w-full border p-2 rounded text-sm" value={editingUser.name} onChange={e=>setEditingUser({...editingUser, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">الوظيفة</label>
                        <select className="w-full border p-2 rounded text-sm" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value})}>
                            <option value="journalist">صحفي</option>
                            <option value="editor">رئيس قسم</option>
                            <option value="managing_editor">مدير تحرير</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">القسم</label>
                        <select className="w-full border p-2 rounded text-sm" value={editingUser.section} onChange={e=>setEditingUser({...editingUser, section: e.target.value})}>
                            {safeDepartments.map(d=><option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">التارجت اليومي</label>
                        <input type="number" className="w-full border p-2 rounded text-sm" value={editingUser.daily_target} onChange={e=>setEditingUser({...editingUser, daily_target: e.target.value})} />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={handleUpdateUser} className={`flex-1 text-white py-2 rounded text-sm font-bold ${themeClasses.primary}`}>حفظ</button>
                        <button onClick={()=>setEditingUser(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded text-sm font-bold">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {resetPassUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 animate-bounce-in">
                <h3 className="text-lg font-bold mb-4">تغيير كلمة المرور: {resetPassUser.name}</h3>
                <input type="password" className="w-full border p-2 rounded mb-4 text-sm" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={handleResetPassword} className="flex-1 bg-orange-600 text-white py-2 rounded text-sm font-bold">تغيير</button>
                    <button onClick={()=>{setResetPassUser(null); setNewPassword('');}} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded text-sm font-bold">إلغاء</button>
                </div>
            </div>
        </div>
      )}

      {showOnlineModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-bounce-in">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-800">المتواجدون الآن</h3>
                    <button onClick={() => setShowOnlineModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {quickStats.onlineUsers.length === 0 && <p className="text-center text-gray-400 py-4">لا يوجد مستخدمين متصلين حالياً</p>}
                    {quickStats.onlineUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                                <p className="font-bold text-sm text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.section}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 4. Auth Screen (SaaS Edition) - UPDATED (Supabase Auth Email/Password) - FIXED
// ==========================================
function AuthScreen({ onLogin, serverError }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [joinExisting, setJoinExisting] = useState(false); // New state to toggle join mode
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    agencyId: "" // For joining existing agency
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeEmail = (v) => (v || "").trim().toLowerCase();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) Auth login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(formData.email),
        password: formData.password
      });

      if (authError) throw authError;

      const authUserId = authData?.user?.id;
      if (!authUserId) throw new Error("تعذر تحديد هوية المستخدم بعد تسجيل الدخول");

      // 2) Fetch profile by id (best practice)
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
        // Auth succeeded but no profile in app table
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

      // 0) Check if email already exists in app users table (username stores email for now)
      const { data: existing, error: existingError } = await supabase
        .from("users")
        .select("id")
        .eq("username", email)
        .limit(1);

      if (existingError) throw existingError;
      if (existing && existing.length > 0) throw new Error("البريد الإلكتروني مستخدم مسبقاً");

      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password
      });

      if (signUpError) throw signUpError;

      const authUserId = signUpData?.user?.id;
      if (!authUserId) throw new Error("تعذر إنشاء المستخدم في نظام المصادقة");

      if (joinExisting) {
        // --- JOIN EXISTING AGENCY FLOW ---

        const agencyId = Number(formData.agencyId);
        if (!Number.isFinite(agencyId)) throw new Error("كود المؤسسة غير صالح");

        // 2) Verify Agency Exists
        const { data: agency, error: agencyFetchError } = await supabase
          .from("agencies")
          .select("id")
          .eq("id", agencyId)
          .maybeSingle();

        if (agencyFetchError) throw agencyFetchError;
        if (!agency) throw new Error("كود المؤسسة غير صحيح. تأكد من الرقم مع المدير.");

        // 3) Upsert user profile (Journalist, Approved=False)
        const newUser = {
          id: authUserId,
          name: formData.name,
          username: email, // store email here for now
          role: "journalist",
          section: "عام",
          approved: false, // Needs admin approval
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

        // Optional: sign out until approved
        try { await supabase.auth.signOut(); } catch (_) {}

      } else {
        // --- CREATE NEW AGENCY FLOW ---

        // Generate new agency ID
        const newAgencyId = Date.now();

        // 2) Create Agency Record
        const { error: agencyError } = await supabase
          .from("agencies")
          .insert([{ id: newAgencyId, name: `مؤسسة ${formData.name}` }]);

        if (agencyError) throw new Error("فشل إنشاء سجل المؤسسة");

        // 3) Create Settings
        const { error: settingsError } = await supabase
          .from("agency_settings")
          .insert([{ agency_id: newAgencyId }]);

        if (settingsError) throw settingsError;

        // 4) Upsert Admin profile in app table
        const newUser = {
          id: authUserId,
          name: formData.name,
          username: email, // store email here for now
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



