import React from 'react';

const SettingsTab = ({ 
  merchantName, 
  settings, 
  setSettings, 
  onSave, 
  isSaving 
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm font-medium">Configure your restaurant profile</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-y-auto">
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Restaurant Name</label>
            <input 
              type="text" 
              value={merchantName} 
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none cursor-not-allowed" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Wait Time (mins)</label>
              <input 
                type="number" 
                value={settings.wait_time_per_party} 
                onChange={(e) => setSettings({ ...settings, wait_time_per_party: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Total Tables</label>
              <input 
                type="number" 
                value={settings.total_tables} 
                onChange={(e) => setSettings({ ...settings, total_tables: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Menu Link (Optional)</label>
            <input 
              type="url" 
              value={settings.menu_url || ''} 
              onChange={(e) => setSettings({ ...settings, menu_url: e.target.value })}
              placeholder="https://your-restaurant.com/menu"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
            />
            <p className="text-[10px] text-gray-400 mt-1 ml-1 uppercase font-bold tracking-widest">Guests can view this while waiting</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">SMS Message Template</label>
            <textarea 
              value={settings.sms_template}
              onChange={(e) => setSettings({ ...settings, sms_template: e.target.value })}
              placeholder="Hi {guest_name}, your table at {restaurant_name} is ready!"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21] h-32"
            ></textarea>
            <p className="text-xs text-gray-400 mt-2">Available placeholders: <code>{'{guest_name}'}</code>, <code>{'{restaurant_name}'}</code></p>
          </div>
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#F36D21] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
