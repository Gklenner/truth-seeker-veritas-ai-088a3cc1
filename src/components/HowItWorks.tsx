
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Users, Link } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Bot className="w-8 h-8 text-accent" />,
      title: "IA Avançada",
      description: "Nossos modelos de linguagem analisam o conteúdo em busca de inconsistências, vieses e fontes não confiáveis."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Especialistas Humanos",
      description: "Em casos complexos, nossa rede de especialistas (jornalistas e acadêmicos) revisa a análise da IA para garantir a precisão."
    },
    {
      icon: <Link className="w-8 h-8 text-accent" />,
      title: "Integração Contínua",
      description: "O Veritas se integrará ao seu navegador e redes sociais para alertá-lo sobre desinformação em tempo real."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">Como Funciona?</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">Combinamos o poder da inteligência artificial com a sabedoria humana para uma verificação de fatos robusta e confiável.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center bg-card border-border/50">
              <CardHeader>
                <div className="mx-auto bg-background p-3 rounded-full w-fit mb-4">
                  {step.icon}
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
