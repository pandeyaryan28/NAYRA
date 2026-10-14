import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSessionView } from '@/views/ca-tracker/components/exercises/ExerciseSessionView';
import { CrossVerificationReview } from '@/views/ca-tracker/components/exercises/CrossVerificationReview';
import { ChapterExerciseHub } from '@/views/ca-tracker/components/exercises/ChapterExerciseHub';
import { QuestionPalette } from '@/views/ca-tracker/components/exercises/QuestionPalette';
import { AuthProvider } from '@/context/AuthContext';
import { CATrackerProvider } from '@/context/CATrackerContext';
import { CAChecklistTab } from '@/views/ca-tracker/CAChecklistTab';
import { CADashboardTab } from '@/views/ca-tracker/CADashboardTab';
import { CATrackerView } from '@/views/CATrackerView';
import {
  economicsExercises,
  calculateAttemptMetrics,
  saveExerciseAttempt,
  loadExerciseAttempts,
  getBestAttempt,
  getChapterByNumber,
} from '@/lib/ca/exerciseStorage';
import { ExerciseQuestion, ExerciseAttempt } from '@/types/ca';

const mockQuestions: ExerciseQuestion[] = [
  {
    id: 'beco-ch01-q001',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 1,
    questionText: 'Economists regard decision making as important because:',
    options: [
      { key: 'a', text: 'The resources required to satisfy our wants are finite.' },
      { key: 'b', text: 'It is crucial to understand allocation of scarce resources.' },
      { key: 'c', text: 'Resources have alternative uses.' },
      { key: 'd', text: 'All the above.' },
    ],
    correctOption: 'd',
    explanation: 'Decision making arises because resources are scarce and have alternative uses, making all above choices valid.',
  },
  {
    id: 'beco-ch01-q002',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 2,
    questionText: 'Business Economics is defined as:',
    options: [
      { key: 'a', text: 'Abstract and purely theoretical.' },
      { key: 'b', text: 'Practical application of economic theory in business decision making.' },
      { key: 'c', text: 'A tool unrelated to managerial decisions.' },
      { key: 'd', text: 'None of the above.' },
    ],
    correctOption: 'b',
    explanation: 'Business economics bridges economic theory with business practice for managerial decision making.',
  },
];

describe('NAYRA Built-in CA Tracker — Digital Economics Exercises Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Dataset Integrity & Blueprint Validation', () => {
    it('verifies all 617 questions across all 10 chapters are loaded and valid', () => {
      expect(economicsExercises.totalQuestions).toBe(617);
      expect(economicsExercises.totalChapters).toBe(10);
      expect(economicsExercises.negativeMarking).toBe(0.25);
      expect(economicsExercises.marksPerQuestion).toBe(1.0);
      expect(economicsExercises.chapters.length).toBe(10);

      let countedQuestions = 0;
      economicsExercises.chapters.forEach((chapter) => {
        expect(chapter.chapterNumber).toBeGreaterThanOrEqual(1);
        expect(chapter.chapterNumber).toBeLessThanOrEqual(10);
        expect(chapter.title.length).toBeGreaterThan(0);
        countedQuestions += chapter.questions.length;

        chapter.questions.forEach((q) => {
          expect(q.id).toBeDefined();
          expect(q.questionText).toBeTruthy();
          expect(q.options.length).toBe(4);
          expect(['a', 'b', 'c', 'd']).toContain(q.correctOption.toLowerCase());
          expect(q.explanation.length).toBeGreaterThan(0);
        });
      });

      expect(countedQuestions).toBe(617);
    });

    it('verifies multi-unit structure for Chapters 6, 7, 8, and 9', () => {
      const ch6 = getChapterByNumber(6);
      const ch7 = getChapterByNumber(7);
      const ch8 = getChapterByNumber(8);
      const ch9 = getChapterByNumber(9);

      expect(ch6?.hasUnits).toBe(true);
      expect(ch6?.units.length).toBe(2);

      expect(ch7?.hasUnits).toBe(true);
      expect(ch7?.units.length).toBe(4);

      expect(ch8?.hasUnits).toBe(true);
      expect(ch8?.units.length).toBe(3);

      expect(ch9?.hasUnits).toBe(true);
      expect(ch9?.units.length).toBe(5);
    });
  });

  describe('2. ICAI Scoring and LocalStorage Persistence', () => {
    it('calculates correct scaled scores with -0.25 negative marking', () => {
      const perfectAttempt = calculateAttemptMetrics({
        chapterNumber: 1,
        chapterId: 'eco-ch-01',
        chapterTitle: 'Nature & Scope',
        mode: 'exam',
        questions: mockQuestions,
        selectedAnswers: {
          'beco-ch01-q001': 'd', // correct
          'beco-ch01-q002': 'b', // correct
        },
        markedForReview: {},
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 60,
      });

      expect(perfectAttempt.score).toBe(2);
      expect(perfectAttempt.scaledScore).toBe(2.0);
      expect(perfectAttempt.accuracyPercentage).toBe(100);
      expect(perfectAttempt.correctCount).toBe(2);
      expect(perfectAttempt.incorrectCount).toBe(0);

      // 1 correct, 1 incorrect
      const mixedAttempt = calculateAttemptMetrics({
        chapterNumber: 1,
        chapterId: 'eco-ch-01',
        chapterTitle: 'Nature & Scope',
        mode: 'exam',
        questions: mockQuestions,
        selectedAnswers: {
          'beco-ch01-q001': 'd', // correct (+1.0)
          'beco-ch01-q002': 'a', // incorrect (-0.25)
        },
        markedForReview: {},
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 60,
      });

      expect(mixedAttempt.score).toBe(1);
      expect(mixedAttempt.scaledScore).toBe(0.75); // 1.0 - 0.25
      expect(mixedAttempt.accuracyPercentage).toBe(50);
      expect(mixedAttempt.correctCount).toBe(1);
      expect(mixedAttempt.incorrectCount).toBe(1);
    });

    it('persists attempts and accurately retrieves the best attempt', () => {
      expect(loadExerciseAttempts()).toEqual([]);

      const attempt1 = calculateAttemptMetrics({
        chapterNumber: 1,
        chapterId: 'eco-ch-01',
        chapterTitle: 'Nature & Scope',
        mode: 'practice',
        questions: mockQuestions,
        selectedAnswers: { 'beco-ch01-q001': 'd' }, // 1 correct, 0 incorrect = 1.0
        markedForReview: {},
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 60,
      });
      saveExerciseAttempt(attempt1);

      const attempt2 = calculateAttemptMetrics({
        chapterNumber: 1,
        chapterId: 'eco-ch-01',
        chapterTitle: 'Nature & Scope',
        mode: 'exam',
        questions: mockQuestions,
        selectedAnswers: { 'beco-ch01-q001': 'd', 'beco-ch01-q002': 'b' }, // 2 correct = 2.0
        markedForReview: {},
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 90,
      });
      saveExerciseAttempt(attempt2);

      const loaded = loadExerciseAttempts();
      expect(loaded.length).toBe(2);

      const best = getBestAttempt(1);
      expect(best?.id).toBe(attempt2.id);
      expect(best?.scaledScore).toBe(2.0);
    });
  });

  describe('3. ExerciseSessionView & Keyboard Shortcuts Interaction', () => {
    it('handles interactive option selection, mark for review, and answer reveal', () => {
      const handleComplete = vi.fn();
      const handleExit = vi.fn();

      render(
        <ExerciseSessionView
          chapterNumber={1}
          chapterId="eco-ch-01"
          chapterTitle="Nature & Scope of Business Economics"
          mode="practice"
          questions={mockQuestions}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      );

      // Check header and question progress
      expect(screen.getByText(/Progress: 1 of 2/i)).toBeInTheDocument();
      expect(screen.getByText(/50% Complete/i)).toBeInTheDocument();
      expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();

      // Click option D
      const optionD = screen.getByText(/All the above\./i);
      fireEvent.click(optionD);

      // Mark for review
      const markButton = screen.getByRole('button', { name: /Mark for Review/i });
      fireEvent.click(markButton);
      expect(screen.getByRole('button', { name: /Marked for Review/i })).toBeInTheDocument();

      // Practice mode explanation
      const checkAnswerBtn = screen.getByRole('button', { name: /Check Answer & Explanation/i });
      fireEvent.click(checkAnswerBtn);
      expect(screen.getByText(/Correct Answer!/i)).toBeInTheDocument();
      expect(screen.getByText(/Decision making arises because resources are scarce/i)).toBeInTheDocument();
    });

    it('supports full keyboard shortcuts: 1-4, M, Backspace, arrows', () => {
      render(
        <ExerciseSessionView
          chapterNumber={1}
          chapterId="eco-ch-01"
          chapterTitle="Nature & Scope of Business Economics"
          mode="practice"
          questions={mockQuestions}
          onComplete={vi.fn()}
          onExit={vi.fn()}
        />
      );

      // Press '4' key to select option D
      fireEvent.keyDown(window, { key: '4' });
      const optionD = screen.getByText(/All the above\./i).closest('button');
      expect(optionD?.className).toContain('border-zinc-900');

      // Press 'm' to toggle mark for review
      fireEvent.keyDown(window, { key: 'm' });
      expect(screen.getByRole('button', { name: /Marked for Review/i })).toBeInTheDocument();

      // Press 'backspace' to clear selection
      fireEvent.keyDown(window, { key: 'backspace' });
      expect(optionD?.className).not.toContain('border-zinc-900');

      // Press 'c' with no selection active -> selects option C
      fireEvent.keyDown(window, { key: 'c' });
      const optionC = screen.getByText(/Resources have alternative uses\./i).closest('button');
      expect(optionC?.className).toContain('border-zinc-900');

      // Press 'c' while option C is selected -> clears selection
      fireEvent.keyDown(window, { key: 'c' });
      expect(optionC?.className).not.toContain('border-zinc-900');

      // Press '2' to select option B, then press 'c' to clear
      fireEvent.keyDown(window, { key: '2' });
      const optionB = screen.getByText(/It is crucial to understand allocation of scarce resources\./i).closest('button');
      expect(optionB?.className).toContain('border-zinc-900');
      fireEvent.keyDown(window, { key: 'c' });
      expect(optionB?.className).not.toContain('border-zinc-900');

      // Press 'ArrowRight' to move to Question 2
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(screen.getByText(/Business Economics is defined as:/i)).toBeInTheDocument();

      // Press 'ArrowLeft' to move back to Question 1
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();
    });
  });

  describe('4. QuestionPalette Internal Filtering', () => {
    it('filters palette questions by Answered, Marked, and Unanswered in session mode', () => {
      const handleSelect = vi.fn();

      render(
        <QuestionPalette
          questions={mockQuestions}
          currentIndex={0}
          selectedAnswers={{ 'beco-ch01-q001': 'd' }}
          markedForReview={{ 'beco-ch01-q001': true }}
          onSelectQuestion={handleSelect}
          isReviewMode={false}
        />
      );

      // In session mode, verify internal filter tabs exist
      expect(screen.getByRole('button', { name: /Answered \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Marked \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pending \(1\)/i })).toBeInTheDocument();

      // Clicking Pending (1) should only show Question 2 button in the grid
      fireEvent.click(screen.getByRole('button', { name: /Pending \(1\)/i }));
      expect(screen.getByRole('button', { name: /Jump to question 2/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Jump to question 1/i })).not.toBeInTheDocument();
    });
  });

  describe('5. CrossVerificationReview & Results Matrix', () => {
    it('renders KPI strip, amber marked border, and stylized conceptual callout', () => {
      const mockAttempt: ExerciseAttempt = {
        id: 'review-test-1',
        chapterNumber: 1,
        chapterId: 'eco-ch-01',
        chapterTitle: 'Nature & Scope of Business Economics',
        mode: 'exam',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 120,
        selectedAnswers: {
          'beco-ch01-q001': 'd', // correct
          'beco-ch01-q002': 'a', // incorrect
        },
        markedForReview: {
          'beco-ch01-q001': true,
        },
        score: 1,
        scaledScore: 0.75,
        totalQuestions: 2,
        attemptedCount: 2,
        correctCount: 1,
        incorrectCount: 1,
        unattemptedCount: 0,
        accuracyPercentage: 50,
      };

      render(
        <AuthProvider>
          <CATrackerProvider>
            <CrossVerificationReview
              attempt={mockAttempt}
              questions={mockQuestions}
              onRetake={vi.fn()}
              onBackToHub={vi.fn()}
            />
          </CATrackerProvider>
        </AuthProvider>
      );

      // KPI scores
      expect(screen.getByText(/0.75/i)).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();

      // Marked for review badge & toggle button
      expect(screen.getAllByText(/Marked for Review/i).length).toBeGreaterThan(0);

      // Filter tabs
      const markedFilter = screen.getByRole('button', { name: /Filter: Marked for Review/i });
      expect(markedFilter).toBeInTheDocument();

      // One-click subset practice buttons
      expect(screen.getByRole('button', { name: /Practice Marked Only \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Practice Incorrect Only \(1\)/i })).toBeInTheDocument();

      // Conceptual explanation callout box
      expect(screen.getAllByText(/ICAI Conceptual Explanation & Reasoning/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Decision making arises because resources are scarce/i)).toBeInTheDocument();
    });
  });

  describe('6. Full App Tab & Navigation Integration', () => {
    it('renders CATrackerView with dedicated Exercises sub-tab and switches views', () => {
      render(
        <AuthProvider>
          <CATrackerProvider>
            <CATrackerView />
          </CATrackerProvider>
        </AuthProvider>
      );

      // Verify the sub-tab "Exercises" with badge "617 Qs" exists in navigation
      const exercisesTabBtn = screen.getByRole('button', { name: /^Exercises/i });
      expect(exercisesTabBtn).toBeInTheDocument();
      expect(screen.getByText(/617 Qs/i)).toBeInTheDocument();

      // Click to navigate to Exercises tab
      fireEvent.click(exercisesTabBtn);

      // Exercises Hub should now be active
      expect(screen.getByText(/Digital Exercise & Practice Hub/i)).toBeInTheDocument();
      expect(screen.getByText(/Paper 4 • Business Economics/i)).toBeInTheDocument();
    });

    it('renders direct Exercise buttons in CAChecklistTab for Paper 4 chapters', () => {
      const handleNavigateToExercise = vi.fn();

      render(
        <AuthProvider>
          <CATrackerProvider>
            <CAChecklistTab
              initialSubjectId="paper4"
              onNavigateToExercise={handleNavigateToExercise}
            />
          </CATrackerProvider>
        </AuthProvider>
      );

      // Verify direct "Exercise" buttons are rendered for Paper 4
      const exerciseButtons = screen.getAllByRole('button', { name: /Practice Digital Exercise for Chapter/i });
      expect(exerciseButtons.length).toBeGreaterThan(0);

      // Click the first chapter exercise button
      fireEvent.click(exerciseButtons[0]);
      expect(handleNavigateToExercise).toHaveBeenCalled();
    });

    it('renders the Economics Exercises quick-access card on CADashboardTab', () => {
      const handleNavigateTab = vi.fn();

      render(
        <AuthProvider>
          <CATrackerProvider>
            <CADashboardTab onNavigateTab={handleNavigateTab} />
          </CATrackerProvider>
        </AuthProvider>
      );

      expect(screen.getByText(/Paper 4 • Business Economics/i)).toBeInTheDocument();
      expect(screen.getByText(/Official ICAI Study Module MCQ Bank/i)).toBeInTheDocument();

      const practiceBtn = screen.getByRole('button', { name: /Practice Exercises/i });
      expect(practiceBtn).toBeInTheDocument();

      fireEvent.click(practiceBtn);
      expect(handleNavigateTab).toHaveBeenCalledWith('exercises');
    });
  });
});
