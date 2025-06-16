
-- Criar tabelas para o sistema completo do Veritas
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  original_claim TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'false', 'misleading', 'unverified')),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0
);

-- Tabela para fontes e evidências
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
  source_type TEXT CHECK (source_type IN ('news', 'academic', 'government', 'expert', 'social_media')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para análises de deep research
CREATE TABLE public.research_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_content TEXT NOT NULL,
  ai_analysis TEXT NOT NULL,
  research_data JSONB NOT NULL,
  sources_found INTEGER DEFAULT 0,
  processing_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  article_id UUID REFERENCES public.articles(id)
);

-- Tabela para especialistas
CREATE TABLE public.experts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  expertise_areas TEXT[] NOT NULL,
  credentials TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para validações de especialistas
CREATE TABLE public.expert_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES public.experts(id),
  validation_status TEXT CHECK (validation_status IN ('approved', 'rejected', 'needs_revision')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para monitoramento de fake news
CREATE TABLE public.monitored_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source_url TEXT,
  platform TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'processed', 'published')),
  priority_score INTEGER DEFAULT 0,
  viral_potential INTEGER DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_content ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para artigos (público pode ler, apenas autenticados podem escrever)
CREATE POLICY "Anyone can view published articles" ON public.articles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create articles" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their articles" ON public.articles
  FOR UPDATE USING (auth.uid() = author_id);

-- Políticas para fontes
CREATE POLICY "Anyone can view sources" ON public.sources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage sources" ON public.sources
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para research analyses
CREATE POLICY "Anyone can view research analyses" ON public.research_analyses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create research analyses" ON public.research_analyses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para especialistas
CREATE POLICY "Anyone can view verified experts" ON public.experts
  FOR SELECT USING (verified_at IS NOT NULL);

CREATE POLICY "Users can manage their expert profile" ON public.experts
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para validações
CREATE POLICY "Anyone can view validations" ON public.expert_validations
  FOR SELECT USING (true);

CREATE POLICY "Experts can create validations" ON public.expert_validations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.experts WHERE user_id = auth.uid() AND verified_at IS NOT NULL)
  );

-- Políticas para conteúdo monitorado
CREATE POLICY "Authenticated users can view monitored content" ON public.monitored_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create monitored content" ON public.monitored_content
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Funções para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para auto-update de timestamps
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Criar slug base do título
    base_slug := lower(trim(regexp_replace(title_text, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := left(base_slug, 50);
    
    final_slug := base_slug;
    
    -- Verificar se já existe e adicionar contador se necessário
    WHILE EXISTS (SELECT 1 FROM public.articles WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
