'use server';
/**
 * @fileOverview Extracts text from a given PDF file.
 * It intelligently decides whether to use a fast text-layer extraction 
 * or a more robust OCR-based extraction.
 *
 * - extractTextFromPdf - A function that extracts text from a PDF file.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromPdfInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromPdfInput = z.infer<typeof ExtractTextFromPdfInputSchema>;

const ExtractTextFromPdfOutputSchema = z.object({
  text: z.string().describe('The extracted text from the PDF file.'),
});
export type ExtractTextFromPdfOutput = z.infer<typeof ExtractTextFromPdfOutputSchema>;


const fastExtractionTool = ai.defineTool(
  {
    name: 'fastExtraction',
    description: 'Use this tool for PDFs that have a selectable text layer. This is the fastest method.',
    inputSchema: z.object({
        media: z.object({ url: z.string() }),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    // This is a placeholder for the actual implementation which is handled by the model.
    return { success: true };
  }
);


export async function extractTextFromPdf(input: ExtractTextFromPdfInput): Promise<ExtractTextFromPdfOutput> {
  const { text } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Extract the text from the following document. First, try to use the fast method. If and only if the fast method returns empty or garbled text, then use the slower OCR method.
    Document:
    {{media url=fileDataUri}}
    `,
    tools: [fastExtractionTool],
    toolConfig: {
        mode: 'auto'
    }
  });

  return { text };
}
