
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Share2, Users, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface SocialDistributorProps {
  article?: any;
}

const SocialDistributor = ({ article }: SocialDistributorProps) => {
  const [articleId, setArticleId] = useState("");
  const [distributionResult, setDistributionResult] = useState<any>(null);
  const { toast } = useToast();

  const distributeMutation = useMutation({
    mutationFn: async (data: { article_id?: string; article_data?: any }) => {
      const response = await fetch('/functions/v1/social-distributor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Falha na distribuição social');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setDistributionResult(data);
      toast({
        title: "Distribuição Social Concluída!",
        description: `${data.successful_posts} posts publicados com alcance estimado de ${data.estimated_reach.toLocaleString()} pessoas`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na distribuição",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDistribute = () => {
    if (article) {
      distributeMutation.mutate({ article_data: article });
    } else if (articleId) {
      distributeMutation.mutate({ article_id: articleId });
    } else {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID do artigo",
        variant: "destructive"
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'facebook': return '👥';
      case 'telegram': return '📱';
      default: return '📢';
    }
  };

  const getPlatformColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-600" />
            Distribuidor Social Anti-Fake News
          </CardTitle>
          <p className="text-sm text-gray-600">
            Distribui automaticamente verificações de fatos para múltiplas redes sociais
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!article && (
            <div className="space-y-2">
              <label className="text-sm font-medium">ID do Artigo</label>
              <Input
                placeholder="Digite o ID do artigo para distribuir..."
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
              />
            </div>
          )}

          {article && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-blue-800">
                Artigo selecionado: {article.title}
              </p>
              <p className="text-xs text-blue-600">
                Status: {article.verification_status} | Confiança: {article.confidence_score}%
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-100">
                <Share2 className="w-3 h-3 mr-1" />
                Multi-Plataforma
              </Badge>
              <Badge variant="outline" className="bg-teal-100">
                <Users className="w-3 h-3 mr-1" />
                Alto Alcance
              </Badge>
              <Badge variant="outline" className="bg-blue-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                Engajamento Otimizado
              </Badge>
            </div>
            
            <Button
              onClick={handleDistribute}
              disabled={distributeMutation.isPending || (!article && !articleId)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {distributeMutation.isPending ? (
                <>
                  <Share2 className="w-4 h-4 animate-pulse" />
                  Distribuindo...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Distribuir Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {distributionResult && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Resultado da Distribuição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {distributionResult.successful_posts}
                </div>
                <div className="text-sm text-gray-600">
                  Posts Publicados
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {distributionResult.estimated_reach?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Alcance Estimado
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {distributionResult.platforms_reached?.length || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Plataformas Atingidas
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {distributionResult.failed_posts || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Falhas
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Detalhes por Plataforma:</h4>
              {distributionResult.distribution_results?.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon(result.platform)}</span>
                    <div>
                      <div className="font-medium capitalize">
                        {result.platform}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getPlatformColor(result.success)}>
                      {result.success ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {result.success ? 'Sucesso' : 'Falha'}
                    </Badge>
                    {result.success && (
                      <div className="text-xs text-gray-600 mt-1">
                        Alcance: {result.reach_estimate?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h4 className="font-semibold text-green-800 mb-2">
                📊 Resumo da Distribuição
              </h4>
              <p className="text-sm text-green-700">
                <strong>Artigo:</strong> {distributionResult.article_title}
              </p>
              <p className="text-sm text-green-700">
                <strong>Plataformas alcançadas:</strong> {distributionResult.platforms_reached?.join(', ')}
              </p>
              <p className="text-sm text-green-700">
                <strong>Taxa de sucesso:</strong> {Math.round((distributionResult.successful_posts / distributionResult.posts_created) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialDistributor;
