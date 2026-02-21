
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const SetupGuide = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#08080e',
    color: 'white',
    padding: '40px',
    textAlign: 'center',
    fontFamily: 'Tajawal, sans-serif'
  }}>
    <div style={{
      background: 'rgba(99, 102, 241, 0.1)',
      padding: '30px',
      borderRadius: '30px',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      maxWidth: '600px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</div>
      <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#6366f1', marginBottom: '15px' }}>مرحباً بك في إبداع برو</h1>
      <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '25px' }}>
        لتبدأ العمل، يرجى إضافة مفاتيح الربط في إعدادات <b>Netlify / Amplify</b> (Environment variables).<br />
        هذه الخطوة ضرورية لتشغيل الذكاء الاصطناعي وقاعدة البيانات.
      </p>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '20px',
        borderRadius: '15px',
        textAlign: 'left',
        direction: 'ltr',
        fontSize: '0.85rem',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ color: '#818cf8', fontWeight: 'bold', marginBottom: '5px' }}># المطلوب في إعدادات النشر:</div>
        <code style={{ color: '#f8fafc' }}>
          VITE_GEMINI_API_KEY=AIza...<br />
          VITE_SUPABASE_URL=https://xxx.supabase.co<br />
          VITE_SUPABASE_ANON_KEY=eyJ...
        </code>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '30px',
          padding: '15px 40px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '15px',
          cursor: 'pointer',
          fontWeight: '900',
          boxShadow: '0 10px 20px rgba(99,102,241,0.3)',
          transition: 'all 0.3s'
        }}
      >
        تحديث الصفحة بعد الإضافة
      </button>
    </div>
    <p style={{ marginTop: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>
      EBDAA PRO INTELLIGENT SYSTEMS © 2025
    </p>
  </div>
);

// Check config using Vite's import.meta.env (VITE_ prefix required)
const checkConfig = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return apiKey && apiKey.length > 10 && supabaseUrl && supabaseUrl.includes('supabase.co');
};

if (checkConfig()) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(<SetupGuide />);
}
