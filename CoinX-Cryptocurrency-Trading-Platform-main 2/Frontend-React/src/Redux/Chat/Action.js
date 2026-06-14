// Redux module for Action state/actions.
import api, { API_BASE_URL } from "@/Api/api";
import {
  CHAT_BOT_CLEAR,
  CHAT_BOT_FAILURE,
  CHAT_BOT_HISTORY_FAILURE,
  CHAT_BOT_HISTORY_REQUEST,
  CHAT_BOT_HISTORY_SUCCESS,
  CHAT_BOT_REQUEST,
  CHAT_BOT_RETRY,
  CHAT_BOT_STREAM_CHUNK,
  CHAT_BOT_STREAM_COMPLETE,
  CHAT_BOT_STREAM_START,
} from "./ActionTypes";

const CHATBOT_REQUEST_TIMEOUT_MS = 45000;
const CHATBOT_HISTORY_LIMIT = 80;
const CHATBOT_STREAM_FLUSH_MS = 40;

const normalizeRole = (role) => (role?.toLowerCase?.() === "user" ? "user" : "model");

/**
 * Maps a raw history item from the backend to the frontend message shape.
 * The backend ChatMessageResponse DTO returns { id, role, text, createdAt }.
 */
const toMessage = (item, fallbackIndex = 0) => ({
  id: item?.id || `history-${fallbackIndex}`,
  role: normalizeRole(item?.role),
  text: item?.text || "",
  createdAt: item?.createdAt || new Date().toISOString(),
});

const parseErrorPayload = (payload) => {
  if (!payload) return null;

  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (!trimmed) return null;
    try {
      return parseErrorPayload(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }

  if (typeof payload === "object") {
    return (
      payload?.message ||
      payload?.error?.message ||
      payload?.error ||
      payload?.statusText ||
      payload?.status ||
      null
    );
  }

  return null;
};

const normalizeErrorMessage = (message, fallback) => {
  const safeMessage = message?.trim();
  if (!safeMessage) return fallback;
  if (/coin not found/i.test(safeMessage)) {
    return "I couldn't find that coin. Try symbols like BTC, ETH, or SOL.";
  }
  if (/high demand|unavailable|status.?503|service unavailable/i.test(safeMessage)) {
    return "The AI model is busy right now. Please retry in a few seconds.";
  }
  return safeMessage.length > 220 ? `${safeMessage.slice(0, 220)}...` : safeMessage;
};

const resolveErrorMessage = (payload, fallback) =>
  normalizeErrorMessage(parseErrorPayload(payload), fallback);

export const loadChatHistory = ({ jwt, limit = CHATBOT_HISTORY_LIMIT } = {}) => async (dispatch) => {
  if (!jwt) return;
  dispatch({ type: CHAT_BOT_HISTORY_REQUEST });

  try {
    const { data } = await api.get(`/api/chat/history?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      timeout: CHATBOT_REQUEST_TIMEOUT_MS,
    });

    const messages = Array.isArray(data) ? data.map((item, index) => toMessage(item, index)) : [];
    dispatch({
      type: CHAT_BOT_HISTORY_SUCCESS,
      payload: messages,
    });
  } catch (error) {
    dispatch({
      type: CHAT_BOT_HISTORY_FAILURE,
      payload: error?.response?.data?.message || error.message || "Unable to load chat history right now.",
    });
  }
};

const streamRequest = async (dispatch, cleanPrompt, jwt, modelMessageId) => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), CHATBOT_REQUEST_TIMEOUT_MS);
  let pendingChunk = "";
  let flushTimer = null;

  const flushPendingChunk = () => {
    if (!pendingChunk) return;
    dispatch({
      type: CHAT_BOT_STREAM_CHUNK,
      payload: { id: modelMessageId, chunk: pendingChunk },
    });
    pendingChunk = "";
  };

  const clearFlushTimer = () => {
    if (!flushTimer) return;
    clearTimeout(flushTimer);
    flushTimer = null;
  };

  const queueChunk = (chunk) => {
    if (!chunk) return;
    pendingChunk += chunk;
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushPendingChunk();
      flushTimer = null;
    }, CHATBOT_STREAM_FLUSH_MS);
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/bot/coin/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(resolveErrorMessage(errorText, "Unable to fetch a response right now."));
    }

    if (!response.body) {
      throw new Error("Streaming response is unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      queueChunk(chunk);
    }

    const remaining = decoder.decode();
    queueChunk(remaining);
    clearFlushTimer();
    flushPendingChunk();

    dispatch({
      type: CHAT_BOT_STREAM_COMPLETE,
      payload: { id: modelMessageId },
    });
  } catch (error) {
    const timeoutError = error?.code === "ECONNABORTED";
    const abortTimeout = error?.name === "AbortError";
    const fallbackError = timeoutError
      ? "The chatbot is taking too long. Please try a shorter question or retry."
      : abortTimeout
        ? "The chatbot request timed out. Please retry."
        : resolveErrorMessage(
            error?.response?.data || error?.message,
            "Unable to fetch a response right now."
          );

    dispatch({
      type: CHAT_BOT_FAILURE,
      payload: {
        id: `error-${Date.now()}`,
        text: fallbackError,
        role: "model",
        createdAt: new Date().toISOString(),
        targetId: modelMessageId,
        isError: true,
      },
    });
  } finally {
    clearFlushTimer();
    clearTimeout(timeoutId);
  }
};

export const sendMessage = ({ prompt, jwt }) => async (dispatch) => {
  const cleanPrompt = prompt?.trim();
  if (!cleanPrompt || !jwt) return;
  const now = new Date().toISOString();
  const modelMessageId = `model-${Date.now()}`;

  dispatch({
    type: CHAT_BOT_REQUEST,
    payload: {
      id: `user-${Date.now()}`,
      text: cleanPrompt,
      role: "user",
      createdAt: now,
    },
  });

  dispatch({
    type: CHAT_BOT_STREAM_START,
    payload: {
      id: modelMessageId,
      role: "model",
      text: "",
      createdAt: new Date().toISOString(),
    },
  });

  await streamRequest(dispatch, cleanPrompt, jwt, modelMessageId);
};

/**
 * Retry the last failed AI message. Removes the failed model message,
 * then re-sends the preceding user message.
 */
export const retryLastMessage = ({ jwt }) => async (dispatch, getState) => {
  const { chatBot } = getState();
  const messages = chatBot.messages;

  // Find the last user message to retry
  let lastUserPrompt = null;
  let failedModelMessageId = null;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "model" && messages[i].isError) {
      failedModelMessageId = messages[i].id;
    }
    if (messages[i].role === "user") {
      lastUserPrompt = messages[i].text;
      break;
    }
  }

  if (!lastUserPrompt || !jwt) return;

  // Remove the failed model message and replace with a fresh streaming placeholder
  const modelMessageId = `model-${Date.now()}`;

  dispatch({
    type: CHAT_BOT_RETRY,
    payload: {
      removeId: failedModelMessageId,
      newMessage: {
        id: modelMessageId,
        role: "model",
        text: "",
        createdAt: new Date().toISOString(),
      },
    },
  });

  await streamRequest(dispatch, lastUserPrompt, jwt, modelMessageId);
};

export const clearChatMessages = ({ jwt } = {}) => async (dispatch) => {
  dispatch({ type: CHAT_BOT_CLEAR });
  if (!jwt) return;

  try {
    await api.delete("/api/chat/history", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      timeout: CHATBOT_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    // Keep local clear behavior even if server-side clear fails.
  }
};
