
import React, { useState } from 'react';
import { Editor, Thresholds, SyncStatus } from '../types';

interface SettingsProps {
  editors: Editor[];
  thresholds: Thresholds;
  cloudId: string | null;
  syncStatus: SyncStatus;
  onAdd: (name: string) => void;
  onDelete: (id: string, name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onUpdateThresholds: (t: Thresholds) => void;
  onConnectCloud: (id: string) => void;
  onCreateNewCloud: () => void;
  onDisconnectCloud: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  editors, thresholds, cloudId, syncStatus,
  onAdd, onDelete, onUpdate, onUpdateThresholds,
  onConnectCloud, onCreateNewCloud, onDisconnectCloud,
  onExport, onImport
}) => {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [inputCloudId, setInputCloudId] = useState("");
  const [importJson, setImportJson] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) { onAdd(newName.trim()); setNewName(""); }
  };

  const handleStartEdit = (editor: Editor) => {
    setEditingId(editor.id);
    setEditValue(editor.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      onUpdate(editingId, editValue.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirmDeleteId === id) { 
      onDelete(id, name); 
      setConfirmDeleteId(null); 
    }
    else { 
      setConfirmDeleteId(id); 
      setTimeout(() => setConfirmDeleteId(null), 4000); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cloud Sync */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sincronización</h3>
          <p className="text-sm text-slate-400 font-medium mb-8">Accede desde cualquier PC con tu ID.</p>

          {!cloudId ? (
            <div className="space-y-6">
              <button 
                onClick={onCreateNewCloud} 
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-all active:scale-95"
              >
                {syncStatus === 'syncing' ? 'PROCESANDO...' : 'GENERAR NUEVO ID DE NUBE'}
              </button>
              <div className="relative py-4 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative bg-white px-2 text-[10px] text-slate-300 font-black uppercase">O CONECTA UNO</span>
              </div>
              <div className="space-y-3">
                <input type="text" value={inputCloudId} onChange={(e) => setInputCloudId(e.target.value)} placeholder="ID existente (ej: 65f...)" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold tracking-widest outline-none focus:border-indigo-500" />
                <button onClick={() => inputCloudId && onConnectCloud(inputCloudId)} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">CONECTAR</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] text-center border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">TU ID ACTIVO</span>
                <code className="text-xl font-black text-indigo-600 block mb-4 break-all px-2">{cloudId}</code>
                <button onClick={() => {navigator.clipboard.writeText(cloudId!); alert("ID Copiado");}} className="text-[10px] font-black text-indigo-500 uppercase underline">Copiar para otra PC</button>
              </div>
              <button onClick={onDisconnectCloud} className="w-full border-2 border-red-50 text-red-400 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-50">Desconectar</button>
            </div>
          )}
        </div>

        {/* Backup Manual */}
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl flex flex-col">
          <h3 className="text-2xl font-black tracking-tight mb-2">Backup Manual</h3>
          <p className="text-sm text-slate-400 font-medium mb-8">Exporta tus datos por seguridad.</p>
          <div className="space-y-4">
            <button onClick={onExport} className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Exportar JSON</button>
            <div className="pt-4 border-t border-white/10">
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder="Pega aquí un backup..." className="w-full bg-black/30 rounded-xl p-4 text-[10px] font-mono mb-2 outline-none h-20 text-indigo-200" />
              <button onClick={() => onImport(importJson)} className="w-full bg-indigo-500 text-white py-3 rounded-xl font-black text-[10px] uppercase">Importar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de Equipo */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Gestionar Editores</h3>
        <p className="text-sm text-slate-400 font-medium mb-8">Agrega, renombra o elimina miembros de tu equipo.</p>
        
        <form onSubmit={handleAdd} className="flex gap-2 mb-10">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del nuevo editor..." className="flex-grow px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700" />
          <button type="submit" className="bg-indigo-600 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Añadir</button>
        </form>

        <div className="space-y-3">
          {editors.map(editor => (
            <div key={editor.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${editingId === editor.id ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
              
              {editingId === editor.id ? (
                <div className="flex-grow flex items-center gap-3">
                  <input 
                    autoFocus
                    type="text" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    className="flex-grow bg-white border-2 border-indigo-500 rounded-xl px-4 py-2 font-black text-slate-800 outline-none"
                  />
                  <button onClick={handleSaveEdit} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Guardar</button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 text-[10px] font-black uppercase px-2">Cancelar</button>
                </div>
              ) : (
                <>
                  <span className="font-black text-slate-700 text-lg">{editor.name}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartEdit(editor)}
                      className="px-4 py-2 bg-white border border-slate-300 text-[10px] font-black uppercase text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(editor.id, editor.name)} 
                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all border ${confirmDeleteId === editor.id ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'}`}
                    >
                      {confirmDeleteId === editor.id ? '¿BORRAR TODA SU DATA?' : 'BORRAR'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {editors.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No hay editores registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Settings;
