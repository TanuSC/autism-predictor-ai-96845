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
}

export const QUESTIONNAIRE_ITEMS = [
  'Does your child look at you when you call his/her name?',
  'How easy is it for you to get eye contact with your child?',
  'Does your child point to indicate that s/he wants something?',
  'Does your child point to share interest with you?',
  'Does your child pretend (e.g., care for dolls, talk on phone)?',
  'Does your child follow where you\'re looking?',
  'If you or someone else in the family is visibly upset, does your child show signs of wanting to comfort them?',
  'Would you describe your child\'s first words as typical?',
  'Does your child use simple gestures (e.g., wave goodbye)?',
  'Does your child stare at nothing with no apparent purpose?'
];