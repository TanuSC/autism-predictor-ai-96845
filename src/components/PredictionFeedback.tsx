import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PredictionFeedbackProps {
  predictionId?: string;
}

export const PredictionFeedback = ({ predictionId }: PredictionFeedbackProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Store feedback in localStorage (in production, this would go to a database)
    const feedback = {
      id: Date.now().toString(),
      predictionId: predictionId || 'unknown',
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    const existingFeedback = JSON.parse(localStorage.getItem('autism_feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('autism_feedback', JSON.stringify(existingFeedback));

    setSubmitted(true);
    toast({
      title: "Thank You!",
      description: "Your feedback has been submitted successfully.",
    });
  };

  if (submitted) {
    return (
      <Card className="border-success bg-success/5">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-medium text-success">Thank you for your feedback!</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your input helps us improve our assessment tool.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How was your experience?</CardTitle>
        <CardDescription>
          Your feedback helps us improve this assessment tool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Optional Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Additional Comments (Optional)
          </label>
          <Textarea
            placeholder="Share your thoughts about this assessment tool..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
};