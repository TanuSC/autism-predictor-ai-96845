import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Database, Filter, Zap, GitBranch } from 'lucide-react';
import { AutismDataPoint } from '@/types/autism';

interface PreprocessingStepsProps {
  data: AutismDataPoint[];
}

export const PreprocessingSteps = ({ data }: PreprocessingStepsProps) => {
  // Step 1: Data Collection
  const totalRecords = data.length;
  const features = 13; // Age, Gender, Q1-Q10, Total_Score

  // Step 2: Missing Values Analysis
  const missingValueCheck = () => {
    let missingCount = 0;
    data.forEach(row => {
      Object.values(row).forEach(val => {
        if (val === null || val === undefined || val === '') missingCount++;
      });
    });
    return missingCount;
  };
  const missingValues = missingValueCheck();

  // Step 3: Categorical Encoding
  const categoricalFeatures = ['Gender', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'];
  const uniqueGenders = [...new Set(data.map(d => d.Gender))];
  const responseCategories = ['never', 'rarely', 'sometimes', 'often', 'always'];

  // Step 4: Normalization
  const ageRange = { min: Math.min(...data.map(d => d.Age)), max: Math.max(...data.map(d => d.Age)) };
  const scoreRange = { min: Math.min(...data.map(d => d.Total_Score)), max: Math.max(...data.map(d => d.Total_Score)) };

  // Step 5: Data Splitting
  const trainRatio = 80;
  const testRatio = 20;
  const trainSize = Math.floor(totalRecords * 0.8);
  const testSize = totalRecords - trainSize;

  // Step 6: Class Distribution
  const asdCases = data.filter(d => d.ASD_Label === 1).length;
  const nonAsdCases = data.filter(d => d.ASD_Label === 0).length;
  const classBalance = ((asdCases / totalRecords) * 100).toFixed(1);

  const preprocessingSteps = [
    {
      id: 1,
      title: 'Data Collection',
      description: 'High-quality dataset with behavioral and demographic information',
      icon: Database,
      status: 'completed',
      details: [
        { label: 'Total Records', value: totalRecords.toString() },
        { label: 'Total Features', value: features.toString() },
        { label: 'Data Quality', value: 'High' },
      ],
      color: 'text-primary'
    },
    {
      id: 2,
      title: 'Missing Value Handling',
      description: 'Checking and handling missing values using imputation',
      icon: Filter,
      status: 'completed',
      details: [
        { label: 'Missing Values', value: missingValues.toString() },
        { label: 'Completeness', value: `${(((totalRecords * features - missingValues) / (totalRecords * features)) * 100).toFixed(2)}%` },
        { label: 'Strategy', value: missingValues > 0 ? 'Mean Imputation' : 'Not Required' },
      ],
      color: 'text-success'
    },
    {
      id: 3,
      title: 'Categorical Encoding',
      description: 'Converting categorical features to numerical values',
      icon: Zap,
      status: 'completed',
      details: [
        { label: 'Gender Encoding', value: 'Binary (M=1, F=0)' },
        { label: 'Response Encoding', value: '0-4 Scale' },
        { label: 'Encoded Features', value: categoricalFeatures.length.toString() },
      ],
      color: 'text-warning'
    },
    {
      id: 4,
      title: 'Feature Normalization',
      description: 'Scaling numerical features for better model performance',
      icon: Zap,
      status: 'completed',
      details: [
        { label: 'Age Range', value: `${ageRange.min}-${ageRange.max} years` },
        { label: 'Score Range', value: `${scoreRange.min}-${scoreRange.max} points` },
        { label: 'Method', value: 'Min-Max Scaling [0-1]' },
      ],
      color: 'text-accent-foreground'
    },
    {
      id: 5,
      title: 'Data Splitting',
      description: 'Dividing dataset into training and testing sets',
      icon: GitBranch,
      status: 'completed',
      details: [
        { label: 'Training Set', value: `${trainSize} (${trainRatio}%)` },
        { label: 'Testing Set', value: `${testSize} (${testRatio}%)` },
        { label: 'Split Method', value: 'Random Stratified' },
      ],
      color: 'text-primary'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Card */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Data Preprocessing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{totalRecords}</div>
              <div className="text-sm opacity-90">Records Processed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{features}</div>
              <div className="text-sm opacity-90">Features Engineered</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{classBalance}%</div>
              <div className="text-sm opacity-90">ASD Class Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Distribution */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Class Distribution Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">ASD Positive Cases</span>
              <span className="font-bold text-success">{asdCases} ({classBalance}%)</span>
            </div>
            <Progress value={(asdCases / totalRecords) * 100} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">ASD Negative Cases</span>
              <span className="font-bold text-primary">{nonAsdCases} ({(100 - parseFloat(classBalance)).toFixed(1)}%)</span>
            </div>
            <Progress value={(nonAsdCases / totalRecords) * 100} className="h-3" />
          </div>
          <Badge variant="outline" className="w-full justify-center py-2">
            {Math.abs((asdCases / nonAsdCases) - 1) < 0.3 ? '✓ Well Balanced Dataset' : '⚠ Consider Class Balancing Techniques'}
          </Badge>
        </CardContent>
      </Card>

      {/* Preprocessing Steps */}
      <div className="space-y-4">
        {preprocessingSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Step {step.id}: {step.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{detail.label}</div>
                      <div className="font-semibold text-foreground">{detail.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
