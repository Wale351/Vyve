import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Video, DollarSign, Trophy } from 'lucide-react';

const steps = [
  { number: '01', icon: Wallet, title: 'Connect Wallet', description: 'Link your crypto wallet to get started.' },
  { number: '02', icon: Video, title: 'Go Live', description: 'Start streaming in seconds.' },
  { number: '03', icon: DollarSign, title: 'Earn Tips', description: 'Viewers tip you directly in ETH.' },
  { number: '04', icon: Trophy, title: 'Build Empire', description: 'Grow your audience and earn.' },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-sm text-secondary font-medium mb-2 block">How It Works</span>
          <h2 className="font-varsity text-4xl md:text-5xl tracking-wider">
            SIMPLE AS 1-2-3-4
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full rounded-xl bg-card border border-border flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}