import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ModelComparison as ModelComparisonType } from '@/types/autism';
import { Trophy, Target, Zap, CheckCircle } from 'lucide-react';

interface ModelComparisonProps {
  models: ModelComparisonType[];
}

export const ModelComparison = ({ models }: ModelComparisonProps) => {
  if (!models.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No model results available yet
      </div>
    );
  }

  const chartData = models.map(model => ({
    name: model.name.split(' ').slice(0, 2).join(' '), // Shorten names for chart
    accuracy: Math.round(model.accuracy * 100),
    precision: Math.round(model.precision * 100),
    recall: Math.round(model.recall * 100),
    f1Score: Math.round(model.f1Score * 100)
  }));

  const bestModel = models.reduce((best, current) => 
    current.accuracy > best.accuracy ? current : best
  );

  const getPerformanceColor = (score: number) => {
    if (score >= 0.9) return 'text-success';
    if (score >= 0.8) return 'text-primary';
    if (score >= 0.7) return 'text-warning';
    return 'text-destructive';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Good';
    if (score >= 0.7) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Best Model Highlight */}
      <Card className="bg-gradient-success shadow-medium border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success-foreground">
            <Trophy className="h-5 w-5" />
            Best Performing Model
          </CardTitle>
        </CardHeader>
        <CardContent className="text-success-foreground">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{bestModel.name}</h3>
              <p className="text-success-foreground/80 mb-4">{bestModel.description}</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  {(bestModel.accuracy * 100).toFixed(1)}% Accuracy
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{(bestModel.precision * 100).toFixed(1)}%</div>
                <div className="text-sm opacity-80">Precision</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(bestModel.recall * 100).toFixed(1)}%</div>
                <div className="text-sm opacity-80">Recall</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(bestModel.f1Score * 100).toFixed(1)}%</div>
                <div className="text-sm opacity-80">F1-Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {getPerformanceBadge(bestModel.accuracy)}
                </div>
                <div className="text-sm opacity-80">Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Model Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Accuracy %" />
              <Bar dataKey="precision" fill="hsl(var(--success))" name="Precision %" />
              <Bar dataKey="recall" fill="hsl(var(--warning))" name="Recall %" />
              <Bar dataKey="f1Score" fill="hsl(var(--accent-foreground))" name="F1-Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Model Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {models.map((model, index) => (
          <Card key={model.name} className="shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {model.name === bestModel.name ? (
                    <Trophy className="h-5 w-5 text-warning" />
                  ) : (
                    <Target className="h-5 w-5 text-primary" />
                  )}
                  {model.name}
                </div>
                <Badge variant="outline" className={getPerformanceColor(model.accuracy)}>
                  {getPerformanceBadge(model.accuracy)}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{model.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className={`font-bold ${getPerformanceColor(model.accuracy)}`}>
                    {(model.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={model.accuracy * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Precision</span>
                  <span className={`font-bold ${getPerformanceColor(model.precision)}`}>
                    {(model.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={model.precision * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recall</span>
                  <span className={`font-bold ${getPerformanceColor(model.recall)}`}>
                    {(model.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={model.recall * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">F1-Score</span>
                  <span className={`font-bold ${getPerformanceColor(model.f1Score)}`}>
                    {(model.f1Score * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={model.f1Score * 100} className="h-2" />
              </div>

              {/* Confusion Matrix */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Confusion Matrix</h4>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-success/10 p-2 rounded border">
                    <div className="font-bold text-success">TN: {model.confusionMatrix[0][0]}</div>
                    <div className="text-xs text-muted-foreground">True Negative</div>
                  </div>
                  <div className="bg-warning/10 p-2 rounded border">
                    <div className="font-bold text-warning">FP: {model.confusionMatrix[0][1]}</div>
                    <div className="text-xs text-muted-foreground">False Positive</div>
                  </div>
                  <div className="bg-warning/10 p-2 rounded border">
                    <div className="font-bold text-warning">FN: {model.confusionMatrix[1][0]}</div>
                    <div className="text-xs text-muted-foreground">False Negative</div>
                  </div>
                  <div className="bg-success/10 p-2 rounded border">
                    <div className="font-bold text-success">TP: {model.confusionMatrix[1][1]}</div>
                    <div className="text-xs text-muted-foreground">True Positive</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};