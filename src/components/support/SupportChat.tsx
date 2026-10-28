"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, MessageCircle, RotateCcw, Send, ShieldAlert, Sparkles, UserRound, X } from "lucide-react";
import { COMPANY } from "@/lib/site";

type ChatRole = "user" | "assistant";

interface Message {
  id: string;
  role: ChatRole;
  content: string;
}

const supportEmail = "tradingflow.demo@gmail.com";

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm Flow — Trading Flow Capital's AI support assistant. I can explain plans, daily profit, deposits, withdrawals and account security. I cannot access accounts or approve transactions. Please never share passwords or wallet keys.",
};

const suggestions = [
  "How is daily profit calculated?",
  "What are the plan minimums?",
  "How do withdrawals work?",
  "Is Trading Flow regulated?",
];

const appNavPaths = ["/dashboard", "/plans", "/transactions", "/referrals", "/admin"];

export default function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  const hasMobileTabBar = appNavPaths.includes(pathname);
  const positionClass = hasMobileTabBar
    ? "bottom-[calc(6rem_+_env(safe-area-inset-bottom))] lg:bottom-6"
    : "bottom-4 sm:bottom-6";

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || loading) return;

    counterRef.current += 1;
    const userMessage: Message = {
      id: `user-${Date.now()}-${counterRef.current}`,
      role: "user",
      content: text.slice(0, 1500),
    };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation
            .filter((message) => message.id !== "welcome")
            .slice(-8)
            .map(({ role, content }) => ({ role, content })),
          page: pathname,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "AI support is temporarily unavailable."
        );
      }

      counterRef.current += 1;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}-${counterRef.current}`,
          role: "assistant",
          content:
            typeof data.reply === "string"
              ? data.reply
              : `I could not answer that. Please email ${supportEmail}.`,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "AI support is temporarily unavailable.";
      const suffix = message.includes(supportEmail) ? "" : ` You can also email ${supportEmail}.`;
      counterRef.current += 1;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}-${counterRef.current}`,
          role: "assistant",
          content: `${message}${suffix}`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const resetChat = () => {
    setMessages([welcomeMessage]);
    setInput("");
    inputRef.current?.focus();
  };

  const hasUserMessage = messages.some((message) => message.role === "user");

  return (
    <div className={`fixed right-3 sm:right-6 z-40 flex flex-col items-end gap-3 ${positionClass}`}>
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label="Trading Flow AI support"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="w-[calc(100vw-1.5rem)] max-w-[390px] h-[min(70vh,620px)] max-h-[calc(100dvh-15rem)] rounded-2xl border border-white/10 bg-[#0C1320] shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
        >
          <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#0F172A]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Image
                src="/brand/app-icon.png"
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate">{COMPANY.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
                aria-label="Start a new chat"
                title="New chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close AI support"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            aria-live="polite"
          >
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-100/70 leading-relaxed">
                Don&apos;t share passwords, one-time codes or wallet keys. AI can make mistakes;
                verify important account details with human support.
              </p>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </span>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                    message.role === "user"
                      ? "bg-emerald-500 text-slate-950 rounded-br-md"
                      : "bg-slate-900 border border-white/5 text-slate-200 rounded-bl-md"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <UserRound className="w-3 h-3 text-slate-400" />
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2" aria-label="Assistant is typing">
                <span className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </span>
                <div className="rounded-2xl rounded-bl-md bg-slate-900 border border-white/5 px-3.5 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"
                      style={{ animationDelay: `${index * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!hasUserMessage && !loading && (
              <div className="pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Suggested questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-slate-900 hover:border-emerald-500/30 hover:text-emerald-400 text-[10px] text-slate-300 text-left transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-white/10 bg-[#0F172A] p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="ai-support-input" className="sr-only">
                Ask a support question
              </label>
              <input
                ref={inputRef}
                id="ai-support-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1500}
                placeholder="Ask about plans, payments or security..."
                autoComplete="off"
                className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 flex items-center justify-center transition"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-slate-600">
              <span>AI-generated · Not financial advice</span>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1 hover:text-emerald-400 transition"
              >
                <Mail className="w-2.5 h-2.5" />
                Human support
              </a>
            </div>
          </footer>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close AI support chat" : "Open AI support chat"}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-[#080C15]" />
        )}
      </button>
    </div>
  );
}
