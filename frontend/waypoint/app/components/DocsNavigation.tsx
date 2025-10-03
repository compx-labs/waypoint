import { motion } from "framer-motion";

interface NavItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const navigationItems: NavItem[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Introduction to Waypoint",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>,
  },
  {
    id: "supported-tokens",
    title: "Supported Tokens",
    description: "Available tokens for routing",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>,
  },
  {
    id: "creating-route",
    title: "Creating a Route",
    description: "Step-by-step route creation",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
  },
  {
    id: "claiming-route",
    title: "Claiming from a Route",
    description: "How to claim your tokens",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  },
];

interface DocsNavigationProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function DocsNavigation({ activeSection, onSectionChange }: DocsNavigationProps) {
  return (
    <div 
      className="w-80 bg-gradient-to-b from-forest-900 to-forest-800 border-r border-forest-700 min-h-screen"
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
        {navigationItems.map((item, index) => {
          const isActive = item.id === activeSection;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                onClick={() => onSectionChange(item.id)}
                className={`group relative rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  isActive
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
                        isActive ? "text-primary-100" : "text-primary-200 group-hover:text-primary-100"
                      }`}>
                        {item.title}
                      </h3>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      isActive ? "text-primary-200" : "text-primary-400 group-hover:text-primary-300"
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-sunset-400 rounded-r"
                    layoutId="activeIndicator"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      
    </div>
  );
}
