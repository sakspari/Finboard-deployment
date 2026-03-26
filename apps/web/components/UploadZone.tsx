"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTransactionStore } from "@/store/transactionStore";
import { uploadCsv } from "@/lib/api";
import { LIMITS } from "@finboard/shared";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const status = useTransactionStore((s) => s.status);
  const errorMessage = useTransactionStore((s) => s.errorMessage);
  const setLoading = useTransactionStore((s) => s.setLoading);
  const setUploadResult = useTransactionStore((s) => s.setUploadResult);
  const setError = useTransactionStore((s) => s.setError);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = status === "loading";

  const handleFile = useCallback(
    async (file: File) => {
      if (isUploading) return;

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      if (file.size > LIMITS.MAX_FILE_SIZE) {
        setError(`File must be under ${LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading();

      try {
        const result = await uploadCsv(file, controller.signal);
        if (controller.signal.aborted) return;
        setUploadResult(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        abortRef.current = null;
      }
    },
    [isUploading, setLoading, setUploadResult, setError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isUploading) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="w-full max-w-xl"
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200
            ${isDragging
              ? "border-balance bg-balance-bg scale-[1.01]"
              : "border-border hover:border-border-hover"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            {isUploading ? (
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-balance" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary">
                <FileSpreadsheet className="h-8 w-8 text-text-secondary" />
              </div>
            )}

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary">
                {isUploading ? "Processing..." : "Drop your bank statement"}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {isUploading
                  ? "Parsing and categorizing your transactions"
                  : "CSV files up to 5MB. Your data stays in your browser."}
              </p>
            </div>

            {!isUploading && (
              <button className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary transition-colors">
                <Upload className="h-4 w-4" />
                Browse files
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {status === "error" && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-expense-bg px-4 py-3 text-sm text-expense"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
