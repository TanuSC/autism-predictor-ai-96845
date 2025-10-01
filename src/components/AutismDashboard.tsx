import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, BarChart3, Users, Target } from 'lucide-react';
import { DataAnalysis } from './DataAnalysis';
import { ModelComparison } from './ModelComparison';
import { PredictionInterface } from './PredictionInterface';
import { AutismDataPoint, ModelComparison as ModelComparisonType } from '@/types/autism';
import { loadAutismDataset, getModelComparisons } from '@/utils/dataProcessing';
import { toast } from '@/hooks/use-toast';

export const AutismDashboard = () => {
  const [data, setData] = useState<AutismDataPoint[]>([]);
  const [models, setModels] = useState<ModelComparisonType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Load dataset
        const dataset = await loadAutismDataset();
        setData(dataset);
        
        // Train models and get comparisons
        const modelResults = await getModelComparisons(dataset);
        setModels(modelResults);
        
        toast({
          title: "Dashboard Initialized",
          description: `Loaded ${dataset.length} data points and trained ${modelResults.length} models`,
        });
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        toast({
          title: "Initialization Failed",
          description: "Could not load the autism dataset. Please check the file.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const stats = {
    totalCases: data.length,
    asdCases: data.filter(d => d.ASD_Label === 1).length,
    avgAge: data.length > 0 ? (data.reduce((sum, d) => sum + d.Age, 0) / data.length).toFixed(1) : '0',
    bestModel: models.length > 0 ? models.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    ).name : 'N/A'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse-glow">
            <Brain className="h-16 w-16 text-primary mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Initializing Autism Screening Dashboard</h2>
            <p className="text-muted-foreground">Loading dataset and training ML models...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Brain className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">Autism Screening & Prediction System</h1>
              <p className="text-primary-foreground/80">
                AI-powered early detection for children using machine learning
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary-foreground" />
                <div className="text-2xl font-bold text-primary-foreground">{stats.totalCases}</div>
                <div className="text-sm text-primary-foreground/80">Total Cases</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary-foreground" />
                <div className="text-2xl font-bold text-primary-foreground">{stats.asdCases}</div>
                <div className="text-sm text-primary-foreground/80">ASD Positive</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary-foreground" />
                <div className="text-2xl font-bold text-primary-foreground">{stats.avgAge}</div>
                <div className="text-sm text-primary-foreground/80">Avg Age (years)</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-4 text-center">
                <Brain className="h-6 w-6 mx-auto mb-2 text-primary-foreground" />
                <div className="text-lg font-bold text-primary-foreground truncate">{stats.bestModel}</div>
                <div className="text-sm text-primary-foreground/80">Best Model</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card shadow-soft">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Data Analysis
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Model Comparison
            </TabsTrigger>
            <TabsTrigger value="prediction" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Prediction Tool
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Dataset Analysis & Visualization
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of the autism screening dataset with interactive visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataAnalysis data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Machine Learning Model Performance
                </CardTitle>
                <CardDescription>
                  Comparison of different ML algorithms for autism prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelComparison models={models} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediction" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Autism Screening Tool
                </CardTitle>
                <CardDescription>
                  Interactive assessment tool for autism risk prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionInterface models={models} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};