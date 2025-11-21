-- Update profiles table to auto-approve new users
ALTER TABLE public.profiles 
ALTER COLUMN approval_status SET DEFAULT 'approved';

-- Update all existing pending users to approved
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE approval_status = 'pending';

-- Update the trigger function to set approval_status to approved
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'approved'
  );
  RETURN NEW;
END;
$$;