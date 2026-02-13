import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-24">
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
              <span className="block">Stream.</span>
              <span className="block text-muted-foreground">Earn.</span>
              <span className="block">Own.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            The decentralized streaming platform where creators truly own their audience.
            Receive tips directly to your wallet.{' '}
            <span className="text-foreground">No middlemen. No cuts.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <WalletConnectButton variant="default" size="lg" className="text-base px-8 py-6">
              Start Streaming
              <ArrowRight className="w-4 h-4 ml-2" />
            </WalletConnectButton>

            <a
              href="#features"
              className="px-8 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Explore Features
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: '0%', label: 'Platform Fees' },
              { value: '100%', label: 'Ownership' },
              { value: 'Instant', label: 'Payments' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-landing-float">
        <div className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-landing-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
