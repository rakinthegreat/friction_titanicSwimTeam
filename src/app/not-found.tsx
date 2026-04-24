import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--background)] p-6 text-center">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-accent-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex max-w-2xl flex-col items-center bg-card/30 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
        {/* Illustration Container */}
        <div className="relative mb-8 aspect-square w-full max-w-[400px] animate-float drop-shadow-2xl">
          <Image
            src="/404-bg.png"
            alt="404 Not Found Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
              Lost in the Abyss?
            </h1>
            <p className="mx-auto max-w-[450px] text-lg text-foreground/70 leading-relaxed">
              We couldn't find the page you're looking for. It might have drifted away into the digital void.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 pt-4 sm:flex-row">
            <Link href="/" passHref>
              <Button 
                size="lg" 
                className="group relative px-12 py-8 text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/30 bg-accent text-white"
              >
                <span>Return Home</span>
              </Button>
            </Link>
            
            <Link href="/dashboard" passHref>
              <Button 
                variant="outline"
                size="lg" 
                className="px-12 py-8 text-xl rounded-2xl transition-all hover:bg-foreground/5 border-foreground/10 text-foreground/80"
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle 404 text background */}
        <span className="absolute -top-24 left-1/2 -translate-x-1/2 text-[18rem] font-bold text-foreground/[0.02] select-none pointer-events-none -z-10">
          404
        </span>
      </div>
    </main>
  );
}
