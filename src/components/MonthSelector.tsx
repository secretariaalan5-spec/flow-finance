import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelectedMonth, setSelectedMonth } from '@/lib/dateStore';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function MonthSelector() {
  const selectedDate = useSelectedMonth();
  const now = new Date();
  
  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };
  
  const handleCurrent = () => {
    setSelectedMonth(new Date());
  };

  const isCurrentMonth = selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear();
  const monthName = MONTHS[selectedDate.getMonth()];
  const yearName = selectedDate.getFullYear();

  return (
    <div className="flex items-center justify-between px-2 mb-4 mt-2">
      <button 
        onClick={handlePrev}
        className="p-2 -ml-2 rounded-full text-muted-foreground hover:bg-muted transition-colors tap-scale"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={handleCurrent}
        className={`flex flex-col items-center tap-scale transition-opacity ${!isCurrentMonth ? 'opacity-70 hover:opacity-100' : ''}`}
      >
        <span className="text-base font-bold text-foreground">
          {monthName} <span className="font-normal text-muted-foreground">{yearName}</span>
        </span>
        {!isCurrentMonth && (
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-0.5">
            Voltar para o atual
          </span>
        )}
      </button>

      <button 
        onClick={handleNext}
        className="p-2 -mr-2 rounded-full text-muted-foreground hover:bg-muted transition-colors tap-scale"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
