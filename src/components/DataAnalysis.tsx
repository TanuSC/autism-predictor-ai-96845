import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AutismDataPoint, QuestionnaireResponse } from '@/types/autism';
import { responseToNumber } from '@/utils/dataProcessing';

interface DataAnalysisProps {
  data: AutismDataPoint[];
}

export const DataAnalysis = ({ data }: DataAnalysisProps) => {
  const analysisData = useMemo(() => {
    if (!data.length) return null;

    // Age distribution
    const ageDistribution = data.reduce((acc, item) => {
      acc[item.Age] = (acc[item.Age] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const ageChartData = Object.entries(ageDistribution).map(([age, count]) => ({
      age: parseInt(age),
      count,
      asd: data.filter(d => d.Age === parseInt(age) && d.ASD_Label === 1).length,
      noAsd: data.filter(d => d.Age === parseInt(age) && d.ASD_Label === 0).length
    })).sort((a, b) => a.age - b.age);

    // Gender distribution
    const genderData = [
      {
        name: 'Male',
        value: data.filter(d => d.Gender === 'M').length,
        asd: data.filter(d => d.Gender === 'M' && d.ASD_Label === 1).length
      },
      {
        name: 'Female', 
        value: data.filter(d => d.Gender === 'F').length,
        asd: data.filter(d => d.Gender === 'F' && d.ASD_Label === 1).length
      }
    ];

    // Question response analysis
    const questionAnalysis = Array.from({ length: 10 }, (_, i) => {
      const questionKey = `Q${i + 1}` as keyof AutismDataPoint;
      const responses = data.map(d => d[questionKey] as QuestionnaireResponse);
      
      const responseCounts = responses.reduce((acc, response) => {
        acc[response] = (acc[response] || 0) + 1;
        return acc;
      }, {} as Record<QuestionnaireResponse, number>);

      const avgScore = responses.reduce((sum, response) => 
        sum + responseToNumber(response), 0
      ) / responses.length;

      const asdAvgScore = data
        .filter(d => d.ASD_Label === 1)
        .reduce((sum, d) => sum + responseToNumber(d[questionKey] as QuestionnaireResponse), 0) / 
        data.filter(d => d.ASD_Label === 1).length;

      const noAsdAvgScore = data
        .filter(d => d.ASD_Label === 0)
        .reduce((sum, d) => sum + responseToNumber(d[questionKey] as QuestionnaireResponse), 0) / 
        data.filter(d => d.ASD_Label === 0).length;

      return {
        question: i + 1,
        avgScore,
        asdAvgScore,
        noAsdAvgScore,
        responseCounts
      };
    });

    // Score distribution
    const scoreDistribution = data.reduce((acc, item) => {
      const scoreRange = Math.floor(item.Total_Score / 5) * 5;
      const key = `${scoreRange}-${scoreRange + 4}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const scoreChartData = Object.entries(scoreDistribution).map(([range, count]) => ({
      range,
      count,
      asd: data.filter(d => {
        const scoreRange = Math.floor(d.Total_Score / 5) * 5;
        return `${scoreRange}-${scoreRange + 4}` === range && d.ASD_Label === 1;
      }).length
    }));

    return {
      ageChartData,
      genderData,
      questionAnalysis,
      scoreChartData,
      totalCases: data.length,
      asdCases: data.filter(d => d.ASD_Label === 1).length,
      avgAge: data.reduce((sum, d) => sum + d.Age, 0) / data.length,
      avgScore: data.reduce((sum, d) => sum + d.Total_Score, 0) / data.length
    };
  }, [data]);

  if (!analysisData) {
    return <div className="text-center p-8 text-muted-foreground">No data available for analysis</div>;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-subtle shadow-soft">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{analysisData.totalCases}</div>
            <div className="text-sm text-muted-foreground">Total Cases</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-subtle shadow-soft">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{analysisData.asdCases}</div>
            <div className="text-sm text-muted-foreground">ASD Positive</div>
            <Badge variant="outline" className="mt-1">
              {((analysisData.asdCases / analysisData.totalCases) * 100).toFixed(1)}%
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-subtle shadow-soft">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{analysisData.avgAge.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Age (years)</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-subtle shadow-soft">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{analysisData.avgScore.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysisData.ageChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="age" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="noAsd" stackId="a" fill="hsl(var(--success))" name="No ASD" />
                <Bar dataKey="asd" stackId="a" fill="hsl(var(--warning))" name="ASD" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {analysisData.genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analysisData.genderData.map((gender, index) => (
                <div key={gender.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span>{gender.name}</span>
                  </div>
                  <Badge variant="outline">
                    {((gender.asd / gender.value) * 100).toFixed(1)}% ASD Rate
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysisData.scoreChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" />
                <Bar dataKey="asd" fill="hsl(var(--warning))" name="ASD" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Question Analysis */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Question Response Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisData.questionAnalysis.slice(0, 5).map((q) => (
                <div key={q.question} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Q{q.question}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-success">
                        ASD: {q.asdAvgScore.toFixed(1)}
                      </span>
                      <span className="text-primary">
                        No ASD: {q.noAsdAvgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Progress 
                      value={(q.asdAvgScore / 4) * 100} 
                      className="h-2"
                    />
                    <Progress 
                      value={(q.noAsdAvgScore / 4) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};