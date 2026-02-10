"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useDivision } from "@/hooks/use-division";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

export function FileUpload({ onFileSelect, isLoading, error, success }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { divisionCode } = useDivision();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  const divisionColors = {
    APT: {
      accent: "text-apt-500",
      border: "border-apt-500",
      bg: "bg-apt-500/5",
    },
    HOSPI: {
      accent: "text-hospi-500",
      border: "border-hospi-500",
      bg: "bg-hospi-500/5",
    },
  };

  const colors = divisionColors[divisionCode];

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all group relative overflow-hidden",
          isDragActive
            ? cn(colors.border, colors.bg)
            : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50",
          isLoading && "pointer-events-none opacity-50"
        )}
        data-testid="file-dropzone"
      >
        <input {...getInputProps()} data-testid="file-input" />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
              isDragActive ? colors.bg : "bg-zinc-800",
              "group-hover:bg-zinc-700"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 transition-colors",
                isDragActive ? colors.accent : "text-zinc-400 group-hover:text-zinc-300"
              )}
            />
          </div>

          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? "Drop your Excel file here" : "Drag & drop your Excel file"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse. Supports .xlsx and .xls files
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && !success && (
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

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-4">
            <Button
              onClick={handleUpload}
              isLoading={isLoading}
              className="w-full"
              data-testid="upload-button"
            >
              {isLoading ? "Parsing Excel file..." : "Parse & Continue"}
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="font-medium text-emerald-500">File parsed successfully!</p>
            <p className="text-sm text-muted-foreground">Proceeding to validation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
