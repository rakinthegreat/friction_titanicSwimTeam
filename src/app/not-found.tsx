import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-8 max-w-md animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <h1 className="text-8xl font-black italic tracking-tighter text-accent/20">404</h1>
          <h2 className="text-3xl font-black uppercase tracking-tight">Page Not Found</h2>
          <p className="text-foreground/40 font-medium">
            It looks like this path is a bit of a friction point itself. Let's get you back on track.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-3 px-8 py-4 bg-card rounded-2xl shadow-neo-out hover:shadow-neo-in hover:scale-95 active:scale-90 transition-all group border border-white/5"
        >
          <ArrowLeft className="w-5 h-5 text-accent group-hover:-translate-x-1 transition-transform" />
          <span className="font-black uppercase tracking-widest text-sm">Return Home</span>
        </Link>
      </div>
    </main>
  );
}
