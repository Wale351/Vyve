import { useEffect } from "react";

type PageMeta = {
  title: string;
  description?: string;
  canonicalPath?: string;
};

export function usePageMeta({ title, description, canonicalPath }: PageMeta) {
  useEffect(() => {
    document.title = title;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }

    // Canonical link (best-effort)
    if (canonicalPath) {
      const href = `${window.location.origin}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = href;
    }
  }, [title, description, canonicalPath]);
}
