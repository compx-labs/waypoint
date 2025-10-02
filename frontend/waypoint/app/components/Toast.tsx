import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  id,
  type,
  title,
  description,
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (type !== "loading" && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, type, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "loading":
        return (
          <div className="w-6 h-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sunset-400"></div>
          </div>
        );
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-900 bg-opacity-90 border-green-500";
      case "error":
        return "bg-red-900 bg-opacity-90 border-red-500";
      case "info":
        return "bg-blue-900 bg-opacity-90 border-blue-500";
      case "loading":
        return "bg-forest-900 bg-opacity-90 border-sunset-500";
    }
  };

  return (
    <div
      className={`
        ${getColors()}
        border-2 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
        backdrop-blur-sm transform transition-all duration-300 ease-out
        animate-slideIn
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-primary-100 uppercase tracking-wide text-sm">
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-sm text-primary-300 font-display">
              {description}
            </p>
          )}
        </div>
        {type !== "loading" && (
          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 text-primary-400 hover:text-primary-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

