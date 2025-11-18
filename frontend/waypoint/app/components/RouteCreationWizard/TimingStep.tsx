import React from "react";
import { WizardStepProps } from "./types";

export const TimingStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  onPrevious,
}) => {
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
              ${
                data.startTime &&
                Math.abs(data.startTime.getTime() - new Date().getTime()) <
                  60000
                  ? "bg-forest-600 border-sunset-500 border-opacity-60"
                  : "bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60"
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
              ${
                data.startTime &&
                data.startTime.getDate() === new Date().getDate() + 1
                  ? "bg-forest-600 border-sunset-500 border-opacity-60"
                  : "bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60"
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
            value={
              data.startTime ? data.startTime.toISOString().slice(0, 16) : ""
            }
            onChange={(e) =>
              updateData({ startTime: new Date(e.target.value) })
            }
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
              ? "bg-sunset-500 hover:bg-sunset-600 text-primary-100 border-sunset-400"
              : "bg-forest-600 text-primary-400 border-forest-500 cursor-not-allowed opacity-50"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

