import Link from "next/link";

import { MobileNavSelect, SidebarNav } from "@/components/layout/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-950 text-slate-200 lg:block">
        <div className="border-b border-slate-800 px-5 py-5">
          <Link href="/" className="block">
            <p className="font-serif text-3xl font-semibold tracking-tight text-white">
              Netra
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Engineering intelligence
            </p>
          </Link>
        </div>

        <SidebarNav />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-serif text-2xl font-semibold tracking-tight"
            >
              Netra
            </Link>
            <MobileNavSelect />
          </div>
        </header>

        <main className="min-h-screen px-4 py-5 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
