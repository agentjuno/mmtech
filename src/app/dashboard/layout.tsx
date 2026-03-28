import Link from "next/link";
import { type ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/deals", label: "Deals" },
  { href: "/dashboard/opportunities", label: "Opportunities" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <Link href="/" className="font-semibold tracking-tight text-sm">
            Midway
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">beta v0.1</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
