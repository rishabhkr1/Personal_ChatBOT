import { useState, useRef, useEffect } from 'react';
import { sendMessageToAI } from '../services/aiService';

const ChatInterface = ({ onLogout, userName = "User", isDarkMode, toggleTheme }) => {
    const [provider, setProvider] = useState('local');
    const [messages, setMessages] = useState([]); // Start empty to show Hero Greeting
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceMode, setVoiceMode] = useState('none');
    const [isTalkMode, setIsTalkMode] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const abortControllerRef = useRef(null);

    const speakText = (text) => {
        if (!isTalkMode) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File uploaded:", file.name);
            // In a real app, process the file here (check type, upload to backend, etc.)
            const systemMessage = {
                id: Date.now(),
                text: `[System] Uploaded file: ${file.name}`,
                sender: 'ai'
            };
            setMessages(prev => [...prev, systemMessage]);
        }
        setShowUploadMenu(false);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const handleClear = () => {
        setMessages([]);
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setVoiceMode('none');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await sendMessageToAI(userMessage.text, provider, controller.signal);
            const aiMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'ai',
                provider: provider
            };
            setMessages(prev => [...prev, aiMessage]);
            speakText(response);
        } catch (error) {
            if (error.message.includes("Aborted")) {
                const abortedMessage = {
                    id: Date.now() + 1,
                    text: "🛑 Generation stopped by user.",
                    sender: 'ai'
                };
                setMessages(prev => [...prev, abortedMessage]);
            } else {
                console.error("Failed to get AI response", error);
                const errorMessage = {
                    id: Date.now() + 1,
                    text: `Error: ${error.message}`,
                    sender: 'ai'
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };



    const startRecognition = (mode) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support speech recognition. Try Chrome or Edge.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceMode(mode);
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            setInputText(transcript);

            if (mode === 'talk' && event.results[0].isFinal) {
                setTimeout(() => {
                    handleSend();
                    stopListening();
                }, 500);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setVoiceMode('none');
        };

        recognition.onend = () => {
            setIsListening(false);
            setVoiceMode('none');
        };

        recognition.start();
    };

    const handleDictationInput = () => {
        if (isListening && voiceMode === 'dictation') {
            stopListening();
        } else {
            startRecognition('dictation');
        }
    };

    const styles = {
        container: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            color: isDarkMode ? '#e3e3e3' : '#333',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
        },
        topBar: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '12px',
            zIndex: 10,
        },
        heroSection: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '10%',
            paddingRight: '10%',
            opacity: messages.length === 0 ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: messages.length === 0 ? 'auto' : 'none',
        },
        chatList: {
            flex: 1,
            overflowY: 'auto',
            padding: '80px 0 120px 0', // Remove horizontal padding from container
            display: messages.length === 0 ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%', // Full width for scrollbar
            // margin: '0 auto', // Remove centering of the container
        },
        messageContainer: { // New wrapper for centering content
            maxWidth: '1000px',
            width: '100%',
            margin: '0 auto',
            padding: '0 20px', // Add padding here
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        greeting: {
            fontSize: '3.5rem',
            fontWeight: '500',
            background: 'linear-gradient(90deg, #4285F4, #9B72CB, #D96570)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            lineHeight: 1.2
        },
        subGreeting: {
            fontSize: '3.5rem',
            fontWeight: '500',
            color: isDarkMode ? '#444746' : '#888',
            marginBottom: '40px',
            lineHeight: 1.2
        },
        inputContainer: {
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '800px',
            zIndex: 20,
        },
        pill: {
            background: isDarkMode ? '#1e1f20' : '#f0f4f9',
            borderRadius: '40px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: isDarkMode ? '0 4px 10px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
        },
        input: {
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: '1.1rem',
            color: isDarkMode ? '#e3e3e3' : '#1f1f1f',
            outline: 'none',
        },
        iconButton: {
            background: 'transparent',
            border: 'none',
            color: isDarkMode ? '#e3e3e3' : '#444746',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background 0.2s',
        },
        sendButton: {
            background: isDarkMode ? '#e3e3e3' : '#1f1f1f',
            color: isDarkMode ? '#1f1f1f' : '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: '8px'
        },
        stopButton: {
            background: '#ef4444', // Red
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '15px' // Space it out
        },
        providerLabel: {
            fontSize: '0.8rem',
            color: isDarkMode ? '#8e918f' : '#5e5e5e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '12px',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        messageRow: {
            display: 'flex',
            gap: '16px',
            lineHeight: '1.6',
        },
        avatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0,
        },
        iconHover: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    };

    const inputRef = useRef(null);

    useEffect(() => {
        if (!isLoading) {
            // Slight delay to ensure element is enabled before focusing
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isLoading]);

    return (
        <div style={styles.container} className="chat-interface">
            {/* Top Bar Controls */}
            <div style={styles.topBar}>
                <button
                    onClick={handleClear}
                    style={{ ...styles.iconButton, fontSize: '0.9rem', border: '1px solid rgba(128,128,128,0.3)', borderRadius: '20px', padding: '6px 16px' }}
                    className="interactive"
                >
                    Clear
                </button>
                <button
                    onClick={toggleTheme}
                    style={{ ...styles.iconButton, fontSize: '0.9rem', border: '1px solid rgba(128,128,128,0.3)', borderRadius: '20px', padding: '6px 16px' }}
                    className="interactive"
                >
                    {isDarkMode ? 'Light' : 'Dark'}
                </button>
                <button
                    onClick={onLogout}
                    style={{ ...styles.iconButton, fontSize: '0.9rem', border: '1px solid rgba(128,128,128,0.3)', borderRadius: '20px', padding: '6px 16px' }}
                    className="interactive"
                >
                    Logout
                </button>
            </div>

            {/* Hero Greeting (Only when empty) */}
            {messages.length === 0 && (
                <div style={styles.heroSection}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✨</div>
                    <h1 style={styles.greeting}>Hi {userName}</h1>
                    <h2 style={styles.subGreeting}>Where should we start?</h2>
                </div>
            )}

            {/* Messages List (When not empty) */}
            <div style={styles.chatList}>
                <div style={styles.messageContainer}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={styles.messageRow}>
                            {msg.sender === 'ai' ? (
                                <div style={{ ...styles.avatar, background: 'linear-gradient(135deg, #4285F4, #9B72CB)' }}>
                                    ✨
                                </div>
                            ) : (
                                <div style={{ ...styles.avatar, background: '#D9D9D9', marginLeft: 'auto', order: 2 }}>
                                    👤
                                </div>
                            )}
                            <div style={{
                                flex: 1,
                                color: isDarkMode ? '#e3e3e3' : '#1f1f1f',
                                textAlign: msg.sender === 'user' ? 'right' : 'left',
                                order: msg.sender === 'user' ? 1 : 2
                            }}>
                                {msg.sender === 'user' ? (
                                    <div style={{ background: isDarkMode ? '#2c2c2c' : '#f0f4f9', padding: '12px 20px', borderRadius: '20px', display: 'inline-block' }}>
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div style={{ background: '#000000', color: '#ffffff', padding: '12px 20px', borderRadius: '20px', display: 'inline-block', border: '1px solid #333' }}>
                                        {msg.text}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={styles.messageRow}>
                            <div style={{ ...styles.avatar, background: 'linear-gradient(135deg, #4285F4, #9B72CB)' }}>
                                ✨
                            </div>
                            <div style={{ alignSelf: 'center', color: '#888' }}>Thinking...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Floating Input Pill */}
            <div style={styles.inputContainer}>
                {/* Upload Menu (Absolute above the pill) */}
                {showUploadMenu && (
                    <div style={{
                        position: 'absolute',
                        bottom: '70px',
                        left: '0',
                        background: isDarkMode ? '#1e1f20' : '#fff',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 100,
                        border: isDarkMode ? '1px solid #333' : '1px solid #eee',
                        minWidth: '150px'
                    }}>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: isDarkMode ? '#e3e3e3' : '#333',
                                padding: '8px 12px',
                                width: '100%',
                                textAlign: 'left',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}
                            className="interactive"
                        >
                            📄 Upload Documents
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />

                <div style={styles.pill}>
                    {/* Plus Icon (Menu Toggle) */}
                    <div
                        onClick={() => setShowUploadMenu(!showUploadMenu)}
                        style={{ ...styles.iconButton, cursor: 'pointer', opacity: 1 }}
                        className="interactive"
                    >
                        +
                    </div>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend(e)}
                        placeholder="Ask me anything..."
                        style={styles.input}
                        autoFocus
                    />

                    {/* Provider Toggle Pill */}
                    <div
                        onClick={() => {
                            if (provider === 'local') setProvider('gemini');
                            else if (provider === 'gemini') setProvider('chatgpt');
                            else setProvider('local');
                        }}
                        style={styles.providerLabel}
                        title="Click to switch provider"
                        className="interactive"
                    >
                        {provider === 'local' && '💻 Local'}
                        {provider === 'gemini' && '✨ Gemini'}
                        {provider === 'chatgpt' && '🤖 ChatGPT'}
                        <span style={{ fontSize: '0.6rem' }}>▼</span>
                    </div>

                    {/* Mic Button */}
                    <button
                        onClick={handleDictationInput}
                        style={{ ...styles.iconButton, color: isListening ? '#ef4444' : (isDarkMode ? '#e3e3e3' : '#444746') }}
                        className="interactive"
                        title="Voice Input"
                    >
                        {isListening ? '🛑' : '🎤'}
                    </button>

                    {/* Send / Stop Button */}
                    {isLoading ? (
                        <button onClick={handleStop} style={styles.stopButton} className="interactive" title="Stop Generation"></button>
                    ) : (
                        <button onClick={handleSend} style={styles.sendButton} className="interactive" disabled={!inputText.trim()}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                            </svg>
                        </button>
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#888' }}>
                    Gemini may display inaccurate info, including about people, so double-check its responses.
                </div>
            </div>

            {/* Talk Mode Toggle (Hidden/Floating or integrated? Leaving integrated for now but subtle) */}
            <div style={{ position: 'absolute', bottom: '15px', right: '20px', zIndex: 30 }}>
                <button
                    onClick={() => {
                        const newMode = !isTalkMode;
                        setIsTalkMode(newMode);
                        if (!newMode) stopSpeaking();
                    }}
                    style={{ ...styles.iconButton, fontSize: '1rem', opacity: 0.5 }}
                    title={isTalkMode ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                >
                    {isTalkMode ? '🔊' : '🔇'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
