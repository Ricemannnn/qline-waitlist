import React from 'react';
import { Layout, Plus } from 'lucide-react';

const TablesTab = ({ tables, onAddClick, onUpdateStatus }) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Mapping</h1>
          <p className="text-gray-500 text-sm font-medium">Floor plan and table status</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
        >
          <Plus className="w-5 h-5" /> Add Table
        </button>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No tables defined yet.</p>
              <p className="text-sm">Click 'Add Table' to start building your floor plan.</p>
            </div>
          ) : (
            tables.map(table => (
              <div 
                key={table.id}
                className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  table.status === 'available' ? 'bg-green-50 border-green-100 hover:border-green-300' :
                  table.status === 'occupied' ? 'bg-orange-50 border-orange-100 hover:border-orange-300' :
                  'bg-gray-50 border-gray-100 hover:border-gray-300'
                }`}
                onClick={() => {
                  const nextStatus = table.status === 'available' ? 'occupied' : 'available';
                  onUpdateStatus(table.id, nextStatus);
                }}
              >
                <p className={`font-black text-xl ${
                  table.status === 'available' ? 'text-green-600' :
                  table.status === 'occupied' ? 'text-orange-600' : 'text-gray-600'
                }`}>{table.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seats {table.capacity}</p>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  table.status === 'available' ? 'bg-green-200 text-green-700' :
                  table.status === 'occupied' ? 'bg-orange-200 text-orange-700' : 'bg-gray-200 text-gray-700'
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
