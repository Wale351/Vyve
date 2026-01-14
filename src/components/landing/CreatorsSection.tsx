import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  { value: '24/7', label: 'Uptime' },
  { value: '<1s', label: 'Latency' },
  { value: '4K', label: 'Max Quality' },
  { value: 'Unlimited', label: 'Bandwidth' },
];

const features = [
  'Multi-bitrate streaming',
  'Automatic VOD recording',
  'Real-time chat',
  'Viewer analytics',
  'Custom stream key',
  'No content restrictions',
];

export default function CreatorsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="creators" ref={ref} className="py-28 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="text-success font-medium text-sm tracking-widest uppercase mb-2"
            >
              For Creators
            </motion.p>
            <h2 className="font-varsity text-4xl md:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
              EVERYTHING YOU NEED
            </h2>
            
            <p className="text-muted-foreground text-lg mb-10 max-w-lg">
              Professional streaming infrastructure without the corporate overhead. 
              Focus on your content, we handle the tech.
            </p>

            {/* Feature checklist */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative p-10 rounded-3xl bg-card border border-border/50">
              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
              
              <div className="relative grid grid-cols-2 gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.15 * i + 0.4 }}
                    className="text-center"
                  >
                    <div className="font-varsity text-4xl md:text-5xl text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              
              {/* Bottom text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="relative mt-10 pt-8 border-t border-border/50 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Powered by <span className="text-foreground font-medium">Livepeer</span> decentralized video infrastructure
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
