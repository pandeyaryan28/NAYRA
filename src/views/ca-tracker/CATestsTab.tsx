import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { useCATracker } from '@/context/CATrackerContext';
import { Card } from './components/Card';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { SubjectId, TestType } from '@/types/ca';
import { formatDate, evaluateMockSeries } from '@/lib/ca/utils';

export const CATestsTab: React.FC = () => {
  const { tests, subjects, addTest, deleteTest, metrics } = useCATracker();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>('paper1');
  const [testType, setTestType] = useState<TestType>('chapter');
  const [marksObtained, setMarksObtained] = useState('75');
  const [totalMarks, setTotalMarks] = useState('100');
  const [negativeMarks, setNegativeMarks] = useState('0');
  const [dateAttempted, setDateAttempted] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [weakTopicsInput, setWeakTopicsInput] = useState('');

  const [filterSubject, setFilterSubject] = useState<SubjectId | 'all'>('all');
  const [filterType, setFilterType] = useState<TestType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'subject'>('date');

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const obtained = parseFloat(marksObtained);
    const total = parseFloat(totalMarks);
    const neg = parseFloat(negativeMarks) || 0;
    if (isNaN(obtained) || isNaN(total) || total <= 0 || !title.trim()) return;

    const weakTopicsList = weakTopicsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addTest({
      title: title.trim(),
      subjectId,
      testType,
      dateAttempted: dateAttempted || new Date().toISOString().split('T')[0],
      marksObtained: Math.max(0, obtained),
      totalMarks: total,
      negativeMarksDeducted: neg > 0 ? neg : undefined,
      notes: notes.trim() || undefined,
      weakTopics: weakTopicsList.length > 0 ? weakTopicsList : undefined,
    });

    setTitle('');
    setMarksObtained('75');
    setTotalMarks('100');
    setNegativeMarks('0');
    setNotes('');
    setWeakTopicsInput('');
    setShowModal(false);
  };

  const mockSeriesEval = useMemo(() => {
    return evaluateMockSeries(tests);
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests
      .filter((t) => {
        const matchesSub = filterSubject === 'all' || t.subjectId === filterSubject;
        const matchesType = filterType === 'all' || t.testType === filterType;
        const matchesQuery =
          !searchQuery.trim() ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.weakTopics &&
            t.weakTopics.some((w) => w.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesSub && matchesType && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.dateAttempted).getTime() - new Date(a.dateAttempted).getTime();
        } else if (sortBy === 'score') {
          return (b.percentage || 0) - (a.percentage || 0);
        } else {
          return a.subjectId.localeCompare(b.subjectId);
        }
      });
  }, [tests, filterSubject, filterType, searchQuery, sortBy]);

  const weakTopicsIndex = useMemo(() => {
    const counts: Record<string, { count: number; subjectId: SubjectId }> = {};
    tests.forEach((t) => {
      (t.weakTopics || []).forEach((topicStr) => {
        const key = topicStr.trim();
        if (key) {
          if (!counts[key]) {
            counts[key] = { count: 0, subjectId: t.subjectId };
          }
          counts[key].count++;
        }
      });
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tests]);

  const subjectAverages = useMemo(() => {
    const papers: SubjectId[] = ['paper1', 'paper2', 'paper3', 'paper4'];
    return papers.map((pId) => {
      const pTests = tests.filter((t) => t.subjectId === pId && (t.totalMarks || 0) > 0);
      const avg =
        pTests.length > 0
          ? Number(
              (pTests.reduce((acc, t) => acc + (t.percentage || 0), 0) / pTests.length).toFixed(1)
            )
          : 0;
      const sub = subjects.find((s) => s.id === pId);
      return {
        id: pId,
        code: sub?.code || pId,
        shortName: sub?.shortName || pId,
        avg,
        testsCount: pTests.length,
        isPassing: avg >= 40,
      };
    });
  }, [tests, subjects]);

  return (
    <div className="space-y-6">
      {/* Header Summary & Log Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Mock Test Series & Performance Analytics
          </h2>
          <p className="text-xs text-zinc-500">
            ICAI CA Foundation Criteria: Minimum 40% individual paper pass & 50% aggregate (200/400)
          </p>
        </div>

        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
          size="sm"
          variant="primary"
        >
          Log Test Score
        </Button>
      </div>

      {/* ICAI Mock Series Aggregate Qualification Banner */}
      <Card
        className={`p-5 border-l-4 ${
          mockSeriesEval.overallPassed
            ? 'border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
            : 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={mockSeriesEval.overallPassed ? 'completed' : 'danger'}
                size="sm"
              >
                {mockSeriesEval.statusMessage}
              </Badge>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Latest 4-Paper Aggregate: {mockSeriesEval.totalMarksObtained} / 400 (
                {mockSeriesEval.aggregatePercentage}%)
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {mockSeriesEval.overallPassed
                ? 'Excellent! Your latest mock performances qualify for ICAI CA Foundation.'
                : 'Focus on bringing all individual papers above 40% and total score above 200.'}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
            {(['paper1', 'paper2', 'paper3', 'paper4'] as SubjectId[]).map((pId) => {
              const score = mockSeriesEval.paperScores[pId];
              const passed = mockSeriesEval.individualPaperPass[pId];
              const sub = subjects.find((s) => s.id === pId);

              return (
                <div
                  key={pId}
                  className="text-center p-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 min-w-0"
                >
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block truncate">
                    {sub?.code || pId}
                  </span>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      passed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Tests Attempted</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {metrics.totalTestsLogged}
          </div>
          <span className="text-[11px] text-zinc-400">
            {tests.filter((t) => t.isPassed).length} passed, {tests.filter((t) => !t.isPassed).length} failed
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Overall Average Score</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {metrics.recentTestsAveragePercentage}%
          </div>
          <span className="text-[11px] text-zinc-400">
            Target: &gt;= 50% for aggregate qualification
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Subject Performance</span>
          <div className="flex items-center gap-1.5 pt-1">
            {subjectAverages.map((sub) => (
              <div
                key={sub.id}
                className="flex-1 text-center py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                title={`${sub.code}: ${sub.avg}% (${sub.testsCount} tests)`}
              >
                <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                  {sub.code}
                </span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    sub.avg >= 40
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : sub.avg > 0
                      ? 'text-amber-500'
                      : 'text-zinc-400'
                  }`}
                >
                  {sub.avg > 0 ? `${sub.avg}%` : '–'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weak Topics Frequency Section */}
      {weakTopicsIndex.length > 0 && (
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              High-Priority Weak Areas (From Logged Tests)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {weakTopicsIndex.map((item) => (
              <span
                key={item.name}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5"
              >
                <span>{item.name}</span>
                <span className="px-1 py-0.2 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-[10px] font-bold">
                  {item.count}x noted
                </span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value as SubjectId | 'all')}
            className="p-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.shortName}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TestType | 'all')}
            className="p-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Test Types</option>
            <option value="chapter">Chapter Tests</option>
            <option value="full_mock">Full ICAI Mocks</option>
            <option value="revision">Revision Tests</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'subject')}
            className="p-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="subject">Sort by Subject</option>
          </select>
        </div>

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search test titles, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Tests Log List */}
      <div className="space-y-3">
        {filteredTests.length === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No test records found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Log your chapter mock tests, ICAI RTP/MTP series, or unit tests to track passing trends.
            </p>
            <Button size="sm" variant="primary" onClick={() => setShowModal(true)}>
              Log First Test
            </Button>
          </Card>
        ) : (
          filteredTests.map((test) => {
            const sub = subjects.find((s) => s.id === test.subjectId);

            return (
              <Card
                key={test.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={test.subjectId} size="sm">
                      {sub?.code || test.subjectId}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {test.testType.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {formatDate(test.dateAttempted)}
                    </span>
                    <Badge variant={test.isPassed ? 'completed' : 'danger'} size="sm">
                      {test.isPassed ? 'Passed (>=40%)' : 'Below Threshold (<40%)'}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                    {test.title}
                  </h4>

                  {test.notes && (
                    <p className="text-xs text-zinc-500 italic">{test.notes}</p>
                  )}

                  {test.weakTopics && test.weakTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {test.weakTopics.map((w) => (
                        <span
                          key={w}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                        >
                          Focus: {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {test.marksObtained} / {test.totalMarks}
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums block ${
                        test.isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500'
                      }`}
                    >
                      {test.percentage}% score
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTest(test.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Delete test log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Log Test Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Log Mock / Chapter Test Score
            </h3>

            <form onSubmit={handleCreateTest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Chapter 4 Unit 1 Mock"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Subject Paper
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                    className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Test Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as TestType)}
                    className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="chapter">Chapter Test</option>
                    <option value="full_mock">Full ICAI Mock</option>
                    <option value="revision">Revision Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Marks Scored
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    -ve Marking
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Date Attempted
                </label>
                <input
                  type="date"
                  value={dateAttempted}
                  onChange={(e) => setDateAttempted(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Weak Topics Identified (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Reconciliation, Rectification"
                  value={weakTopicsInput}
                  onChange={(e) => setWeakTopicsInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Performance Notes / Mistakes Observed
                </label>
                <textarea
                  placeholder="e.g. Need to review journal entry presentation and time management..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Test Record
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
