
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import MediaLiteracy from "@/components/MediaLiteracy";
import AnalysisResult from "@/components/AnalysisResult";
import MultiAIAnalysis from "@/components/MultiAIAnalysis";
import CrawlerDashboard from "@/components/CrawlerDashboard";
import SocialDistributor from "@/components/SocialDistributor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (content: string) => {
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/functions/v1/free-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Falha na análise');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (error: any) {
      setAnalysisError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4">
          <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          <AnalysisResult 
            isLoading={isLoading} 
            result={analysisResult} 
            error={analysisError} 
          />

          <section className="py-12">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-white mb-8">
                Sistema Completo Anti-Fake News
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Plataforma integrada com múltiplos modelos de IA, crawling automático e distribuição social
              </p>
              
              <Tabs defaultValue="multi-ai" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="multi-ai">Multi-IA</TabsTrigger>
                  <TabsTrigger value="crawler">Crawler Bot</TabsTrigger>
                  <TabsTrigger value="social">Distribuição Social</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="multi-ai" className="mt-6">
                  <MultiAIAnalysis />
                </TabsContent>
                
                <TabsContent value="crawler" className="mt-6">
                  <CrawlerDashboard />
                </TabsContent>
                
                <TabsContent value="social" className="mt-6">
                  <SocialDistributor />
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold text-white mb-4">Analytics Avançado</h3>
                    <p className="text-muted-foreground mb-4">
                      Dashboard completo com métricas de combate à desinformação
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <div className="bg-card p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-accent mb-2">Taxa de Detecção</h4>
                        <div className="text-3xl font-bold text-green-500">94.2%</div>
                        <p className="text-sm text-muted-foreground">Precisão na identificação</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-accent mb-2">Conteúdo Monitorado</h4>
                        <div className="text-3xl font-bold text-blue-500">2.1M</div>
                        <p className="text-sm text-muted-foreground">Posts analisados</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-accent mb-2">Impacto Social</h4>
                        <div className="text-3xl font-bold text-purple-500">850K</div>
                        <p className="text-sm text-muted-foreground">Pessoas alcançadas</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          <HowItWorks />
          <MediaLiteracy />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
