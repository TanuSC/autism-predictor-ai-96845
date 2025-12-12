import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database, Users, TrendingUp, PieChartIcon } from 'lucide-react';
import { AutismDataPoint } from '@/types/autism';

interface DatasetAnalysisProps {
  data: AutismDataPoint[];
}

export const DatasetAnalysis = ({ data }: DatasetAnalysisProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No dataset available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalSamples = data.length;
  const asdPositive = data.filter(d => d.ASD_Label === 1).length;
  const asdNegative = totalSamples - asdPositive;
  const asdPercentage = ((asdPositive / totalSamples) * 100).toFixed(1);
  const classBalance = ((Math.min(asdPositive, asdNegative) / Math.max(asdPositive, asdNegative)) * 100).toFixed(1);

  // Gender distribution
  const maleCount = data.filter(d => d.Gender === 'M').length;
  const femaleCount = data.filter(d => d.Gender === 'F').length;
  
  const maleASD = data.filter(d => d.Gender === 'M' && d.ASD_Label === 1).length;
  const femaleASD = data.filter(d => d.Gender === 'F' && d.ASD_Label === 1).length;

  // Age distribution
  const ageGroups = {
    '2-4': 0,
    '5-7': 0,
    '8-10': 0,
    '11-12': 0,
  };

  data.forEach(d => {
    const age = d.Age;
    if (age >= 2 && age <= 4) ageGroups['2-4']++;
    else if (age >= 5 && age <= 7) ageGroups['5-7']++;
    else if (age >= 8 && age <= 10) ageGroups['8-10']++;
    else if (age >= 11 && age <= 12) ageGroups['11-12']++;
  });

  const ageData = Object.entries(ageGroups).map(([age, count]) => ({
    age,
    count,
  }));

  // Score distribution
  const scores = data.map(d => d.Total_Score);

  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  const scoreRanges = {
    '0-10': 0,
    '11-15': 0,
    '16-20': 0,
    '21-25': 0,
    '26-30': 0,
    '31-40': 0,
  };

  scores.forEach(score => {
    if (score <= 10) scoreRanges['0-10']++;
    else if (score <= 15) scoreRanges['11-15']++;
    else if (score <= 20) scoreRanges['16-20']++;
    else if (score <= 25) scoreRanges['21-25']++;
    else if (score <= 30) scoreRanges['26-30']++;
    else scoreRanges['31-40']++;
  });

  const scoreData = Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    count,
  }));

  // Class distribution for pie chart
  const classData = [
    { name: 'ASD Positive', value: asdPositive, color: 'hsl(var(--destructive))' },
    { name: 'ASD Negative', value: asdNegative, color: 'hsl(var(--primary))' },
  ];

  // Gender distribution data
  const genderData = [
    { gender: 'Male', total: maleCount, asd: maleASD, nonAsd: maleCount - maleASD },
    { gender: 'Female', total: femaleCount, asd: femaleASD, nonAsd: femaleCount - femaleASD },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSamples}</div>
            <p className="text-xs text-muted-foreground mt-1">Complete dataset entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">ASD Positive</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asdPositive}</div>
            <p className="text-xs text-muted-foreground mt-1">{asdPercentage}% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">ASD Negative</CardTitle>
              <PieChartIcon className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asdNegative}</div>
            <p className="text-xs text-muted-foreground mt-1">{(100 - parseFloat(asdPercentage)).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
            <CardDescription>ASD positive vs negative cases</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Sample distribution across age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>ASD cases by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="asd" fill="hsl(var(--destructive))" name="ASD Positive" radius={[8, 8, 0, 0]} />
                <Bar dataKey="nonAsd" fill="hsl(var(--primary))" name="ASD Negative" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Male Total</div>
                <div className="text-xl font-bold">{maleCount}</div>
                <Badge variant="outline" className="mt-1">
                  {((maleASD / maleCount) * 100).toFixed(1)}% ASD
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Female Total</div>
                <div className="text-xl font-bold">{femaleCount}</div>
                <Badge variant="outline" className="mt-1">
                  {((femaleASD / femaleCount) * 100).toFixed(1)}% ASD
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Questionnaire total score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Min Score</div>
                <div className="text-xl font-bold">{minScore}</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Avg Score</div>
                <div className="text-xl font-bold">{avgScore}</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Max Score</div>
                <div className="text-xl font-bold">{maxScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dataset Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Characteristics</CardTitle>
          <CardDescription>Key features and properties of the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-primary">Demographics</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• <strong>Age Range:</strong> 2-12 years old children</li>
                <li>• <strong>Gender Split:</strong> {maleCount} males ({((maleCount/totalSamples)*100).toFixed(1)}%), {femaleCount} females ({((femaleCount/totalSamples)*100).toFixed(1)}%)</li>
                <li>• <strong>Target Variable:</strong> Binary classification (ASD/Non-ASD)</li>
                <li>• <strong>Features:</strong> 10 questionnaire responses + demographic info</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-primary">Data Quality</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• <strong>Completeness:</strong> 100% (no missing values)</li>
                <li>• <strong>Response Scale:</strong> 5-point Likert scale (never to always)</li>
                <li>• <strong>Score Range:</strong> {minScore}-{maxScore} points (out of 40)</li>
                <li>• <strong>Class Balance:</strong> {classBalance}% ratio {parseFloat(classBalance) >= 80 ? '✓' : '⚠️'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
