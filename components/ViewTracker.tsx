"use client";

import { useEffect } from "react";

export default function ViewTracker({ articleId }: { articleId: string | number }) {
  useEffect(() => {
    if (articleId) {
      fetch(`/api/articles/${articleId}/view`, { method: "POST" }).catch(() => {});
    }
  }, [articleId]);

  return null;
}
