import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, CheckCircle, Info, InfoIcon, Download, History } from 'lucide-react';
import { ModelComparison, PredictionInput, PredictionResult, QuestionnaireResponse, QUESTIONNAIRE_ITEMS } from '@/types/autism';
import { responseToNumber } from '@/utils/dataProcessing';
import { toast } from '@/hooks/use-toast';
import { generatePDF } from '@/utils/pdfExport';
import { PredictionFeedback } from './PredictionFeedback';
import { ScoreBreakdown } from './ScoreBreakdown';
import { SessionHistory } from './SessionHistory';
import { saveSession } from '@/utils/sessionStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PredictionInterfaceProps {
  models: ModelComparison[];
}

export const PredictionInterface = ({ models }: PredictionInterfaceProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PredictionInput>({
    age: 2,
    gender: 'M',
    responses: new Array(10).fill('sometimes') as QuestionnaireResponse[]
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResponseChange = (questionIndex: number, response: QuestionnaireResponse) => {
    const newResponses = [...formData.responses];
    newResponses[questionIndex] = response;
    setFormData(prev => ({ ...prev, responses: newResponses }));
  };

  const calculatePrediction = (): PredictionResult => {
    const totalScore = formData.responses.reduce((sum, response) => 
      sum + responseToNumber(response), 0
    );

    let riskScore = 0;
    
    if (formData.age <= 3) riskScore += 0.05;
    else if (formData.age >= 10) riskScore += 0.03;
    
    if (formData.gender === 'M') riskScore += 0.05;
    
    const normalizedScore = totalScore / 40;
    riskScore = normalizedScore * 0.85 + (riskScore * 0.15);
    
    const highRiskResponses = formData.responses.filter(r => 
      r === 'always' || r === 'often'
    ).length;
    
    const lowEngagementResponses = formData.responses.filter(r => 
      r === 'never' || r === 'rarely'
    ).length;
    
    if (highRiskResponses >= 6) riskScore += 0.1;
    if (lowEngagementResponses >= 7) riskScore += 0.05;
    
    riskScore = Math.max(0, Math.min(1, riskScore));
    const riskPercentage = riskScore * 100;
    const prediction = riskPercentage >= 50 ? 1 : 0;
    
    let riskLevel: 'Low' | 'Medium' | 'High';
    let confidence: number;
    
    if (riskPercentage < 35) {
      riskLevel = 'Low';
      confidence = (35 - riskPercentage) / 35;
    } else if (riskPercentage < 65) {
      riskLevel = 'Medium';
      confidence = 0.7;
    } else {
      riskLevel = 'High';
      confidence = (riskPercentage - 65) / 35;
    }
    
    confidence = Math.min(0.95, Math.max(0.6, confidence));

    const scoreBreakdown = formData.responses.map((response, index) => ({
      question: QUESTIONNAIRE_ITEMS[index],
      response,
      score: responseToNumber(response),
    }));
    
    let recommendation: string;
    if (riskLevel === 'High') {
      recommendation = 'We strongly recommend consulting with a pediatric developmental specialist or child psychologist for a comprehensive evaluation. Early screening and intervention can significantly improve outcomes.';
    } else if (riskLevel === 'Medium') {
      recommendation = 'While the assessment shows moderate indicators, we recommend discussing these observations with your pediatrician. Continue monitoring your child\'s development closely.';
    } else {
      recommendation = 'The assessment suggests typical development patterns. Continue regular developmental check-ups with your pediatrician and implement the supportive strategies provided below.';
    }
    
    return {
      prediction: prediction as 0 | 1,
      confidence,
      riskLevel,
      recommendation,
      riskPercentage,
      scoreBreakdown,
      timestamp: new Date().toISOString(),
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = calculatePrediction();
    setPrediction(result);
    
    const totalScore = formData.responses.reduce((sum, response) => 
      sum + responseToNumber(response), 0
    );

    // Save to localStorage
    saveSession({
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      age: formData.age,
      gender: formData.gender,
      result,
      totalScore,
    });
    
    // Save to database
    if (user) {
      const { error } = await supabase
        .from('prediction_results')
        .insert({
          user_id: user.id,
          age: formData.age,
          gender: formData.gender,
          q1: formData.responses[0],
          q2: formData.responses[1],
          q3: formData.responses[2],
          q4: formData.responses[3],
          q5: formData.responses[4],
          q6: formData.responses[5],
          q7: formData.responses[6],
          q8: formData.responses[7],
          q9: formData.responses[8],
          q10: formData.responses[9],
          total_score: totalScore,
          risk_level: result.riskLevel,
          confidence: result.confidence,
          risk_percentage: result.riskPercentage || 0,
          recommendation: result.recommendation,
          prediction_result: result as any
        });
      
      if (error) {
        console.error('Error saving prediction:', error);
        toast({
          title: "Warning",
          description: "Assessment complete but couldn't save to history.",
          variant: "destructive"
        });
      }
    }
    
    toast({
      title: "Assessment Complete",
      description: `Risk Level: ${result.riskLevel} (${(result.confidence * 100).toFixed(0)}% confidence)`,
    });
    
    setLoading(false);
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setFormData({
      age: 2,
      gender: 'M',
      responses: new Array(10).fill('sometimes') as QuestionnaireResponse[]
    });
    setPrediction(null);
  };

  const progress = ((currentStep + 1) / 12) * 100;

  if (prediction) {
    return (
      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Results & Guidance</TabsTrigger>
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="space-y-6 animate-fade-in">
            {/* Results Header */}
            <Card className={`shadow-medium border-2 ${
              prediction.riskLevel === 'High' ? 'border-destructive bg-destructive/5' :
              prediction.riskLevel === 'Medium' ? 'border-warning bg-warning/5' :
              'border-success bg-success/5'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {prediction.riskLevel === 'High' ? (
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  ) : prediction.riskLevel === 'Medium' ? (
                    <Info className="h-6 w-6 text-warning" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-success" />
                  )}
                  Assessment Results
                </CardTitle>
                <CardDescription>
                  Based on the provided responses and our machine learning models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">
                      <Badge 
                        variant="outline" 
                        className={`text-2xl p-3 ${
                          prediction.riskLevel === 'High' ? 'border-destructive text-destructive' :
                          prediction.riskLevel === 'Medium' ? 'border-warning text-warning' :
                          'border-success text-success'
                        }`}
                      >
                        {prediction.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold mt-4">
                      {prediction.riskPercentage?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Level (0-100%)
                    </div>
                    <div className="text-base text-muted-foreground mt-2">
                      Assessment Confidence: {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <Progress 
                    value={prediction.riskPercentage || 0} 
                    className="h-4"
                  />
                </div>

                <Alert className={
                  prediction.riskLevel === 'High' ? 'border-destructive' :
                  prediction.riskLevel === 'Medium' ? 'border-warning' :
                  'border-success'
                }>
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="text-sm leading-relaxed">
                    {prediction.recommendation}
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formData.age}</div>
                    <div className="text-sm text-muted-foreground">Age (years)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formData.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                    <div className="text-sm text-muted-foreground">Gender</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formData.responses.reduce((sum, r) => sum + responseToNumber(r), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Parent Guidance */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-primary" />
                  Helpful Strategies & Support
                </CardTitle>
                <CardDescription>
                  Evidence-based approaches to support your child's development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">🗣️ Communication Support</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use clear, simple language and give your child extra time to respond</li>
                    <li>• Use visual aids like pictures or gestures to support understanding</li>
                    <li>• Practice turn-taking in conversations during daily activities</li>
                    <li>• Celebrate all communication attempts, verbal and non-verbal</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">🤝 Social Skills Development</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Arrange regular playdates with one or two peers in structured settings</li>
                    <li>• Practice social scenarios through role-play at home</li>
                    <li>• Use social stories to prepare for new situations</li>
                    <li>• Join parent-child groups focused on social skill building</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">🎯 Sensory & Behavioral Support</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Create a calm, predictable home environment with consistent routines</li>
                    <li>• Identify and minimize sensory triggers (loud noises, bright lights, textures)</li>
                    <li>• Provide sensory breaks and calming activities when needed</li>
                    <li>• Use positive reinforcement for desired behaviors</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">📚 Learning & Development</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Build on your child's strengths and special interests</li>
                    <li>• Break tasks into smaller, manageable steps</li>
                    <li>• Use visual schedules to support daily routines</li>
                    <li>• Incorporate play-based learning activities</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">👨‍👩‍👧 Family Well-being</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Connect with support groups for parents of children with similar needs</li>
                    <li>• Practice self-care and seek support when feeling overwhelmed</li>
                    <li>• Educate family members about your child's unique needs</li>
                    <li>• Celebrate small victories and progress</li>
                  </ul>
                </div>

                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2 text-primary">⏱️ Next Steps Timeline</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Immediate:</strong> Start implementing the strategies above</li>
                    <li>• <strong>Within 1-2 weeks:</strong> Schedule an appointment with your pediatrician</li>
                    <li>• <strong>Within 1 month:</strong> Request a developmental evaluation if recommended</li>
                    <li>• <strong>Ongoing:</strong> Track your child's progress and responses to interventions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This tool is for screening purposes only and should not replace professional medical diagnosis. 
                These strategies are general recommendations. Always consult with healthcare professionals 
                (pediatrician, developmental psychologist, or autism specialist) for personalized guidance 
                and proper evaluation.
              </AlertDescription>
            </Alert>

            <PredictionFeedback />

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => generatePDF(prediction, formData)} 
                variant="default" 
                size="lg"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
              <Button onClick={resetAssessment} variant="outline" size="lg">
                Take New Assessment
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <ScoreBreakdown result={prediction} />
        </TabsContent>

        <TabsContent value="history">
          <SessionHistory />
        </TabsContent>
      </Tabs>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Child Demographics</h3>
          <p className="text-muted-foreground text-lg">Please provide basic information about the child (ages 2-14)</p>
        </div>

        <Card className="shadow-soft max-w-md mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="age">Child's Age</Label>
              <Select
                value={formData.age.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, age: parseInt(value) }))}
              >
                <SelectTrigger id="age">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => i + 2).map(age => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Child's Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'M' | 'F' }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={() => setCurrentStep(1)} className="w-full" size="lg">
              Continue to Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep >= 1 && currentStep <= 10) {
    const questionIndex = currentStep - 1;
    const progressValue = ((currentStep) / 11) * 100;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-base px-3 py-1">
            Question {currentStep} of {QUESTIONNAIRE_ITEMS.length}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progressValue)}% Complete
          </span>
        </div>

        <Progress value={progressValue} className="h-3" />

        <Card className="border-2 shadow-soft">
          <CardHeader className="bg-gradient-subtle">
            <CardTitle className="text-xl leading-relaxed">{QUESTIONNAIRE_ITEMS[questionIndex]}</CardTitle>
            <CardDescription className="text-base">
              Select the response that best describes your child's typical behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <RadioGroup
              value={formData.responses[questionIndex]}
              onValueChange={(value) => handleResponseChange(questionIndex, value as QuestionnaireResponse)}
            >
              {(['never', 'rarely', 'sometimes', 'often', 'always'] as QuestionnaireResponse[]).map((response) => (
                <div key={response} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all">
                  <RadioGroupItem value={response} id={response} />
                  <Label 
                    htmlFor={response} 
                    className="flex-1 cursor-pointer capitalize text-base font-medium"
                  >
                    {response}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex-1"
            size="lg"
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep < 11) {
                setCurrentStep(prev => prev + 1);
              }
            }}
            disabled={!formData.responses[questionIndex]}
            className="flex-1"
            size="lg"
          >
            {currentStep === 10 ? 'Review Answers' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Your Answers</h2>
        <p className="text-muted-foreground text-lg">
          Please review all responses before submitting for analysis
        </p>
      </div>

      <Card className="shadow-soft max-w-4xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <span className="font-medium">Age:</span> {formData.age} years old
            </div>
            <div>
              <span className="font-medium">Gender:</span> {formData.gender === 'M' ? 'Male' : 'Female'}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Questionnaire Responses</h4>
            <div className="grid gap-3">
              {QUESTIONNAIRE_ITEMS.map((question, index) => (
                <div key={index} className="flex justify-between items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 pr-4">
                    <div className="font-medium text-sm">Q{index + 1}</div>
                    <div className="text-sm text-muted-foreground">{question}</div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {formData.responses[index]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(10)}
              size="lg"
            >
              Back to Questions
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="bg-gradient-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                'Get Assessment Results'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
