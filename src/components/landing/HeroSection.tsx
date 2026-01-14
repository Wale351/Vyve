import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'hsl(var(--primary) / 0.08)' }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'hsl(var(--secondary) / 0.06)' }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="max-w-5xl mx-auto">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border/60 mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm text-muted-foreground">Live on Base Sepolia Testnet</span>
          </motion.div>

          {/* Headlines */}
          <div className="space-y-2 mb-8">
            <motion.div className="overflow-hidden">
              <motion.h1
                initial={{ y: 120 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="font-varsity text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-wider leading-[0.85]"
              >
                <span className="text-foreground">STREAM</span>
              </motion.h1>
            </motion.div>
            
            <motion.div className="overflow-hidden">
              <motion.h1
                initial={{ y: 120 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="font-varsity text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-wider leading-[0.85]"
              >
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  WITHOUT
                </span>
              </motion.h1>
            </motion.div>

            <motion.div className="overflow-hidden">
              <motion.h1
                initial={{ y: 120 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="font-varsity text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-wider leading-[0.85]"
              >
                <span className="text-foreground">LIMITS</span>
              </motion.h1>
            </motion.div>
          </div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            Decentralized streaming for web3 gaming. Own your content, 
            receive tips directly to your wallet.
            <span className="text-foreground font-medium"> Zero platform fees.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <WalletConnectButton variant="premium" size="lg" className="text-base px-8 py-5 group">
              Start Streaming
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </WalletConnectButton>
            
            <motion.a
              href="#features"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-card hover:bg-muted text-foreground font-medium transition-colors border border-border/50"
            >
              Learn More
            </motion.a>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-20 pt-10 border-t border-border/30"
          >
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              {[
                { label: 'Platform Fees', value: '0%' },
                { label: 'Creator Ownership', value: '100%' },
                { label: 'Payment Speed', value: 'Instant' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="flex items-baseline gap-3"
                >
                  <span className="font-varsity text-3xl md:text-4xl text-primary">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-9 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ height: ['30%', '50%', '30%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 bg-muted-foreground/40 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
