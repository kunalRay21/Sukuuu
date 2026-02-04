"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  CalendarIcon,
  Cog6ToothIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  {
    name: "Story Mode",
    href: "/dashboard/story",
    icon: SparklesIcon,
    highlight: true,
  },
  { name: "Timeline", href: "/dashboard/timeline", icon: CalendarIcon },
  { name: "Statistics", href: "/dashboard/statistics", icon: ChartBarIcon },
  { name: "Activity Patterns", href: "/dashboard/patterns", icon: ClockIcon },
  { name: "Highlights", href: "/dashboard/highlights", icon: FireIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
          Our Story
        </h1>
        <p className="font-mono text-xs text-slate-400 mt-1 tracking-wider">
          in Data
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`relative flex items-center px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/20 to-indigo-500/20 text-white"
                      : item.highlight
                        ? "text-pink-300 hover:bg-pink-500/10"
                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-400 to-indigo-400 rounded-r-full"
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 mr-3 ${item.highlight ? "text-pink-400" : ""}`}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.highlight && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="ml-auto text-xs"
                    >
                      ✨
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="px-4 py-3 bg-slate-800/50 rounded-xl backdrop-blur-sm">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
            Data Dashboard
          </p>
          <p className="font-serif text-lg font-semibold text-white mt-1">
            Your Archive
          </p>
          <p className="font-mono text-xs text-slate-400 mt-1">
            Local & Private
          </p>
        </div>
      </div>
    </div>
  );
}
