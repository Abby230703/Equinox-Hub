"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useDivision } from "@/hooks/use-division";
import { downloadTemplate } from "@/lib/import-utils";
import type { ParsedRow } from "@/types/database";

interface UploadStepProps {
  onFileParsed: (rows: ParsedRow[], fileName: string) => void;
  parseFile: (file: File) => Promise<ParsedRow[]>;
  isLoading: boolean;
  error: string | null;
}

export function UploadStep({ onFileParsed, parseFile, isLoading, error }: UploadStepProps) {
  const { divisionCode, currentDivision } = useDivision();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);

  const divisionColors = {
    APT: { accent: "text-apt-500", border: "border-apt-500", bg: "bg-apt-500/5" },
    HOSPI: { accent: "text-hospi-500", border: "border-hospi-500", bg: "bg-hospi-500/5" },
  };
  const colors = divisionColors[divisionCode];

  const handleFileChange = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      return; // 10MB limit — error will be shown by parent
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls" && ext !== "csv") {
      return;
    }
    setSelectedFile(file);
    setParseSuccess(false);
    setPreviewRows([]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileChange(file);
    },
    [handleFileChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const rows = await parseFile(selectedFile);
      setPreviewRows(rows.slice(0, 5));
      setParseSuccess(true);
      setTimeout(() => {
        onFileParsed(rows, selectedFile.name);
      }, 800);
    } catch {
      // error is handled by parent via error prop
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setParseSuccess(false);
    setPreviewRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Division Info */}
      <div className={cn("rounded-lg border p-4 flex items-center justify-between", colors.border, colors.bg)}>
        <div>
          <p className="text-sm text-muted-foreground">Importing to</p>
          <p className="font-semibold text-foreground">{currentDivision.name}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all group relative overflow-hidden",
          isDragging ? cn(colors.border, colors.bg) : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-colors", isDragging ? colors.bg : "bg-zinc-800", "group-hover:bg-zinc-700")}>
            <Upload className={cn("w-8 h-8 transition-colors", isDragging ? colors.accent : "text-zinc-400 group-hover:text-zinc-300")} />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragging ? "Drop your Excel file here" : "Drag & drop your Excel file"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse. Supports .xlsx files up to 10 MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && !parseSuccess && (
        <div className="bg-card border border-border rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", colors.bg)}>
                <FileSpreadsheet className={cn("w-6 h-6", colors.accent)} />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-4">
            <Button onClick={handleUpload} isLoading={isLoading} className="w-full">
              {isLoading ? "Parsing Excel file..." : "Parse & Continue"}
            </Button>
          </div>
        </div>
      )}

      {/* Parse Success + Preview */}
      {parseSuccess && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="font-medium text-emerald-500">File parsed successfully!</p>
              <p className="text-sm text-muted-foreground">Proceeding to validation...</p>
            </div>
          </div>

          {previewRows.length > 0 && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  Preview (first {previewRows.length} rows)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/50 border-b border-border">
                    <tr>
                      <th className="p-2 text-left text-xs text-muted-foreground">SKU</th>
                      <th className="p-2 text-left text-xs text-muted-foreground">Name</th>
                      <th className="p-2 text-left text-xs text-muted-foreground">Category</th>
                      <th className="p-2 text-left text-xs text-muted-foreground">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.rowNumber} className="border-b border-border">
                        <td className="p-2 font-mono text-zinc-300">{row.sku || "-"}</td>
                        <td className="p-2 text-foreground max-w-[200px] truncate">{row.name}</td>
                        <td className="p-2 text-muted-foreground">{row.categoryName}</td>
                        <td className="p-2 text-foreground">{row.sellingPrice > 0 ? `₹${row.sellingPrice.toFixed(2)}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
