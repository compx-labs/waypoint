import { motion } from "framer-motion";

interface NavItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive?: boolean;
  hasSubmenu?: boolean;
}

const navigationItems: NavItem[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Begin your Waypoint journey",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    isActive: true,
  },
  {
    id: "trail-guide",
    title: "Trail Guide",
    description: "Understanding Waypoint's route system",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
    hasSubmenu: true,
  },
  {
    id: "route-creation",
    title: "Route Creation",
    description: "Create and manage payment routes",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
    hasSubmenu: true,
  },
  {
    id: "expedition-tools",
    title: "Expedition Tools",
    description: "Advanced routing and analytics",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>,
    hasSubmenu: true,
  },
  {
    id: "basecamp",
    title: "Basecamp",
    description: "Monitor your routes and activity",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
  },
  {
    id: "supply-station",
    title: "Supply Station",
    description: "Get testnet tokens for exploration",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>,
    hasSubmenu: true,
  },
  {
    id: "waypoint-governance",
    title: "Waypoint Governance",
    description: "Participate in protocol decisions",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" /></svg>,
    hasSubmenu: true,
  },
];

export default function DocsNavigation() {
  return (
    <motion.div 
      className="w-80 bg-gradient-to-b from-forest-900 to-forest-800 border-r border-forest-700 min-h-screen"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-forest-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-sunset-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-100" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-primary-100 uppercase tracking-wider">
            NAVIGATION
          </h1>
        </div>
        <p className="text-primary-300 text-sm">
          Your complete guide to navigating the Waypoint ecosystem
        </p>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-3">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div
              className={`group relative rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                item.isActive
                  ? "bg-gradient-to-r from-sunset-600 to-sunset-700 border border-sunset-500"
                  : "bg-forest-800 hover:bg-forest-700 border border-forest-700 hover:border-forest-600"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-primary-300">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-display font-semibold text-sm uppercase tracking-wide ${
                      item.isActive ? "text-primary-100" : "text-primary-200 group-hover:text-primary-100"
                    }`}>
                      {item.title}
                    </h3>
                    {item.hasSubmenu && (
                      <svg 
                        className={`w-4 h-4 transition-colors duration-200 ${
                          item.isActive ? "text-primary-100" : "text-primary-400 group-hover:text-primary-200"
                        }`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${
                    item.isActive ? "text-primary-200" : "text-primary-400 group-hover:text-primary-300"
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Active indicator */}
              {item.isActive && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-sunset-400 rounded-r"
                  layoutId="activeIndicator"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      
    </motion.div>
  );
}
