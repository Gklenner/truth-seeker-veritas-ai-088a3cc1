import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AnalysisResult from "@/components/AnalysisResult";
import AutoAnalysisForm from "@/components/AutoAnalysisForm";
import HowItWorks from "@/components/HowItWorks";
import MediaLiteracy from "@/components/MediaLiteracy";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Zap, Shield } from "lucide-react";

const analyzeContent = async ({ apiKey, content }: { apiKey: string, content: string }) => {
  const systemPrompt = 'Você é um assistente de verificação de fatos chamado Veritas. Sua principal função é analisar o texto ou URL fornecido pelo usuário com total imparcialidade e neutralidade. Avalie a veracidade das informações, identifique vieses ou manipulações e, de forma obrigatória, CITE FONTES CONFIÁVEIS (links diretos, se aplicável) que corroborem ou refutem o conteúdo. Sua análise deve ser baseada em fatos e evidências, sem expressar opiniões. Responda em português.';
  const fullContent = `${systemPrompt}\n\nConteúdo para análise: ${content}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: fullContent
        }]
      }]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Falha ao conectar com a API do Google Gemini.');
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts[0]?.text) {
    throw new Error('A API não retornou uma resposta válida.');
  }
  
  return data.candidates[0].content.parts[0].text;
};

const Index = () => {
  const mutation = useMutation({
    mutationFn: analyzeContent,
  });

  const handleAnalyze = (apiKey: string, content: string) => {
    mutation.mutate({ apiKey, content });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4">
        <Hero onAnalyze={handleAnalyze} isLoading={mutation.isPending} />
        <AnalysisResult
          isLoading={mutation.isPending}
          result={mutation.data}
          error={mutation.error?.message || null}
        />

        {/* New Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Sistema Completo Anti-Fake News
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Solução automatizada com IA, deep research e rede de especialistas para combater a desinformação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-lg">Análise Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Deep research com IA avançada e verificação cruzada de múltiplas fontes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-lg">Blog Automático</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Artigos de verificação gerados e publicados automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-lg">Rede de Especialistas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Validação humana por especialistas em diferentes áreas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-lg">Monitoramento 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Detecção proativa de fake news em tempo real
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <AutoAnalysisForm />
            
            <Card>
              <CardHeader>
                <CardTitle>Acesso ao Sistema Completo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Acesse dashboards avançados, funcionalidades de especialista e o blog automatizado
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/blog">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Blog
                    </Button>
                  </Link>
                  
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/expert">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Especialistas
                    </Button>
                  </Link>
                  
                  <Link to="/auth">
                    <Button className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Entrar/Cadastrar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <HowItWorks />
        <MediaLiteracy />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
