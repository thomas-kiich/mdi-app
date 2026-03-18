import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Download, Table as TableIcon, ChevronDown, ChevronUp } from "lucide-react";
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

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Helper function to convert HSL back to hex
function hslToHex(h: number, s: number, l: number): string {
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function FrequencyTable({ onClose }: FrequencyTableProps) {
  const [saturationValues, setSaturationValues] = useState<Record<number, number>>({});
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleSaturationChange = (id: number, value: number[]) => {
    setSaturationValues(prev => ({
      ...prev,
      [id]: value[0]
    }));
  };

  const toggleRowExpanded = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

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
                <TableHead className="hidden lg:table-cell w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequencyData.map((item) => {
                const saturation = saturationValues[item.id] ?? 100;
                const hsl = hexToHsl(item.hex);
                const modifiedHex = hslToHex(hsl.h, saturation, hsl.l);
                const isExpanded = expandedRows.has(item.id);

                return (
                  <React.Fragment key={item.id}>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer">
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
                      <TableCell className="hidden lg:table-cell">
                        <button
                          onClick={() => toggleRowExpanded(item.id)}
                          className="text-zinc-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Saturation Explorer */}
                    {isExpanded && (
                      <TableRow className="bg-zinc-900/50 border-zinc-800">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-4">
                            <div className="text-sm font-semibold text-white mb-3">
                              Sättigung erkunden für {item.colorName}
                            </div>

                            {/* Color Comparison */}
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">100% Sättigung</div>
                                <div
                                  className="w-full h-20 rounded-lg border border-white/20 shadow-lg"
                                  style={{ backgroundColor: item.hex }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">{saturation}% Sättigung</div>
                                <div
                                  className="w-full h-20 rounded-lg border border-white/20 shadow-lg"
                                  style={{ backgroundColor: modifiedHex }}
                                />
                              </div>
                            </div>

                            {/* Saturation Slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-xs uppercase tracking-wider text-zinc-400">
                                  Sättigung anpassen
                                </label>
                                <span className="text-sm font-bold text-white">{saturation}%</span>
                              </div>
                              <Slider
                                value={[saturation]}
                                onValueChange={(value) => handleSaturationChange(item.id, value)}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-zinc-500">
                                <span>Zart</span>
                                <span>Intensiv</span>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="bg-black/30 rounded-lg p-3 border border-zinc-700/50 mt-4">
                              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                                Talent / Wirkung:
                              </div>
                              <div className="text-sm text-white">
                                {item.talent}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-8 text-center text-zinc-500 text-sm">
          <p>MDI - Multidimensionales Identitätssystem © 2026</p>
          <p className="mt-2 text-xs text-zinc-600">Klicke auf die Pfeile, um die Sättigung jeder Farbe zu erkunden</p>
        </div>

      </div>
    </div>
  );
}
