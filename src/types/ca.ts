/**
 * CA Foundation Exam Preparation Tracker - Comprehensive Domain Types
 * Authoritative Schema for ICAI New Scheme (4 Papers, 46 Chapters, 99 Units/Topics)
 */

export type SubjectId = 'paper1' | 'paper2' | 'paper3' | 'paper4';

export type SubjectPaperType = 'Descriptive' | 'Objective';

export interface SubjectColorConfig {
  primary: string;
  light: string;
  dark: string;
  accent: string;
  border: string;
  glow?: string;
  bg?: string;
  darkBg?: string;
}

export interface SubjectMeta {
  id: SubjectId;
  paperNumber: 1 | 2 | 3 | 4;
  code: string;
  name: string;
  shortName: string;
  type: SubjectPaperType;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  color: SubjectColorConfig;
  icon: string;
  description: string;
  estimatedStudyHours: number;
}

export type TopicStatus = 'pending' | 'in_progress' | 'completed';

export interface Topic {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterName: string;
  topicNumber?: number;
  unitNumber?: number;
  isUnit?: boolean;
  title: string;
  status: TopicStatus;
  estimatedMinutes?: number;
  estimatedHours?: number;
  targetDate?: string;
  startedAt?: string;
  completedAt?: string;
  order: number;
  isCustom?: boolean;
  learningObjectives?: string[];
  hasPracticalProblems?: boolean;
  hasTheoryQuestions?: boolean;
  revisionCycleDefaultDays?: number[];
  notes?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  videoUrl?: string;
  videoTitle?: string;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  chapterNumber: number;
  title: string;
  hasSubunits?: boolean;
  partId?: string;
  partName?: string;
  icaiWeightage?: {
    minPercentage: number;
    maxPercentage: number;
    typicalMarks: string;
  };
  estimatedStudyHours: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  importance?: 'Low' | 'Medium' | 'High' | 'Essential';
  description?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  videoUrl?: string;
  videoTitle?: string;
  topics: Topic[];
  completedTopicsCount?: number;
  totalTopicsCount?: number;
  progressPercentage?: number;
}

export interface SubjectSyllabus {
  subject: SubjectMeta;
  chapters: Chapter[];
}

export interface SubjectGroup {
  meta: SubjectMeta;
  chapters: Chapter[];
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  progressPercentage: number;
  totalEstimatedHours: number;
  completedEstimatedHours: number;
}

export type TestType = 'chapter' | 'unit' | 'mock';

export interface TestRecord {
  id: string;
  title: string;
  subjectId: SubjectId;
  testType: TestType;
  chapterId?: string;
  dateAttempted: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  negativeMarksDeducted?: number;
  timeTakenMinutes?: number;
  notes?: string;
  weakTopics?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface RevisionRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  chapterId?: string;
  chapterName?: string;
  subjectId: SubjectId;
  cycle: number;
  lastRevisedDate: string;
  nextTargetDate: string;
  confidence: ConfidenceLevel;
  mistakesNotes?: string;
  keyFormulasReviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppTheme = 'dark' | 'light' | 'system';

export interface SpacedIntervalsConfig {
  low: number;
  medium: number;
  high: number;
}

export interface CAUserSettings {
  userName?: string;
  examDate: string;
  dailyGoalHours: number;
  theme: AppTheme;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  autoScheduleRevisions: boolean;
  defaultRevisionIntervals: SpacedIntervalsConfig;
  syllabusVersion: string;
  lastSyncedAt?: string;
}

export type ActionPlanItemType = 'lesson' | 'revision' | 'test' | 'schedule';

export interface ActionPlanItem {
  id: string;
  type: ActionPlanItemType;
  title: string;
  subjectId?: SubjectId;
  subjectName: string;
  chapterName?: string;
  dueDate: string;
  isOverdue: boolean;
  isCompleted: boolean;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'normal';
  topicId?: string;
  topicIds?: string[];
  scheduleEntryId?: string;
  revisionId?: string;
  testId?: string;
  cycle?: number;
  notes?: string;
}

export interface SubjectProgressMetric {
  subjectId: SubjectId;
  name: string;
  shortName: string;
  code: string;
  paperNumber: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  percentage: number;
  color: string;
  totalEstimatedHours: number;
  completedEstimatedHours: number;
  isPassingProjected: boolean;
}

export interface DashboardMetrics {
  overallProgressPercentage: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  subjectProgress: Record<SubjectId, SubjectProgressMetric>;
  daysUntilExam: number;
  currentStreakDays: number;
  bestStreakDays: number;
  totalStudyHoursLogged: number;
  todayActionItemsTotal: number;
  todayActionItemsCompleted: number;
  recentTestsAveragePercentage: number;
  totalTestsLogged: number;
  totalRevisionsCompleted: number;
  aggregatePassingLikelihood: 'On Track' | 'Needs Attention' | 'At Risk';
}

export interface ScheduleEntry {
  id: string;
  date: string;
  displayDate: string;
  title: string;
  subjectId?: SubjectId;
  chapterId?: string;
  chapterName?: string;
  topicIds?: string[];
  isRevision?: boolean;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  order: number;
}

export interface Lecture {
  id: string;
  order: number;
  title: string;
  uploadDate: string;
  videoUrl: string;
  youtubeId: string;
  curriculumMapping: string;
  chapterId?: string;
  topicId?: string;
  subjectId: SubjectId;
  watched: boolean;
  watchedAt?: string;
  notes?: string;
  duration?: string;
}

export type ImportConflictResolution = 'merge' | 'overwrite' | 'skip';

export interface ImportExportPayload {
  version: string;
  appVersion: string;
  exportedAt: string;
  settings: CAUserSettings;
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures?: Lecture[];
  schedule?: ScheduleEntry[];
  customChapters?: Chapter[];
  metadata?: {
    totalTopics: number;
    completedTopics: number;
    totalTests: number;
    totalRevisions: number;
    totalLectures?: number;
    totalScheduleEntries?: number;
    schemaChecksum?: string;
  };
}

export interface ResetSyllabusOptions {
  preserveCustomTopics?: boolean;
  preserveTests?: boolean;
  preserveRevisions?: boolean;
  preserveSettings?: boolean;
  preserveLectures?: boolean;
  preserveSchedule?: boolean;
}

export interface DataState {
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures: Lecture[];
  schedule: ScheduleEntry[];
  settings: CAUserSettings;
  subjects: SubjectMeta[];
  chapters: Chapter[];
  isLoading: boolean;
  isSyncing: boolean;
  isCloudConnected?: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

export type DataAction =
  | { type: 'INITIALIZE_STATE'; payload: { topics: Topic[]; revisions: RevisionRecord[]; tests: TestRecord[]; lectures?: Lecture[]; schedule?: ScheduleEntry[]; settings: CAUserSettings } }
  | { type: 'SET_TOPICS'; payload: Topic[] }
  | { type: 'UPDATE_TOPIC_STATUS'; payload: { topicId: string; status: TopicStatus; customDate?: string } }
  | { type: 'BATCH_UPDATE_TOPIC_STATUS'; payload: { topicIds: string[]; status: TopicStatus; customDate?: string } }
  | { type: 'UPDATE_TOPIC'; payload: { topicId: string; updates: Partial<Topic> } }
  | { type: 'ADD_TOPIC'; payload: Topic }
  | { type: 'DELETE_TOPIC'; payload: { topicId: string } }
  | { type: 'SET_TESTS'; payload: TestRecord[] }
  | { type: 'ADD_TEST'; payload: TestRecord }
  | { type: 'UPDATE_TEST'; payload: { testId: string; updates: Partial<TestRecord> } }
  | { type: 'DELETE_TEST'; payload: { testId: string } }
  | { type: 'SET_REVISIONS'; payload: RevisionRecord[] }
  | { type: 'ADD_REVISION'; payload: RevisionRecord }
  | { type: 'UPDATE_REVISION'; payload: { revisionId: string; updates: Partial<RevisionRecord> } }
  | { type: 'ADVANCE_REVISION_CYCLE'; payload: { topicId: string; confidence: ConfidenceLevel; mistakesNotes?: string } }
  | { type: 'DELETE_REVISION'; payload: { revisionId: string } }
  | { type: 'SET_LECTURES'; payload: Lecture[] }
  | { type: 'TOGGLE_LECTURE_WATCHED'; payload: { lectureId: string; watched?: boolean } }
  | { type: 'SET_SCHEDULE'; payload: ScheduleEntry[] }
  | { type: 'TOGGLE_SCHEDULE_ENTRY'; payload: { entryId: string; completed?: boolean } }
  | { type: 'ADD_SCHEDULE_ENTRY'; payload: ScheduleEntry }
  | { type: 'UPDATE_SCHEDULE_ENTRY'; payload: { entryId: string; updates: Partial<ScheduleEntry> } }
  | { type: 'DELETE_SCHEDULE_ENTRY'; payload: { entryId: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<CAUserSettings> }
  | { type: 'RESET_SYLLABUS'; payload: { defaultTopics: Topic[]; options?: ResetSyllabusOptions } }
  | { type: 'IMPORT_DATA'; payload: { data: ImportExportPayload; mode: ImportConflictResolution } }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_CLOUD_CONNECTED'; payload: boolean }
  | { type: 'SET_LAST_SYNCED'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

export interface DataContextValue {
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures: Lecture[];
  schedule: ScheduleEntry[];
  settings: CAUserSettings;
  subjects: SubjectMeta[];
  chapters: Chapter[];
  metrics: DashboardMetrics;
  actionPlan: ActionPlanItem[];
  subjectGroups: Record<SubjectId, SubjectGroup>;
  isLoading: boolean;
  isSyncing: boolean;
  isCloudConnected?: boolean;
  lastSyncedAt?: string | null;
  error: string | null;
  syncWithCloud?: () => Promise<void>;
  setTopics: (topics: Topic[]) => void;
  updateTopicStatus: (topicId: string, status: TopicStatus, customDate?: string) => void;
  batchUpdateTopicStatus?: (topicIds: string[], status: TopicStatus, customDate?: string) => Promise<void>;
  updateTopic: (topicId: string, updates: Partial<Topic>) => void;
  addTopic: (topic: Omit<Topic, 'id' | 'order'> & { id?: string }) => void;
  deleteTopic: (topicId: string) => void;
  addTest: (testData: Omit<TestRecord, 'id' | 'percentage' | 'isPassed' | 'createdAt'>) => void;
  updateTest: (testId: string, updates: Partial<TestRecord>) => void;
  deleteTest: (testId: string) => void;
  addRevision: (revision: Omit<RevisionRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRevision: (revisionId: string, updates: Partial<RevisionRecord>) => void;
  advanceRevisionCycle: (topicId: string, confidence: ConfidenceLevel, mistakesNotes?: string) => void;
  deleteRevision: (revisionId: string) => void;
  toggleLectureWatched: (lectureId: string, watched?: boolean) => Promise<void>;
  setSchedule: (entries: ScheduleEntry[]) => void;
  toggleScheduleEntry: (entryId: string, completed?: boolean) => void;
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'order'> & { id?: string }) => void;
  updateScheduleEntry: (entryId: string, updates: Partial<ScheduleEntry>) => void;
  deleteScheduleEntry: (entryId: string) => void;
  updateSettings: (updates: Partial<CAUserSettings>) => Promise<void>;
  resetToDefaultSyllabus: (options?: ResetSyllabusOptions) => void;
  importData: (data: ImportExportPayload, mode?: ImportConflictResolution) => Promise<void>;
  exportData: (format?: 'json' | 'csv') => string;
}

