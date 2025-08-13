import {db} from "@services/MainDatabase";
import { logError, logInfo } from "@services/Logger";
import { generateSessionID, ROLES } from "@services/ChatCompletion";

export interface payload {
    sessionId: string,
    role: string,
    message: string,
    jsonDump: string
};

export interface chat {
    id: number,
    session_id: string,
    role: string,
    message: string,
    json_dump: string,
    created_at: string,
    updated_at: string
};

export const ChatsModel = (() => {
    return {
        insert(payload: payload) {
            try {
                const stmt = db.prepare(
                    "INSERT INTO chats (session_id, role, message, json_dump) VALUES (?, ?, ?, ?)"
                );

                stmt.run(
                    payload.sessionId,
                    payload.role,
                    payload.message,
                    JSON.stringify(payload.jsonDump)
                );
            }
            catch (error) {
                console.error("Failed to insert into chat with error");
                console.error(error);
            }
        },
        findBy(sessionId: string, role?: string, limit?: number): chat[] {
            try {
                let query = "SELECT * FROM chats WHERE session_id = ?";
                const params: any[] = [sessionId];

                if (role) {
                    query += " AND role = ?";
                    params.push(role);
                }

                if (limit) {
                    query += " ORDER BY created_at DESC"
                    query += " LIMIT ?";
                    query = `SELECT * FROM (${query}) AS subquery ORDER BY created_at ASC`
                    params.push(limit);
                }

                const stmt = db.prepare(query);
                const rows: chat[] = stmt.all(...params) as chat[];

                return rows;
            }
            catch (error) {
                console.error("Failed to retrieve chats with error");
                console.error(error);
                return [];
            }
        },
        /**
         * Special rule. There should only be one system message per session.
         */
        handleSystemMessage(payload: payload, aiProvider: string): boolean {
            try {
                let devMessage = ChatsModel.findBy(payload.sessionId, ROLES[aiProvider].SYSTEM);

                if (devMessage.length === 0) {
                    ChatsModel.addToHistory([payload]);

                    return true;
                }
            }
            catch (error) {
                console.error("Failed to handle system message with error");
                console.error(error);
            }

            return false;
        },
        update(payload: payload, aiProvider: string) {
            try {
                if (ChatsModel.handleSystemMessage(payload, aiProvider)) {
                    return;
                }

                const stmt = db.prepare(
                    "UPDATE chats SET message = ?, json_dump = ? WHERE session_id = ? AND role = ?"
                );

                stmt.run(
                    payload.message,
                    JSON.stringify(payload.jsonDump),
                    payload.sessionId,
                    payload.role
                );
            }
            catch (error) {
                console.error("Failed to update chat with error");
                console.error(error);
            }
        },
        addToHistory(payload: payload[]) {
            try {
                for (let p of payload) {
                    ChatsModel.insert(p);
                }
            }
            catch (error) {
                console.error("Failed to add to chat history with error");
                console.error(error);
            }
        },
        fetchLastNChats(sessionId: string, aiProvider: string, chatHistoryDepth: number = 0): chat[] {
            try {
                logInfo(`The chatHistoryDepth is... ${chatHistoryDepth}`);

                if (chatHistoryDepth < 1) {
                    return ChatsModel.findBy(sessionId);
                }

                const stmt = db.prepare(
                    "SELECT * FROM ( SELECT * FROM chats WHERE session_id = ? AND role != ? ORDER BY id DESC LIMIT ? ) ORDER BY id ASC"
                );

                const rows: chat[] = stmt.all(sessionId, process.env.SYSTEM_ROLE, chatHistoryDepth) as chat[];

                return rows;
            }
            catch (error) {
                console.error("Failed to fetch last N chats with error");
                console.error(error);
                return [];
            }
        },
        /**
         * Returns stored system message, or the default system message in .env
         */
        fetchDevMessageForSession(sessionId: string, aiProvider: string): chat {
            const devMessage = ChatsModel.findBy(sessionId, process.env.SYSTEM_ROLE);
            let boilerplate = {
                id: -1,
                session_id: sessionId,
                role: ROLES[aiProvider].SYSTEM,
                message: process.env.FIXED_SYSTEM_MESSAGE,
                json_dump: "{}",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (!devMessage.length) {
                return boilerplate;
            }

            let message = devMessage[0].message;
            if (process.env.FIXED_SYSTEM_MESSAGE.length) {
                message = message + " " + process.env.FIXED_SYSTEM_MESSAGE;
            }

            boilerplate.message = message;

            return boilerplate;
        },
        cleanForSummary(sessionId: string): void {
            try {
                const stmt = db.prepare(
                    "DELETE FROM chats WHERE session_id = ? AND role != ?"
                );

                stmt.run(sessionId, process.env.SYSTEM_ROLE);
            }
            catch(error) {
                logError(`Failed to clean chat for summary with error: ${error}`);
            }
        },
        fetchSessionIDs(): string[] {
            try {
                const stmt = db.prepare(
                    "SELECT DISTINCT session_id FROM chats ORDER BY created_at ASC"
                );

                const rows = stmt.all();

                return rows.map((row: any) => row.session_id);
            }
            catch (error) {
                console.error("Failed to fetch session IDs with error");
                console.error(error);
                return [];
            }
        },
        deleteChats(chatIds: string[]): void {
            try {
                const placeholders = chatIds.map(() => '?').join(',');
                const stmt = db.prepare(
                    "DELETE FROM chats WHERE id IN (" + placeholders + ")"
                );
                logInfo(`Deleting chats with IDs: ${chatIds}`);

                stmt.run(chatIds);
            }
            catch (error) {
                console.error("Failed to delete chats with error");
                console.error(error);
            }
        },
    }
}
)();
