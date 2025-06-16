
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Radar, TrendingUp, Shield, Play, Pause, Activity } from "lucide-react";

interface CrawlerStats {
  total_monitored: number;
  high_priority: number;
  fact_checks_triggered: number;
  last_crawl: string;
}

const CrawlerDashboard = () => {
  const [isCrawling, setIsCrawling] = useState(false);
  const { toast } = useToast();

  const { data: crawlerStats, refetch: refetchStats } = useQuery({
    queryKey: ['crawler-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitored_content')
        .select('*');

      if (error) throw error;

      const total_monitored = data.length;
      const high_priority = data.filter(item => item.priority_score > 80).length;
      const fact_checks_triggered = data.filter(item => item.status === 'processed').length;
      const last_crawl = data.length > 0 ? 
        new Date(Math.max(...data.map(item => new Date(item.detected_at).getTime()))).toISOString() :
        new Date().toISOString();

      return {
        total_monitored,
        high_priority,
        fact_checks_triggered,
        last_crawl
      } as CrawlerStats;
    }
  });

  const { data: recentContent } = useQuery({
    queryKey: ['recent-monitored'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitored_content')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  const crawlerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/functions/v1/crawler-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Falha no crawler');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Crawler Executado com Sucesso!",
        description: `${data.crawled_count} conteúdos analisados, ${data.fact_checks_triggered} fact-checks iniciados`,
      });
      refetchStats();
      setIsCrawling(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Crawler",
        description: error.message,
        variant: "destructive"
      });
      setIsCrawling(false);
    }
  });

  const handleStartCrawler = () => {
    setIsCrawling(true);
    crawlerMutation.mutate();
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'ALTA';
    if (score >= 60) return 'MÉDIA';
    return 'BAIXA';
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Sistema de Crawling Anti-Fake News
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monitoramento automático de conteúdo suspeito na web e redes sociais
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {crawlerStats?.total_monitored || 0}
              </div>
              <div className="text-sm text-gray-600">
                Conteúdos Monitorados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {crawlerStats?.high_priority || 0}
              </div>
              <div className="text-sm text-gray-600">
                Alta Prioridade
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {crawlerStats?.fact_checks_triggered || 0}
              </div>
              <div className="text-sm text-gray-600">
                Fact-Checks Gerados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-bold text-gray-700">
                {crawlerStats?.last_crawl ? 
                  new Date(crawlerStats.last_crawl).toLocaleString('pt-BR') : 
                  'Nunca'
                }
              </div>
              <div className="text-sm text-gray-600">
                Último Crawl
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-100">
                <Radar className="w-3 h-3 mr-1" />
                Monitoramento Ativo
              </Badge>
              <Badge variant="outline" className="bg-cyan-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                Análise Viral
              </Badge>
              <Badge variant="outline" className="bg-green-100">
                <Shield className="w-3 h-3 mr-1" />
                Auto Fact-Check
              </Badge>
            </div>
            
            <Button
              onClick={handleStartCrawler}
              disabled={isCrawling || crawlerMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isCrawling ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Crawling...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Crawl
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Conteúdo Recentemente Monitorado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentContent && recentContent.length > 0 ? (
            <div className="space-y-3">
              {recentContent.map((content) => (
                <div key={content.id} className="border rounded p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow">
                      <p className="text-sm font-medium line-clamp-2">
                        {content.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {content.platform}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(content.priority_score)}`}>
                          {getPriorityLabel(content.priority_score)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Viral: {content.viral_potential}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(content.detected_at).toLocaleDateString('pt-BR')}
                      </div>
                      <Badge 
                        variant={content.status === 'processed' ? 'default' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                  {content.source_url && (
                    <a 
                      href={content.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      {content.source_url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum conteúdo monitorado ainda</p>
              <p className="text-sm">Execute um crawl para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrawlerDashboard;
