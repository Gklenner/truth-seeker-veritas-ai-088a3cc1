
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchResult {
  sources: Array<{
    url: string;
    title: string;
    description: string;
    credibility_score: number;
    source_type: string;
  }>;
  analysis: string;
  confidence_score: number;
  verification_status: string;
}

async function searchSources(query: string): Promise<any[]> {
  // Simular busca em múltiplas fontes (em produção, usar APIs reais)
  const sources = [
    {
      url: "https://g1.globo.com",
      title: "Portal G1 - Notícias verificadas",
      description: "Fonte confiável de notícias com verificação editorial",
      credibility_score: 85,
      source_type: "news"
    },
    {
      url: "https://www.bbc.com/portuguese",
      title: "BBC News Brasil",
      description: "Cobertura internacional e nacional confiável",
      credibility_score: 90,
      source_type: "news"
    },
    {
      url: "https://agencia.fiocruz.br",
      title: "Agência Fiocruz de Notícias",
      description: "Informações científicas e de saúde verificadas",
      credibility_score: 95,
      source_type: "academic"
    }
  ];
  
  return sources.filter(source => 
    source.title.toLowerCase().includes(query.toLowerCase()) ||
    source.description.toLowerCase().includes(query.toLowerCase())
  );
}

async function performDeepResearch(content: string): Promise<ResearchResult> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  // Análise inicial com Gemini
  const systemPrompt = `Você é um especialista em verificação de fatos. Analise o conteúdo fornecido e:
1. Extraia as principais afirmações verificáveis
2. Identifique possíveis fontes para verificação
3. Avalie a probabilidade de ser verdadeiro/falso
4. Sugira termos de busca para pesquisa adicional
Responda em formato JSON estruturado.`;

  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nConteúdo: ${content}` }]
      }]
    }),
  });

  const geminiData = await geminiResponse.json();
  const aiAnalysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Análise indisponível";

  // Simular busca de fontes (em produção, integrar APIs reais)
  const searchTerms = content.split(' ').slice(0, 5).join(' ');
  const sources = await searchSources(searchTerms);

  // Calcular score de confiança baseado nas fontes encontradas
  const avgCredibility = sources.length > 0 
    ? sources.reduce((sum, s) => sum + s.credibility_score, 0) / sources.length 
    : 50;

  let verification_status = 'unverified';
  if (avgCredibility >= 80) verification_status = 'verified';
  else if (avgCredibility < 40) verification_status = 'false';
  else if (avgCredibility < 60) verification_status = 'misleading';

  return {
    sources,
    analysis: aiAnalysis,
    confidence_score: Math.round(avgCredibility),
    verification_status
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content) {
      throw new Error('Conteúdo é obrigatório');
    }

    const research = await performDeepResearch(content);
    
    return new Response(JSON.stringify(research), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na pesquisa:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
