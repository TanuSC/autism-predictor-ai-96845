import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AutismDataPoint } from '@/types/autism';

interface EnhancedDataAnalysisProps {
  data: AutismDataPoint[];
}

export const EnhancedDataAnalysis = ({ data }: EnhancedDataAnalysisProps) => {
  const analytics = useMemo(() => {
    const ageDistribution = Array.from({ length: 10 }, (_, i) => ({
      age: `${i * 5}-${(i + 1) * 5}`,
      count: data.filter(d => d.Age >= i * 5 && d.Age < (i + 1) * 5).length
    }));

    const genderData = [
      { name: 'Male', value: data.filter(d => d.Gender === 'M').length },
      { name: 'Female', value: data.filter(d => d.Gender === 'F').length }
    ];

    const asdByAge = Array.from({ length: 10 }, (_, i) => {
      const ageGroup = data.filter(d => d.Age >= i * 5 && d.Age < (i + 1) * 5);
      const asdCount = ageGroup.filter(d => d.ASD_Label === 1).length;
      return {
        age: `${i * 5}-${(i + 1) * 5}`,
        prevalence: ageGroup.length > 0 ? (asdCount / ageGroup.length) * 100 : 0
      };
    });

    const scoreDistribution = Array.from({ length: 11 }, (_, i) => {
      const scoreRange = i * 4;
      return {
        score: `${scoreRange}`,
        ASD: data.filter(d => d.ASD_Label === 1 && Math.floor(d.Total_Score / 4) === i).length,
        'Non-ASD': data.filter(d => d.ASD_Label === 0 && Math.floor(d.Total_Score / 4) === i).length
      };
    });

    // Question response comparison
    const questionComparison = Array.from({ length: 10 }, (_, i) => {
      const qKey = `Q${i + 1}` as keyof AutismDataPoint;
      const asdData = data.filter(d => d.ASD_Label === 1);
      const nonAsdData = data.filter(d => d.ASD_Label === 0);

      const responseMap: Record<string, number> = { never: 0, rarely: 1, sometimes: 2, often: 3, always: 4 };
      
      const asdAvg = asdData.reduce((sum, d) => sum + responseMap[d[qKey] as string], 0) / asdData.length;
      const nonAsdAvg = nonAsdData.reduce((sum, d) => sum + responseMap[d[qKey] as string], 0) / nonAsdData.length;

      return {
        question: `Q${i + 1}`,
        'ASD Group': Number(asdAvg.toFixed(2)),
        'Non-ASD Group': Number(nonAsdAvg.toFixed(2)),
        difference: Math.abs(asdAvg - nonAsdAvg)
      };
    });

    const totalCases = data.length;
    const asdCases = data.filter(d => d.ASD_Label === 1).length;
    const avgAge = (data.reduce((sum, d) => sum + d.Age, 0) / data.length).toFixed(1);
    const avgScore = (data.reduce((sum, d) => sum + d.Total_Score, 0) / data.length).toFixed(1);

    return {
      ageDistribution,
      genderData,
      asdByAge,
      scoreDistribution,
      questionComparison,
      totalCases,
      asdCases,
      avgAge,
      avgScore
    };
  }, [data]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))'];

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ASD Positive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.asdCases}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.asdCases / analytics.totalCases) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgAge}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Distribution of participants by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: 'Age Group', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Male vs Female participants</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ASD Prevalence by Age</CardTitle>
            <CardDescription>Percentage of ASD cases in each age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.asdByAge}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: 'Age Group', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Prevalence (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="prevalence" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution by ASD Status</CardTitle>
            <CardDescription>Comparison of total scores between groups</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" label={{ value: 'Total Score', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ASD" fill="hsl(var(--primary))" />
                <Bar dataKey="Non-ASD" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Question Response Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Question Response Patterns</CardTitle>
          <CardDescription>
            Average response scores (0-4 scale) comparing ASD and Non-ASD groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.questionComparison} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 4]} label={{ value: 'Average Response Score', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="question" label={{ value: 'Question', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ASD Group" fill="hsl(var(--primary))" />
              <Bar dataKey="Non-ASD Group" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Key Insights:</strong> Questions with larger differences between groups may be more indicative of ASD.
              Higher scores in the ASD group suggest behaviors more commonly associated with autism spectrum characteristics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
