import React from 'react';
import {
  WheatOff,
  Sprout,
  Leaf,
  Fish,
  MilkOff,
  Bean,
  NutOff,
  Flame,
  Apple,
  Syringe,
  ShieldAlert
} from 'lucide-react';

// ==========================================
// 1. Raw Icon Components & Custom Wrappers
// ==========================================

// Custom CrescentMoon and star icon for Halal
export const HalalRawIcon = ({ className, size = 16, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    <polygon points="19,5 20,7 22,7 20,8 21,10 19,9 17,10 18,8 16,7 18,7" fill="currentColor" stroke="none" />
  </svg>
);

// Custom Star of David icon for Kosher
export const StarOfDavidRawIcon = ({ className, size = 16, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polygon points="12,3 20,16 4,16" />
    <polygon points="12,21 20,8 4,8" />
  </svg>
);

// Custom SaltOff icon for Low-Sodium
export const SaltOffRawIcon = ({ className, size = 16, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 8h6M9 12h6M9 16h6" />
    <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M7.5 8h9a1.5 1.5 0 0 1 1.5 1.5v9.5a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-9.5A1.5 1.5 0 0 1 7.5 8Z" />
    <line x1="3" y1="21" x2="21" y2="3" />
  </svg>
);

// Custom BreadOff icon for Low-Carb
export const BreadOffRawIcon = ({ className, size = 16, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 18c-2 0-4-1-4-3v-4c0-3.5 3-5 5-5h10c2 0 5 1.5 5 5v4c0 2-2 3-4 3" />
    <path d="M2 13h20" />
    <line x1="3" y1="21" x2="21" y2="3" />
  </svg>
);

// Custom Soy-Free circle wrapper for Bean icon
export const SoyBeanRawIcon = ({ className, size = 16, ...props }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <Bean size={size} {...props} />
    <div className="absolute inset-0 border-2 border-amber-500 rounded-full scale-125 opacity-30" />
  </div>
);

// ==========================================
// 2. Mapping Dictionary
// ==========================================

export const DIETARY_ICONS = {
  'gluten-free': {
    label: 'GF',
    fullName: 'Gluten-Free',
    icon: WheatOff,
    badgeColor: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50',
    textColor: 'text-green-600 dark:text-green-400',
    rawColor: '#16a34a'
  },
  'vegan': {
    label: 'V',
    fullName: 'Vegan',
    icon: Sprout,
    badgeColor: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50',
    textColor: 'text-purple-600 dark:text-purple-400',
    rawColor: '#9333ea'
  },
  'vegetarian': {
    label: 'VG',
    fullName: 'Vegetarian',
    icon: Leaf,
    badgeColor: 'bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/50',
    textColor: 'text-teal-600 dark:text-teal-400',
    rawColor: '#0d9488'
  },
  'pescatarian': {
    label: 'P',
    fullName: 'Pescatarian',
    icon: Fish,
    badgeColor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50',
    textColor: 'text-blue-600 dark:text-blue-400',
    rawColor: '#2563eb'
  },
  'dairy-free': {
    label: 'DF',
    fullName: 'Dairy-Free',
    icon: MilkOff,
    badgeColor: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    rawColor: '#6366f1'
  },
  'soy-free': {
    label: 'SF',
    fullName: 'Soy-Free',
    icon: SoyBeanRawIcon,
    badgeColor: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
    textColor: 'text-amber-600 dark:text-amber-400',
    rawColor: '#d97706'
  },
  'nut-free': {
    label: 'NF',
    fullName: 'Nut-Free',
    icon: NutOff,
    badgeColor: 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50',
    textColor: 'text-orange-600 dark:text-orange-400',
    rawColor: '#ea580c'
  },
  'halal': {
    label: 'H',
    fullName: 'Halal',
    icon: HalalRawIcon,
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    rawColor: '#059669'
  },
  'kosher': {
    label: 'K',
    fullName: 'Kosher',
    icon: StarOfDavidRawIcon,
    badgeColor: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/50',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    rawColor: '#0891b2'
  },
  'low-sodium': {
    label: 'LS',
    fullName: 'Low-Sodium',
    icon: SaltOffRawIcon,
    badgeColor: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50',
    textColor: 'text-rose-600 dark:text-rose-400',
    rawColor: '#e11d48'
  },
  'low-carb': {
    label: 'LC',
    fullName: 'Low-Carb',
    icon: BreadOffRawIcon,
    badgeColor: 'bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/50',
    textColor: 'text-pink-600 dark:text-pink-400',
    rawColor: '#db2777'
  },
  'keto': {
    label: 'Keto',
    fullName: 'Keto',
    icon: Flame,
    badgeColor: 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50',
    textColor: 'text-violet-600 dark:text-violet-400',
    rawColor: '#7c3aed'
  },
  'paleo': {
    label: 'Paleo',
    fullName: 'Paleo',
    icon: Apple,
    badgeColor: 'bg-slate-50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-900/50',
    textColor: 'text-slate-600 dark:text-slate-400',
    rawColor: '#475569'
  }
};

// Allergy warning configuration
export const ALLERGY_WARNINGS = {
  default: {
    icon: ShieldAlert,
    badgeColor: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50',
    textColor: 'text-red-600 dark:text-red-400',
    symbol: '⚠️'
  },
  severe: {
    icon: ShieldAlert,
    badgeColor: 'bg-red-600 text-white border-red-700 shadow-md shadow-red-500/20',
    textColor: 'text-white font-extrabold animate-pulse',
    symbol: '🔴',
    pulsing: true
  },
  'cross-contamination': {
    icon: ShieldAlert,
    badgeColor: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    symbol: '⚠️'
  },
  epipen: {
    icon: Syringe,
    badgeColor: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50',
    textColor: 'text-orange-600 dark:text-orange-400',
    symbol: '💉'
  }
};

// ==========================================
// 3. Unified Primary Component (DietaryIcons)
// ==========================================

/**
 * DietaryIcons
 * 
 * Main component wrapper. Renders the appropriate badge style with code-matching color, 
 * matching icon component, and small label text.
 * 
 * @param {string} code - The dietary restriction code (e.g. 'gluten-free')
 * @param {string} size - Component size ('sm' or 'md')
 * @param {boolean} showLabel - Whether to display the text label badge side-by-side
 * @param {string} className - Optional Tailwind class override
 */
export const DietaryIcons = ({ code, size = "sm", showLabel = true, className = "" }) => {
  if (!code) return null;
  const config = DIETARY_ICONS[code.toLowerCase()];
  if (!config) return null;

  const IconComponent = config.icon;
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1.5";
  const iconSize = size === "sm" ? 12 : 16;
  const textClass = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-bold shadow-sm transition-all duration-200 ${config.badgeColor} ${config.textColor} ${padding} ${className}`}
      title={config.fullName}
    >
      <IconComponent size={iconSize} className="flex-shrink-0" />
      {showLabel && <span className={textClass}>{config.label}</span>}
    </span>
  );
};

// Also export as DietaryBadge for aliases / backwards compatibility
export const DietaryBadge = DietaryIcons;

// Default export makes importing direct as a component extremely clean
export default DietaryIcons;

// ==========================================
// 4. Individual Icon Component Wrappers
// ==========================================

export const GlutenFree = ({ code = "gluten-free", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const GlutenFreeIcon = GlutenFree;

export const Vegan = ({ code = "vegan", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const VeganIcon = Vegan;

export const Vegetarian = ({ code = "vegetarian", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const VegetarianIcon = Vegetarian;

export const Pescatarian = ({ code = "pescatarian", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const PescatarianIcon = Pescatarian;

export const DairyFree = ({ code = "dairy-free", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const DairyFreeIcon = DairyFree;

export const SoyFree = ({ code = "soy-free", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const SoyFreeIcon = SoyFree;

export const NutFree = ({ code = "nut-free", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const NutFreeIcon = NutFree;

export const Halal = ({ code = "halal", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const HalalIcon = Halal;

export const Kosher = ({ code = "kosher", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const KosherIcon = Kosher;

export const LowSodium = ({ code = "low-sodium", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const LowSodiumIcon = LowSodium;

export const LowCarb = ({ code = "low-carb", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const LowCarbIcon = LowCarb;

export const Keto = ({ code = "keto", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const KetoIcon = Keto;

export const Paleo = ({ code = "paleo", size = "sm", showLabel = true, className = "" }) => (
  <DietaryIcons code={code} size={size} showLabel={showLabel} className={className} />
);
export const PaleoIcon = Paleo;

// ==========================================
// 5. Specialty Allergy Warnings Component
// ==========================================

export const AllergyBadge = ({ allergyName, severity = "mild", isCrossSensitive = false, hasEpiPen = false, className = "" }) => {
  const isSevere = severity.toLowerCase() === 'severe';
  const warningConfig = isSevere ? ALLERGY_WARNINGS.severe : ALLERGY_WARNINGS.default;
  const IconComponent = warningConfig.icon;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Primary Allergy Badge */}
      <span
        className={`inline-flex items-center gap-1.5 border rounded-full font-bold py-1 px-3 text-xs transition-all duration-300 ${warningConfig.badgeColor} ${warningConfig.textColor}`}
      >
        <IconComponent size={14} className={isSevere ? "animate-bounce" : ""} />
        <span>{allergyName}</span>
        <span className="opacity-75 text-[10px] uppercase tracking-wider font-extrabold px-1 bg-black/5 dark:bg-white/10 rounded">
          {severity}
        </span>
      </span>

      {/* Cross-Contamination Sensitivity Indicator */}
      {isCrossSensitive && (
        <span
          className={`inline-flex items-center gap-1 border rounded-full py-0.5 px-2 text-[10px] font-extrabold ${ALLERGY_WARNINGS['cross-contamination'].badgeColor} ${ALLERGY_WARNINGS['cross-contamination'].textColor}`}
          title="Extremely sensitive to cross-contamination"
        >
          <ShieldAlert size={10} />
          <span>No Cross-Contam</span>
        </span>
      )}

      {/* EpiPen Carrier Status Indicator */}
      {hasEpiPen && (
        <span
          className={`inline-flex items-center gap-1 border rounded-full py-0.5 px-2 text-[10px] font-extrabold ${ALLERGY_WARNINGS.epipen.badgeColor} ${ALLERGY_WARNINGS.epipen.textColor}`}
          title="Carries EpiPen"
        >
          <Syringe size={10} />
          <span>EpiPen</span>
        </span>
      )}
    </div>
  );
};
