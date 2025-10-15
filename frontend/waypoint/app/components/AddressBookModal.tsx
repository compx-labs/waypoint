import React, { useState, useEffect } from "react";
import { useUnifiedWallet } from "../contexts/UnifiedWalletContext";
import { 
  useAddressBook, 
  useCreateAddressBookEntry,
  useUpdateAddressBookEntry,
  useDeleteAddressBookEntry 
} from "../hooks/useQueries";
import type { AddressBookEntry } from "../lib/api";

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddressBookModal({
  isOpen,
  onClose,
}: AddressBookModalProps) {
  const wallet = useUnifiedWallet();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formAddressOrNFD, setFormAddressOrNFD] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isResolvingNFD, setIsResolvingNFD] = useState(false);
  const [nfdResolved, setNfdResolved] = useState(false);
  const [nfdNotFound, setNfdNotFound] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Get owner wallet address (works for both Aptos and Algorand)
  const ownerWallet = wallet.account || null;

  // Fetch address book entries
  const { data: entries = [], isLoading, error: queryError } = useAddressBook(ownerWallet, {
    enabled: isOpen && !!ownerWallet,
  });

  // Mutations
  const createMutation = useCreateAddressBookEntry();
  const updateMutation = useUpdateAddressBookEntry();
  const deleteMutation = useDeleteAddressBookEntry(ownerWallet || "");

  // Combine loading states
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  
  // Get error message
  const error = queryError 
    ? (queryError instanceof Error ? queryError.message : "An error occurred")
    : createMutation.error
    ? (createMutation.error instanceof Error ? createMutation.error.message : "Failed to add entry")
    : updateMutation.error
    ? (updateMutation.error instanceof Error ? updateMutation.error.message : "Failed to update entry")
    : deleteMutation.error
    ? (deleteMutation.error instanceof Error ? deleteMutation.error.message : "Failed to delete entry")
    : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Address validation function
  const validateAddress = (address: string, network: string): boolean => {
    if (!address || address.trim() === "") return false;
    
    if (network === 'ALGORAND') {
      // Algorand addresses are base64 encoded, typically 58 characters
      // Valid chars: A-Z, a-z, 0-9, and sometimes = for padding
      const algorandRegex = /^[A-Z2-7]{58}$/;
      return algorandRegex.test(address);
    } else if (network === 'APTOS') {
      // Aptos addresses are hex format, start with 0x
      // Can be various lengths (short form or long form)
      const aptosRegex = /^0x[a-fA-F0-9]{1,64}$/;
      return aptosRegex.test(address);
    }
    
    return false;
  };

  // NFD resolution function
  const resolveNFD = async (nfdName: string): Promise<string | null> => {
    if (!nfdName || !nfdName.endsWith('.algo')) {
      return null;
    }

    try {
      setIsResolvingNFD(true);
      const response = await fetch(
        `https://api.nf.domains/nfd/${encodeURIComponent(nfdName)}?view=tiny&poll=false&nocache=false`
      );
      const data = await response.json();
      
      // Check if NFD was found (error response has name: "notFound")
      if (data && data.name !== "notFound" && data.depositAccount) {
        return data.depositAccount;
      }
      
      // NFD not found or invalid
      console.warn(`NFD not found: ${nfdName}`);
      return null;
    } catch (error) {
      console.error('Failed to resolve NFD:', error);
      return null;
    } finally {
      setIsResolvingNFD(false);
    }
  };

  // Auto-resolve NFD when input changes (if it's a .algo domain)
  useEffect(() => {
    const resolveIfNFD = async () => {
      if (formAddressOrNFD && formAddressOrNFD.endsWith('.algo')) {
        // This is an NFD - try to resolve it
        const address = await resolveNFD(formAddressOrNFD);
        if (address) {
          setResolvedAddress(address);
          setNfdResolved(true);
          setNfdNotFound(false);
          // Validate the resolved address
          const isValid = validateAddress(address, wallet.currentNetwork);
          setIsAddressValid(isValid);
        } else {
          setResolvedAddress("");
          setNfdResolved(false);
          setNfdNotFound(true);
          setIsAddressValid(false);
        }
      } else {
        // Not an NFD, treat as direct address - validate it
        setResolvedAddress("");
        setNfdResolved(false);
        setNfdNotFound(false);
        const isValid = validateAddress(formAddressOrNFD, wallet.currentNetwork);
        setIsAddressValid(isValid);
      }
    };

    const timeoutId = setTimeout(resolveIfNFD, 500); // Debounce by 500ms
    return () => clearTimeout(timeoutId);
  }, [formAddressOrNFD, wallet.currentNetwork]);

  const handleAdd = async () => {
    if (!wallet.account || !formName.trim() || !formAddressOrNFD.trim()) return;

    // Determine final address and shortname based on whether NFD was used
    const finalAddress = nfdResolved ? resolvedAddress : formAddressOrNFD.trim();
    const finalShortname = nfdResolved ? formAddressOrNFD.trim() : null;

    try {
      await createMutation.mutateAsync({
        owner_wallet: wallet.account,
        name: formName.trim(),
        wallet_address: finalAddress,
        shortname: finalShortname,
      });
      
      setFormName("");
      setFormAddressOrNFD("");
      setResolvedAddress("");
      setNfdResolved(false);
      setNfdNotFound(false);
      setIsAddressValid(false);
      setIsAdding(false);
    } catch (err) {
      // Error is handled by the mutation hook and displayed via error state
      console.error("Failed to add entry:", err);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formName.trim() || !formAddressOrNFD.trim()) return;

    // Determine final address and shortname based on whether NFD was used
    const finalAddress = nfdResolved ? resolvedAddress : formAddressOrNFD.trim();
    const finalShortname = nfdResolved ? formAddressOrNFD.trim() : null;

    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          name: formName.trim(),
          wallet_address: finalAddress,
          shortname: finalShortname,
        },
      });
      
      setEditingId(null);
      setFormName("");
      setFormAddressOrNFD("");
      setResolvedAddress("");
      setNfdResolved(false);
      setNfdNotFound(false);
      setIsAddressValid(false);
    } catch (err) {
      // Error is handled by the mutation hook and displayed via error state
      console.error("Failed to update entry:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      // Error is handled by the mutation hook and displayed via error state
      console.error("Failed to delete entry:", err);
    }
  };

  const startEdit = (entry: AddressBookEntry) => {
    setEditingId(entry.id);
    setFormName(entry.name);
    // If entry has shortname (NFD), show that; otherwise show the address
    setFormAddressOrNFD(entry.shortname || entry.wallet_address);
    setResolvedAddress(entry.shortname ? entry.wallet_address : "");
    setNfdResolved(!!entry.shortname);
    setNfdNotFound(false);
    setIsAddressValid(true); // Existing entries are already valid
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormName("");
    setFormAddressOrNFD("");
    setResolvedAddress("");
    setNfdResolved(false);
    setNfdNotFound(false);
    setIsAddressValid(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormName("");
    setFormAddressOrNFD("");
    setResolvedAddress("");
    setNfdResolved(false);
    setNfdNotFound(false);
    setIsAddressValid(false);
  };

  if (!isOpen) return null;

  if (!wallet.account) {
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
                      NFD or Wallet Address
                    </label>
                    <input
                      type="text"
                      value={formAddressOrNFD}
                      onChange={(e) => setFormAddressOrNFD(e.target.value)}
                      placeholder={wallet.currentNetwork === 'ALGORAND' ? 'alice.algo or ALGORAND_ADDRESS...' : 'name.apt or 0x...'}
                      className="w-full bg-forest-800 text-primary-100 border border-forest-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sunset-500"
                    />
                    {isResolvingNFD && (
                      <p className="text-xs text-sunset-400 mt-1">Resolving NFD...</p>
                    )}
                    {nfdResolved && resolvedAddress && (
                      <div className="mt-2 p-2 bg-forest-800 rounded border border-sunset-500 border-opacity-30">
                        <p className="text-xs text-primary-300 mb-1">✓ Resolved to:</p>
                        <p className="text-xs text-sunset-400 font-mono break-all">{resolvedAddress}</p>
                      </div>
                    )}
                    {nfdNotFound && !isResolvingNFD && (
                      <p className="text-xs text-red-400 mt-1">⚠ NFD not found. Please check the name or enter a wallet address directly.</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        isAdding ? handleAdd() : handleUpdate(editingId!)
                      }
                      disabled={
                        isMutating || !formName.trim() || !formAddressOrNFD.trim() || isResolvingNFD || !isAddressValid
                      }
                      className="flex-1 bg-sunset-500 hover:bg-sunset-600 disabled:bg-forest-600 text-primary-100 font-display text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isMutating ? "Saving..." : "Save"}
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
              {isLoading ? (
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
                        {entry.shortname && (
                          <p className="text-xs text-sunset-400 truncate mt-1">
                            {entry.shortname}
                          </p>
                        )}
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
                    NFD or Wallet Address
                  </label>
                  <input
                    type="text"
                    value={formAddressOrNFD}
                    onChange={(e) => setFormAddressOrNFD(e.target.value)}
                    placeholder={wallet.currentNetwork === 'ALGORAND' ? 'alice.algo or ALGORAND_ADDRESS...' : 'name.apt or 0x...'}
                    className="w-full bg-forest-800 text-primary-100 border border-forest-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sunset-500 transition-colors"
                  />
                  {isResolvingNFD && (
                    <p className="text-xs text-sunset-400 mt-1">Resolving NFD...</p>
                  )}
                  {nfdResolved && resolvedAddress && (
                    <div className="mt-2 p-2 bg-forest-800 rounded border border-sunset-500 border-opacity-30">
                      <p className="text-xs text-primary-300 mb-1">✓ Resolved to:</p>
                      <p className="text-xs text-sunset-400 font-mono break-all">{resolvedAddress}</p>
                    </div>
                  )}
                  {nfdNotFound && !isResolvingNFD && (
                    <p className="text-xs text-red-400 mt-1">⚠ NFD not found. Please check the name or enter a wallet address directly.</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      isAdding ? handleAdd() : handleUpdate(editingId!)
                    }
                    disabled={
                      isMutating || !formName.trim() || !formAddressOrNFD.trim() || isResolvingNFD || !isAddressValid
                    }
                    className="flex-1 bg-sunset-500 hover:bg-sunset-600 disabled:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isMutating ? "Saving..." : "Save"}
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
            {isLoading ? (
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
                      {entry.shortname && (
                        <p className="text-xs text-sunset-400 mt-1">
                          {entry.shortname}
                        </p>
                      )}
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
