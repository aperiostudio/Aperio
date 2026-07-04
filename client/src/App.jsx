import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CanvasBackground from './components/CanvasBackground';
import Chatbot from './components/Chatbot';
import ClientHome from './pages/ClientHome';

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Router>
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
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#05020c',
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.85rem',
                letterSpacing: '1px'
              }}>
                LOADING OPERATING DESK...
              </div>
            }>
              <AdminDashboard />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
