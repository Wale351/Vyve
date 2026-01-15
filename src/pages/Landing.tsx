import { forwardRef } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CreatorsSection from '@/components/landing/CreatorsSection';
import FeaturedGamesSection from '@/components/landing/FeaturedGamesSection';
import LandingFooter from '@/components/landing/LandingFooter';

const Landing = forwardRef<HTMLDivElement>(function Landing(_props, ref) {
  return (
    <div ref={ref} className="min-h-screen bg-background overflow-x-hidden">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CreatorsSection />
      <FeaturedGamesSection />
      <LandingFooter />
    </div>
  );
});

export default Landing;
