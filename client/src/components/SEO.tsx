import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string;
}

export default function SEO({ 
  title, 
  description, 
  canonical,
  image = "https://tymflohub.com/og-image.png",
  type = "website",
  keywords
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const updateMeta = (selector: string, attribute: string, content: string) => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (selector.includes('property')) {
          meta.setAttribute("property", selector.split('"')[1]);
        } else {
          meta.setAttribute("name", selector.split('"')[1]);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const removeMeta = (selector: string) => {
      const meta = document.querySelector(selector);
      if (meta) {
        meta.remove();
      }
    };

    updateMeta('meta[name="description"]', "content", description);
    
    if (keywords) {
      updateMeta('meta[name="keywords"]', "content", keywords);
    } else {
      removeMeta('meta[name="keywords"]');
    }

    updateMeta('meta[property="og:title"]', "content", title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:type"]', "content", type);
    updateMeta('meta[property="og:image"]', "content", image);
    updateMeta('meta[property="og:site_name"]', "content", "TymFlo Hub");
    
    if (canonical) {
      updateMeta('meta[property="og:url"]', "content", canonical);
      
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    } else {
      removeMeta('meta[property="og:url"]');
      removeMeta('link[rel="canonical"]');
    }

    updateMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    updateMeta('meta[name="twitter:title"]', "content", title);
    updateMeta('meta[name="twitter:description"]', "content", description);
    updateMeta('meta[name="twitter:image"]', "content", image);
  }, [title, description, canonical, image, type, keywords]);

  return null;
}
