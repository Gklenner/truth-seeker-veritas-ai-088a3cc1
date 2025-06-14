
import { BotMessageSquare } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BotMessageSquare className="text-accent" size={32} />
          <h1 className="text-2xl font-bold text-white">Veritas</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
