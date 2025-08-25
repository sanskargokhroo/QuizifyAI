'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';

type QuizDisplayProps = {
  quiz: GenerateQuizOutput['quiz'];
  onQuizFinish: (answers: string[]) => void;
};

export default function QuizDisplay({ quiz, onQuizFinish }: QuizDisplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(Array(quiz.length).fill(''));
  
  const currentQuestion = quiz[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    onQuizFinish(selectedAnswers);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
           <CardTitle>Question {currentQuestionIndex + 1}/{quiz.length}</CardTitle>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="min-h-[250px]">
        <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
        <RadioGroup
          value={selectedAnswers[currentQuestionIndex]}
          onValueChange={handleAnswerChange}
          className="space-y-3"
        >
          {currentQuestion.answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value={answer} id={`q${currentQuestionIndex}-a${index}`} />
              <Label htmlFor={`q${currentQuestionIndex}-a${index}`} className="text-base cursor-pointer flex-1">
                {answer}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {currentQuestionIndex < quiz.length - 1 ? (
          <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestionIndex]} className="bg-accent hover:bg-accent/90">
            Submit
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
