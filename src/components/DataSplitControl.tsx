import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Split, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataSplitControlProps {
  totalDataPoints: number;
  onSplit?: (trainSize: number, testSize: number) => void;
  currentSplit?: number;
}

export const DataSplitControl = ({ totalDataPoints, onSplit, currentSplit }: DataSplitControlProps) => {
  const [trainPercentage, setTrainPercentage] = useState(currentSplit || 80);
  const [isSplitting, setIsSplitting] = useState(false);

  const trainSize = Math.round((totalDataPoints * trainPercentage) / 100);
  const testSize = totalDataPoints - trainSize;

  const handleSplit = () => {
    setIsSplitting(true);
    
    setTimeout(() => {
      onSplit?.(trainSize, testSize);
      setIsSplitting(false);
      
      toast({
        title: "Data Split Complete",
        description: `Training set: ${trainSize} samples (${trainPercentage}%), Test set: ${testSize} samples (${100 - trainPercentage}%)`,
      });
    }, 1000);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Split className="h-5 w-5 text-primary" />
          Train-Test Split Configuration
        </CardTitle>
        <CardDescription>
          Configure how the dataset is divided for model training and evaluation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Split Ratio Control */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">
              Training Data Ratio
            </label>
            <span className="text-2xl font-bold text-primary">
              {trainPercentage}%
            </span>
          </div>
          
          <Slider
            value={[trainPercentage]}
            onValueChange={(value) => setTrainPercentage(value[0])}
            min={60}
            max={90}
            step={5}
            className="w-full"
          />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>60% Training</span>
            <span>90% Training</span>
          </div>
        </div>

        {/* Split Preview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Training Set</div>
            <div className="text-3xl font-bold text-primary">{trainSize}</div>
            <div className="text-xs text-muted-foreground">samples ({trainPercentage}%)</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Test Set</div>
            <div className="text-3xl font-bold text-secondary">{testSize}</div>
            <div className="text-xs text-muted-foreground">samples ({100 - trainPercentage}%)</div>
          </div>
        </div>

        {/* Visual Representation */}
        <div className="space-y-2">
          <div className="h-8 rounded-lg overflow-hidden flex">
            <div 
              className="bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium"
              style={{ width: `${trainPercentage}%` }}
            >
              Train
            </div>
            <div 
              className="bg-secondary flex items-center justify-center text-xs text-secondary-foreground font-medium"
              style={{ width: `${100 - trainPercentage}%` }}
            >
              Test
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            The training set is used to train the model, while the test set evaluates its performance
          </p>
        </div>

        {/* Split Button */}
        <Button 
          onClick={handleSplit} 
          className="w-full"
          disabled={isSplitting}
        >
          {isSplitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Splitting Data...
            </>
          ) : (
            <>
              <Split className="mr-2 h-4 w-4" />
              Apply Train-Test Split
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};