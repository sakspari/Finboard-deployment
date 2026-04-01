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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-9rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="w-full max-w-2xl"
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`glass-shell glass-grid relative cursor-pointer rounded-[32px] p-12 md:p-16 text-center transition-all duration-300
            ${isDragging
              ? "!bg-slate-800 border-blue-500/60 scale-[1.015] shadow-[0_20px_80px_rgba(59,130,246,0.15)]"
              : "hover:border-slate-600 hover:-translate-y-0.5"
            }
            ${isUploading ? "pointer-events-none opacity-70" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-5 md:gap-6">
            {isUploading ? (
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500 shadow-lg" />
            ) : (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-panel-soft flex h-20 w-20 items-center justify-center rounded-[28px]"
              >
                <FileSpreadsheet className="h-9 w-9 text-slate-400" />
              </motion.div>
            )}

            <div className="space-y-2">
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-slate-100">
                {isUploading ? "Processing your statement" : "Drop your bank statement"}
              </h2>
              <p className="mx-auto max-w-md text-sm md:text-base text-slate-400 leading-relaxed">
                {isUploading
                  ? "Parsing rows, detecting categories, and turning the CSV into a polished finance dashboard."
                  : "Upload a CSV up to 5MB and Finboard will turn it into clean spending visuals, category insights, and searchable transactions."}
              </p>
            </div>

            {!isUploading && (
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className="glass-button mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-slate-100 transition-all"
              >
                <Upload className="h-4 w-4" />
                Browse files
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {status === "error" && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-expense"
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
