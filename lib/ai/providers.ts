import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { webSearch } from './tools/web-search';

// Hard code the OpenAI API key (the only way to do this in code)
process.env.OPENAI_API_KEY =
  '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';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': { ...chatModel, tools: [webSearch] },
        'chat-model-reasoning': { ...reasoningModel, tools: [webSearch] },
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': {
          ...wrapLanguageModel({
            model: openai('gpt-4o'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
        },
        'chat-model-2': {
          ...wrapLanguageModel({
            model: openai('gpt-4o'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
        },
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'),
      },
    });
