"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  CalendarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Timeline", href: "/dashboard/timeline", icon: CalendarIcon },
  { name: "Statistics", href: "/dashboard/statistics", icon: ChartBarIcon },
  { name: "Activity Patterns", href: "/dashboard/patterns", icon: ClockIcon },
  { name: "Highlights", href: "/dashboard/highlights", icon: FireIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-serif font-bold">Our Story</h1>
        <p className="text-gray-400 text-sm mt-1">in Data</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="px-4 py-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400">Data Dashboard</p>
          <p className="text-sm font-semibold mt-1">945 Messages</p>
          <p className="text-xs text-gray-400 mt-1">90 Days</p>
        </div>
      </div>
    </div>
  );
}
