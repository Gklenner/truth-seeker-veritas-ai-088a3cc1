
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, Shield, Target, TrendingUp } from "lucide-react";

interface MultiAIAnalysisProps {
  onAnalysisComplete?: (result: any) => void;
}

const MultiAIAnalysis = ({ onAnalysisComplete }: MultiAIAnalysisProps) => {
  const [content, setContent] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const multiAIMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/functions/v1/multi-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Falha na análise multi-IA');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      onAnalysisComplete?.(data);
      toast({
        title: "Análise Multi-IA Concluída!",
        description: `Consenso de ${data.ai_models_used?.length || 0} modelos: ${data.final_verdict}`,
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

    multiAIMutation.mutate(content);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'VERIFICADO': return 'bg-green-100 text-green-800';
      case 'FALSO': return 'bg-red-100 text-red-800';
      case 'ENGANOSO': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Análise Multi-IA Avançada
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sistema que cruza informações de múltiplos modelos de IA para máxima precisão
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole aqui o conteúdo suspeito para análise com múltiplos modelos de IA..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-purple-100">
                <Brain className="w-3 h-3 mr-1" />
                Multi-IA
              </Badge>
              <Badge variant="outline" className="bg-blue-100">
                <Shield className="w-3 h-3 mr-1" />
                Cross-Reference
              </Badge>
              <Badge variant="outline" className="bg-green-100">
                <Target className="w-3 h-3 mr-1" />
                Alta Precisão
              </Badge>
            </div>
            
            <Button
              onClick={handleAnalyze}
              disabled={multiAIMutation.isPending || !content.trim()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {multiAIMutation.isPending ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analisar com Multi-IA
                </>
              )}
            </Button>
          </div>

          {multiAIMutation.isPending && (
            <div className="space-y-2">
              <Progress value={33} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                Processando com múltiplos modelos de IA...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Resultado da Análise Multi-IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analysisResult.consensus_score}%
                </div>
                <div className="text-sm text-gray-600">
                  Consenso
                </div>
              </div>
              
              <div className="text-center">
                <Badge className={getVerdictColor(analysisResult.final_verdict)}>
                  {analysisResult.final_verdict}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">
                  Veredito Final
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {analysisResult.confidence_level}%
                </div>
                <div className="text-sm text-gray-600">
                  Confiança
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {analysisResult.ai_models_used?.length || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Modelos Usados
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Análise Detalhada:</h4>
                <p className="text-gray-700 text-sm bg-purple-50 p-3 rounded">
                  {analysisResult.detailed_analysis}
                </p>
              </div>

              {analysisResult.individual_analyses && (
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Análises Individuais:</h4>
                  <div className="space-y-2">
                    {analysisResult.individual_analyses.map((analysis: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-purple-300">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{analysis.model}</Badge>
                          <span className="text-sm font-medium">{analysis.confidence}% confiança</span>
                        </div>
                        <p className="text-xs text-gray-600">{analysis.analysis}</p>
                        <div className="flex gap-2 mt-2">
                          {analysis.bias_detected && (
                            <Badge variant="destructive" className="text-xs">Viés Detectado</Badge>
                          )}
                          {analysis.emotional_manipulation && (
                            <Badge variant="destructive" className="text-xs">Manipulação Emocional</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Factualidade: {analysis.factualness_score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-purple-800">
                  <strong>Modelos utilizados:</strong> {analysisResult.ai_models_used?.join(', ')}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Análise realizada em: {new Date(analysisResult.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiAIAnalysis;
