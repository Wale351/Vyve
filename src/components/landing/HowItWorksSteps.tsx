import { motion } from 'framer-motion';
import { Wallet, Video, DollarSign, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Link your crypto wallet to get started. We support all major providers.',
    color: 'text-primary',
  },
  {
    number: '02',
    icon: Video,
    title: 'Go Live',
    description: 'Start streaming in seconds with your unique stream key. No approval needed.',
    color: 'text-secondary',
  },
  {
    number: '03',
    icon: DollarSign,
    title: 'Earn Tips',
    description: 'Viewers tip you directly in ETH. Funds hit your wallet instantly.',
    color: 'text-success',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Build Empire',
    description: 'Grow your audience and earn. Your success, your rewards.',
    color: 'text-foreground',
  },
];

export default function HowItWorksSteps() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      
      <div className="container px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-foreground">SIMPLE AS </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">1-2-3-4</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-success/50 hidden md:block -translate-y-1/2" style={{ top: '80px' }} />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="text-center"
              >
                {/* Icon Circle */}
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-border/50 bg-background flex items-center justify-center relative z-10">
                    <step.icon className={`h-8 w-8 md:h-10 md:w-10 ${step.color}`} />
                  </div>
                  {/* Step number badge */}
                  <span className={`absolute -top-1 -right-1 w-7 h-7 rounded-full ${
                    i === 0 ? 'bg-primary' : 
                    i === 1 ? 'bg-secondary' : 
                    i === 2 ? 'bg-success' : 
                    'bg-muted'
                  } flex items-center justify-center text-xs font-bold text-primary-foreground`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display text-lg md:text-xl font-semibold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
