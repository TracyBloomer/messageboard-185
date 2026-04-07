"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Feather, House, UserRound } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { href: "/", label: "Feed", icon: House },
  { href: "/compose", label: "Compose", icon: Feather },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/me", label: "Me", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-screen-md px-4 pb-4">
      <div className="rounded-[28px] border border-white/80 bg-white/95 px-3 py-2 shadow-soft backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-blue-50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
