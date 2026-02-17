import type { VehicleNotes } from "../types/api";
import { VehicleNoteCard } from "./VehicleNoteCard";
import { Loader2 } from "lucide-react";

interface VehicleNotesListProps {
  notes: VehicleNotes[];
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
}

export function VehicleNotesList({ notes, onLoadMore, loading, hasMore }: VehicleNotesListProps) {
  // Sort notes by date descending (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {sortedNotes.map((note, index) => (
          // Using date + index as key in case IDs are missing, 
          // ideally use a unique ID if your API provides one.
          <VehicleNoteCard key={`${note.date}-${index}`} note={note} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Lade..." : "Mehr laden"}
          </button>
        </div>
      )}

      {!hasMore && notes.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          Alle Notizen geladen.
        </p>
      )}

      {!loading && notes.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Keine Notizen für diesen Zeitraum gefunden.
        </p>
      )}
    </div>
  );
}
