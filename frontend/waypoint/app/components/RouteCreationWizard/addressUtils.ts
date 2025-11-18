import { BlockchainNetwork } from "../../contexts/NetworkContext";

// Address validation function
export const validateAddress = (
  address: string,
  network: BlockchainNetwork
): boolean => {
  if (!address || address.trim() === "") return false;

  if (network === BlockchainNetwork.ALGORAND) {
    // Algorand addresses: 58 chars, base32 encoded (A-Z, 2-7)
    const algorandRegex = /^[A-Z2-7]{58}$/;
    return algorandRegex.test(address);
  } else if (network === BlockchainNetwork.APTOS) {
    // Aptos addresses: hex with 0x prefix
    const aptosRegex = /^0x[a-fA-F0-9]{1,64}$/;
    return aptosRegex.test(address);
  }

  return false;
};

// NFD resolution function
export const resolveNFD = async (nfdName: string): Promise<string | null> => {
  if (!nfdName || !nfdName.endsWith(".algo")) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.nf.domains/nfd/${encodeURIComponent(
        nfdName
      )}?view=tiny&poll=false&nocache=false`
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
    console.error("Failed to resolve NFD:", error);
    return null;
  }
};

