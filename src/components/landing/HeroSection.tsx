import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center pt-24 pb-16">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Two column layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-varsity text-5xl sm:text-6xl md:text-7xl tracking-wider leading-[0.95] mb-6"
              >
                <span className="block text-foreground">STREAM.</span>
                <span className="block text-primary">EARN.</span>
                <span className="block text-foreground">OWN.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8"
              >
                The decentralized streaming platform where creators truly own their audience. 
                Receive tips directly to your wallet.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <WalletConnectButton variant="premium" size="lg" className="text-base px-6 py-5 gap-2">
                  Start Streaming
                  <ArrowRight className="w-4 h-4" />
                </WalletConnectButton>
                
                <a
                  href="#features"
                  className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Learn More
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0"
              >
                {[
                  { value: '0%', label: 'Platform Fees' },
                  { value: '100%', label: 'Ownership' },
                  { value: 'Instant', label: 'Payments' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="font-varsity text-2xl text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                >
                  <source src="/videos/platform-demo.mov" type="video/mp4" />
                </video>
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>
              
              {/* Floating accent */}
              <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}