import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Play, Users, Zap } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

const floatingElements = [
  { icon: Play, delay: 0, x: '10%', y: '20%', size: 48 },
  { icon: Users, delay: 0.3, x: '85%', y: '30%', size: 40 },
  { icon: Zap, delay: 0.6, x: '15%', y: '70%', size: 36 },
  { icon: Sparkles, delay: 0.9, x: '80%', y: '75%', size: 44 },
];

// Fixed brand colors for landing page (not affected by theme accent)
const BRAND_PRIMARY = 'hsl(175, 85%, 45%)'; // Cyan
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)'; // Coral/Orange

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
      {/* Animated Background - Fixed brand colors */}
      <div className="absolute inset-0">
        {/* Soft gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${BRAND_PRIMARY.replace(')', ' / 0.12)')} 0%, transparent 60%)`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${BRAND_SECONDARY.replace(')', ' / 0.1)')} 0%, transparent 60%)`,
          }}
          animate={{
            scale: [1.08, 1, 1.08],
            x: [0, -18, 0],
            y: [0, 18, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating icons - smoother animations */}
        {floatingElements.map((el, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50"
            style={{ left: el.x, top: el.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0.8, 
              scale: 1,
              y: [0, -12, 0],
            }}
            transition={{ 
              opacity: { delay: el.delay + 0.3, duration: 0.6, ease: "easeOut" },
              scale: { delay: el.delay + 0.3, duration: 0.6, ease: "easeOut" },
              y: { delay: el.delay + 0.8, duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <el.icon className="w-6 h-6" style={{ color: BRAND_PRIMARY }} />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline - Smoother stagger */}
          <motion.div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9]"
            >
              <span className="block text-foreground">STREAM.</span>
            </motion.h1>
          </motion.div>
          
          <motion.div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9]"
            >
              <span 
                className="block bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
                style={{
                  backgroundImage: `linear-gradient(to right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY}, ${BRAND_PRIMARY})`,
                }}
              >
                EARN.
              </span>
            </motion.h1>
          </motion.div>

          <motion.div className="overflow-hidden mb-10">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="font-varsity text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider leading-[0.9]"
            >
              <span className="block text-foreground">OWN.</span>
            </motion.h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The decentralized streaming platform where creators truly own their audience. 
            Receive tips directly to your wallet. <span className="text-foreground font-medium">No middlemen. No cuts.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <WalletConnectButton variant="premium" size="lg" className="text-lg px-8 py-6 group">
              Start Streaming
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: "easeOut" }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '0%', label: 'Platform Fees' },
              { value: '100%', label: 'Ownership' },
              { value: 'Instant', label: 'Payments' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="text-center"
              >
                <div className="font-varsity text-3xl md:text-4xl mb-1" style={{ color: BRAND_PRIMARY }}>{stat.value}</div>
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
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ height: ['20%', '50%', '20%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 bg-muted-foreground/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
