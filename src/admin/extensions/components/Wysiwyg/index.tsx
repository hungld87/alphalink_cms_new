import React from 'react';

const Wysiwyg = (props: any) => {
  // Import Strapi's default Wysiwyg component dynamically
  const WysiwygComponent = React.lazy(() => 
    import('@strapi/strapi/admin').then((module: any) => ({
      default: module.Wysiwyg || module.WYSIWYG
    }))
  );

  // Custom TinyMCE config with MathType
  const editorConfig = {
    ...props.editorConfig,
    external_plugins: {
      tiny_mce_wiris: 'https://www.wiris.net/demo/plugins/tiny_mce/plugin.min.js',
    },
    toolbar: [
      'styles | bold italic underline | bullist numlist | link | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry',
    ],
    extended_valid_elements: 'math[*],maction[*],maligngroup[*],malignmark[*],menclose[*],merror[*],mfenced[*],mfrac[*],mglyph[*],mi[*],mlabeledtr[*],mlongdiv[*],mmultiscripts[*],mn[*],mo[*],mover[*],mpadded[*],mphantom[*],mroot[*],mrow[*],ms[*],mscarries[*],mscarry[*],msgroup[*],msline[*],mspace[*],msqrt[*],msrow[*],mstack[*],mstyle[*],msub[*],msup[*],msubsup[*],mtable[*],mtd[*],mtext[*],mtr[*],munder[*],munderover[*],semantics[*],annotation[*],annotation-xml[*]',
  };

  return <WysiwygComponent {...props} editorConfig={editorConfig} />;
};

export default Wysiwyg;
