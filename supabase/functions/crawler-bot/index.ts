
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrawlTarget {
  url: string;
  platform: string;
  keywords: string[];
  priority: number;
}

interface CrawledContent {
  url: string;
  title: string;
  content: string;
  platform: string;
  viral_score: number;
  suspicious_score: number;
  extracted_claims: string[];
}

const FAKE_NEWS_SOURCES = [
  'https://www.snopes.com',
  'https://factcheck.org',
  'https://www.politifact.com'
];

const NEWS_SOURCES = [
  'https://g1.globo.com',
  'https://www.bbc.com/portuguese',
  'https://www1.folha.uol.com.br',
  'https://www.estadao.com.br'
];

async function crawlNewsSourcesForFakeNews(): Promise<CrawledContent[]> {
  const crawledContent: CrawledContent[] = [];
  
  // Simular crawling de notícias suspeitas
  const suspiciousContent = [
    {
      url: 'https://example-fake-news.com/artigo1',
      title: 'URGENTE: Descoberta CHOCANTE que a mídia não quer que você saiba!',
      content: 'Médicos ODEIAM este truque simples que cura tudo. Governo esconde a verdade do povo brasileiro. Compartilhe antes que removam!',
      platform: 'blog_suspeito',
      viral_score: 85,
      suspicious_score: 90,
      extracted_claims: [
        'Médicos odeiam truque que cura tudo',
        'Governo esconde verdade',
        'Mídia não quer que você saiba'
      ]
    },
    {
      url: 'https://another-fake.com/noticia2',
      title: 'Vacinas contêm chips de controle mental, confirma "especialista"',
      content: 'Segundo fontes anônimas, as vacinas contra COVID-19 contêm microchips para controle da população. Especialista independente confirma teoria.',
      platform: 'rede_social',
      viral_score: 75,
      suspicious_score: 95,
      extracted_claims: [
        'Vacinas contêm chips de controle mental',
        'Microchips para controle da população',
        'Especialista confirma teoria'
      ]
    },
    {
      url: 'https://fake-health.com/cura-milagrosa',
      title: 'Planta brasileira cura câncer em 3 dias, médicos ficam em pânico',
      content: 'Uma planta encontrada na Amazônia pode curar qualquer tipo de câncer em apenas 3 dias. A indústria farmacêutica está desesperada para esconder esta informação.',
      platform: 'blog_saude',
      viral_score: 92,
      suspicious_score: 88,
      extracted_claims: [
        'Planta amazônica cura câncer em 3 dias',
        'Indústria farmacêutica esconde informação',
        'Médicos em pânico'
      ]
    }
  ];
  
  return suspiciousContent;
}

async function analyzeSuspiciousContent(content: CrawledContent): Promise<any> {
  try {
    // Chamar nossa função de análise multi-modelo
    const response = await fetch('https://tjghprorvtaolekxeiyb.supabase.co/functions/v1/multi-ai-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.content })
    });
    
    const analysis = await response.json();
    
    return {
      ...content,
      analysis_result: analysis,
      needs_fact_check: analysis.final_verdict === 'FALSO' || analysis.final_verdict === 'ENGANOSO',
      priority_level: content.viral_score > 80 ? 'ALTA' : content.viral_score > 60 ? 'MÉDIA' : 'BAIXA'
    };
  } catch (error) {
    console.error('Erro ao analisar conteúdo:', error);
    return {
      ...content,
      analysis_result: null,
      needs_fact_check: true,
      priority_level: 'MÉDIA'
    };
  }
}

async function storeMonitoredContent(supabase: any, analyzedContent: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('monitored_content')
      .insert({
        content: analyzedContent.content,
        source_url: analyzedContent.url,
        platform: analyzedContent.platform,
        viral_potential: analyzedContent.viral_score,
        priority_score: analyzedContent.priority_level === 'ALTA' ? 100 : 
                       analyzedContent.priority_level === 'MÉDIA' ? 60 : 30,
        status: analyzedContent.needs_fact_check ? 'pending' : 'processed'
      });
    
    if (error) {
      console.error('Erro ao armazenar conteúdo monitorado:', error);
    } else {
      console.log('Conteúdo armazenado com sucesso:', analyzedContent.url);
    }
  } catch (error) {
    console.error('Erro ao armazenar no banco:', error);
  }
}

async function triggerFactCheckIfNeeded(analyzedContent: any): Promise<void> {
  if (analyzedContent.needs_fact_check && analyzedContent.priority_level === 'ALTA') {
    try {
      // Trigger fact-check automático
      const response = await fetch('https://tjghprorvtaolekxeiyb.supabase.co/functions/v1/auto-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_claim: analyzedContent.extracted_claims[0] || analyzedContent.title,
          research_data: analyzedContent.analysis_result,
          user_id: null // Sistema automático
        })
      });
      
      if (response.ok) {
        console.log('Fact-check automático iniciado para:', analyzedContent.url);
      }
    } catch (error) {
      console.error('Erro ao iniciar fact-check automático:', error);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Iniciando crawling automático...');
    
    // 1. Crawlear fontes suspeitas
    const crawledContent = await crawlNewsSourcesForFakeNews();
    console.log(`Encontrados ${crawledContent.length} conteúdos suspeitos`);
    
    const results = [];
    
    // 2. Analisar cada conteúdo
    for (const content of crawledContent) {
      console.log(`Analisando: ${content.title}`);
      
      const analyzedContent = await analyzeSuspiciousContent(content);
      
      // 3. Armazenar no banco de dados
      await storeMonitoredContent(supabase, analyzedContent);
      
      // 4. Iniciar fact-check automático se necessário
      await triggerFactCheckIfNeeded(analyzedContent);
      
      results.push(analyzedContent);
      
      // Delay entre análises para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return new Response(JSON.stringify({
      success: true,
      crawled_count: crawledContent.length,
      analyzed_count: results.length,
      high_priority_count: results.filter(r => r.priority_level === 'ALTA').length,
      fact_checks_triggered: results.filter(r => r.needs_fact_check && r.priority_level === 'ALTA').length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro no crawler bot:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
