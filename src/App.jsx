import ChatInterface from './components/ChatInterface';
import Background3D from './components/Background3D';
import LoginPage from './components/LoginPage';
import SupportWidget from './components/SupportWidget';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogin = (name) => {
    setUserName(name || 'User');
    setIsLoggedIn(true);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <Background3D isDarkMode={isDarkMode} />
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
          <LoginPage onLogin={handleLogin} />
        ) : (
          <ChatInterface onLogout={() => setIsLoggedIn(false)} userName={userName} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        )}
      </div>
      <SupportWidget />
    </>
  );
}

export default App;
