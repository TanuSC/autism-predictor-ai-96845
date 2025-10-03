import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AutismDataPoint } from '@/types/autism';
import { DataSplitControl } from './DataSplitControl';

interface EnhancedDataAnalysisProps {
  data: AutismDataPoint[];
}

export const EnhancedDataAnalysis = ({ data }: EnhancedDataAnalysisProps) => {
  const analytics = useMemo(() => {
    const ageDistribution = [
      { age: '0-5', count: data.filter(d => d.Age >= 0 && d.Age < 5).length },
      { age: '5-10', count: data.filter(d => d.Age >= 5 && d.Age < 10).length },
      { age: '10-15', count: data.filter(d => d.Age >= 10 && d.Age < 15).length },
      { age: '15-18', count: data.filter(d => d.Age >= 15 && d.Age <= 18).length }
    ];

    const genderData = [
      { name: 'Male', value: data.filter(d => d.Gender === 'M').length, color: 'hsl(var(--primary))' },
      { name: 'Female', value: data.filter(d => d.Gender === 'F').length, color: 'hsl(var(--chart-2))' }
    ];

    const asdByAge = [
      { age: '0-5', prevalence: (() => {
        const group = data.filter(d => d.Age >= 0 && d.Age < 5);
        return group.length > 0 ? (group.filter(d => d.ASD_Label === 1).length / group.length) * 100 : 0;
      })() },
      { age: '5-10', prevalence: (() => {
        const group = data.filter(d => d.Age >= 5 && d.Age < 10);
        return group.length > 0 ? (group.filter(d => d.ASD_Label === 1).length / group.length) * 100 : 0;
      })() },
      { age: '10-15', prevalence: (() => {
        const group = data.filter(d => d.Age >= 10 && d.Age < 15);
        return group.length > 0 ? (group.filter(d => d.ASD_Label === 1).length / group.length) * 100 : 0;
      })() },
      { age: '15-18', prevalence: (() => {
        const group = data.filter(d => d.Age >= 15 && d.Age <= 18);
        return group.length > 0 ? (group.filter(d => d.ASD_Label === 1).length / group.length) * 100 : 0;
      })() }
    ];

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
      questionComparison,
      totalCases,
      asdCases,
      avgAge,
      avgScore
    };
  }, [data]);

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
                  {analytics.genderData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ASD Prevalence by Age */}
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

      {/* Data Splitting Control */}
      <DataSplitControl totalDataPoints={data.length} />

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
