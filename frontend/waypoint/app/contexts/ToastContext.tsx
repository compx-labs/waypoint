import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { type ToastType, type ToastProps } from "../components/Toast";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  success: (options: ToastOptions) => string;
  error: (options: ToastOptions) => string;
  info: (options: ToastOptions) => string;
  loading: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  update: (id: string, options: Partial<ToastOptions> & { type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastData extends ToastOptions {
  id: string;
  type: ToastType;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (type: ToastType, options: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastData = {
        id,
        type,
        ...options,
      };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const success = useCallback(
    (options: ToastOptions) => addToast("success", options),
    [addToast]
  );

  const error = useCallback(
    (options: ToastOptions) => addToast("error", options),
    [addToast]
  );

  const info = useCallback(
    (options: ToastOptions) => addToast("info", options),
    [addToast]
  );

  const loading = useCallback(
    (options: ToastOptions) => addToast("loading", { ...options, duration: 0 }),
    [addToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const update = useCallback(
    (id: string, options: Partial<ToastOptions> & { type?: ToastType }) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, ...options } : toast
        )
      );
    },
    []
  );

  return (
    <ToastContext.Provider
      value={{ success, error, info, loading, dismiss, update }}
    >
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
        <div className="flex flex-col items-end space-y-3 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              description={toast.description}
              duration={toast.duration}
              onClose={dismiss}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return no-op functions for SSR
    if (typeof window === 'undefined') {
      return {
        success: () => '',
        error: () => '',
        info: () => '',
        loading: () => '',
        dismiss: () => {},
        update: () => {},
      };
    }
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

