import React, { useState } from 'react';
import { UtensilsCrossed, Plus, X } from 'lucide-react';

const PRIMARY_RESTRICTIONS = [
  { code: 'gluten-free', label: 'Gluten-Free', icon: 'GF' },
  { code: 'vegan', label: 'Vegan', icon: 'VG' },
  { code: 'vegetarian', label: 'Vegetarian', icon: 'V' },
  { code: 'pescatarian', label: 'Pescatarian', icon: 'P' },
  { code: 'dairy-free', label: 'Dairy-Free', icon: 'DF' },
  { code: 'soy-free', label: 'Soy-Free', icon: 'SF' },
  { code: 'nut-free', label: 'Nut-Free', icon: 'NF' },
  { code: 'halal', label: 'Halal', icon: 'HL' },
  { code: 'kosher', label: 'Kosher', icon: 'KS' },
];

const SECONDARY_RESTRICTIONS = [
  { code: 'low-sodium', label: 'Low-Sodium', icon: 'LS' },
  { code: 'low-carb', label: 'Low-Carb', icon: 'LC' },
  { code: 'keto', label: 'Keto', icon: 'KT' },
  { code: 'paleo', label: 'Paleo', icon: 'PL' },
];

const DietarySelector = ({ value = [], onChange, otherNeeds = '', onOtherNeedsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];

  const toggleRestriction = (code) => {
    const next = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];
    onChange(next);
  };

  const removeRestriction = (code) => {
    onChange(selected.filter((c) => c !== code));
  };

  const getIcon = (code) => {
    const all = [...PRIMARY_RESTRICTIONS, ...SECONDARY_RESTRICTIONS];
    return all.find((r) => r.code === code)?.icon || code.slice(0, 2).toUpperCase();
  };

  const getLabel = (code) => {
    const all = [...PRIMARY_RESTRICTIONS, ...SECONDARY_RESTRICTIONS];
    return all.find((r) => r.code === code)?.label || code;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <UtensilsCrossed size={12} /> Dietary Restrictions
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-black text-[#F36D21] uppercase tracking-widest hover:underline"
        >
          {isOpen ? 'Done' : selected.length > 0 ? `Edit (${selected.length})` : 'Add'}
        </button>
      </div>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F36D21]/10 text-[#F36D21] rounded-xl text-xs font-bold border border-[#F36D21]/20"
            >
              <span className="w-5 h-5 rounded-lg bg-[#F36D21] text-white flex items-center justify-center text-[9px] font-black">
                {getIcon(code)}
              </span>
              {getLabel(code)}
              <button
                type="button"
                onClick={() => removeRestriction(code)}
                className="ml-0.5 hover:bg-[#F36D21]/20 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Expandable selector */}
      {isOpen && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Primary */}
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Primary Dietary Restrictions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRIMARY_RESTRICTIONS.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => toggleRestriction(r.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selected.includes(r.code)
                      ? 'bg-[#F36D21] text-white border-[#F36D21] shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#F36D21]/40 hover:text-[#F36D21]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black ${
                    selected.includes(r.code)
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {r.icon}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary */}
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Secondary Preferences</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECONDARY_RESTRICTIONS.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => toggleRestriction(r.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selected.includes(r.code)
                      ? 'bg-[#F36D21] text-white border-[#F36D21] shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#F36D21]/40 hover:text-[#F36D21]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black ${
                    selected.includes(r.code)
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {r.icon}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Other needs */}
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Other Dietary Needs</p>
            <textarea
              placeholder="e.g. Must be prepared without certain ingredients..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all resize-none"
              rows={2}
              value={otherNeeds}
              onChange={(e) => onOtherNeedsChange?.(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DietarySelector;