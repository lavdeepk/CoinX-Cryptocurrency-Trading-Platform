// Redux module for Reducer state/actions.
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
  CHAT_BOT_SUCCESS,
} from "./ActionTypes";

const initialState = {
  message: null,
  messages: [],
  loading: false,
  loadingHistory: false,
  historyLoaded: false,
  error: null,
};

const chatBotReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHAT_BOT_HISTORY_REQUEST:
      return {
        ...state,
        loadingHistory: true,
        error: null,
      };
    case CHAT_BOT_HISTORY_SUCCESS:
      return {
        ...state,
        loadingHistory: false,
        historyLoaded: true,
        messages: action.payload,
        error: null,
      };
    case CHAT_BOT_HISTORY_FAILURE:
      return {
        ...state,
        loadingHistory: false,
        historyLoaded: true,
        error: action.payload,
      };
    case CHAT_BOT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        messages: [...state.messages, action.payload],
      };
    case CHAT_BOT_SUCCESS:
      return {
        ...state,
        message: action.payload,
        messages: [...state.messages, action.payload],
        loading: false,
        error: null,
      };
    case CHAT_BOT_STREAM_START:
      return {
        ...state,
        loading: true,
        message: action.payload,
        messages: [...state.messages, action.payload],
        error: null,
      };
    case CHAT_BOT_STREAM_CHUNK:
      return {
        ...state,
        messages: state.messages.map((item) =>
          item.id === action.payload.id
            ? { ...item, text: `${item.text || ""}${action.payload.chunk || ""}` }
            : item
        ),
      };
    case CHAT_BOT_STREAM_COMPLETE:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case CHAT_BOT_FAILURE:
      if (action.payload?.targetId) {
        return {
          ...state,
          loading: false,
          error: action.payload?.text || "Unable to fetch a response right now.",
          messages: state.messages.map((item) =>
            item.id === action.payload.targetId
              ? {
                  ...item,
                  text: action.payload?.text || "Unable to fetch a response right now.",
                  isError: true,
                }
              : item
          ),
        };
      }

      return {
        ...state,
        loading: false,
        error: action.payload?.text || "Unable to fetch a response right now.",
        messages: [
          ...state.messages,
          {
            ...(action.payload || {}),
            role: "model",
            text: action.payload?.text || "Unable to fetch a response right now.",
            isError: true,
          },
        ],
      };

    case CHAT_BOT_RETRY: {
      // Remove the failed message and add a fresh streaming placeholder
      const filteredMessages = action.payload.removeId
        ? state.messages.filter((m) => m.id !== action.payload.removeId)
        : state.messages;
      return {
        ...state,
        loading: true,
        error: null,
        messages: [...filteredMessages, action.payload.newMessage],
      };
    }

    case CHAT_BOT_CLEAR:
      return {
        ...state,
        message: null,
        messages: [],
        loading: false,
        loadingHistory: false,
        historyLoaded: true,
        error: null,
      };
    default:
      return state;
  }
};

export default chatBotReducer;
