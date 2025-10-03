import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PREDEFINED_QA = {
  'signs': 'Early signs of autism may include: limited eye contact, delayed speech development, repetitive behaviors, difficulty with social interactions, intense focus on specific interests, sensitivity to sensory input, and challenges with changes in routine. Every child is unique, so these signs can vary.',
  
  'diagnosis': 'Autism diagnosis typically involves: comprehensive developmental evaluation by specialists, behavioral observations, parent interviews, standardized screening tools, and assessment of communication and social skills. The process usually requires multiple appointments with developmental pediatricians, psychologists, or autism specialists.',
  
  'intervention': 'Early intervention approaches include: Applied Behavior Analysis (ABA), speech therapy, occupational therapy, social skills training, developmental therapies, parent training programs, and educational support. Early intervention starting before age 3 can significantly improve outcomes.',
  
  'support': 'Support resources include: local autism organizations, parent support groups, special education services, respite care programs, online communities, advocacy organizations like Autism Speaks and ASAN, and family counseling services. Your pediatrician can provide local referrals.',
  
  'school': 'School accommodations may include: Individualized Education Program (IEP), 504 plan, specialized instruction, sensory breaks, modified assignments, assistive technology, social skills groups, and dedicated support staff. Work with your school\'s special education team to develop appropriate supports.',
  
  'therapy': 'Common therapies include: Speech-Language Therapy (for communication), Occupational Therapy (for daily living and sensory needs), Physical Therapy (for motor skills), Social Skills Training, Behavioral Therapy (ABA), and Cognitive Behavioral Therapy. A multidisciplinary approach often works best.',
  
  'behavior': 'Managing challenging behaviors: establish clear routines, use visual supports, identify triggers, teach alternative communication, provide sensory breaks, use positive reinforcement, stay calm and consistent, and work with a behavioral specialist for persistent challenges.',
  
  'development': 'Supporting development: follow your child\'s lead and interests, use play-based learning, provide structured routines, celebrate small achievements, focus on communication skills, encourage peer interactions, and work closely with therapy teams. Progress may be gradual but consistent.'
};

const QUICK_QUESTIONS = [
  { id: 'signs', label: 'What are early signs of autism?' },
  { id: 'diagnosis', label: 'How is autism diagnosed?' },
  { id: 'intervention', label: 'What is early intervention?' },
  { id: 'support', label: 'Where can I find support resources?' },
  { id: 'school', label: 'What school accommodations are available?' },
  { id: 'therapy', label: 'What therapy options exist?' },
  { id: 'behavior', label: 'How to manage challenging behaviors?' },
  { id: 'development', label: 'How to support my child\'s development?' }
];

export const AutismChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to provide information about autism and support strategies. Please click on any question below to get started.'
    }
  ]);

  const handleQuickQuestion = (questionId: string) => {
    const question = QUICK_QUESTIONS.find(q => q.id === questionId);
    if (question) {
      const userMessage: Message = { role: 'user', content: question.label };
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: PREDEFINED_QA[questionId as keyof typeof PREDEFINED_QA] 
      };
      setMessages(prev => [...prev, userMessage, assistantMessage]);
    }
  };


  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Autism Support Assistance</CardTitle>
            <CardDescription>Get answers to common questions about autism by clicking on the questions below</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Quick Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUICK_QUESTIONS.map(q => (
            <Button
              key={q.id}
              variant="outline"
              onClick={() => handleQuickQuestion(q.id)}
              className="text-left justify-start h-auto py-3 px-4"
            >
              {q.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
