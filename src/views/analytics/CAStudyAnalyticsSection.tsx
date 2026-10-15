import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Award, Target, TrendingUp } from 'lucide-react';
import { CATopic, CATestRecord } from '@/types';

interface CAStudyAnalyticsSectionProps {
  caTopics: CATopic[];
  caTests: CATestRecord[];
  todayStr: string;
}

const CA_PAPERS = [
  { id: 'accounting', name: 'Paper 1: Accounting', color: '#3b82f6' },
  { id: 'business_law', name: 'Paper 2: Business Laws', color: '#8b5cf6' },
  { id: 'quantitative_aptitude', name: 'Paper 3: Quantitative Aptitude', color: '#f59e0b' },
  { id: 'business_economics', name: 'Paper 4: Business Economics', color: '#10b981' },
];

export const CAStudyAnalyticsSection: React.FC<CAStudyAnalyticsSectionProps> = ({
  caTopics,
  caTests,
  todayStr,
}) => {
  const totalTopics = caTopics.length;
  const completedTopics = caTopics.filter((t) => t.status === 'completed').length;
  const inProgressTopics = caTopics.filter((t) => t.status === 'in_progress').length;
  const overallCompletionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Revisions due
  const dueRevisions = caTopics.filter(
    (t) => t.nextRevisionDue && t.nextRevisionDue.slice(0, 10) <= todayStr
  ).length;

  // Test metrics
  const avgTestScore =
    caTests.length > 0
      ? Math.round(
          caTests.reduce((sum, t) => sum + (t.marksObtained / Math.max(1, t.maxMarks)) * 100, 0) /
            caTests.length
        )
      : 0;

  return (
    <div className="space-y-6 card-enter">
      {/* Top CA Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Syllabus Completion
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {overallCompletionRate}%
          </span>
          <span className="text-[10px] text-zinc-500 block">
            {completedTopics} of {totalTopics} topics mastered
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            In Progress Topics
          </span>
          <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 block">
            {inProgressTopics}
          </span>
          <span className="text-[10px] text-zinc-500 block">Currently active reading</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Revisions Due
          </span>
          <span
            className={`text-2xl font-bold font-mono block ${
              dueRevisions > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {dueRevisions}
          </span>
          <span className="text-[10px] text-zinc-500 block">Spaced repetition queue</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Mock Test Average
          </span>
          <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 block">
            {avgTestScore}%
          </span>
          <span className="text-[10px] text-zinc-500 block">Across {caTests.length} recorded tests</span>
        </div>
      </div>

      {/* 4 Papers Completion Breakdown */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter interactive-card">
        <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>ICAI Foundation 4-Paper Progress Architecture</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Coverage and mastery tracking mapped to the ICAI official syllabus.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {CA_PAPERS.map((paper) => {
            const paperTopics = caTopics.filter((t) => t.subjectId === paper.id);
            const paperCompleted = paperTopics.filter((t) => t.status === 'completed').length;
            const paperRate =
              paperTopics.length > 0 ? Math.round((paperCompleted / paperTopics.length) * 100) : 0;

            const highConf = paperTopics.filter((t) => t.confidence === 'high').length;
            const medConf = paperTopics.filter((t) => t.confidence === 'medium').length;

            return (
              <div
                key={paper.id}
                className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: paper.color }} />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {paper.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-zinc-500">
                      {paperCompleted}/{paperTopics.length} topics
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{paperRate}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${paperRate}%`,
                      backgroundColor: paper.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-0.5">
                  <span>
                    Confidence: {highConf} High • {medConf} Med
                  </span>
                  <span>
                    {paperTopics.length - paperCompleted} remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
