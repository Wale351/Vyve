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
    description: 'Your content, your audience, your rules.',
  },
  {
    icon: Zap,
    title: 'Low Fees',
    description: 'Base L2 ensures minimal transaction costs.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Build genuine connections without algorithms.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Stream to anyone, anywhere. No restrictions.',
  },
  {
    icon: Lock,
    title: 'Privacy Native',
    description: 'Stay pseudonymous while building your brand.',
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="features" ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-primary font-medium mb-2 block">Why Vyve</span>
          <h2 className="font-varsity text-4xl md:text-5xl tracking-wider mb-4">
            BUILT DIFFERENT
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to build a sustainable streaming career.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="p-6 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}