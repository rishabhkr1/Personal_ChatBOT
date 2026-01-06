# growGPT (Dungeon Edition)

> **"Built using Google Antigravity"**

**growGPT** is a highly specialized, immersive growGPT designed to assist with **Java and Spring Boot** development. It moves beyond standard chat interfaces, offering a gamified "Dungeon Vault" experience that makes coding feel like an RPG adventure.

![growGPT Preview](./dist/preview.png)

## 🚀 Key Features

### 🧠 Expert Knowledge Base
*   **Java & Spring Boot Specialist**: Pre-loaded with local knowledge to answer core framework questions instantly.
*   **Offline First**: Designed to run locally without external API dependencies for basic queries.

### 🏰 The Dungeon Experience
*   **Secure Vault Login**: Access the bot via a heavy iron vault that hangs from the ceiling.
*   **Interactive Physics**:
    *   **Free-Roam Lamp**: Drag the hanging light anywhere on the screen to illuminate the dark corners.
    *   **Swaying Chains**: The interface reacts to the environment.
    *   **Lock Breaking**: Smash the padlock to gain access.

### 🌩️ Dynamic 3D Environment
*   **Stormy Landscape**: A living 3D background built with `React Three Fiber`.
*   **Procedural Weather**: Real-time rain, thunder, and lightning bolts that illuminate the terrain.
*   **Low-Poly Ecosystem**: Features a mountain range, wind-swept clouds, and flocks of birds navigating the storm.

## 🛠️ Tech Stack
*   **Frontend**: React + Vite
*   **3D Engine**: Three.js / @react-three/fiber
*   **Styling**: Plain CSS (Glassmorphism & Neon aesthetics)
*   **AI Logic**: Custom Local RAG (Rule-Based + Knowledge Base)

## ⚙️ Configuration

1.  **Create Environment File**
    Copy the example configuration file:
    ```bash
    cp .env.example .env
    ```

2.  **Add API Keys**
    Open `.env` and add your API keys:
    ```
    VITE_GEMINI_API_KEY=your_gemini_key
    VITE_OPENAI_API_KEY=your_openai_key
    ```

## 🏃‍♂️ Quick Start

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    cd personal_chatbot
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Access the Vault**
    *   URL: `http://localhost:5173`
    *   **Identity**: `admin`
    *   **Code**: `password123`

---
*Made by Rishabh*
