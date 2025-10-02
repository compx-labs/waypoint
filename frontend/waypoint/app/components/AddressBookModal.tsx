import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface AddressBookEntry {
  id: number;
  owner_wallet: string;
  name: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function AddressBookModal({
  isOpen,
  onClose,
}: AddressBookModalProps) {
  const { account } = useWallet();
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch entries when modal opens and wallet is connected
  useEffect(() => {
    if (isOpen && account?.address) {
      fetchEntries();
    }
  }, [isOpen, account?.address]);

  const fetchEntries = async () => {
    if (!account?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/address-book?owner_wallet=${account.address}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address book entries");
      }

      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!account?.address || !formName.trim() || !formAddress.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/address-book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_wallet: account.address.toStringLong(),
          name: formName.trim(),
          wallet_address: formAddress.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add entry");
      }

      const newEntry = await response.json();
      setEntries([newEntry, ...entries]);
      setFormName("");
      setFormAddress("");
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formName.trim() || !formAddress.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/address-book/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          wallet_address: formAddress.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update entry");
      }

      const updatedEntry = await response.json();
      setEntries(entries.map((e) => (e.id === id ? updatedEntry : e)));
      setEditingId(null);
      setFormName("");
      setFormAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/address-book/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (entry: AddressBookEntry) => {
    setEditingId(entry.id);
    setFormName(entry.name);
    setFormAddress(entry.wallet_address);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormName("");
    setFormAddress("");
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormName("");
    setFormAddress("");
  };

  if (!isOpen) return null;

  if (!account?.address) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-forest-900 bg-opacity-90 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative bg-gradient-to-br from-forest-800 to-forest-900 rounded-xl p-6 max-w-md w-full border-2 border-sunset-500 border-opacity-20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-primary-400 hover:text-sunset-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
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

            <h3 className="text-xl font-display font-bold text-primary-100 uppercase tracking-wider text-center mb-4">
              Address Book
            </h3>
            <p className="text-sm text-primary-300 text-center">
              Please connect your wallet to use the address book.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Drawer
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div
          className="fixed inset-0 bg-forest-900 bg-opacity-60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div
          className={`
          fixed bottom-0 left-0 right-0 bg-gradient-to-t from-forest-900 via-forest-800 to-forest-700
          rounded-t-2xl border-t-2 border-sunset-500 border-opacity-30 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-full"}
          max-h-[90vh] overflow-y-auto
        `}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-primary-300 rounded-full opacity-50"></div>
          </div>

          {/* Header */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-primary-100 uppercase tracking-wider">
                Address Book
              </h3>
              <button
                onClick={onClose}
                className="text-primary-400 hover:text-sunset-500 transition-colors p-1"
              >
                <svg
                  className="w-6 h-6"
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
            </div>
            <p className="text-sm text-primary-300 mt-1 font-display">
              Manage your saved wallet addresses
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-8">
            {/* Add Button */}
            {!isAdding && !editingId && (
              <button
                onClick={startAdd}
                className="w-full mb-4 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95"
                style={{
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                + Add Address
              </button>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingId !== null) && (
              <div className="mb-4 p-4 bg-forest-700 rounded-lg border-2 border-sunset-500 border-opacity-30">
                <h4 className="text-sm font-display font-bold text-primary-100 uppercase tracking-wide mb-3">
                  {isAdding ? "Add New Address" : "Edit Address"}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-display text-primary-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., John's Wallet"
                      className="w-full bg-forest-800 text-primary-100 border border-forest-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sunset-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-display text-primary-300 mb-1">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-forest-800 text-primary-100 border border-forest-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sunset-500 font-mono"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        isAdding ? handleAdd() : handleUpdate(editingId!)
                      }
                      disabled={
                        isLoading || !formName.trim() || !formAddress.trim()
                      }
                      className="flex-1 bg-sunset-500 hover:bg-sunset-600 disabled:bg-forest-600 text-primary-100 font-display text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Entries List */}
            <div className="space-y-2">
              {isLoading && entries.length === 0 ? (
                <p className="text-sm text-primary-400 text-center py-4">
                  Loading...
                </p>
              ) : entries.length === 0 ? (
                <p className="text-sm text-primary-400 text-center py-4">
                  No addresses saved yet. Add your first one!
                </p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-forest-700 rounded-lg border border-forest-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-display font-semibold text-sm text-primary-100 truncate">
                          {entry.name}
                        </h5>
                        <p className="text-xs text-primary-300 font-mono truncate mt-1">
                          {entry.wallet_address}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-sunset-500 hover:text-sunset-400 p-1"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto hidden md:block">
      <div
        className="fixed inset-0 bg-forest-900 bg-opacity-90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="relative inline-block align-bottom bg-gradient-to-br from-forest-800 to-forest-900 rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 border-2 border-sunset-500 border-opacity-20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-primary-400 hover:text-sunset-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
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

          {/* Modal Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider text-center">
              Address Book
            </h3>
            <p className="text-sm text-primary-300 text-center mt-2 font-display">
              Manage your saved wallet addresses
            </p>
          </div>

          {/* Add Button */}
          {!isAdding && !editingId && (
            <button
              onClick={startAdd}
              className="w-full mb-4 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              + Add New Address
            </button>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId !== null) && (
            <div className="mb-4 p-4 bg-forest-700 rounded-lg border-2 border-sunset-500 border-opacity-30">
              <h4 className="text-sm font-display font-bold text-primary-100 uppercase tracking-wide mb-3">
                {isAdding ? "Add New Address" : "Edit Address"}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-display text-primary-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., John's Wallet"
                    className="w-full bg-forest-800 text-primary-100 border border-forest-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sunset-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-display text-primary-300 mb-1">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-forest-800 text-primary-100 border border-forest-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sunset-500 transition-colors font-mono"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      isAdding ? handleAdd() : handleUpdate(editingId!)
                    }
                    disabled={
                      isLoading || !formName.trim() || !formAddress.trim()
                    }
                    className="flex-1 bg-sunset-500 hover:bg-sunset-600 disabled:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Entries List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading && entries.length === 0 ? (
              <p className="text-sm text-primary-400 text-center py-8">
                Loading...
              </p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-primary-400 text-center py-8">
                No addresses saved yet. Add your first one!
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-forest-700 rounded-lg border border-forest-600 hover:border-sunset-500 hover:border-opacity-30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-display font-semibold text-sm text-primary-100">
                        {entry.name}
                      </h5>
                      <p className="text-xs text-primary-300 font-mono mt-1 break-all">
                        {entry.wallet_address}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-sunset-500 hover:text-sunset-400 p-2 transition-colors"
                        title="Edit"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors"
                        title="Delete"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
