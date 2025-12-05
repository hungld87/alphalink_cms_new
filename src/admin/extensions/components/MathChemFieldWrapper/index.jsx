import React, { useRef, useEffect } from 'react';
import MathQuillEditor from '../MathQuillEditor/index.jsx';

const MathChemFieldWrapper = (props) => {
  const triggerChangeRef = useRef(null);
  
  // Custom onChange that forces form state update
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Call original onChange first
    if (props.onChange) {
      props.onChange(event);
    }
    
    // Force trigger a form state change by dispatching events
    setTimeout(() => {
      // Create and dispatch a more comprehensive change event
      const changeEvent = new Event('change', { bubbles: true });
      const inputEvent = new Event('input', { bubbles: true });
      
      // Try to find any parent form
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(changeEvent);
        form.dispatchEvent(inputEvent);
        console.log('🎯 Dispatched form events');
      }
      
      // Also dispatch on document
      document.dispatchEvent(new CustomEvent('strapiFormChange', {
        detail: { name, value },
        bubbles: true
      }));
      
    }, 100);
  };

  return (
    <MathQuillEditor
      {...props}
      onChange={handleChange}
    />
  );
};

export default MathChemFieldWrapper;
