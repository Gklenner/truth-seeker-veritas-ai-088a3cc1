
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HeroProps {
  onAnalyze: (content: string) => void;
  isLoading: boolean;
}

const Hero = ({ onAnalyze, isLoading }: HeroProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(content);
  };
  
  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">A Verdade em Suas Mãos</h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Cole um link ou texto abaixo e nossa IA analisará a veracidade do conteúdo em tempo real usando tecnologia gratuita avançada.</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-4">
        <Textarea
          placeholder="Cole aqui um link ou o texto que deseja verificar..."
          className="min-h-[150px] text-base"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="flex justify-center">
          <Button type="submit" size="lg" className="text-base" disabled={isLoading || !content}>
            {isLoading ? "Analisando..." : "Verificar Agora"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Análise gratuita powered by Hugging Face AI - Sem necessidade de chaves de API
        </p>
      </form>
    </section>
  );
};

export default Hero;
