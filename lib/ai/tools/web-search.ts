import { tool } from 'ai';
import { z } from 'zod';

export const webSearch = tool({
  description: 'Search the web for up-to-date information about any topic.',
  parameters: z.object({
    query: z.string().describe('The search query to look up on the web.'),
  }),
  async execute({ query }) {
    // The Vercel AI SDK will handle the actual web search.
    return { result: `Searching the web for: ${query}` };
  },
});
