import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Wallet, 
  Radio, 
  MessageCircle, 
  Users, 
  Coins,
  Shield,
  Lock,
  Eye,
  Send,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vyve</span> Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A live streaming platform where creators earn directly from viewers, powered by Base
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/">
                <Button variant="premium" size="lg" className="gap-2">
                  <Play className="h-5 w-5" fill="currentColor" />
                  Watch Live
                </Button>
              </Link>
              <Link to="/apply/streamer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Radio className="h-5 w-5" />
                  Apply to Stream
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Viewer Flow Section */}
      <section className="py-16 md:py-20 border-t border-border/30">
        <div className="container px-4">
          <motion.div 
            className="max-w-5xl mx-auto"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Eye className="h-4 w-4" />
                For Viewers
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Watch, Chat, Support
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Jump into live streams without any barriers. No signup required to watch.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Watch Live Streams</h3>
                <p className="text-sm text-muted-foreground">
                  Browse and watch live gaming streams instantly. No login required to start watching.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Chat & Follow</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to join the chat, follow your favorite creators, and engage with the community.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 rounded-md bg-[#0052FF]/20 text-[#0052FF] text-xs font-medium">
                    Tip on Base
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Tip Creators</h3>
                <p className="text-sm text-muted-foreground">
                  Send ETH tips directly to creators on Base. Tips go straight to their wallet — no platform middleman.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Streamer Flow Section */}
      <section className="py-16 md:py-20 bg-muted/30 border-t border-border/30">
        <div className="container px-4">
          <motion.div 
            className="max-w-5xl mx-auto"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                <Radio className="h-4 w-4" />
                For Streamers
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Stream & Earn
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Apply once, stream forever. Keep 100% of your tips.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', icon: Send, title: 'Apply', desc: 'Submit your streamer application with your background and content plans' },
                { step: '2', icon: CheckCircle2, title: 'Get Approved', desc: 'Our team reviews applications to ensure quality content' },
                { step: '3', icon: Radio, title: 'Go Live', desc: 'Use OBS or any RTMP software with your unique stream key' },
                { step: '4', icon: Coins, title: 'Earn Tips', desc: 'Receive ETH tips in real-time, directly to your wallet' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeIn} className="glass-card p-6 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 mt-2">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeIn} className="text-center mt-10">
              <Link to="/apply/streamer">
                <Button variant="premium" size="lg" className="gap-2">
                  Apply to Become a Streamer
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Web3 Simplification Section */}
      <section className="py-16 md:py-20 border-t border-border/30">
        <div className="container px-4">
          <motion.div 
            className="max-w-5xl mx-auto"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF]/10 text-[#0052FF] text-sm font-medium mb-4">
                <Zap className="h-4 w-4" />
                Simple Web3
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                No Complexity, Just Streaming
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've stripped away the Web3 complexity. No tokens, no NFTs, just native ETH on Base.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Wallet Optional to Watch</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse and watch streams without connecting a wallet. Only connect when you want to chat, follow, or tip.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Native ETH on Base</h3>
                  <p className="text-sm text-muted-foreground">
                    Tips are sent as native ETH on the Base network. No special tokens or bridges required.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Wallet Privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    Your wallet address is never shown publicly. Only your username is visible to others.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="glass-card p-6 md:p-8 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Send className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Direct Transfers</h3>
                  <p className="text-sm text-muted-foreground">
                    Tips go directly from your wallet to the streamer's wallet. No custody, no delays.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 md:py-20 bg-muted/30 border-t border-border/30">
        <div className="container px-4">
          <motion.div 
            className="max-w-5xl mx-auto"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                Trust & Safety
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Safe & Secure
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We take platform integrity seriously with multiple layers of protection.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, title: 'Streamer Applications', desc: 'Every streamer is vetted before going live' },
                { icon: Shield, title: 'Admin Moderation', desc: 'Active moderation and content review' },
                { icon: MessageCircle, title: 'Rate-Limited Chat', desc: 'Spam protection and chat moderation tools' },
                { icon: Eye, title: 'Onchain Transparency', desc: 'All tips are verifiable on-chain' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeIn} className="glass-card p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-t border-border/30">
        <div className="container px-4">
          <motion.div 
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Vyve today and experience the future of live streaming.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/">
                <Button variant="premium" size="lg" className="gap-2">
                  <Play className="h-5 w-5" fill="currentColor" />
                  Explore Streams
                </Button>
              </Link>
              <Link to="/apply/streamer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Radio className="h-5 w-5" />
                  Become a Streamer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Badge */}
      <div className="py-8 border-t border-border/30">
        <div className="container px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold text-[#0052FF]">Base</span>
          </div>
        </div>
      </div>
    </div>
  );
}
