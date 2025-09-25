import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Loader2 } from 'lucide-react';
import Button from './Button';
import { geminiClient, AIMessage, AIResponse } from '../lib/ai/geminiClient';

interface VoiceAssistantProps {
  onPaymentIntent?: (intent: any) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onPaymentIntent }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your EchoPay AI assistant. I can help you pay bills, buy airtime, send money, or check your balance. What would you like to do?',
      timestamp: new Date(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          handleQuery(finalTranscript);
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'aborted') {
          // Show error message
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sorry, I couldn\'t hear you clearly. Please try again or type your message.',
            timestamp: new Date(),
          }]);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  const handleQuery = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await geminiClient.query(text, 'voice-session');
      
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponse(response);

      // If there's a payment intent, notify parent
      if (response.intent && response.requiresConfirmation && onPaymentIntent) {
        onPaymentIntent(response.intent);
      }

    } catch (error) {
      console.error('AI query error:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTranscript('');
      setInputText('');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleQuery(inputText);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const isWebSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.role === 'assistant' && (
                <button
                  onClick={() => speakText(message.content)}
                  className="mt-2 text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
                >
                  <Volume2 className="h-3 w-3" />
                  Speak
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Live transcript */}
        {isListening && transcript && (
          <div className="flex justify-end">
            <div className="bg-blue-100 border-2 border-blue-300 px-4 py-2 rounded-2xl max-w-[80%]">
              <p className="text-sm text-blue-900">{transcript}</p>
              <p className="text-xs text-blue-600 mt-1">Listening...</p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {lastResponse?.suggestions && (
          <div className="flex justify-start">
            <div className="flex flex-wrap gap-2 max-w-[80%]">
              {lastResponse.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuery(suggestion)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleTextSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or use voice..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit(e);
                }
              }}
            />
          </div>

          {isWebSpeechSupported && (
            <Button
              type="button"
              variant={isListening ? 'danger' : 'secondary'}
              size="md"
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              className="flex-shrink-0"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim() || loading}
            className="flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {isListening && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Listening... Speak now
            </div>
          </div>
        )}

        {!isWebSpeechSupported && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            Voice input not supported in this browser
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;