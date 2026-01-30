import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function Docprep() {
  return (
    <ProjectDetail 
      title="docprep"
      seoTitle="docprep - Microsoft Office Plaintext Extractor by bicrick"
      seoDescription="docprep by bicrick (Patrick Brown) - Desktop application that extracts Microsoft Office documents into plaintext for AI-ready document processing. Built with PyWebView and React."
      seoKeywords="bicrick, Patrick Brown, docprep, Microsoft Office, plaintext extractor, AI documents, PyWebView, React"
      seoUrl="https://bicrick.com/projects/docprep"
      seoImage="https://bicrick.com/images/docprep/docprep-1200x600.png"
    >
      <img 
        src={`${process.env.PUBLIC_URL}/images/docprep/docprep-1200x600.png`} 
        alt="Docprep" 
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        A plaintext extractor for Microsoft Office documents
      </p>
      
      <h2>/ how it started</h2>
      
      <p>
        It was Thanksgiving 2025. I was finishing up my master's in AI from UT Austin and visiting home for the holiday. I'd been using Cursor and other AI tools at work for a while, and my dad was curious about what I could actually build with them. He works a corporate job where the leadership had been pushing hard on AI adoption - plenty of external vendors promising to build magical agents for every workflow. Most of it was just confetti and nonsense.
      </p>

      <p>
        So I showed him what Cursor could actually do. Working in the financial sector, he deals with models, pitch decks, reports - the usual corporate toolkit. I told him I thought we could use Cursor to help with a lot of that work. To prove it, we sat down and built a presentation from a giant file tree of company documents.
      </p>

      <p>
        It worked. But there was a catch.
      </p>

      <p>
        The workflow I was using involved Python scripts and various extraction libraries to pull data from PowerPoint, Word, Excel, and PDF files. It wasn't something a non-coder could replicate. And if this was going to be useful for people like my dad, it needed to work without writing code.
      </p>

      <h2>/ the real problem</h2>
      
      <p>
        The corporate world still lives in Microsoft Office. While developers work with clean text files and structured data, corporate documents are buried in formatting noise. A PowerPoint presentation can be over a gigabyte in size when the actual information inside is less than 100 kilobytes. These files aren't AI-ready - they're bloated with formatting, animations, embedded objects, and metadata that LLMs struggle to parse.
      </p>

      <img 
        src={`${process.env.PUBLIC_URL}/images/docprep/docprep-compression.png`} 
        alt="Doc Prep Compression Visualization" 
        style={{ width: '100%', marginTop: '1.5rem', marginBottom: '0.5rem' }}
      />
      <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Docprep mirrors your file tree structure while extracting documents into plain text, dramatically reducing file sizes and making content AI-readable
      </p>

      <p>
        This bloat is a fundamental barrier to AI adoption in enterprise settings. If the tools can't even digest the documents, they can't help you work with them.
      </p>

      <h2>/ the solution</h2>
      
      <p>
        Docprep extracts all that bloated Office data into plain text while preserving your original file tree structure. It creates a mirrored directory where every PowerPoint, Word doc, Excel sheet, and PDF has been converted to clean, readable text.
      </p>

      <p>
        Why mirror the structure? Because tools like Cursor create vector databases to semantically index your codebase. When you have a mirrored file tree of plain text documents, Cursor can do the same thing with your corporate documents. It indexes everything, and when you ask it to "create a visualization of my Q1 reports," it can find the right files, extract the data, build a pandas dataframe, and visualize it with seaborn.
      </p>

      <p>
        Context windows are limited. By keeping documents as plain text in a structured file tree, we only pull in the relevant context when needed. It's efficient and it actually works.
      </p>

      <h2>/ building it</h2>
      
      <p>
        When I started building this, I quickly realized that trust was the biggest barrier. People don't want to upload their company documents to a website - even if the extraction happens entirely in the browser, there's no way to prove that information isn't being sent somewhere. Corporate documents contain sensitive financial data, strategic plans, and confidential information. The tool had to be completely local.
      </p>

      <p>
        So I built it as a desktop application using PyWebView. The architecture is straightforward: a Python backend handles all the document extraction, wrapped in a PyWebView container that renders a React frontend. I used shadcn components for the UI to keep things clean and functional. The minimalist design philosophy was intentional - this is a utility tool, not a product that needs flashy features.
      </p>

      <p>
        Nothing you process with Docprep ever leaves your machine. The extraction happens entirely within the Python backend, the results are passed to the frontend for display, and that's it. No storage, no telemetry, no cloud processing. Once you run an extraction, you get a mirrored folder structure with all your documents converted to plain text, ready to be indexed by tools like Cursor.
      </p>

      <p>
        It's still a work in progress, but the core architecture solves the trust problem while keeping the workflow simple.
      </p>

      <h2>/ what i learned</h2>
      
      <p>
        The gap between how developers work and how corporate teams work is massive. Developers have been working with rich, structured data for decades. Corporate documents are the opposite - they're surrounded in bloat, and that formatting overhead is actively preventing AI from being useful.
      </p>

      <p>
        I also learned that AI agents for creating and modifying Office documents aren't where they need to be yet. Cursor can help you outline a PowerPoint or make small edits to a CSV, but the existing MCPs for manipulating complex Excel sheets or generating formatted presentations are lacking. This is why tools like Microsoft Copilot haven't seen the explosive adoption everyone predicted - the productivity gains just aren't there yet.
      </p>

      <p>
        There's a real opportunity here. The corporate world is sitting on mountains of data that could be useful, but it's locked inside formats that modern AI tools struggle with. Docprep is a step toward unlocking that.
      </p>

      <h2>/ update: january 29th, 2026</h2>
      
      <p>
        Two months after launching docprep, Anthropic released Claude Cowork with built-in support for extracting and working with Microsoft Office documents directly. The extraction happens at runtime, eliminating the need for preprocessing entirely. But more importantly, Claude Cowork exists within the Claude application itself - a chat interface where non-technical users can ask questions and get answers without ever touching code. docprep required people to use Cursor, export plain text, and work in a developer environment. Claude Cowork is just a conversation. For the vast majority of corporate workers who don't code, that's a far more complete solution.
      </p>

      <p>
        Even though only a small office was able to use docprep before it became obsolete, I learned something valuable: the AI landscape moves fast, and foundation model providers will eventually build first-party solutions to problems that seem like business opportunities today.
      </p>

      <p>
        But here's what made it worth building anyway.
      </p>

      <p>
        The process of taking docprep from concept to a deployed desktop application taught me things I couldn't have learned otherwise. I worked through the entire pipeline: aesthetic design, architecting a PyWebView desktop app, building DMG and EXE installers, getting the application notarized and code-signed so it doesn't trigger malware warnings on user machines. These weren't things I knew how to do when I started - they were problems I had to solve as they came up.
      </p>

      <p>
        <a href="https://docprep.site" target="_blank" rel="noopener noreferrer">try docprep</a>
      </p>
    </ProjectDetail>
  );
}

export default Docprep;
