import { motion } from 'framer-motion';
import { ArrowRight, Play, Users, Zap, Sparkles } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

const floatingElements = [
  { icon: Play, x: '10%', y: '20%' },
  { icon: Users, x: '85%', y: '30%' },
  { icon: Zap, x: '15%', y: '70%' },
  { icon: Sparkles, x: '80%', y: '75%' },
];

const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-24">
      {/* Background — pure CSS animations instead of framer-motion infinite loops */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full blur-3xl animate-landing-blob-1"
          style={{
            background: `radial-gradient(circle, ${BRAND_PRIMARY.replace(')', ' / 0.12)')} 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl animate-landing-blob-2"
          style={{
            background: `radial-gradient(circle, ${BRAND_SECONDARY.replace(')', ' / 0.1)')} 0%, transparent 60%)`,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating icons — CSS float only, hidden on mobile */}
        {floatingElements.map((el, i) => (
          <div
            key={i}
            className="absolute hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 opacity-80 animate-landing-float"
            style={{
              left: el.x,
              top: el.y,
              animationDelay: `${i * 0.8}s`,
            }}
          >
            <el.icon className="w-6 h-6" style={{ color: BRAND_PRIMARY }} />
          </div>
        ))}
      </div>

      {/* Content — simple fade-in, no scroll-linked transforms */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9] mb-6">
              <span className="block text-foreground">STREAM.</span>
            </h1>
            <h1 className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9] mb-6">
              <span
                className="block bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
                style={{
                  backgroundImage: `linear-gradient(to right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY}, ${BRAND_PRIMARY})`,
                }}
              >
                EARN.
              </span>
            </h1>
            <h1 className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9] mb-10">
              <span className="block text-foreground">OWN.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The decentralized streaming platform where creators truly own their audience.
            Receive tips directly to your wallet.{' '}
            <span className="text-foreground font-medium">No middlemen. No cuts.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <WalletConnectButton variant="premium" size="lg" className="text-lg px-8 py-6 group">
              Start Streaming
              <ArrowRight className="w-5 h-5 ml-2" />
            </WalletConnectButton>

            <a
              href="#features"
              className="px-8 py-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '0%', label: 'Platform Fees' },
              { value: '100%', label: 'Ownership' },
              { value: 'Instant', label: 'Payments' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-varsity text-3xl md:text-4xl mb-1" style={{ color: BRAND_PRIMARY }}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — CSS only */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-landing-float">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-landing-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
