'use server';
/**
 * @fileOverview Extracts text from a given file using OCR.
 *
 * - extractTextFromFile - A function that extracts text from a file.
 * - ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * - ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file (like PDF, DOC, DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  text: z.string().describe('The extracted text from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async (input) => {
    // Extract mimetype from data URI
    const mimeMatch = input.fileDataUri.match(/^data:(.*?);base64,/);
    if (!mimeMatch) {
      // Fallback for when mimetype is not in the data URI, though it should be.
      const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import('file-type')>);
      const buffer = Buffer.from(input.fileDataUri.substring(input.fileDataUri.indexOf(',') + 1), 'base64');
      const type = await fileTypeFromBuffer(buffer);
      if (!type) {
        throw new Error('Could not determine file type.');
      }
      const {text} = await ai.generate({
        prompt: [
          {text: 'Extract all text content from the following document. If the document is a DOC/DOCX, it will be provided in a compatible format. For all file types, extract the raw text content accurately.'},
          {media: {url: input.fileDataUri, contentType: type.mime }},
        ],
      });
      return {text};
    }

    const contentType = mimeMatch[1];
    
    const {text} = await ai.generate({
      prompt: [
        {text: 'Extract all text content from the following document. If the document is a DOC/DOCX, it will be provided in a compatible format. For all file types, extract the raw text content accurately.'},
        {media: {url: input.fileDataUri, contentType }},
      ],
    });

    return {text};
  }
);
