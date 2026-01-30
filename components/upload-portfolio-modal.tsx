"use client";

import React from "react"

import { useState, useCallback } from "react";
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadPortfolioModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

type UploadState = "idle" | "parsing" | "uploading" | "success" | "error";

export function UploadPortfolioModal({ open, onClose, userId, onSuccess }: UploadPortfolioModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [companies, setCompanies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((text: string): string[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const companies: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle quoted values and commas
      const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      
      // Skip header row if detected
      if (i === 0 && values.some((v) => v.toLowerCase() === "company" || v.toLowerCase() === "name")) {
        continue;
      }
      
      // Take first non-empty value as company name
      const companyName = values.find((v) => v.length > 0);
      if (companyName) {
        companies.push(companyName);
      }
    }
    
    return [...new Set(companies)]; // Remove duplicates
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setUploadState("parsing");
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        setError("No companies found in file. Make sure your CSV has company names.");
        setUploadState("error");
        return;
      }
      
      setCompanies(parsed);
      setUploadState("uploading");
      
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, companies: parsed }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload portfolio");
      }
      
      setUploadState("success");
      setTimeout(() => {
        onSuccess();
        handleReset();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      setUploadState("error");
    }
  }, [parseCSV, userId, onSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFile(file);
    } else {
      setError("Please upload a CSV file");
      setUploadState("error");
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setUploadState("idle");
    setCompanies([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Portfolio Companies</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your portfolio companies. One company name per row.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {uploadState === "idle" && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-600 mb-2">
                  Drag and drop your CSV file here, or
                </p>
                <label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] cursor-pointer">
                    browse to upload
                  </span>
                </label>
              </div>

              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500 font-medium mb-1">Expected format:</p>
                <code className="text-xs text-neutral-600 block">
                  Company<br />
                  Stripe<br />
                  Figma<br />
                  Notion
                </code>
              </div>
            </>
          )}

          {(uploadState === "parsing" || uploadState === "uploading") && (
            <div className="py-8 text-center">
              <div className="w-10 h-10 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-600">
                {uploadState === "parsing" ? "Parsing CSV file..." : "Uploading companies..."}
              </p>
            </div>
          )}

          {uploadState === "success" && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-[#10B981]" />
              </div>
              <p className="text-sm font-medium text-neutral-900 mb-1">
                Successfully uploaded {companies.length} companies
              </p>
              <p className="text-xs text-neutral-500">
                {companies.slice(0, 3).join(", ")}{companies.length > 3 ? ` and ${companies.length - 3} more` : ""}
              </p>
            </div>
          )}

          {uploadState === "error" && (
            <div className="py-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center mb-4">{error}</p>
              <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
