// File: src/App.jsx (Versi Chat UI)

import React, { useState, useRef, useEffect } from 'react';

// Ikon sederhana untuk tombol kirim dan avatar
const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
  </svg>
);

const UserAvatar = () => <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">U</div>;
const AiAvatar = () => <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-white">AI</div>;


// !!! JANGAN LUPA, GUNAKAN URL NGROK ANDA YANG MASIH AKTIF DAN DIAKHIRI DENGAN /generate-code!!!
const API_URL = "url ngrok/generate-code";


function App() {
  const [messages, setMessages] = useState([]); // Menyimpan histori chat
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fungsi untuk auto-scroll ke pesan terbaru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

      const data = await response.json();
      if (data.error) throw new Error(`Error from AI server: ${data.error}`);

      const aiMessage = { sender: 'ai', text: data.generated_code, isCode: true };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Error during fetch:", err);
      const errorMessage = { sender: 'ai', text: `Maaf, terjadi kesalahan: ${err.message}`, isCode: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 flex flex-col h-screen text-white font-sans">
      <header className="bg-gray-900 p-4 text-center shadow-md">
        <h1 className="text-xl font-semibold">Akcaya Photo AI Assistant</h1>
      </header>

      {/* Area Chat */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 my-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <AiAvatar />}

              <div className={`p-4 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                {msg.isCode ? (
                  <div className="relative">
                    <pre className="bg-gray-900 rounded-md p-3 overflow-x-auto text-sm">
                      <code>{msg.text}</code>
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded-md text-xs"
                    >
                      Salin
                    </button>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>

              {msg.sender === 'user' && <UserAvatar />}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 my-6 justify-start">
              <AiAvatar />
              <div className="p-4 rounded-lg max-w-lg bg-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Form */}
      <footer className="bg-gray-900 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik permintaan Anda di sini..."
            className="flex-1 bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg p-3 disabled:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;