
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AnalysisResult from "@/components/AnalysisResult";
import HowItWorks from "@/components/HowItWorks";
import MediaLiteracy from "@/components/MediaLiteracy";
import Footer from "@/components/Footer";

const analyzeContent = async ({ apiKey, content }: { apiKey: string, content: string }) => {
  const systemPrompt = 'Você é um assistente de verificação de fatos chamado Veritas. Analise o texto ou URL fornecido pelo usuário. Seja preciso, conciso e objetivo. Avalie a veracidade das informações, aponte possíveis vieses ou manipulações e, se possível, cite fontes confiáveis que corroborem ou refutem o conteúdo. Responda em português.';
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
        <HowItWorks />
        <MediaLiteracy />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
