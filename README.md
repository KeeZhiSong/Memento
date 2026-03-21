# 🧠 Memento: Voice-First Agentic AI for Dementia Care

Memento is a clinical, zero-friction multimodal AI agent tailored for seniors with early-onset dementia. By combining culturally aware LLM reasoning with a real-time 3D avatar ("Auntie Mimi"), Memento provides 24/7 empathetic conversation, proactive cognitive stimulation, and autonomous memory support without the digital friction of traditional apps (no typing required).

https://github.com/user-attachments/assets/4ac9562d-7ef6-4c3e-88d9-4e2d82f44a5b

## ✨ Key Features & Business Value

* 🗣️ **Zero-Friction Voice Interaction:** Real-time, hands-free conversational flows featuring automatic language detection (English, Singlish, Mandarin, Malay, Tamil).
* 👤 **Culturally Aware 3D Avatar:** Built with React Three Fiber and Ready Player Me, featuring realistic lip-sync driven by ElevenLabs audio viseme mapping. Localized context is injected via A*STAR's MERaLiON model.
* 🚨 **Autonomous Tool Calls:** The agentic pipeline detects conversational markers of disorientation to trigger high-urgency SMS alerts with live location tracking, and runs cron-jobs for proactive medication check-ins.
* 🧩 **Proactive Cognitive Engagement:** Integrates interactive routines like voice-driven Memory Games and Story Time to keep the user's mind active.
* 📊 **Automated Clinical Intelligence:** A dedicated Caregiver Dashboard synthesizes everyday chats into vital health signals (mood trends, confusion levels) and generates EHR-ready summaries for doctor appointments, drastically reducing caregiver burnout.

## ⚙️ Agentic AI Architecture
<img width="1920" height="1080" alt="Memento Pitch Deck" src="https://github.com/user-attachments/assets/0a5e68f2-b8c5-4141-b309-e5c9dc93abe8" />

## 🛠️ Tech Stack
* **Frontend & 3D Rendering:** Next.js, React, React Three Fiber, Tailwind CSS
* **Avatar Assets:** Ready Player Me (`.glb` integration)
* **AI & Audio:** OpenAI API, MERaLiON (A*STAR), ElevenLabs, `@ricky0123/vad-web`
* **Backend:** Node.js, Next.js API Routes, Lightweight File-backed DB (MVP)
