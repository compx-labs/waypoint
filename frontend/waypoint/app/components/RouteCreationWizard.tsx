import React, { useState } from "react";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
}

interface WizardStepProps {
  data: RouteFormData;
  updateData: (updates: Partial<RouteFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface RouteFormData {
  // Step 1: Token Selection
  selectedToken?: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  
  // Step 2: Amount & Schedule
  totalAmount?: string;
  unlockUnit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  unlockAmount?: string;
  
  // Step 3: Timing
  startTime?: Date;
  
  // Step 4: Recipient
  recipientAddress?: string;
}

interface RouteCreationWizardProps {
  routeType: string;
  onClose: () => void;
  onComplete: (data: RouteFormData) => void;
}

// Step Components
const TokenSelectionStep: React.FC<WizardStepProps> = ({ data, updateData, onNext, isFirstStep, isLastStep }) => {
  const availableTokens = [
    { symbol: 'USDC', name: 'USD Coin', address: '0x...', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x...', decimals: 6 },
    { symbol: 'xUSD', name: 'Waypoint USD', address: '0x...', decimals: 8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Select Token
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Choose which stablecoin you want to route
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {availableTokens.map((token) => (
          <button
            key={token.symbol}
            onClick={() => {
              updateData({ selectedToken: token });
              setTimeout(() => onNext(), 150);
            }}
            className={`
              flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${data.selectedToken?.symbol === token.symbol
                ? 'bg-gradient-to-r from-forest-600 to-forest-500 border-sunset-500 border-opacity-60'
                : 'bg-gradient-to-r from-forest-700 to-forest-600 border-forest-500 border-opacity-30 hover:border-opacity-60 hover:border-sunset-500'
              }
            `}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sunset-500 to-sunset-600 flex items-center justify-center mr-4">
              <span className="text-primary-100 font-display font-bold text-lg">
                {token.symbol.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-primary-100 uppercase tracking-wide text-sm">
                {token.symbol}
              </h3>
              <p className="text-primary-300 text-xs font-display">
                {token.name}
              </p>
            </div>
            {data.selectedToken?.symbol === token.symbol && (
              <div className="flex-shrink-0 ml-4">
                <svg className="w-5 h-5 text-sunset-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const AmountScheduleStep: React.FC<WizardStepProps> = ({ data, updateData, onNext, onPrevious, isFirstStep, isLastStep }) => {
  const unlockUnits = [
    { value: 'minutes' as const, label: 'Minutes', description: 'Every minute' },
    { value: 'hours' as const, label: 'Hours', description: 'Every hour' },
    { value: 'days' as const, label: 'Days', description: 'Every day' },
    { value: 'weeks' as const, label: 'Weeks', description: 'Every week' },
    { value: 'months' as const, label: 'Months', description: 'Every month' },
  ];

  const canProceed = data.totalAmount && data.unlockUnit && data.unlockAmount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Amount & Schedule
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Configure how much to send and the unlock schedule
        </p>
      </div>

      {/* Total Amount */}
      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Total Amount
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            placeholder="1000.00"
            value={data.totalAmount || ''}
            onChange={(e) => updateData({ totalAmount: e.target.value })}
            className="w-full bg-forest-700 border-2 border-forest-500 rounded-lg text-primary-100 font-display px-4 py-3 pr-16 focus:border-sunset-500 focus:outline-none transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-primary-300 font-display text-sm">
              {data.selectedToken?.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Unlock Unit */}
      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Unlock Frequency
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {unlockUnits.map((unit) => (
            <button
              key={unit.value}
              onClick={() => updateData({ unlockUnit: unit.value })}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${data.unlockUnit === unit.value
                  ? 'bg-forest-600 border-sunset-500 border-opacity-60'
                  : 'bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60'
                }
              `}
            >
              <div className="font-display font-semibold text-primary-100 text-sm uppercase tracking-wide">
                {unit.label}
              </div>
              <div className="text-primary-300 text-xs font-display">
                {unit.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Per Unlock */}
      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Amount Per {data.unlockUnit ? data.unlockUnit.slice(0, -1) : 'Period'}
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            placeholder="10.00"
            value={data.unlockAmount || ''}
            onChange={(e) => updateData({ unlockAmount: e.target.value })}
            className="w-full bg-forest-700 border-2 border-forest-500 rounded-lg text-primary-100 font-display px-4 py-3 pr-16 focus:border-sunset-500 focus:outline-none transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-primary-300 font-display text-sm">
              {data.selectedToken?.symbol}
            </span>
          </div>
        </div>
        {data.totalAmount && data.unlockAmount && (
          <div className="mt-2 text-xs text-primary-400 font-display">
            Duration: ~{Math.ceil(parseFloat(data.totalAmount) / parseFloat(data.unlockAmount))} {data.unlockUnit}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-forest-400"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 ${
            canProceed
              ? 'bg-sunset-500 hover:bg-sunset-600 text-primary-100 border-sunset-400'
              : 'bg-forest-600 text-primary-400 border-forest-500 cursor-not-allowed opacity-50'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const TimingStep: React.FC<WizardStepProps> = ({ data, updateData, onNext, onPrevious, isFirstStep, isLastStep }) => {
  const canProceed = data.startTime;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          When to Start
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Set when your route should begin routing tokens
        </p>
      </div>

      <div className="space-y-4">
        {/* Quick Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              updateData({ startTime: new Date() });
            }}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${data.startTime && Math.abs(data.startTime.getTime() - new Date().getTime()) < 60000
                ? 'bg-forest-600 border-sunset-500 border-opacity-60'
                : 'bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60'
              }
            `}
          >
            <div className="font-display font-semibold text-primary-100 text-sm uppercase tracking-wide">
              Start Now
            </div>
            <div className="text-primary-300 text-xs font-display">
              Begin immediately
            </div>
          </button>

          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              updateData({ startTime: tomorrow });
            }}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${data.startTime && data.startTime.getDate() === new Date().getDate() + 1
                ? 'bg-forest-600 border-sunset-500 border-opacity-60'
                : 'bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60'
              }
            `}
          >
            <div className="font-display font-semibold text-primary-100 text-sm uppercase tracking-wide">
              Tomorrow
            </div>
            <div className="text-primary-300 text-xs font-display">
              9:00 AM tomorrow
            </div>
          </button>
        </div>

        {/* Custom Date/Time */}
        <div>
          <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
            Custom Date & Time
          </label>
          <input
            type="datetime-local"
            value={data.startTime ? data.startTime.toISOString().slice(0, 16) : ''}
            onChange={(e) => updateData({ startTime: new Date(e.target.value) })}
            className="w-full bg-forest-700 border-2 border-forest-500 rounded-lg text-primary-100 font-display px-4 py-3 focus:border-sunset-500 focus:outline-none transition-colors"
          />
        </div>

        {data.startTime && (
          <div className="p-4 bg-forest-800 rounded-lg border border-forest-600">
            <div className="text-sm font-display text-primary-100 mb-1">
              Route will start:
            </div>
            <div className="text-primary-300 font-display text-sm">
              {data.startTime.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-forest-400"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 ${
            canProceed
              ? 'bg-sunset-500 hover:bg-sunset-600 text-primary-100 border-sunset-400'
              : 'bg-forest-600 text-primary-400 border-forest-500 cursor-not-allowed opacity-50'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const RecipientStep: React.FC<WizardStepProps> = ({ data, updateData, onNext, onPrevious, isFirstStep, isLastStep }) => {
  const canProceed = data.recipientAddress && data.recipientAddress.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Recipient
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Who will receive this token route?
        </p>
      </div>

      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Wallet Address
        </label>
        <input
          type="text"
          placeholder="0x1234567890abcdef..."
          value={data.recipientAddress || ''}
          onChange={(e) => updateData({ recipientAddress: e.target.value })}
          className="w-full bg-forest-700 border-2 border-forest-500 rounded-lg text-primary-100 font-display px-4 py-3 focus:border-sunset-500 focus:outline-none transition-colors"
        />
        <div className="mt-2 text-xs text-primary-400 font-display">
          Enter the wallet address that will receive the token route
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-forest-400"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 ${
            canProceed
              ? 'bg-sunset-500 hover:bg-sunset-600 text-primary-100 border-sunset-400'
              : 'bg-forest-600 text-primary-400 border-forest-500 cursor-not-allowed opacity-50'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const SummaryStep: React.FC<WizardStepProps> = ({ data, updateData, onNext, onPrevious, isFirstStep, isLastStep }) => {
  const totalDuration = data.totalAmount && data.unlockAmount 
    ? Math.ceil(parseFloat(data.totalAmount) / parseFloat(data.unlockAmount)) 
    : 0;

  const endDate = data.startTime && data.unlockUnit && totalDuration
    ? (() => {
        const end = new Date(data.startTime);
        switch (data.unlockUnit) {
          case 'minutes': end.setMinutes(end.getMinutes() + totalDuration); break;
          case 'hours': end.setHours(end.getHours() + totalDuration); break;
          case 'days': end.setDate(end.getDate() + totalDuration); break;
          case 'weeks': end.setDate(end.getDate() + (totalDuration * 7)); break;
          case 'months': end.setMonth(end.getMonth() + totalDuration); break;
        }
        return end;
      })()
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Review Route
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Confirm your token route details before creating
        </p>
      </div>

      <div className="bg-forest-800 rounded-xl border-2 border-forest-600 p-6 space-y-4">
        {/* Token & Amount */}
        <div className="flex justify-between items-center pb-4 border-b border-forest-600">
          <div>
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide">Token & Amount</div>
            <div className="text-lg font-display font-bold text-primary-100">
              {data.totalAmount} {data.selectedToken?.symbol}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide">Schedule</div>
            <div className="text-lg font-display font-bold text-primary-100">
              {data.unlockAmount} per {data.unlockUnit?.slice(0, -1)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">Starts</div>
            <div className="text-primary-100 font-display">
              {data.startTime?.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">Ends</div>
            <div className="text-primary-100 font-display">
              {endDate?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">Duration</div>
          <div className="text-primary-100 font-display">
            {totalDuration} {data.unlockUnit} ({totalDuration} payments)
          </div>
        </div>

        {/* Recipient */}
        <div>
          <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">Recipient</div>
          <div className="text-primary-100 font-mono text-sm break-all">
            {data.recipientAddress}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-forest-400"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-sunset-400 transform hover:scale-105 shadow-lg"
        >
          🚀 Create Route
        </button>
      </div>
    </div>
  );
};

const wizardSteps: WizardStep[] = [
  { id: 1, title: "Token", description: "Choose your stablecoin", component: TokenSelectionStep },
  { id: 2, title: "Amount", description: "Set amount & schedule", component: AmountScheduleStep },
  { id: 3, title: "Timing", description: "When to start", component: TimingStep },
  { id: 4, title: "Recipient", description: "Who receives it", component: RecipientStep },
  { id: 5, title: "Review", description: "Confirm details", component: SummaryStep },
];

export default function RouteCreationWizard({ 
  routeType, 
  onClose, 
  onComplete 
}: RouteCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RouteFormData>({});

  const updateFormData = (updates: Partial<RouteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create the route
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = wizardSteps[currentStep].component;

  return (
    <div className="route-creation-wizard min-h-screen bg-primary-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center text-primary-800 hover:text-sunset-500 font-display text-sm uppercase tracking-wider mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-3xl lg:text-4xl font-display font-bold text-forest-800 uppercase tracking-wide mb-2">
            Create {routeType.replace('-', ' ')} Route
          </h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mt-4">
            {wizardSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
                  ${index === currentStep 
                    ? 'bg-sunset-500 text-primary-100' 
                    : index < currentStep 
                      ? 'bg-forest-600 text-primary-100'
                      : 'bg-forest-200 text-forest-600'
                  }
                `}>
                  <div className="font-display font-bold text-xs">
                    {index < currentStep ? '✓' : step.id}
                  </div>
                  <div className="font-display text-xs uppercase tracking-wider hidden sm:block">
                    {step.title}
                  </div>
                </div>
                {index < wizardSteps.length - 1 && (
                  <div className={`
                    h-0.5 w-4 transition-colors duration-200
                    ${index < currentStep ? 'bg-forest-600' : 'bg-forest-200'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 rounded-xl border-2 border-forest-600 p-8 shadow-xl">
          <CurrentStepComponent
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === wizardSteps.length - 1}
          />
        </div>
      </div>
    </div>
  );
}
