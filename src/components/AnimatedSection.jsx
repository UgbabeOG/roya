import React from 'react';

export default function AnimatedSection({ 
  children, 
  className = '', 
  style = {} 
}) {
  return (
    <div className={`animated-section ${className}`} style={style}>
      {children}
    </div>
  );
}

