import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function Notepadable() {
  return (
    <ProjectDetail
      title="notepadable"
      date="March 2026"
      linkHref="https://notepadable.com"
      linkLabel="try here"
      abstract="A text editor that lives entirely in the URL. Share a link, share the doc. No server, no accounts, no upload. The document is the URL."
      seoTitle="notepadable - URL-Encoded Text Editor by bicrick"
      seoDescription="notepadable by bicrick (Patrick Brown) - Minimalist text editor that encodes your document into the URL. No server, no database. Share a link, share the doc. Built with TypeScript and CodeMirror 6."
      seoKeywords="bicrick, Patrick Brown, notepadable, text editor, URL encoding, markdown, PWA, CodeMirror, TypeScript"
      seoUrl="https://bicrick.com/projects/notepadable"
      seoImage="https://bicrick.com/images/notepadable/notepadable-logo.png"
    >
      <img
        src={`${process.env.PUBLIC_URL}/images/notepadable/notepadable-header.gif`}
        alt="notepadable"
        width="1200"
        height="600"
        style={{ width: '66.67%', maxWidth: '100%', display: 'block', margin: '0 auto 0.5rem' }}
      />
      <p className="project-caption">
        A minimalist text editor that encodes your entire document into the URL
      </p>

      <h2>/ inspired by</h2>
      
      <p>
        <a href="https://github.com/antonmedv/textarea" target="_blank" rel="noopener noreferrer">textarea.my</a> by Anton Medvedev. A minimalist text editor that lives entirely in the browser and stores everything in the URL hash. I found the implementation incomplete. Could we fit more text in a URL? Add encryption? Use a proper editor with Markdown and syntax highlighting? This project takes the same core idea and rebuilds it.
      </p>

      <h2>/ how it started</h2>
      
      <p>
        I wanted a way to share text without uploading it anywhere. Paste a note, copy a link, send it. The recipient gets exactly what you wrote. No accounts, no servers, no database. The idea is simple: put the document in the URL hash so it never touches the server.
      </p>

      <h2>/ the solution</h2>
      
      <p>
        Everything you type is compressed and stored in the URL hash fragment. The hash never hits the server. The static HTML and JavaScript decompress it client-side. Share a link and the recipient sees exactly what you wrote. Your text never touches a server. It works offline as a PWA. You can deploy it anywhere that serves static files.
      </p>

      <img 
        src={`${process.env.PUBLIC_URL}/images/notepadable/notepadable-compression-pipeline.png`} 
        alt="Flow from input text through dictionary lookup, variable-length encoding, bitstream packing, to compressed base64 output" 
        width="3892"
        height="5032"
        style={{ width: '100%', height: 'auto', marginTop: '1.5rem', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Hybrid compression: dictionary lookup, variable-length codes, bit packing, then onward to lz-string and URL-safe encoding
      </p>

      <p>
        The app uses a hybrid compression pipeline to squeeze roughly 2x more text into a URL than standard deflate + base64. First, dictionary encoding: the 4,096 most common English words are mapped to 12-bit indices. Since these words cover around 95% of typical English prose, most text compresses dramatically before general-purpose compression even begins. Then lz-string compresses the output, optimized for short strings and URL-safe encoding. The result: roughly 600 to 1,200 words fit in a 2,000-character URL, the universal safe limit for sharing across platforms.
      </p>

      <p>
        Documents can be shared with a password. The encryption is entirely client-side using the Web Crypto API: AES-256-GCM for authenticated encryption, PBKDF2 with 100,000 iterations to derive the key from the password, and a random salt and IV for every encryption. A wrong password does not produce garbled output; decryption simply fails. The encrypted payload lives in the URL hash, same as unencrypted documents. The server never sees the password or the plaintext. For encrypted links, the <code>/raw</code> API accepts the password as a <code>?p=</code> query parameter so scripts can fetch decrypted content when needed.
      </p>

      <h2>/ the /raw API and LLM workflows</h2>
      
      <p>
        Any notepadable link can be turned into a plain-text endpoint. Take the hash that follows <code>/app#</code> and pass it to <code>/raw/</code>. The server decompresses it and returns <code>Content-Type: text/plain</code>. No HTML wrapper. Curl-able, script-friendly.
      </p>

      <p>
        This is where it gets useful for LLMs and skills. An AI agent or Cursor skill can fetch the content of a notepadable link by curling the <code>/raw</code> URL. No file hosting, no API keys, no auth layer. Write your prompt, instructions, or context in the editor, copy the link, and pass it to a skill that fetches the text. The document is the URL. Same idea for CI pipelines, shell scripts, and automation: a notepadable link is a portable, self-contained text blob. For encrypted documents, append <code>?p=yourpassword</code> to the raw URL.
      </p>

      <h2>/ building it</h2>
      
      <p>
        Built with TypeScript and CodeMirror 6. CodeMirror gives you a real editor: syntax highlighting, line numbers, and a solid editing experience. The app is a PWA so it works offline. The whole thing is static. No backend, no build step on the server. Deploy to Vercel, Netlify, Cloudflare Pages, or any static host.
      </p>

      <h2>/ what i learned</h2>
      
      <p>
        Compression is a rabbit hole. Dictionary encoding alone can cut typical English text by half before you even run a general-purpose compressor. The tradeoff is complexity: you need to ship the dictionary, handle edge cases, and make sure the encoding is reversible. For URL-based storage, every character counts. The 2,000-character limit is real. Slack, Discord, and most platforms truncate or break longer URLs. Designing around that constraint forces you to think about what actually matters in the payload.
      </p>

      <p>
        Client-side encryption without a backend is possible but has limits. There is no rate limiting. The strength of the encryption depends entirely on the password. A short or common password is vulnerable to offline brute-force. For sensitive documents, that matters. For quick shared notes, it is usually fine.
      </p>

      <p>
        <a href="https://notepadable.com" target="_blank" rel="noopener noreferrer">try notepadable</a>
        {' | '}
        <a href="https://github.com/bicrick/text-area" target="_blank" rel="noopener noreferrer">view source code</a>
      </p>
    </ProjectDetail>
  );
}

export default Notepadable;
