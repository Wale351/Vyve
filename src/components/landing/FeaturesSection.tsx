import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Shield, Zap, Users, Globe, Lock } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Direct Tips',
    description: 'Receive ETH tips straight to your wallet. No waiting, no cuts.',
  },
  {
    icon: Shield,
    title: 'True Ownership',
    description: 'Your content, your audience. Built on decentralized infrastructure.',
  },
  {
    icon: Zap,
    title: 'Minimal Fees',
    description: 'Base L2 ensures the lowest transaction costs possible.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Build real connections without algorithmic interference.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Stream to anyone, anywhere. No geographic restrictions.',
  },
  {
    icon: Lock,
    title: 'Privacy Native',
    description: 'Stay pseudonymous while building your brand.',
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-28 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="text-primary font-medium text-sm tracking-widest uppercase mb-2"
          >
            Platform
          </motion.p>
          <h2 className="font-varsity text-4xl md:text-5xl lg:text-6xl tracking-wider text-foreground max-w-2xl">
            BUILT FOR STREAMERS, BY STREAMERS
          </h2>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i + 0.2, duration: 0.4 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-2xl bg-card border border-border/40 hover:border-border transition-colors">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
