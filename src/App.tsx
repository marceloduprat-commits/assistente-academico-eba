import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Info, Mail, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from './services/gemini';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await geminiService.generateResponse(userMessage, history);
      setMessages([...newMessages, { role: 'model', content: response || '' }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'model', content: "Desculpe, ocorreu um erro técnico. Por favor, tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Pintura EBA</h1>
            <p className="text-xs text-gray-500">UFRJ - Assistente Acadêmico</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Info size={16} className="text-red-700" />
              Propósito
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Auxiliar alunos com regras, calendários e normas baseadas em documentos oficiais da Escola de Belas Artes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Links Úteis</h3>
            <a href="https://eba.ufrj.br/grade-horaria/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <ExternalLink size={14} /> Grade Horária
            </a>
            <a href="https://pintura.eba.ufrj.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <ExternalLink size={14} /> Site do Curso
            </a>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail size={14} />
            <span className="truncate">pintura@eba.ufrj.br</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-bottom border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
             <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center text-white font-bold">P</div>
             <span className="font-semibold">Pintura EBA</span>
          </div>
          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-500">Conversa com Assistente</span>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
            title="Limpar conversa"
          >
            <Trash2 size={18} />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-700 mb-2">
                <Bot size={32} />
              </div>
              <h2 className="text-xl font-semibold">Olá! Como posso ajudar hoje?</h2>
              <p className="text-sm text-gray-500">
                Sou o assistente acadêmico do curso de Pintura. Posso tirar dúvidas sobre TCC, inscrições, Galeria Macunaíma e muito mais.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full mt-4">
                {['Quais os prazos para TCC?', 'Como expor na Galeria Macunaíma?', 'O que é o RCS de Extensão?'].map((q) => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-sm p-3 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-red-700 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-red-700 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 rounded-tl-none'
                }`}>
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-gray'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5] to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Digite sua dúvida acadêmica..."
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-6 pr-14 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all resize-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2 bg-red-700 text-white rounded-xl hover:bg-red-800 disabled:opacity-50 disabled:hover:bg-red-700 transition-colors shadow-md"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest">
            Baseado em documentos oficiais da Escola de Belas Artes - UFRJ
          </p>
        </div>
      </main>
    </div>
  );
}
