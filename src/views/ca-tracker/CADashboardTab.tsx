import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Scale,
  Calculator,
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Calendar,
  Target,
  ChevronRight,
  RefreshCw,
  FileText,
  ExternalLink,
  Play,
  HelpCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCATracker } from '@/context/CATrackerContext';
import { Card } from './components/Card';
import { Badge } from './components/Badge';
import { ProgressBar } from './components/ProgressBar';
import { Button } from './components/Button';
import { RadialGauge } from './components/RadialGauge';
import { SubjectId } from '@/types/ca';
import { formatMinutes, formatDate, sanitizeExamDate } from '@/lib/ca/utils';
import { loadExerciseAttempts, economicsExercises } from '@/lib/ca/exerciseStorage';

interface CADashboardTabProps {
  onNavigateTab?: (tab: string, filter?: string) => void;
  onNavigateToExercise?: (chapterNum?: number, unitNum?: number, subjectId?: string) => void;
}

export const CADashboardTab: React.FC<CADashboardTabProps> = ({
  onNavigateTab,
  onNavigateToExercise,
}) => {
  const {
    metrics,
    actionPlan,
    subjectGroups,
    settings,
    updateTopicStatus,
    toggleScheduleEntry,
    updateSettings,
    topics,
  } = useCATracker();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newExamDate, setNewExamDate] = useState(sanitizeExamDate(settings.examDate));
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [syncNotice, setSyncNotice] = useState(false);

  useEffect(() => {
    if (settings.examDate) {
      setNewExamDate(sanitizeExamDate(settings.examDate));
    }
  }, [settings.examDate]);

  // Real-time precision countdown ticker (Days, Hours, Mins, Secs)
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const targetStr = settings.examDate || '2027-01-01';
      const targetDate = new Date(targetStr);
      targetDate.setHours(9, 0, 0, 0); // 9:00 AM exam time
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSecs / (3600 * 24));
      const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings.examDate]);

  const handleActionComplete = (topicId: string) => {
    updateTopicStatus(topicId, 'completed');
    if (settings.confettiEnabled) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'],
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleScheduleToggle = (entryId: string, completed: boolean) => {
    toggleScheduleEntry(entryId, completed);
    if (completed && settings.confettiEnabled) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'],
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleSaveExamDate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDate = sanitizeExamDate(newExamDate);
    if (cleanDate) {
      setIsSavingDate(true);
      await updateSettings({ examDate: cleanDate });
      setIsSavingDate(false);
      setShowDatePicker(false);
      setSyncNotice(true);
      setTimeout(() => setSyncNotice(false), 3500);
    }
  };

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'paper1':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'paper2':
        return <Scale className="w-5 h-5 text-violet-500" />;
      case 'paper3':
        return <Calculator className="w-5 h-5 text-cyan-500" />;
      case 'paper4':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
    }
  };

  // Remaining estimated study hours
  const totalRemainingStudyHours = Number(
    topics
      .filter((t) => t.status !== 'completed')
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
      .toFixed(1)
  );

  const requiredDailyStudyHours =
    metrics.daysUntilExam > 0
      ? Number((totalRemainingStudyHours / Math.max(1, metrics.daysUntilExam)).toFixed(1))
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Hero Command Center: Split Apple Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Hero Card: Syllabus Mastery & Key Metrics (lg:col-span-8) */}
        <Card className="lg:col-span-8 relative overflow-hidden bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                ICAI CA Foundation • 2024 New Scheme
              </Badge>
              <Badge
                variant={
                  metrics.aggregatePassingLikelihood === 'On Track'
                    ? 'success'
                    : metrics.aggregatePassingLikelihood === 'Needs Attention'
                    ? 'warning'
                    : 'danger'
                }
              >
                {metrics.aggregatePassingLikelihood}
              </Badge>
              {syncNotice && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full animate-fade-in">
                  ✓ Synced to Cloud
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Syllabus Completion: <span className="text-emerald-600 dark:text-emerald-400">{metrics.overallProgressPercentage}%</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {metrics.completedTopics} of {metrics.totalTopics} topics completed across all 4 papers • {totalRemainingStudyHours} hrs of study remaining
              </p>
            </div>

            {/* Apple Progress Bar */}
            <div className="pt-1">
              <ProgressBar value={metrics.overallProgressPercentage} size="md" colorHex="#10B981" />
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
            <div>
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-500" /> Study Logged
              </span>
              <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
                {metrics.totalStudyHoursLogged}h
              </div>
              <span className="text-[10px] text-zinc-400">Goal: {settings.dailyGoalHours}h / day</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> Daily Streak
              </span>
              <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                {metrics.currentStreakDays}d
              </div>
              <span className="text-[10px] text-zinc-400">Best: {metrics.bestStreakDays} days</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-500" /> Pace Required
              </span>
              <div className="text-base sm:text-lg font-bold text-cyan-600 dark:text-cyan-400 tabular-nums mt-0.5">
                {requiredDailyStudyHours}h
              </div>
              <span className="text-[10px] text-zinc-400">per day to finish</span>
            </div>
          </div>
        </Card>

        {/* Right Hero Card: Target Exam Countdown & Pace Widget (lg:col-span-4) */}
        <Card className="lg:col-span-4 relative overflow-hidden bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Target Countdown
            </span>
            <button
              type="button"
              onClick={() => {
                setNewExamDate(sanitizeExamDate(settings.examDate));
                setShowDatePicker(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/10 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer swiftui-press active:scale-[0.98]"
              title="Click to edit exam date"
            >
              <Calendar className="w-3 h-3 text-emerald-500" />
              <span>Edit Date</span>
            </button>
          </div>

          <div className="my-auto py-2">
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {metrics.daysUntilExam}
              <span className="text-base sm:text-lg font-normal text-zinc-400 dark:text-zinc-500 ml-2">Days</span>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
              <span>Exam:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {formatDate(settings.examDate)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Required Pace</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {requiredDailyStudyHours}h / day
            </span>
          </div>
        </Card>
      </div>

      {/* 4-Subject SVG Radial Gauges Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Official 4-Paper Progress
            </h3>
            <p className="text-xs text-zinc-500">
              ICAI minimum passing threshold is 40% per subject & 50% aggregate score
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('checklist')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium transition-colors"
            >
              View Checklist <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['paper1', 'paper2', 'paper3', 'paper4'] as const).map((paperId) => {
            const group = subjectGroups[paperId];
            if (!group) return null;
            const meta = group.meta;

            return (
              <Card
                key={paperId}
                hoverEffect
                onClick={() => onNavigateTab && onNavigateTab('checklist', paperId)}
                className="flex flex-col items-center justify-between p-5 space-y-4 text-center rounded-2xl cursor-pointer swiftui-press active:scale-[0.98] transition-all"
                title={`Click to open ${meta.code} (${meta.shortName}) checklist`}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      {getSubjectIcon(paperId)}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      {meta.code}
                    </span>
                  </div>
                  <Badge
                    variant={group.progressPercentage >= 40 ? 'completed' : 'pending'}
                    size="sm"
                  >
                    {group.progressPercentage >= 40 ? 'Pass Safe' : 'In Progress'}
                  </Badge>
                </div>

                <RadialGauge
                  percentage={group.progressPercentage}
                  size={110}
                  strokeWidth={9}
                  color={meta.color.primary}
                  label={meta.shortName}
                />

                <div className="w-full space-y-2 border-t border-black/[0.04] dark:border-white/[0.06] pt-3">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 tabular-nums">
                    <span>{group.completedTopics} of {group.totalTopics} Topics</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {group.progressPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{group.chapters.length} Chapters</span>
                    <span>{group.completedEstimatedHours} / {group.totalEstimatedHours}h</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Digital Exercises Quick-Access Banner Card */}
      <Card className="p-6 sm:p-7 border border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.45)] rounded-3xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                Paper 3 • Quantitative Aptitude
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                Paper 4 • Business Economics
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Official ICAI Study Module MCQ Bank
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Digital Exercise & Practice Hub
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              2,547 official ICAI multiple-choice questions across 28 chapters in Paper 3 (Quantitative Aptitude: 1,930 Qs) and Paper 4 (Business Economics: 617 Qs) with verified answer keys, step-by-step mathematical explanations, and instant keyboard shortcuts.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.08]">
                <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">2,547</span>
                <span className="text-zinc-500">Total MCQs</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.08]">
                <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">28</span>
                <span className="text-zinc-500">Chapters</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.08]">
                <span className="font-bold tabular-nums text-rose-600 dark:text-rose-400">-0.25</span>
                <span className="text-zinc-500">Exam Negative Marking</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 w-full lg:w-auto shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (onNavigateTab) {
                  onNavigateTab('exercises');
                } else if (onNavigateToExercise) {
                  onNavigateToExercise();
                }
              }}
              leftIcon={<HelpCircle className="w-4 h-4" />}
              className="w-full sm:w-auto font-semibold justify-center rounded-full"
            >
              Practice Exercises
            </Button>
            <span className="text-[11px] text-zinc-500 text-center lg:text-right">
              Exam & Practice modes available
            </span>
          </div>
        </div>
      </Card>

      {/* Today's Action Plan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Today's Action Plan
            </h3>
            <Badge variant="outline" size="sm">
              {metrics.todayActionItemsCompleted} / {metrics.todayActionItemsTotal} Done
            </Badge>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> View Full Schedule →
            </button>
          )}
        </div>

        {actionPlan.length === 0 ? (
          <Card className="text-center py-12 space-y-3 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              All caught up for today!
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Check your study schedule or mark topics complete to populate spaced repetition intervals.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {actionPlan.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3.5 rounded-2xl hover:border-black/10 dark:hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                    {item.type === 'lesson' && <BookOpen className="w-4 h-4 text-emerald-500" />}
                    {item.type === 'schedule' && <Calendar className="w-4 h-4 text-cyan-500" />}
                    {item.type === 'revision' && <RefreshCw className="w-4 h-4 text-violet-500" />}
                    {item.type === 'test' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Badge variant={item.subjectId || 'default'} size="sm">
                        {item.subjectName}
                      </Badge>
                      {item.isOverdue && (
                        <Badge variant="danger" size="sm">
                          Overdue
                        </Badge>
                      )}
                      <h4
                        className={`text-sm font-medium break-words ${
                          item.isCompleted
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    {item.chapterName && (
                      <p className="text-xs text-zinc-500 mt-1">{item.chapterName}</p>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-xs text-zinc-400 tabular-nums mr-1">
                    {formatMinutes(item.estimatedMinutes)}
                  </span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const matchingTopic = item.topicId
                        ? topics.find((t) => t.id === item.topicId)
                        : item.topicIds && item.topicIds.length > 0
                        ? topics.find((t) => item.topicIds!.includes(t.id) && (t.videoUrl || t.pdfUrl))
                        : undefined;
                      return (
                        <>
                          {matchingTopic?.videoUrl && (
                            <a
                              href={matchingTopic.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 px-2.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                              title={matchingTopic.videoTitle ? `Watch Lecture: ${matchingTopic.videoTitle}` : 'Watch YouTube Lecture'}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span className="hidden xs:inline">Lecture</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          )}
                          {matchingTopic?.pdfUrl && (
                            <a
                              href={matchingTopic.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 px-2.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                              title="Open ICAI Study Material PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">PDF</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          )}
                        </>
                      );
                    })()}
                    {!item.isCompleted && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          if (item.scheduleEntryId) {
                            handleScheduleToggle(item.scheduleEntryId, true);
                          } else if (item.topicId) {
                            handleActionComplete(item.topicId);
                          }
                        }}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        className="rounded-full"
                      >
                        Complete
                      </Button>
                    )}
                    {item.isCompleted && (
                      item.scheduleEntryId ? (
                        <button
                          type="button"
                          onClick={() => handleScheduleToggle(item.scheduleEntryId!, false)}
                          title="Click to mark incomplete"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <Badge variant="completed" size="sm">
                            ✓ Done
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant="completed" size="sm">
                          Done
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Edit Exam Date Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-sm p-6 space-y-4 rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08]">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Set CA Exam Date
                  </h3>
                  <p className="text-[11px] text-zinc-500">Target Foundation Exam</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Session Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Quick Sessions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Jan 2027', date: '2027-01-01' },
                  { label: 'June 2027', date: '2027-06-20' },
                  { label: 'Jan 2028', date: '2028-01-01' },
                  { label: 'June 2028', date: '2028-06-20' },
                ].map((preset) => (
                  <button
                    key={preset.date}
                    type="button"
                    onClick={() => setNewExamDate(preset.date)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-all swiftui-press active:scale-[0.98] ${
                      newExamDate === preset.date
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveExamDate} className="space-y-4">
              <div>
                <label
                  htmlFor="dashboard-exam-date"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Custom Target Date
                </label>
                <input
                  id="dashboard-exam-date"
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(sanitizeExamDate(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-zinc-500 mt-2">
                  Synchronized across all your devices via Firebase Cloud Firestore.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                  disabled={isSavingDate}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSavingDate} className="rounded-full">
                  {isSavingDate ? 'Saving...' : 'Save & Sync'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
