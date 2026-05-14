import React from 'react';
import { Plus, Users, LayoutDashboard, CheckCircle2, XCircle, Clock } from 'lucide-react';

const TablesTab = ({ tables, onAddClick, onUpdateStatus }) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Floor Plan</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Real-time Occupancy
          </p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#F36D21] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none"
        >
          <Plus className="w-6 h-6" strokeWidth={3} /> Add Table
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 overflow-y-auto scrollbar-hide">
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700 shadow-inner">
              <LayoutDashboard className="w-12 h-12 opacity-10" />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-2xl tracking-tight mb-2">No tables added</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto text-lg mb-8">Add your restaurant's physical tables to track occupancy and seating capacity.</p>
            <button 
              onClick={onAddClick}
              className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-10 py-4 rounded-[20px] font-black hover:scale-[1.05] transition-all"
            >
              Add Your First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => (
              <div 
                key={table.id} 
                className={`group relative p-6 rounded-[32px] border-2 transition-all duration-500 hover:scale-[1.02] ${
                  table.status === 'available' 
                    ? 'bg-green-50/20 dark:bg-green-950/10 border-green-100 dark:border-green-900/20 hover:border-green-400' 
                    : 'bg-red-50/20 dark:bg-red-950/10 border-red-100 dark:border-red-900/20 hover:border-red-400'
                }`}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-px rounded-[32px] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                  table.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:rotate-6 ${
                      table.status === 'available' 
                        ? 'bg-white dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800' 
                        : 'bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                    }`}>
                      <LayoutDashboard size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${
                        table.status === 'available' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {table.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                        <Users size={14} strokeWidth={3} />
                        <span className="text-xs font-black">{table.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 truncate">{table.name}</h3>
                  
                  <div className="flex gap-2">
                    {table.status === 'available' ? (
                      <button 
                        onClick={() => onUpdateStatus(table.id, 'occupied')}
                        className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-2xl font-black text-xs hover:scale-[1.05] transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                      >
                        Seat Table
                      </button>
                    ) : (
                      <button 
                        onClick={() => onUpdateStatus(table.id, 'available')}
                        className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 py-3 rounded-2xl font-black text-xs hover:border-green-500 hover:text-green-500 transition-all"
                      >
                        Mark Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesTab;
