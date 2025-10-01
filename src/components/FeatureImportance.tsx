import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Target } from 'lucide-react';
import { FeatureImportance as FeatureImportanceType } from '@/utils/transformerModel';

interface FeatureImportanceProps {
  importances: FeatureImportanceType[];
}

export const FeatureImportance = ({ importances }: FeatureImportanceProps) => {
  if (!importances.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No feature importance data available
      </div>
    );
  }

  // Prepare chart data
  const chartData = importances.map(item => ({
    name: item.featureName,
    importance: (item.importance * 100).toFixed(2),
    fullImportance: item.importance
  }));

  // Top features (importance > 10%)
  const topFeatures = importances.filter(f => f.importance > 0.1);
  
  // Critical features (importance > 15%)
  const criticalFeatures = importances.filter(f => f.importance > 0.15);

  const getImportanceLevel = (importance: number) => {
    if (importance > 0.15) return { level: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    if (importance > 0.1) return { level: 'High', color: 'text-warning', bgColor: 'bg-warning/10' };
    if (importance > 0.05) return { level: 'Medium', color: 'text-primary', bgColor: 'bg-primary/10' };
    return { level: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{importances.length}</div>
            <div className="text-sm text-muted-foreground">Total Features</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold text-warning">{topFeatures.length}</div>
            <div className="text-sm text-muted-foreground">High Impact Features</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
            <div className="text-2xl font-bold text-destructive">{criticalFeatures.length}</div>
            <div className="text-sm text-muted-foreground">Critical Features</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance Chart */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Feature Importance Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--foreground))" />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }}
                formatter={(value: any) => [`${value}%`, 'Importance']}
              />
              <Bar 
                dataKey="importance" 
                fill="hsl(var(--primary))" 
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Feature List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Detailed Feature Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {importances.map((feature, idx) => {
              const { level, color, bgColor } = getImportanceLevel(feature.importance);
              return (
                <div 
                  key={feature.featureName} 
                  className={`p-4 rounded-lg border ${bgColor} transition-all duration-300 hover:shadow-soft`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{feature.rank}
                      </Badge>
                      <div>
                        <div className="font-semibold">{feature.featureName}</div>
                        <div className="text-sm text-muted-foreground">
                          Impact on ASD prediction
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={color}>
                        {level}
                      </Badge>
                      <div className={`text-lg font-bold ${color} mt-1`}>
                        {(feature.importance * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={feature.importance * 100} 
                    className="h-2 mt-2" 
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Early Prediction Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {criticalFeatures.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>{criticalFeatures.length} critical features</strong> identified with {'>'}15% importance - 
                  these are key indicators for early ASD detection
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Top feature <strong>{importances[0]?.featureName}</strong> contributes {(importances[0]?.importance * 100).toFixed(1)}% 
                to the prediction model
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Feature importance analysis enables <strong>targeted screening</strong> focusing on 
                the most predictive behavioral indicators
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
