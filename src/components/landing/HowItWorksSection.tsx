import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Video, DollarSign, Trophy } from 'lucide-react';

const steps = [
  { number: '01', icon: Wallet, title: 'Connect Wallet', description: 'Link your crypto wallet to get started.' },
  { number: '02', icon: Video, title: 'Go Live', description: 'Start streaming with your unique stream key.' },
  { number: '03', icon: DollarSign, title: 'Earn Tips', description: 'Viewers tip you directly in ETH.' },
  { number: '04', icon: Trophy, title: 'Build Empire', description: 'Grow your audience and earn rewards.' },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold">Four Simple Steps</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * i + 0.2, duration: 0.3 }}
              className="text-center"
            >
              <div className="text-xs text-muted-foreground mb-3 font-medium">{step.number}</div>
              <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
