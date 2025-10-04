import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionResult } from '@/types/autism';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, Target } from 'lucide-react';

interface ScoreBreakdownProps {
  result: PredictionResult;
}

export const ScoreBreakdown = ({ result }: ScoreBreakdownProps) => {
  if (!result.scoreBreakdown) return null;

  const barChartData = result.scoreBreakdown.map((item, index) => ({
    question: `Q${index + 1}`,
    score: item.score,
    fullQuestion: item.question,
  }));

  const radarData = result.scoreBreakdown.map((item, index) => ({
    category: `Q${index + 1}`,
    score: item.score,
    maxScore: 4,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 3) return 'hsl(var(--destructive))';
    if (score >= 2) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const categoryAnalysis = {
    highConcern: result.scoreBreakdown.filter(item => item.score >= 3).length,
    moderate: result.scoreBreakdown.filter(item => item.score === 2).length,
    lowConcern: result.scoreBreakdown.filter(item => item.score <= 1).length,
  };

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Response Category Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <div className="text-3xl font-bold text-destructive">{categoryAnalysis.highConcern}</div>
              <div className="text-sm text-muted-foreground mt-1">High Concern</div>
              <div className="text-xs text-muted-foreground">(Score 3-4)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <div className="text-3xl font-bold text-warning">{categoryAnalysis.moderate}</div>
              <div className="text-sm text-muted-foreground mt-1">Moderate</div>
              <div className="text-xs text-muted-foreground">(Score 2)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <div className="text-3xl font-bold text-success">{categoryAnalysis.lowConcern}</div>
              <div className="text-sm text-muted-foreground mt-1">Low Concern</div>
              <div className="text-xs text-muted-foreground">(Score 0-1)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Question-by-Question Scores
          </CardTitle>
          <CardDescription>Individual response scores (0 = Never, 4 = Always)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-3 rounded-lg shadow-medium border">
                        <p className="font-medium text-sm mb-1">{data.fullQuestion}</p>
                        <p className="text-sm">Score: {data.score}/4</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Behavioral Pattern Analysis</CardTitle>
          <CardDescription>Radar view of assessment responses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis domain={[0, 4]} />
              <Radar 
                name="Response Score" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.3} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Detailed Response Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.scoreBreakdown.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{item.question}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.response}</Badge>
                    <span className="text-sm text-muted-foreground">Score: {item.score}/4</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
