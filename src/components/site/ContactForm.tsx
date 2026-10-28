"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { COMPANY } from "@/lib/site";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");
    const mailto = `mailto:${COMPANY.email}?subject=${encodeURIComponent(
      `[Website enquiry] ${subject}`
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setOpened(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            placeholder="Full name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          placeholder="How can we help?"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          placeholder="Please include any account or plan details relevant to your enquiry."
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition"
      >
        <Send className="w-4 h-4" />
        Send message
      </button>

      <p className="text-[11px] text-slate-500">
        This form opens your email application with the message prepared. You can also email{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-emerald-400 hover:underline">
          {COMPANY.email}
        </a>
        .
      </p>
      {opened && (
        <p className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Your email application should now be open. Send the prepared message to complete your
          enquiry.
        </p>
      )}
    </form>
  );
}
