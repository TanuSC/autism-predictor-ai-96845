-- Create prediction_results table to store all prediction history
CREATE TABLE public.prediction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  q1 TEXT NOT NULL,
  q2 TEXT NOT NULL,
  q3 TEXT NOT NULL,
  q4 TEXT NOT NULL,
  q5 TEXT NOT NULL,
  q6 TEXT NOT NULL,
  q7 TEXT NOT NULL,
  q8 TEXT NOT NULL,
  q9 TEXT NOT NULL,
  q10 TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  risk_percentage NUMERIC NOT NULL,
  recommendation TEXT NOT NULL,
  prediction_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own predictions
CREATE POLICY "Users can view own predictions"
ON public.prediction_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
ON public.prediction_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all predictions
CREATE POLICY "Admins can view all predictions"
ON public.prediction_results
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_prediction_results_user_id ON public.prediction_results(user_id);
CREATE INDEX idx_prediction_results_created_at ON public.prediction_results(created_at DESC);