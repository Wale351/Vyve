import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Shield, Zap, Users, Globe, Lock } from 'lucide-react';

// Fixed brand colors for landing page
const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

const features = [
  {
    icon: Wallet,
    title: 'Direct Tips',
    description: 'Receive ETH tips straight to your wallet. No waiting periods, no platform cuts.',
    color: BRAND_PRIMARY,
  },
  {
    icon: Shield,
    title: 'True Ownership',
    description: 'Your content, your audience, your rules. Built on decentralized infrastructure.',
    color: BRAND_SECONDARY,
  },
  {
    icon: Zap,
    title: 'Low Fees',
    description: 'Base L2 ensures minimal transaction costs for you and your viewers.',
    color: BRAND_PRIMARY,
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Build genuine connections without algorithms deciding your reach.',
    color: BRAND_SECONDARY,
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Stream to anyone, anywhere. No geographic restrictions or gatekeepers.',
    color: BRAND_PRIMARY,
  },
  {
    icon: Lock,
    title: 'Privacy Native',
    description: 'Your wallet, your identity. Stay pseudonymous while building your brand.',
    color: BRAND_SECONDARY,
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="relative py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      
      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${BRAND_PRIMARY.replace(')', ' / 0.1)')}`,
              border: `1px solid ${BRAND_PRIMARY.replace(')', ' / 0.2)')}`,
              color: BRAND_PRIMARY,
            }}
          >
            Why Vyve
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
            className="font-varsity text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6"
          >
            BUILT <span style={{ color: BRAND_PRIMARY }}>DIFFERENT</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Everything you need to build a sustainable streaming career, 
            without the corporate interference.
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * i + 0.4, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-3xl bg-card border border-border/50 overflow-hidden">
                {/* Hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-400"
                  style={{ background: `linear-gradient(to bottom right, ${feature.color}, transparent)` }}
                />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 
                  className="font-display text-xl font-semibold mb-3 transition-colors duration-300"
                  style={{ '--hover-color': feature.color } as React.CSSProperties}
                >
                  <span className="group-hover:text-[var(--hover-color)]">{feature.title}</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }} />
                  <div className="absolute top-4 right-8 w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: feature.color }} />
                  <div className="absolute top-8 right-4 w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: feature.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
