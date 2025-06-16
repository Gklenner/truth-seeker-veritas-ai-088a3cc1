
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIAnalysisResult {
  model: string;
  analysis: string;
  confidence: number;
  factualness_score: number;
  bias_detected: boolean;
  emotional_manipulation: boolean;
  sources_needed: string[];
}

interface CrossReferencedResult {
  consensus_score: number;
  final_verdict: string;
  confidence_level: number;
  detailed_analysis: string;
  evidence_sources: any[];
  ai_models_used: string[];
}

async function analyzeWithMultipleModels(content: string): Promise<AIAnalysisResult[]> {
  const models = [
    { name: 'huggingface-bart', endpoint: 'facebook/bart-large-mnli' },
    { name: 'huggingface-distilbert', endpoint: 'distilbert-base-uncased-finetuned-sst-2-english' },
    { name: 'local-pattern-analysis', endpoint: null }
  ];

  const results: AIAnalysisResult[] = [];

  for (const model of models) {
    try {
      let analysis: AIAnalysisResult;
      
      if (model.name === 'local-pattern-analysis') {
        analysis = await performLocalAnalysis(content);
      } else {
        analysis = await analyzeWithHuggingFace(content, model);
      }
      
      results.push(analysis);
    } catch (error) {
      console.error(`Erro na análise com ${model.name}:`, error);
      // Continuar com outros modelos mesmo se um falhar
    }
  }

  return results;
}

async function analyzeWithHuggingFace(content: string, model: any): Promise<AIAnalysisResult> {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: content.substring(0, 500) })
    });

    const data = await response.json();
    
    return {
      model: model.name,
      analysis: `Análise ${model.name}: ${JSON.stringify(data)}`,
      confidence: data[0]?.score ? Math.round(data[0].score * 100) : 50,
      factualness_score: calculateFactualness(content),
      bias_detected: detectBias(content),
      emotional_manipulation: detectEmotionalManipulation(content),
      sources_needed: extractKeyTermsForResearch(content)
    };
  } catch (error) {
    return {
      model: model.name,
      analysis: `Erro na análise com ${model.name}`,
      confidence: 0,
      factualness_score: 50,
      bias_detected: false,
      emotional_manipulation: false,
      sources_needed: []
    };
  }
}

async function performLocalAnalysis(content: string): Promise<AIAnalysisResult> {
  const text = content.toLowerCase();
  
  // Padrões de fake news
  const fakeNewsPatterns = [
    'urgente', 'chocante', 'mídia esconde', 'governo não quer', 'compartilhe antes',
    'médicos odeiam', 'segredo revelado', 'verdade que escondem', 'exclusivo'
  ];
  
  // Padrões de credibilidade
  const credibilityPatterns = [
    'segundo estudo', 'pesquisa indica', 'especialistas afirmam', 'dados mostram',
    'universidade', 'instituto de pesquisa', 'revista científica'
  ];
  
  // Padrões emocionais
  const emotionalPatterns = [
    'absurdo', 'revoltante', 'inacreditável', 'escândalo', 'bomba',
    'terror', 'medo', 'pânico', 'desespero'
  ];

  const fakeCount = fakeNewsPatterns.filter(pattern => text.includes(pattern)).length;
  const credibilityCount = credibilityPatterns.filter(pattern => text.includes(pattern)).length;
  const emotionalCount = emotionalPatterns.filter(pattern => text.includes(pattern)).length;
  
  const factualness_score = Math.max(10, Math.min(90, 70 - (fakeCount * 15) + (credibilityCount * 10)));
  const confidence = Math.max(60, Math.min(95, 80 - (fakeCount * 10) + (credibilityCount * 5)));
  
  return {
    model: 'local-pattern-analysis',
    analysis: `Análise local detectou: ${fakeCount} padrões suspeitos, ${credibilityCount} indicadores de credibilidade, ${emotionalCount} elementos emocionais`,
    confidence,
    factualness_score,
    bias_detected: fakeCount > 2,
    emotional_manipulation: emotionalCount > 1,
    sources_needed: extractKeyTermsForResearch(content)
  };
}

function calculateFactualness(content: string): number {
  const hasNumbers = /\d+/.test(content);
  const hasDates = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}/.test(content);
  const hasUrls = /https?:\/\//.test(content);
  const hasQuotes = /["']/.test(content);
  
  let score = 50;
  if (hasNumbers) score += 10;
  if (hasDates) score += 10;
  if (hasUrls) score += 15;
  if (hasQuotes) score += 5;
  
  return Math.min(90, score);
}

function detectBias(content: string): boolean {
  const biasWords = ['sempre', 'nunca', 'todos', 'ninguém', 'obviamente', 'claramente'];
  return biasWords.some(word => content.toLowerCase().includes(word));
}

function detectEmotionalManipulation(content: string): boolean {
  const emotionalWords = ['medo', 'terror', 'pânico', 'urgente', 'chocante', 'absurdo'];
  return emotionalWords.filter(word => content.toLowerCase().includes(word)).length > 1;
}

function extractKeyTermsForResearch(content: string): string[] {
  const words = content.split(' ').filter(word => word.length > 4);
  return words.slice(0, 5);
}

function crossReferenceAnalyses(analyses: AIAnalysisResult[]): CrossReferencedResult {
  if (analyses.length === 0) {
    return {
      consensus_score: 0,
      final_verdict: 'ERRO',
      confidence_level: 0,
      detailed_analysis: 'Nenhuma análise foi concluída',
      evidence_sources: [],
      ai_models_used: []
    };
  }

  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
  const avgFactualness = analyses.reduce((sum, a) => sum + a.factualness_score, 0) / analyses.length;
  const biasDetectedCount = analyses.filter(a => a.bias_detected).length;
  const emotionalCount = analyses.filter(a => a.emotional_manipulation).length;
  
  let final_verdict = 'NÃO VERIFICADO';
  if (avgFactualness >= 75 && avgConfidence >= 70) final_verdict = 'VERIFICADO';
  else if (avgFactualness <= 40 || biasDetectedCount > 1) final_verdict = 'FALSO';
  else if (emotionalCount > 0 || avgFactualness <= 60) final_verdict = 'ENGANOSO';
  
  const consensus_score = Math.round((avgConfidence + avgFactualness) / 2);
  
  return {
    consensus_score,
    final_verdict,
    confidence_level: Math.round(avgConfidence),
    detailed_analysis: `Análise cruzada de ${analyses.length} modelos de IA: Consenso ${consensus_score}%, Factualidade ${Math.round(avgFactualness)}%, Viés detectado por ${biasDetectedCount} modelos, Manipulação emocional detectada por ${emotionalCount} modelos.`,
    evidence_sources: [],
    ai_models_used: analyses.map(a => a.model)
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

    console.log('Iniciando análise com múltiplos modelos...');
    
    // Analisar com múltiplos modelos
    const analyses = await analyzeWithMultipleModels(content);
    
    // Cruzar informações
    const crossReferencedResult = crossReferenceAnalyses(analyses);
    
    const result = {
      ...crossReferencedResult,
      individual_analyses: analyses,
      timestamp: new Date().toISOString(),
      content_preview: content.substring(0, 100) + '...'
    };
    
    console.log('Análise multi-modelo concluída:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na análise multi-modelo:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
