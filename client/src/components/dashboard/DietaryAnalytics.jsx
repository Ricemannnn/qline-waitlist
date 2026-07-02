import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, AlertTriangle, 
  UtensilsCrossed, Activity, X, 
  Clock, Sun, Moon
} from 'lucide-react';
import { getDietaryAnalytics } from '../../api';

const BAR_COLORS = [
  'bg-[#F36D21]', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-teal-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-lime-500', 'bg-orange-600'
];

const DietaryAnalytics = ({ restaurantId, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('restrictions'); // 'restrictions' or 'allergies'

  useEffect(() => {
    if (!restaurantId) return;
    
    const fetchAnalytics = async () => {
      try {
        const res = await getDietaryAnalytics(restaurantId);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch dietary analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-black text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const restrictions = analytics?.most_common_restrictions || [];
  const allergies = analytics?.most_common_allergies || [];
  const maxRestrictionCount = restrictions.length > 0 ? Math.max(...restrictions.map(r => r.count)) : 1;
  const maxAllergyCount = allergies.length > 0 ? Math.max(...allergies.map(a => a.count)) : 1;
  const currentData = activeView === 'restrictions' ? restrictions : allergies;
  const maxCount = activeView === 'restrictions' ? maxRestrictionCount : maxAllergyCount;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4 border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 text-[#F36D21] rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Dietary Analytics</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {analytics?.total_records_analyzed || 0} reservation records analyzed
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-8 pt-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Guests w/ Restrictions', value: analytics?.total_guests_with_restrictions || 0, icon: UtensilsCrossed, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
            { label: 'Guests w/ Allergies', value: analytics?.total_guests_with_allergies || 0, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
            { label: 'Severe Allergies', value: analytics?.total_guests_severe_allergies || 0, icon: Activity, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
            { label: 'Most Common', value: analytics?.most_common_restriction || 'N/A', icon: TrendingUp, color: 'text-[#F36D21]', bg: 'bg-orange-50 dark:bg-orange-950/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[24px] border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={16} className={stat.color} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className={`text-2xl font-black tracking-tighter ${stat.color}`}>
                {stat.value}
                {typeof stat.value === 'string' && <span className="text-sm font-bold text-gray-400 ml-1"></span>}
              </p>
            </div>
          ))}
        </div>

        {/* Toggle: Restrictions vs Allergies */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 w-fit">
          <button
            onClick={() => setActiveView('restrictions')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeView === 'restrictions'
                ? 'bg-white dark:bg-gray-700 text-[#F36D21] shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <UtensilsCrossed size={16} className="inline mr-2" />
            Dietary Restrictions
          </button>
          <button
            onClick={() => setActiveView('allergies')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeView === 'allergies'
                ? 'bg-white dark:bg-gray-700 text-[#F36D21] shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <AlertTriangle size={16} className="inline mr-2" />
            Allergies
          </button>
        </div>

        {/* Bar Chart */}
        <div>
          <h4 className="font-black text-gray-900 dark:text-white text-base mb-6 tracking-tight">
            {activeView === 'restrictions' ? 'Most Common Dietary Restrictions' : 'Most Common Allergies'}
          </h4>
          <div className="space-y-4">
            {currentData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 font-black text-lg">No data available yet</p>
                <p className="text-gray-500 font-medium text-sm mt-1">Dietary data will appear as guests make reservations.</p>
              </div>
            ) : (
              currentData.slice(0, 10).map((item, i) => (
                <div key={item.code} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400 dark:text-gray-500 w-5">{i + 1}</span>
                      <span className="text-sm font-black text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{item.code}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{item.count}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${BAR_COLORS[i % BAR_COLORS.length]}`}
                      style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '12px' : '0' }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* By Period */}
        {analytics?.by_period && (
          <div>
            <h4 className="font-black text-gray-900 dark:text-white text-base mb-4 tracking-tight flex items-center gap-2">
              <Clock size={18} className="text-[#F36D21]" />
              Dietary Needs by Meal Period
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Lunch (11AM - 3PM)', value: analytics.by_period.lunch || 0, icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                { label: 'Dinner (3PM - Close)', value: analytics.by_period.dinner || 0, icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
              ].map((period, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 text-center">
                  <period.icon size={24} className={`${period.color} mx-auto mb-2`} strokeWidth={2} />
                  <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{period.value}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{period.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today Summary */}
        {analytics?.today_guests_with_dietary !== undefined && (
          <div className="bg-gradient-to-r from-[#F36D21] to-[#F38B21] p-6 rounded-[28px] text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Today's Summary</p>
                <p className="text-3xl font-black tracking-tight">{analytics.today_guests_with_dietary}</p>
                <p className="text-white/80 font-bold text-sm">guests with dietary needs today</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                <Users size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryAnalytics;