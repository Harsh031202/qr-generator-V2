"use client";

import * as React from "react";
import { Mail, ArrowUpRight, Sparkles } from "lucide-react";

// Pixel-perfect SVG Brand Icons matching the Neo-brutalist styling
function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28M7.86 18.5V10.13H5.07V18.5h2.79z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function BrutalFooter() {
  const contactLinks = [
    {
      id: "email",
      label: "Email",
      handle: "hkharsh3122@gmail.com",
      href: "mailto:hkharsh3122@gmail.com",
      icon: <Mail className="w-5 h-5 stroke-[2.2]" />,
      cardHoverClass:
        "hover:bg-[#ffde59] hover:text-black dark:hover:bg-[#ffde59] dark:hover:text-black hover:border-black",
      iconBoxClass:
        "bg-white dark:bg-slate-900 text-black dark:text-white border-black dark:border-zinc-700 group-hover:bg-black group-hover:text-[#ffde59] group-hover:border-black",
      isMail: true,
      ariaLabel: "Send an email to hkharsh3122@gmail.com",
    },
    {
      id: "github",
      label: "GitHub",
      handle: "Harsh031202",
      href: "https://github.com/Harsh031202",
      icon: <GithubIcon className="w-5 h-5" />,
      cardHoverClass:
        "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white",
      iconBoxClass:
        "bg-white dark:bg-slate-900 text-black dark:text-white border-black dark:border-zinc-700 group-hover:bg-white group-hover:text-black group-hover:border-black dark:group-hover:bg-black dark:group-hover:text-white dark:group-hover:border-black",
      isMail: false,
      ariaLabel: "Visit GitHub profile of Harsh031202",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "Harsh Kumar Harsh",
      href: "https://www.linkedin.com/in/harsh-kumar-harsh-dark",
      icon: <LinkedinIcon className="w-5 h-5" />,
      cardHoverClass:
        "hover:bg-[#0077b5] hover:text-white dark:hover:bg-[#0077b5] dark:hover:text-white hover:border-[#0077b5]",
      iconBoxClass:
        "bg-white dark:bg-slate-900 text-[#0077b5] dark:text-[#38bdf8] border-black dark:border-zinc-700 group-hover:bg-white group-hover:text-[#0077b5] group-hover:border-white",
      isMail: false,
      ariaLabel: "Connect with Harsh Kumar Harsh on LinkedIn",
    },
    {
      id: "instagram",
      label: "Instagram",
      handle: "@thatoneguy3122",
      href: "https://www.instagram.com/thatoneguy3122",
      icon: <InstagramIcon className="w-5 h-5" />,
      cardHoverClass:
        "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-[#dc2743]",
      iconBoxClass:
        "bg-white dark:bg-slate-900 text-[#dc2743] dark:text-[#f472b6] border-black dark:border-zinc-700 group-hover:bg-white group-hover:text-[#dc2743] group-hover:border-white",
      isMail: false,
      ariaLabel: "Follow thatoneguy3122 on Instagram",
    },
  ];

  return (
    <footer className="w-full mt-14 pt-8 pb-12 select-none">
      {/* Neo-brutalist Main Card */}
      <div className="rounded-2xl sm:rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 shadow-[6px_6px_0px_#000] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Heading & Call to action */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black dark:border-zinc-700 bg-[#ffde59] text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Get In Touch</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black dark:text-white tracking-tight flex items-center gap-2">
              <span>Let&apos;s connect & collaborate</span>
              <span className="text-2xl font-black text-[#ec4899] dark:text-[#f472b6]">
                ✦
              </span>
            </h3>

            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-zinc-400 mt-2">
              Have feedback, custom feature requests, or want to say hello? reach out directly through any of these platforms!
            </p>
          </div>

          {/* Right Column: Social & Contact Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full lg:w-auto shrink-0">
            {contactLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                {...(!item.isMail
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-label={item.ariaLabel}
                className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 border-black dark:border-zinc-700 bg-slate-50 dark:bg-slate-800/80 text-black dark:text-white shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all duration-150 ${item.cardHoverClass}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 shadow-[1.5px_1.5px_0px_#000] transition-all duration-150 ${item.iconBoxClass}`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-black tracking-tight uppercase leading-none">
                      {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold opacity-80 group-hover:opacity-100 truncate mt-1">
                      {item.handle}
                    </span>
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 shrink-0 stroke-[2.5] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="border-t-2 border-black/10 dark:border-zinc-800 mt-8 pt-5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-black dark:text-white">
              qrstudio
            </span>
            <span className="text-[#ec4899]">✦</span>
            <span>Client-side, privacy-respecting QR code generator & scanner</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span>Crafted by</span>
            <span className="px-2 py-0.5 rounded-lg border border-black dark:border-zinc-700 bg-[#ffde59] text-black font-black shadow-[1px_1px_0px_#000]">
              Harsh Kumar Harsh
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
