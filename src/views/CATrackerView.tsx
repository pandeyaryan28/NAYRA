import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useFocus } from '@/context/FocusContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CA_SUBJECTS } from '@/data/caFoundationData';
import { CASubjectId, CATopicStatus, CAConfidence, CATestRecord, CATopic } from '@/types';
import { getTodayDateString } from '@/lib/utils';

export const CATrackerView: React.FC = () => {
  const navigate = useNavigate();
  const { selectTask } = useFocus();
  const {
    caTopics,
    updateCATopicStatus,
    recordCARevision,
    caTests,
    addCATestRecord,
    tasks,
    createTask,
  } = useData();

  const [activeSubjectId, setActiveSubjectId] = useState<CASubjectId>('accounting');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // New Test Modal State
  const [testName, setTestName] = useState('');
  const [testSubject, setTestSubject] = useState<CASubjectId>('accounting');
  const [testMarks, setTestMarks] = useState<number>(65);
  const [testMaxMarks, setTestMaxMarks] = useState<number>(100);

  // Subject statistics
  const subjectStats = useMemo(() => {
    return CA_SUBJECTS.map((sub) => {
      const subTopics = caTopics.filter((t) => t.subjectId === sub.id);
      const completed = subTopics.filter((t) => t.status === 'completed').length;
      const inProgress = subTopics.filter((t) => t.status === 'in_progress').length;
      const percent = subTopics.length > 0 ? Math.round((completed / subTopics.length) * 100) : 0;
      return {
        ...sub,
        totalTopics: subTopics.length,
        completedTopics: completed,
        inProgressTopics: inProgress,
        percent,
      };
    });
  }, [caTopics]);

  // Aggregate completion
  const totalTopics = caTopics.length;
  const totalCompleted = caTopics.filter((t) => t.status === 'completed').length;
  const aggregatePercent = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  // Filtered topics for active subject
  const currentTopics = useMemo(() => {
    return caTopics.filter((t) => {
      if (t.subjectId !== activeSubjectId) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    });
  }, [caTopics, activeSubjectId, statusFilter]);

  // Group topics by chapter
  const chapters = useMemo(() => {
    const map = new Map<string, typeof currentTopics>();
    currentTopics.forEach((t) => {
      const list = map.get(t.chapterName) || [];
      list.push(t);
      map.set(t.chapterName, list);
    });
    return Array.from(map.entries()).map(([chapterName, topics]) => ({
      chapterName,
      topics,
    }));
  }, [currentTopics]);

  const handleLogTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    addCATestRecord({
      testName: testName.trim(),
      subjectId: testSubject,
      date: getTodayDateString(),
      marksObtained: testMarks,
      maxMarks: testMaxMarks,
    });

    setTestName('');
    setIsTestModalOpen(false);
  };

  const handleStartStudy = async (topic: CATopic) => {
    updateCATopicStatus(topic.id, 'in_progress');
    const taskTitle = `CA Foundation: ${topic.title} (${topic.chapterName})`;
    const existingTask = tasks.find((t) => t.title === taskTitle && t.status !== 'completed');
    if (existingTask) {
      selectTask(existingTask);
    } else {
      const newTask = await createTask({
        title: taskTitle,
        notes: `Subject: ${topic.subjectId}\nICAI Syllabus Topic Study`,
        priority: 'high',
        due: getTodayDateString(),
      });
      selectTask(newTask);
    }
    navigate('/focus');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>CA Foundation Exam Preparation Tracker</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Official ICAI syllabus blueprint, 40% subject / 50% aggregate pass threshold rules & spaced repetition planner.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTestModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Log Test Score</span>
          </Button>
        </div>
      </div>

      {/* 4-Subject Progress Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjectStats.map((sub, idx) => {
          const isSelected = sub.id === activeSubjectId;
          const staggerClass = idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : idx === 2 ? 'stagger-3' : 'stagger-4';
          return (
            <div
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`p-4 rounded-lg border card-enter interactive-card ${staggerClass} cursor-pointer ${
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  {sub.code}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {sub.percent}%
                </span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {sub.name}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                {sub.completedTopics} of {sub.totalTopics} topics completed
              </p>

              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden mt-3">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 progress-bar-animated"
                  style={{ width: `${sub.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs for Syllabus Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-zinc-500">
          Aggregate Readiness: <strong className="text-zinc-900 dark:text-zinc-100">{aggregatePercent}%</strong>
        </span>
      </div>

      {/* Hierarchical Syllabus Tree */}
      <div className="space-y-6">
        {chapters.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400 border border-dashed rounded-lg">
            No topics found under this filter.
          </div>
        ) : (
          chapters.map((chap) => (
            <div
              key={chap.chapterName}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs card-enter"
            >
              <div className="bg-zinc-50 dark:bg-zinc-900/80 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide uppercase">
                  {chap.chapterName}
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">
                  {chap.topics.filter((t) => t.status === 'completed').length} / {chap.topics.length} Done
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {chap.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {topic.title}
                        </span>
                        <Badge
                          variant={
                            topic.status === 'completed'
                              ? 'success'
                              : topic.status === 'in_progress'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {topic.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                        <span>Revisions: {topic.revisionCount}</span>
                        {topic.confidence && (
                          <span className="capitalize">Confidence: {topic.confidence}</span>
                        )}
                        {topic.nextRevisionDue && (
                          <span>Next Due: {topic.nextRevisionDue}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {topic.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCATopicStatus(topic.id, 'completed')}
                          className="h-7 text-xs px-2.5"
                        >
                          Mark Completed
                        </Button>
                      )}
                      {topic.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartStudy(topic)}
                          className="h-7 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          Start Study
                        </Button>
                      )}
                      {topic.status === 'in_progress' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartStudy(topic)}
                          className="h-7 text-xs px-2 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                          Focus Study
                        </Button>
                      )}

                      {/* 1-Tap Revision Progression */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => recordCARevision(topic.id, 'high')}
                        className="h-7 text-xs px-2.5 gap-1"
                        title="Increment revision count (Spaced Repetition)"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Revise</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Test Series History & ICAI Rule Evaluation */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4 card-enter">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Mock & Unit Test Log
            </h3>
            <p className="text-[11px] text-zinc-400">
              ICAI Foundation Rule: ≥40% in each paper, ≥50% aggregate score to qualify.
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">{caTests.length} tests logged</span>
        </div>

        <div className="space-y-2">
          {caTests.map((test) => {
            const scorePercent = Math.round((test.marksObtained / test.maxMarks) * 100);
            const passed = scorePercent >= 40;

            return (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 rounded-md border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                    {test.testName}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono capitalize">
                    {test.subjectId.replace('_', ' ')} • {test.date}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {test.marksObtained} / {test.maxMarks}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      ({scorePercent}%)
                    </span>
                  </div>
                  <Badge variant={passed ? 'success' : 'danger'}>
                    {passed ? 'ICAI Pass' : 'Under 40%'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Test Score Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Log Mock or Unit Test Score"
        description="Record marks for ICAI Foundation threshold performance tracking."
      >
        <form onSubmit={handleLogTest} className="space-y-4">
          <Input
            label="Test Name"
            placeholder="e.g., Accounting Unit Test 2 (Final Accounts)"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Subject"
            value={testSubject}
            onChange={(e) => setTestSubject(e.target.value as CASubjectId)}
            options={CA_SUBJECTS.map((s) => ({ value: s.id, label: `${s.code}: ${s.name}` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marks Obtained"
              type="number"
              min={0}
              max={testMaxMarks}
              value={testMarks}
              onChange={(e) => setTestMarks(parseInt(e.target.value) || 0)}
              required
            />
            <Input
              label="Max Marks"
              type="number"
              min={1}
              value={testMaxMarks}
              onChange={(e) => setTestMaxMarks(parseInt(e.target.value) || 100)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Record Score
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
