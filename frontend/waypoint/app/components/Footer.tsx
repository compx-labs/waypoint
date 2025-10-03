export default function Footer() {
  const socialLinks = [
    {
      name: "Discord",
      href: "https://discord.gg/pSG93C6UN8",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "X",
      href: "https://x.com/compxlabs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/compx-labs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: "https://t.me/compxlabs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-forest-700 to-forest-800 text-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Section - Brand & Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="Waypoint"
                className="h-8 w-auto rounded-full bg-stone-200 p-0.5"
              />
              <h3 className="font-display text-2xl font-bold text-primary-100 uppercase tracking-wider">
                WAYPOINT
              </h3>
            </div>
            
            <p className="text-primary-200 leading-relaxed max-w-md">
              Your route through stablecoin payments. Route funds continuously across multiple blockchains 
              with transparent schedules and simple, intuitive controls.
            </p>

            {/* Technology Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 bg-sunset-500 text-primary-100 text-xs font-display font-bold uppercase tracking-wider rounded-full">
                <span className="w-2 h-2 bg-primary-100 rounded-full mr-2"></span>
                Multi-Chain Protocol
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-forest-500 text-primary-100 text-xs font-display font-bold uppercase tracking-wider rounded-full border border-[#FF66C4]">
                ⚡ Powered by CompX
              </span>
            </div>
          </div>

          {/* Middle Section - Navigation */}
          <div className="lg:col-span-4">
            <h4 className="font-display text-lg font-bold text-sunset-500 uppercase tracking-wider mb-6">
              Navigation
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <a href="/token-routes" className="text-primary-200 hover:text-primary-100 transition-colors duration-200 font-display uppercase tracking-wide text-sm hover:translate-x-1 transform">
                Routes
              </a>
              <a href="/analytics" className="text-primary-200 hover:text-primary-100 transition-colors duration-200 font-display uppercase tracking-wide text-sm hover:translate-x-1 transform">
                Analytics
              </a>
              <a href="/docs" className="text-primary-200 hover:text-primary-100 transition-colors duration-200 font-display uppercase tracking-wide text-sm hover:translate-x-1 transform">
                Documentation
              </a>
              <a href="https://app.compx.io" target="_blank" rel="noopener noreferrer" className="text-primary-200 hover:text-primary-100 transition-colors duration-200 font-display uppercase tracking-wide text-sm hover:translate-x-1 transform">
                CompX Website ↗
              </a>
            </div>
          </div>

          {/* Right Section - Community */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-lg font-bold text-sunset-500 uppercase tracking-wider mb-6">
              Community
            </h4>
            
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-forest-600 hover:bg-forest-500 p-3 rounded-lg transition-colors duration-200 transform hover:scale-110 text-primary-100"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <button onClick={() => window.open("https://app.compx.io", "_blank")}
            className="bg-sunset-500 hover:bg-sunset-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl border border-sunset-400">
              Visit CompX ↗
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-forest-600 bg-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-primary-300">
              © 2025 CompX Labs. All rights reserved.
            </p>
            <p className="text-sm text-primary-300 flex items-center">
              Built on 
              <span className="mx-2 text-sunset-500 font-display font-bold">Aptos and Algorand</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
