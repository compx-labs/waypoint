import { motion } from "framer-motion";
import AppNavigation from "../components/AppNavigation";

export default function VisionRoadmap() {
  const roadmapItems = [
    {
      quarter: "Q4 2025",
      items: [
        "Waypoint expands to Algorand with xUSD as the settlement layer",
        "New route types: Milestone payments, Cliff + vesting schedules, Variable-rate streams",
        "Integration with Haven app for recurring savings"
      ],
      status: "upcoming"
    },
    {
      quarter: "Early 2026",
      items: [
        "Advanced routes: multi-recipient (payroll), escrowed (dispute-safe), and conditional (oracle or governance-linked)",
        "Governance v3: FLUX-gated access to premium features",
        "COMPX bridged to Aptos: rewards + governance live cross-chain"
      ],
      status: "future"
    },
    {
      quarter: "Mid 2026",
      items: [
        "Native xUSD on Aptos (via Orbital Lending)",
        "Yield-enhanced routes: streams that generate interest while in transit",
        "Cross-chain routes: send on Algorand, release on Aptos (and vice versa)",
        "Integrations with Cairn (transparency) and Assembly (governance)"
      ],
      status: "future"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <AppNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-5xl lg:text-6xl text-forest-700 uppercase mb-6">
            Vision & <span className="text-sunset-500">Roadmap</span>
          </h1>
          <p className="text-xl text-forest-600 max-w-3xl mx-auto">
            Programmable Payments Across Aptos & Algorand
          </p>
        </motion.div>

        {/* The Missing Layer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 mb-8 shadow-lg border-2 border-forest-200"
        >
          <h2 className="font-display text-3xl text-forest-700 uppercase mb-4">
            🌍 The Missing Layer in DeFi
          </h2>
          <div className="space-y-4 text-forest-600 leading-relaxed">
            <p>
              Stablecoins have exploded across Aptos and Algorand. On Aptos alone, <strong>USDC, USDT, MOD, USDY, and BUIDL</strong> are already live, with <strong>PYUSD0</strong> and <strong>USD1</strong> coming soon. These assets power DeFi trading, lending, and liquidity — but when it comes to <strong>payments</strong>, crypto is still stuck in the past.
            </p>
            <p>
              Most transfers are one-off. What if payments could be smarter?
            </p>
            <p className="text-sunset-600 font-semibold text-lg">
              That's where Waypoint comes in.
            </p>
          </div>
        </motion.section>

        {/* What is Waypoint */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-br from-forest-700 to-forest-600 rounded-2xl p-8 mb-8 shadow-lg"
        >
          <h2 className="font-display text-3xl text-primary-100 uppercase mb-4">
            🚀 What is Waypoint?
          </h2>
          <div className="space-y-4 text-primary-100 leading-relaxed">
            <p>
              Waypoint transforms stablecoin transfers into <strong className="text-sunset-400">programmable payment routes</strong>.
            </p>
            <p>
              Instead of sending funds all at once, users can create routes that unlock value <strong>over time</strong>, <strong>at milestones</strong>, or even <strong>conditionally</strong>. Think salaries, grants, vesting, DAO distributions, or recurring savings — all made seamless, transparent, and composable.
            </p>
          </div>
        </motion.section>

        {/* Aptos First */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 mb-8 shadow-lg border-2 border-sunset-300"
        >
          <h2 className="font-display text-3xl text-forest-700 uppercase mb-4">
            🎯 Aptos First: Hackathon MVP
          </h2>
          <p className="text-forest-600 mb-4">
            We're launching the <strong>beta on Aptos October 3rd</strong> as part of the upcoming hackathon.
          </p>
          <ul className="space-y-2 text-forest-600">
            <li className="flex items-start">
              <span className="text-sunset-500 mr-2">•</span>
              <span><strong>Supports Aptos stablecoins:</strong> USDC, USDT, MOD, USDY</span>
            </li>
            <li className="flex items-start">
              <span className="text-sunset-500 mr-2">•</span>
              <span><strong>MVP feature:</strong> Linear streaming (time-based transfers)</span>
            </li>
            <li className="flex items-start">
              <span className="text-sunset-500 mr-2">•</span>
              <span><strong>Example:</strong> Pay 100 USDC over 30 days, with the receiver's balance updating in real time</span>
            </li>
          </ul>
          <p className="text-coral-600 font-semibold mt-4">
            This is the first step toward programmable payments in the Aptos ecosystem.
          </p>
        </motion.section>

        {/* Roadmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="font-display text-4xl text-forest-700 uppercase mb-8 text-center">
            🛤 Roadmap
          </h2>
          
          <div className="space-y-6">
            {roadmapItems.map((milestone, index) => (
              <motion.div
                key={milestone.quarter}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border-l-8 border-sunset-500 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <h3 className="font-display text-2xl text-forest-700 uppercase">
                    {milestone.quarter}
                  </h3>
                  <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    milestone.status === 'upcoming' 
                      ? 'bg-coral-500 text-white' 
                      : 'bg-stone-300 text-forest-700'
                  }`}>
                    {milestone.status === 'upcoming' ? 'Next Up' : 'Planned'}
                  </span>
                </div>
                <ul className="space-y-3">
                  {milestone.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-forest-600">
                      <span className="text-sunset-500 mr-3 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why It Matters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-br from-primary-100 to-sunset-100 rounded-2xl p-8 mb-8 shadow-lg"
        >
          <h2 className="font-display text-3xl text-forest-700 uppercase mb-6 text-center">
            🧩 Why It Matters
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 rounded-xl p-6">
              <h3 className="font-display text-xl text-forest-700 uppercase mb-2">For DAOs</h3>
              <p className="text-forest-600">
                Fund contributors in milestones, automate payroll, cut admin overhead
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-6">
              <h3 className="font-display text-xl text-forest-700 uppercase mb-2">For Users</h3>
              <p className="text-forest-600">
                Earn streaming salaries, vest tokens, or save automatically
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-6">
              <h3 className="font-display text-xl text-forest-700 uppercase mb-2">For Builders</h3>
              <p className="text-forest-600">
                Plug programmable payments into DeFi apps, lending markets, or governance flows
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-6">
              <h3 className="font-display text-xl text-forest-700 uppercase mb-2">For CompX</h3>
              <p className="text-forest-600">
                A cross-chain showcase of our ethos — <strong>Innovation. Composability. Yield.</strong>
              </p>
            </div>
          </div>
        </motion.section>

        {/* The Future */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gradient-to-br from-forest-800 to-forest-700 rounded-2xl p-8 mb-8 shadow-lg text-center"
        >
          <h2 className="font-display text-3xl text-primary-100 uppercase mb-4">
            ✨ The Future of Payments
          </h2>
          <div className="space-y-4 text-primary-100 leading-relaxed max-w-3xl mx-auto">
            <p>
              Crypto has solved <strong>global value transfer</strong>, but not yet <strong className="text-sunset-400">programmable disbursement</strong>.
            </p>
            <p>
              With Waypoint, every payment becomes a journey — whether it's a salary, a DAO grant, or a governance-triggered bonus.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p>• Aptos gets Waypoint first (October 3rd beta)</p>
              <p>• Algorand comes next (Q4 with xUSD)</p>
              <p>• By 2026, Waypoint will power <strong className="text-sunset-400">cross-chain programmable payments</strong> across the CompX ecosystem</p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <a
            href="/app"
            className="inline-block bg-sunset-500 hover:bg-sunset-600 text-white font-display text-lg uppercase tracking-wider font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Building Routes
          </a>
        </motion.div>
      </div>
    </div>
  );
}

