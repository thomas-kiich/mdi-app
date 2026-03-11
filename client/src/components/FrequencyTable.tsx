import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Table as TableIcon } from "lucide-react";
import frequencyData from '@/lib/frequencyData.json';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FrequencyTableProps {
  onClose: () => void;
}

export function FrequencyTable({ onClose }: FrequencyTableProps) {
  const handleDownloadPDF = () => {
    // Simple text export for now, similar to the result export
    const headers = ["ID", "Farbe", "Frequenz (Hz)", "Licht (nm)", "Klang (Thz)", "Wirkung", "Talent"];
    const rows = frequencyData.map(item => [
      item.id,
      item.colorName,
      item.frequency,
      item.lightRange,
      item.toneRange,
      item.description,
      item.talent
    ]);

    const csvContent = [
      headers.join("\t"),
      ...rows.map(row => row.join("\t"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "MDI_Frequenztabelle.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/90 backdrop-blur-md py-4 z-10 border-b border-zinc-800">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
          </Button>
          
          <h1 className="text-xl font-bold flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-orange-500" />
            Frequenz-Tabelle (24 Typen)
          </h1>

          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

        {/* Table Content */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/30">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="w-[50px] text-zinc-400">ID</TableHead>
                <TableHead className="w-[150px] text-zinc-400">Farbe</TableHead>
                <TableHead className="text-zinc-400">Frequenz</TableHead>
                <TableHead className="text-zinc-400">Licht (nm)</TableHead>
                <TableHead className="text-zinc-400">Klang (Thz)</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-400">Wirkung</TableHead>
                <TableHead className="hidden lg:table-cell text-zinc-400">Talent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequencyData.map((item) => (
                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-mono text-zinc-500">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-white/10 shadow-sm" 
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="font-medium">{item.colorName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-orange-400">{item.frequency} Hz</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">{item.lightRange}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">{item.toneRange}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-zinc-300 max-w-[200px] truncate" title={item.description}>
                    {item.description}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-zinc-300 max-w-[200px] truncate" title={item.talent}>
                    {item.talent}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-8 text-center text-zinc-500 text-sm">
          <p>MDI - Multidimensionales Identitätssystem © 2026</p>
        </div>

      </div>
    </div>
  );
}
