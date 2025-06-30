'use server';

/**
 * @fileOverview A flow to highlight relevant events in the timeline.
 *
 * - highlightRelevantEvents - A function that takes event data and returns a highlighted/categorized version.
 * - HighlightRelevantEventsInput - The input type for the highlightRelevantEvents function.
 * - HighlightRelevantEventsOutput - The return type for the highlightRelevantEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HighlightRelevantEventsInputSchema = z.object({
  eventData: z.string().describe('The text content of the event.'),
});
export type HighlightRelevantEventsInput = z.infer<typeof HighlightRelevantEventsInputSchema>;

const HighlightRelevantEventsOutputSchema = z.object({
  category: z.string().describe('The category of the event (e.g., critical milestone, potential issue, normal update).'),
  highlight: z.boolean().describe('Whether the event should be highlighted.'),
  reason: z.string().describe('The AI-generated reason for the categorization and highlighting.'),
});
export type HighlightRelevantEventsOutput = z.infer<typeof HighlightRelevantEventsOutputSchema>;

export async function highlightRelevantEvents(input: HighlightRelevantEventsInput): Promise<HighlightRelevantEventsOutput> {
  return highlightRelevantEventsFlow(input);
}

const highlightRelevantEventsPrompt = ai.definePrompt({
  name: 'highlightRelevantEventsPrompt',
  input: {schema: HighlightRelevantEventsInputSchema},
  output: {schema: HighlightRelevantEventsOutputSchema},
  prompt: `You are an AI assistant helping to categorize and highlight events in a project timeline.

  Given the following event data, determine its category (critical milestone, potential issue, normal update, or other relevant category), whether it should be highlighted, and provide a brief reason for your decision.

  Event Data: {{{eventData}}}

  Respond with the category, highlight boolean, and reason, setting the isHealthy output field appropriately. The reason should be concise.
`,
});

const highlightRelevantEventsFlow = ai.defineFlow(
  {
    name: 'highlightRelevantEventsFlow',
    inputSchema: HighlightRelevantEventsInputSchema,
    outputSchema: HighlightRelevantEventsOutputSchema,
  },
  async input => {
    const {output} = await highlightRelevantEventsPrompt(input);
    return output!;
  }
);
