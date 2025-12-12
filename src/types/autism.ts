export interface AutismDataPoint {
  Age: number;
  Gender: 'M' | 'F';
  Q1: QuestionnaireResponse;
  Q2: QuestionnaireResponse;
  Q3: QuestionnaireResponse;
  Q4: QuestionnaireResponse;
  Q5: QuestionnaireResponse;
  Q6: QuestionnaireResponse;
  Q7: QuestionnaireResponse;
  Q8: QuestionnaireResponse;
  Q9: QuestionnaireResponse;
  Q10: QuestionnaireResponse;
  Total_Score: number;
  ASD_Label: 0 | 1;
}

export type QuestionnaireResponse = 'never' | 'rarely' | 'sometimes' | 'often' | 'always';

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

export interface ModelComparison extends ModelMetrics {
  name: string;
  description: string;
}

export interface PredictionInput {
  age: number;
  gender: 'M' | 'F';
  responses: QuestionnaireResponse[];
}

export interface PredictionResult {
  prediction: 0 | 1;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  riskPercentage?: number;
  scoreBreakdown?: {
    question: string;
    response: QuestionnaireResponse;
    score: number;
  }[];
  timestamp?: string;
}

export interface SessionHistory {
  id: string;
  timestamp: string;
  age: number;
  gender: 'M' | 'F';
  result: PredictionResult;
  totalScore: number;
}

export const QUESTIONNAIRE_ITEMS = [
  'Eye Contact - How often does the child avoid making eye contact with family members or others?',
  'Repetitive Movements - How often does the child show repeated movements like hand-flapping, rocking or spinning objects?',
  'Sensory Sensitivity - How often does the child react strongly to loud sounds, bright lights or certain textures?',
  'Change in Routine - How often does the child become upset when daily routines or activities are changed?',
  'Social Interaction - How often does the child prefer playing alone instead of joining other children?',
  'Communication - How often does the child struggle to understand simple instructions, gestures or tone of voice?',
  'Fixated Interests - How often does the child focus intensely on a specific object, toy or activity?',
  'Speech or Conversation Difficulties - How often does the child find it difficult to start or maintain a simple conversation?',
  'Understanding Emotions - How often does the child have trouble recognizing or responding to other people\'s feelings?',
  'Difficulty Shifting Attention - How often does the child have trouble moving from one activity to another without becoming upset?'
];