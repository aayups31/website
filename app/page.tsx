import type { Metadata } from "next";
import { AutomotiveHome } from "@/components/automotive/automotive-home";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Aayu Pratap Singh — Engineering in motion",
  description:
    "A cinematic portfolio for Aayu Pratap Singh: product engineering, machine learning, infrastructure, simulation, VFX, and photography.",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader immersive soundControl={false} />
      <AutomotiveHome />
    </>
  );
}
