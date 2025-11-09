import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { queryAI, type ChatMessage, type AIResponse } from "@/lib/gemini";
import { toast } from "sonner";
import properties from "@/data/properties.json";

interface AIChatProps {
  className?: string;
  onClose?: (messages: ChatMessage[]) => void;
  initialMessages?: ChatMessage[];
}

const AIChat = ({ className, onClose, initialMessages }: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : [{
          role: 'assistant',
          content: "Hi! I'm your AI real estate assistant powered by Gemini. Ask me anything about properties, market trends, or risks. I'll verify information from multiple sources and provide trust-scored answers.",
          timestamp: new Date().toISOString(),
        }]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClose = () => {
    onClose?.(messages);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simple heuristic filtering to reduce context and improve relevance
      const q = userMessage.content.toLowerCase();
      const stateTokens = [
        ['texas', 'tx'], ['california', 'ca'], ['new york', 'ny'], ['florida', 'fl'], ['illinois', 'il'],
        ['washington', 'wa'], ['massachusetts', 'ma'], ['arizona', 'az'], ['colorado', 'co'], ['utah', 'ut'],
        ['georgia', 'ga'], ['north carolina', 'nc'], ['ohio', 'oh'], ['pennsylvania', 'pa'], ['nevada', 'nv'],
        ['oregon', 'or'], ['missouri', 'mo'], ['tennessee', 'tn'], ['maryland', 'md'], ['minnesota', 'mn'],
      ];
      const matchedStates = stateTokens
        .filter(([name, abbr]) => q.includes(name) || q.split(/\b/).includes(abbr))
        .flat();

      const priceMatch = q.match(/\$?\s*([\d,.]+)\s*(m|million|b|billion)?/i);
      let priceThreshold: number | null = null;
      if (priceMatch) {
        const base = parseFloat(priceMatch[1].replace(/,/g, ''));
        const unit = (priceMatch[2] || '').toLowerCase();
        priceThreshold = unit === 'b' || unit === 'billion' ? base * 1_000_000_000
          : unit === 'm' || unit === 'million' ? base * 1_000_000
          : base;
      }
      const isMore = /(more than|over|above|greater than|at least|>=)/i.test(userMessage.content);
      const isLess = /(less than|under|below|at most|<=)/i.test(userMessage.content);

      let filtered = properties as unknown as Array<any>;
      if (matchedStates.length) {
        filtered = filtered.filter((p) => matchedStates.some((t) => (p.address || '').toLowerCase().includes(t)));
      }
      if (priceThreshold) {
        filtered = filtered.filter((p) => {
          if (typeof p.price !== 'number') return false;
          if (isMore) return p.price >= priceThreshold!;
          if (isLess) return p.price <= priceThreshold!;
          // default: near threshold (+/- 10%)
          return Math.abs(p.price - priceThreshold!) <= priceThreshold! * 0.1;
        });
      }
      // Limit context size
      const contextSubset = filtered.slice(0, 50);

      const response = await queryAI(input, { properties: contextSubset });
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponse(response);
    } catch (error) {
      toast.error("Failed to get AI response. Please check your API configuration.");
      console.error(error);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I couldn't fetch an answer just now. Please verify your API key is set (VITE_GEMINI_API_KEY) and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input using Web Speech API
    /*
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
    */
    toast.info("Voice input - Coming soon!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What are the key risks for Class A office space in downtown Austin?",
    "Find me industrial properties near Port of Long Beach",
    "Show me properties with trust scores above 90",
    "What's the market trend for retail in Miami?",
  ];

  return (
    <Card className={`glass flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-2 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by Gemini</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close assistant">
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing and verifying...</span>
              </div>
            </div>
          )}

          {/* Sources card */}
          {lastResponse && messages[messages.length - 1]?.role === 'assistant' && (
            <Card className="bg-muted/50 p-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Confidence: {lastResponse.confidence}%
                </Badge>
              </div>
              <div className="text-xs font-semibold mb-2">Verified Sources:</div>
              <div className="space-y-2">
                {lastResponse.sources.map((source, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{source.name}</div>
                      {source.snippet && (
                        <div className="text-muted-foreground">{source.snippet}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 2).map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-2"
                onClick={() => setInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50 flex-shrink-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            className="flex-shrink-0"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about real estate..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChat;
