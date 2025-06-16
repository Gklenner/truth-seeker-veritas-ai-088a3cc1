
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateArticle(researchData: any): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  const systemPrompt = `Você é um jornalista especializado em fact-checking. Crie um artigo completo de verificação de fatos baseado na pesquisa fornecida. O artigo deve:

1. Ter um título claro e direto
2. Explicar a alegação original
3. Apresentar as evidências encontradas
4. Citar todas as fontes
5. Ter uma conclusão clara sobre a veracidade
6. Ser escrito em português, com linguagem acessível
7. Incluir seções bem estruturadas

Formato: Use markdown para formatação.`;

  const prompt = `${systemPrompt}\n\nDados da pesquisa: ${JSON.stringify(researchData)}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar artigo";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { original_claim, research_data, user_id } = await req.json();
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gerar artigo automaticamente
    const articleContent = await generateArticle(research_data);
    
    // Extrair título do artigo gerado
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `Verificação: ${original_claim.substring(0, 50)}...`;
    
    // Gerar slug único
    const { data: slugData } = await supabase.rpc('generate_unique_slug', { title_text: title });
    const slug = slugData || title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Criar artigo no banco
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        content: articleContent,
        original_claim,
        verification_status: research_data.verification_status,
        confidence_score: research_data.confidence_score,
        author_id: user_id,
        slug,
        tags: ['verificacao', 'fact-check']
      })
      .select()
      .single();

    if (articleError) throw articleError;

    // Salvar fontes
    if (research_data.sources && research_data.sources.length > 0) {
      const { error: sourcesError } = await supabase
        .from('sources')
        .insert(
          research_data.sources.map((source: any) => ({
            article_id: article.id,
            url: source.url,
            title: source.title,
            description: source.description,
            credibility_score: source.credibility_score,
            source_type: source.source_type
          }))
        );

      if (sourcesError) console.error('Erro ao salvar fontes:', sourcesError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      article_id: article.id,
      slug: article.slug 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na publicação automática:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
