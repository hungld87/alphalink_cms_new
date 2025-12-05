import React, { useRef, useEffect } from 'react';
import { Field } from '@strapi/design-system';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const EditorWrapper = styled.div`
  border: 1px solid #dcdce4;
  border-radius: 4px;
  padding: 8px;
  min-height: 200px;
  
  .math-input {
    width: 100%;
    min-height: 150px;
    padding: 8px;
    border: 1px solid #e3e9f3;
    border-radius: 4px;
    font-family: monospace;
    resize: vertical;
  }
  
  .preview {
    margin-top: 12px;
    padding: 12px;
    background: #f6f6f9;
    border-radius: 4px;
    min-height: 50px;
  }
  
  .toolbar {
    margin-bottom: 8px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .math-btn {
    padding: 4px 8px;
    background: #4945ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
      background: #3935d0;
    }
  }
`;

const SimpleMathEditor = ({
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
  
  // Access Formik context to update form directly
  let formik = null;
  try {
    formik = useFormikContext();
    console.log('✅ Formik context available:', { 
      hasSetFieldValue: !!formik?.setFieldValue,
      currentValue: formik?.values?.[name]
    });
  } catch (err) {
    console.warn('⚠️ No Formik context:', err.message);
  }
  
  console.log('SimpleMathEditor received:', { name, value, onChange: !!onChange, label });
  
  const textareaRef = useRef(null);
  const [localValue, setLocalValue] = React.useState(value || '');
  
  // Sync localValue when value prop changes from outside
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);
  
  const insertFormula = (formula) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newValue = before + formula + after;
    
    // Update both local state and form
    setLocalValue(newValue);
    
    if (formik?.setFieldValue) {
      formik.setFieldValue(name, newValue);
    } else if (onChange && typeof onChange === 'function') {
      onChange({ target: { name, value: newValue } });
    }
    
    // Set cursor position after inserted formula
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + formula.length;
    }, 0);
  };

  const mathButtons = [
    { label: 'x²', formula: '<sup>2</sup>' },
    { label: '√', formula: '<span class="math">√(x)</span>' },
    { label: '∫', formula: '<span class="math">∫</span>' },
    { label: 'Σ', formula: '<span class="math">Σ</span>' },
    { label: 'π', formula: '<span class="math">π</span>' },
    { label: '∞', formula: '<span class="math">∞</span>' },
    { label: '±', formula: '<span class="math">±</span>' },
    { label: '÷', formula: '<span class="math">÷</span>' },
    { label: '×', formula: '<span class="math">×</span>' },
    { label: '≤', formula: '<span class="math">≤</span>' },
    { label: '≥', formula: '<span class="math">≥</span>' },
    { label: '≠', formula: '<span class="math">≠</span>' },
    { label: 'Phân số', formula: '<div class="math-fraction"><span class="numerator">a</span><span class="denominator">b</span></div>' },
    { label: 'E=mc²', formula: '<p>E = mc<sup>2</sup></p>' },
  ];

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Try Formik first
    if (formik?.setFieldValue) {
      formik.setFieldValue(name, newValue);
      console.log('✅ Updated via Formik:', name, newValue);
    } else if (onChange && typeof onChange === 'function') {
      onChange({ target: { name, value: newValue } });
      console.log('✅ Updated via onChange:', name, newValue);
    } else {
      console.warn('⚠️ No way to update form state!');
    }
  };

  return (
    <Field.Root error={error} name={name} required={required}>
      {(intlLabel || label) && (
        <Field.Label>
          {intlLabel?.defaultMessage || intlLabel || label}
        </Field.Label>
      )}
      <EditorWrapper>
        <div className="toolbar">
          {mathButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              className="math-btn"
              onClick={() => insertFormula(btn.formula)}
              disabled={disabled}
              title={`Insert ${btn.label}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="math-input"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Nhập nội dung hoặc click các nút toán học ở trên để thêm công thức..."
        />
        {localValue && (
          <div className="preview">
            <strong>Preview:</strong>
            <div dangerouslySetInnerHTML={{ __html: localValue }} />
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

SimpleMathEditor.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  intlLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  attribute: PropTypes.object,
};

export default SimpleMathEditor;
