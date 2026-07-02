import React, { useState } from 'react';
import { User, Phone, Clock, FileText, Sparkles, ShieldAlert, Check, HelpCircle } from 'lucide-react';
import { DietaryBadge, AllergyBadge } from './DietaryIcons';

/**
 * DietaryProfileCardLayout
 * 
 * DESIGN SPECIFICATION & REFERENCE DESIGN (Figma-Style Spec in JSX)
 * This file serves as the interactive pixel-perfect blueprint for building the Qline Dietary Profile Card.
 * Adheres to: #F36D21 orange, rounded-[40px] cards, bg-[#FFFDF9] background, font-black headings.
 */
export default function DietaryProfileCardLayout() {
  const [showSpecs, setShowSpecs] = useState(true);

  // Sample guest profile data
  const sampleProfile = {
    guestName: "Sarah Jenkins",
    phone: "+1 (555) 382-9102",
    visitCount: 14,
    lastVisit: "June 28, 2026",
    status: "VIP Regular",
    dietaryRestrictions: ["gluten-free", "nut-free", "dairy-free"],
    allergies: [
      { name: "Peanuts", severity: "severe", crossContamination: true, carriesEpiPen: true },
      { name: "Shellfish", severity: "moderate", crossContamination: false, carriesEpiPen: false }
    ],
    notes: "Requires gluten-free menu. Severe peanut allergy—even trace cross-contamination triggers reaction. Carries EpiPen. Always verify soy-sauce ingredients with kitchen."
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-[#FAF6F0] dark:bg-gray-950 rounded-[48px] border border-orange-100 dark:border-gray-800 shadow-xl space-y-8">
      {/* Design System Spec Header Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-orange-100 dark:border-gray-800">
        <div>
          <span className="px-3 py-1 bg-[#F36D21]/10 text-[#F36D21] text-[11px] font-black tracking-widest uppercase rounded-full">
            UI/UX DESIGN SYSTEM SPEC
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            Dietary Profile Card Blueprint
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Interactive visual spec for implementing the persistent customer dietary details.
          </p>
        </div>
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${
            showSpecs
              ? 'bg-[#F36D21] text-white border-[#F36D21] hover:bg-orange-600'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-orange-200'
          }`}
        >
          <Sparkles size={14} />
          {showSpecs ? "Hide Design Spec Guidelines" : "Show Design Spec Guidelines"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Figma specs / token notes */}
        <div className={`lg:col-span-4 space-y-6 transition-all duration-300 ${showSpecs ? 'opacity-100' : 'opacity-40'}`}>
          <div className="p-5 bg-white dark:bg-gray-900 rounded-[30px] border border-orange-100/60 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#F36D21] rounded-full animate-ping" />
              Design Tokens Utilized
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#FFFDF9] border border-orange-200 flex-shrink-0 flex items-center justify-center font-extrabold text-[8px] text-[#F36D21]">F9</div>
                <div>
                  <p className="font-extrabold text-gray-800 dark:text-gray-200">Base Canvas Background</p>
                  <p className="text-[10px] text-gray-500 font-mono">bg-[#FFFDF9]</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#F36D21] flex-shrink-0 flex items-center justify-center font-extrabold text-[8px] text-white">OR</div>
                <div>
                  <p className="font-extrabold text-gray-800 dark:text-gray-200">Accent Orange</p>
                  <p className="text-[10px] text-gray-500 font-mono">text-[#F36D21] / bg-[#F36D21]</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-orange-400 flex-shrink-0 flex items-center justify-center font-extrabold text-[8px] text-gray-500">R4</div>
                <div>
                  <p className="font-extrabold text-gray-800 dark:text-gray-200">High-Contrast Radii</p>
                  <p className="text-[10px] text-gray-500 font-mono">rounded-[40px]</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-gray-200 flex-shrink-0 flex items-center justify-center font-black text-[10px] text-gray-800">Aa</div>
                <div>
                  <p className="font-extrabold text-gray-800 dark:text-gray-200">Headings Typography</p>
                  <p className="text-[10px] text-gray-500 font-mono">font-black tracking-tight</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-orange-50/50 dark:bg-gray-900/50 rounded-[30px] border border-orange-100/60 dark:border-gray-800 text-xs text-orange-950 dark:text-orange-200/90 space-y-3">
            <h4 className="font-black text-[#F36D21] uppercase tracking-wider text-[10px]">
              Implementation Guidelines
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed">
              <li>Profile card MUST persist dynamically in the database matched against the customer profile.</li>
              <li>Always render severe allergies with a pulsed red indicator to stand out immediately.</li>
              <li>Provide quick indicators for front-of-house (FOH) table layout and host stand view.</li>
            </ul>
          </div>
        </div>

        {/* The Live Render Blueprint */}
        <div className="lg:col-span-8 space-y-4 relative">
          {showSpecs && (
            <div className="absolute -top-3 left-4 bg-[#F36D21] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full z-10 shadow-sm uppercase tracking-wider">
              Live Mockup with Figma Annotations
            </div>
          )}

          {/* Guest Card Outer Frame */}
          <div className={`relative bg-[#FFFDF9] dark:bg-[#0c101d] rounded-[40px] border-3 ${showSpecs ? 'border-[#F36D21]/30' : 'border-gray-100 dark:border-gray-800'} p-8 dark:shadow-2xl shadow-lg transition-all duration-300`}>
            
            {/* Guide markers (Figma-style) */}
            {showSpecs && (
              <>
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-[#F36D21]/5 border-r border-[#F36D21]/15 flex items-center justify-center" title="p-8 left padding">
                  <span className="text-[8px] text-[#F36D21] font-mono -rotate-90">32px</span>
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-3 bg-[#F36D21]/5 border-l border-[#F36D21]/15 flex items-center justify-center" title="p-8 right padding">
                  <span className="text-[8px] text-[#F36D21] font-mono rotate-90">32px</span>
                </div>
                <div className="absolute top-0 left-0 right-0 h-3 bg-[#F36D21]/5 border-b border-[#F36D21]/15 flex items-center justify-center" title="p-8 top padding">
                  <span className="text-[8px] text-[#F36D21] font-mono">32px</span>
                </div>
              </>
            )}

            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#F36D21]/10 dark:bg-[#F36D21]/20 flex items-center justify-center border-2 border-[#F36D21]/20">
                    <User size={28} className="text-[#F36D21]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        {sampleProfile.guestName}
                      </h2>
                      <span className="px-2.5 py-0.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                        {sampleProfile.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" />
                        {sampleProfile.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <Clock size={12} />
                    History
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                    {sampleProfile.visitCount} visits
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Last: {sampleProfile.lastVisit}
                  </p>
                </div>
              </div>

              {/* Dietary Restrictions Badges Section */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  Dietary Profile Matches
                  {showSpecs && (
                    <span className="text-[8px] font-mono text-[#F36D21] normal-case bg-orange-50 px-1 rounded">
                      (Exported Badge Style Components)
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {sampleProfile.dietaryRestrictions.map(code => (
                    <DietaryBadge key={code} code={code} size="md" />
                  ))}
                </div>
              </div>

              {/* Allergy Information Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  Allergies (Severity & EpiPen Status)
                  {showSpecs && (
                    <span className="text-[8px] font-mono text-[#F36D21] normal-case bg-orange-50 px-1 rounded">
                      (Pulsing Alert Component)
                    </span>
                  )}
                </h4>
                
                <div className="grid gap-3 pt-1">
                  {sampleProfile.allergies.map(allergy => (
                    <div 
                      key={allergy.name}
                      className={`p-4 rounded-[20px] border transition-all ${
                        allergy.severity === 'severe' 
                          ? 'bg-red-50/40 dark:bg-red-950/10 border-red-100 dark:border-red-900/40 shadow-sm' 
                          : 'bg-orange-50/30 dark:bg-orange-950/5 border-orange-100/60 dark:border-orange-900/20'
                      }`}
                    >
                      <AllergyBadge 
                        allergyName={allergy.name} 
                        severity={allergy.severity} 
                        isCrossSensitive={allergy.crossContamination} 
                        hasEpiPen={allergy.carriesEpiPen} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions & Kitchen Prep Notes */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  Kitchen Prep Instruction Notes
                </h4>
                <div className="p-4 bg-orange-50/20 dark:bg-gray-900/30 border border-orange-100/40 dark:border-gray-800 rounded-[24px] text-xs leading-relaxed text-gray-700 dark:text-gray-300 flex gap-3">
                  <FileText className="w-4 h-4 text-[#F36D21] flex-shrink-0 mt-0.5" />
                  <p className="font-medium">
                    {sampleProfile.notes}
                  </p>
                </div>
              </div>

              {/* Action Blueprint Bar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wide">
                  Draft Profile Validated
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Check size={14} className="stroke-[3]" />
                </div>
              </div>

            </div>
          </div>

          {/* Design System specs overlay (Bottom Anchor) */}
          {showSpecs && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-orange-100/30 dark:bg-gray-900/70 border border-orange-100/50 dark:border-gray-800 rounded-2xl text-xs font-mono text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#F36D21]" />
                <span>Card border radius: <code className="bg-orange-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px] font-bold text-[#F36D21]">40px</code></span>
              </span>
              <span>Theme: qline-rebuild dark/light mode fully compliant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
