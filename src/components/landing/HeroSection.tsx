import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Play, Users, Zap } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

const floatingElements = [
  { icon: Play, delay: 0, x: '10%', y: '20%', size: 48 },
  { icon: Users, delay: 0.5, x: '85%', y: '30%', size: 40 },
  { icon: Zap, delay: 1, x: '15%', y: '70%', size: 36 },
  { icon: Sparkles, delay: 1.5, x: '80%', y: '75%', size: 44 },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[100vh] flex items-center overflow-hidden pt-24">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating icons */}
        {floatingElements.map((el, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50"
            style={{ left: el.x, top: el.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.8, 
              scale: 1,
              y: [0, -15, 0],
            }}
            transition={{ 
              opacity: { delay: el.delay + 0.5, duration: 0.5 },
              scale: { delay: el.delay + 0.5, duration: 0.5, type: "spring" },
              y: { delay: el.delay + 1, duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <el.icon className="w-6 h-6 text-primary" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <motion.div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9]"
            >
              <span className="block text-foreground">STREAM.</span>
            </motion.h1>
          </motion.div>
          
          <motion.div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9]"
            >
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                EARN.
              </span>
            </motion.h1>
          </motion.div>

          <motion.div className="overflow-hidden mb-10">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9]"
            >
              <span className="block text-foreground">OWN.</span>
            </motion.h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The decentralized streaming platform where creators truly own their audience. 
            Receive tips directly to your wallet. <span className="text-foreground font-medium">No middlemen. No cuts.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <WalletConnectButton variant="premium" size="lg" className="text-lg px-8 py-6 group">
              Start Streaming
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </WalletConnectButton>
            
            <motion.a
              href="#features"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
            >
              Explore Features
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '0%', label: 'Platform Fees' },
              { value: '100%', label: 'Ownership' },
              { value: 'Instant', label: 'Payments' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="text-center"
              >
                <div className="font-varsity text-3xl md:text-4xl text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ height: ['20%', '60%', '20%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 bg-muted-foreground/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
