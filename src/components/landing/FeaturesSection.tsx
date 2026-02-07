import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wallet, Shield, Zap, Users, Globe, Lock } from 'lucide-react';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

const features = [
  { icon: Wallet, title: 'Direct Tips', description: 'Receive ETH tips straight to your wallet. No waiting periods, no platform cuts.', color: BRAND_PRIMARY },
  { icon: Shield, title: 'True Ownership', description: 'Your content, your audience, your rules. Built on decentralized infrastructure.', color: BRAND_SECONDARY },
  { icon: Zap, title: 'Low Fees', description: 'Base L2 ensures minimal transaction costs for you and your viewers.', color: BRAND_PRIMARY },
  { icon: Users, title: 'Community First', description: 'Build genuine connections without algorithms deciding your reach.', color: BRAND_SECONDARY },
  { icon: Globe, title: 'Global Access', description: 'Stream to anyone, anywhere. No geographic restrictions or gatekeepers.', color: BRAND_PRIMARY },
  { icon: Lock, title: 'Privacy Native', description: 'Your wallet, your identity. Stay pseudonymous while building your brand.', color: BRAND_SECONDARY },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isTouch = useIsTouchDevice();

  return (
    <section id="features" ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${BRAND_PRIMARY.replace(')', ' / 0.1)')}`,
              border: `1px solid ${BRAND_PRIMARY.replace(')', ' / 0.2)')}`,
              color: BRAND_PRIMARY,
            }}
          >
            Why Vyve
          </span>

          <h2 className="font-varsity text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6">
            BUILT <span style={{ color: BRAND_PRIMARY }}>DIFFERENT</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to build a sustainable streaming career, without the corporate interference.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.06 * i + 0.2, duration: 0.4, ease: 'easeOut' }}
              whileHover={isTouch ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-3xl bg-card border border-border/50 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to bottom right, ${feature.color}, transparent)` }}
                />

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
