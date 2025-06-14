
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AnalysisResult from "@/components/AnalysisResult";
import HowItWorks from "@/components/HowItWorks";
import MediaLiteracy from "@/components/MediaLiteracy";
import Footer from "@/components/Footer";

const analyzeContent = async ({ apiKey, content }: { apiKey: string, content: string }) => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de verificação de fatos chamado Veritas. Analise o texto ou URL fornecido pelo usuário. Seja preciso, conciso e objetivo. Avalie a veracidade das informações, aponte possíveis vieses ou manipulações e, se possível, cite fontes confiáveis que corroborem ou refutem o conteúdo. Responda em português.'
        },
        {
          role: 'user',
          content: content
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Falha ao conectar com a API de análise.');
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
