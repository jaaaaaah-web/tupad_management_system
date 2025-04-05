"use client"

import React from 'react';

const PrintButton = () => {
  const handlePrint = () => {
    // Add custom print CSS
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printableArea, #printableArea * {
          visibility: visible;
        }
        #printableArea {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .printButtonContainer {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Trigger browser print dialog
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  return (
    <button 
      onClick={handlePrint} 
      style={{
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
    >
      Print Payout Details
    </button>
  );
};

export default PrintButton;