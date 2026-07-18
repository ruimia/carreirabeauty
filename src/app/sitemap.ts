import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { APP_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: jobs }, { data: professionals }, { data: companies }] = await Promise.all([
    supabase.from("jobs").select("slug, criado_em").eq("status", "ativa").not("slug", "is", null),
    supabase.from("professionals").select("slug, criado_em").eq("bloqueado", false).not("slug", "is", null),
    supabase.from("companies").select("slug, criado_em").eq("bloqueado", false).not("slug", "is", null),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/vagas`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${APP_URL}/termos`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${APP_URL}/privacidade`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const vagasUrls: MetadataRoute.Sitemap = (jobs ?? []).map((j) => ({
    url: `${APP_URL}/vaga/${j.slug}`,
    lastModified: j.criado_em ? new Date(j.criado_em) : undefined,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const perfisUrls: MetadataRoute.Sitemap = (professionals ?? []).map((p) => ({
    url: `${APP_URL}/perfil/${p.slug}`,
    lastModified: p.criado_em ? new Date(p.criado_em) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const empresasUrls: MetadataRoute.Sitemap = (companies ?? []).map((c) => ({
    url: `${APP_URL}/empresa/${c.slug}`,
    lastModified: c.criado_em ? new Date(c.criado_em) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...estaticas, ...vagasUrls, ...perfisUrls, ...empresasUrls];
}
