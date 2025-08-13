import { Request, Response } from 'express';
import OpenAI from 'openai';
import { ChatCompletion } from 'openai/resources';
import { ChatCompletionChunk } from 'openai/resources/chat/completions';
import { logError, logInfo } from "@services/Logger";
import { ChatsModel } from "@models/Chats";
import upload from "@services/FileUpload";
import { generateSessionID, getAvailableModels, getAIProviders, ROLES, chatResponse } from "@services/ChatCompletion";
import { NamedSessionsModel } from '@models/SessionNames';
import { PDFDocument } from "pdf-lib";
import pdfParse from "pdf-parse";
import archiver from "archiver";
import { ChatParams, StartChat } from '@services/AIClient';
import OpenAIService from '@services/OpenAI';
import GoogleAIService from '@services/Google';
import { GenerateContentResponse } from '@google/genai';
import AnthropicAIService from '@services/Anthropic';

const archiver = require('archiver');

const LOG_TAG = '#[CHAT-CONTROLLER] : ';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface chatContext {
    role: string,
    content: string
};

export interface chatRequest {
    message: string,
    sessionId: string,
    devMessage?: string
};

interface QwenDelta extends ChatCompletionChunk.Choice.Delta {
    reasoning_content?: string;
}

const initiateChatCompletion = async (params: ChatParams) => {
    return StartChat(params);
};

const resolveChatCompletionParams = (req: Request) => {
    const {
        message,
        sessionId,
        devMessage,
        selectedModel,
        aiprovider,
        temperature,
        searchContextSize,
        reasoningEffort,
        chatHistoryDepth
    } = req.body;

    const resolvedParams = {
        message: message,
        sessionId: sessionId && sessionId.length > 0 ? sessionId : generateSessionID(),
        devMessage: devMessage && devMessage.length > 0 ? devMessage : undefined,
        selectedModel: selectedModel && selectedModel.length > 0 ? selectedModel : undefined,
        aiProvider: aiprovider && aiprovider.length > 0 ? aiprovider.toUpperCase() : 'OPENAI',
        temperature: !isNaN(temperature) && temperature >= 0 ? parseFloat(temperature) : 1,
        searchContextSize: [0, 1, 2].includes(Number(searchContextSize)) ? Number(searchContextSize) : 1,
        reasoningEffort: [0, 1, 2].includes(Number(reasoningEffort)) ? Number(reasoningEffort) : 1,
        chatHistoryDepth: !isNaN(chatHistoryDepth) && Number(chatHistoryDepth) > 0 ? Number(chatHistoryDepth) : parseInt(process.env.MAX_DEPTH),
    };

    return resolvedParams;
};

export const handleChatCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            message,
            sessionId,
            devMessage,
            selectedModel,
            aiProvider,
            temperature,
            searchContextSize,
            reasoningEffort,
            chatHistoryDepth
        } = resolveChatCompletionParams(req);

        if (!message) {
            if (devMessage != undefined) {
                ChatsModel.update({
                    sessionId: sessionId,
                    role: ROLES[aiProvider].SYSTEM,
                    message: devMessage,
                    jsonDump: "Developer message"
                }, aiProvider);

                const response: chatResponse = {
                    sessionId: sessionId,
                    reply: "Developer message saved",
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0
                };

                res.json(response);
                return;
            }

            res.status(400).json({ error: 'Message parameter is required' });
            return;
        }

        logInfo(`The active AI Provider is... ${aiProvider}`);

        const chatParams: ChatParams = {
            sessionId: sessionId,
            message: message,
            devMessage: devMessage,
            chatHistoryDepth: chatHistoryDepth,
            model: selectedModel,
            temperature: temperature,
            aiProvider: aiProvider,
            searchContextSize: searchContextSize,
            reasoningEffort: reasoningEffort
        };

        const completion = await initiateChatCompletion(chatParams);

        switch (aiProvider) {
            case 'OPENAI':
            case 'QWEN':
            case 'DEEPSEEK':
            case 'SONAR':
                const openAICompletion = completion as ChatCompletion;
                const response = OpenAIService.handleAIResponse(openAICompletion, sessionId, message, devMessage, selectedModel);
                res.json(response);
                break;
            case 'GOOGLE':
                const googleAICompletion = completion as AsyncGenerator<GenerateContentResponse>;
                const googleResponse = await GoogleAIService.handleAIResponse(sessionId, googleAICompletion, message, devMessage, aiProvider);
                res.json(googleResponse);
                break;
            case 'ANTHROPIC':
                const anthropicAICompletion = completion;
                console.log("Anthropic AI Completion", anthropicAICompletion);
                const anthropicResponse = await AnthropicAIService.handleAIResponse(sessionId, anthropicAICompletion, message, devMessage);
                res.json(anthropicResponse);
                break;
            default:
                logError(`#[HANDLE-CHAT] : CHAT-CTRL-ERROR : Unsupported AI provider: ${aiProvider}`);
                throw new Error(`Unsupported AI provider: ${aiProvider}`);
        }
    } catch (error) {
        logError(`The AI Provider returned errors ... ${error}`);
        res.status(500).json({ error: `Error response from the AI Provider ... ${error.message}` });
    }
};

export const fetchSessionIDs = async (req: Request, res: Response): Promise<void> => {
    try {
        const sessionIds = ChatsModel.fetchSessionIDs();

        res.json(sessionIds);
    } catch (error) {
        logError(`OpenAI Error: ${error}`);
        res.status(500).json({ error: 'Failed to fetch session IDs' });
    }
};


export const deleteChats = async (req: Request, res: Response): Promise<void> => {
    try {
        const chatIds = req.body.chatIds;

        if (!chatIds) {
            res.status(400).json({ error: 'Chat IDs parameter is required' });
            return;
        }

        logInfo(`Deleting chats with IDs: ${chatIds}`);
        ChatsModel.deleteChats(chatIds);

        res.json({ message: 'Chats deleted' });
    } catch (error) {
        logError(`OpenAI Error: ${error}`);
        res.status(500).json({ error: 'Failed to delete chats' });
    }
};

export const fetchAllModels = async (req: Request, res: Response): Promise<void> => {
    try {
        const provider = typeof req.query.aiprovider === 'string' ? req.query.aiprovider : undefined;

        const models = getAvailableModels(provider);

        res.json({ models });
    } catch (error) {
        logError(`Failed to fetch models for provider: ${req.query.aiprovider || 'openai'} - Error: ${error}`);
        res.status(500).json({ error: 'Failed to fetch all models' });
    }
};

export const fetchAllAIProviders = async (req: Request, res: Response): Promise<void> => {
    try {
        const providers = getAIProviders();

        res.json({ providers: providers });
    }
    catch (error) {
        logError(`Failed to fetch AI providers... Error: ${error}`);
        res.status(500).json({ error: 'Failed to fetch AI providers' });
    }
};


export const saveSessionName = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId, name } = req.query as { sessionId: string, name: string };

        if (!sessionId || typeof sessionId !== 'string') {
            res.status(400).json({ error: 'sessionId is required and must be a string.' });
            return;
        }

        if (!name || typeof name !== 'string') {
            res.status(400).json({ error: 'name is required and must be a string.' });
            return;
        }

        NamedSessionsModel.saveSessionName(sessionId, name);

        const sessionNames = NamedSessionsModel.fetchAllSessionNames();

        res.json(sessionNames);
    } catch (error) {
        logError(`Fetch session names error : ${error}`);
        res.status(500).json({ error: 'Failed to fetch session names...' });
    }
};

export const cloneSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.query as { sessionId: string };

        if (!sessionId || typeof sessionId !== 'string') {
            res.status(400).json({ error: 'sessionId is required and must be a string.' });
            return;
        }

        const newSessionId = ChatsModel.cloneSession(sessionId);
        if (!newSessionId.length) {
            throw new Error(`Failed to clone the session with ID: ${sessionId}...`);
        }

        res.json({ "sessionId": newSessionId });
    } catch (error) {
        logError(`Clone session error : ${error}`);
        res.status(500).json({ error: 'Failed to clone the session...' });
    }
};

export const PromptBuilder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId, content } = req.body;

        if (!content) {
            res.status(400).json({ error: "Content is required." });
            return;
        }

        const finalSessionId: string = sessionId || generateSessionID();

        ChatsModel.addToHistory([
            {
                sessionId: finalSessionId,
                role: process.env.USER_ROLE,
                message: content,
                jsonDump: `Prompt builder...`
            }
        ]);

        res.json({ sessionId: finalSessionId, message: content });
    } catch (error) {
        logError(`#[PROMPT-BUILDER] : ERROR : ${error}`);
        res.status(500).json({ error: "Failed to store text" });
    }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            res.status(400).json({ error: "sessionId is required." });
            return;
        }

        const deleteSuccess = NamedSessionsModel.DeleteSession(sessionId);

        if (!deleteSuccess) {
            logError(`${LOG_TAG}Failed to delete session ${sessionId}`);
            res.status(500).json({ error: "Failed to delete session." });
            return;
        }

        res.json({ sessionId, message: "Session and associated chats deleted successfully." });
    } catch (error) {
        console.error(`#[DELETE-SESSION] : ERROR : ${error}`);
        res.status(500).json({ error: "Failed to delete session." });
    }
};
