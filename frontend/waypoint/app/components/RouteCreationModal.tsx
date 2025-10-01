import React, { useState, useEffect } from "react";

interface RouteType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  comingSoon?: boolean;
}

interface RouteCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteTypeSelect: (routeTypeId: string) => void;
}

const routeTypes: RouteType[] = [
  {
    id: "simple-transfer",
    title: "Simple Transfer Over Time",
    description: "Route tokens to recipients with flexible schedules",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    enabled: true,
  },
  {
    id: "milestone-routes",
    title: "Milestone Routes",
    description: "Release tokens based on achievement milestones",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
    ),
    enabled: false,
    comingSoon: true,
  },
  {
    id: "cliff-vesting",
    title: "Cliff Based Vesting",
    description: "Traditional vesting with cliff periods and gradual release",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ),
    enabled: false,
    comingSoon: true,
  },
  {
    id: "advanced-routes",
    title: "Advanced Routes",
    description: "Complex routing with multiple conditions and triggers",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 000 1.788l4 2.094V11a1 1 0 011-1zM19.5 7.134a1 1 0 00-.553-.894l-8-4a1 1 0 00-.894 0l-8 4A1 1 0 002 7v6a1 1 0 00.553.894l8 4a1 1 0 00.894 0l8-4A1 1 0 0020 13V7a1 1 0 00-.5-.866z" />
      </svg>
    ),
    enabled: false,
    comingSoon: true,
  },
];

export default function RouteCreationModal({
  isOpen,
  onClose,
  onRouteTypeSelect,
}: RouteCreationModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  const handleRouteTypeClick = (routeType: RouteType) => {
    if (routeType.enabled) {
      onRouteTypeSelect(routeType.id);
      onClose();
    }
  };

  // Mobile Drawer
  if (isMobile) {
    return (
      <div className="route-creation-modal fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-forest-900 bg-opacity-60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Drawer Content */}
        <div className={`
          fixed bottom-0 left-0 right-0 bg-gradient-to-t from-forest-900 via-forest-800 to-forest-700
          rounded-t-2xl border-t-2 border-sunset-500 border-opacity-30 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[90vh] overflow-y-auto
        `}>
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-primary-300 rounded-full opacity-50"></div>
          </div>

          {/* Header */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="route-modal-title text-xl font-display font-bold text-primary-100 uppercase tracking-wider">
                Choose Route Type
              </h3>
              <button
                onClick={onClose}
                className="text-primary-400 hover:text-sunset-500 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-primary-300 mt-1 font-display">
              Select the type of payment route you want to create
            </p>
          </div>

          {/* Route Type Cards - Mobile Layout */}
          <div className="px-6 pb-8 space-y-3">
            {routeTypes.map((routeType) => (
              <div
                key={routeType.id}
                onClick={() => handleRouteTypeClick(routeType)}
                className={`
                  route-type-card-mobile flex items-center p-4 rounded-xl border-2 transition-all duration-200 
                  ${routeType.enabled
                    ? 'bg-gradient-to-r from-forest-700 to-forest-600 border-sunset-500 border-opacity-40 active:bg-gradient-to-r active:from-forest-600 active:to-forest-500 active:scale-95'
                    : 'bg-gradient-to-r from-forest-800 to-forest-700 border-forest-600 opacity-60'
                  }
                `}
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent' 
                }}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4
                  ${routeType.enabled
                    ? 'bg-gradient-to-br from-sunset-500 to-sunset-600 text-primary-100'
                    : 'bg-gradient-to-br from-forest-600 to-forest-700 text-primary-400'
                  }
                `}>
                  {routeType.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`
                      font-display font-semibold text-sm uppercase tracking-wide
                      ${routeType.enabled ? 'text-primary-100' : 'text-primary-400'}
                    `}>
                      {routeType.title}
                    </h4>
                    {routeType.comingSoon && (
                      <span className="px-2 py-1 text-xs font-display font-bold uppercase tracking-wider bg-forest-600 text-primary-400 rounded-md">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className={`
                    text-xs font-display leading-relaxed
                    ${routeType.enabled ? 'text-primary-300' : 'text-primary-500'}
                  `}>
                    {routeType.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                {routeType.enabled && (
                  <div className="flex-shrink-0 ml-4">
                    <svg className="w-5 h-5 text-sunset-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            
            {/* Footer Note */}
            <div className="pt-4 border-t border-forest-600 border-opacity-50">
              <p className="text-xs text-primary-400 text-center font-display">
                More route types coming soon! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div className="route-creation-modal fixed inset-0 z-50 overflow-y-auto hidden md:block">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-forest-900 bg-opacity-90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="relative inline-block align-bottom bg-gradient-to-br from-forest-800 to-forest-900 rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border-2 border-sunset-500 border-opacity-20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-primary-400 hover:text-sunset-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Title */}
          <div className="mb-6">
            <h3 className="route-modal-title text-2xl font-display font-bold text-primary-100 uppercase tracking-wider text-center">
              Choose Route Type
            </h3>
            <p className="text-sm text-primary-300 text-center mt-2 font-display">
              Select the type of payment route you want to create
            </p>
          </div>

          {/* Route Type Cards */}
          <div className="space-y-3">
            {routeTypes.map((routeType) => (
              <div
                key={routeType.id}
                onClick={() => handleRouteTypeClick(routeType)}
                className={`
                  route-type-card flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${routeType.enabled
                    ? 'bg-gradient-to-r from-forest-700 to-forest-600 border-sunset-500 border-opacity-30 hover:border-opacity-60 hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-500 transform hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-forest-800 to-forest-700 border-forest-600 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4
                  ${routeType.enabled
                    ? 'bg-gradient-to-br from-sunset-500 to-sunset-600 text-primary-100'
                    : 'bg-gradient-to-br from-forest-600 to-forest-700 text-primary-400'
                  }
                `}>
                  {routeType.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`
                      font-display font-semibold text-sm uppercase tracking-wide
                      ${routeType.enabled ? 'text-primary-100' : 'text-primary-400'}
                    `}>
                      {routeType.title}
                    </h4>
                    {routeType.comingSoon && (
                      <span className="px-2 py-1 text-xs font-display font-bold uppercase tracking-wider bg-forest-600 text-primary-400 rounded-md">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className={`
                    text-xs mt-1 font-display
                    ${routeType.enabled ? 'text-primary-300' : 'text-primary-500'}
                  `}>
                    {routeType.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                {routeType.enabled && (
                  <div className="flex-shrink-0 ml-4">
                    <svg className="w-5 h-5 text-sunset-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-forest-600">
            <p className="text-xs text-primary-400 text-center font-display">
              More route types coming soon! Stay tuned for advanced features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
