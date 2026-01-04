
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MATCHING = 'MATCHING'
}

export interface Option {
  text: string;
  feedback?: string;
}

export interface TrueFalseStatement {
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  // For Multiple Choice
  options?: Option[];
  correctIndex?: number;
  // For True/False
  statements?: TrueFalseStatement[];
  // For Short Answer
  correctAnswer?: string;
  // For Matching
  matchingPairs?: MatchingPair[];
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  theory: string; // HTML or Markdown formatted string
  questions: Question[];
}

export interface UserProgress {
  lessonId: string;
  completed: boolean;
  score: number;
}
