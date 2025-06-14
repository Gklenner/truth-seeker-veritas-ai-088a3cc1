
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Loader2, CheckCircle, ExternalLink } from "lucide-react";

interface AutoAnalysisFormProps {
  onAnalysisComplete?: (result: any) => void;
}

const AutoAnalysisForm = ({ onAnalysisComplete }: AutoAnalysisFormProps) => {
  const [content, setContent] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/functions/v1/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Falha na análise');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      onAnalysisComplete?.(data);
      toast({
        title: "Análise concluída!",
        description: "Deep research realizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o conteúdo para análise",
        variant: "destructive"
      });
      return;
    }

    analysisMutation.mutate(content);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Análise Automática com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole aqui o texto, link ou alegação que deseja verificar automaticamente..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline">Deep Research</Badge>
              <Badge variant="outline">Multi-Source</Badge>
              <Badge variant="outline">AI Powered</Badge>
            </div>
            
            <Button
              onClick={handleAnalyze}
              disabled={analysisMutation.isPending || !content.trim()}
              className="flex items-center gap-2"
            >
              {analysisMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {analysisMutation.isPending ? "Analisando..." : "Analisar Automaticamente"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <CheckCircle className="w-5 h-5" />
              Resultado da Análise Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analysisResult.confidence_score}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Confiança
                </div>
              </div>
              
              <div className="text-center">
                <Badge 
                  className={
                    analysisResult.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    analysisResult.verification_status === 'false' ? 'bg-red-100 text-red-800' :
                    analysisResult.verification_status === 'misleading' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {analysisResult.verification_status}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Status
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analysisResult.sources?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fontes Encontradas
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Análise da IA:</h4>
                <p className="text-gray-300 text-sm">
                  {analysisResult.analysis}
                </p>
              </div>

              {analysisResult.sources && analysisResult.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Fontes Consultadas:</h4>
                  <div className="space-y-2">
                    {analysisResult.sources.map((source: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-muted/10 p-3 rounded">
                        <div className="flex-grow">
                          <div className="font-medium text-white text-sm">
                            {source.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {source.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {source.credibility_score}%
                          </Badge>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoAnalysisForm;
