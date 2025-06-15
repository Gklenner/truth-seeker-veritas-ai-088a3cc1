
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface HeroProps {
  onAnalyze: (apiKey: string, content: string) => void;
  isLoading: boolean;
}

const Hero = ({ onAnalyze, isLoading }: HeroProps) => {
  const [apiKey, setApiKey] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(apiKey, content);
  };
  
  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">A Verdade em Suas Mãos</h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Cole um link ou texto abaixo e nossa IA analisará a veracidade do conteúdo em tempo real.</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-4">
        <Textarea
          placeholder="Cole aqui um link ou o texto que deseja verificar..."
          className="min-h-[150px] text-base"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="password"
            placeholder="Sua chave de API da Perplexity AI"
            className="flex-grow text-base"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <Button type="submit" size="lg" className="text-base" disabled={isLoading || !content || !apiKey}>
            {isLoading ? "Analisando..." : "Verificar Agora"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Para usar a análise em tempo real, você precisa de uma chave da API da Perplexity.{" "}
          <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Obtenha sua chave aqui.
          </a>
        </p>
      </form>
    </section>
  );
};

export default Hero;
