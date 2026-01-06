import ChatInterface from './components/ChatInterface';
import Background3D from './components/Background3D';
import LoginPage from './components/LoginPage';
import SupportWidget from './components/SupportWidget';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <Background3D />
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {!isLoggedIn ? (
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <ChatInterface onLogout={() => setIsLoggedIn(false)} />
        )}
      </div>
      <SupportWidget />
    </>
  );
}

export default App;
