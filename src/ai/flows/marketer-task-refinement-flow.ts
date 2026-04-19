'use server';
/**
 * @fileOverview An AI agent that refines marketing tasks by suggesting detailed descriptions, sub-tasks, and steps.
 *
 * - refineMarketerTask - A function that handles the task refinement process for marketers.
 * - MarketerTaskRefinementInput - The input type for the refineMarketerTask function.
 * - MarketerTaskRefinementOutput - The return type for the refineMarketerTask function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketerTaskRefinementInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The initial high-level task description provided by the marketer.'),
});
export type MarketerTaskRefinementInput = z.infer<
  typeof MarketerTaskRefinementInputSchema
>;

const MarketerTaskRefinementOutputSchema = z.object({
  refinedDescription: z
    .string()
    .describe('A more detailed, clear, and expanded description of the task.'),
  subTasks: z
    .array(z.string())
    .describe('A list of smaller, manageable sub-tasks that compose the main task.'),
  steps: z
    .array(z.string())
    .describe('A sequential list of steps required to complete the main task.'),
});
export type MarketerTaskRefinementOutput = z.infer<
  typeof MarketerTaskRefinementOutputSchema
>;

export async function refineMarketerTask(
  input: MarketerTaskRefinementInput
): Promise<MarketerTaskRefinementOutput> {
  return marketerTaskRefinementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketerTaskRefinementPrompt',
  input: { schema: MarketerTaskRefinementInputSchema },
  output: { schema: MarketerTaskRefinementOutputSchema },
  prompt: `You are an expert project manager and task planner for an IT service company.
Your primary goal is to take a high-level task description provided by a marketer and transform it into a clear, detailed, and actionable plan for a technician.

Refine the given task description, suggest relevant sub-tasks, and outline a step-by-step process for its completion.
Ensure the output is comprehensive, minimizes ambiguity, and provides all necessary information for a technician to efficiently complete the work.

Initial Task Description: {{{taskDescription}}}`,
});

const marketerTaskRefinementFlow = ai.defineFlow(
  {
    name: 'marketerTaskRefinementFlow',
    inputSchema: MarketerTaskRefinementInputSchema,
    outputSchema: MarketerTaskRefinementOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
