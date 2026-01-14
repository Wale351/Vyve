import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Shield, Zap, Users, Globe, Lock } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Direct Tips',
    description: 'Receive ETH tips straight to your wallet. No waiting periods, no platform cuts.',
    gradient: 'from-primary to-info',
  },
  {
    icon: Shield,
    title: 'True Ownership',
    description: 'Your content, your audience, your rules. Built on decentralized infrastructure.',
    gradient: 'from-secondary to-warning',
  },
  {
    icon: Zap,
    title: 'Low Fees',
    description: 'Base L2 ensures minimal transaction costs for you and your viewers.',
    gradient: 'from-success to-primary',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Build genuine connections without algorithms deciding your reach.',
    gradient: 'from-warning to-secondary',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Stream to anyone, anywhere. No geographic restrictions or gatekeepers.',
    gradient: 'from-info to-primary',
  },
  {
    icon: Lock,
    title: 'Privacy Native',
    description: 'Your wallet, your identity. Stay pseudonymous while building your brand.',
    gradient: 'from-primary to-secondary',
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
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            Why Vyve
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="font-varsity text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6"
          >
            BUILT <span className="text-primary">DIFFERENT</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
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
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i + 0.5, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-3xl bg-card border border-border/50 overflow-hidden">
                {/* Hover gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-br ${feature.gradient}`} />
                  <div className={`absolute top-4 right-8 w-1 h-1 rounded-full bg-gradient-to-br ${feature.gradient} opacity-60`} />
                  <div className={`absolute top-8 right-4 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feature.gradient} opacity-40`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
