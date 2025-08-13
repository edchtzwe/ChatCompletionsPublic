import { Router } from 'express';
import {
    handleChatCompletion, textFileAsRawText, fetchSessionChat, fetchSessionIDs, getDeveloperMessage,
    deleteChats, fetchAllModels, fetchAllAIProviders, fetchSessionNames, saveSessionName,
    PdfToText, cloneSession, PromptBuilder, deleteSession
} from '@controllers/ChatCompletion';

const router: Router = Router();

router.post('/', handleChatCompletion);
router.get('/fetch-all-models', fetchAllModels);
router.get('/fetch-ai-providers', fetchAllAIProviders);
router.get('/fetch-session-names', fetchSessionNames);
router.get('/save-session-name', saveSessionName);
router.get('/clone-session', cloneSession);

router.post('/text-file-as-raw-text', textFileAsRawText);
router.post('/pdf-to-text', PdfToText);
router.post('/prompt-builder', PromptBuilder);

router.post('/fetch-session-chat', fetchSessionChat);
router.post('/fetch-session-ids', fetchSessionIDs);
router.post('/get-developer-message', getDeveloperMessage);
router.delete('/delete-chats', deleteChats);
router.delete('/delete-session', deleteSession);

export default router;
