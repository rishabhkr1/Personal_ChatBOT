import { useState, useRef, useEffect } from 'react';
import { sendMessageToAI } from '../services/aiService';

const ChatInterface = ({ onLogout }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am your personal assistant. Ask me about Java or Spring Boot!", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

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
            // No API key needed anymore
            const response = await sendMessageToAI(userMessage.text);
            const aiMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMessage]);
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

    const currentStyles = isDarkMode ? darkStyles : lightStyles;

    return (
        <div style={currentStyles.container} className="chat-container">
            <div className="rabbit-patrol">🐇</div>
            <div style={currentStyles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2>growGPT</h2>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, border: '1px solid #555', padding: '2px 6px', borderRadius: '4px' }}>
                        Local
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                            }}>
                                🤖
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
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about Java or Spring Boot..."
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
    }
};

const darkStyles = {
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: 'rgba(50, 0, 0, 0.65)', // Dark Red tint
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
