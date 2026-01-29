import { Trophy, Lock } from "lucide-react";

interface AchievementProps {
  title: string;
  description: string;
  unlocked: boolean;
  icon?: React.ReactNode;
}

export function Achievement({ title, description, unlocked, icon }: AchievementProps) {
  return (
    <div className={`card-clean p-4 flex items-center gap-4 ${!unlocked ? 'opacity-50' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        {unlocked ? (icon || <Trophy className="w-5 h-5" />) : <Lock className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      {unlocked && (
        <span className="text-xs text-success font-medium">✓</span>
      )}
    </div>
  );
}
