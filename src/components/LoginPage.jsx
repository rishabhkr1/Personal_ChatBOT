import { useState, useRef, useEffect } from 'react';

const LoginPage = ({ onLogin }) => {
    // Pre-filled credentials as requested for easy access
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showSignupOptions, setShowSignupOptions] = useState(false);

    // Lamp Drag Logic
    const [isDragging, setIsDragging] = useState(false);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        startPosRef.current = {
            x: e.clientX - dragPos.x,
            y: e.clientY - dragPos.y
        };
        // Disable text selection while dragging
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startPosRef.current.x;
            const deltaY = e.clientY - startPosRef.current.y;

            // Limit drag radius
            setDragPos({ x: deltaX, y: deltaY });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragPos({ x: 0, y: 0 }); // Snap back
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        // Hardcoded credentials
        if (username === 'admin' && password === 'password123') {
            setIsUnlocking(true);
            // Wait for animation
            setTimeout(() => {
                onLogin(username);
            }, 1000);
        } else {
            setError('Invalid credentials');
        }
    };

    // Calculate rotation and length based on dragPos
    // We assume the pivot point is roughly at (0, 0) of the lamp wrapper
    const wireLength = Math.sqrt(dragPos.x * dragPos.x + (150 + dragPos.y) * (150 + dragPos.y));
    const angle = Math.atan2(dragPos.x, 150 + dragPos.y) * (180 / Math.PI);

    // Lamp Component
    const Lamp = () => (
        <div
            className="lamp-wrapper"
            style={{
                // Stop swinging while dragging
                animation: isDragging ? 'none' : 'swing 3s ease-in-out infinite alternate',
                transform: isDragging
                    ? `translateX(-50%) rotate(${Math.atan2(dragPos.x, 150) * 0.5}rad)` // Simplified rotation for wrapper
                    : undefined,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            <div
                className="lamp-wire"
                style={{
                    height: `${isDragging ? wireLength : 150}px`,
                    transform: isDragging ? `rotate(${-angle * 0.5}deg)` : 'none', // Counter-rotate wire slightly
                    transition: isDragging ? 'none' : 'height 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
                }}
            ></div>
            <div
                className="lamp-bulb"
                onMouseDown={handleMouseDown}
                style={{
                    transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
                }}
            ></div>
            <div
                className="lamp-light"
                style={{
                    transform: `translate(${dragPos.x}px, ${dragPos.y}px) translateX(-50%)`,
                    transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
                }}
            ></div>
        </div>
    );

    const SignupModal = () => {
        if (!showSignupOptions) return null;

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                    animation: 'fadeIn 0.3s ease'
                }}
                onClick={() => setShowSignupOptions(false)}
            >
                <div
                    style={{
                        background: 'linear-gradient(145deg, #1e1e1e, #121212)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '40px',
                        borderRadius: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                        textAlign: 'center',
                        position: 'relative',
                        animation: 'modalSlideUp 0.4s ease'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <style>{`
                        @keyframes modalSlideUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        .signup-btn {
                            width: 100%;
                            padding: 12px;
                            margin-bottom: 10px;
                            border-radius: 8px;
                            border: 1px solid #333;
                            background: #222;
                            color: #fff;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        }
                        .signup-btn:hover {
                            background: #333;
                            border-color: #00ffff;
                        }
                    `}</style>
                    <h2 style={{ marginBottom: '20px', color: '#fff' }}>Join growGpt</h2>
                    <button className="signup-btn">Continue with Google</button>
                    <button className="signup-btn">Continue with GitHub</button>
                    <button className="signup-btn" style={{ background: '#00ffff', color: '#000', fontWeight: 'bold' }}>Sign up with Email</button>
                    <button
                        onClick={() => setShowSignupOptions(false)}
                        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="login-wrapper" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Signup Tab */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 100
            }}>
                <button
                    onClick={() => setShowSignupOptions(true)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '10px 25px',
                        borderRadius: '30px',
                        color: '#fff',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.borderColor = '#00ffff';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Sign-up for free
                </button>
            </div>

            <SignupModal />

            {/* Hanging Lamp */}
            <Lamp />

            {/* Chains */}
            <div className="chain chain-left"></div>
            <div className="chain chain-right"></div>

            {/* Login Card */}
            <div className={`login-container ${isUnlocking ? 'shake-unlock' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '400px',
                padding: '3rem 2rem 2rem 2rem',
                borderRadius: '24px', // Softer corners
                background: 'rgba(26, 26, 26, 0.6)', // More transparent
                backdropFilter: 'blur(20px)', // Strong glass effect
                border: '1px solid rgba(255, 255, 255, 0.1)', // Thinner, lighter border
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                color: '#e0e0e0',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10,
                marginTop: '100px',
                transition: 'all 0.3s ease'
            }}>
                {/* Iron Texture Overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }}></div>

                <h2 style={{
                    marginBottom: '1.5rem',
                    color: '#888',
                    textShadow: '0 1px 0 #fff',
                    fontFamily: 'Courier New, monospace',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    borderBottom: '2px solid #444',
                    paddingBottom: '10px',
                    width: '100%'
                }}>
                    SIGN-IN
                </h2>

                <form onSubmit={handleSubmit} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="default: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                            style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="password"
                            placeholder="default: password123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                        />
                    </div>
                    {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'monospace' }}>[ERROR]: {error}</p>}

                    <button type="submit" className="lock-button">
                        <span style={{ fontSize: '1.5rem' }}>
                            {isUnlocking ? '🔓' : '🔒'}
                        </span>
                        <span style={{ marginLeft: '10px' }}>
                            {isUnlocking ? 'SIGNING IN...' : 'SIGN-IN'}
                        </span>
                    </button>
                </form>

                <p
                    onClick={() => setShowSignupOptions(true)}
                    style={{
                        marginTop: '1.5rem',
                        fontSize: '0.9rem',
                        color: '#00ffff',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    New to growGpt? Click here to sign-up
                </p>

                <div
                    onClick={() => {
                        // Toggle logic handled inline or via separate state if preferred, 
                        // but here we just toggle the *display* text.
                        // For a cleaner approach, let's use a local state.
                    }}
                    style={{
                        marginTop: '2rem',
                        fontSize: '0.8rem',
                        color: '#666',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        transition: 'color 0.3s'
                    }}
                    className="owner-footer"
                >
                    <OwnerFooter />
                </div>
            </div>
        </div>
    );
};

const OwnerFooter = () => {
    const [showOwner, setShowOwner] = useState(false);
    return (
        <span onClick={() => setShowOwner(!showOwner)} style={{ borderBottom: '1px dotted #555' }}>
            {showOwner ? 'Made by Rishabh' : 'Owner Details'}
        </span>
    );
};

export default LoginPage;
