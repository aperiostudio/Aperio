import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CanvasBackground from './components/CanvasBackground';
import Chatbot from './components/Chatbot';

const ClientHome = React.lazy(() => import('./pages/ClientHome'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

const LoadingSpinner = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#05020c',
    gap: '20px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(161, 79, 255, 0.1)',
      borderTopColor: 'var(--accent-purple)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>LOADING EXPERIENCE...</span>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <CanvasBackground />
                <ClientHome />
                <Chatbot />
              </>
            } 
          />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
