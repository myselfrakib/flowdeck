import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  CalendarDays, 
  Film,
  Zap,
  Users
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { projects, shootEvents, editVersions } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Agency Operations & KPIs
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Real-time Metrics
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Delivery velocity, revision turnaround cycles, shoot utilization, and team capacity
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="On-Time Delivery"
          value="94.2%"
          subtitle="Target: >90% milestone lock"
          icon={TrendingUp}
          trend="+3.1%"
          trendType="positive"
          colorScheme="emerald"
        />
        <StatCard
          title="Avg. Revision Cycles"
          value="1.8"
          subtitle="Versions per project to sign-off"
          icon={Film}
          trend="-0.4"
          trendType="positive"
          colorScheme="blue"
        />
        <StatCard
          title="Shoot Studio Utilization"
          value="82%"
          subtitle="Stage & gear efficiency"
          icon={CalendarDays}
          trend="Optimal"
          trendType="positive"
          colorScheme="purple"
        />
        <StatCard
          title="Review Turnaround"
          value="4.6 hrs"
          subtitle="From upload to client response"
          icon={Clock}
          trend="-1.2h"
          trendType="positive"
          colorScheme="amber"
        />
      </div>

      {/* Breakdown Charts & Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Deliverable Performance Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Project Throughput by Deliverable Format
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Brand Commercial Films (4K)</span>
                <span>85% on schedule</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Social Reels & Short-Form (9:16)</span>
                <span>98% on schedule</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Editorial Photoshoots</span>
                <span>90% on schedule</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Best Practices from Blueprint */}
        <div className="bg-gradient-to-br from-[#102A43] to-[#1C3D5A] rounded-3xl p-6 text-white shadow-xs space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-400/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Operational Principles</span>
          </div>
          <h3 className="text-base font-bold">
            StudioFlow Agency Operating System
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            "One project. One workspace. One communication history. Complete visibility."
          </p>
          <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
            <p>✓ Replace fragmented Slack, WhatsApp, and Google Sheet tracking.</p>
            <p>✓ Isolate client approvals from internal crew discussions and production costs.</p>
            <p>✓ Eliminate missing footage links via standardized 8-folder media taxonomy.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

