
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

const ExpertDashboard = () => {
  const { data: pendingArticles } = useQuery({
    queryKey: ['pending-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          sources(*),
          expert_validations(*)
        `)
        .is('expert_validations.id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'false': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'misleading': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Dashboard de Especialistas
          </h1>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Artigos Pendentes de Validação</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingArticles && pendingArticles.length > 0 ? (
                  <div className="space-y-4">
                    {pendingArticles.map((article) => (
                      <div key={article.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(article.verification_status)}
                              <h3 className="font-semibold text-white">
                                {article.title}
                              </h3>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Alegação:</strong> {article.original_claim}
                            </p>
                            
                            <div className="flex gap-2 mb-3">
                              <Badge variant="outline">
                                {article.verification_status}
                              </Badge>
                              <Badge variant="outline">
                                {article.confidence_score}% confiança
                              </Badge>
                              <Badge variant="outline">
                                {article.sources?.length || 0} fontes
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              Publicado em {new Date(article.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Revisar
                            </Button>
                            <Button variant="default" size="sm">
                              Aprovar
                            </Button>
                            <Button variant="destructive" size="sm">
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum artigo pendente de validação</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExpertDashboard;
