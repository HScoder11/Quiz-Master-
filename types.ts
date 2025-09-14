
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: "string";
    C: "string";
    D: "string";
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}
