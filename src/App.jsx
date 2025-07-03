import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TextareaAutosize from 'react-textarea-autosize';

// Ikon dan avatar
const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const UserAvatar = () => (
  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white flex-shrink-0">
    U
  </div>
);
const AiAvatar = () => (
  <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white flex-shrink-0">
    AI
  </div>
);

// Ganti URL ini dengan URL ngrok aktif kamu
const API_URL = "https://8394-35-229-181-95.ngrok-free.app/generate-code";

function App() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) throw new Error(`Error jaringan: ${response.statusText}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiMessage = { sender: 'ai', text: data.generated_code, isCode: true };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (err) {
      console.error(err);
      const errorMessage = { sender: 'ai', text: `Maaf, terjadi kesalahan: ${err.message}`, isCode: false };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 flex flex-col h-screen text-slate-200 font-sans">
      <header className="bg-slate-800/70 backdrop-blur-sm p-3 sm:p-4 text-center border-b border-slate-700 sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-wide">Code Generator Assistant</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <AiAvatar />}
              <div className={`p-3 sm:p-4 rounded-xl max-w-lg md:max-w-2xl break-words ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}>
                {msg.isCode ? (
                  // PERBAIKAN: Tambahkan 'overflow-x-auto' di sini
                  <div className="relative group overflow-x-auto">
                    <SyntaxHighlighter
                      language="jsx"
                      style={vscDarkPlus}
                      wrapLongLines={false}
                      customStyle={{
                        margin: 0,
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'rgb(15 23 42 / 0.5)',
                        // Kita tidak perlu overflow di sini lagi, karena sudah ditangani oleh parent
                      }}
                    >
                      {msg.text}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      className="absolute top-2 right-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-2 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      Salin
                    </button>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
              {msg.sender === 'user' && <UserAvatar />}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 justify-start">
              <AiAvatar />
              <div className="p-4 rounded-lg max-w-lg bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-slate-800/50 backdrop-blur-sm p-2 sm:p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end">
            <TextareaAutosize
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Jelaskan komponen yang Anda inginkan..."
              minRows={2}
              maxRows={6}
              className="bg-slate-700 rounded-lg p-3 pl-4 pr-14 w-full text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-tight"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-2.5 bottom-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-md p-2 disabled:bg-slate-600 disabled:opacity-50 transition-all"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;