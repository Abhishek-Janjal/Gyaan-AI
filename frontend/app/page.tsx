'use client';
import dynamic from "next/dynamic";

const ParticleSimulation = dynamic(
  () => import("@/components/ParticleSimulation"),
  { ssr: false, loading: () => <div style={{ width: "100vw", height: "100vh", background: "#000" }} /> }
);

export default function Home() {
  return <ParticleSimulation />;
}
