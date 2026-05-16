'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Truck, ShieldCheck, Activity, 
  Search, Filter, Maximize2, Layers,
  Navigation, Zap, Clock, AlertCircle,
  TrendingUp, ArrowRight, User, Box,
  ChevronRight, Compass, Info, Globe,
  Satellite, Map as MapIcon, RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FleetMapPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'in_transit' | 'delayed'>('all');
  const [trips, setTrips] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, statsRes] = await Promise.all([
        fetch('/api/v1/trips?limit=50&status=in_transit'),
        fetch('/api/v1/trips?stats=true')
      ]);
      
      const tripsData = await tripsRes.json();
      const statsData = await statsRes.json();
      
      setTrips(tripsData.data || []);
      setStats(statsData.data || null);
    } catch (error) {
      console.error('Fleet Engine Connectivity Error');
    } finally {
      setLoading(false);
    }
  };

  const selectedTrip = useMemo(() => 
    trips.find(t => t.id === selectedTripId), 
  [trips, selectedTripId]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  // Generate dynamic news feed from real trip data
  const newsFeed = useMemo(() => {
    if (!trips.length) return ["SCANNING GLOBAL FLEET...", "NODES ONLINE", "WAITING FOR TELEMETRY..."];
    
    const updates = trips.slice(0, 5).map(t => 
      `TR-${t.id.slice(-4).toUpperCase()}: ${t.vehicle?.regNo} in transit from ${t.fromLocation}`
    );
    
    return [...updates, ...updates]; // Double for marquee
  }, [trips]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!isMounted) return (
    <div className="flex items-center justify-center h-[calc(100vh-140px)] bg-slate-900 rounded-[3rem]">
       <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-700 w-full max-w-full overflow-hidden">
      
      {/* 1. Header Section - Fixed Height */}
      <div className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Intelligence</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" /> Real-time Mission Monitoring
            </p>
          </div>
          
          <div className="h-10 w-[1px] bg-slate-100 hidden md:block" />
          
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex bg-slate-50 p-1 rounded-xl">
              {(['all', 'in_transit', 'delayed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-xl">
              {(['standard', 'satellite', 'terrain'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    viewMode === mode ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {mode === 'standard' && <><MapIcon className="h-3 w-3" /> STD</>}
                  {mode === 'satellite' && <><Satellite className="h-3 w-3" /> SAT</>}
                  {mode === 'terrain' && <><Layers className="h-3 w-3" /> TER</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
              <Input 
                placeholder="Track Vehicle..." 
                className="pl-10 h-10 w-48 rounded-xl bg-slate-50 border-none font-bold text-[10px]"
              />
           </div>
           <Button variant="outline" className="h-10 w-10 rounded-xl border-slate-100" onClick={fetchData}>
              <RefreshCw className={cn("h-4 w-4 text-slate-400", loading && "animate-spin")} />
           </Button>
           <Button 
             onClick={toggleFullscreen}
             className="h-10 px-5 rounded-xl bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-500/10"
           >
              <Maximize2 className="h-3.5 w-3.5 mr-2" /> FULL SCREEN
           </Button>
        </div>
      </div>

      {/* 2. Main Content - Dynamic Height (fills remaining space) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        
        {/* Map Visualization Area */}
        <div className="flex-1 bg-slate-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-slate-800 group">
           
           {/* Map Grid Background */}
           <div className={cn(
             "absolute inset-0 transition-all duration-1000",
             viewMode === 'satellite' ? "opacity-40 grayscale-[0.5]" : viewMode === 'terrain' ? "opacity-30 hue-rotate-90" : "opacity-20"
           )}>
             <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                <defs>
                   <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                   </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-large)" />
                {/* Simulated Geography */}
                <path d="M200,100 Q400,50 600,150 T900,100 L1000,400 Q800,600 500,500 T100,400 Z" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.2)" strokeWidth="2" />
                <path d="M800,450 Q1000,500 1100,650 L900,700 Q700,650 800,450" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.1)" strokeWidth="2" />
             </svg>
           </div>

           {/* Dynamic Trip Markers */}
           <div className="absolute inset-0 p-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                 {/* Render Real Trips or Ghost Markers if empty */}
                 {(trips.length > 0 ? trips.slice(0, 12) : [{id: 'ghost-1', x: 300, y: 200}, {id: 'ghost-2', x: 700, y: 400}, {id: 'ghost-3', x: 500, y: 300}]).map((t: any, i: number) => {
                    const x = t.x || (100 + (i * 150) % 800);
                    const y = t.y || (150 + (i * 90) % 400);
                    const isSelected = selectedTripId === t.id;
                    
                    return (
                      <g key={t.id} onClick={() => !t.id.startsWith('ghost') && setSelectedTripId(isSelected ? null : t.id)} className="pointer-events-auto cursor-pointer group/marker">
                        <circle cx={x} cy={y} r={isSelected ? "25" : "15"} fill={t.id.startsWith('ghost') ? "rgba(255,255,255,0.05)" : isSelected ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.1)"} className={cn(!t.id.startsWith('ghost') && "animate-pulse")} />
                        <circle cx={x} cy={y} r={isSelected ? "8" : "5"} fill={t.id.startsWith('ghost') ? "rgba(255,255,255,0.2)" : isSelected ? "#3b82f6" : "#2563eb"} className="transition-all duration-300" />
                        
                        <g transform={`translate(${x - 50}, ${y - 50})`} className={cn("transition-all duration-500", (isSelected || !t.id.startsWith('ghost')) ? "opacity-100" : "opacity-0 group-hover/marker:opacity-100")}>
                           <rect width="100" height="34" rx="10" fill={isSelected ? "rgba(37,99,235,0.9)" : "rgba(15,23,42,0.8)"} className="backdrop-blur-sm border border-white/10 shadow-2xl" />
                           <text x="50" y="21" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" className="uppercase tracking-widest">
                              {t.vehicle?.regNo || 'TELEMETRY'}
                           </text>
                        </g>
                      </g>
                    );
                 })}
              </svg>
           </div>

           {/* Unit Intelligence Card - Appears when a trip is selected */}
           {selectedTrip && (
             <div className="absolute top-6 left-6 w-72 bg-white rounded-[2rem] shadow-2xl animate-in slide-in-from-left-4 duration-500 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white relative">
                   <button onClick={() => setSelectedTripId(null)} className="absolute top-4 right-4 text-white/40 hover:text-white"><Activity className="h-4 w-4" /></button>
                   <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Unit Intelligence</p>
                   <h4 className="text-xl font-black tracking-tight">{selectedTrip.vehicle?.regNo}</h4>
                   <div className="flex items-center gap-2 mt-4">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center"><User className="h-4 w-4 text-blue-400" /></div>
                      <div>
                         <p className="text-[7px] font-black text-white/40 uppercase">Assigned Driver</p>
                         <p className="text-[10px] font-bold">{selectedTrip.driver?.employee?.name || 'In Rotation'}</p>
                      </div>
                   </div>
                </div>
                <div className="p-6 space-y-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                         <div>
                            <p className="text-[7px] font-black text-slate-400 uppercase">Mission Status</p>
                            <p className="text-[10px] font-black text-slate-700 uppercase">{selectedTrip.status}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <MapPin className="h-4 w-4 text-red-500" />
                         <div>
                            <p className="text-[7px] font-black text-slate-400 uppercase">Destination</p>
                            <p className="text-[10px] font-black text-slate-700 truncate">{selectedTrip.toLocation}</p>
                         </div>
                      </div>
                   </div>
                   <Button className="w-full h-10 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest">
                      Mission Profile
                   </Button>
                </div>
             </div>
           )}

           {/* HUD: Intelligence Overlay */}
           <div className="absolute top-6 right-6 flex flex-col gap-3">
              <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-2xl w-56">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Compass className="h-4 w-4" /></div>
                    <div>
                       <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">In Transit</p>
                       <p className="text-lg font-black text-white">{trips.length} Units</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                       <span className="text-white/40 uppercase">Fleet Uptime</span>
                       <span className="text-emerald-400">99.8%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[99%]" />
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 w-56">
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                 <span className="text-[9px] font-black text-white/80 uppercase">Ops Integrity Verified</span>
              </div>
           </div>

           <div className="absolute bottom-6 left-6">
              <div className="bg-slate-900/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Origin</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Dest</span>
                 </div>
              </div>
           </div>

        </div>

        {/* 3. Sidebar: Mission Terminal - Self-contained Scroll */}
        <div className="w-full lg:w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden shrink-0">
           <div className="p-6 border-b border-slate-50 shrink-0">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Zap className="h-3.5 w-3.5 text-amber-500" /> Live Telemetry
              </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                ))
              ) : trips.length === 0 ? (
                <div className="text-center py-12">
                   <Truck className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Active Missions</p>
                </div>
              ) : (
                trips.map((trip: any) => (
                  <div 
                    key={trip.id} 
                    onClick={() => setSelectedTripId(trip.id === selectedTripId ? null : trip.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                      selectedTripId === trip.id ? "bg-blue-50 border-blue-100 shadow-sm" : "hover:bg-slate-50 border-transparent hover:border-slate-100"
                    )}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className="font-black text-slate-900 text-[11px]">{trip.vehicle?.regNo}</div>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                          selectedTripId === trip.id ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                        )}>
                          {trip.status}
                        </span>
                     </div>
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">
                        <MapPin className="h-2.5 w-2.5 text-red-500 shrink-0" /> {trip.fromLocation}
                        <ArrowRight className="h-2 w-2 shrink-0" />
                        {trip.toLocation}
                     </div>
                     <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                     </div>
                  </div>
                ))
              )}
           </div>
           <div className="p-5 bg-slate-50/50 border-t border-slate-50 shrink-0 text-center">
              <button className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                 Detailed Logs
              </button>
           </div>
        </div>

      </div>

      {/* 4. Global Feed Footer - Fixed Height */}
      <div className="bg-slate-900 rounded-[1.5rem] p-3 flex items-center justify-between gap-6 shadow-2xl shrink-0 overflow-hidden">
         <div className="flex items-center gap-6 pl-4 shrink-0">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Live Stream</span>
            </div>
         </div>
         
         <div className="flex-1 overflow-hidden relative h-4">
            <div className="flex gap-12 animate-marquee whitespace-nowrap absolute inset-0 items-center">
               {newsFeed.map((news, i) => (
                 <span key={i} className="text-[8px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-3">
                    <div className="h-0.5 w-0.5 bg-blue-500 rounded-full" /> {news}
                 </span>
               ))}
            </div>
         </div>

         <div className="pr-4 shrink-0">
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{currentTime}</p>
         </div>
      </div>

    </div>
  );
}
