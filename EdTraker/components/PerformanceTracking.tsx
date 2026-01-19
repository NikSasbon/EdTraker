
import React, { useState, useEffect, useRef } from 'react';
import { Editor, WinningVideo, MonthlySummary } from '../types';
import { getCurrentMonth, formatMonthDisplay } from '../utils';

interface PerformanceTrackingProps {
  editors: Editor[];
  winningVideos: WinningVideo[];
  monthlySummaries: MonthlySummary[];
  onSave: (video: WinningVideo | Omit<WinningVideo, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdateManualWinners: (editorId: string, month: string, count: number) => void;
}

const PerformanceTracking: React.FC<PerformanceTrackingProps> = ({ 
  editors, 
  winningVideos, 
  monthlySummaries,
  onSave, 
  onDelete,
  onUpdateManualWinners
}) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [filterEditorId, setFilterEditorId] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState("");
  const [editingManualCountId, setEditingManualCountId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    spend: 0,
    roas: 0,
    purchases: 0,
    isBestPerformer: false
  });

  useEffect(() => {
    if (editors.length > 0 && !selectedEditor) {
      setSelectedEditor(editors[0].id);
    }
  }, [editors, selectedEditor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const editorIdToUse = selectedEditor || (editors.length > 0 ? editors[0].id : "");
    if (!editorIdToUse) return;

    const videoData = {
      ...formData,
      editorId: editorIdToUse,
      month: selectedMonth
    };

    if (editingVideoId) {
      onSave({ ...videoData, id: editingVideoId } as WinningVideo);
    } else {
      onSave(videoData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", link: "", spend: 0, roas: 0, purchases: 0, isBestPerformer: false });
    setShowForm(false);
    setEditingVideoId(null);
  };

  const handleEditVideo = (video: WinningVideo) => {
    setFormData({
      name: video.name,
      link: video.link,
      spend: video.spend,
      roas: video.roas,
      purchases: video.purchases,
      isBestPerformer: video.isBestPerformer
    });
    setSelectedEditor(video.editorId);
    setEditingVideoId(video.id);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getEditorWinners = (editorId: string) => {
    return winningVideos.filter(v => v.editorId === editorId && v.month === selectedMonth);
  };

  const getManualCount = (editorId: string) => {
    return monthlySummaries.find(s => s.editorId === editorId && s.month === selectedMonth)?.manualWinners || 0;
  };

  const filteredEditors = filterEditorId === "all" 
    ? editors 
    : editors.filter(e => e.id === filterEditorId);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden" ref={formRef}>
      <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Videos Ganadores & Ads</h2>
          <p className="text-sm text-slate-500 font-medium">Tracking de performance mensual por editor</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Mes</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none min-w-[150px]"
            >
              {Array.from({length: 12}).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                return <option key={val} value={val}>{formatMonthDisplay(val)}</option>;
              })}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1">Filtrar Editor</label>
            <select 
              value={filterEditorId}
              onChange={(e) => setFilterEditorId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-indigo-600 shadow-sm outline-none min-w-[150px]"
            >
              <option value="all">Todos los Editores</option>
              {editors.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => {
              if (editors.length === 0) {
                alert("Debes crear al menos un editor en Configuración primero.");
                return;
              }
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className={`${showForm ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white'} px-6 py-2.5 mt-4 xl:mt-0 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all self-end h-[42px]`}
          >
            {showForm ? 'Cancelar' : 'Añadir Video'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-8 bg-indigo-50/50 border-b border-indigo-100 animate-in slide-in-from-top-4 duration-300">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-black text-indigo-900 uppercase tracking-widest text-xs">
              {editingVideoId ? '📝 Editando Video' : '✨ Nuevo Video de Performance'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Editor</label>
              <select 
                value={selectedEditor}
                onChange={(e) => setSelectedEditor(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm"
              >
                {editors.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nombre del Video</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Hook de Producto V1"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Link (Opcional)</label>
              <input 
                type="url" 
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="https://..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Spend ($)</label>
              <input type="number" step="0.01" value={formData.spend} onChange={(e) => setFormData({...formData, spend: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ROAS</label>
              <input type="number" step="0.01" value={formData.roas} onChange={(e) => setFormData({...formData, roas: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compras</label>
              <input type="number" value={formData.purchases} onChange={(e) => setFormData({...formData, purchases: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <div className="lg:col-span-3 flex items-center justify-between pt-4 border-t border-indigo-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isBestPerformer} onChange={(e) => setFormData({...formData, isBestPerformer: e.target.checked})} className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <span className="text-sm font-black text-indigo-700 uppercase tracking-widest">Marcar como Best Performer</span>
              </label>
              <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all">
                {editingVideoId ? 'Actualizar Datos' : 'Guardar Performance'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredEditors.map(editor => {
          const winners = getEditorWinners(editor.id);
          const manualCount = getManualCount(editor.id);
          const totalWinners = winners.length + manualCount;
          const bestVideo = winners.find(v => v.isBestPerformer);
          const isEditingManual = editingManualCountId === editor.id;

          return (
            <div key={editor.id} className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8 flex flex-col hover:shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{editor.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Mensual</p>
                </div>
                
                <div className="relative">
                  {isEditingManual ? (
                    <div className="bg-white px-2 py-2 rounded-xl border-2 border-indigo-500 shadow-lg flex flex-col items-center animate-in zoom-in-95 duration-200">
                      <input 
                        autoFocus
                        type="number"
                        min="0"
                        defaultValue={totalWinners}
                        onBlur={(e) => {
                          const newTotal = parseInt(e.target.value) || 0;
                          const extra = Math.max(0, newTotal - winners.length);
                          onUpdateManualWinners(editor.id, selectedMonth, extra);
                          setEditingManualCountId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        className="w-16 text-center text-xl font-black text-indigo-600 outline-none"
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setEditingManualCountId(editor.id)}
                      className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[65px] group hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative"
                    >
                      <span className="text-xl font-black text-indigo-600 group-hover:scale-110 transition-transform">{totalWinners}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Winners</span>
                    </button>
                  )}
                </div>
              </div>

              {bestVideo && (
                <div className="mb-6 bg-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80 block">🏆 Best Performing Video</span>
                      <div className="flex items-center gap-1">
                        {bestVideo.link && (
                          <a href={bestVideo.link} target="_blank" rel="noreferrer" className="p-1 hover:bg-white/20 rounded transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                        )}
                        <button onClick={() => handleEditVideo(bestVideo)} className="p-1 hover:bg-white/20 rounded transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => onDelete(bestVideo.id)} className="p-1 hover:bg-red-400/30 rounded transition-colors text-white/70 hover:text-white"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                    <h4 className="font-black text-lg truncate mb-2">{bestVideo.name}</h4>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold opacity-70 uppercase">ROAS</span>
                        <span className="font-black text-lg">{bestVideo.roas.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold opacity-70 uppercase">Purchases</span>
                        <span className="font-black text-lg">{bestVideo.purchases}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 flex-grow">
                {winners.filter(v => !v.isBestPerformer).map(video => (
                  <div key={video.id} className="bg-white p-4 rounded-xl border border-slate-200 group relative hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h5 className="font-black text-slate-800 text-sm truncate pr-14">{video.name}</h5>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Spend: <span className="text-slate-700">${video.spend}</span></span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">ROAS: <span className="text-slate-700">{video.roas}</span></span>
                        </div>
                      </div>
                      <div className="flex gap-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                        <button onClick={() => handleEditVideo(video)} className="text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => onDelete(video.id)} className="text-slate-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))}

                {winners.length === 0 && manualCount === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center px-4">Sin datos</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceTracking;
