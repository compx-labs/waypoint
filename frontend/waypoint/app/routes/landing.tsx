import type { Route } from "./+types/landing";
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Waypoint - Your Payments, Your Expedition" },
    {
      name: "description",
      content:
        "Mark the route. Stream the journey. Discover the future of payments with Waypoint's adventure-inspired platform.",
    },
    {
      name: "keywords",
      content:
        "stablecoin, streaming, payments, DeFi, blockchain, continuous payments, expedition",
    },
  ];
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <WhatIsWaypoint />
      <WhyWaypoint />
      <WhoIsItFor />
      {/* <Features /> */}
      <Vision />
      <CallToAction />
      <Footer />
    </div>
  );
}
