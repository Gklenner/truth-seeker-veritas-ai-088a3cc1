
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Eye, Share2 } from "lucide-react";
import { useEffect } from "react";

const ArticlePage = () => {
  const { slug } = useParams();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          sources(*)
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Incrementar contador de visualizações
  useEffect(() => {
    if (article) {
      supabase
        .from('articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', article.id)
        .then();
    }
  }, [article]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'false': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'misleading': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'false': return 'bg-red-100 text-red-800';
      case 'misleading': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    
    // Incrementar contador de compartilhamentos
    if (article) {
      supabase
        .from('articles')
        .update({ share_count: (article.share_count || 0) + 1 })
        .eq('id', article.id)
        .then();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h1>
            <p className="text-muted-foreground">O artigo que você está procurando não existe.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(article.verification_status)}
              <Badge className={getStatusColor(article.verification_status)}>
                {article.verification_status === 'verified' && 'VERIFICADO'}
                {article.verification_status === 'false' && 'FALSO'}
                {article.verification_status === 'misleading' && 'ENGANOSO'}
                {article.verification_status === 'unverified' && 'NÃO VERIFICADO'}
              </Badge>
              <Badge variant="outline">
                {article.confidence_score}% de confiança
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-4">
                <span>
                  Publicado em {new Date(article.published_at).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.view_count} visualizações
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>

            <Card className="mb-6 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg text-accent">
                  Alegação Original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "{article.original_claim}"
                </p>
              </CardContent>
            </Card>
          </header>

          <div className="prose prose-invert max-w-none mb-8">
            <div
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
              className="text-gray-300 leading-relaxed"
            />
          </div>

          {article.sources && article.sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Fontes Consultadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {article.sources.map((source: any, index: number) => (
                    <div key={source.id} className="border-l-4 border-accent/30 pl-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-grow">
                          <h4 className="font-medium text-white">
                            {index + 1}. {source.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {source.description}
                          </p>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline text-sm flex items-center gap-1"
                          >
                            {source.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-xs">
                            {source.source_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {source.credibility_score}% confiável
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
