import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowDown,
  Bot,
  Check,
  Copy,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  clearChatMessages,
  loadChatHistory,
  retryLastMessage,
  sendMessage,
} from "@/Redux/Chat/Action";
import MarkdownMessage from "./MarkdownMessage";

// ─── Constants ─────────────────────────────────────────────────────────────────
const SCROLL_LOCK_THRESHOLD = 120;
const MAX_PROMPT_LENGTH = 2000;
const WARN_PROMPT_LENGTH = 1800;

const STARTER_PROMPTS = [
  "BTC price + trend in 3 bullets",
  "ETH vs SOL: which to hold now?",
  "Top 3 coins to watch this week",
  "What signals say before buying crypto?",
  "Explain market cap vs trading volume",
];

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Staggered wave typing animation (3 dots with a cascading bounce). */
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="h-2 w-2 rounded-full bg-slate-400"
        style={{
          animation: `chatbot-bounce 1.1s ease-in-out ${delay}ms infinite`,
        }}
      />
    ))}
  </div>
);

/** Small pill shown on the currently-streaming message. */
const StreamingBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full border border-blue-700/50 bg-blue-950/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-blue-300">
    <span
      className="h-1.5 w-1.5 rounded-full bg-blue-400"
      style={{ animation: "chatbot-pulse 1s ease-in-out infinite" }}
    />
    Streaming
  </span>
);

// ─── Main Widget ───────────────────────────────────────────────────────────────
const ChatBotWidget = () => {
  const dispatch = useDispatch();
  const { chatBot, auth } = useSelector((store) => store);
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const messagesViewportRef = useRef(null);
  const inputRef = useRef(null);
  const isPinnedToBottomRef = useRef(true);
  const jwt = auth.jwt || localStorage.getItem("jwt");

  const hasMessages = chatBot.messages.length > 0;
  const lastMessage = chatBot.messages.at(-1);
  const lastMessageText = lastMessage?.text || "";
  const charCount = prompt.length;
  const isNearLimit = charCount >= WARN_PROMPT_LENGTH;
  const isOverLimit = charCount > MAX_PROMPT_LENGTH;

  // The last model message that is currently streaming (empty text, no error)
  const streamingMessageId = chatBot.loading
    ? chatBot.messages.findLast?.((m) => m.role === "model" && !m.isError)?.id
    : null;

  const panelStatus = useMemo(() => {
    if (chatBot.loadingHistory) return "Syncing";
    if (chatBot.loading) return "Thinking";
    return "Online";
  }, [chatBot.loading, chatBot.loadingHistory]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatMessageTime = (isoTime) => {
    const date = isoTime ? new Date(isoTime) : new Date();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const resizeComposer = () => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 128)}px`;
  };

  const scrollToLatest = (behavior = "auto") => {
    const container = messagesViewportRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const evaluateScrollState = () => {
    const container = messagesViewportRef.current;
    if (!container) return;
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isPinned = distanceToBottom < SCROLL_LOCK_THRESHOLD;
    isPinnedToBottomRef.current = isPinned;
    setShowJumpToLatest(!isPinned);
  };

  const submitPrompt = (value) => {
    const cleanPrompt = value?.trim();
    if (!cleanPrompt || chatBot.loading || isOverLimit) return;
    isPinnedToBottomRef.current = true;
    setShowJumpToLatest(false);
    dispatch(sendMessage({ prompt: cleanPrompt, jwt }));
    setPrompt("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitPrompt(prompt);
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(prompt);
    }
  };

  const copyMessage = async (id, text) => {
    if (!text || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 1400);
    } catch {
      // Ignore clipboard failures.
    }
  };

  const handleRetry = () => {
    dispatch(retryLastMessage({ jwt }));
  };

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return undefined;
    const id = setTimeout(() => {
      inputRef.current?.focus();
      resizeComposer();
    }, 160);
    return () => clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !jwt || chatBot.historyLoaded || chatBot.loadingHistory) return;
    dispatch(loadChatHistory({ jwt }));
  }, [dispatch, isOpen, jwt, chatBot.historyLoaded, chatBot.loadingHistory]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    resizeComposer();
  }, [prompt, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const shouldAutoScroll =
      isPinnedToBottomRef.current || lastMessage?.role === "user";
    if (!shouldAutoScroll) return;
    scrollToLatest(chatBot.loading ? "auto" : "smooth");
  }, [isOpen, chatBot.loading, lastMessage?.id, lastMessage?.role, lastMessageText]);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      evaluateScrollState();
      if (!hasMessages) isPinnedToBottomRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, hasMessages, lastMessage?.id, lastMessageText]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Keyframe animations injected inline ─────────────────────────── */}
      <style>{`
        @keyframes chatbot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatbot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>

      <div className="fixed bottom-5 right-5 z-50 max-sm:bottom-2 max-sm:right-2">
        {/* ── FAB trigger ───────────────────────────────────────────────── */}
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="group h-12 rounded-full border border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 px-4 text-slate-100 shadow-xl transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:shadow-blue-900/30"
            aria-label="Open CoinX AI chatbot"
            id="chatbot-fab-btn"
          >
            <Sparkles className="mr-2 h-4 w-4 text-blue-400 transition-transform duration-200 group-hover:rotate-12" />
            Ask AI
          </Button>
        ) : (
          /* ── Chat panel ──────────────────────────────────────────────── */
          <section
            className="relative flex h-[680px] w-[430px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl max-sm:h-[92vh] max-sm:w-[calc(100vw-0.7rem)]"
            style={{ animation: "chatbot-slide-up 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
            aria-label="CoinX AI Chat"
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="shrink-0 border-b border-slate-700/80 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-700/40 bg-gradient-to-br from-blue-900/60 to-slate-800 text-slate-200 shadow-inner">
                    <Bot className="h-4 w-4 text-blue-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">CoinX AI</p>
                    <div className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                          chatBot.loading
                            ? "bg-amber-300"
                            : chatBot.loadingHistory
                              ? "bg-blue-400"
                              : "bg-emerald-400"
                        }`}
                      />
                      {panelStatus}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-slate-700 bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                    onClick={() => dispatch(clearChatMessages({ jwt }))}
                    aria-label="Clear chat history"
                    id="chatbot-clear-btn"
                    title="Clear conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    className="h-8 rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 text-xs text-slate-300 hover:bg-slate-700"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    id="chatbot-close-btn"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Close
                  </Button>
                </div>
              </div>
            </header>

            {/* ── Messages viewport ────────────────────────────────────── */}
            <main
              ref={messagesViewportRef}
              onScroll={evaluateScrollState}
              className="flex-1 space-y-4 overflow-y-auto bg-slate-950 px-4 py-4 scroll-smooth"
            >
              {/* Welcome / starter prompts */}
              {!hasMessages && !chatBot.loadingHistory && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/60 p-4">
                    <p className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                      How can I help you today?
                    </p>
                    <p className="text-xs text-slate-500">
                      Ask about prices, trends, risk, portfolio strategy, or any crypto topic.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STARTER_PROMPTS.map((item) => (
                      <Button
                        key={item}
                        type="button"
                        onClick={() => submitPrompt(item)}
                        disabled={chatBot.loading}
                        variant="outline"
                        size="sm"
                        className="h-auto rounded-lg border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[11px] leading-snug text-slate-300 hover:border-blue-700/50 hover:bg-slate-700 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        id={`chatbot-starter-${item.slice(0, 10).replace(/\s/g, "-")}`}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* History loading skeleton */}
              {chatBot.loadingHistory && (
                <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <TypingIndicator />
                </div>
              )}

              {/* Messages */}
              {chatBot.messages.map((message, index) => {
                const isUser = message.role === "user";
                const isStreaming = message.id === streamingMessageId;
                const isEmpty = !message.text && !isUser;

                return (
                  <article
                    key={message.id || `${message.role}-${message.createdAt || index}`}
                    className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bot avatar */}
                    {!isUser && (
                      <span className="mt-6 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-800/40 bg-slate-800 text-slate-200">
                        <Bot className="h-3.5 w-3.5 text-blue-300" />
                      </span>
                    )}

                    <div
                      className={`flex max-w-[88%] flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Role label */}
                      <div
                        className={`mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] ${
                          isUser ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {isUser ? <User className="h-3 w-3" /> : null}
                        <span>{isUser ? "You" : "AI"}</span>
                        {isStreaming && <StreamingBadge />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`w-full whitespace-pre-wrap rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          isUser
                            ? "border border-slate-600 bg-slate-100 text-slate-900"
                            : message.isError
                              ? "border border-red-800/60 bg-red-950/40 text-red-200"
                              : "border border-slate-700/70 bg-slate-900 text-slate-100"
                        }`}
                      >
                        {isUser ? (
                          message.text
                        ) : isEmpty && isStreaming ? (
                          <TypingIndicator />
                        ) : message.isError ? (
                          <span className="flex items-start gap-1.5">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                            {message.text}
                          </span>
                        ) : (
                          <MarkdownMessage text={message.text} />
                        )}
                      </div>

                      {/* Timestamp + actions */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-slate-600">
                          {formatMessageTime(message.createdAt)}
                        </span>

                        {/* Copy button for non-error AI messages */}
                        {!isUser && !message.isError && message.text && (
                          <Button
                            type="button"
                            onClick={() => copyMessage(message.id, message.text)}
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 px-1.5 text-[10px] text-slate-500 hover:text-slate-300"
                            id={`chatbot-copy-${message.id}`}
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        )}

                        {/* Retry button on error messages */}
                        {!isUser && message.isError && !chatBot.loading && (
                          <Button
                            type="button"
                            onClick={handleRetry}
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 px-1.5 text-[10px] text-red-400 hover:text-red-200"
                            id="chatbot-retry-btn"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* User avatar */}
                    {isUser && (
                      <span className="mt-6 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                        <User className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </article>
                );
              })}

              {/* Global error (non-message-specific) */}
              {chatBot.error && !chatBot.loading && !chatBot.messages.some((m) => m.isError) && (
                <p className="rounded-lg border border-red-700 bg-red-950 px-3 py-2 text-xs text-red-200">
                  {chatBot.error}
                </p>
              )}
            </main>

            {/* ── Jump to latest button ─────────────────────────────────── */}
            {showJumpToLatest && (
              <Button
                type="button"
                onClick={() => {
                  isPinnedToBottomRef.current = true;
                  setShowJumpToLatest(false);
                  scrollToLatest("smooth");
                }}
                variant="outline"
                size="sm"
                className="absolute bottom-[88px] right-4 gap-1 rounded-full border-slate-700 bg-slate-800 px-3 text-xs text-slate-200 shadow-lg hover:bg-slate-700"
                id="chatbot-jump-btn"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                Latest
              </Button>
            )}

            {/* ── Composer ─────────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-slate-700/80 bg-slate-900 px-3 pb-3 pt-2.5"
            >
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <Textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={(event) => {
                      setPrompt(event.target.value);
                    }}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Ask about any coin or market topic… (Enter to send)"
                    rows={1}
                    maxLength={MAX_PROMPT_LENGTH + 50} /* soft cap with warning */
                    className={`max-h-32 min-h-10 resize-none rounded-lg pr-16 transition-colors focus-visible:ring-1 ${
                      isOverLimit
                        ? "border-red-600 focus-visible:ring-red-500"
                        : isNearLimit
                          ? "border-amber-600 focus-visible:ring-amber-500"
                          : "border-slate-700 focus-visible:ring-slate-500"
                    }`}
                    id="chatbot-input"
                    aria-label="Chat message input"
                  />
                  {/* Character counter — only visible near limit */}
                  {isNearLimit && (
                    <span
                      className={`pointer-events-none absolute bottom-2 right-2 text-[9px] tabular-nums ${
                        isOverLimit ? "text-red-400" : "text-amber-500"
                      }`}
                    >
                      {charCount}/{MAX_PROMPT_LENGTH}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-10 w-10 shrink-0 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 transition-all hover:border-blue-700/60 hover:bg-slate-700 disabled:opacity-40"
                  size="icon"
                  disabled={chatBot.loading || !prompt.trim() || isOverLimit}
                  aria-label="Send message"
                  id="chatbot-send-btn"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>
    </>
  );
};

export default ChatBotWidget;
