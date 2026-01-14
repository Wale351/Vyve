import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-card" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Headline */}
          <h2 className="font-varsity text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6 text-foreground">
            READY TO GO LIVE?
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10">
            Connect your wallet and start streaming in under a minute. 
            No signups, no approvals, no limits.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <WalletConnectButton variant="premium" size="lg" className="text-base px-10 py-6 group">
              Connect Wallet
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </WalletConnectButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Free to start
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              No credit card
            </span>
            <span className="text-border hidden sm:block">|</span>
            <span className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Testnet ready
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
