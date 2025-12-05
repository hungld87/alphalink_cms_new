import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Field } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

// KaTeX renderer for preview
const MathRenderer = ({ content }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current && content) {
      const loadAndRender = async () => {
        try {
          // Dynamic import KaTeX
          const katex = await import('katex');
          const mhchemParser = await import('mhchemparser');
          
          // Import KaTeX CSS
          await import('katex/dist/katex.min.css');
          
          let processedContent = content;
          
          // Process chemistry formulas
          processedContent = processedContent.replace(/\\ce\{([^}]+)\}/g, (match, formula) => {
            try {
              const chemResult = mhchemParser.default.toTex(formula);
              return `\\ce{${chemResult}}`;
            } catch {
              return match;
            }
          });
          
          // Process math formulas
          processedContent = processedContent.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
            try {
              return katex.default.renderToString(formula, {
                displayMode: false,
                throwOnError: false,
                trust: (context) => context.command === '\\ce'
              });
            } catch {
              return match;
            }
          });
          
          // Process block math
          processedContent = processedContent.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
            try {
              return katex.default.renderToString(formula, {
                displayMode: true,
                throwOnError: false,
                trust: (context) => context.command === '\\ce'
              });
            } catch {
              return match;
            }
          });
          
          containerRef.current.innerHTML = processedContent;
        } catch (err) {
          console.error('Error rendering math:', err);
          containerRef.current.innerHTML = content;
        }
      };
      
      loadAndRender();
    }
  }, [content]);
  
  return <div ref={containerRef}>{content}</div>;
};

const MathChemInput = ({ 
  name, 
  value, 
  onChange, 
  disabled, 
  error,
  required,
  placeholder,
  maxLength,
  intlLabel,
  label,
  description,
  ...props 
}) => {
  const intl = useIntl();
  const field = useField(name);
  
  const [latex, setLatex] = useState('');
  const [htmlContent, setHtmlContent] = useState(field.value || value || '');
  const [mathQuillLoaded, setMathQuillLoaded] = useState(false);
  const [EditableMathField, setEditableMathField] = useState(null);
  const [activeTab, setActiveTab] = useState('math');
  const mathFieldRef = useRef(null);
  
  // Load MathQuill dynamically
  useEffect(() => {
    loadMathQuill().then((mq) => {
      setEditableMathField(() => mq.EditableMathField);
      setMathQuillLoaded(true);
      console.log('✅ MathQuill loaded for plugin field');
    }).catch(err => {
      console.error('❌ Failed to load MathQuill:', err);
    });
  }, []);
  
  // Sync with field value
  useEffect(() => {
    if (field.value !== htmlContent) {
      setHtmlContent(field.value || '');
    }
  }, [field.value]);
  
  const updateFieldValue = (newValue) => {
    setHtmlContent(newValue);
    // Use Strapi's field onChange - this should trigger Save/Publish buttons
    field.onChange({ target: { name, value: newValue, type: 'text' } });
    console.log('🎯 Updated field via plugin:', name, newValue.length, 'chars');
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
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    updateFieldValue(newValue);
  };

  return (
    <Field.Root error={field.error || error} name={name} required={required}>
      <Field.Label>
        {intlLabel?.defaultMessage || intlLabel || label || 'Math & Chemistry Content'}
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
            placeholder={placeholder || 'Nội dung bài toán (có thể gõ HTML hoặc insert công thức từ editor trên)...'}
            maxLength={maxLength}
          />
          {maxLength && (
            <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '4px' }}>
              {htmlContent.length}/{maxLength} characters
            </div>
          )}
        </div>
        
        {/* Preview */}
        {htmlContent && (
          <div className="preview">
            <h4>👁️ Preview (Math & Chemistry):</h4>
            <MathRenderer content={htmlContent} />
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

MathChemInput.defaultProps = {
  value: '',
  disabled: false,
  error: undefined,
  required: false,
  placeholder: '',
  maxLength: undefined,
  intlLabel: undefined,
  label: undefined,
  description: undefined,
};

MathChemInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  intlLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default MathChemInput;
