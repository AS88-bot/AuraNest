# AuraNest: Your Compassionate AI Companion ✨

[![AuraNest Banner](https://placehold.co/1200x400/9370DB/FFFFFF/AuraNest?text=AuraNest&font=sans-serif&bold)](https://github.com/)

AuraNest is a web application thoughtfully designed to provide a reassuring and organized digital environment for individuals with dementia or memory challenges, and to offer peace of mind to their caregivers. By leveraging the power of generative AI, AuraNest aims to enhance daily living, foster connection, and ensure safety.

## 🌟 Our Vision

Our vision is to demonstrate how compassionate AI can create deeply personal and supportive experiences. AuraNest is more than just a set of tools; it's a companion that understands, remembers, and assists. We believe that technology, particularly AI, can empower individuals with cognitive decline to live with greater independence and dignity, while bridging the communication gap with their loved ones. We aim to showcase a future where AI is not just intelligent, but also empathetic.

## ✅ Features

AuraNest is built with a suite of features designed for simplicity and accessibility:

-   **🗓️ AI-Powered Daily Planner**: A clear, time-based schedule of the day's events, from medication reminders to appointments. Integrated with AI to add reminders via voice.
-   **🗣️ Voice-First Interface**: An intuitive **Voice Assistant** allows users to navigate the app, call contacts, and set reminders using natural language.
-   **💬 Aura Chatbot**: A friendly AI chatbot, "Aura," is always available for companionship, answering questions, or simply having a conversation. It remembers your chat history for a continuous experience.
-   **🔊 Verbal Reminders & Text-to-Speech**: Create verbal reminders in multiple languages and voices. The AI can extract times from natural language (e.g., "remind me in 10 minutes") and generate audio cues.
-   **📝 Memory Journal**: Users can record thoughts and memories using voice-to-text. The AI then generates a simple, easy-to-read "Today in My Life" summary to help reinforce memories.
-   **😊 Mood Tracker**: A simple, emoji-based mood logger. After selecting a mood, an empathetic AI provides a short, supportive, and comforting message.
-   **🆘 Emergency SOS & Location**: A prominent SOS button immediately sends the user's current location to designated emergency contacts.
-   **👨‍👩‍👧‍👦 Contacts & Caregiver Dashboard**: Easy-to-use contact cards with large photos and a dedicated dashboard for caregivers to view a user's location and status, especially during an SOS alert.
-   **🌐 Multi-Language Support**: The UI and AI interactions are available in English, Spanish, French, German, Hindi, and Italian.

## 🛠️ Tech Stack

AuraNest is built on a modern, robust, and scalable technology stack, designed to showcase the best of Google's tools:

-   **Framework**: [Next.js](https://nextjs.org/) 15 (React with App Router)
-   **Backend & Database**: [Firebase](https://firebase.google.com/)
    -   **Authentication**: Secure email/password and anonymous sign-in.
    -   **Firestore**: A real-time, NoSQL database for all application data.
-   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models)
    -   `gemini-2.5-flash` for language interpretation, summarization, and chat.
    -   `gemini-2.5-flash-preview-tts` for advanced text-to-speech generation.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Hosting**: Deployed on [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## 🚦 Project Status

**Status: Functional Prototype**

This version of AuraNest is a functional prototype. The core features are implemented and functional, demonstrating the primary vision of the application. The focus has been on showcasing the powerful and seamless integration of Genkit and Firebase to create a user-centric, AI-driven experience.

## 🚀 Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:9002](http://localhost:9002) to see the app in action.

---

Built with ❤️ for the AI community.
