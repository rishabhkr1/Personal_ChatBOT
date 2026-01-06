import { useState, useRef, useEffect } from 'react';
import { sendMessageToAI } from '../services/aiService';


const ProviderDropdown = ({ currentProvider, onSelect, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const providers = [
        { id: 'local', label: 'Local', icon: '💻' },
        { id: 'gemini', label: 'Gemini', icon: '✨' },
        { id: 'chatgpt', label: 'ChatGPT', icon: '🧠' },
    ];

    const currentLabel = providers.find(p => p.id === currentProvider)?.label || 'Select';
    const currentIcon = providers.find(p => p.id === currentProvider)?.icon || '';

    // Inline styles for the dropdown to ensure it looks good
    const dropdownStyle = {
        position: 'relative',
        display: 'inline-block',
    };

    const toggleStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        color: 'inherit',
        transition: 'all 0.2s',
    };

    const menuStyle = {
        position: 'absolute',
        top: '120%',
        left: 0,
        background: isDarkMode ? 'rgba(30,30,35,0.95)' : 'rgba(255,255,255,0.95)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '5px',
        listStyle: 'none',
        display: isOpen ? 'block' : 'none',
        width: '140px',
        zIndex: 100,
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
    };

    const itemStyle = {
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: isDarkMode ? '#e0e0e0' : '#333',
        transition: 'background 0.2s',
    };

    return (
        <div style={dropdownStyle} ref={dropdownRef}>
            <div
                style={toggleStyle}
                onClick={() => setIsOpen(!isOpen)}
                className="interactive"
            >
                <span>{currentIcon}</span>
                <span>{currentLabel}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
            </div>
            <ul style={menuStyle}>
                {providers.map(p => (
                    <li
                        key={p.id}
                        style={{
                            ...itemStyle,
                            backgroundColor: currentProvider === p.id ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent'
                        }}
                        onClick={() => {
                            onSelect(p.id);
                            setIsOpen(false);
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            if (currentProvider !== p.id) e.currentTarget.style.backgroundColor = 'transparent';
                            else e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                        }}
                    >
                        <span>{p.icon}</span>
                        {p.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ChatInterface = ({ onLogout }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [provider, setProvider] = useState('local');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am growGPT. Select a provider and ask me anything!", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceMode, setVoiceMode] = useState('none'); // 'none', 'dictation', 'talk'
    const [isTalkMode, setIsTalkMode] = useState(false); // Keeps the "Speaker" toggle functionality (TTS enabled/disabled)
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const speakText = (text) => {
        if (!isTalkMode) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
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
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await sendMessageToAI(userMessage.text, provider);
            const aiMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'ai',
                provider: provider // Track which provider sent this
            };
            setMessages(prev => [...prev, aiMessage]);
            speakText(response);
        } catch (error) {
            console.error("Failed to get AI response", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: `Error: ${error.message}`,
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
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
        recognition.interimResults = true; // Enable interim results for smoother typing

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceMode(mode);
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            setInputText(transcript);

            // Auto-send if in Talk Mode and result is final
            if (mode === 'talk' && event.results[0].isFinal) {
                // Small delay to let the user see the text and for state to update
                setTimeout(() => {
                    handleSend({ preventDefault: () => { } }); // Mock event
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
            // Only stop "listening" state, let the user decide when to restart or if auto-looping (not implemented yet)
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

    const handleTalkModeInput = () => {
        if (isListening && voiceMode === 'talk') {
            stopListening();
        } else {
            // Ensure Talk Mode (TTS) is enabled when entering Voice Conversation
            if (!isTalkMode) setIsTalkMode(true);
            startRecognition('talk');
        }
    };

    const getProviderTheme = (prov) => {
        switch (prov) {
            case 'gemini':
                return {
                    borderColor: 'rgba(66, 133, 244, 0.6)',
                    boxShadow: '0 8px 32px 0 rgba(66, 133, 244, 0.25)',
                    background: isDarkMode ? 'rgba(10, 15, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)'
                };
            case 'chatgpt':
                return {
                    borderColor: 'rgba(16, 163, 127, 0.6)',
                    boxShadow: '0 8px 32px 0 rgba(16, 163, 127, 0.25)',
                    background: isDarkMode ? 'rgba(10, 20, 15, 0.95)' : 'rgba(255, 255, 255, 0.9)'
                };
            case 'local':
            default:
                return {
                    borderColor: 'var(--glass-border)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                };
        }
    };

    const providerTheme = getProviderTheme(provider);
    const currentStyles = {
        ...isDarkMode ? darkStyles : lightStyles,
        container: {
            ...(isDarkMode ? darkStyles.container : lightStyles.container),
            ...providerTheme,
            transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth transition for everything
        }
    };

    return (
        <div style={currentStyles.container} className="chat-container">
            <div className="rabbit-patrol">🐇</div>
            <div style={currentStyles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2>growGPT</h2>
                    <ProviderDropdown
                        currentProvider={provider}
                        onSelect={setProvider}
                        isDarkMode={isDarkMode}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={handleTalkModeInput}
                        style={{
                            ...currentStyles.themeButton,
                            color: isListening && voiceMode === 'talk' ? '#ef4444' : 'inherit'
                        }}
                        className="interactive"
                        title="Start Voice Conversation"
                    >
                        🎧
                    </button>
                    <button
                        onClick={() => {
                            const newMode = !isTalkMode;
                            setIsTalkMode(newMode);
                            if (!newMode) stopSpeaking();
                        }}
                        style={currentStyles.themeButton}
                        className="interactive"
                        title={isTalkMode ? "Disable Talk Mode" : "Enable Talk Mode"}
                    >
                        {isTalkMode ? '🔊' : '🔇'}
                    </button>
                    <button onClick={toggleTheme} style={currentStyles.themeButton} className="interactive">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button onClick={onLogout} style={currentStyles.smallButton} className="interactive">Logout</button>
                </div>
            </div>

            <div style={currentStyles.chatArea}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            ...currentStyles.messageRow,
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end', // Align icons at bottom
                            gap: '8px'
                        }}
                    >
                        {/* Bot Icon (Left) */}
                        {msg.sender === 'ai' && (
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%', background: '#444',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem'
                            }} title={msg.provider ? `Provider: ${msg.provider}` : 'AI'}>
                                {msg.provider === 'gemini' ? '✨' : msg.provider === 'chatgpt' ? '🧠' : '🤖'}
                            </div>
                        )}

                        <div style={{
                            ...currentStyles.bubble,
                            backgroundColor: msg.sender === 'user' ? currentStyles.userBubbleColor : currentStyles.botBubbleColor,
                            color: msg.sender === 'user' ? '#fff' : currentStyles.botTextColor,
                            borderRadius: msg.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0'
                        }}>
                            {msg.text}
                        </div>

                        {/* User Icon (Right) */}
                        {msg.sender === 'user' && (
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem'
                            }}>
                                👤
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ ...currentStyles.messageRow, justifyContent: 'flex-start' }}>
                        <div style={{ ...currentStyles.bubble, backgroundColor: currentStyles.botBubbleColor, color: '#888' }}>
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={currentStyles.inputArea}>
                <button
                    type="button"
                    onClick={handleDictationInput}
                    style={{
                        ...currentStyles.button,
                        backgroundColor: isListening && voiceMode === 'dictation' ? '#ef4444' : '#666',
                        padding: '10px 14px',
                        marginRight: '8px'
                    }}
                    className="interactive"
                    title="Dictation Mode"
                >
                    {isListening && voiceMode === 'dictation' ? '🛑' : '🎤'}
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening && voiceMode === 'dictation' ? "Listening..." : "Ask about Java or Spring Boot..."}
                    style={currentStyles.input}
                    disabled={isLoading}
                    className="interactive-input"
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    style={{
                        ...currentStyles.button,
                        opacity: isLoading || !inputText.trim() ? 0.5 : 1
                    }}
                    className="interactive"
                >
                    Send
                </button>
            </form>
            {/* Owner Footer */}
            <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
                <OwnerFooter />
            </div>

            {/* Listening Overlay (Whisper Mode Animation) - Only for Talk Mode */}
            {isListening && voiceMode === 'talk' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 200,
                    color: 'white',
                    paddingTop: '40px'
                }}>
                    <button
                        onClick={stopListening}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '10px'
                        }}
                    >
                        ✕
                    </button>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
                        animation: 'pulse-red 1.5s infinite',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '2rem'
                    }}>
                        🎙️
                    </div>
                    <h3 style={{ marginTop: '20px', fontWeight: '300', letterSpacing: '1px' }}>Listening...</h3>
                    <style>{`
                        @keyframes pulse-red {
                            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                            70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
                            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                        }
                    `}</style>
                </div>
            )}

        </div>
    );
};

// Base Styles
const baseStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        width: '800px',
        maxWidth: '90vw',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
    },
    header: {
        padding: '1rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
    },
    chatArea: {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    messageRow: {
        display: 'flex',
        width: '100%',
    },
    bubble: {
        padding: '10px 14px',
        maxWidth: '80%',
        lineHeight: '1.4',
        fontSize: '0.9rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'left',
        wordWrap: 'break-word',
    },
    inputArea: {
        padding: '1rem',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.02)',
    },
    input: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '20px',
        border: '1px solid var(--glass-border)',
        fontSize: '0.9rem',
        outline: 'none',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
    },
    smallButton: {
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid var(--glass-border)',
        backgroundColor: 'transparent',
        fontSize: '0.75rem',
        cursor: 'pointer',
    },
    themeButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '0 5px'
    },
    select: {
        padding: '2px 5px',
        borderRadius: '4px',
        border: '1px solid var(--glass-border)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        color: 'inherit',
        fontSize: '0.8rem',
        outline: 'none',
        cursor: 'pointer',
    }
};

const darkStyles = {
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: 'rgba(12, 12, 18, 0.95)', // Much darker, less red
        color: 'white',
    },
    input: {
        ...baseStyles.input,
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: 'white',
    },
    smallButton: {
        ...baseStyles.smallButton,
        color: '#aaa',
    },
    userBubbleColor: 'var(--chat-bubble-user)',
    botBubbleColor: 'var(--chat-bubble-bot)',
    botTextColor: '#e0e0e0',
};

const lightStyles = {
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        color: '#333',
    },
    input: {
        ...baseStyles.input,
        backgroundColor: 'rgba(0,0,0,0.05)',
        color: '#333',
        border: '1px solid #ccc',
    },
    smallButton: {
        ...baseStyles.smallButton,
        color: '#555',
        borderColor: '#ccc',
    },
    userBubbleColor: 'var(--primary-color)',
    botBubbleColor: '#f0f0f0',
    botTextColor: '#333',
};



const OwnerFooter = () => {
    const [showOwner, setShowOwner] = useState(false);
    return (
        <span
            onClick={() => setShowOwner(!showOwner)}
            style={{
                borderBottom: '1px dotted #888',
                cursor: 'pointer',
                fontSize: '0.8rem',
                opacity: 0.7,
                marginTop: '10px',
                display: 'inline-block'
            }}
        >
            {showOwner ? 'Made by Rishabh' : 'Owner Details'}
        </span>
    );
};

export default ChatInterface;
