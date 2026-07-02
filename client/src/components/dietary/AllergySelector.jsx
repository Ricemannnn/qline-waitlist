import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const COMMON_ALLERGIES = [
  { code: 'peanut', label: 'Peanut' },
  { code: 'tree-nut', label: 'Tree Nut' },
  { code: 'shellfish', label: 'Shellfish' },
  { code: 'fish', label: 'Fish' },
  { code: 'egg', label: 'Egg' },
  { code: 'milk', label: 'Milk' },
  { code: 'soy', label: 'Soy' },
  { code: 'wheat', label: 'Wheat' },
  { code: 'sesame', label: 'Sesame' },
];

const OTHER_ALLERGIES = [
  { code: 'alcohol', label: 'Alcohol' },
  { code: 'garlic', label: 'Garlic' },
  { code: 'onion', label: 'Onion' },
  { code: 'nightshades', label: 'Nightshades' },
];

const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];

const AllergySelector = ({ value = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const allergies = Array.isArray(value) ? value : [];

  const getAllergyObj = (code) => {
    const existing = allergies.find((a) => (typeof a === 'string' ? a : a.code) === code);
    if (typeof existing === 'object' && existing !== null) return existing;
    if (typeof existing === 'string') return { code: existing, severity: 'Moderate', crossContamination: false, epipen: false };
    return null;
  };

  const isSelected = (code) => {
    return allergies.some((a) => (typeof a === 'string' ? a : a.code) === code);
  };

  const toggleAllergy = (code) => {
    if (isSelected(code)) {
      onChange(allergies.filter((a) => (typeof a === 'string' ? a : a.code) !== code));
    } else {
      onChange([...allergies, { code, severity: 'Moderate', crossContamination: false, epipen: false }]);
    }
  };

  const updateAllergyProp = (code, prop, val) => {
    onChange(allergies.map((a) => {
      const aCode = typeof a === 'string' ? a : a.code;
      if (aCode === code) {
        if (typeof a === 'string') {
          return { code, severity: 'Moderate', crossContamination: false, epipen: false, [prop]: val };
        }
        return { ...a, [prop]: val };
      }
      return a;
    }));
  };

  const removeAllergy = (code) => {
    onChange(allergies.filter((a) => (typeof a === 'string' ? a : a.code) !== code));
  };

  const getLabel = (code) => {
    const all = [...COMMON_ALLERGIES, ...OTHER_ALLERGIES];
    return all.find((a) => a.code === code)?.label || code;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Mild': return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800/50' };
      case 'Moderate': return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50' };
      case 'Severe': return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/50' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <AlertTriangle size={12} /> Allergies
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-black text-[#F36D21] uppercase tracking-widest hover:underline"
        >
          {isOpen ? 'Done' : allergies.length > 0 ? `Edit (${allergies.length})` : 'Add'}
        </button>
      </div>

      {/* Selected allergy badges */}
      {allergies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allergies.map((a) => {
            const code = typeof a === 'string' ? a : a.code;
            const obj = typeof a === 'object' ? a : null;
            const severity = obj?.severity || 'Moderate';
            const colors = getSeverityColor(severity);
            return (
              <span
                key={code}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                <AlertTriangle size={12} />
                {getLabel(code)}
                {obj?.epipen && <span className="text-[9px] opacity-70">💉</span>}
                <button
                  type="button"
                  onClick={() => removeAllergy(code)}
                  className="ml-0.5 hover:bg-black/10 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Expandable selector */}
      {isOpen && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Common Allergies */}
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Common Allergies</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_ALLERGIES.map((allergy) => {
                const selected = isSelected(allergy.code);
                const obj = getAllergyObj(allergy.code);
                return (
                  <div key={allergy.code} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleAllergy(allergy.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selected
                          ? 'bg-red-500 text-white border-red-500 shadow-sm'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400/40 hover:text-red-500'
                      }`}
                    >
                      <AlertTriangle size={14} />
                      {allergy.label}
                    </button>

                    {/* Expanded options when selected */}
                    {selected && obj && (
                      <div className="px-2 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 animate-in fade-in duration-150">
                        {/* Severity */}
                        <div className="flex gap-1">
                          {SEVERITY_OPTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateAllergyProp(allergy.code, 'severity', s)}
                              className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                                obj.severity === s
                                  ? `${getSeverityColor(s).bg} ${getSeverityColor(s).text} ${getSeverityColor(s).border}`
                                  : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={obj.crossContamination || false}
                              onChange={(e) => updateAllergyProp(allergy.code, 'crossContamination', e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-red-500 focus:ring-red-500/20"
                            />
                            Cross-contam sensitivity
                          </label>
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={obj.epipen || false}
                              onChange={(e) => updateAllergyProp(allergy.code, 'epipen', e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-red-500 focus:ring-red-500/20"
                            />
                            EpiPen carried 💉
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Allergies */}
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Other Allergies</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OTHER_ALLERGIES.map((allergy) => {
                const selected = isSelected(allergy.code);
                const obj = getAllergyObj(allergy.code);
                return (
                  <div key={allergy.code} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleAllergy(allergy.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selected
                          ? 'bg-red-500 text-white border-red-500 shadow-sm'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400/40 hover:text-red-500'
                      }`}
                    >
                      <AlertTriangle size={14} />
                      {allergy.label}
                    </button>

                    {/* Expanded options when selected */}
                    {selected && obj && (
                      <div className="px-2 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 animate-in fade-in duration-150">
                        <div className="flex gap-1">
                          {SEVERITY_OPTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateAllergyProp(allergy.code, 'severity', s)}
                              className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                                obj.severity === s
                                  ? `${getSeverityColor(s).bg} ${getSeverityColor(s).text} ${getSeverityColor(s).border}`
                                  : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={obj.crossContamination || false}
                              onChange={(e) => updateAllergyProp(allergy.code, 'crossContamination', e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-red-500 focus:ring-red-500/20"
                            />
                            Cross-contam sensitivity
                          </label>
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={obj.epipen || false}
                              onChange={(e) => updateAllergyProp(allergy.code, 'epipen', e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-red-500 focus:ring-red-500/20"
                            />
                            EpiPen carried 💉
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllergySelector;