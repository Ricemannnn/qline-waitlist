import React from 'react';
import { LayoutDashboard, Plus } from 'lucide-react';

const TablesTab = ({ tables, onAddClick, onUpdateStatus }) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Table Mapping</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Floor plan and table status</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
        >
          <Plus className="w-5 h-5" /> Add Table
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 overflow-auto transition-colors">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No tables defined yet.</p>
              <p className="text-sm">Click 'Add Table' to start building your floor plan.</p>
            </div>
          ) : (
            tables.map(table => (
              <div 
                key={table.id}
                className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  table.status === 'available' ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30 hover:border-green-300' :
                  table.status === 'occupied' ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 hover:border-orange-300' :
                  'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => {
                  const nextStatus = table.status === 'available' ? 'occupied' : 'available';
                  onUpdateStatus(table.id, nextStatus);
                }}
              >
                <p className={`font-black text-xl ${
                  table.status === 'available' ? 'text-green-600 dark:text-green-400' :
                  table.status === 'occupied' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'
                }`}>{table.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Seats {table.capacity}</p>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  table.status === 'available' ? 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  table.status === 'occupied' ? 'bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {table.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TablesTab;
