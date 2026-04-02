import React from 'react';

interface AuthScreenProps {
  onLoginGooglePrimary: () => void;
  onLoginAnonymous: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginGooglePrimary, onLoginAnonymous }) => {
  return (
    <div className="auth-screen">
      <div className="auth-container glassmorphism">
        <div className="auth-header">
          <h1 className="gradient-text">Mindscape</h1>
          <p>クラウドで同期する次世代マインドマップ</p>
        </div>
        
        <div className="auth-actions">
          <button className="base-button google-btn" onClick={onLoginGooglePrimary}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </button>
          
          <div className="divider">
            <span>または</span>
          </div>

          <button className="base-button ghost-button" onClick={onLoginAnonymous}>
            アカウントなしで試す
          </button>
        </div>
        
        <p className="auth-footer">
          iOSアプリ版ともデータが自動で同期されます。
        </p>
      </div>

      <style>{`
        .auth-screen {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #1a1a2e 0%, #16213e 100%);
          color: white;
        }
        .auth-container {
          padding: 3rem;
          border-radius: 24px;
          text-align: center;
          width: 90%;
          max-width: 400px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .auth-header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }
        .auth-header p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
        }
        .auth-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .base-button {
          height: 54px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
        }
        .google-btn {
          background: white;
          color: #1a1a2e;
        }
        .google-btn:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        .ghost-button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .ghost-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .divider {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.8rem;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 1rem;
        }
        .auth-footer {
          margin-top: 2rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .gradient-text {
          background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;
