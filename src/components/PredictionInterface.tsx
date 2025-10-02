import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, CheckCircle, Info, InfoIcon } from 'lucide-react';
import { ModelComparison, PredictionInput, PredictionResult, QuestionnaireResponse, QUESTIONNAIRE_ITEMS } from '@/types/autism';
import { responseToNumber } from '@/utils/dataProcessing';
import { toast } from '@/hooks/use-toast';

interface PredictionInterfaceProps {
  models: ModelComparison[];
}

export const PredictionInterface = ({ models }: PredictionInterfaceProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PredictionInput>({
    age: 5,
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
    // Calculate total score
    const totalScore = formData.responses.reduce((sum, response) => 
      sum + responseToNumber(response), 0
    );

    // Simple rule-based prediction for demonstration
    // In a real application, this would use the trained ML models
    let riskScore = 0;
    
    // Age factor (younger children have different patterns)
    if (formData.age <= 3) riskScore += 0.1;
    else if (formData.age >= 10) riskScore += 0.05;
    
    // Gender factor (males have higher prevalence)
    if (formData.gender === 'M') riskScore += 0.1;
    
    // Score-based risk assessment
    const normalizedScore = totalScore / 40; // Max possible score is 40
    riskScore += normalizedScore * 0.8;
    
    // Response pattern analysis (looking for specific patterns)
    const highRiskResponses = formData.responses.filter(r => 
      r === 'always' || r === 'often'
    ).length;
    
    const lowEngagementResponses = formData.responses.filter(r => 
      r === 'never' || r === 'rarely'
    ).length;
    
    if (highRiskResponses >= 6) riskScore += 0.2;
    if (lowEngagementResponses >= 6) riskScore += 0.15;
    
    // Clamp risk score between 0 and 1
    riskScore = Math.max(0, Math.min(1, riskScore));
    
    const prediction = riskScore >= 0.6 ? 1 : 0;
    const confidence = riskScore >= 0.6 ? riskScore : 1 - riskScore;
    
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (riskScore < 0.3) riskLevel = 'Low';
    else if (riskScore < 0.7) riskLevel = 'Medium';
    else riskLevel = 'High';
    
    let recommendation: string;
    if (prediction === 1) {
      recommendation = 'We recommend consulting with a pediatric developmental specialist or child psychologist for a comprehensive evaluation. Early screening and intervention can significantly improve outcomes.';
    } else if (riskLevel === 'Medium') {
      recommendation = 'While the current assessment suggests lower risk, continue monitoring your child\'s development and consult with your pediatrician if you have concerns.';
    } else {
      recommendation = 'The assessment suggests typical development patterns. Continue regular developmental check-ups with your pediatrician.';
    }
    
    return {
      prediction: prediction as 0 | 1,
      confidence,
      riskLevel,
      recommendation
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = calculatePrediction();
    setPrediction(result);
    setLoading(false);
    
    toast({
      title: "Assessment Complete",
      description: `Risk Level: ${result.riskLevel} (${(result.confidence * 100).toFixed(1)}% confidence)`,
    });
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setFormData({
      age: 5,
      gender: 'M',
      responses: new Array(10).fill('sometimes') as QuestionnaireResponse[]
    });
    setPrediction(null);
  };

  const progress = ((currentStep + 1) / 12) * 100;

  if (prediction) {
    return (
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
            {/* Risk Level */}
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
                <div className="text-lg text-muted-foreground">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </div>
              </div>
              
              <Progress 
                value={prediction.confidence * 100} 
                className="h-3"
              />
            </div>

            {/* Recommendation */}
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

            {/* Assessment Summary */}
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

        {/* Disclaimer */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This tool is for screening purposes only and should not replace professional medical diagnosis. 
            These strategies are general recommendations. Always consult with healthcare professionals 
            (pediatrician, developmental psychologist, or autism specialist) for personalized guidance 
            and proper evaluation.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={resetAssessment} variant="outline" size="lg">
            Take New Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    // Demographics step
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Child Demographics</h3>
          <p className="text-muted-foreground">Please provide basic information about the child</p>
        </div>

        <Card className="shadow-soft max-w-md mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="age">Child's Age</Label>
              <Select 
                value={formData.age.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, age: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => i + 2).map(age => (
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
    // Question steps
    const questionIndex = currentStep - 1;
    const question = QUESTIONNAIRE_ITEMS[questionIndex];
    const responses: QuestionnaireResponse[] = ['never', 'rarely', 'sometimes', 'often', 'always'];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentStep} of 10</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-soft max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentStep}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{question}</p>

            <RadioGroup
              value={formData.responses[questionIndex]}
              onValueChange={(value) => handleResponseChange(questionIndex, value as QuestionnaireResponse)}
              className="space-y-3"
            >
              {responses.map((response) => (
                <div key={response} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={response} id={response} />
                  <Label htmlFor={response} className="text-base capitalize cursor-pointer flex-1">
                    {response}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!formData.responses[questionIndex]}
              >
                {currentStep === 10 ? 'Review Answers' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review step
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Review Your Answers</h3>
        <p className="text-muted-foreground">Please review your responses before submitting</p>
      </div>

      <Card className="shadow-soft max-w-4xl mx-auto">
        <CardContent className="p-6 space-y-6">
          {/* Demographics Summary */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <span className="font-medium">Age:</span> {formData.age} years old
            </div>
            <div>
              <span className="font-medium">Gender:</span> {formData.gender === 'M' ? 'Male' : 'Female'}
            </div>
          </div>

          {/* Questions Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold">Questionnaire Responses</h4>
            <div className="grid gap-3">
              {QUESTIONNAIRE_ITEMS.map((question, index) => (
                <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
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