import { Sparkles } from "lucide-react";

interface FunFactProps {
  text: string;
}

export function FunFact({ text }: FunFactProps) {
  return (
    <div className="card-clean p-4 bg-accent/50 border-accent">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}
