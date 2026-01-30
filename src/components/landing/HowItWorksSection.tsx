import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Wallet, Video, DollarSign, Trophy } from 'lucide-react';

// Fixed brand colors for landing page
const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Link your crypto wallet to get started. We support all major providers.',
    color: BRAND_PRIMARY,
  },
  {
    number: '02',
    icon: Video,
    title: 'Go Live',
    description: 'Start streaming in seconds with your unique stream key. No approval needed.',
    color: BRAND_SECONDARY,
  },
  {
    number: '03',
    icon: DollarSign,
    title: 'Earn Tips',
    description: 'Viewers tip you directly in ETH. Funds hit your wallet instantly.',
    color: BRAND_PRIMARY,
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Build Empire',
    description: 'Grow your audience and earn. Your success, your rewards.',
    color: BRAND_SECONDARY,
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND_PRIMARY.replace(')', ' / 0.05)')}` }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <span 
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${BRAND_SECONDARY.replace(')', ' / 0.1)')}`,
              border: `1px solid ${BRAND_SECONDARY.replace(')', ' / 0.2)')}`,
              color: BRAND_SECONDARY,
            }}
          >
            How It Works
          </span>
          
          <h2 className="font-varsity text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6">
            SIMPLE AS <span style={{ color: BRAND_SECONDARY }}>1-2-3-4</span>
          </h2>
        </motion.div>

        {/* Steps - Desktop */}
        <div className="hidden lg:block relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0 origin-left"
            style={{ background: `linear-gradient(to right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY}, ${BRAND_PRIMARY})` }}
          />

          <div className="grid grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 * i + 0.4, duration: 0.5, ease: "easeOut" }}
                onMouseEnter={() => setActiveStep(i)}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                {/* Circle with icon */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative w-24 h-24 rounded-full bg-card flex items-center justify-center mb-6 transition-colors duration-300"
                  style={{
                    border: `2px solid ${activeStep === i ? step.color : 'hsl(var(--border))'}`,
                  }}
                >
                  <motion.div
                    animate={activeStep === i ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <step.icon 
                      className="w-10 h-10 transition-colors duration-300" 
                      style={{ color: activeStep === i ? step.color : 'hsl(var(--muted-foreground))' }}
                    />
                  </motion.div>
                  
                  {/* Number badge */}
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="text-xs font-bold text-white">{step.number}</span>
                  </div>
                </motion.div>

                <h3 className="font-display text-xl font-semibold mb-2 transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Steps - Mobile */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.12 * i + 0.25, duration: 0.5, ease: "easeOut" }}
              className="flex gap-6 items-start"
            >
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                  <step.icon className="w-8 h-8" style={{ color: step.color }} />
                </div>
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: step.color }}
                >
                  <span className="text-xs font-bold text-white">{step.number}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute top-full left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
