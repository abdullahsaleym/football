import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FCOMS — Football Club Management",
  description: "Admin dashboard for the FCOMS football club platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">
        <div className="relative isolate flex min-h-screen">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -top-40 left-1/3 size-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 size-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
          </div>
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
