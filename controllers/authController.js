import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Camera, User, X, Landmark, Loader2, 
  LogOut, ChevronRight, ShieldCheck, Plus, Check, Calendar, Save
} from 'lucide-react';
import API, { getFromLocalDB, saveToLocalDB } from '../utils/api';
import { haptic } from '../utils/haptics';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '', 
    username: '', 
    profilePic: '', 
    banks: [], 
    defaultBank: '', 
    cycleStartDay: 1
  });
  const [newBank, setNewBank] = useState('');

  // 1. INITIAL LOAD (Matches exports.getMe)
  useEffect(() => {
    const initProfile = async () => {
      try {
        const cached = await getFromLocalDB('user');
        if (cached) setUserData(prev => ({ ...prev, ...cached }));
        
        const res = await API.get('/auth/me'); // Hits exports.getMe
        setUserData(res.data);
        await saveToLocalDB('user', res.data);
      } catch (err) {
        if (err.response?.status === 401) handleSignOut();
      } finally {
        setLoading(false);
      }
    };
    initProfile();
  }, []);

  const handleSignOut = () => {
    if (haptic && typeof haptic.success === 'function') haptic.success();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  // 2. UPDATE PROFILE (Matches exports.updateProfile)
  const saveProfileUpdates = async (payload) => {
    setSaving(true);
    try {
      // Logic to prevent 404: If your API util base is /api/auth, use '/profile'
      // Otherwise use '/auth/profile'
      const res = await API.put('/auth/profile', payload);
      setUserData(res.data);
      await saveToLocalDB('user', res.data);
      if (haptic && typeof haptic.success === 'function') haptic.success();
    } catch (err) {
      console.error("Update Failed:", err.response?.data);
      if (haptic && typeof haptic.error === 'function') haptic.error();
    } finally {
      setSaving(false);
    }
  };

  const handleAddBank = () => {
    if (!newBank.trim()) return;
    const updatedBanks = [...new Set([...(userData.banks || []), newBank.trim()])];
    saveProfileUpdates({ banks: updatedBanks });
    setNewBank('');
  };

  const removeBank = (target) => {
    const updatedBanks = (userData.banks || []).filter(b => b !== target);
    const payload = { banks: updatedBanks };
    // If we remove the default bank, clear the defaultBank field too
    if (userData.defaultBank === target) payload.defaultBank = '';
    saveProfileUpdates(payload);
  };

  const updateCycleDay = (day) => {
    const val = day === '' ? '' : parseInt(day);
    if (val !== '' && (val < 1 || val > 31)) return;
    setUserData(prev => ({ ...prev, cycleStartDay: val }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#7C3AED]">
      <Loader2 className="animate-spin text-white" size={48} strokeWidth={4} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDF7] text-black pb-40 font-sans relative">
      
      {/* --- HEADER --- */}
      <header className="p-8 pt-16 bg-[#DAF486] border-b-4 border-black rounded-b-[3.5rem] shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center relative z-20">
        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
          <ArrowLeft size={24} strokeWidth={4} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Identity</h1>
        </div>
        <div className="w-12 h-12 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {saving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={24} strokeWidth={3} className="text-[#4ade80]" />}
        </div>
      </header>

      <main className="px-6 mt-10 space-y-8 relative z-10">
        
        {/* --- AVATAR & NAME --- */}
        <section className="flex flex-col items-center">
          <div className="relative">
            <div className="w-36 h-36 rounded-[3rem] bg-white border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <img src={userData.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} className="w-full h-full object-cover" alt="avatar" />
            </div>
            <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-1 -right-1 p-3 bg-[#FB7185] rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">
              <Camera size={20} strokeWidth={4} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" />
          </div>
          <div className="mt-6 text-center">
             <input 
               value={userData.name} 
               onChange={(e) => setUserData({...userData, name: e.target.value})}
               onBlur={() => saveProfileUpdates({ name: userData.name })}
               className="text-3xl font-black uppercase italic tracking-tighter text-center bg-transparent outline-none border-b-4 border-dashed border-black/10 focus:border-black transition-all"
             />
             <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-2">Node: @{userData.username}</p>
          </div>
        </section>

        {/* --- BUDGET CYCLE --- */}
        <section className="bg-white border-4 border-black rounded-[2.5rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7DD3FC] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-black/30">Budget Reset</p>
              <p className="font-black uppercase italic">Cycle Day</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={userData.cycleStartDay ?? ''} 
              onChange={(e) => updateCycleDay(e.target.value)}
              className="w-14 h-14 bg-[#F8F9FA] border-4 border-black rounded-xl text-center font-black text-xl outline-none focus:bg-[#DAF486]"
            />
            <button onClick={() => saveProfileUpdates({ cycleStartDay: userData.cycleStartDay })} className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center active:scale-90 transition-all">
              <Save size={20} />
            </button>
          </div>
        </section>

        {/* --- BANKS / SOURCES --- */}
        <section className="bg-white border-4 border-black rounded-[3rem] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <h3 className="font-black uppercase italic tracking-tighter text-lg px-2">Payment Nodes</h3>
          
          <div className="flex flex-col gap-3">
            <input 
              value={newBank} 
              onChange={(e) => setNewBank(e.target.value)} 
              placeholder="ADD NEW SOURCE..." 
              className="w-full bg-[#F8F9FA] border-4 border-black rounded-full px-6 py-4 font-black text-xs uppercase outline-none" 
            />
            <button onClick={handleAddBank} className="w-full py-4 bg-[#4ADE80] border-4 border-black rounded-full font-black uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
              ADD SOURCE <Plus size={20} strokeWidth={4} />
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <AnimatePresence mode='popLayout'>
              {(userData.banks || []).map((bank) => {
                const isDefault = bank === userData.defaultBank;
                return (
                  <motion.div 
                    layout key={bank} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                    className={`flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${isDefault ? 'bg-[#7C3AED] text-white' : 'bg-white'}`}
                  >
                    <Landmark size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{bank}</span>
                    <button onClick={() => saveProfileUpdates({ defaultBank: bank })} className={isDefault ? 'text-[#DAF486]' : 'text-black/20 hover:text-black'}>
                      <Check size={18} strokeWidth={4} />
                    </button>
                    <button onClick={() => removeBank(bank)} className="text-[#FB7185] ml-1">
                      <X size={18} strokeWidth={4} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* --- LOGOUT --- */}
        <button onClick={handleSignOut} className="w-full p-6 bg-[#FB7185] border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group active:translate-y-1 active:shadow-none transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center">
              <LogOut size={24} strokeWidth={3} />
            </div>
            <div className="text-left">
              <p className="font-black uppercase italic leading-none">End Session</p>
              <p className="text-[8px] font-black uppercase text-black/40 mt-1 tracking-widest">Terminate Node Connection</p>
            </div>
          </div>
          <ChevronRight size={24} />
        </button>
      </main>
    </div>
  );
};

export default Profile;