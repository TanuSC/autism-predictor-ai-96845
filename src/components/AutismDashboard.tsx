import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, BarChart3, Users, Target, Database, LogOut, Settings } from 'lucide-react';
import { DatasetAnalysis } from './DatasetAnalysis';
import { ImprovedModelComparison } from './ImprovedModelComparison';
import { PredictionInterface } from './PredictionInterface';
import { AutismChatbot } from './AutismChatbot';
import { PreprocessingSteps } from './PreprocessingSteps';
import { AutismDataPoint, ModelComparison as ModelComparisonType } from '@/types/autism';
import { loadAutismDataset, getModelComparisons } from '@/utils/dataProcessing';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AutismDashboard = () => {
  const [data, setData] = useState<AutismDataPoint[]>([]);
  const [models, setModels] = useState<ModelComparisonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainTestRatio, setTrainTestRatio] = useState(0.8);
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Load dataset
        const dataset = await loadAutismDataset();
        setData(dataset);
        
        // Train models and get comparisons
        const testSize = 1 - trainTestRatio;
        const modelResults = await getModelComparisons(dataset, testSize);
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
  }, [trainTestRatio]);

  const handleTrainTestSplit = async (trainPercentage: number) => {
    setTrainTestRatio(trainPercentage / 100);
    toast({
      title: "Retraining Model",
      description: "Model is being retrained with new train-test split...",
    });
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Brain className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Autism Spectrum Disorder Prediction System</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut()}
                className="gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card shadow-soft p-1.5 h-auto">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-base">
              Data Analysis
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-base">
              Model Performance
            </TabsTrigger>
            <TabsTrigger value="prediction" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-base">
              Prediction Tool
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-base">
              Assistance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6 animate-fade-in">
            <Card className="shadow-medium border-primary/20">
              <CardHeader className="bg-gradient-subtle">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Dataset Analysis & Visualization
                </CardTitle>
                <CardDescription className="text-base">
                  Comprehensive analysis of the autism screening dataset with interactive visualizations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <DatasetAnalysis data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6 animate-fade-in">
            <Card className="shadow-medium border-primary/20">
              <CardHeader className="bg-gradient-subtle">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6 text-primary" />
                  Model Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ImprovedModelComparison 
                  models={models} 
                  totalDataPoints={data.length}
                  onSplitChange={handleTrainTestSplit}
                  currentSplit={trainTestRatio * 100}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediction" className="space-y-6 animate-fade-in">
            <Card className="shadow-medium border-primary/20">
              <CardHeader className="bg-gradient-subtle">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Brain className="h-6 w-6 text-primary" />
                  Autism Screening Tool
                </CardTitle>
                <CardDescription className="text-base">
                  Interactive assessment tool with personalized guidance for parents
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PredictionInterface models={models} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6 animate-fade-in">
            <AutismChatbot />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};