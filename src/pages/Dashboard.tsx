
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, TrendingUp, Users, FileText } from "lucide-react";

const Dashboard = () => {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [articlesResult, monitoredResult] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact' }),
        supabase.from('monitored_content').select('*', { count: 'exact' })
      ]);

      return {
        totalArticles: articlesResult.count || 0,
        totalMonitored: monitoredResult.count || 0,
      };
    }
  });

  const deepResearchMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/functions/v1/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Falha na pesquisa');
      }

      return response.json();
    }
  });

  const autoPublishMutation = useMutation({
    mutationFn: async ({ original_claim, research_data }: any) => {
      const session = await supabase.auth.getSession();
      const response = await fetch('/functions/v1/auto-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify({
          original_claim,
          research_data,
          user_id: session.data.session?.user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Falha na publicação');
      }

      return response.json();
    }
  });

  const handleAnalyzeAndPublish = async () => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o conteúdo para análise",
        variant: "destructive"
      });
      return;
    }

    try {
      // Primeiro, fazer deep research
      const researchResult = await deepResearchMutation.mutateAsync(content);
      
      // Em seguida, publicar automaticamente
      const publishResult = await autoPublishMutation.mutateAsync({
        original_claim: content,
        research_data: researchResult
      });

      toast({
        title: "Sucesso!",
        description: `Artigo publicado automaticamente. ID: ${publishResult.article_id}`,
      });

      setContent("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isLoading = deepResearchMutation.isPending || autoPublishMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Dashboard Veritas
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Artigos Publicados
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conteúdo Monitorado
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMonitored || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Especialistas
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Precisão
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Action Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Análise Automática + Publicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Cole aqui o conteúdo suspeito para análise automática e publicação de artigo de verificação..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">Deep Research</Badge>
                  <Badge variant="outline">Auto-Publish</Badge>
                  <Badge variant="outline">Expert Network</Badge>
                </div>
                
                <Button
                  onClick={handleAnalyzeAndPublish}
                  disabled={isLoading || !content.trim()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {isLoading ? "Processando..." : "Analisar & Publicar"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Processo automático:</strong> O sistema fará deep research, 
                  verificará fontes, criará um artigo completo e publicará no blog 
                  automaticamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Artigos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Artigos publicados aparecerão aqui</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
