
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, CheckSquare, ShieldQuestion } from "lucide-react";

const MediaLiteracy = () => {
  const tips = [
    {
      icon: <CheckSquare className="w-6 h-6 text-accent" />,
      title: "Verifique a Fonte",
      description: "Sempre questione de onde a informação vem. É uma fonte conhecida e confiável?"
    },
    {
      icon: <ShieldQuestion className="w-6 h-6 text-accent" />,
      title: "Leia Além do Título",
      description: "Não tire conclusões precipitadas. Títulos podem ser sensacionalistas. Leia o artigo completo."
    },
    {
      icon: <Library className="w-6 h-6 text-accent" />,
      title: "Busque Outras Fontes",
      description: "Compare a notícia com o que outros veículos de comunicação confiáveis estão dizendo."
    }
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">Capacite-se Contra a Desinformação</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">A melhor ferramenta é o conhecimento. Aprenda a identificar fake news com dicas práticas.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start text-left gap-4">
              <div className="bg-background p-3 rounded-full mt-1">
                {tip.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{tip.title}</h3>
                <p className="text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaLiteracy;
