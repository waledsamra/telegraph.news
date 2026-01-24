
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', direction: 'rtl' }}>
          <h2 style={{ color: '#dc2626' }}>عذراً، حدث خطأ غير متوقع.</h2>
          <p>يرجى تحديث الصفحة أو المحاولة مرة أخرى.</p>
          <details style={{ marginTop: '20px', color: '#666', direction: 'ltr', textAlign: 'left' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px' }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Failed to locate root element");
}
