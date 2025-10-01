import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ModelComparison as ModelComparisonType } from '@/types/autism';
import { Trophy, Target, TrendingUp } from 'lucide-react';

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
    name: model.name.replace(' (Primary)', ''),
    Accuracy: Math.round(model.accuracy * 100),
    Precision: Math.round(model.precision * 100),
    Recall: Math.round(model.recall * 100),
    'F1-Score': Math.round(model.f1Score * 100)
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
      {/* Performance Comparison Chart */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Model Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Legend />
              <Bar dataKey="Accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Precision" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Recall" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="F1-Score" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Model Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card 
            key={model.name} 
            className={`shadow-soft hover:shadow-medium transition-all duration-300 ${
              model.name === bestModel.name ? 'border-2 border-primary' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {model.name === bestModel.name ? (
                    <Trophy className="h-5 w-5 text-warning" />
                  ) : (
                    <Target className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-lg">{model.name.replace(' (Primary)', '')}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {model.name === bestModel.name && (
                <Badge className="mb-2 bg-primary">Best Model</Badge>
              )}
              
              {/* Model Description */}
              <p className="text-sm text-muted-foreground italic border-l-4 border-primary pl-3">
                {model.description}
              </p>

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

              {/* Performance Badge */}
              <div className="pt-3 border-t">
                <Badge 
                  variant="outline" 
                  className={`w-full justify-center py-2 ${getPerformanceColor(model.accuracy)}`}
                >
                  {getPerformanceBadge(model.accuracy)} Performance
                </Badge>
              </div>

              {/* Confusion Matrix */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Confusion Matrix</h4>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-success/10 p-3 rounded border border-success/20">
                    <div className="font-bold text-success text-lg">{model.confusionMatrix[0][0]}</div>
                    <div className="text-xs text-muted-foreground">True Negative</div>
                  </div>
                  <div className="bg-warning/10 p-3 rounded border border-warning/20">
                    <div className="font-bold text-warning text-lg">{model.confusionMatrix[0][1]}</div>
                    <div className="text-xs text-muted-foreground">False Positive</div>
                  </div>
                  <div className="bg-warning/10 p-3 rounded border border-warning/20">
                    <div className="font-bold text-warning text-lg">{model.confusionMatrix[1][0]}</div>
                    <div className="text-xs text-muted-foreground">False Negative</div>
                  </div>
                  <div className="bg-success/10 p-3 rounded border border-success/20">
                    <div className="font-bold text-success text-lg">{model.confusionMatrix[1][1]}</div>
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
