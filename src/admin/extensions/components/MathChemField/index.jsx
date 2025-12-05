import React, { useState, useEffect, useRef } from 'react';
import { Field } from '@strapi/design-system';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MathChemRenderer from '../MathChemRenderer/index.jsx';

// Setup global polyfill for MathQuill
if (typeof window !== 'undefined') {
  window.global = window;
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
  }
  
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #32324d;
    margin-bottom: 8px;
  }
`;

const MathChemField = React.forwardRef(({ 
  name, 
  value, 
  onChange, 
  disabled, 
  error,
  required,
  intlLabel,
  label,
  description,
  ...props 
}, ref) => {
  
  const [latex, setLatex] = useState('');
  const [htmlContent, setHtmlContent] = useState(value || '');
  const [mathQuillLoaded, setMathQuillLoaded] = useState(false);
  const [EditableMathField, setEditableMathField] = useState(null);
  const [activeTab, setActiveTab] = useState('math');
  const mathFieldRef = useRef(null);
  
  // Load MathQuill dynamically
  useEffect(() => {
    loadMathQuill().then((mq) => {
      setEditableMathField(() => mq.EditableMathField);
      setMathQuillLoaded(true);
      console.log('✅ MathQuill loaded for richtext override');
    }).catch(err => {
      console.error('❌ Failed to load MathQuill:', err);
    });
  }, []);
  
  // Sync with prop value changes
  useEffect(() => {
    if (value !== htmlContent) {
      setHtmlContent(value || '');
    }
  }, [value]);
  
  const updateFieldValue = (newValue) => {
    setHtmlContent(newValue);
    
    // Method 1: Try onChange prop if available
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
      console.log('🎯 Called onChange prop for richtext field:', name);
      return;
    }
    
    // Method 2: Find React components in DOM and trigger state changes
    console.log('⚠️ onChange prop not available, trying React fiber approach for field:', name);
    
    setTimeout(() => {
      // Try to find the form container and trigger React state update
      const possibleContainers = [
        document.querySelector('form'),
        document.querySelector('[data-testid="form"]'),
        document.querySelector('.sc-bRKDuR'), // The form class we found
        document.querySelector('[class*="Form"]'),
        document.querySelector('[class*="form"]')
      ].filter(Boolean);
      
      let triggered = false;
      
      possibleContainers.forEach((container, i) => {
        console.log(`🔍 Checking container ${i}:`, container.className);
        
        // Get React fiber from DOM element
        const fiberKey = Object.keys(container).find(key => 
          key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
        );
        
        if (fiberKey && container[fiberKey]) {
          console.log('✅ Found React fiber:', fiberKey);
          
          // Try to find Formik or form state in the fiber tree
          let current = container[fiberKey];
          let depth = 0;
          
          while (current && depth < 20) {
            // Check if this is a Formik FormikProvider or similar
            if (current.memoizedProps) {
              const props = current.memoizedProps;
              
              // Look for Formik-like props
              if (props.values && props.setFieldValue && typeof props.setFieldValue === 'function') {
                console.log('🎯 Found Formik context! Calling setFieldValue');
                try {
                  props.setFieldValue(name, newValue);
                  triggered = true;
                  console.log('✅ Successfully called setFieldValue via React fiber');
                } catch (err) {
                  console.log('❌ Error calling setFieldValue:', err);
                }
                break;
              }
              
              // Look for other form state management
              if (props.onChange || props.onFieldChange) {
                console.log('🎯 Found onChange in props');
                try {
                  if (props.onChange) props.onChange({ target: { name, value: newValue } });
                  if (props.onFieldChange) props.onFieldChange(name, newValue);
                  triggered = true;
                } catch (err) {
                  console.log('❌ Error calling onChange from props:', err);
                }
              }
            }
            
            // Check state for form data
            if (current.memoizedState && !triggered) {
              // Look through state chain for form data
              let stateNode = current.memoizedState;
              while (stateNode) {
                if (stateNode.memoizedState && typeof stateNode.memoizedState === 'object') {
                  const state = stateNode.memoizedState;
                  if (state.values && typeof state.values === 'object') {
                    console.log('🎯 Found form values in state:', Object.keys(state.values));
                    // Try to directly modify the state (risky but might work)
                    if (state.values[name] !== newValue) {
                      state.values[name] = newValue;
                      console.log('✅ Updated form state directly');
                      
                      // Force React re-render by finding and calling setState or forceUpdate
                      try {
                        // Try to find the component instance and force update
                        let renderComponent = current;
                        while (renderComponent && !renderComponent.stateNode?.forceUpdate && renderComponent.return) {
                          renderComponent = renderComponent.return;
                        }
                        
                        if (renderComponent?.stateNode?.forceUpdate) {
                          console.log('🔄 Forcing component re-render');
                          renderComponent.stateNode.forceUpdate();
                        }
                        
                        // Also try to trigger a React state update event
                        const reactEvent = new CustomEvent('react:forceUpdate', {
                          detail: { component: current },
                          bubbles: true
                        });
                        container.dispatchEvent(reactEvent);
                        
                        // Try to mark the fiber as needing update
                        if (current.alternate) {
                          current.alternate.memoizedState = current.memoizedState;
                        }
                        
                        // Schedule React update
                        if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
                          const internals = window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
                          if (internals.ReactCurrentDispatcher && internals.ReactCurrentDispatcher.current) {
                            try {
                              // Force a re-render through React's internal scheduler
                              setTimeout(() => {
                                const updateEvent = new Event('input', { bubbles: true });
                                container.dispatchEvent(updateEvent);
                              }, 10);
                            } catch (e) {
                              console.log('React internal update failed:', e);
                            }
                          }
                        }
                        
                      } catch (err) {
                        console.log('❌ Error forcing re-render:', err);
                      }
                      
                      triggered = true;
                    }
                  }
                }
                stateNode = stateNode.next;
              }
            }
            
            current = current.return || current.child;
            depth++;
          }
        }
      });
      
      if (!triggered) {
        console.log('❌ Could not find React form state to update');
        
        // Fallback: Create a custom event that parent components might listen to
        const strapiEvent = new CustomEvent('strapi:richtext:change', {
          detail: { 
            fieldName: name, 
            value: newValue,
            timestamp: Date.now()
          },
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(strapiEvent);
        window.dispatchEvent(strapiEvent);
        
        // Also try dispatching on the form
        if (possibleContainers[0]) {
          possibleContainers[0].dispatchEvent(strapiEvent);
        }
        
        console.log('� Dispatched custom strapi:richtext:change event');
      }
      
    }, 50);
  };
  
  const insertLatexToHtml = () => {
    if (!latex.trim()) return;
    
    const mathHtml = `<span class="math-formula" data-latex="${latex}">\\(${latex}\\)</span>`;
    const newValue = htmlContent + mathHtml;
    updateFieldValue(newValue);
    setLatex('');
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
  
  const handleTextareaChange = (e) => {
    updateFieldValue(e.target.value);
  };

  return (
    <Field.Root error={error} name={name} required={required}>
      <Field.Label>
        {intlLabel?.defaultMessage || intlLabel || label || 'Rich Text Content (Math & Chemistry)'}
      </Field.Label>
      
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
              onChange={(mathField) => setLatex(mathField.latex())}
              mathquillDidMount={(mathField) => { mathFieldRef.current = mathField; }}
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
        </div>
        
        {/* HTML Content Section */}
        <div className="textarea-wrapper">
          <div className="section-title">📝 Content (HTML + Math)</div>
          <textarea
            className="html-textarea"
            value={htmlContent}
            onChange={handleTextareaChange}
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
});

MathChemField.displayName = 'MathChemField';

MathChemField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  intlLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default MathChemField;
