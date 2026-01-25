import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Play, 
  ArrowRight, 
  Wallet, 
  Radio, 
  Coins, 
  Shield, 
  Eye,
  Send,
  Lock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const isHowItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingHeader />
      
      {/* Hero Section - Clean and Bold */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[100px]" />
        </div>
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 container px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">Now live on</span>
              <span className="font-semibold text-[#0052FF]">Base</span>
            </motion.div>
            
            {/* Headlines */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
            >
              <span className="text-foreground">Stream.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Earn.</span>
              <br />
              <span className="text-foreground">Own.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            >
              The streaming platform where creators keep 100% of their tips. 
              No middlemen. Direct to your wallet.
            </motion.p>
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/">
                <Button variant="premium" size="lg" className="gap-2 text-base px-8">
                  <Play className="h-5 w-5" fill="currentColor" />
                  Watch Live
                </Button>
              </Link>
              <Link to="/apply/streamer">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                  Start Streaming
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center justify-center gap-12 mt-16 text-center"
            >
              {[
                { value: '0%', label: 'Platform Fee' },
                { value: '100%', label: 'To Creators' },
                { value: 'Instant', label: 'Payments' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* How It Works - Merged, Clean */}
      <section ref={howItWorksRef} className="py-24 md:py-32 relative">
        <div className="container px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              How Vyve Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A streaming platform built for creators, powered by Base
            </p>
          </motion.div>
          
          {/* Two column layout - Viewers & Streamers */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Viewers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">For Viewers</h3>
              </div>
              
              <div className="space-y-5">
                {[
                  { icon: Play, title: 'Watch instantly', desc: 'No signup needed to browse and watch live streams' },
                  { icon: Wallet, title: 'Connect to interact', desc: 'Link your wallet to chat, follow, and tip' },
                  { icon: Coins, title: 'Tip on Base', desc: 'Send ETH directly to creators — no middleman' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* For Streamers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold">For Streamers</h3>
              </div>
              
              <div className="space-y-5">
                {[
                  { icon: Send, title: 'Apply to stream', desc: 'Quick application to maintain quality content' },
                  { icon: Radio, title: 'Go live with OBS', desc: 'Use your stream key with any RTMP software' },
                  { icon: Coins, title: 'Keep 100%', desc: 'All tips go straight to your wallet, instantly' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/apply/streamer" className="block mt-6">
                <Button variant="premium" className="w-full gap-2">
                  Apply to Stream
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12"
          >
            {[
              { icon: Lock, label: 'Wallet privacy protected' },
              { icon: Shield, label: 'Vetted streamers' },
              { icon: Zap, label: 'Low gas on Base' },
              { icon: Eye, label: 'Onchain transparency' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary/70" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to start?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Vyve and experience streaming without the platform tax.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button variant="premium" size="lg" className="gap-2">
                  <Play className="h-5 w-5" fill="currentColor" />
                  Watch Streams
                </Button>
              </Link>
              <Link to="/apply/streamer">
                <Button variant="outline" size="lg" className="gap-2">
                  Become a Streamer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <LandingFooter />
    </div>
  );
}