'use server';
/**
 * @fileOverview Extracts text from a given PDF file.
 *
 * - extractTextFromPdf - A function that extracts text from a PDF file.
 * - ExtractTextFromPdfInput - The input type for the extractTextFromPdf function.
 * - ExtractTextFromPdfOutput - The return type for the extractTextFromPdf function.
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


export async function extractTextFromPdf(input: ExtractTextFromPdfInput): Promise<ExtractTextFromPdfOutput> {
  return extractTextFromPdfFlow(input);
}


const extractTextFromPdfFlow = ai.defineFlow(
    {
      name: 'extractTextFromPdfFlow',
      inputSchema: ExtractTextFromPdfInputSchema,
      outputSchema: ExtractTextFromPdfOutputSchema,
    },
    async (input) => {
      try {
        const {text} = await ai.generate({
          prompt: [
              {text: "Extract all text from the following document provided as a data URI."},
              {media: {url: input.fileDataUri}}
          ]
        });
    
        return {text};
      } catch (e) {
        console.error("Error during PDF text extraction:", e);
        throw e;
      }
    }
  );
  
