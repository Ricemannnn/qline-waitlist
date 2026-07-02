import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, UtensilsCrossed } from 'lucide-react';

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

const ALLERGY_LABELS = {
  'peanut': 'Peanut', 'tree-nut': 'Tree Nut', 'shellfish': 'Shellfish',
  'fish': 'Fish', 'egg': 'Egg', 'milk': 'Milk', 'soy': 'Soy',
  'wheat': 'Wheat', 'sesame': 'Sesame', 'alcohol': 'Alcohol',
  'garlic': 'Garlic', 'onion': 'Onion', 'nightshades': 'Nightshades',
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

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Mild': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'Moderate': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
    case 'Severe': return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const DietarySummaryBadge = ({ dietary_restrictions = [], allergies = [], other_needs = '', guestName = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const popoverRef = useRef(null);

  const restrictions = Array.isArray(dietary_restrictions) ? dietary_restrictions : [];
  const allergyList = Array.isArray(allergies) ? allergies : [];

  const hasDietary = restrictions.length > 0;
  const hasAllergies = allergyList.length > 0;
  const hasInfo = hasDietary || hasAllergies || other_needs;

  // Close on click outside
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  if (!hasInfo) return null;

  const getIcon = (code) => DIETARY_ICONS[code] || code.slice(0, 2).toUpperCase();
  const hasSevereAllergy = allergyList.some(
    (a) => (typeof a === 'object' ? a.severity === 'Severe' : false)
  );

  return (
    <div className="relative inline-flex" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all hover:scale-105 ${
          hasSevereAllergy
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400'
            : hasAllergies
            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400'
            : 'bg-[#F36D21]/5 border-[#F36D21]/20 text-[#F36D21]'
        }`}
        title="Dietary info"
      >
        {/* Restriction icons - first 2-3 */}
        {restrictions.slice(0, 3).map((code) => (
          <span key={code} className={`w-4 h-4 rounded flex items-center justify-center text-[7px] font-black ${DIETARY_COLORS[getIcon(code)] || 'bg-gray-100 text-gray-600'}`}>
            {getIcon(code)}
          </span>
        ))}
        {restrictions.length > 3 && (
          <span className="text-[8px] opacity-60">+{restrictions.length - 3}</span>
        )}

        {/* Allergy warning */}
        {hasAllergies && (
          <AlertTriangle size={12} className={hasSevereAllergy ? 'text-red-500' : 'text-orange-500'} />
        )}
      </button>

      {/* Expanded popover */}
      {isExpanded && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-4">
            {/* Header */}
            {guestName && (
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">{guestName}</p>
            )}

            {/* Dietary restrictions */}
            {restrictions.length > 0 && (
              <div className="mb-2">
                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Dietary</p>
                <div className="flex flex-wrap gap-1.5">
                  {restrictions.map((code) => (
                    <span key={code} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${DIETARY_COLORS[getIcon(code)] || 'bg-gray-100 text-gray-600'}`}>
                      {getIcon(code)} {DIETARY_LABELS[code] || code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {allergyList.length > 0 && (
              <div className={restrictions.length > 0 ? 'mt-2' : ''}>
                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {allergyList.map((a) => {
                    const code = typeof a === 'string' ? a : a.code;
                    const obj = typeof a === 'object' ? a : null;
                    const severity = obj?.severity || 'Moderate';
                    const colors = getSeverityColor(severity);
                    return (
                      <span key={code} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors}`}>
                        {severity === 'Severe' && '⚠️ '}
                        {ALLERGY_LABELS[code] || code}
                        {obj?.epipen && '💉'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other needs */}
            {other_needs && (
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                {other_needs}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DietarySummaryBadge;