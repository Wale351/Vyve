import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturedGamesSection from '@/components/landing/FeaturedGamesSection';
import LandingFooter from '@/components/landing/LandingFooter';

const Landing = forwardRef<HTMLDivElement>(function Landing(_props, ref) {
  return (
    <motion.div 
      ref={ref} 
      className="min-h-screen bg-background overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FeaturedGamesSection />
      <LandingFooter />
    </motion.div>
  );
});

export default Landing;
