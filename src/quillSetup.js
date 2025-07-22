// src/quillSetup.js
import Quill from 'quill';
import SyntaxModule from 'quill/modules/syntax';
import hljs from 'highlight.js';

if (typeof window !== 'undefined' && !window.hljs) {
  window.hljs = hljs;
}
if (!Quill.imports['modules/syntax']) {
  Quill.register('modules/syntax', SyntaxModule);
}
