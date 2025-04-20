// landing-page-optimization.ts
'use server';
/**
 * @fileOverview Landing Page Optimization AI agent.
 *
 * - landingPageOptimization - A function that handles the landing page optimization process.
 * - LandingPageOptimizationInput - The input type for the landingPageOptimization function.
 * - LandingPageOptimizationOutput - The return type for the landingPageOptimization function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const LandingPageOptimizationInputSchema = z.object({
  pageTitle: z.string().describe('The title of the landing page.'),
  pageDescription: z.string().describe('The description of the landing page.'),
  heroHeadline: z.string().describe('The main headline of the hero section.'),
  heroDescription: z.string().describe('The description in the hero section.'),
  featureHighlights: z.array(z.string()).describe('Array of feature highlights.'),
  callToAction: z.string().describe('The text for the call to action button.'),
});
export type LandingPageOptimizationInput = z.infer<typeof LandingPageOptimizationInputSchema>;

const LandingPageOptimizationOutputSchema = z.object({
  improvedHeadline: z.string().describe('An improved version of the hero headline.'),
  improvedDescription: z.string().describe('An improved version of the hero description.'),
  improvedFeatureHighlights: z.array(z.string()).describe('Improved feature highlights.'),
  improvedCallToAction: z.string().describe('An improved call to action text.'),
  layoutSuggestions: z.string().describe('Suggestions for improving the landing page layout based on conversion rate optimization principles.'),
});
export type LandingPageOptimizationOutput = z.infer<typeof LandingPageOptimizationOutputSchema>;

export async function landingPageOptimization(input: LandingPageOptimizationInput): Promise<LandingPageOptimizationOutput> {
  return landingPageOptimizationFlow(input);
}

const landingPageOptimizationPrompt = ai.definePrompt({
  name: 'landingPageOptimizationPrompt',
  input: {
    schema: z.object({
      pageTitle: z.string().describe('The title of the landing page.'),
      pageDescription: z.string().describe('The description of the landing page.'),
      heroHeadline: z.string().describe('The main headline of the hero section.'),
      heroDescription: z.string().describe('The description in the hero section.'),
      featureHighlights: z.array(z.string()).describe('Array of feature highlights.'),
      callToAction: z.string().describe('The text for the call to action button.'),
    }),
  },
  output: {
    schema: z.object({
      improvedHeadline: z.string().describe('An improved version of the hero headline.'),
      improvedDescription: z.string().describe('An improved version of the hero description.'),
      improvedFeatureHighlights: z.array(z.string()).describe('Improved feature highlights.'),
      improvedCallToAction: z.string().describe('An improved call to action text.'),
      layoutSuggestions: z.string().describe('Suggestions for improving the landing page layout based on conversion rate optimization principles.'),
    }),
  },
  prompt: `You are an AI-powered landing page optimization expert. Analyze the following landing page elements and provide suggestions for improvement based on conversion rate optimization (CRO) principles.

Page Title: {{{pageTitle}}}
Page Description: {{{pageDescription}}}

Hero Section:
Headline: {{{heroHeadline}}}
Description: {{{heroDescription}}}

Feature Highlights:
{{#each featureHighlights}}- {{{this}}}
{{/each}}

Call to Action: {{{callToAction}}}


Based on CRO principles, suggest improvements to:
- The hero headline to be more engaging and attention-grabbing.
- The hero description to clearly communicate the value proposition.
- The feature highlights to be more benefit-oriented.
- The call to action to be more compelling and persuasive.
- The overall landing page layout to improve user experience and conversion rates.
`,
});

const landingPageOptimizationFlow = ai.defineFlow<
  typeof LandingPageOptimizationInputSchema,
  typeof LandingPageOptimizationOutputSchema
>({
  name: 'landingPageOptimizationFlow',
  inputSchema: LandingPageOptimizationInputSchema,
  outputSchema: LandingPageOptimizationOutputSchema,
}, async input => {
  const {output} = await landingPageOptimizationPrompt(input);
  return output!;
});
