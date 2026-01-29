import { AlertTriangle } from "lucide-react";

interface WarningProps {
  title: string;
  description: string;
}

export function Warning({ title, description }: WarningProps) {
  return (
    <div className="card-clean p-4 border-warning/30 bg-warning/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
