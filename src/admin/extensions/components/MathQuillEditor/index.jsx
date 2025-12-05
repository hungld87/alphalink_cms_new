import React, { useState, useEffect, useRef } from 'react';
import { Field } from '@strapi/design-system';
import { useFormikContext, useField } from 'formik';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MathChemRenderer from '../MathChemRenderer/index.jsx';

// Setup global polyfill for MathQuill
if (typeof window !== 'undefined') {
  window.global = window;
  // Also ensure jQuery is available if MathQuill needs it
  if (!window.jQuery && !window.$) {
    // MathQuill might need jQuery stub
  }
}

// Dynamic import to ensure global is set first
let MathQuillComponents = null;
const loadMathQuill = async () => {
  if (!MathQuillComponents) {
    const mq = await import('react-mathquill');
    mq.addStyles();
    MathQuillComponents = mq;
  }
  return MathQuillComponents;
};

const EditorWrapper = styled.div`
  border: 1px solid #dcdce4;
  border-radius: 4px;
  padding: 12px;
  min-height: 200px;
  
  .math-field-wrapper {
    margin-bottom: 12px;
  }
  
  .math-field {
    padding: 8px;
    border: 1px solid #e3e9f3;
    border-radius: 4px;
    min-height: 60px;
    font-size: 18px;
  }
  
  .textarea-wrapper {
    margin-top: 12px;
  }
  
  .html-textarea {
    width: 100%;
    min-height: 100px;
    padding: 8px;
    border: 1px solid #e3e9f3;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
    resize: vertical;
  }
  
  .toolbar {
    margin-bottom: 12px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .tab-buttons {
    margin-bottom: 12px;
    display: flex;
    border-bottom: 1px solid #e3e9f3;
  }
  
  .tab-btn {
    padding: 8px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    
    &:hover {
      color: #4945ff;
    }
    
    &.active {
      color: #4945ff;
      border-bottom-color: #4945ff;
    }
  }
  
  .math-btn {
    padding: 6px 12px;
    background: #4945ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    
    &:hover {
      background: #3935d0;
    }
  }
  
  .preview {
    margin-top: 12px;
    padding: 12px;
    background: #f6f6f9;
    border-radius: 4px;
    min-height: 50px;
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #32324d;
    }
    
    .content {
      font-size: 16px;
    }
  }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #32324d;
    margin-bottom: 8px;
  }
`;

const MathQuillEditor = ({
  name,
  onChange,
  value = '',
  disabled = false,
  error,
  required = false,
  intlLabel,
  label,
  description,
  attribute,
  ...rest
}) => {
  
  // Simplified approach - don't rely on Formik context
  const [latex, setLatex] = useState('');
  const [htmlContent, setHtmlContent] = useState(value || '');
  const [mathQuillLoaded, setMathQuillLoaded] = useState(false);
  const [EditableMathField, setEditableMathField] = useState(null);
  const [activeTab, setActiveTab] = useState('math'); // 'math' or 'chem'
  const mathFieldRef = useRef(null);
  
  // Track if we've made changes to trigger save buttons
  const [hasChanges, setHasChanges] = useState(false);
  const hiddenInputRef = useRef(null);
  
  // Load MathQuill dynamically
  useEffect(() => {
    loadMathQuill().then((mq) => {
      setEditableMathField(() => mq.EditableMathField);
      setMathQuillLoaded(true);
      console.log('✅ MathQuill loaded');
    }).catch(err => {
      console.error('❌ Failed to load MathQuill:', err);
    });
  }, []);
  
  // Sync with prop value
  useEffect(() => {
    if (value !== undefined && value !== htmlContent) {
      setHtmlContent(value);
    }
  }, [value]);
  
  // Simple approach to trigger form changes through DOM events
  const triggerFormChange = (newValue) => {
    // Update hidden input and trigger its events
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = newValue;
      hiddenInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Create a proper DOM input event
    const event = new Event('input', { bubbles: true, cancelable: true });
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    
    // Try to find any form and input elements to trigger
    setTimeout(() => {
      // Method 1: Trigger on all form elements
      document.querySelectorAll('form').forEach(form => {
        // Find any input with our field name or similar
        const relatedInputs = form.querySelectorAll(`input[name*="${name}"], textarea[name*="${name}"], *[data-field-name="${name}"]`);
        
        relatedInputs.forEach(input => {
          // Set the value and trigger events
          if (input.type === 'hidden' || input.type === 'text' || input.tagName === 'TEXTAREA') {
            input.value = newValue;
            input.dispatchEvent(event);
            input.dispatchEvent(changeEvent);
          }
        });
        
        // Also trigger on the form itself
        form.dispatchEvent(changeEvent);
        form.dispatchEvent(event);
      });
      
      // Method 2: Global events that might be listened to by Strapi
      window.dispatchEvent(new CustomEvent('strapiFormUpdate', {
        detail: { field: name, value: newValue }
      }));
      
      // Method 3: Try to trigger on any React state management
      const strapiEvent = new CustomEvent('strapi:field:change', {
        detail: { name, value: newValue },
        bubbles: true
      });
      document.dispatchEvent(strapiEvent);
      
      console.log('🎯 Triggered comprehensive form change events for:', name);
    }, 50);
  };
  
  const updateFormValue = (newValue) => {
    setHtmlContent(newValue);
    setHasChanges(true);
    
    // Call the onChange prop if provided
    if (onChange && typeof onChange === 'function') {
      const syntheticEvent = {
        target: { 
          name, 
          value: newValue,
          type: 'richtext'
        },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      onChange(syntheticEvent);
      console.log('📤 Called onChange prop:', name, ':', newValue.substring(0, 50) + '...');
    }
    
    // Trigger comprehensive form change events
    triggerFormChange(newValue);
  };
  
  const insertLatexToHtml = () => {
    if (!latex.trim()) return;
    
    // Convert LaTeX to HTML with proper math rendering
    const mathHtml = `<span class="math-formula" data-latex="${latex}">\\(${latex}\\)</span>`;
    const newValue = htmlContent + mathHtml;
    updateFormValue(newValue);
    setLatex(''); // Clear latex input
  };
  
  const quickInserts = [
    // Math formulas
    { label: 'Phân số', latex: '\\frac{a}{b}', category: 'math' },
    { label: 'Căn bậc 2', latex: '\\sqrt{x}', category: 'math' },
    { label: 'Mũ', latex: 'x^{2}', category: 'math' },
    { label: 'Tích phân', latex: '\\int_{a}^{b}', category: 'math' },
    { label: 'Tổng', latex: '\\sum_{i=1}^{n}', category: 'math' },
    { label: 'Pi', latex: '\\pi', category: 'math' },
    { label: 'Alpha', latex: '\\alpha', category: 'math' },
    { label: 'Beta', latex: '\\beta', category: 'math' },
    { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'math' },
    { label: 'Limit', latex: '\\lim_{x \\to \\infty}', category: 'math' },
    
    // Chemistry formulas
    { label: 'H₂O', latex: '\\ce{H2O}', category: 'chem' },
    { label: 'CO₂', latex: '\\ce{CO2}', category: 'chem' },
    { label: 'H₂SO₄', latex: '\\ce{H2SO4}', category: 'chem' },
    { label: 'NaCl', latex: '\\ce{NaCl}', category: 'chem' },
    { label: 'Chemical Reaction', latex: '\\ce{A + B -> C + D}', category: 'chem' },
    { label: 'Equilibrium', latex: '\\ce{A + B <=> C + D}', category: 'chem' },
    { label: 'Ion', latex: '\\ce{SO4^2-}', category: 'chem' },
    { label: 'Benzene', latex: '\\ce{C6H6}', category: 'chem' },
    { label: 'pH', latex: '\\text{pH} = -\\log[\\ce{H+}]', category: 'chem' },
  ];
  
  const handleQuickInsert = (latexStr) => {
    setLatex(latexStr);
  };
  
  const handleFieldFocus = () => {
    setHasChanges(true);
  };
  
  const handleTextareaChange = (e) => {
    updateFormValue(e.target.value);
  };
  
  // Debug function to check form state
  const debugFormState = () => {
    console.log('🔍 FORM STATE DEBUG:', {
      currentHtmlContent: htmlContent,
      hasChanges,
      hasOnChange: !!onChange,
      name,
      value,
      // Try to find any form elements
      formsFound: document.querySelectorAll('form').length,
      relatedInputsFound: document.querySelectorAll(`input[name*="${name}"], textarea[name*="${name}"]`).length
    });
    
    // Also log what onChange gets called with
    if (onChange) {
      onChange({
        target: { name, value: htmlContent, type: 'richtext' }
      });
    }
  };

  return (
    <Field.Root error={error} name={name} required={required}>
      {(intlLabel || label) && (
        <Field.Label>
          {intlLabel?.defaultMessage || intlLabel || label}
        </Field.Label>
      )}
      
      {/* Hidden input to ensure Strapi tracks this field */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        value={htmlContent}
        onChange={() => {}} // Controlled by our component
      />
      
      <EditorWrapper>
        {/* LaTeX Editor Section */}
        <div className="math-field-wrapper">
          <div className="section-title">📐 Math & Chemistry Formula Editor (LaTeX)</div>
          
          {/* Tab buttons */}
          <div className="tab-buttons">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'math' ? 'active' : ''}`}
              onClick={() => setActiveTab('math')}
              disabled={disabled}
            >
              📐 Math
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'chem' ? 'active' : ''}`}
              onClick={() => setActiveTab('chem')}
              disabled={disabled}
            >
              🧪 Chemistry
            </button>
          </div>
          
          <div className="toolbar">
            {quickInserts
              .filter(item => item.category === activeTab)
              .map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="math-btn"
                  onClick={() => handleQuickInsert(item.latex)}
                  disabled={disabled}
                  title={item.latex}
                >
                  {item.label}
                </button>
              ))
            }
          </div>
          {!mathQuillLoaded ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading Math Editor...
            </div>
          ) : EditableMathField ? (
            <EditableMathField
              latex={latex}
              onChange={(mathField) => {
                setLatex(mathField.latex());
                handleFieldFocus(); // Mark as touched when latex changes
              }}
              mathquillDidMount={(mathField) => {
                mathFieldRef.current = mathField;
              }}
              style={{
                padding: '8px',
                border: '1px solid #e3e9f3',
                borderRadius: '4px',
                minHeight: '60px',
                fontSize: '18px',
              }}
            />
          ) : (
            <div style={{ padding: '20px', color: 'red' }}>
              Failed to load Math Editor
            </div>
          )}
          <button
            type="button"
            className="math-btn"
            onClick={insertLatexToHtml}
            disabled={disabled || !latex.trim()}
            style={{ marginTop: '8px' }}
          >
            ➕ Insert Formula to Content
          </button>
          
          {/* Debug button */}
          <button
            type="button"
            className="math-btn"
            onClick={debugFormState}
            style={{ 
              marginTop: '8px', 
              marginLeft: '8px', 
              background: '#28a745',
              fontSize: '11px'
            }}
            title="Debug form state in console"
          >
            🐛 Debug Form State
          </button>
        </div>
        
        {/* HTML Content Section */}
        <div className="textarea-wrapper">
          <div className="section-title">📝 Content (HTML + Math)</div>
          <textarea
            className="html-textarea"
            value={htmlContent}
            onChange={handleTextareaChange}
            onFocus={handleFieldFocus}
            onBlur={handleFieldFocus} // Also mark as touched on blur
            disabled={disabled}
            placeholder="Nội dung bài toán (có thể gõ HTML hoặc insert công thức từ editor trên)..."
          />
        </div>
        
        {/* Preview */}
        {htmlContent && (
          <div className="preview">
            <h4>👁️ Preview (Math & Chemistry):</h4>
            <MathChemRenderer content={htmlContent} />
          </div>
        )}
      </EditorWrapper>
      {description && (
        <Field.Hint>
          {description.defaultMessage || description}
        </Field.Hint>
      )}
      <Field.Error />
    </Field.Root>
  );
};

MathQuillEditor.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  intlLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  attribute: PropTypes.object,
};

export default MathQuillEditor;
