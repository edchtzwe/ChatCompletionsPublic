import axios from "axios";

const SessionCommons = (() => {
    return {
        async fetchSessions(BASE_URL: string, setSessionNames: Function) {
            try {
                const res = await axios.get(`${BASE_URL}/chat/fetch-session-names`);
                setSessionNames(res.data || []);
            }
            catch (error) {
                console.error("Failed to fetch session names...", error);
            }
        }
    }
})();

export default SessionCommons;
