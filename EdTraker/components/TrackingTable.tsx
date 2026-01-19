
import React, { useState } from 'react';
import { Editor, WeeklyEntry, Thresholds } from '../types';
import { parseDuration, formatDuration, getCurrentWeek } from '../utils';
import WeekPicker from './WeekPicker';

interface TrackingTableProps {
  editors: Editor[];
  entries: WeeklyEntry[];
  thresholds: Thresholds;
  onSave: (editorId: string, week: string, minutes: number, seconds: number) => void;
}

const TrackingTable: React.FC<TrackingTableProps> = ({ editors, entries, thresholds, onSave }) => {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  const getEntryValue = (editorId: string) => {
    const entry = entries.find(e => e.editorId === editorId && e.week === selectedWeek);
    if (!entry) return "";
    return formatDuration(entry.minutes, entry.seconds);
  };

  const handleBlur = (editorId: string, value: string) => {
    const { min, sec } = parseDuration(value);
    onSave(editorId, selectedWeek, min, sec);
  };

  return (
    <div className="w-full">
      <div className="p-8 bg-white flex flex-col md:flex-row md:items-end gap-6">
        <WeekPicker value={selectedWeek} onChange={setSelectedWeek} />
        <div className="flex gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sin Datos / 0:00</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Esperado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-300"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sobresaliente</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="p-6 border-b border-slate-100 font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] w-1/4">
                Periodo
              </th>
              {editors.map(editor => (
                <th key={editor.id} className="p-6 border-b border-slate-100 font-bold text-slate-600 text-[11px] tracking-tight text-center">
                  {editor.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-6 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-800">
                    {selectedWeek ? `Semana ${selectedWeek.split('-W')[1]}` : "Sin selección"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {selectedWeek ? selectedWeek.split('-W')[0] : ""}
                  </span>
                </div>
              </td>
              {editors.map(editor => (
                <td key={editor.id} className="p-6 border-b border-slate-100 text-center">
                  <EditableCell 
                    initialValue={getEntryValue(editor.id)}
                    thresholds={thresholds}
                    onSave={(val) => handleBlur(editor.id, val)}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-8 bg-slate-50/50 flex items-center gap-2">
        <div className="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center">
          <span className="text-indigo-500 font-bold text-[10px]">i</span>
        </div>
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          Formato MM:SS. Celdas en gris indican 0:00 o vacío.
        </p>
      </div>
    </div>
  );
};

interface EditableCellProps {
  initialValue: string;
  thresholds: Thresholds;
  onSave: (val: string) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ initialValue, thresholds, onSave }) => {
  const [val, setVal] = useState(initialValue);
  
  React.useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const { min, sec } = parseDuration(val);
  const isZero = min === 0 && sec === 0;
  
  let bgColor = "bg-slate-50";
  let borderColor = "border-slate-200";
  let textColor = "text-slate-400";

  if (!isZero && val.trim() !== "") {
    if (min >= thresholds.outstanding) {
      bgColor = "bg-indigo-50";
      borderColor = "border-indigo-200";
      textColor = "text-indigo-700";
    } else if (min >= thresholds.target) {
      bgColor = "bg-emerald-50";
      borderColor = "border-emerald-200";
      textColor = "text-emerald-700";
    } else {
      bgColor = "bg-red-50";
      borderColor = "border-red-200";
      textColor = "text-red-700";
    }
  }

  return (
    <div className="flex justify-center">
      <input 
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave(val)}
        placeholder="0:00"
        className={`w-28 text-center py-3 px-2 border-2 ${borderColor} ${bgColor} ${textColor} hover:scale-105 focus:scale-105 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl transition-all outline-none font-black text-xl shadow-sm`}
      />
    </div>
  );
};

export default TrackingTable;
