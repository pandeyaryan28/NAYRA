import React, { useState, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  ExternalLink,
  Search,
  Cloud,
  Film,
  Calendar,
  Layers,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useCATracker } from '@/context/CATrackerContext';
import { Card } from './components/Card';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { Lecture } from '@/types/ca';
import { normalizeSubjectId } from '@/lib/ca/seedLoader';
import { cn } from '@/lib/utils';

export type LectureFilter = 'all' | 'unwatched' | 'watched';
export type SubjectFilter = 'all' | 'paper1' | 'paper2' | 'paper4';

export const CALecturesTab: React.FC = () => {
  const { lectures, toggleLectureWatched, isCloudConnected, lastSyncedAt } = useCATracker();
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all');
  const [filter, setFilter] = useState<LectureFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewLecture, setActivePreviewLecture] = useState<Lecture | null>(null);

  const sortedLectures = useMemo(() => {
    return [...(lectures || [])].sort((a, b) => {
      const subA = normalizeSubjectId(a.subjectId);
      const subB = normalizeSubjectId(b.subjectId);
      if (subA !== subB) return subA.localeCompare(subB);
      return (a.order || 0) - (b.order || 0);
    });
  }, [lectures]);

  const paper1Lectures = useMemo(
    () => sortedLectures.filter((l) => normalizeSubjectId(l.subjectId) === 'paper1'),
    [sortedLectures]
  );
  const paper2Lectures = useMemo(
    () => sortedLectures.filter((l) => normalizeSubjectId(l.subjectId) === 'paper2'),
    [sortedLectures]
  );
  const paper4Lectures = useMemo(
    () => sortedLectures.filter((l) => normalizeSubjectId(l.subjectId) === 'paper4'),
    [sortedLectures]
  );

  const subjectLectures = useMemo(() => {
    if (selectedSubject === 'paper1') return paper1Lectures;
    if (selectedSubject === 'paper2') return paper2Lectures;
    if (selectedSubject === 'paper4') return paper4Lectures;
    return sortedLectures;
  }, [selectedSubject, paper1Lectures, paper2Lectures, paper4Lectures, sortedLectures]);

  const totalCount = subjectLectures.length;
  const watchedCount = subjectLectures.filter((l) => l.watched).length;
  const remainingCount = totalCount - watchedCount;
  const watchPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  const filteredLectures = useMemo(() => {
    return subjectLectures.filter((lec) => {
      if (filter === 'watched' && !lec.watched) return false;
      if (filter === 'unwatched' && lec.watched) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (lec.title || '').toLowerCase().includes(q);
        const matchMapping = (lec.curriculumMapping || '').toLowerCase().includes(q);
        return matchTitle || matchMapping;
      }

      return true;
    });
  }, [subjectLectures, filter, searchQuery]);

  const formatUploadDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return (isoString || '').split('T')[0];
    }
  };

  const headerInfo = useMemo(() => {
    if (selectedSubject === 'paper1') {
      return {
        badgeText: 'Paper 1: Accounting',
        badgeVariant: 'paper1' as const,
        title: 'Accounts Lectures',
        subtitle:
          'Curated One-Shot accountancy video series in chronological upload sequence, mapped to ICAI syllabus units.',
        totalSubtitle: '19 Lectures',
        progressSubject: 'paper1' as const,
      };
    }
    if (selectedSubject === 'paper2') {
      return {
        badgeText: 'Paper 2: Business Laws',
        badgeVariant: 'paper2' as const,
        title: 'Business Laws Lectures',
        subtitle:
          'PW Chanakya 3.0 One-Shot Business Laws series by CA Nikesh Agrawal, covering all 7 ICAI syllabus chapters.',
        totalSubtitle: '7 Chapters Covered',
        progressSubject: 'paper2' as const,
      };
    }
    if (selectedSubject === 'paper4') {
      return {
        badgeText: 'Paper 4: Business Economics',
        badgeVariant: 'paper4' as const,
        title: 'Business Economics Lectures',
        subtitle:
          'PW Chanakya 3.0 One-Shot Business Economics series by Love Kaushik Sir, covering all 9 ICAI syllabus chapters.',
        totalSubtitle: '7 Marathon Lectures',
        progressSubject: 'paper4' as const,
      };
    }
    return {
      badgeText: `All Subjects (${sortedLectures.length} Videos)`,
      badgeVariant: 'default' as const,
      title: 'Video Lectures & Watch History',
      subtitle:
        'Curated One-Shot video series for Accounting, Business Laws & Business Economics mapped directly to official ICAI syllabus chapters.',
      totalSubtitle: `${sortedLectures.length} Total Lectures`,
      progressSubject: 'paper1' as const,
    };
  }, [selectedSubject, sortedLectures.length]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Cloud Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={headerInfo.badgeVariant} size="sm">
              {headerInfo.badgeText}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
              Cloud Synced (Firestore)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Film className="w-7 h-7 text-red-600 dark:text-red-500" />
            {headerInfo.title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* Sync Info */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700/60 self-start sm:self-center">
          <Cloud className="w-4 h-4 text-blue-500" />
          <span>
            {isCloudConnected ? 'Connected to Cloud Firestore' : 'Reconnecting...'}
          </span>
          {lastSyncedAt && (
            <span className="hidden sm:inline opacity-70">
              • {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full min-w-0 flex-nowrap">
        <button
          type="button"
          onClick={() => setSelectedSubject('all')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border whitespace-nowrap shrink-0',
            selectedSubject === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <Film className="w-3.5 h-3.5" />
          <span>All Papers</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              selectedSubject === 'all'
                ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            )}
          >
            {sortedLectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('paper1')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border whitespace-nowrap shrink-0',
            selectedSubject === 'paper1'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paper 1: Accounting</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              selectedSubject === 'paper1'
                ? 'bg-emerald-800 text-emerald-100'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            )}
          >
            {paper1Lectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('paper2')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border whitespace-nowrap shrink-0',
            selectedSubject === 'paper2'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paper 2: Business Laws</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              selectedSubject === 'paper2'
                ? 'bg-violet-800 text-violet-100'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            )}
          >
            {paper2Lectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('paper4')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border whitespace-nowrap shrink-0',
            selectedSubject === 'paper4'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paper 4: Business Economics</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              selectedSubject === 'paper4'
                ? 'bg-amber-800 text-amber-100'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            )}
          >
            {paper4Lectures.length}
          </span>
        </button>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>Watch Progress</span>
            <span>{watchedCount} / {totalCount} Videos</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {watchPercentage}%
          </div>
          <ProgressBar
            value={watchPercentage}
            size="sm"
            colorHex={
              selectedSubject === 'paper1'
                ? '#10B981'
                : selectedSubject === 'paper2'
                ? '#8B5CF6'
                : selectedSubject === 'paper4'
                ? '#F59E0B'
                : '#ef4444'
            }
          />
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>Completed Videos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {watchedCount}
          </div>
          <div className="text-xs text-zinc-500">
            {watchedCount === totalCount && totalCount > 0
              ? 'All lectures marked watched!'
              : `${remainingCount} videos left to watch`}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>Remaining Videos</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {remainingCount}
          </div>
          <div className="text-xs text-zinc-500">
            Synchronized directly with syllabus chapters
          </div>
        </Card>
      </div>

      {/* Controls: Search & Sub-Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          {(['all', 'unwatched', 'watched'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                filter === tab
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              )}
            >
              {tab === 'all'
                ? `All (${totalCount})`
                : tab === 'unwatched'
                ? `Unwatched (${remainingCount})`
                : `Watched (${watchedCount})`}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search lecture title or chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Lectures List Grid */}
      <div className="space-y-3">
        {filteredLectures.length === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <Film className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No lectures found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or switching the status filter tab.
            </p>
          </Card>
        ) : (
          filteredLectures.map((lecture) => {
            const subId = normalizeSubjectId(lecture.subjectId);
            const badgeVariant = subId === 'paper1' ? 'paper1' : subId === 'paper2' ? 'paper2' : 'paper4';

            return (
              <Card
                key={lecture.id}
                className={cn(
                  'p-4 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4',
                  lecture.watched
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 opacity-80'
                    : 'bg-white dark:bg-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-700'
                )}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* YouTube Thumbnail Preview Trigger */}
                  <div
                    onClick={() => setActivePreviewLecture(lecture)}
                    className="relative w-28 sm:w-36 aspect-video bg-zinc-900 rounded-md overflow-hidden shrink-0 cursor-pointer group shadow-xs border border-zinc-200 dark:border-zinc-700/60"
                    title="Click to play embedded preview"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${lecture.youtubeId}/mqdefault.jpg`}
                      alt={lecture.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-8 h-8 rounded-md bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    {lecture.watched && (
                      <div className="absolute top-1 left-1 bg-emerald-600/90 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                        Watched
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={badgeVariant} size="sm">
                        Lec {lecture.order}
                      </Badge>
                      <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60">
                        {lecture.curriculumMapping}
                      </span>
                    </div>

                    <h4
                      className={cn(
                        'text-sm font-semibold break-words',
                        lecture.watched
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-100'
                      )}
                    >
                      {lecture.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        Uploaded {formatUploadDate(lecture.uploadDate)}
                      </span>
                      {lecture.watchedAt && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          • Watched {lecture.watchedAt.split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <a
                    href={lecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>

                  <Button
                    size="sm"
                    variant={lecture.watched ? 'outline' : 'primary'}
                    onClick={() => toggleLectureWatched(lecture.id)}
                    leftIcon={
                      lecture.watched ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )
                    }
                  >
                    {lecture.watched ? 'Watched' : 'Mark Watched'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Embedded YouTube Preview Modal */}
      {activePreviewLecture && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActivePreviewLecture(null)}
        >
          <div
            className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="min-w-0 pr-4">
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider block">
                  YouTube Lecture Player
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {activePreviewLecture.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewLecture(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-md text-sm font-semibold"
              >
                Close ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activePreviewLecture.youtubeId}?autoplay=1`}
                title={activePreviewLecture.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 flex items-center justify-between bg-zinc-950 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                <span>Mapping: </span>
                <span className="text-zinc-200 font-medium">
                  {activePreviewLecture.curriculumMapping}
                </span>
              </div>
              <Button
                size="sm"
                variant={activePreviewLecture.watched ? 'outline' : 'primary'}
                onClick={() => {
                  toggleLectureWatched(activePreviewLecture.id);
                  setActivePreviewLecture((prev) => (prev ? { ...prev, watched: !prev.watched } : null));
                }}
              >
                {activePreviewLecture.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
