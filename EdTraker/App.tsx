
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor, WeeklyEntry, ViewType, Thresholds, WinningVideo, MonthlySummary, SyncStatus } from './types';
import { getCurrentWeek, generateId } from './utils';
import TrackingTable from './components/TrackingTable';
import StatsDashboard from './components/StatsDashboard';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import PerformanceTracking from './components/PerformanceTracking';

const DEFAULT_EDITORS: Editor[] = [
  { id: '1', name: 'Joc' }, { id: '2', name: 'Rod' }, { id: '3', name: 'Joaquin' }, { id: '4', name: 'Nik' }, { id: '5', name: 'Juli' }
];

const DEFAULT_THRESHOLDS: Thresholds = { target: 10, outstanding: 13 };

const API_URL = "https://api.jsonbin.io/v3/b";
// ATENCIÓN: Esta llave es un ejemplo. Si quieres que dure 5 meses+, debes crear tu cuenta en jsonbin.io y poner tu propia API KEY aquí.
const MASTER_KEY = "$2a$10$7zB/S.B7K0I6G.mB1G/6k.fG/VvO6.VvO6.VvO6.VvO6.VvO6.VvO6."; 

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('tracking');
  const [editors, setEditors] = useState<Editor[]>([]);
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [winningVideos, setWinningVideos] = useState<WinningVideo[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [cloudId, setCloudId] = useState<string | null>(localStorage.getItem('et_cloud_id'));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const savedEditors = localStorage.getItem('et_editors');
    const savedEntries = localStorage.getItem('et_entries');
    const savedWinners = localStorage.getItem('et_winners');
    const savedSummaries = localStorage.getItem('et_summaries');
    const savedThresholds = localStorage.getItem('et_thresholds');

    if (savedEditors) setEditors(JSON.parse(savedEditors));
    else setEditors(DEFAULT_EDITORS);

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedWinners) setWinningVideos(JSON.parse(savedWinners));
    if (savedSummaries) setMonthlySummaries(JSON.parse(savedSummaries));
    if (savedThresholds) setThresholds(JSON.parse(savedThresholds));
    
    setIsLoaded(true);
    if (cloudId) fetchFromCloud(cloudId);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('et_editors', JSON.stringify(editors));
      localStorage.setItem('et_entries', JSON.stringify(entries));
      localStorage.setItem('et_winners', JSON.stringify(winningVideos));
      localStorage.setItem('et_summaries', JSON.stringify(monthlySummaries));
      localStorage.setItem('et_thresholds', JSON.stringify(thresholds));
      
      if (cloudId) {
        if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
        setSyncStatus('syncing');
        syncTimeoutRef.current = window.setTimeout(pushToCloud, 2000);
      }
    }
  }, [editors, entries, winningVideos, monthlySummaries, thresholds, isLoaded, cloudId]);

  const pushToCloud = async () => {
    if (!cloudId) return;
    try {
      const data = { editors, entries, winningVideos, monthlySummaries, thresholds };
      const res = await fetch(`${API_URL}/${cloudId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
        body: JSON.stringify(data)
      });
      if (res.ok) setSyncStatus('synced');
      else setSyncStatus('error');
    } catch (e) { setSyncStatus('error'); }
  };

  const fetchFromCloud = async (id: string) => {
    setSyncStatus('syncing');
    try {
      const res = await fetch(`${API_URL}/${id}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });
      if (res.ok) {
        const { record } = await res.json();
        if (record) {
          setEditors(record.editors || DEFAULT_EDITORS);
          setEntries(record.entries || []);
          setWinningVideos(record.winningVideos || []);
          setMonthlySummaries(record.monthlySummaries || []);
          setThresholds(record.thresholds || DEFAULT_THRESHOLDS);
          setSyncStatus('synced');
        }
      } else setSyncStatus('error');
    } catch (e) { setSyncStatus('error'); }
  };

  const handleCreateNewCloud = async () => {
    setSyncStatus('syncing');
    try {
      const data = { editors, entries, winningVideos, monthlySummaries, thresholds };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY, 'X-Bin-Private': 'true' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        const newId = result.metadata.id;
        setCloudId(newId);
        localStorage.setItem('et_cloud_id', newId);
        setSyncStatus('synced');
        alert("¡ID de Nube generado con éxito!");
      } else {
        alert("Error al crear la nube. Revisa la MASTER_KEY o el servicio JSONBin.");
        setSyncStatus('error');
      }
    } catch (e) { 
      alert("Error de conexión. Inténtalo de nuevo.");
      setSyncStatus('error'); 
    }
  };

  const handleExportData = () => {
    const data = { editors, entries, winningVideos, monthlySummaries, thresholds };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_editor_track_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.editors) {
        setEditors(data.editors);
        setEntries(data.entries || []);
        setWinningVideos(data.winningVideos || []);
        setMonthlySummaries(data.monthlySummaries || []);
        setThresholds(data.thresholds || DEFAULT_THRESHOLDS);
        alert("¡Datos importados con éxito!");
      }
    } catch (e) { alert("Formato de backup inválido."); }
  };

  // Fix: Added missing saveEntry function
  const saveEntry = (editorId: string, week: string, minutes: number, seconds: number) => {
    setEntries(prev => {
      const filtered = prev.filter(e => !(e.editorId === editorId && e.week === week));
      return [...filtered, { id: generateId(), editorId, week, minutes, seconds }];
    });
  };

  // Fix: Added missing saveWinningVideo function
  const saveWinningVideo = (video: WinningVideo | Omit<WinningVideo, 'id'>) => {
    setWinningVideos(prev => {
      if ('id' in video) {
        return prev.map(v => v.id === video.id ? video as WinningVideo : v);
      } else {
        return [...prev, { ...video, id: generateId() } as WinningVideo];
      }
    });
  };

  // Fix: Added missing deleteWinningVideo function
  const deleteWinningVideo = (id: string) => {
    setWinningVideos(prev => prev.filter(v => v.id !== id));
  };

  // Fix: Added missing updateManualWinners function
  const updateManualWinners = (editorId: string, month: string, count: number) => {
    setMonthlySummaries(prev => {
      const filtered = prev.filter(s => !(s.editorId === editorId && s.month === month));
      return [...filtered, { editorId, month, manualWinners: count }];
    });
  };

  // Fix: Added missing addEditor function
  const addEditor = (name: string) => {
    setEditors(prev => [...prev, { id: generateId(), name }]);
  };

  // Fix: Added missing deleteEditor function
  const deleteEditor = (id: string) => {
    setEditors(prev => prev.filter(e => e.id !== id));
  };

  // Fix: Added missing updateEditorName function
  const updateEditorName = (id: string, name: string) => {
    setEditors(prev => prev.map(e => e.id === id ? { ...e, name } : e));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeView={activeView} setView={setActiveView} syncStatus={syncStatus} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeView === 'tracking' && (
          <div className="space-y-12">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">Tracking Semanal</h2>
                {cloudId && <span className={`text-[10px] font-black px-3 py-1 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{syncStatus === 'synced' ? 'NUBE AL DÍA' : 'SYNC...'}</span>}
              </div>
              <TrackingTable editors={editors} entries={entries} thresholds={thresholds} onSave={saveEntry} />
            </div>
            <PerformanceTracking editors={editors} winningVideos={winningVideos} monthlySummaries={monthlySummaries} onSave={saveWinningVideo} onDelete={deleteWinningVideo} onUpdateManualWinners={updateManualWinners} />
          </div>
        )}
        {activeView === 'dashboard' && <StatsDashboard editors={editors} entries={entries} thresholds={thresholds} />}
        {activeView === 'settings' && <Settings editors={editors} thresholds={thresholds} cloudId={cloudId} syncStatus={syncStatus} onAdd={addEditor} onDelete={deleteEditor} onUpdate={updateEditorName} onUpdateThresholds={setThresholds} onConnectCloud={fetchFromCloud} onCreateNewCloud={handleCreateNewCloud} onDisconnectCloud={() => setCloudId(null)} onExport={handleExportData} onImport={handleImportData} />}
      </main>
      <footer className="py-8 text-center text-slate-400 text-xs font-semibold tracking-widest uppercase">EDITOR TRACK &bull; {new Date().getFullYear()}</footer>
    </div>
  );
};
export default App;
