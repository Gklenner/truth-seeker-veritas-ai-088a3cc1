
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialPost {
  platform: string;
  content: string;
  hashtags: string[];
  image_url?: string;
  link_url?: string;
}

interface DistributionResult {
  platform: string;
  success: boolean;
  post_id?: string;
  error?: string;
  reach_estimate: number;
}

async function generateSocialContent(article: any): Promise<SocialPost[]> {
  const baseContent = `🚨 VERIFICAÇÃO DE FATOS 🚨\n\n`;
  const verificationEmoji = article.verification_status === 'false' ? '❌ FALSO' : 
                           article.verification_status === 'misleading' ? '⚠️ ENGANOSO' :
                           article.verification_status === 'verified' ? '✅ VERIFICADO' : '🔍 EM ANÁLISE';
  
  const hashtagsBase = ['#FactCheck', '#VeritasBrasil', '#CombateAsFakeNews', '#Verdade'];
  
  // Post para Twitter/X
  const twitterContent = `${baseContent}${verificationEmoji}\n\n"${article.original_claim.substring(0, 80)}..."\n\nConfira nossa análise completa:`;
  
  // Post para Instagram
  const instagramContent = `${baseContent}${verificationEmoji}\n\n${article.original_claim.substring(0, 100)}...\n\nVerificação completa no link da bio! 📱\n\n#VerdadeImporta #NãoCaiaNaFakeNews`;
  
  // Post para Facebook
  const facebookContent = `${baseContent}${verificationEmoji}\n\n"${article.original_claim}"\n\nNossa equipe de fact-checkers analisou esta informação. Veja a verificação completa e as fontes utilizadas:`;
  
  return [
    {
      platform: 'twitter',
      content: twitterContent,
      hashtags: [...hashtagsBase, '#Twitter'],
      link_url: `https://veritas.com/article/${article.slug}`
    },
    {
      platform: 'instagram',
      content: instagramContent,
      hashtags: [...hashtagsBase, '#Instagram', '#Stories'],
      image_url: generateFactCheckImage(article)
    },
    {
      platform: 'facebook',
      content: facebookContent,
      hashtags: [...hashtagsBase, '#Facebook'],
      link_url: `https://veritas.com/article/${article.slug}`
    },
    {
      platform: 'telegram',
      content: `${baseContent}${verificationEmoji}\n\n"${article.original_claim}"\n\nAnálise completa: https://veritas.com/article/${article.slug}\n\nCompartilhe para combater a desinformação! 🛡️`,
      hashtags: hashtagsBase
    }
  ];
}

function generateFactCheckImage(article: any): string {
  // Em uma implementação real, geraria uma imagem dinamicamente
  // Por agora, retornamos um placeholder que representa a verificação
  const status = article.verification_status;
  const color = status === 'verified' ? 'green' : status === 'false' ? 'red' : 'yellow';
  
  return `https://via.placeholder.com/1080x1080/${color}/white?text=VERITAS+${status.toUpperCase()}`;
}

async function simulatePostToSocial(post: SocialPost): Promise<DistributionResult> {
  // Simular posting para redes sociais
  // Em produção, integraria com APIs reais: Twitter API, Instagram Graph API, etc.
  
  const reachEstimates = {
    twitter: Math.floor(Math.random() * 5000) + 1000,
    instagram: Math.floor(Math.random() * 8000) + 2000,
    facebook: Math.floor(Math.random() * 10000) + 3000,
    telegram: Math.floor(Math.random() * 3000) + 500
  };
  
  // Simular diferentes taxas de sucesso
  const successRates = {
    twitter: 0.85,
    instagram: 0.78,
    facebook: 0.82,
    telegram: 0.90
  };
  
  const success = Math.random() < (successRates[post.platform as keyof typeof successRates] || 0.8);
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de API
  
  if (success) {
    return {
      platform: post.platform,
      success: true,
      post_id: `${post.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reach_estimate: reachEstimates[post.platform as keyof typeof reachEstimates] || 1000
    };
  } else {
    return {
      platform: post.platform,
      success: false,
      error: `Falha ao publicar no ${post.platform}: Rate limit ou erro de API`,
      reach_estimate: 0
    };
  }
}

async function scheduleFollowUpPosts(article: any, initialResults: DistributionResult[]): Promise<void> {
  // Agendar posts de acompanhamento baseados no engajamento
  const successfulPosts = initialResults.filter(r => r.success);
  
  if (successfulPosts.length > 0) {
    console.log(`Agendando posts de acompanhamento para ${successfulPosts.length} plataformas`);
    
    // Em produção, agendaria posts para horários de pico
    // e criaria variações do conteúdo para maximizar alcance
  }
}

async function updateArticleWithSocialStats(supabase: any, articleId: string, results: DistributionResult[]): Promise<void> {
  try {
    const totalReach = results.reduce((sum, r) => sum + r.reach_estimate, 0);
    const successfulPosts = results.filter(r => r.success).length;
    
    const { error } = await supabase
      .from('articles')
      .update({
        share_count: totalReach,
        // Poderia adicionar campo para tracking de redes sociais
      })
      .eq('id', articleId);
    
    if (error) {
      console.error('Erro ao atualizar stats do artigo:', error);
    } else {
      console.log(`Stats atualizadas: ${successfulPosts} posts publicados, alcance estimado: ${totalReach}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar stats:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { article_id, article_data } = await req.json();
    
    if (!article_id && !article_data) {
      throw new Error('ID do artigo ou dados do artigo são obrigatórios');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let article = article_data;
    
    // Se só temos o ID, buscar o artigo
    if (article_id && !article_data) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', article_id)
        .single();
      
      if (error || !data) {
        throw new Error('Artigo não encontrado');
      }
      
      article = data;
    }
    
    console.log(`Iniciando distribuição social para: ${article.title}`);
    
    // 1. Gerar conteúdo para diferentes redes sociais
    const socialPosts = await generateSocialContent(article);
    console.log(`Gerados ${socialPosts.length} posts para diferentes plataformas`);
    
    // 2. Distribuir para redes sociais
    const distributionResults: DistributionResult[] = [];
    
    for (const post of socialPosts) {
      console.log(`Publicando no ${post.platform}...`);
      const result = await simulatePostToSocial(post);
      distributionResults.push(result);
      
      // Delay entre posts para evitar spam
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 3. Agendar posts de acompanhamento
    await scheduleFollowUpPosts(article, distributionResults);
    
    // 4. Atualizar estatísticas do artigo
    await updateArticleWithSocialStats(supabase, article.id, distributionResults);
    
    const successCount = distributionResults.filter(r => r.success).length;
    const totalReach = distributionResults.reduce((sum, r) => sum + r.reach_estimate, 0);
    
    return new Response(JSON.stringify({
      success: true,
      article_title: article.title,
      posts_created: socialPosts.length,
      successful_posts: successCount,
      failed_posts: distributionResults.length - successCount,
      estimated_reach: totalReach,
      distribution_results: distributionResults,
      platforms_reached: distributionResults.filter(r => r.success).map(r => r.platform)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na distribuição social:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
