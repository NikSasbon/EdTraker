
import React from 'react';
import { ViewType, SyncStatus } from '../types';

interface NavbarProps {
  activeView: ViewType;
  setView: (view: ViewType) => void;
  syncStatus: SyncStatus;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView, syncStatus }) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Editor Track
            </span>
            {syncStatus !== 'local' && (
              <div className="ml-2 hidden sm:flex items-center" title={syncStatus === 'synced' ? 'Sincronizado' : 'Sincronizando...'}>
                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
              </div>
            )}
          </div>

          <div className="flex space-x-1 sm:space-x-4">
            <button
              onClick={() => setView('tracking')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'tracking' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tracking
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'settings' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Configuración
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
