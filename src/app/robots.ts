import type { MetadataRoute } from "next";

const siteUrl = "https://openecommerce.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/landing"],
        disallow: ["/api/", "/auth/", "/scan/", "/setting", "/template", "/test", "/workspace"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
