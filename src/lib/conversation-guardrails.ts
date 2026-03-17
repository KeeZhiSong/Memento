const HIGH_RISK_PATTERNS = [
  /\bbuild (a )?bomb\b/i,
  /\bmake (a )?bomb\b/i,
  /\bmethamphetamine\b/i,
  /\bmake meth\b/i,
  /\bcreate meth\b/i,
  /\bexplosive\b/i,
];

export function getGuardrailResponse(input: string) {
  if (HIGH_RISK_PATTERNS.some((pattern) => pattern.test(input))) {
    return "I can't help with making weapons, explosives, or illegal drugs. If you're worried about safety, I can help with harm prevention, emergency steps, or legal alternatives.";
  }

  return null;
}
