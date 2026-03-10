"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage, LANGUAGES, Language } from "@/hooks/useLanguage";
import { useBackground, BACKGROUNDS } from "@/hooks/useBackground";
import { useAvatar, AVATARS } from "@/hooks/useAvatar";

const STORAGE_KEY = "memento-onboarding-done";

// Total steps: 0 = welcome/language, 1 = personalize, 2-4 = tutorial slides
const TOTAL_STEPS = 5;

const slideIcons = [
  <svg key="mic" className="w-16 h-16 text-warm-pink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>,
  <svg key="clock" className="w-16 h-16 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
  <svg key="heart" className="w-16 h-16 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>,
];

const slideTitleKeys = [
  "onboarding.slide1.title",
  "onboarding.slide2.title",
  "onboarding.slide3.title",
];

const slideBodyKeys = [
  "onboarding.slide1.body",
  "onboarding.slide2.body",
  "onboarding.slide3.body",
];

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const { background, setBackground } = useBackground();
  const { avatar, setAvatar } = useAvatar();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const finish = useCallback(() => {
    setExiting(true);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setVisible(false), 400);
  }, []);

  const next = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  if (!visible) return null;

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-400 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" />

      {/* Step 0: Welcome + Language */}
      {step === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div
            key="welcome"
            className="animate-[fade-in-up_0.6s_ease-out_forwards] flex flex-col items-center"
          >
            {/* Logo */}
            <div className="mb-3">
              <div className="w-20 h-20 rounded-full bg-teal/20 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
              Memento
            </h1>
            <p className="text-lg text-white/60 font-medium mb-12">
              {t("onboarding.welcome.tagline")}
            </p>

            {/* Language selection */}
            <p className="text-sm text-white/40 font-bold mb-3 uppercase tracking-wider">
              {t("onboarding.welcome.chooseLanguage")}
            </p>
            <div className="flex gap-2 mb-10">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                    language === lang.id
                      ? "bg-teal text-white shadow-lg shadow-teal/30"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              className="w-full max-w-xs py-4 rounded-2xl text-base font-bold text-white bg-teal shadow-lg shadow-teal/30 active:scale-[0.98] transition-transform"
            >
              {t("onboarding.welcome.continue")}
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Personalize (Background + Avatar) */}
      {step === 1 && (
        <div className="relative w-full max-w-md mx-4 mb-8 safe-bottom max-h-[80vh] overflow-y-auto">
          <div
            key="personalize"
            className="glass-heavy rounded-3xl px-6 pt-8 pb-6 animate-[fade-in-up_0.4s_ease-out_forwards]"
          >
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              {t("onboarding.personalize.title")}
            </h2>

            {/* Background picker */}
            <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-3">
              {t("onboarding.personalize.background")}
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {BACKGROUNDS.map((bg) => {
                const isActive = bg.id === background.id;
                return (
                  <button
                    key={bg.id}
                    onClick={() => setBackground(bg.id)}
                    className="relative rounded-xl overflow-hidden transition-transform active:scale-95"
                    style={{
                      outline: isActive ? "3px solid var(--color-teal)" : "3px solid transparent",
                      outlineOffset: -1,
                    }}
                  >
                    <picture>
                      <source srcSet={bg.webp} type="image/webp" />
                      <img
                        src={bg.png}
                        alt={bg.label}
                        className="w-full aspect-[4/5] object-cover"
                      />
                    </picture>
                    <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-white text-xs font-semibold">{bg.label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Avatar picker */}
            <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-3">
              {t("onboarding.personalize.avatar")}
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {AVATARS.map((av) => {
                const isActive = av.id === avatar.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => setAvatar(av.id)}
                    className="relative rounded-xl overflow-hidden transition-transform active:scale-95"
                    style={{
                      outline: isActive ? "3px solid var(--color-teal)" : "3px solid transparent",
                      outlineOffset: -1,
                    }}
                  >
                    <img
                      src={av.poster}
                      alt={av.label}
                      className="w-full aspect-square object-cover bg-black/80"
                    />
                    <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-white text-xs font-semibold">{av.label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              className="w-full py-3.5 rounded-2xl text-base font-bold text-white bg-teal active:scale-[0.98] transition-transform"
            >
              {t("onboarding.next")}
            </button>
          </div>
        </div>
      )}

      {/* Steps 2-4: Tutorial slides */}
      {step >= 2 && (
        <div className="relative w-full max-w-md mx-4 mb-12 safe-bottom">
          <div className="glass-heavy rounded-3xl px-8 pt-10 pb-8 text-center">
            {/* Icon */}
            <div
              key={step}
              className="flex justify-center mb-6 animate-[fade-in-up_0.4s_ease-out_forwards]"
            >
              {slideIcons[step - 2]}
            </div>

            {/* Text */}
            <div
              key={`text-${step}`}
              className="animate-[fade-in-up_0.4s_ease-out_0.1s_both]"
            >
              <h2 className="text-2xl font-bold text-navy mb-3">{t(slideTitleKeys[step - 2])}</h2>
              <p className="text-base leading-relaxed text-navy/70 mb-8">
                {t(slideBodyKeys[step - 2])}
              </p>
            </div>

            {/* Dots (only for tutorial slides) */}
            <div className="flex justify-center gap-2 mb-6">
              {slideIcons.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step - 2
                      ? "w-6 bg-teal"
                      : "w-2 bg-navy/20"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {!isLastStep && (
                <button
                  onClick={skip}
                  className="flex-1 py-3.5 rounded-2xl text-base font-semibold text-navy/50 transition-transform active:scale-95"
                >
                  {t("onboarding.skip")}
                </button>
              )}
              <button
                onClick={next}
                className={`flex-1 py-3.5 rounded-2xl text-base font-bold text-white transition-transform active:scale-95 ${
                  isLastStep ? "bg-warm-pink" : "bg-teal"
                }`}
              >
                {isLastStep ? t("onboarding.getStarted") : t("onboarding.next")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
