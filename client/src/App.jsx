import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientHome from './pages/ClientHome';
import AdminDashboard from './pages/AdminDashboard';
import CanvasBackground from './components/CanvasBackground';
import Chatbot from './components/Chatbot';

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
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
