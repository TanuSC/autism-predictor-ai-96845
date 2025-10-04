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
  'Does your child make eye contact when you call their name?',
  'Does your child show interest in other children or prefer to play alone?',
  'Does your child use gestures like pointing or waving to communicate?',
  'Does your child understand and follow simple instructions?',
  'Does your child have difficulty with changes in routine or environment?',
  'Does your child show repetitive behaviors or intense interests in specific topics?',
  'Does your child have conversations or mainly speaks in single words?',
  'Does your child respond appropriately to emotions of others?',
  'Does your child have unusual sensory reactions (sounds, textures, lights)?',
  'Does your child engage in pretend or imaginative play?'
];