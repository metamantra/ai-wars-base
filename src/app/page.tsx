"use client";

import FrameInit from './components/FrameInit';
import { useState, useEffect } from 'react';
import { useAIWars, ToastMessage } from './hooks/useAIWars';
import { 
  Zap, Shield, Cpu, BookOpen, Crosshair, 
  Activity, Database, Skull, AlertTriangle, 
  ChevronDown, Share2, Server, Users, Wallet,
  Snowflake, ArrowUpCircle, BatteryCharging, 
  Info, CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function AIWarsInterface() {
  const { 
    account, connect, stats, liveBalance, toast, notify,
    register, buyMiner, reinvestMiner, withdrawReferral,
    attack, cashout, buyRefill, activateCooling, upgradePrestige, upgradeDefense 
  } = useAIWars();

  const [activeTab, setActiveTab] = useState<'home' | 'core' | 'conflict' | 'manual'>('home');
  const [now, setNow] = useState(Date.now() / 1000);

  useEffect(() => { const i = setInterval(() => setNow(Date.now()/1000), 1000); return () => clearInterval(i); }, []);

  const miners = [
    { id: 0, name: "Synapse Node", mk: "I", cost: "0.00025", rate: 10 },
    { id: 1, name: "Logic Gate", mk: "II", cost: "0.001", rate: 25 },
    { id: 2, name: "Quantum Core", mk: "III", cost: "0.0025", rate: 70 },
    { id: 3, name: "Neural Matrix", mk: "IV", cost: "0.0075", rate: 250 },
    { id: 7, name: "Singularity", mk: "X", cost: "0.75", rate: 40000 },
  ];

  const handleRegister = async () => {
    const success = await register();
    if (success) setActiveTab('core');
  };

  // --- SMART SHARE FUNCTION ---
  const handleShare = async () => {
    const shareData = {
      title: 'AI WARS',
      text: 'Connect to the Neural Grid and farm ETH on Base.',
      url: stats.refLink,
    };

    if (navigator.share) {
      // Mobile / Native Share
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      // Desktop / Fallback
      navigator.clipboard.writeText(stats.refLink);
      notify("Uplink Copied", "Referral link copied to clipboard.", "success");
    }
  };

  const isDebuffed = stats.debuffEnd > now;
  const isImmune = stats.immunityEnd > now && !isDebuffed;
  const isCooling = stats.coolingEnd > now;

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen relative font-sans overflow-hidden">
      
      {/* ADD THIS LINE HERE: */}
      <FrameInit />
      {/* FOMO NOTIFICATION OVERLAY */}
      <AnimatePresence>
        {toast && <Notification toast={toast} />}
      </AnimatePresence>

      {/* STATUS BAR */}
      <div className="bg-white/90 backdrop-blur-md p-3 sticky top-0 z-40 border-b border-blue-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${account ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="font-bold text-slate-800 tracking-tight text-sm">AI WARS <span className="text-blue-600 text-[10px] align-top">MAINNET</span></span>
        </div>
        {account ? (
            <div className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-mono text-slate-500 border border-slate-200">
                {account.slice(0, 6)}...
            </div>
        ) : (
            <button onClick={connect} className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">CONNECT</button>
        )}
      </div>

      <div className="p-4 space-y-4">
        
        {/* GLOBAL STATS */}
        <div className="grid grid-cols-2 gap-3">
            <div className={`card-tech !p-3 border-l-4 ${stats.isVaultOpen ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <Database size={12} /> <span className="text-[10px] uppercase font-bold">Vault Liquidity</span>
                </div>
                <div className="text-lg font-bold text-slate-700 font-mono">{Number(stats.vaultBalance).toFixed(3)} Ξ</div>
                {!stats.isVaultOpen && <div className="text-[9px] text-red-500 font-bold tracking-widest mt-1">LIQUIDITY PHASE (LOCKED)</div>}
            </div>
            <div className="card-tech bg-slate-50 border-slate-200 !p-3">
                 <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <Activity size={12} /> <span className="text-[10px] uppercase font-bold">Net Hashrate</span>
                </div>
                <div className="text-lg font-bold text-slate-700 font-mono">
                    {Number(stats.globalHash) === 0 ? "0 (Genesis)" : Number(stats.globalHash).toLocaleString()}
                </div>
            </div>
        </div>

        {/* PLAYER HUD */}
        {account && (
            <div className="card-tech bg-gradient-to-br from-slate-900 to-slate-800 text-white !border-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-blue-300 text-[10px] font-mono uppercase mb-1 flex items-center gap-1">
                                <Zap size={10} className="text-yellow-400"/> Available SYN
                            </div>
                            <div className="text-4xl font-bold hud-value tracking-wider tabular-nums">{liveBalance}</div>
                            <div className="flex gap-3 mt-2">
                                <div className="bg-white/10 px-2 py-1 rounded text-[10px] text-blue-200 font-mono inline-flex items-center gap-1">
                                    <Activity size={10} /> +{stats.hashrate} H/s
                                </div>
                                {isCooling && <div className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-[10px] font-bold animate-pulse">COOLING ACTIVE</div>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button 
                            onClick={cashout} 
                            disabled={!stats.isVaultOpen}
                            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${stats.isVaultOpen ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                            <Wallet size={12}/> {stats.isVaultOpen ? 'CASHOUT' : 'LOCKED'}
                        </button>
                        <div className="bg-white/5 border border-white/10 text-slate-400 py-2 rounded-lg text-[10px] flex items-center justify-center font-mono">
                            2B SYN = 1 ETH
                        </div>
                    </div>
                </div>
            </div>
        )}

        <AnimatePresence mode="wait">
            
            {/* --- HOME TAB --- */}
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                
                {stats.isRegistered && (
                    <div className="card-tech bg-slate-900 border-slate-800 text-slate-300">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 border-b border-slate-800 pb-1">Node Diagnostics</div>
                        <div className="space-y-2">
                            {isDebuffed ? (
                                <div className="flex items-center justify-between text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
                                    <span className="text-xs font-bold flex items-center gap-2"><Skull size={12}/> MALWARE DETECTED</span>
                                    <span className="font-mono text-xs">{(stats.debuffEnd - now).toFixed(0)}s</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-green-500 opacity-50"><Activity size={12}/> Systems Nominal</div>
                            )}
                            
                            {isImmune && (
                                <div className="flex items-center justify-between text-blue-400 bg-blue-900/20 p-2 rounded border border-blue-900/50">
                                    <span className="text-xs font-bold flex items-center gap-2"><Shield size={12}/> IMMUNITY SHIELD</span>
                                    <span className="font-mono text-xs">{(stats.immunityEnd - now).toFixed(0)}s</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!stats.isRegistered && account && (
                    <div className="card-tech border-orange-200 bg-orange-50/50">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="text-orange-500" />
                            <h3 className="font-bold text-slate-800">Uplink Required</h3>
                        </div>
                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">To access the Neural Grid, you must register a node. This one-time fee establishes your presence on the Base L2 network.</p>
                        <button onClick={handleRegister} className="btn-tech-primary from-orange-500 to-orange-400 shadow-orange-500/30">
                            INITIALIZE (0.01 ETH)
                        </button>
                    </div>
                )}
                
                {stats.isRegistered && (
                    <div className="card-tech">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2"><Users size={14}/> Referral Network</h3>
                            <div className="text-xs font-mono text-green-600 font-bold">{Number(stats.ethPendingRef).toFixed(4)} ETH</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleShare} className="btn-tech-secondary py-2 text-[10px] col-span-2"><Share2 size={12}/> INVITE FRIEND (SHARE)</button>
                            <button onClick={withdrawReferral} className="btn-tech-secondary py-2 text-[10px] text-red-500 border-red-100">WITHDRAW (-20%)</button>
                            <div className="text-[10px] text-center flex items-center justify-center text-slate-400 bg-slate-50 rounded">Use "Reinvest" in Shop (0% Tax)</div>
                        </div>
                    </div>
                )}
              </motion.div>
            )}

            {/* --- CORE (SHOP) --- */}
            {activeTab === 'core' && (
              <motion.div key="core" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                <div className="card-tech bg-amber-50/50 border-amber-100">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="font-bold text-sm text-amber-700 flex items-center gap-2"><ArrowUpCircle size={14}/> Neural Evolution (v.{stats.prestigeLevel})</h3>
                         <div className="text-xs text-amber-600 font-bold">+{stats.prestigeLevel * 5}% Rate</div>
                    </div>
                    <button onClick={upgradePrestige} className="btn-tech-secondary text-amber-600 border-amber-200">EVOLVE (100k SYN)</button>
                </div>

                {miners.map((m) => (
                  <div key={m.id} className="card-tech">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg"><Cpu className="text-blue-600 w-5 h-5" /></div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{m.name}</div>
                          <div className="text-[10px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block">Mk.{m.mk}</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] text-slate-400 uppercase font-bold">Output</div>
                         <div className="font-bold text-green-600 font-mono text-sm">+{m.rate} H/s</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <button onClick={() => buyMiner(m.id, m.cost)} className="btn-tech-primary py-2 text-[10px]">BUY {m.cost} ETH</button>
                       <button onClick={() => reinvestMiner(m.id)} disabled={Number(stats.ethPendingRef) < Number(m.cost)} className="btn-tech-secondary py-2 text-[10px] disabled:opacity-50 text-purple-600 border-purple-100">REINVEST</button>
                    </div>
                  </div>
                ))}

                <div className="card-tech bg-green-50/50 border-green-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-sm text-green-700 flex items-center gap-2"><BatteryCharging size={14}/> Instant Refill</h3>
                    </div>
                    <button onClick={buyRefill} className="btn-tech-secondary text-green-600 border-green-200">BUY 500k SYN (0.0025 ETH)</button>
                </div>
              </motion.div>
            )}

            {/* --- CONFLICT --- */}
            {activeTab === 'conflict' && (
              <motion.div key="conflict" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="card-tech">
                        <div className="text-[10px] text-slate-400 font-bold mb-1">FIREWALL (Lvl {stats.defenseLevel})</div>
                        <div className="text-xs text-blue-600 font-bold mb-2">Mitigation: {stats.defenseLevel * 5}%</div>
                        <button onClick={upgradeDefense} className="btn-tech-secondary py-2 text-[10px]"><Shield size={10} className="mr-1"/> UPGRADE</button>
                    </div>
                    <div className="card-tech">
                         <div className="text-[10px] text-slate-400 font-bold mb-1">EMERGENCY COOLING</div>
                         <div className="text-xs text-cyan-600 font-bold mb-2">{isCooling ? 'ACTIVE' : '+10% Hashrate (24h)'}</div>
                         <button onClick={activateCooling} disabled={isCooling} className="btn-tech-secondary py-2 text-[10px] disabled:opacity-50"><Snowflake size={10} className="mr-1"/> {isCooling ? 'Running...' : 'ACTIVATE (25k)'}</button>
                    </div>
                </div>

                <div className="card-tech border-l-4 border-l-red-500">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-red-600 flex items-center gap-2 text-sm"><Skull size={16}/> Data Breach</h3>
                            <p className="text-[10px] text-slate-500 mt-1">Target Debuff: -25% Hashrate</p>
                        </div>
                        <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded">STANDARD</div>
                    </div>
                    <button onClick={() => attack(false)} className="btn-tech-danger">INITIATE (50k SYN)</button>
                </div>

                <div className="card-tech border-l-4 border-l-purple-500">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-purple-600 flex items-center gap-2 text-sm"><Zap size={16}/> Neural Shock</h3>
                            <p className="text-[10px] text-slate-500 mt-1">Ignores 50% Defense. -40% Hashrate.</p>
                        </div>
                        <div className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded">PREMIUM</div>
                    </div>
                    <button onClick={() => attack(true)} className="btn-tech-premium">EXECUTE (0.005 ETH)</button>
                </div>
              </motion.div>
            )}

            {/* --- MANUAL (UPDATED LORE & GUIDE) --- */}
            {activeTab === 'manual' && (
                <motion.div key="manual" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pb-4">
                    <div className="p-4 bg-slate-900 rounded-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10"><Cpu size={100}/></div>
                        <h2 className="font-bold text-lg mb-2 text-blue-400">The Base Singularity</h2>
                        <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                            The Base L2 Superchain has generated a surplus of computational energy known as the "Neural Grid". 
                            Operators (you) must connect nodes to this grid to capture the overflow.
                        </p>
                    </div>

                    <GuideItem title="Protocol Economy (ROI)" icon={<Database size={16} className="text-green-500"/>}>
                        <div className="space-y-3">
                            <p><strong>The Core Loop:</strong> You buy miners to get Hashrate. Hashrate earns you SYN. You sell SYN for ETH.</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Daily Emission:</strong> The contract releases exactly <span className="text-blue-600 font-bold">10,000 SYN/sec</span> (~0.432 ETH daily) to the pool.</li>
                                <li><strong>The Split:</strong> If you own 1% of the total network Hashrate, you earn 1% of that daily pot.</li>
                                <li><strong>Exchange Rate:</strong> Fixed at <strong>2,000,000,000 SYN = 1 ETH</strong>.</li>
                            </ul>
                        </div>
                    </GuideItem>

                    <GuideItem title="Hardware Specifications" icon={<Cpu size={16} className="text-blue-500"/>}>
                        <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-bold border-b pb-1"><span>UNIT</span><span>OUTPUT</span></div>
                             {miners.map(m => (
                                 <div key={m.id} className="flex justify-between text-xs">
                                     <span>{m.name}</span>
                                     <span className="font-mono text-green-600">+{m.rate} H/s</span>
                                 </div>
                             ))}
                             <p className="mt-2"><strong>Strategy:</strong> Higher tier units offer the same cost-to-hashrate ratio but allow you to scale up faster in a single transaction.</p>
                        </div>
                    </GuideItem>

                    <GuideItem title="Conflict & Defense" icon={<Crosshair size={16} className="text-red-500"/>}>
                        <div className="space-y-3">
                            <div>
                                <strong className="text-red-500 block text-xs uppercase">Data Breach (Standard)</strong>
                                Cost: 50k SYN. Reduces enemy hashrate by 25% for 4 hours. Can be mitigated by Firewall.
                            </div>
                            <div>
                                <strong className="text-purple-500 block text-xs uppercase">Neural Shock (Premium)</strong>
                                Cost: 0.005 ETH. Bypasses 50% of enemy Firewall. -40% Hashrate. Use this to cripple high-level whales.
                            </div>
                            <div>
                                <strong className="text-blue-500 block text-xs uppercase">Defense Layers</strong>
                                <strong>Firewall:</strong> Each level reduces attack duration by 5% (Max 90%).<br/>
                                <strong>Immunity:</strong> After being attacked, you are immune for 12 hours.
                            </div>
                        </div>
                    </GuideItem>

                    <GuideItem title="Referral Program" icon={<Users size={16} className="text-purple-500"/>}>
                        <p>The network incentivizes growth. You earn <span className="text-green-600 font-bold">5%</span> of all ETH spent by users who join via your uplink.</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-purple-50 p-2 rounded text-center">
                                <div className="font-bold text-purple-700 text-xs">REINVEST</div>
                                <div className="text-[10px]">Use pending ETH to buy miners Tax-Free.</div>
                            </div>
                            <div className="bg-red-50 p-2 rounded text-center">
                                <div className="font-bold text-red-700 text-xs">WITHDRAW</div>
                                <div className="text-[10px]">Cash out pending ETH to wallet (20% Tax).</div>
                            </div>
                        </div>
                    </GuideItem>
                </motion.div>
            )}

        </AnimatePresence>
      </div>

      {/* NAV */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around p-2 pb-6 max-w-md left-0 right-0 mx-auto z-50">
         <NavBtn icon={<Activity size={20}/>} label="Home" active={activeTab==='home'} onClick={()=>setActiveTab('home')} />
         <NavBtn icon={<Cpu size={20}/>} label="Core" active={activeTab==='core'} onClick={()=>setActiveTab('core')} />
         <NavBtn icon={<Crosshair size={20}/>} label="Conflict" active={activeTab==='conflict'} onClick={()=>setActiveTab('conflict')} />
         <NavBtn icon={<BookOpen size={20}/>} label="Manual" active={activeTab==='manual'} onClick={()=>setActiveTab('manual')} />
      </div>
    </div>
  );
}

// --- COMPONENTS ---
function Notification({ toast }: { toast: ToastMessage }) {
    if(!toast) return null;
    return (
        <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
            <div className={clsx("backdrop-blur-md shadow-xl border rounded-2xl p-4 flex items-start gap-3 w-full max-w-sm", 
                toast.type === 'success' ? "bg-green-50/90 border-green-200 text-green-800" : 
                toast.type === 'error' ? "bg-red-50/90 border-red-200 text-red-800" : 
                "bg-blue-50/90 border-blue-200 text-blue-800"
            )}>
                <div className={clsx("p-2 rounded-full mt-0.5", 
                    toast.type === 'success' ? "bg-green-100" : toast.type === 'error' ? "bg-red-100" : "bg-blue-100"
                )}>
                    {toast.type === 'success' ? <CheckCircle size={18}/> : toast.type === 'error' ? <XCircle size={18}/> : <Info size={18}/>}
                </div>
                <div>
                    <div className="font-bold text-sm">{toast.title}</div>
                    <div className="text-xs opacity-90 leading-tight">{toast.msg}</div>
                </div>
            </div>
        </motion.div>
    );
}

function NavBtn({icon, label, active, onClick}: any) {
   return (
      <button onClick={onClick} className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative", active ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}>
         <div className={clsx("transition-transform duration-200", active ? "-translate-y-1" : "")}>{icon}</div>
         <span className={clsx("text-[10px] font-bold absolute -bottom-1 opacity-0 transition-all", active ? "opacity-100 bottom-1" : "")}>{label}</span>
         {active && <motion.div layoutId="nav-pill" className="absolute bottom-0 w-1 h-1 bg-blue-600 rounded-full" />}
      </button>
   )
}

function GuideItem({ title, icon, children }: any) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="card-tech !p-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">{icon} {title}</div>
                <ChevronDown className={clsx("transition-transform text-slate-400", isOpen ? "rotate-180" : "")} size={16}/>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-4 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/50">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}