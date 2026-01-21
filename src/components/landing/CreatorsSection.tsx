import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote, Star, Verified } from 'lucide-react';

const testimonials = [
  {
    quote: "Finally, a platform that respects creators. 100% of my tips go to my wallet.",
    author: "CryptoGamer",
    role: "Gaming Streamer",
    avatar: "🎮",
    rating: 5,
  },
  {
    quote: "The instant payments are a game changer. No more waiting weeks for payouts.",
    author: "BlockchainBabe",
    role: "NFT Artist",
    avatar: "🎨",
    rating: 5,
  },
  {
    quote: "No algorithms deciding my reach. My content, my audience, my rules.",
    author: "DeFiDan",
    role: "Crypto Educator",
    avatar: "📚",
    rating: 5,
  },
];

const stats = [
  { value: '24/7', label: 'Uptime' },
  { value: '<1s', label: 'Latency' },
  { value: '4K', label: 'Max Quality' },
  { value: '∞', label: 'No Limits' },
];

export default function CreatorsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="creators" ref={ref} className="py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-6">
            Creator Stories
          </span>
          
          <h2 className="font-varsity text-5xl md:text-6xl lg:text-7xl tracking-wider mb-6">
            BUILT FOR <span className="text-success">CREATORS</span>
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real streamers share why they chose true ownership and instant payments.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ delay: 0.15 * i + 0.3, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <div className="h-full p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300">
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold">{testimonial.author}</span>
                      <Verified className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
          <div className="relative p-8 md:p-12 rounded-3xl border border-border/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-varsity text-4xl md:text-5xl text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
