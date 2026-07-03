import React, { useRef, useState } from 'react';

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    
    // Position of cursor within the card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates relative to card center (range -0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;

    // Angle configuration (tilted up to 15 degrees)
    const maxTilt = 15;
    const rotateX = (-normalizedY * maxTilt).toFixed(2);
    const rotateY = (normalizedX * maxTilt).toFixed(2);

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`);

    // Calculate glare angle and opacity
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    
    setGlareStyle({
      opacity: 0.4,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 80%)`
    });
  };

  const handleMouseLeave = () => {
    // Reset transitions and styling smoothly
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-panel"
      style={{
        position: 'relative',
        transform: transformStyle,
        transformStyle: 'preserve-3d', // Enables child translateZ layers
        transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease-out, border-color 0.2s ease-out',
        padding: '35px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'between',
        height: '100%',
        minHeight: '390px',
        cursor: 'pointer',
        overflow: 'visible', // Must be visible so 3D elements can float outwards
        border: '1px solid var(--glass-border)'
      }}
    >
      {/* Glare Shine Layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 3,
          borderRadius: '16px',
          transition: 'opacity 0.2s ease-out',
          ...glareStyle
        }} 
      />

      <div style={{ flex: 1, transformStyle: 'preserve-3d' }}>
        {/* Category Header with translateZ */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          transform: 'translateZ(30px)', // Pop out
          transition: 'transform 0.2s ease-out'
        }}>
          <span style={{ 
            fontSize: '0.82rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1.8px', 
            fontWeight: '700',
            color: 'var(--accent-cyan)' 
          }}>
            {project.category}
          </span>
          {project.impact && (
            <span style={{
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--accent-cyan)',
              boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)'
            }}>
              {project.impact}
            </span>
          )}
        </div>

        {/* Project Title with translateZ */}
        <h3 style={{ 
          fontSize: '1.65rem', 
          marginBottom: '15px', 
          lineHeight: '1.3',
          transform: 'translateZ(50px)', // High pop out
          transition: 'transform 0.2s ease-out',
          textShadow: '0 5px 15px rgba(0,0,0,0.3)'
        }}>
          {project.title}
        </h3>

        {/* Description with translateZ */}
        <p style={{ 
          color: 'var(--text-normal)', 
          fontSize: '0.94rem', 
          lineHeight: '1.65',
          marginBottom: '25px',
          transform: 'translateZ(20px)', // Low pop out
          transition: 'transform 0.2s ease-out'
        }}>
          {project.description}
        </p>
      </div>

      <div style={{ transformStyle: 'preserve-3d' }}>
        {/* Project Tags with translateZ */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          marginBottom: '25px',
          transform: 'translateZ(25px)',
          transition: 'transform 0.2s ease-out'
        }}>
          {project.tags && project.tags.map((tag, i) => (
            <span key={i} style={{
              background: 'rgba(161, 79, 255, 0.05)',
              border: '1px solid rgba(161, 79, 255, 0.12)',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '0.72rem',
              color: 'var(--text-normal)'
            }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button with translateZ */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: '700',
          color: 'var(--text-bright)',
          fontSize: '0.9rem',
          transform: 'translateZ(40px)', // High pop out
          transition: 'transform 0.2s ease-out'
        }}>
          <span style={{ textShadow: '0 3px 8px rgba(0,0,0,0.4)' }}>Explore Solution</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
