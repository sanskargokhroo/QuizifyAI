'use client';

import { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateQuizAction, extractTextFromFileAction } from '@/app/actions';
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
  const [state, formAction] = useActionState(generateQuizAction, initialState);
  const { toast } = useToast();
  const [numQuestions, setNumQuestions] = useState(10);
  const [textContent, setTextContent] = useState('');
  const [activeTab, setActiveTab] = useState('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);

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
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsExtracting(true);
      setActiveTab('paste'); // Switch to paste tab to show progress/result
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileDataUri = e.target?.result as string;
        const result = await extractTextFromFileAction({ fileDataUri });
        setIsExtracting(false);
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Extraction Error',
            description: result.error,
          });
          setTextContent('');
        } else if (result.text) {
          setTextContent(result.text);
          toast({
            title: 'Success',
            description: 'Text extracted from the file.',
          });
        }
      };
      reader.onerror = () => {
        setIsExtracting(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to read the file.',
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
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
              <div className="grid w-full gap-2 relative">
                <Label htmlFor="text-content">Your Text Content</Label>
                <Textarea
                  id="text-content"
                  name="text"
                  placeholder="Paste your notes, article, or any text here... (min. 50 characters)"
                  className="min-h-[200px] text-base"
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isExtracting}
                />
                 {isExtracting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Extracting text from file...
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <div 
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={triggerFileSelect}
              >
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold text-primary">Click to upload a file</p>
                <p className="text-sm text-muted-foreground">.txt, .pdf, .doc, .docx are supported.</p>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
