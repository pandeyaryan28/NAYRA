import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSessionView } from '@/views/ca-tracker/components/exercises/ExerciseSessionView';
import { CrossVerificationReview } from '@/views/ca-tracker/components/exercises/CrossVerificationReview';
import { ChapterExerciseHub } from '@/views/ca-tracker/components/exercises/ChapterExerciseHub';
import { AuthProvider } from '@/context/AuthContext';
import { CATrackerProvider } from '@/context/CATrackerContext';
import { CAChecklistTab } from '@/views/ca-tracker/CAChecklistTab';
import { CADashboardTab } from '@/views/ca-tracker/CADashboardTab';
import { CATrackerView } from '@/views/CATrackerView';
import {
  getSubjectExercises,
  calculateAttemptMetrics,
  saveExerciseAttempt,
  loadExerciseAttempts,
  getBestAttempt,
  getChapterByNumber,
} from '@/lib/ca/exerciseStorage';
import { ExerciseQuestion, ExerciseAttempt } from '@/types/ca';

const mockQuantQuestions: ExerciseQuestion[] = [
  {
    id: 'qa-ch01-u1-q001',
    chapterNumber: 1,
    chapterId: 'qa-ch-01',
    chapterTitle: 'Ratio and Proportion, Indices, Logarithms',
    questionNumber: 1,
    unitNumberInChapter: 1,
    unitTitle: 'Unit 1: Exercise 1(A) - Ratio',
    questionText: 'The inverse ratio of 11 : 15 is',
    options: [
      { key: 'a', text: '15 : 11' },
      { key: 'b', text: '11 : 15' },
      { key: 'c', text: '121 : 225' },
      { key: 'd', text: 'none of these' },
    ],
    correctOption: 'a',
    explanation: 'The inverse ratio of a : b is b : a. Hence, the inverse of 11 : 15 is 15 : 11. Therefore, option (A) is correct.',
  },
  {
    id: 'qa-ch01-u1-q002',
    chapterNumber: 1,
    chapterId: 'qa-ch-01',
    chapterTitle: 'Ratio and Proportion, Indices, Logarithms',
    questionNumber: 2,
    unitNumberInChapter: 1,
    unitTitle: 'Unit 1: Exercise 1(A) - Ratio',
    questionText: 'The ratio of two quantities is 3 : 4. If the antecedent is 15, the consequent is',
    options: [
      { key: 'a', text: '16' },
      { key: 'b', text: '60' },
      { key: 'c', text: '22' },
      { key: 'd', text: '20' },
    ],
    correctOption: 'd',
    explanation: 'Ratio is 3/4 = 15/x, giving 3x = 60, thus x = 20. Therefore, option (D) is correct.',
  },
];

describe('NAYRA Built-in CA Tracker — Paper 3 Quantitative Aptitude Exercises Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Dataset Integrity & Blueprint Validation', () => {
    it('verifies all 1,930 questions across all 18 chapters are loaded and valid', () => {
      const quantData = getSubjectExercises('paper3');
      expect(quantData.subjectId).toBe('paper3');
      expect(quantData.paperNumber).toBe(3);
      expect(quantData.totalChapters).toBe(18);
      expect(quantData.totalQuestions).toBe(1930);
      expect(quantData.chapters.length).toBe(18);

      let questionCount = 0;
      quantData.chapters.forEach((ch) => {
        expect(ch.totalQuestions).toBe(ch.questions.length);
        questionCount += ch.questions.length;
        ch.questions.forEach((q) => {
          expect(q.options.length).toBe(4);
          expect(['a', 'b', 'c', 'd']).toContain(q.correctOption);
          expect(q.explanation.length).toBeGreaterThan(10);
        });
      });
      expect(questionCount).toBe(1930);
    });

    it('verifies multi-unit structure for Quantitative Aptitude chapters', () => {
      const quantData = getSubjectExercises('paper3');
      const multiUnitChapters = quantData.chapters.filter((ch) => ch.hasUnits);
      expect(multiUnitChapters.length).toBe(13); // Ch 1, 2, 4, 5, 6, 7, 8, 13, 14, 15, 16, 17, 18

      // Check Ch 1 has 5 units (A, B, C, D, Additional)
      const ch1 = quantData.chapters.find((c) => c.chapterNumber === 1)!;
      expect(ch1.units.length).toBe(5);

      // Check Ch 8 has 3 units (Differential Calculus, Integral Calculus, Applications)
      const ch8 = quantData.chapters.find((c) => c.chapterNumber === 8)!;
      expect(ch8.units.length).toBe(3);
    });
  });

  describe('2. ICAI Scoring and Storage Persistence', () => {
    it('calculates correct scaled scores with -0.25 negative marking for Paper 3', () => {
      const result = calculateAttemptMetrics({
        subjectId: 'paper3',
        chapterNumber: 1,
        chapterId: 'qa-ch-01',
        chapterTitle: 'Ratio and Proportion',
        mode: 'exam',
        questions: mockQuantQuestions,
        selectedAnswers: {
          'qa-ch01-u1-q001': 'a', // Correct (+1.00)
          'qa-ch01-u1-q002': 'a', // Incorrect (-0.25)
        },
        markedForReview: {},
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 45,
      });

      expect(result.subjectId).toBe('paper3');
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(1);
      expect(result.scaledScore).toBe(0.75); // 1.0 - 0.25
      expect(result.accuracyPercentage).toBe(50);
    });

    it('persists and retrieves best attempt filtered by Paper 3 subjectId', () => {
      const attempt: ExerciseAttempt = {
        id: 'qa-att-1',
        subjectId: 'paper3',
        chapterNumber: 1,
        chapterId: 'qa-ch-01',
        chapterTitle: 'Ratio and Proportion',
        mode: 'exam',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 60,
        selectedAnswers: { 'qa-ch01-u1-q001': 'a' },
        markedForReview: {},
        score: 1,
        scaledScore: 1.0,
        totalQuestions: 25,
        attemptedCount: 1,
        correctCount: 1,
        incorrectCount: 0,
        unattemptedCount: 24,
        accuracyPercentage: 100,
      };

      saveExerciseAttempt(attempt);
      const best = getBestAttempt(1, null, 'paper3');
      expect(best).toBeDefined();
      expect(best?.id).toBe('qa-att-1');
      expect(best?.scaledScore).toBe(1.0);

      // Other subjects should not return this attempt
      const bestEco = getBestAttempt(1, null, 'paper4');
      expect(bestEco).toBeUndefined();
    });
  });

  describe('3. ChapterExerciseHub Subject Switching and Apple/SwiftUI Aesthetics', () => {
    it('renders Apple segmented control and toggles between Paper 3 and Paper 4', () => {
      const handleStartSession = vi.fn();
      const handleReviewAttempt = vi.fn();

      render(
        <ChapterExerciseHub
          onStartSession={handleStartSession}
          onReviewAttempt={handleReviewAttempt}
        />
      );

      // Defaults to Paper 3: Quantitative Aptitude
      expect(screen.getAllByText(/Quantitative Aptitude/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/1,930 Qs/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Exam Mode/i }).length).toBe(18);

      // Switch to Paper 4: Business Economics via pill
      const paper4Pill = screen.getByRole('button', { name: /Paper 4 • Business Economics/i });
      fireEvent.click(paper4Pill);

      expect(screen.getAllByText(/Business Economics/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/617 Qs/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Exam Mode/i }).length).toBe(10);

      // Switch back to Paper 3
      const paper3Pill = screen.getByRole('button', { name: /Paper 3 • Quantitative Aptitude/i });
      fireEvent.click(paper3Pill);

      expect(screen.getAllByRole('button', { name: /Exam Mode/i }).length).toBe(18);
    });
  });

  describe('4. Full Navigation and Dashboard Integration', () => {
    it('renders direct Exercise buttons in CAChecklistTab for Paper 3 chapters', () => {
      const handleNavigateToExercise = vi.fn();

      render(
        <AuthProvider>
          <CATrackerProvider>
            <CAChecklistTab
              initialSubjectId="paper3"
              onNavigateToExercise={handleNavigateToExercise}
            />
          </CATrackerProvider>
        </AuthProvider>
      );

      // Find exercise buttons rendered for Paper 3 chapters
      const exerciseButtons = screen.getAllByRole('button', { name: /Practice Digital Exercise/i });
      expect(exerciseButtons.length).toBeGreaterThan(0);

      fireEvent.click(exerciseButtons[0]);
      expect(handleNavigateToExercise).toHaveBeenCalled();
      expect(handleNavigateToExercise.mock.calls[0][2]).toBe('paper3');
    });

    it('renders combined 2,547 MCQs in CADashboardTab quick-access banner card', () => {
      render(
        <AuthProvider>
          <CATrackerProvider>
            <CADashboardTab />
          </CATrackerProvider>
        </AuthProvider>
      );

      expect(screen.getAllByText(/2,547/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Total MCQs/i)).toBeInTheDocument();
      expect(screen.getByText(/Paper 3 • Quantitative Aptitude/i)).toBeInTheDocument();
      expect(screen.getByText(/Paper 4 • Business Economics/i)).toBeInTheDocument();
    });
  });
});
