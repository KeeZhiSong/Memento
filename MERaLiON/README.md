# Voice Interaction Pipeline 
This project uses a real-time voice pipeline designed for low-latency, empathetic interaction with elderly users. It integrates @ricky0123/vad-react for client-side processing and MERaLiON LLM & API for transcription and reasoning.

## ISSUES / Areas of Improvements todo
- every time user speaks, treated as fresh start
  - use sliding window? summary of convo history? database possible?
  - client vs server side persistence
  - context window
- exponential backoff/buffer for transcription process
- AI boundaries and guardrails + safety (scheduling topics, steering away from certain topics)
- dynamic instruction injection, based on current time/weather etc, depending on user's tone