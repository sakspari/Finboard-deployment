"use client";

import { useTransactionStore } from "@/store/transactionStore";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/Dashboard").then((m) => m.Dashboard), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-text-secondary">Loading dashboard...</div>
    </div>
  ),
});

export default function Home() {
  const status = useTransactionStore((s) => s.status);
  const hasData = status === "success";

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="max-w-[1320px] mx-auto px-4 md:px-8 py-8 md:py-10">
        {hasData ? <Dashboard /> : <UploadZone />}
      </main>
    </div>
  );
}
