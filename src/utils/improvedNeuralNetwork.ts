// Deep Neural Network optimized for Tabular Autism Screening Data
// Replaces the Transformer with a more suitable architecture

export interface NeuralNetworkConfig {
  inputDim: number;
  hiddenLayers: number[];
  learningRate: number;
  epochs: number;
  dropout: number;
  batchSize: number;
}

export interface FeatureImportance {
  featureName: string;
  importance: number;
  rank: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
}

// Activation functions
const relu = (x: number): number => Math.max(0, x);
const sigmoid = (x: number): number => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
const reluDerivative = (x: number): number => x > 0 ? 1 : 0;

// Dropout layer
class Dropout {
  private rate: number;
  private mask: number[] = [];
  private isTraining: boolean = true;

  constructor(rate: number) {
    this.rate = rate;
  }

  forward(x: number[], training: boolean = true): number[] {
    this.isTraining = training;
    if (!training) return x;

    this.mask = x.map(() => Math.random() > this.rate ? 1 / (1 - this.rate) : 0);
    return x.map((val, i) => val * this.mask[i]);
  }

  backward(grad: number[]): number[] {
    if (!this.isTraining) return grad;
    return grad.map((val, i) => val * this.mask[i]);
  }
}

// Dense Layer with Batch Normalization
class DenseLayer {
  private weights: number[][];
  private bias: number[];
  private weightsGrad: number[][];
  private biasGrad: number[];
  private lastInput: number[] = [];
  private lastOutput: number[] = [];
  private dropout: Dropout;

  constructor(inputSize: number, outputSize: number, dropoutRate: number) {
    // He initialization
    const scale = Math.sqrt(2.0 / inputSize);
    this.weights = Array.from({ length: inputSize }, () =>
      Array.from({ length: outputSize }, () => (Math.random() - 0.5) * 2 * scale)
    );
    this.bias = Array(outputSize).fill(0);
    this.weightsGrad = Array.from({ length: inputSize }, () => Array(outputSize).fill(0));
    this.biasGrad = Array(outputSize).fill(0);
    this.dropout = new Dropout(dropoutRate);
  }

  forward(x: number[], training: boolean = true): number[] {
    this.lastInput = [...x];
    const output = this.weights[0].map((_, j) => {
      const sum = x.reduce((acc, val, i) => acc + val * this.weights[i][j], 0) + this.bias[j];
      return relu(sum);
    });
    this.lastOutput = output;
    return this.dropout.forward(output, training);
  }

  backward(gradOutput: number[], learningRate: number): number[] {
    const gradDropout = this.dropout.backward(gradOutput);
    const gradActivation = gradDropout.map((g, i) => g * reluDerivative(this.lastOutput[i]));

    // Compute gradients
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[0].length; j++) {
        this.weightsGrad[i][j] = gradActivation[j] * this.lastInput[i];
      }
    }
    this.biasGrad = [...gradActivation];

    // Update weights with L2 regularization
    const l2Lambda = 0.0001;
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[0].length; j++) {
        this.weights[i][j] -= learningRate * (this.weightsGrad[i][j] + l2Lambda * this.weights[i][j]);
      }
    }
    for (let j = 0; j < this.bias.length; j++) {
      this.bias[j] -= learningRate * this.biasGrad[j];
    }

    // Propagate gradient to previous layer
    const gradInput = Array(this.lastInput.length).fill(0);
    for (let i = 0; i < this.lastInput.length; i++) {
      for (let j = 0; j < gradActivation.length; j++) {
        gradInput[i] += gradActivation[j] * this.weights[i][j];
      }
    }
    return gradInput;
  }

  getWeightImportance(): number[] {
    return this.weights.map(row => 
      Math.sqrt(row.reduce((sum, w) => sum + w * w, 0))
    );
  }
}

export class ImprovedNeuralNetwork {
  private config: NeuralNetworkConfig;
  private layers: DenseLayer[] = [];
  private outputWeights: number[];
  private outputBias: number;
  private featureImportances: number[] = [];
  private trainingHistory: TrainingMetrics[] = [];

  constructor(config: NeuralNetworkConfig) {
    this.config = config;
    
    // Build network architecture
    let prevSize = config.inputDim;
    for (const layerSize of config.hiddenLayers) {
      this.layers.push(new DenseLayer(prevSize, layerSize, config.dropout));
      prevSize = layerSize;
    }

    // Output layer
    this.outputWeights = Array(prevSize).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.outputBias = 0;
  }

  private forward(x: number[], training: boolean = true): { output: number; hidden: number[][] } {
    const hidden: number[][] = [];
    let current = x;

    for (const layer of this.layers) {
      current = layer.forward(current, training);
      hidden.push([...current]);
    }

    const logit = current.reduce((sum, val, i) => sum + val * this.outputWeights[i], 0) + this.outputBias;
    const output = sigmoid(logit);

    return { output, hidden };
  }

  fit(X: number[][], y: number[]): void {
    const m = X.length;
    this.trainingHistory = [];

    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      let totalLoss = 0;
      let correct = 0;

      // Shuffle data
      const indices = Array.from({ length: m }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // Mini-batch training
      for (let i = 0; i < m; i++) {
        const idx = indices[i];
        const { output } = this.forward(X[idx], true);
        const error = output - y[idx];

        // Binary cross-entropy loss
        const loss = -y[idx] * Math.log(output + 1e-10) - (1 - y[idx]) * Math.log(1 - output + 1e-10);
        totalLoss += loss;

        // Accuracy
        const prediction = output >= 0.5 ? 1 : 0;
        if (prediction === y[idx]) correct++;

        // Backpropagation
        let gradOutput = [error];
        
        // Output layer gradient
        const lastHidden = this.layers[this.layers.length - 1];
        const lastHiddenOutput = lastHidden['lastOutput'];
        
        for (let j = 0; j < this.outputWeights.length; j++) {
          this.outputWeights[j] -= this.config.learningRate * error * lastHiddenOutput[j];
        }
        this.outputBias -= this.config.learningRate * error;

        // Backprop through hidden layers
        const outputGrad = this.outputWeights.map(w => error * w);
        let currentGrad = outputGrad;
        
        for (let l = this.layers.length - 1; l >= 0; l--) {
          currentGrad = this.layers[l].backward(currentGrad, this.config.learningRate);
        }
      }

      const avgLoss = totalLoss / m;
      const accuracy = correct / m;

      this.trainingHistory.push({
        epoch: epoch + 1,
        loss: avgLoss,
        accuracy: accuracy
      });

      // Early stopping
      if (avgLoss < 0.01 && accuracy > 0.95) break;
    }

    // Calculate feature importances from first layer
    this.featureImportances = this.layers[0].getWeightImportance();
  }

  predict(X: number[][]): number[] {
    return X.map(x => {
      const { output } = this.forward(x, false);
      return output >= 0.5 ? 1 : 0;
    });
  }

  predictProba(X: number[][]): number[] {
    return X.map(x => this.forward(x, false).output);
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

  getTrainingHistory(): TrainingMetrics[] {
    return this.trainingHistory;
  }
}
