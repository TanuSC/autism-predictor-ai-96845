import Papa from 'papaparse';
import { AutismDataPoint, QuestionnaireResponse, ModelMetrics, ModelComparison } from '@/types/autism';

// Convert questionnaire responses to numerical values
export const responseToNumber = (response: QuestionnaireResponse): number => {
  const map = { never: 0, rarely: 1, sometimes: 2, often: 3, always: 4 };
  return map[response];
};

export const numberToResponse = (num: number): QuestionnaireResponse => {
  const responses: QuestionnaireResponse[] = ['never', 'rarely', 'sometimes', 'often', 'always'];
  return responses[Math.max(0, Math.min(4, Math.round(num)))];
};

// Load and parse CSV data
export const loadAutismDataset = async (): Promise<AutismDataPoint[]> => {
  try {
    const response = await fetch('/autism_dataset.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<AutismDataPoint>(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          if (field === 'Age' || field === 'Total_Score') return parseInt(value);
          if (field === 'ASD_Label') return parseInt(value) as 0 | 1;
          return value;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    throw new Error(`Failed to load dataset: ${error}`);
  }
};

// Simple logistic regression implementation
export class SimpleLogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate = 0.01;
  private iterations = 1000;

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  fit(X: number[][], y: number[]): void {
    const m = X.length;
    const n = X[0].length;
    
    // Initialize weights
    this.weights = new Array(n).fill(0);
    this.bias = 0;

    // Gradient descent
    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = X.map(features => {
        const z = features.reduce((sum, feature, i) => sum + feature * this.weights[i], 0) + this.bias;
        return this.sigmoid(z);
      });

      // Calculate gradients
      const dw = new Array(n).fill(0);
      let db = 0;

      for (let i = 0; i < m; i++) {
        const error = predictions[i] - y[i];
        for (let j = 0; j < n; j++) {
          dw[j] += error * X[i][j];
        }
        db += error;
      }

      // Update weights
      for (let j = 0; j < n; j++) {
        this.weights[j] -= (this.learningRate * dw[j]) / m;
      }
      this.bias -= (this.learningRate * db) / m;
    }
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      const z = features.reduce((sum, feature, i) => sum + feature * this.weights[i], 0) + this.bias;
      return this.sigmoid(z) >= 0.5 ? 1 : 0;
    });
  }

  predictProba(X: number[][]): number[] {
    return X.map(features => {
      const z = features.reduce((sum, feature, i) => sum + feature * this.weights[i], 0) + this.bias;
      return this.sigmoid(z);
    });
  }
}

// Simple Random Forest implementation (basic version)
export class SimpleRandomForest {
  private trees: SimpleDecisionTree[] = [];
  private nTrees = 10;

  fit(X: number[][], y: number[]): void {
    this.trees = [];
    
    for (let i = 0; i < this.nTrees; i++) {
      // Bootstrap sampling
      const bootIndices = Array.from({ length: X.length }, () => 
        Math.floor(Math.random() * X.length)
      );
      const bootX = bootIndices.map(idx => X[idx]);
      const bootY = bootIndices.map(idx => y[idx]);
      
      const tree = new SimpleDecisionTree();
      tree.fit(bootX, bootY);
      this.trees.push(tree);
    }
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      const predictions = this.trees.map(tree => tree.predict([features])[0]);
      const sum = predictions.reduce((a, b) => a + b, 0);
      return sum >= this.nTrees / 2 ? 1 : 0;
    });
  }

  predictProba(X: number[][]): number[] {
    return X.map(features => {
      const predictions = this.trees.map(tree => tree.predict([features])[0]);
      return predictions.reduce((a, b) => a + b, 0) / this.nTrees;
    });
  }
}

// Simple Decision Tree implementation
class SimpleDecisionTree {
  private threshold = 0.5;
  private feature = 0;
  private prediction = 0;

  fit(X: number[][], y: number[]): void {
    if (X.length === 0) return;
    
    // Simple implementation: find best threshold for each feature
    let bestGini = 1;
    
    for (let f = 0; f < X[0].length; f++) {
      const values = X.map(x => x[f]).sort((a, b) => a - b);
      
      for (let i = 0; i < values.length - 1; i++) {
        const thresh = (values[i] + values[i + 1]) / 2;
        const leftY = y.filter((_, idx) => X[idx][f] <= thresh);
        const rightY = y.filter((_, idx) => X[idx][f] > thresh);
        
        if (leftY.length === 0 || rightY.length === 0) continue;
        
        const gini = this.calculateGini(leftY, rightY);
        if (gini < bestGini) {
          bestGini = gini;
          this.feature = f;
          this.threshold = thresh;
        }
      }
    }
    
    // Set prediction based on majority class
    const ones = y.filter(label => label === 1).length;
    this.prediction = ones > y.length / 2 ? 1 : 0;
  }

  private calculateGini(leftY: number[], rightY: number[]): number {
    const total = leftY.length + rightY.length;
    const leftGini = this.gini(leftY);
    const rightGini = this.gini(rightY);
    return (leftY.length / total) * leftGini + (rightY.length / total) * rightGini;
  }

  private gini(y: number[]): number {
    if (y.length === 0) return 0;
    const ones = y.filter(label => label === 1).length;
    const p1 = ones / y.length;
    const p0 = 1 - p1;
    return 1 - (p1 * p1 + p0 * p0);
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      return features[this.feature] <= this.threshold ? this.prediction : 1 - this.prediction;
    });
  }
}

// Prepare features for ML models
export const prepareFeatures = (data: AutismDataPoint[]): { X: number[][], y: number[] } => {
  const X = data.map(item => [
    item.Age / 12, // Normalize age
    item.Gender === 'M' ? 1 : 0, // Binary encode gender
    responseToNumber(item.Q1) / 4, // Normalize responses
    responseToNumber(item.Q2) / 4,
    responseToNumber(item.Q3) / 4,
    responseToNumber(item.Q4) / 4,
    responseToNumber(item.Q5) / 4,
    responseToNumber(item.Q6) / 4,
    responseToNumber(item.Q7) / 4,
    responseToNumber(item.Q8) / 4,
    responseToNumber(item.Q9) / 4,
    responseToNumber(item.Q10) / 4,
    item.Total_Score / 40 // Normalize total score
  ]);
  
  const y = data.map(item => item.ASD_Label);
  
  return { X, y };
};

// Train-test split
export const trainTestSplit = (X: number[][], y: number[], testSize = 0.2): {
  XTrain: number[][], XTest: number[][], yTrain: number[], yTest: number[]
} => {
  const indices = Array.from({ length: X.length }, (_, i) => i);
  
  // Shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  const trainSize = Math.floor(X.length * (1 - testSize));
  const trainIndices = indices.slice(0, trainSize);
  const testIndices = indices.slice(trainSize);
  
  return {
    XTrain: trainIndices.map(i => X[i]),
    XTest: testIndices.map(i => X[i]),
    yTrain: trainIndices.map(i => y[i]),
    yTest: testIndices.map(i => y[i])
  };
};

// Calculate model metrics
export const calculateMetrics = (yTrue: number[], yPred: number[]): ModelMetrics => {
  const tp = yTrue.filter((actual, i) => actual === 1 && yPred[i] === 1).length;
  const tn = yTrue.filter((actual, i) => actual === 0 && yPred[i] === 0).length;
  const fp = yTrue.filter((actual, i) => actual === 0 && yPred[i] === 1).length;
  const fn = yTrue.filter((actual, i) => actual === 1 && yPred[i] === 0).length;
  
  const accuracy = (tp + tn) / (tp + tn + fp + fn);
  const precision = tp === 0 ? 0 : tp / (tp + fp);
  const recall = tp === 0 ? 0 : tp / (tp + fn);
  const f1Score = precision + recall === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
  
  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix: [[tn, fp], [fn, tp]]
  };
};

// Mock models for demonstration
export const getModelComparisons = async (data: AutismDataPoint[]): Promise<ModelComparison[]> => {
  const { X, y } = prepareFeatures(data);
  const { XTrain, XTest, yTrain, yTest } = trainTestSplit(X, y);
  
  const models: ModelComparison[] = [];
  
  // Logistic Regression
  const lr = new SimpleLogisticRegression();
  lr.fit(XTrain, yTrain);
  const lrPreds = lr.predict(XTest);
  const lrMetrics = calculateMetrics(yTest, lrPreds);
  models.push({
    name: 'Logistic Regression',
    description: 'Linear classification algorithm using sigmoid function',
    ...lrMetrics
  });
  
  // Random Forest
  const rf = new SimpleRandomForest();
  rf.fit(XTrain, yTrain);
  const rfPreds = rf.predict(XTest);
  const rfMetrics = calculateMetrics(yTest, rfPreds);
  models.push({
    name: 'Random Forest',
    description: 'Ensemble method using multiple decision trees',
    ...rfMetrics
  });
  
  // Mock SVM and Neural Network results
  models.push({
    name: 'Support Vector Machine',
    description: 'Finds optimal hyperplane for classification',
    accuracy: 0.85 + Math.random() * 0.1,
    precision: 0.82 + Math.random() * 0.15,
    recall: 0.78 + Math.random() * 0.15,
    f1Score: 0.80 + Math.random() * 0.12,
    confusionMatrix: [[25, 5], [8, 22]]
  });
  
  models.push({
    name: 'Neural Network',
    description: 'Deep learning model with multiple layers',
    accuracy: 0.88 + Math.random() * 0.08,
    precision: 0.85 + Math.random() * 0.12,
    recall: 0.82 + Math.random() * 0.15,
    f1Score: 0.83 + Math.random() * 0.12,
    confusionMatrix: [[26, 4], [6, 24]]
  });
  
  return models;
};