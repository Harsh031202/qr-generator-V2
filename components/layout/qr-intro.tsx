"use client";

import * as React from "react";

interface QRIntroProps {
  onStartPresentation?: () => void;
  onFinished?: () => void;
}

export function QRIntro({ onStartPresentation, onFinished }: QRIntroProps) {
  const [mounted, setMounted] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);
  const [isSkipping, setIsSkipping] = React.useState(false);

  // Decouple callbacks with refs to prevent effect re-execution on parent re-renders
  const onStartPresentationRef = React.useRef(onStartPresentation);
  const onFinishedRef = React.useRef(onFinished);
  onStartPresentationRef.current = onStartPresentation;
  onFinishedRef.current = onFinished;

  const presentationTriggeredRef = React.useRef(false);
  const finishedRef = React.useRef(false);

  // Trigger website entrance cross-fade
  const unlockScrollAndPresent = React.useCallback(() => {
    if (presentationTriggeredRef.current) return;
    presentationTriggeredRef.current = true;

    // Safety cleanup: strip any legacy scroll locks that might linger in DOM
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("qr-lock");
      document.body.classList.remove("qr-lock");
    }

    setIsExiting(true);
    onStartPresentationRef.current?.();
  }, []);

  // Complete intro lifecycle and unmount overlay
  const finishIntro = React.useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("qr-lock");
      document.body.classList.remove("qr-lock");
    }

    unlockScrollAndPresent();
    setMounted(false);
    onFinishedRef.current?.();
  }, [unlockScrollAndPresent]);

  const handleSkip = React.useCallback(() => {
    if (finishedRef.current) return;
    setIsSkipping(true);
    unlockScrollAndPresent();
    setTimeout(() => {
      finishIntro();
    }, 300);
  }, [unlockScrollAndPresent, finishIntro]);

  React.useEffect(() => {
    // Safety cleanup: ensure no residual locks exist
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("qr-lock");
      document.body.classList.remove("qr-lock");
    }

    // Check reduced motion preference
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      unlockScrollAndPresent();
      finishIntro();
      return;
    }

    // Measure time elapsed since page load to synchronize with CSS animations perfectly
    const elapsed = typeof performance !== "undefined" ? performance.now() : 0;

    // If already past total duration (e.g. slow hydration or refresh), finish immediately
    if (elapsed >= 2850) {
      unlockScrollAndPresent();
      finishIntro();
      return;
    }

    const presentationDelay = Math.max(0, 2150 - elapsed);
    const cleanupDelay = Math.max(0, 2850 - elapsed);

    const presentationTimer = setTimeout(() => {
      unlockScrollAndPresent();
    }, presentationDelay);

    const cleanupTimer = setTimeout(() => {
      finishIntro();
    }, cleanupDelay);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(presentationTimer);
      clearTimeout(cleanupTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("qr-lock");
        document.body.classList.remove("qr-lock");
      }
    };
  }, [unlockScrollAndPresent, finishIntro, handleSkip]);

  if (!mounted) return null;

  return (
    <div
      id="qr-intro"
      role="img"
      aria-label="qrstudio"
      onClick={handleSkip}
      onWheel={(e) => {
        // Prevent wheel bubbling to page beneath while overlay is active
        e.stopPropagation();
      }}
      onAnimationEnd={(e) => {
        // Automatically unmount when CSS fade-out animation completes
        if (
          e.target === e.currentTarget &&
          (e.animationName === "qrOut" || e.animationName === "qrSkipOut")
        ) {
          finishIntro();
        }
      }}
      className={`${isSkipping ? "is-skipping" : ""} ${isExiting ? "is-exiting" : ""}`}
      title="Click anywhere to skip intro"
    >
      <div className="qr-logo" aria-hidden="true">
        <span className="qr-word">
          <span style={{ "--i": 0 } as React.CSSProperties}>q</span>
          <span style={{ "--i": 1 } as React.CSSProperties}>r</span>
          <span style={{ "--i": 2 } as React.CSSProperties}>s</span>
          <span style={{ "--i": 3 } as React.CSSProperties}>t</span>
          <span style={{ "--i": 4 } as React.CSSProperties}>u</span>
          <span style={{ "--i": 5 } as React.CSSProperties}>d</span>
          <span style={{ "--i": 6 } as React.CSSProperties}>i</span>
          <span style={{ "--i": 7 } as React.CSSProperties}>o</span>
        </span>
        <svg className="qr-spark" viewBox="0 0 24 24">
          <path d="M12 0C12.9 7.2 16.8 11.1 24 12C16.8 12.9 12.9 16.8 12 24C11.1 16.8 7.2 12.9 0 12C7.2 11.1 11.1 7.2 12 0Z" />
        </svg>
      </div>
    </div>
  );
}
