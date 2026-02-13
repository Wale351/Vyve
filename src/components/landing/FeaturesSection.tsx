import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Shield, Zap, Users, Globe, Lock } from 'lucide-react';

const features = [
  { icon: Wallet, title: 'Direct Tips', description: 'Receive ETH tips straight to your wallet. No waiting periods, no platform cuts.' },
  { icon: Shield, title: 'True Ownership', description: 'Your content, your audience, your rules. Built on decentralized infrastructure.' },
  { icon: Zap, title: 'Low Fees', description: 'Base L2 ensures minimal transaction costs for you and your viewers.' },
  { icon: Users, title: 'Community First', description: 'Build genuine connections without algorithms deciding your reach.' },
  { icon: Globe, title: 'Global Access', description: 'Stream to anyone, anywhere. No geographic restrictions or gatekeepers.' },
  { icon: Lock, title: 'Privacy Native', description: 'Your wallet, your identity. Stay pseudonymous while building your brand.' },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" ref={ref} className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Why Vyve</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built Different</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to build a sustainable streaming career.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.05 * i + 0.2, duration: 0.3 }}
              className="bg-background p-8 hover:bg-card transition-colors"
            >
              <feature.icon className="w-5 h-5 text-muted-foreground mb-4" strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
