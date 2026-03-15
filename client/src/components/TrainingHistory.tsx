import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTrainingHistory, TrainingSession, deleteSession, clearHistory } from "@/lib/training";
import { ArrowLeft, Trash2, Calendar, Clock, Music2, Activity, Wind } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TrainingHistoryProps {
    onClose: () => void;
}

export function TrainingHistory({ onClose }: TrainingHistoryProps) {
    const [history, setHistory] = useState<TrainingSession[]>([]);

    useEffect(() => {
        setHistory(getTrainingHistory());
    }, []);

    const handleDelete = (id: string) => {
        deleteSession(id);
        setHistory(getTrainingHistory());
    };

    const handleClear = () => {
        if (confirm("Möchtest du wirklich den gesamten Verlauf löschen?")) {
            clearHistory();
            setHistory([]);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'methode36': return <Activity className="w-5 h-5 text-orange-500" />;
            case 'interval': return <Music2 className="w-5 h-5 text-purple-500" />;
            case 'breath': return <Wind className="w-5 h-5 text-blue-500" />;
            default: return <Activity className="w-5 h-5 text-zinc-500" />;
        }
    };

    const getTitle = (type: string) => {
        switch (type) {
            case 'methode36': return 'YOHN-Atmung';
            case 'interval': return 'Intervall-Training';
            case 'breath': return 'Stoffwechsel-Atmung';
            default: return 'Training';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Zurück
                    </Button>
                    <h2 className="text-2xl font-bold text-white">Trainings-Verlauf</h2>
                    {history.length > 0 && (
                        <Button 
                            variant="ghost" 
                            onClick={handleClear}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Alles löschen
                        </Button>
                    )}
                </div>

                <Card className="flex-1 bg-zinc-900/50 border-zinc-800 overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-zinc-800 pb-4">
                        <div className="flex justify-between items-center text-sm text-zinc-500 px-2">
                            <span className="w-32">Datum</span>
                            <span className="w-40">Training</span>
                            <span className="flex-1">Details</span>
                            <span className="w-24 text-right">Dauer</span>
                            <span className="w-10"></span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Noch keine Trainings absolviert.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {history.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors group">
                                            <div className="w-32 text-sm text-zinc-400 flex flex-col">
                                                <span className="text-white font-medium">
                                                    {format(new Date(session.date), 'dd.MM.yyyy')}
                                                </span>
                                                <span className="text-xs">
                                                    {format(new Date(session.date), 'HH:mm', { locale: de })} Uhr
                                                </span>
                                            </div>
                                            
                                            <div className="w-40 flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                                    {getIcon(session.type)}
                                                </div>
                                                <span className="text-sm font-medium text-zinc-200">
                                                    {getTitle(session.type)}
                                                </span>
                                            </div>

                                            <div className="flex-1 text-sm text-zinc-400">
                                                {session.tone && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs mr-2">
                                                        <Music2 className="w-3 h-3 mr-1" />
                                                        {session.tone} ({session.frequency} Hz)
                                                    </span>
                                                )}
                                                {session.notes && (
                                                    <span className="text-zinc-500 text-xs italic">
                                                        {session.notes}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="w-24 text-right text-sm font-mono text-zinc-300">
                                                {session.duration} Min
                                            </div>

                                            <div className="w-10 flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(session.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
