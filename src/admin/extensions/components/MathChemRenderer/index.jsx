import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Dynamic import for KaTeX and mhchemparser
let katex = null;
let mhchemParser = null;

const loadLibraries = async () => {
  if (!katex) {
    katex = await import('katex');
    // Import CSS for KaTeX
    await import('katex/dist/katex.min.css');
  }
  if (!mhchemParser) {
    const mhchem = await import('mhchemparser');
    mhchemParser = mhchem.default || mhchem;
  }
  return { katex, mhchemParser };
};

const MathChemRenderer = ({ content }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderMathChem = async () => {
      if (!containerRef.current || !content) return;
      
      try {
        const { katex: katexLib, mhchemParser } = await loadLibraries();
        const container = containerRef.current;
        
        // Parse and render LaTeX formulas
        const mathFormulaRegex = /<span class="math-formula" data-latex="([^"]+)">([^<]+)<\/span>/g;
        let processedContent = content;
        
        // Replace math formulas with rendered KaTeX
        let match;
        while ((match = mathFormulaRegex.exec(content)) !== null) {
          const [fullMatch, latex] = match;
          try {
            let processedLatex = latex;
            
            // Check if it's a chemistry formula (contains \ce{})
            if (latex.includes('\\ce{')) {
              // Use mhchemparser to convert chemistry syntax to regular LaTeX
              try {
                processedLatex = mhchemParser.toTeX(latex);
              } catch (mhchemError) {
                console.warn('mhchemparser error:', mhchemError, 'keeping original:', latex);
              }
            }
            
            // Render LaTeX to HTML
            const renderedMath = katexLib.renderToString(processedLatex, {
              displayMode: false,
              throwOnError: false,
              trust: true, // Allow chemistry commands
              strict: false, // Be more lenient with unknown commands
            });
            processedContent = processedContent.replace(fullMatch, renderedMath);
          } catch (error) {
            console.warn('KaTeX render error:', error, 'for formula:', latex);
            // Keep original formula if render fails
            processedContent = processedContent.replace(fullMatch, `\\(${latex}\\)`);
          }
        }
        
        // Set the processed content
        container.innerHTML = processedContent;
        
        // Process inline LaTeX patterns like \(...\) or $...$
        const inlinePatterns = [
          { regex: /\\\(([^\\]+)\\\)/g, displayMode: false },
          { regex: /\$([^$]+)\$/g, displayMode: false },
          { regex: /\\\[([^\\]+)\\\]/g, displayMode: true },
          { regex: /\$\$([^$]+)\$\$/g, displayMode: true },
        ];
        
        inlinePatterns.forEach(pattern => {
          const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          const textNodes = [];
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }
          
          textNodes.forEach(textNode => {
            const text = textNode.textContent;
            if (pattern.regex.test(text)) {
              const parent = textNode.parentNode;
              const wrapper = document.createElement('span');
              
              let lastIndex = 0;
              let processedText = text;
              let match;
              pattern.regex.lastIndex = 0;
              
              while ((match = pattern.regex.exec(text)) !== null) {
                const [fullMatch, latex] = match;
                try {
                  let processedLatex = latex;
                  
                  // Process chemistry formulas
                  if (latex.includes('\\ce{')) {
                    try {
                      processedLatex = mhchemParser.toTeX(latex);
                    } catch (mhchemError) {
                      console.warn('mhchemparser inline error:', mhchemError);
                    }
                  }
                  
                  const renderedMath = katexLib.renderToString(processedLatex, {
                    displayMode: pattern.displayMode,
                    throwOnError: false,
                    trust: true,
                    strict: false,
                  });
                  processedText = processedText.replace(fullMatch, renderedMath);
                } catch (error) {
                  console.warn('KaTeX inline render error:', error, 'for:', latex);
                }
              }
              
              if (processedText !== text) {
                wrapper.innerHTML = processedText;
                parent.insertBefore(wrapper, textNode);
                parent.removeChild(textNode);
              }
            }
          });
        });
        
      } catch (error) {
        console.error('Math/Chem rendering error:', error);
        // Fallback: show original content
        containerRef.current.innerHTML = content;
      }
    };
    
    renderMathChem();
  }, [content]);

  return (
    <div 
      ref={containerRef}
      style={{
        fontSize: '16px',
        lineHeight: '1.6',
        '& .katex': {
          fontSize: '1em'
        }
      }}
    />
  );
};

MathChemRenderer.propTypes = {
  content: PropTypes.string.isRequired,
};

export default MathChemRenderer;
