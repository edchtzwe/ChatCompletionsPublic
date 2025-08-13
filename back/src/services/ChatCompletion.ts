import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

import { logError, logInfo } from '@services/Logger';
import { OpenAIService } from '@services/OpenAI';
import GoogleAIService from '@services/Google';
import AnthropicAIService from '@services/Anthropic';
import { MODEL_MAP, ModelDefinition } from '@services/ModelConfiguration';

export interface chatContext {
    role: string,
    content: string
};

interface WebSearchOptions {
    search_context_size: number;
    user_location: {
        type: 'approximate';
        approximate: {
            country?: string;
            city?: string;
            region?: string;
        };
    };
}

type ExtendedChatCompletionCreateParams = OpenAI.Chat.Completions.ChatCompletionCreateParams & {
    web_search_options?: WebSearchOptions;
};

export interface chatResponse {
    sessionId: string,
    reply: string,
    promptTokens: number,
    completionTokens: number,
    totalTokens: number
};

export const generateSessionID = (): string => {
    return uuidv4();
};

export const ROLES = {
    OPENAI: {
        SYSTEM: "developer",
        ASSISTANT: "assistant",
        USER: "user",
    },
    DEEPSEEK: {
        SYSTEM: "system",
        ASSISTANT: "assistant",
        USER: "user",
    },
    QWEN: {
        SYSTEM: "system",
        ASSISTANT: "assistant",
        USER: "user",
    },
    SONAR: {
        SYSTEM: "system",
        ASSISTANT: "assistant",
        USER: "user",
    },
    GOOGLE: {
        SYSTEM: "system_instruction",
        ASSISTANT: "model",
        USER: "user",
    },
    ANTHROPIC: {
        SYSTEM: "system",
        ASSISTANT: "assistant",
        USER: "user",
    }
};

const getRole = (role: string, aiProvider: string): string => {
    const roles = ROLES[aiProvider.toUpperCase()];
    if (!roles) {
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }

    switch (role) {
        case 'system':
        case 'developer':
            return roles.SYSTEM;
        case 'user':
            return roles.USER;
        case 'assistant':
            return roles.ASSISTANT;
        default:
            return roles.USER; // default fallback
    }
};

export const searchContextSizes = {
    0: 'low',
    1: 'medium',
    2: 'high'
};

export const reasoningEffortLevels = {
    0: 'low',
    1: 'medium',
    2: 'high'
};

export const buildUserMessage = (sessionId: string, userMessage: string, aiProvider: string) => {
    return {
        id: -10,
        session_id: sessionId,
        role: ROLES[aiProvider].USER,
        message: userMessage,
        json_dump: "{}",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
};

export const evalPressencePenalty = (temperature: number): number => {
    if (temperature < 0 || temperature > 2 || temperature == 1) {
        return 0;
    }

    let penalty = temperature - 1;

    return Math.round((penalty * 2) * 10) / 10;
};

export const getAvailableModels = (provider?: string): ModelDefinition[] => {
    const normalizedProvider = provider?.toLowerCase();

    if (normalizedProvider && MODEL_MAP[normalizedProvider]) {
        return MODEL_MAP[normalizedProvider];
    }

    const firstProvider = Object.keys(MODEL_MAP)[0];
    return MODEL_MAP[firstProvider];
};

export const getModelConfig = (aiProvider: string, model: string) => {
    const availableModels = getAvailableModels(aiProvider);
    
    const modelConfig = availableModels.find(m => m.value === model);
    
    if (!modelConfig) {
        throw new Error(`Model ${model} configuration for provider ${aiProvider} not found.`);
    }
    
    return modelConfig;
};

export const getAIProviders = () => {
    return [
        {
            "name": "Google",
            "value": "google",
            "sdk": "google",
            "default": true
        },
        {
            "name": "Anthropic",
            "value": "anthropic",
            "sdk": "anthropic",
        },
        {
            "name": "OpenAI",
            "value": "openai",
            "sdk": "openai",
        },
        {
            "name": "DeepSeek",
            "value": "deepseek",
            "sdk": "openai",
        },
        {
            "name": "Qwen",
            "value": "qwen",
            "sdk": "openai",
        },
        {
            "name": "Sonar",
            "value": "sonar",
            "sdk": "openai",
        },
    ];
};

const formatCitations = (citations: any[]): string => {
    return citations
        .map((url, index) => {
            try {
                const domain = new URL(url).hostname.replace(/^www\./, '');
                return `[${index + 1}] ([${domain}](${url}))`;
            } catch (error) {
                // Handle invalid URL format gracefully
                return `[${index + 1}] ([invalid-url](${url}))`;
            }
        })
        .join('\n\n');
};

export const getCitations = (response: any): string => {
    const citations = response.citations || [];

    if (citations.length < 1) {
        return '';
    }

    return formatCitations(citations);
};

export const getProviderSDK = (aiProvider: string) => {
    aiProvider = aiProvider.toLowerCase();

    const providers = getAIProviders();
    const providerConfig = providers.find(p => p.value === aiProvider);

    if (!providerConfig) {
        throw new Error(`Provider configuration for '${aiProvider}' not found.`);
    }

    switch (providerConfig.sdk) {
        case 'openai':
            return OpenAIService.getOpenAI(providerConfig.value);
        case 'google':
            return GoogleAIService.getGoogleAI();
        case 'anthropic':
            return AnthropicAIService.getAnthropicAI();
        default:
            throw new Error(`SDK '${providerConfig.sdk}' not supported.`);
    }
}
