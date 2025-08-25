'use client';

import { useEffect, useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { generateQuizAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, LoaderCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';

type QuizConfigProps = {
  onQuizGenerated: (quiz: GenerateQuizOutput['quiz'], text: string) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Quiz
        </>
      )}
    </Button>
  );
}

export default function QuizConfig({ onQuizGenerated }: QuizConfigProps) {
  const initialState = { quiz: null, error: null, text: null };
  const [state, formAction] = useFormState(generateQuizAction, initialState);
  const { toast } = useToast();
  const [numQuestions, setNumQuestions] = useState(10);
  const [textContent, setTextContent] = useState('');
  const [activeTab, setActiveTab] = useState('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.quiz && state.text) {
      onQuizGenerated(state.quiz, state.text);
    }
  }, [state, onQuizGenerated, toast]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setTextContent(fileContent);
        // Switch to paste tab to show content
        setActiveTab('paste');
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to read file.',
        });
      };
      reader.readAsText(file);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create Your Quiz</CardTitle>
        <CardDescription>Start by providing some text content. We'll use AI to generate a quiz from it.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="mt-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="text-content">Your Text Content</Label>
                <Textarea
                  id="text-content"
                  name="text"
                  placeholder="Paste your notes, article, or any text here... (min. 50 characters)"
                  className="min-h-[200px] text-base"
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <div 
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={triggerFileSelect}
              >
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold text-primary">Click to upload a file</p>
                <p className="text-sm text-muted-foreground">Only .txt files are supported for now.</p>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileChange}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Label htmlFor="num-questions" className="mb-2 block">Number of Questions: {numQuestions}</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">5</span>
              <Slider
                id="num-questions"
                name="numQuestions"
                min={5}
                max={50}
                step={1}
                value={[numQuestions]}
                onValueChange={(value) => setNumQuestions(value[0])}
              />
              <span className="text-sm font-medium">50</span>
            </div>
            <input type="hidden" name="numQuestions" value={numQuestions} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
