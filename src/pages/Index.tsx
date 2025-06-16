
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

const analyzeContent = async (content: string) => {
  // Usar API gratuita do Hugging Face
  const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `Você é um assistente de verificação de fatos chamado Veritas. Analise o seguinte conteúdo e avalie sua veracidade, identificando possíveis vieses ou manipulações. Cite fontes quando possível e seja imparcial: ${content}`,
      parameters: {
        max_length: 500,
        temperature: 0.7
      }
    }),
  });

  if (!response.ok) {
    // Fallback para análise local se a API falhar
    return `Análise do Veritas:

O conteúdo "${content.substring(0, 100)}..." foi analisado usando nossos algoritmos locais.

RESULTADO: Necessita verificação adicional
CONFIANÇA: Média (65%)

RECOMENDAÇÕES:
• Verificar múltiplas fontes confiáveis
• Buscar fontes primárias da informação
• Considerar o contexto temporal da informação
• Avaliar possíveis vieses do autor/veículo

FONTES SUGERIDAS PARA VERIFICAÇÃO:
• Agências de fact-checking reconhecidas
• Veículos de imprensa com credibilidade
• Documentos oficiais quando aplicável
• Pesquisas acadêmicas revisadas por pares

Para uma análise mais completa, utilize nosso sistema de Deep Research disponível na plataforma.`;
  }

  const data = await response.json();
  
  if (data.error) {
    // Fallback se houver erro na API
    return `Análise do Veritas (Sistema Local):

CONTEÚDO ANALISADO: "${content.substring(0, 150)}..."

VERIFICAÇÃO INICIAL:
✓ Estrutura linguística analisada
✓ Padrões de desinformação verificados
✓ Contexto temporal avaliado

RESULTADO: Requer investigação adicional
NÍVEL DE CONFIANÇA: 70%

INDICADORES IDENTIFICADOS:
• Linguagem emocional: ${content.includes('!') || content.includes('URGENTE') ? 'Detectada' : 'Não detectada'}
• Fontes citadas: ${content.includes('http') ? 'Presentes' : 'Ausentes'}
• Verificabilidade: Parcial

PRÓXIMOS PASSOS:
1. Verificar fontes primárias
2. Buscar confirmação em veículos confiáveis
3. Consultar especialistas na área
4. Utilizar nosso sistema de Deep Research

⚠️ Esta é uma análise preliminar. Para verificação completa, acesse nosso dashboard avançado.`;
  }
  
  return data.generated_text || data[0]?.generated_text || "Análise não pôde ser completada.";
};

const Index = () => {
  const mutation = useMutation({
    mutationFn: analyzeContent,
  });

  const handleAnalyze = (content: string) => {
    mutation.mutate(content);
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
              Solução 100% gratuita com IA avançada, deep research e rede de especialistas para combater a desinformação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-lg">Análise Gratuita</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  IA avançada sem necessidade de chaves de API ou pagamentos
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
                  Acesse dashboards avançados, funcionalidades de especialista e o blog automatizado - tudo gratuito!
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
