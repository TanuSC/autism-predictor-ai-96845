// Transformer-based Model for Tabular Autism Screening Data
// Implements attention mechanisms for feature importance analysis

export interface TransformerConfig {
  inputDim: number;
  hiddenDim: number;
  numHeads: number;
  numLayers: number;
  learningRate: number;
  epochs: number;
}

export interface FeatureImportance {
  featureName: string;
  importance: number;
  rank: number;
}

// Multi-Head Attention Layer for tabular data
class MultiHeadAttention {
  private weights: {
    query: number[][];
    key: number[][];
    value: number[][];
    output: number[][];
  };
  private numHeads: number;
  private headDim: number;

  constructor(inputDim: number, numHeads: number) {
    this.numHeads = numHeads;
    this.headDim = Math.floor(inputDim / numHeads);
    
    // Initialize weights with Xavier initialization
    const scale = Math.sqrt(2.0 / inputDim);
    this.weights = {
      query: this.initializeMatrix(inputDim, inputDim, scale),
      key: this.initializeMatrix(inputDim, inputDim, scale),
      value: this.initializeMatrix(inputDim, inputDim, scale),
      output: this.initializeMatrix(inputDim, inputDim, scale),
    };
  }

  private initializeMatrix(rows: number, cols: number, scale: number): number[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 2 * scale)
    );
  }

  private matmul(a: number[], b: number[][]): number[] {
    return b[0].map((_, j) => a.reduce((sum, val, i) => sum + val * b[i][j], 0));
  }

  private softmax(x: number[]): number[] {
    const max = Math.max(...x);
    const exps = x.map(val => Math.exp(val - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(val => val / sum);
  }

  forward(x: number[]): { output: number[]; attentionWeights: number[] } {
    // Compute Q, K, V
    const Q = this.matmul(x, this.weights.query);
    const K = this.matmul(x, this.weights.key);
    const V = this.matmul(x, this.weights.value);

    // Scaled dot-product attention
    const scale = Math.sqrt(this.headDim);
    const scores = Q.map((q, i) => (q * K[i]) / scale);
    const attentionWeights = this.softmax(scores);
    
    // Apply attention to values
    const attended = V.map((v, i) => v * attentionWeights[i]);
    const output = this.matmul(attended, this.weights.output);

    return { output, attentionWeights };
  }
}

// Feed-Forward Network
class FeedForward {
  private weights1: number[][];
  private bias1: number[];
  private weights2: number[][];
  private bias2: number[];

  constructor(inputDim: number, hiddenDim: number) {
    const scale = Math.sqrt(2.0 / inputDim);
    this.weights1 = this.initializeMatrix(inputDim, hiddenDim, scale);
    this.bias1 = Array(hiddenDim).fill(0);
    this.weights2 = this.initializeMatrix(hiddenDim, inputDim, scale);
    this.bias2 = Array(inputDim).fill(0);
  }

  private initializeMatrix(rows: number, cols: number, scale: number): number[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 2 * scale)
    );
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }

  forward(x: number[]): number[] {
    // First layer with ReLU
    const hidden = this.weights1[0].map((_, j) => {
      const sum = x.reduce((acc, val, i) => acc + val * this.weights1[i][j], 0) + this.bias1[j];
      return this.relu(sum);
    });

    // Second layer
    return this.weights2[0].map((_, j) =>
      hidden.reduce((acc, val, i) => acc + val * this.weights2[i][j], 0) + this.bias2[j]
    );
  }
}

// Main Transformer Model for Tabular Data
export class TabularTransformer {
  private config: TransformerConfig;
  private attention: MultiHeadAttention;
  private feedForward: FeedForward;
  private classifier: number[];
  private classifierBias: number;
  private featureImportances: number[] = [];

  constructor(config: TransformerConfig) {
    this.config = config;
    this.attention = new MultiHeadAttention(config.inputDim, config.numHeads);
    this.feedForward = new FeedForward(config.inputDim, config.hiddenDim);
    this.classifier = Array(config.inputDim).fill(0).map(() => Math.random() - 0.5);
    this.classifierBias = 0;
    this.featureImportances = Array(config.inputDim).fill(0);
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
  }

  private layerNorm(x: number[]): number[] {
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    const variance = x.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / x.length;
    const std = Math.sqrt(variance + 1e-8);
    return x.map(val => (val - mean) / std);
  }

  forward(x: number[]): { prediction: number; confidence: number; attentionWeights: number[] } {
    // Normalize input
    let normalized = this.layerNorm(x);

    // Self-attention with residual connection
    const { output: attentionOutput, attentionWeights } = this.attention.forward(normalized);
    const afterAttention = normalized.map((val, i) => val + attentionOutput[i]);
    normalized = this.layerNorm(afterAttention);

    // Feed-forward with residual connection
    const ffOutput = this.feedForward.forward(normalized);
    const afterFF = normalized.map((val, i) => val + ffOutput[i]);
    const final = this.layerNorm(afterFF);

    // Classification head
    const logit = final.reduce((sum, val, i) => sum + val * this.classifier[i], 0) + this.classifierBias;
    const confidence = this.sigmoid(logit);
    const prediction = confidence >= 0.5 ? 1 : 0;

    return { prediction, confidence, attentionWeights };
  }

  fit(X: number[][], y: number[]): void {
    const m = X.length;
    
    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      let totalLoss = 0;
      const attentionAccumulator = Array(this.config.inputDim).fill(0);

      for (let i = 0; i < m; i++) {
        const { prediction, confidence, attentionWeights } = this.forward(X[i]);
        const error = confidence - y[i];
        
        // Binary cross-entropy loss
        const loss = -y[i] * Math.log(confidence + 1e-10) - (1 - y[i]) * Math.log(1 - confidence + 1e-10);
        totalLoss += loss;

        // Accumulate attention weights for feature importance
        attentionWeights.forEach((weight, j) => {
          attentionAccumulator[j] += Math.abs(weight);
        });

        // Update classifier weights (simplified gradient descent)
        for (let j = 0; j < this.config.inputDim; j++) {
          this.classifier[j] -= this.config.learningRate * error * X[i][j];
        }
        this.classifierBias -= this.config.learningRate * error;
      }

      // Calculate feature importances
      this.featureImportances = attentionAccumulator.map(val => val / m);
      
      // Early stopping if loss is very small
      if (totalLoss / m < 0.01) break;
    }
  }

  predict(X: number[][]): number[] {
    return X.map(x => this.forward(x).prediction);
  }

  predictProba(X: number[][]): number[] {
    return X.map(x => this.forward(x).confidence);
  }

  getFeatureImportance(featureNames: string[]): FeatureImportance[] {
    const importances = this.featureImportances.map((importance, idx) => ({
      featureName: featureNames[idx] || `Feature_${idx}`,
      importance,
      rank: 0
    }));

    // Normalize to sum to 1
    const total = importances.reduce((sum, item) => sum + item.importance, 0);
    importances.forEach(item => {
      item.importance = total > 0 ? item.importance / total : 0;
    });

    // Sort by importance and assign ranks
    importances.sort((a, b) => b.importance - a.importance);
    importances.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return importances;
  }
}
