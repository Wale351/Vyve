import { motion } from 'framer-motion';
import { 
  Wallet, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Lock 
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Direct Tips',
    description: 'Receive ETH tips straight to your wallet. No waiting periods, no platform cuts.',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    icon: Shield,
    title: 'True Ownership',
    description: 'Your content, your audience, your rules. Built on decentralized infrastructure.',
    iconBg: 'bg-secondary/20',
    iconColor: 'text-secondary',
  },
  {
    icon: Zap,
    title: 'Low Fees',
    description: 'Base L2 ensures minimal transaction costs for you and your viewers.',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Build genuine connections without algorithms deciding your reach.',
    iconBg: 'bg-secondary/20',
    iconColor: 'text-secondary',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Stream to anyone, anywhere. No geographic restrictions or gatekeepers.',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    icon: Lock,
    title: 'Privacy Native',
    description: 'Your wallet, your identity. Stay pseudonymous while building your brand.',
    iconBg: 'bg-gradient-to-br from-primary/20 to-secondary/20',
    iconColor: 'text-primary',
  },
];

export default function BuiltDifferentSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Why Vyve
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">BUILT </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DIFFERENT</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to build a sustainable streaming career, without the corporate interference.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
