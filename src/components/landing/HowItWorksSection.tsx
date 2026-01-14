import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Video, DollarSign, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Link your crypto wallet. We support all major providers.',
  },
  {
    number: '02',
    icon: Video,
    title: 'Go Live',
    description: 'Start streaming with your unique key. No approval needed.',
  },
  {
    number: '03',
    icon: DollarSign,
    title: 'Earn Tips',
    description: 'Viewers tip you directly in ETH. Instant settlement.',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Grow',
    description: 'Build your audience and earn. Your success, your rewards.',
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
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
            className="text-secondary font-medium text-sm tracking-widest uppercase mb-2"
          >
            Process
          </motion.p>
          <h2 className="font-varsity text-4xl md:text-5xl lg:text-6xl tracking-wider text-foreground">
            HOW IT WORKS
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px bg-border" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary via-secondary to-success origin-left"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i + 0.3, duration: 0.4 }}
              className="relative"
            >
              {/* Step number circle */}
              <div className="relative z-10 w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <step.icon className="w-6 h-6 text-primary" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="text-center lg:text-left">
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
