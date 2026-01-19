
import React, { useState, useRef, useEffect } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, getWeekNumber, getWeekString, formatWeekDisplay } from '../utils';

interface WeekPickerProps {
  value: string;
  onChange: (weekStr: string) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const daysShort = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(newDate);
  };

  const handleWeekSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(getWeekString(selectedDate));
    setIsOpen(false);
  };

  const isWeekSelected = (day: number) => {
    if (!value) return false;
    const dateInWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return getWeekString(dateInWeek) === value;
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    
    const rows = [];
    let cells = [];
    
    // Fill empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = isWeekSelected(day);
      
      cells.push(
        <td 
          key={day} 
          onClick={() => handleWeekSelect(day)}
          className={`p-2 text-center cursor-pointer text-sm relative transition-colors
            ${isSelected ? 'bg-indigo-600 text-white first:rounded-l-md last:rounded-r-md' : 'hover:bg-indigo-50 text-gray-700'}`}
        >
          {day}
        </td>
      );

      if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
        const weekNum = getWeekNumber(new Date(year, month, day));
        rows.push(
          <tr key={`row-${day}`} className={isSelected ? 'bg-indigo-600/10' : ''}>
            <td className="p-2 text-xs text-gray-400 font-medium text-center border-r border-gray-100">
              {weekNum}
            </td>
            {cells}
            {day === daysInMonth && cells.length < 8 && Array(8 - cells.length).fill(null).map((_, i) => (
              <td key={`empty-end-${i}`} className="p-2"></td>
            ))}
          </tr>
        );
        cells = [];
      }
    }

    return rows;
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div className="flex flex-col space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Semana</label>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-64 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-indigo-400 transition-all"
        >
          <span className="text-gray-700 font-medium">
            {value ? formatWeekDisplay(value) : "Seleccionar Semana"}
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 w-80">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {monthNames[viewDate.getMonth()]} de {viewDate.getFullYear()} ▾
            </button>
            <div className="flex space-x-2">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
              </button>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          <div className="p-2">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-[10px] font-bold text-gray-400 uppercase border-r border-gray-100">Semana</th>
                  {daysShort.map(d => (
                    <th key={d} className="p-1 text-[10px] font-bold text-gray-400 uppercase">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderCalendar()}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between">
            <button 
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Borrar
            </button>
            <button 
              onClick={() => { onChange(getWeekString(new Date())); setIsOpen(false); }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Esta semana
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekPicker;
