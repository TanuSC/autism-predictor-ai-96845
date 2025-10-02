import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';

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
  { id: 'signs', label: 'Early Signs of Autism' },
  { id: 'diagnosis', label: 'Diagnosis Process' },
  { id: 'intervention', label: 'Early Intervention' },
  { id: 'support', label: 'Support Resources' },
  { id: 'school', label: 'School Support' },
  { id: 'therapy', label: 'Therapy Options' },
  { id: 'behavior', label: 'Behavior Management' },
  { id: 'development', label: 'Supporting Development' }
];

export const AutismChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to provide information about autism and support strategies. You can ask me questions or click on the quick topics below to get started.'
    }
  ]);
  const [input, setInput] = useState('');

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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Simple keyword matching for predefined answers
    const lowerInput = input.toLowerCase();
    let response = 'Thank you for your question. For specific medical advice, please consult with a healthcare professional. You can also explore the quick topics above for general information about autism support and strategies.';

    for (const [key, value] of Object.entries(PREDEFINED_QA)) {
      if (lowerInput.includes(key) || 
          (key === 'signs' && (lowerInput.includes('symptom') || lowerInput.includes('indicator'))) ||
          (key === 'therapy' && lowerInput.includes('treatment')) ||
          (key === 'support' && (lowerInput.includes('help') || lowerInput.includes('resource')))) {
        response = value;
        break;
      }
    }

    const assistantMessage: Message = { role: 'assistant', content: response };
    setMessages(prev => [...prev, assistantMessage]);
    setInput('');
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Autism Support Assistant</CardTitle>
            <CardDescription>Get answers to common questions about autism</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <Button
              key={q.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuestion(q.id)}
              className="text-xs"
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
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
