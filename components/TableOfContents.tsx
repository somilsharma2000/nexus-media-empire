"use client";

import { List, ChevronRight } from "lucide-react";

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace("## ", "").trim());

  if (headings.length < 2) return null;

  return (
    <div className="my-8 p-6 rounded-2xl bg-gray-950/80 border border-gray-800/80">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
        <List className="w-4 h-4 text-blue-400" /> Table of Contents & Structure
      </div>
      <ul className="space-y-2.5 text-xs">
        {headings.map((heading, i) => (
          <li key={i}>
            <a
              href={`#section-${i}`}
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 font-medium"
            >
              <ChevronRight className="w-3 h-3 text-gray-600" /> {heading}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
