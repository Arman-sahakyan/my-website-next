import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"], // protect admin/API routes
    },
    sitemap: "https://oregontruckingpermit/sitemap.xml",
  };
}