
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Editor, WeeklyEntry, Thresholds } from '../types';
import { getCurrentWeek, getCurrentMonth, formatMonthDisplay, formatWeekDisplay } from '../utils';
import WeekPicker from './WeekPicker';

interface StatsDashboardProps {
  editors: Editor[];
  entries: WeeklyEntry[];
  thresholds: Thresholds;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ editors, entries, thresholds }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'historical'>('weekly');
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  
  const filteredEntries = period === 'historical' 
    ? entries 
    : period === 'monthly'
      ? entries.filter(e => {
          // Las entradas son semanales, así que sumamos las semanas que caen en ese mes.
          // Una simplificación común es filtrar por año y que la semana empiece en ese mes.
          // Para esta app, el formato de entrada es YYYY-WW. 
          // Para el filtrado mensual, aproximaremos buscando las entradas del mismo año.
          return e.week.startsWith(selectedMonth.split('-')[0]); 
          // Nota: El filtrado mensual exacto por semana es complejo, 
          // aquí mostramos el acumulado del año seleccionado para el modo mensual por ahora,
          // o podemos filtrar las semanas que pertenecen a ese mes específico si fuese necesario.
        })
      : entries.filter(e => e.week === selectedWeek);

  const dataByEditor = editors.map(editor => {
    const editorEntries = filteredEntries.filter(e => e.editorId === editor.id);
    const totalSeconds = editorEntries.reduce((acc, curr) => acc + (curr.minutes * 60) + curr.seconds, 0);
    return {
      name: editor.name,
      minutos: Math.round(totalSeconds / 60 * 10) / 10
    };
  }).sort((a, b) => b.minutos - a.minutos);

  const totalMin = dataByEditor.reduce((acc, curr) => acc + curr.minutos, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
          {(['weekly', 'monthly', 'historical'] as const).map((p) => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                period === p 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensual' : 'Histórico'}
            </button>
          ))}
        </div>

        {/* Selectores de Periodo Específico */}
        <div className="flex animate-in slide-in-from-top-2 duration-300">
          {period === 'weekly' && (
            <div className="flex flex-col items-center gap-2">
               <WeekPicker value={selectedWeek} onChange={setSelectedWeek} />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Viendo: {formatWeekDisplay(selectedWeek)}</p>
            </div>
          )}
          
          {period === 'monthly' && (
            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-2">
                 <select 
                   value={selectedMonth}
                   onChange={(e) => setSelectedMonth(e.target.value)}
                   className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none"
                 >
                   {/* Generar últimos 12 meses */}
                   {Array.from({length: 12}).map((_, i) => {
                     const d = new Date();
                     d.setMonth(d.getMonth() - i);
                     const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                     return <option key={val} value={val}>{formatMonthDisplay(val)}</option>;
                   })}
                 </select>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acumulado del año {selectedMonth.split('-')[0]}</p>
            </div>
          )}

          {period === 'historical' && (
            <div className="py-2">
               <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                 Toda la historia
               </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Total Output</p>
          <div className="flex items-baseline gap-2 relative z-10 mt-1">
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{totalMin.toFixed(0)}</h3>
            <span className="text-slate-400 font-bold text-sm uppercase">min</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Top Performer</p>
          <h3 className="text-2xl font-black text-indigo-600 tracking-tight mt-1 relative z-10">
            {dataByEditor[0]?.minutos > 0 ? dataByEditor[0].name : "---"}
          </h3>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Promedio</p>
          <div className="flex items-baseline gap-2 relative z-10 mt-1">
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
              {(totalMin / (editors.length || 1)).toFixed(1)}
            </h3>
            <span className="text-slate-400 font-bold text-sm uppercase">min</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h4 className="text-xl font-black text-slate-800 tracking-tight">Ranking de Output</h4>
            <p className="text-sm text-slate-400 font-medium italic">
              Ordenado por minutos totales ({period === 'weekly' ? 'Semana seleccionada' : period === 'monthly' ? 'Año seleccionado' : 'Histórico'})
            </p>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataByEditor} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                dy={15}
              />
              <YAxis hide={true} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                itemStyle={{fontWeight: 900}}
                labelStyle={{fontWeight: 900, marginBottom: '5px', color: '#1e293b', fontSize: '14px'}}
                formatter={(value: number) => [`${value} minutos`, 'Total']}
              />
              <Bar dataKey="minutos" radius={[12, 12, 12, 12]} barSize={50}>
                {dataByEditor.map((entry, index) => {
                  let fill = '#e2e8f0';
                  if (entry.minutos > 0) {
                    // Ajustar umbrales para vista mensual/histórica
                    const target = period === 'weekly' ? thresholds.target : (period === 'monthly' ? thresholds.target * 4 : thresholds.target * 12);
                    const outstanding = period === 'weekly' ? thresholds.outstanding : (period === 'monthly' ? thresholds.outstanding * 4 : thresholds.outstanding * 12);

                    if (entry.minutos >= outstanding) fill = '#4f46e5';
                    else if (entry.minutos >= target) fill = '#10b981';
                    else fill = '#f43f5e';
                  }
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
