
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select(`
          *,
          sources(count)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,original_claim.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'false': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'misleading': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Blog Veritas - Verificações de Fatos
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Artigos automatizados de verificação e desmentido de fake news
            </p>
            
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Button size="icon" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-300 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {articles?.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">
                        {article.title}
                      </CardTitle>
                      {getStatusIcon(article.verification_status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(article.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.view_count}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      <strong>Alegação original:</strong> {article.original_claim}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(article.verification_status)}>
                          {article.verification_status === 'verified' && 'Verificado'}
                          {article.verification_status === 'false' && 'Falso'}
                          {article.verification_status === 'misleading' && 'Enganoso'}
                          {article.verification_status === 'unverified' && 'Não Verificado'}
                        </Badge>
                        <Badge variant="outline">
                          {article.confidence_score}% confiança
                        </Badge>
                      </div>
                      
                      <Link to={`/article/${article.slug}`}>
                        <Button variant="outline" size="sm">
                          Ler mais
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {articles && articles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum artigo encontrado {searchTerm && `para "${searchTerm}"`}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
