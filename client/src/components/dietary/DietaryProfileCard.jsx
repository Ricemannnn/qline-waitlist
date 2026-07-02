import React, { useState } from 'react';
import { AlertTriangle, UtensilsCrossed, Clock, StickyNote, Save } from 'lucide-react';

const DIETARY_ICONS = {
  'gluten-free': 'GF', 'vegan': 'VG', 'vegetarian': 'V', 'pescatarian': 'P',
  'dairy-free': 'DF', 'soy-free': 'SF', 'nut-free': 'NF', 'halal': 'HL',
  'kosher': 'KS', 'low-sodium': 'LS', 'low-carb': 'LC', 'keto': 'KT', 'paleo': 'PL',
};

const DIETARY_LABELS = {
  'gluten-free': 'Gluten-Free', 'vegan': 'Vegan', 'vegetarian': 'Vegetarian',
  'pescatarian': 'Pescatarian', 'dairy-free': 'Dairy-Free', 'soy-free': 'Soy-Free',
  'nut-free': 'Nut-Free', 'halal': 'Halal', 'kosher': 'Kosher',
  'low-sodium': 'Low-Sodium', 'low-carb': 'Low-Carb', 'keto': 'Keto', 'paleo': 'Paleo',
};

const DIETARY_COLORS = {
  GF: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  VG: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  V: 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
  P: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  DF: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  SF: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  NF: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  HL: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  KS: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  LS: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  LC: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  KT: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  PL: 'bg-fuchsia-100 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400',
};

const ALLERGY_LABELS = {
  'peanut': 'Peanut', 'tree-nut': 'Tree Nut', 'shellfish': 'Shellfish',
  'fish': 'Fish', 'egg': 'Egg', 'milk': 'Milk', 'soy': 'Soy',
  'wheat': 'Wheat', 'sesame': 'Sesame', 'alcohol': 'Alcohol',
  'garlic': 'Garlic', 'onion': 'Onion', 'nightshades': 'Nightshades',
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Mild': return { dot: 'bg-green-500', badge: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50' };
    case 'Moderate': return { dot: 'bg-orange-500', badge: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' };
    case 'Severe': return { dot: 'bg-red-500', badge: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50' };
    default: return { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
};

const DietaryProfileCard = ({ 
  data, 
  editable = false, 
  onSaveNotes,
  compact = false 
}) => {
  const [restaurantNotes, setRestaurantNotes] = useState(data?.restaurant_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!data) return null;

  const {
    guest_name,
    dietary_restrictions = [],
    allergies = [],
    other_needs = '',
    restaurant_notes: existingNotes,
    last_updated,
  } = data;

  const restrictions = Array.isArray(dietary_restrictions) ? dietary_restrictions : [];
  const allergyList = Array.isArray(allergies) ? allergies : [];

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onSaveNotes?.(restaurantNotes);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getIcon = (code) => DIETARY_ICONS[code] || code.slice(0, 2).toUpperCase();

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        {restrictions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {restrictions.slice(0, 4).map((code) => (
              <span key={code} className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${DIETARY_COLORS[getIcon(code)] || 'bg-gray-100 text-gray-600'}`}>
                {getIcon(code)}
              </span>
            ))}
            {restrictions.length > 4 && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500">
                +{restrictions.length - 4}
              </span>
            )}
          </div>
        )}
        {allergyList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allergyList.map((a) => {
              const code = typeof a === 'string' ? a : a.code;
              const severity = typeof a === 'object' ? a.severity : 'Moderate';
              const colors = getSeverityColor(severity);
              return (
                <span key={code} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${colors.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                  {ALLERGY_LABELS[code] || code}
                  {typeof a === 'object' && a.epipen && '💉'}
                </span>
              );
            })}
          </div>
        )}
        {!restrictions.length && !allergyList.length && (
          <p className="text-xs text-gray-400 font-medium">No dietary preferences recorded</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
            <UtensilsCrossed size={20} className="text-[#F36D21]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Dietary Profile</h3>
            {guest_name && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{guest_name}</p>
            )}
          </div>
        </div>
        {last_updated && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
            <Clock size={10} /> {new Date(last_updated).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Dietary Restrictions */}
        {restrictions.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Dietary Restrictions</p>
            <div className="flex flex-wrap gap-2">
              {restrictions.map((code) => (
                <span key={code} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${DIETARY_COLORS[getIcon(code)] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black bg-white/50">
                    {getIcon(code)}
                  </span>
                  {DIETARY_LABELS[code] || code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergies */}
        {allergyList.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Allergies</p>
            <div className="space-y-2">
              {allergyList.map((a) => {
                const code = typeof a === 'string' ? a : a.code;
                const obj = typeof a === 'object' ? a : null;
                const severity = obj?.severity || 'Moderate';
                const colors = getSeverityColor(severity);
                return (
                  <div key={code} className={`flex items-center justify-between p-3 rounded-xl border ${colors.badge}`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} />
                      <span className="text-xs font-bold">{ALLERGY_LABELS[code] || code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.dot === 'bg-green-500' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : colors.dot === 'bg-orange-500' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : 'bg-red-100 dark:bg-red-900/20 text-red-600'}`}>
                        {severity}
                      </span>
                      {obj?.crossContamination && (
                        <span className="text-[10px] text-amber-600 font-bold" title="Cross-contamination sensitive">⚡</span>
                      )}
                      {obj?.epipen && (
                        <span className="text-[10px]" title="EpiPen carried">💉</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other needs */}
        {other_needs && (
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Other Needs</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              {other_needs}
            </p>
          </div>
        )}

        {/* No data state */}
        {!restrictions.length && !allergyList.length && !other_needs && (
          <div className="text-center py-6">
            <UtensilsCrossed size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No dietary information recorded</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Edit to add dietary preferences and allergies</p>
          </div>
        )}

        {/* Restaurant Notes - Editable */}
        {editable && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <StickyNote size={12} /> Restaurant Notes
              </p>
              {existingNotes !== restaurantNotes && (
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="text-[10px] font-black text-[#F36D21] uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <Save size={12} /> {isSavingNotes ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
            <textarea
              value={restaurantNotes}
              onChange={(e) => setRestaurantNotes(e.target.value)}
              placeholder="Internal notes for the kitchen & hosting team..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all resize-none"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryProfileCard;