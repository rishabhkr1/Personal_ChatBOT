import { useState, useRef, useEffect } from 'react';

const SUPPORT_FLOW = {
    start: {
        text: "Hi there! 👋 How can we help you today?",
        options: [
            { label: "Report a Bug", next: "bug_report" },
            { label: "Feature Request", next: "feature_req" },
            { label: "General Inquiry", next: "general" }
        ]
    },
    bug_report: {
        text: "Oh no! We're sorry to hear that. What part of the app is affected?",
        options: [
            { label: "Login / Auth", next: "bug_details" },
            { label: "Chat Interface", next: "bug_details" },
            { label: "Visual Glitch", next: "bug_details" }
        ]
    },
    bug_details: {
        text: "Understood. Our team has been notified of this potential issue. Your ticket ID is #BUG-" + Math.floor(Math.random() * 1000) + ". Anything else?",
        options: [
            { label: "That's all", next: "end" },
            { label: "Start Over", next: "start" }
        ]
    },
    feature_req: {
        text: "We love new ideas! 💡 What area is your request related to?",
        options: [
            { label: "New AI Models", next: "feat_details" },
            { label: "UI / Themes", next: "feat_details" },
            { label: "Performance", next: "feat_details" }
        ]
    },
    feat_details: {
        text: "Great suggestion! We've logged this for our product team. Thanks for helping us grow! 🚀",
        options: [
            { label: "Close", next: "close" }
        ]
    },
    general: {
        text: "Sure! For general inquiries, you can reach us at support@growgpt.com or check our documentation.",
        options: [
            { label: "Back to Menu", next: "start" }
        ]
    },
    end: {
        text: "Have a wonderful day! Happy coding! 💻",
        options: [
            { label: "Close Chat", next: "close" }
        ]
    }
};

const SupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState('start');
    const messagesEndRef = useRef(null);

    // Initialize chat when opened
    useEffect(() => {
        if (isOpen && history.length === 0) {
            setHistory([{ type: 'bot', ...SUPPORT_FLOW['start'] }]);
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isOpen]);

    const handleOptionClick = (option) => {
        // Add user response
        const userMsg = { type: 'user', text: option.label };

        // Determine next step
        const nextStepId = option.next;

        if (nextStepId === 'close') {
            setIsOpen(false);
            // Optional: Reset chat after closing
            setTimeout(() => {
                setHistory([]);
                setCurrentStep('start');
            }, 300);
            return;
        }

        const nextStepData = SUPPORT_FLOW[nextStepId];
        const botMsg = { type: 'bot', ...nextStepData };

        setHistory(prev => [...prev, userMsg, botMsg]);
        setCurrentStep(nextStepId);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={styles.wrapper}>
            {/* Chat Window */}
            <div style={{
                ...styles.window,
                transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'all' : 'none',
            }}>
                <div style={styles.header}>
                    <span style={{ fontWeight: 'bold' }}>Customer Support</span>
                    <button onClick={toggleOpen} style={styles.closeBtn}>×</button>
                </div>
                <div style={styles.body}>
                    {history.map((msg, idx) => (
                        <div key={idx} style={{
                            ...styles.messageRow,
                            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            {msg.type === 'bot' && <div style={styles.botAvatar}>🎧</div>}
                            <div style={{
                                ...styles.bubble,
                                background: msg.type === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                borderRadius: msg.type === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {/* Options (only show for the latest bot message if it's the last one) */}
                    {history.length > 0 && history[history.length - 1].type === 'bot' && (
                        <div style={styles.optionsContainer}>
                            {history[history.length - 1].options?.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOptionClick(opt)}
                                    style={styles.optionBtn}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Floating Button */}
            <button onClick={toggleOpen} style={styles.fab} className="interactive">
                {isOpen ? '▼' : '🎧'}
            </button>
        </div>
    );
};

const styles = {
    wrapper: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    fab: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#646cff',
        color: 'white',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    window: {
        width: '300px',
        height: '400px',
        marginBottom: '10px',
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
    },
    header: {
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '1.5rem',
        cursor: 'pointer',
        lineHeight: 1,
    },
    body: {
        flex: 1,
        padding: '12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    messageRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
    },
    botAvatar: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#444',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.8rem',
    },
    bubble: {
        padding: '8px 12px',
        maxWidth: '80%',
        fontSize: '0.9rem',
        lineHeight: 1.4,
    },
    optionsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '5px',
        justifyContent: 'flex-start',
        paddingLeft: '32px', // Align with text (avatar width + gap)
    },
    optionBtn: {
        padding: '6px 12px',
        borderRadius: '16px',
        border: '1px solid #646cff',
        background: 'rgba(100, 108, 255, 0.1)',
        color: '#a5a9ff',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
    }
};

export default SupportWidget;
