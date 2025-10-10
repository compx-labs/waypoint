import { motion, type Variants } from "framer-motion";
import Navigation from "../components/Navigation";
import HeroSection from "../components/HeroSection";
import WhatIsWaypoint from "../components/WhatIsWaypoint";
import WhyWaypoint from "../components/WhyWaypoint";
import WhoIsItFor from "../components/WhoIsItFor";
import Features from "../components/Features";
import Vision from "../components/Vision";
import CallToAction from "../components/CallToAction";
import TrailDivider from "../components/TrailDivider";
import Footer from "../components/Footer";
import { useEffect } from "react";

// Update page title and meta tags
function updateMeta() {
  document.title = "Waypoint - Simple Continuous Payments";
  
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', 'Schedule payment routes. Track every route. Waypoint makes continuous stablecoin payments simple and transparent.');
  
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', 'stablecoin, routing, payments, DeFi, blockchain, continuous payments, payment routes');
}

const sectionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

export default function Landing() {
  useEffect(() => {
    updateMeta();
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <HeroSection />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <WhatIsWaypoint />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <WhyWaypoint />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <WhoIsItFor />
      </motion.div>
      
      {/* <Features /> */}
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Vision />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <CallToAction />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
}
