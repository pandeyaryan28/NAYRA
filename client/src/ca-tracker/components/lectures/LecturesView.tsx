import React, { useState, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  ExternalLink,
  Search,
  Cloud,
  Check,
  Film,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/CaDataContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { Lecture } from '../../types';
import { cn } from '../../lib/utils';

export type LectureFilter = 'all' | 'unwatched' | 'watched';

export const LecturesView: React.FC = () => {
  const { lectures, toggleLectureWatched, isCloudConnected, lastSyncedAt } = useData();
  const [filter, setFilter] = useState<LectureFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewLecture, setActivePreviewLecture] = useState<Lecture | null>(null);

  // Accounts lectures strictly ordered by upload date (as listed in Google Sheet rows 1 to 19)
  const accountsLectures = useMemo(() => {
    return [...(lectures || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [lectures]);

  const totalCount = accountsLectures.length;
  const watchedCount = accountsLectures.filter((l) => l.watched).length;
  const remainingCount = totalCount - watchedCount;
  const watchPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  const filteredLectures = useMemo(() => {
    return accountsLectures.filter((lec) => {
      // Status filter
      if (filter === 'watched' && !lec.watched) return false;
      if (filter === 'unwatched' && lec.watched) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = lec.title.toLowerCase().includes(q);
        const matchMapping = lec.curriculumMapping.toLowerCase().includes(q);
        return matchTitle || matchMapping;
      }

      return true;
    });
  }, [accountsLectures, filter, searchQuery]);

  const formatUploadDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString.split('T')[0];
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Cloud Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="paper1" size="sm">Paper 1: Accounting</Badge>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Synced (Firestore)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Film className="w-7 h-7 text-red-600 dark:text-red-500" />
            Accounts Lectures
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Curated One-Shot accountancy video series in chronological upload sequence, mapped to ICAI syllabus units.
          </p>
        </div>

        {/* Sync Info */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 self-start sm:self-center">
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

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Lectures</span>
            <Film className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalCount}</span>
            <span className="text-xs text-zinc-400 font-medium">First 19 Videos</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={100} size="sm" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Watched</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{watchedCount}</span>
            <span className="text-xs text-zinc-400 font-medium">/ {totalCount} completed</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={watchPercentage} colorHex="#10B981" size="sm" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Watch Completion</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{watchPercentage}%</span>
            <span className="text-xs text-zinc-400 font-medium">{remainingCount} left to watch</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={watchPercentage} subjectId="paper1" size="sm" />
          </div>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unwatched')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                filter === 'unwatched'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              Unwatched ({remainingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('watched')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                filter === 'watched'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              Watched ({watchedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lectures or chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>
        </div>
      </Card>

      {/* Embedded Video Player Modal (Optional In-App Viewer) */}
      {activePreviewLecture && (
        <Card className="p-4 border-2 border-red-500/30 bg-zinc-900 text-zinc-100 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-xs font-semibold text-zinc-200">
                Watching: {activePreviewLecture.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActivePreviewLecture(null)}
              className="text-xs text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded bg-zinc-800"
            >
              Close Player
            </button>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activePreviewLecture.youtubeId}?autoplay=1`}
              title={activePreviewLecture.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>
      )}

      {/* Lectures List - In Exact Chronological Upload Date Order */}
      <div className="space-y-3">
        {filteredLectures.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No lectures found</h3>
            <p className="text-xs text-zinc-400 mt-1">Try adjusting your filter or search query.</p>
          </Card>
        ) : (
          filteredLectures.map((lec) => (
            <Card
              key={lec.id}
              className={cn(
                'p-4 transition-all duration-200 hover:shadow-md border',
                lec.watched
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40'
                  : 'hover:border-zinc-300 dark:hover:border-zinc-700'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Sequence & Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Sequence Badge */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0',
                      lec.watched
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    )}
                  >
                    #{lec.order}
                  </div>

                  {/* Title & Metas */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-400 font-medium inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Uploaded {formatUploadDate(lec.uploadDate)}
                      </span>
                      {lec.watched && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" />
                          Watched
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {lec.title}
                    </h3>

                    {/* Mapped Curriculum Chapter & Unit */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-medium truncate" title={lec.curriculumMapping}>
                        {lec.curriculumMapping}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Inline Preview Player Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActivePreviewLecture(activePreviewLecture?.id === lec.id ? null : lec)}
                    className="text-xs"
                    title="Watch inside app"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </Button>

                  {/* Watch on YouTube Link */}
                  <a
                    href={lec.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                    title="Watch Lecture on YouTube"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    YouTube
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>

                  {/* Cloud Synced Watched Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleLectureWatched(lec.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                      lec.watched
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                    title={lec.watched ? 'Click to mark unwatched' : 'Click to mark as watched'}
                  >
                    {lec.watched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-zinc-400" />
                        <span>Mark Watched</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LecturesView;
