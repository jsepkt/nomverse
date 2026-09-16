import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 p-2 flex items-center justify-center mb-6">
        <Image
          src="/mascot.svg"
          alt="Nomster 404"
          width={72}
          height={72}
          className="object-contain"
        />
      </div>
      <h1 className="text-4xl font-black text-white mb-2">404 — Candy Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        Nomster searched every block and validator node, but this page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-solana-green text-slate-950 hover:opacity-90 transition-all"
      >
        Return to NomVerse
      </Link>
    </div>
  );
}
