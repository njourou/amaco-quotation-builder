"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Send, X } from "lucide-react";
import { AmaniMessageBody } from "@/components/amani/AmaniMessageBody";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuotation } from "@/context/QuotationContext";
import { cn } from "@/lib/utils";
import { buildAmaniContext } from "@/lib/amani/context";
import { sendAmaniMessage } from "@/lib/amani/client";
import {
  AMANI_AVATAR_SRC,
  AMANI_WIDGET_TITLE,
  getAmaniChatEndpoint,
} from "@/lib/amani/config";
import type { AmaniMessage, AmaniPremium, AmaniHistoryTurn } from "@/lib/amani/types";

const AMANI_APOLOGY =
  "I'm sorry — I'm having a little trouble connecting right now. Please try again in a moment.";

const WELCOME =
  "Hi, I'm Amani — your AMACO quotation assistant. Ask about insurance classes, premiums, excesses, or how to build a quote.";

const SUGGESTIONS = [
  "Quote motor private comprehensive, value 3,000,000",
  "Explain premium breakdown",
  "How do I download a PDF quote?",
];

const THINKING_MESSAGES = [
  "Checking rates…",
  "Comparing classes…",
  "Looking up cover options…",
  "Calculating premium…",
  "Reviewing excesses & remarks…",
  "Pulling tariff details…",
  "Almost there…",
];

function AmaniThinkingIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % THINKING_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex items-end gap-2">
      <AmaniAvatar size={28} className="mb-0.5" variant="inline" />
      <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/80 bg-card px-3 py-2 text-sm text-muted-foreground">
        <span className="flex gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
        </span>
        <span key={index} className="animate-in fade-in duration-300">
          {THINKING_MESSAGES[index]}
        </span>
      </div>
    </div>
  );
}

function createMessage(
  role: AmaniMessage["role"],
  content: string,
  extras?: { premium?: AmaniPremium; toolUsed?: string },
): AmaniMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
    premium: extras?.premium,
    toolUsed: extras?.toolUsed,
  };
}

function AmaniAvatar({
  size = 64,
  className,
  showStatus = false,
  variant = "launcher",
}: {
  size?: number;
  className?: string;
  showStatus?: boolean;
  variant?: "launcher" | "header" | "inline";
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "relative block overflow-hidden rounded-full",
          variant === "launcher" &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background",
          variant === "header" && "ring-2 ring-white/70",
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={AMANI_AVATAR_SRC}
          alt="Amani, AMACO quotation assistant"
          width={size}
          height={size}
          className="size-full object-cover"
          priority
        />
      </span>
      {showStatus && (
        <span className="absolute bottom-0.5 right-0.5 flex size-3.5 items-center justify-center rounded-full bg-background">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 ring-1 ring-background" />
          </span>
        </span>
      )}
    </span>
  );
}

function MessageBubble({
  message,
  streaming,
  onStreamComplete,
  onStreamProgress,
}: {
  message: AmaniMessage;
  streaming?: boolean;
  onStreamComplete?: () => void;
  onStreamProgress?: () => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end" data-role={message.role}>
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2" data-role={message.role}>
      <AmaniAvatar size={28} className="mb-0.5" variant="inline" />
      <div className="max-w-[calc(88%-2.25rem)] rounded-2xl rounded-bl-md border border-border/80 bg-card px-3.5 py-2.5 text-foreground shadow-sm">
        <AmaniMessageBody
          content={message.content}
          premium={message.premium}
          streaming={streaming}
          onStreamComplete={onStreamComplete}
          onStreamProgress={onStreamProgress}
        />
      </div>
    </div>
  );
}

export interface AmaniChatWidgetProps {
  /** Override `NEXT_PUBLIC_AMANI_CHAT_ENDPOINT`. */
  endpoint?: string;
  className?: string;
}

function toHistoryTurns(messages: AmaniMessage[]): AmaniHistoryTurn[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

export function AmaniChatWidget({ endpoint, className }: AmaniChatWidgetProps) {
  const pathname = usePathname();
  const { quotation } = useQuotation();
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [messages, setMessages] = useState<AmaniMessage[]>(() => [
    createMessage("assistant", WELCOME),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndpoint = getAmaniChatEndpoint(endpoint);
  const isReplying = loading || streamingMessageId !== null;

  const scrollToBottom = useCallback(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, open, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setShowPrompt(false);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => setShowPrompt(true), 800);
    return () => window.clearTimeout(timer);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || streamingMessageId) return;

      const userMessage = createMessage("user", trimmed);
      let historyForApi: AmaniHistoryTurn[] = [];

      setMessages((prev) => {
        historyForApi = toHistoryTurns(
          prev.filter((m) => m.role === "user" || m.role === "assistant"),
        );
        return [...prev, userMessage];
      });
      setInput("");
      setLoading(true);

      try {
        const { reply, premium, tool_used } = await sendAmaniMessage(
          chatEndpoint,
          trimmed,
          historyForApi,
          buildAmaniContext(pathname, quotation),
        );
        const assistantMessage = createMessage("assistant", reply, {
          premium,
          toolUsed: tool_used,
        });
        setStreamingMessageId(assistantMessage.id);
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const apologyMessage = createMessage("assistant", AMANI_APOLOGY);
        setStreamingMessageId(apologyMessage.id);
        setMessages((prev) => [...prev, apologyMessage]);
      } finally {
        setLoading(false);
      }
    },
    [chatEndpoint, loading, streamingMessageId, pathname, quotation],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const handleStreamComplete = useCallback(() => {
    setStreamingMessageId(null);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  return (
    <div
      className={cn(
        "fixed right-4 z-50 flex flex-col items-end gap-3 no-print",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {open && (
        <section
          id="amani-chat-panel"
          aria-label="Amani chat"
          className="flex h-[min(520px,calc(100dvh-10.5rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl shadow-black/10"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-primary/15 bg-gradient-to-r from-primary to-[#b81862] px-4 py-4 text-primary-foreground">
            <div className="flex min-w-0 items-center gap-3">
              <AmaniAvatar size={44} variant="header" />
              <p className="truncate text-base font-semibold leading-tight">
                {AMANI_WIDGET_TITLE}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X />
            </Button>
          </header>

          <div
            ref={listRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
          >
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                streaming={
                  message.role === "assistant" &&
                  message.id === streamingMessageId &&
                  index > 0
                }
                onStreamComplete={handleStreamComplete}
                onStreamProgress={scrollToBottom}
              />
            ))}

            {loading && <AmaniThinkingIndicator />}

            {messages.length === 1 && !isReplying && (
              <div className="flex flex-wrap gap-2 pt-1 pl-9">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                    onClick={() => void send(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-border/80 bg-card/80 p-3"
          >
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Amani about quotes, classes, premiums…"
                rows={2}
                disabled={isReplying}
                className="min-h-10 max-h-28 resize-none bg-background text-sm"
                aria-label="Message to Amani"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isReplying || !input.trim()}
                aria-label="Send message"
                className="shrink-0"
              >
                <Send />
              </Button>
            </div>
          </form>
        </section>
      )}

      <div className="relative flex flex-col items-end gap-2">
        {!open && showPrompt && (
          <div className="animate-in fade-in slide-in-from-bottom-2 max-w-[220px] rounded-2xl rounded-br-sm border border-border/80 bg-card px-3.5 py-2.5 text-sm leading-snug text-foreground shadow-lg duration-300">
            <p className="font-medium text-primary">Hi there!</p>
            <p className="text-muted-foreground">Need help with a quote? I&apos;m ready.</p>
          </div>
        )}

        <button
          type="button"
          aria-expanded={open}
          aria-controls="amani-chat-panel"
          aria-label={open ? "Close chat with Amani" : "Open chat with Amani"}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "group relative rounded-full transition-transform hover:scale-[1.03] active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40",
            open && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
          )}
        >
          <AmaniAvatar size={72} showStatus={!open} variant="launcher" />
          {open && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
              <X className="size-7 text-white" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
