import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Car, Pencil } from "lucide-react";
import { getVehicleNotes, addVehiclesNotes, deleteVehicleNote, getVehicleImage, uploadVehicleImage } from "@/lib/api";
import type { VehicleNotes } from "@/types/api";
import { VehicleNoteCard } from "@/components/VehicleNoteCard";
import { AddNoteModal } from "@/components/AddNoteModal";

export default function VehicleProfile() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const deviceId = searchParams.get("device");

    const [notes, setNotes] = useState<VehicleNotes[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicleImage, setVehicleImage] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Ref for hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup Object URLs to prevent memory leaks when the component unmounts
    // or when the image URL changes.
    useEffect(() => {
        return () => {
            if (vehicleImage && vehicleImage.startsWith("blob:")) {
                URL.revokeObjectURL(vehicleImage);
            }
        };
    }, [vehicleImage]);

    // 1. Fetch Data
    useEffect(() => {
        if (!deviceId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedNotes, fetchedImage] = await Promise.all([
                    getVehicleNotes(deviceId),
                    getVehicleImage(deviceId)
                ]);

                // Sort notes by date descending
                const sorted = fetchedNotes.sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime());
                setNotes(sorted);
                setVehicleImage(fetchedImage);
            } catch (error) {
                console.error("Failed to load vehicle profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deviceId]);

    // 2. Handlers
    const handleAddNote = async (data: { noteDate: string; noteText: string; notePrice?: number }) => {
        if (!deviceId) return;
        try {
            const newNote = await addVehiclesNotes(deviceId, data);
            setNotes((prev) => [newNote, ...prev].sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime()));
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!deviceId) return;
        if (!window.confirm("Möchten Sie diese Notiz wirklich löschen?")) return;

        setDeletingId(id);
        try {
            await deleteVehicleNote(deviceId, id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Failed to delete note", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!deviceId || !event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        const previousImage = vehicleImage;

        // Optimistic Update: Create a local URL so the UI updates instantly
        const localImageUrl = URL.createObjectURL(file);
        setVehicleImage(localImageUrl);

        try {
            // Perform the upload
            await uploadVehicleImage(deviceId, file);
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Bild konnte nicht hochgeladen werden.");

            // Revert to the old image if the upload fails
            setVehicleImage(previousImage);
            URL.revokeObjectURL(localImageUrl);
        } finally {
            // Reset the input value so the user can select the same file again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (!deviceId) return <div className="p-6">Kein Fahrzeug ausgewählt</div>;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6 max-w-2xl">

                {/* Header */}
                <div className="flex items-center mb-6 px-4 md:px-0">
                    <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Fahrzeugdetails</h1>
                </div>

                <div className="space-y-8 px-4 md:px-0">

                    {/* --- Image Section --- */}
                    <div className="relative w-full aspect-video md:aspect-[21/9] bg-muted rounded-xl overflow-hidden shadow-sm border group">
                        {vehicleImage ? (
                            <img
                                src={vehicleImage}
                                alt="Vehicle"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                <Car className="w-12 h-12 mb-2 opacity-50" />
                                <span className="text-sm">Kein Bild vorhanden</span>
                            </div>
                        )}

                        {/* Edit/Upload Button Overlay */}
                        <div className="absolute bottom-3 right-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm border px-3 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
                            >
                                <Pencil className="w-4 h-4" />
                                <span>Bearbeiten</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                            />
                        </div>
                    </div>

                    {/* --- Notes Section --- */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                Wartung & Notizen
                                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {notes.length}
                                </span>
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Neu
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                                <p>Noch keine Einträge vorhanden.</p>
                                <button onClick={() => setIsAddModalOpen(true)} className="text-primary hover:underline mt-2 text-sm">
                                    Ersten Eintrag erstellen
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <VehicleNoteCard
                                        key={note.id}
                                        note={note}
                                        onDelete={() => handleDeleteNote(note.id)}
                                        isDeleting={deletingId === note.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddNoteModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddNote}
            />
        </div>
    );
}
