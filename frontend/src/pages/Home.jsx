import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to hide loader after 5s in case Spline takes too long
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="relative">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-20 h-20 bg-primary/20 rounded-full blur-2xl absolute -inset-0"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
              >
                <Zap className="w-12 h-12 text-primary fill-primary" />
              </motion.div>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="w-full h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center premium-shadow">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight gradient-text">TaskFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-all premium-shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden bg-black">

        {/* Floating Spline Model */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 150, scale: 0.8 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 150 : 0, scale: isLoading ? 0.8 : 1.3 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="w-full h-full max-w-[1200px] max-h-[800px] transition-all duration-1000"
            style={{
              maskImage: 'radial-gradient(circle, black 30%, transparent 60%)',
              WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 60%)',
              filter: 'brightness(0.85)'
            }}
          >
            <Spline
              onLoad={() => setIsLoading(false)}
              scene="https://prod.spline.design/XbRBnztyzboATWKX/scene.splinecode" 
            />
          </motion.div>
          {/* Mask to keep the watermark hidden */}
          <div className="absolute bottom-0 right-0 w-36 h-12 bg-background z-10" />

          {/* Task Manager Badge */}
          <div className="absolute bottom-5 right-44 w-36 h-10 bg-background z-20 flex items-center justify-center rounded-full border border-white/10 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Task Manager
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h1 className="text-6xl lg:text-8xl font-black leading-[1] mb-8 tracking-tight">
              Manage Tasks <br />
              <span className="gradient-text">Like Magic.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed backdrop-blur-[2px]">
              The ultimate workspace to orchestrate your productivity with 
              real-time synchronization and premium 3D design.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/register" 
                className="group px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all premium-shadow"
              >
                Start For Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-10 py-5 glass rounded-2xl font-bold hover:bg-white/10 transition-colors backdrop-blur-md">
                Watch Demo
              </button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-12">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">Trusted by 10k+ users</p>
                <div className="flex text-yellow-500 w-4 h-4 gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Sparkles key={s} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Lightning Fast"
              description="Built for speed with real-time updates and zero latency interaction."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Enterprise Secure"
              description="Your data is protected with military-grade encryption and access controls."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-primary" />}
              title="Intuitive Design"
              description="Clean, modern interface that makes complex project management feel simple."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-secondary/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-5 h-5 fill-primary" />
            <span className="text-xl font-bold tracking-tight">TaskFlow</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 TaskFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Twitter</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-3xl glass hover:border-primary/30 transition-colors group">
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
);

export default Home;
