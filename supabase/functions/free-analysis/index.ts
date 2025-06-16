
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  analysis: string;
  confidence_score: number;
  verification_status: string;
  sources: Array<{
    url: string;
    title: string;
    description: string;
    credibility_score: number;
    source_type: string;
  }>;
}

async function performFreeAnalysis(content: string): Promise<AnalysisResult> {
  // Usar API gratuita do Hugging Face ou análise local
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Analise este conteúdo para verificação de fatos: ${content}`,
        parameters: {
          max_length: 300,
          temperature: 0.5
        }
      }),
    });

    let aiAnalysis = "Análise não disponível via API externa.";
    
    if (response.ok) {
      const data = await response.json();
      aiAnalysis = data.generated_text || data[0]?.generated_text || aiAnalysis;
    }

    // Análise local complementar
    const localAnalysis = analyzeContentLocally(content);
    
    return {
      analysis: `${aiAnalysis}\n\n${localAnalysis.analysis}`,
      confidence_score: localAnalysis.confidence_score,
      verification_status: localAnalysis.verification_status,
      sources: localAnalysis.sources
    };
  } catch (error) {
    console.error('Erro na análise:', error);
    // Fallback para análise 100% local
    return analyzeContentLocally(content);
  }
}

function analyzeContentLocally(content: string): AnalysisResult {
  const text = content.toLowerCase();
  let confidence_score = 70;
  let verification_status = 'unverified';
  
  // Análise de padrões suspeitos
  const suspiciousPatterns = [
    'urgente', 'chocante', 'médicos odeiam', 'governo esconde',
    'mídia não mostra', 'verdade que não querem', 'compartilhe antes'
  ];
  
  const emotionalWords = [
    'absurdo', 'inacreditável', 'escândalo', 'bomba', 'exclusivo'
  ];
  
  const factualIndicators = [
    'estudo mostra', 'pesquisa indica', 'dados revelam', 'segundo especialistas'
  ];
  
  // Verificar padrões suspeitos
  const suspiciousFound = suspiciousPatterns.filter(pattern => text.includes(pattern));
  const emotionalFound = emotionalWords.filter(word => text.includes(word));
  const factualFound = factualIndicators.filter(indicator => text.includes(indicator));
  
  // Calcular score de confiança
  confidence_score -= suspiciousFound.length * 15;
  confidence_score -= emotionalFound.length * 10;
  confidence_score += factualFound.length * 10;
  
  // Verificar se há URLs
  const hasUrls = /https?:\/\//.test(content);
  if (hasUrls) confidence_score += 5;
  
  // Verificar se há datas específicas
  const hasDates = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}/.test(content);
  if (hasDates) confidence_score += 5;
  
  confidence_score = Math.max(10, Math.min(95, confidence_score));
  
  // Determinar status de verificação
  if (confidence_score >= 80) verification_status = 'verified';
  else if (confidence_score <= 40) verification_status = 'false';
  else if (confidence_score <= 60) verification_status = 'misleading';
  
  const analysis = `ANÁLISE VERITAS (Sistema Gratuito):

INDICADORES IDENTIFICADOS:
${suspiciousFound.length > 0 ? `⚠️ Padrões suspeitos: ${suspiciousFound.join(', ')}` : '✓ Nenhum padrão suspeito detectado'}
${emotionalFound.length > 0 ? `⚠️ Linguagem emocional: ${emotionalFound.join(', ')}` : '✓ Linguagem neutra'}
${factualFound.length > 0 ? `✓ Indicadores factuais: ${factualFound.join(', ')}` : '⚠️ Poucos indicadores factuais'}

VERIFICAÇÕES:
• URLs presentes: ${hasUrls ? 'Sim' : 'Não'}
• Datas específicas: ${hasDates ? 'Sim' : 'Não'}
• Extensão do texto: ${content.length > 100 ? 'Adequada' : 'Muito curta'}

RECOMENDAÇÕES:
• Verificar fontes primárias
• Consultar veículos de comunicação confiáveis
• Buscar confirmação em sites de fact-checking
• Avaliar credibilidade do autor/veículo

STATUS: ${verification_status.toUpperCase()}
CONFIANÇA: ${confidence_score}%`;

  const sources = [
    {
      url: "https://www.aos-fatos.org",
      title: "Aos Fatos - Agência de Checagem",
      description: "Plataforma independente de verificação de fatos",
      credibility_score: 95,
      source_type: "fact_check"
    },
    {
      url: "https://piaui.folha.uol.com.br/lupa/",
      title: "Agência Lupa",
      description: "Primeira agência de fact-checking do Brasil",
      credibility_score: 90,
      source_type: "fact_check"
    },
    {
      url: "https://www.e-farsas.com",
      title: "E-Farsas",
      description: "Site especializado em desmentir boatos da internet",
      credibility_score: 85,
      source_type: "fact_check"
    }
  ];

  return {
    analysis,
    confidence_score,
    verification_status,
    sources
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

    const analysis = await performFreeAnalysis(content);
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na análise gratuita:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
