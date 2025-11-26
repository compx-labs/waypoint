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

// Aptos Name Service (ANS) resolution function
export const resolveANS = async (ansName: string): Promise<string | null> => {
  if (!ansName) {
    return null;
  }

  try {
    // Ensure the name has .apt suffix - add it if missing
    // Handle subdomains like "xxiled.petra.apt" - keep full name with .apt
    const normalizedName = ansName.endsWith(".apt") ? ansName : `${ansName}.apt`;
    
    // Use aptosnames.com API for forward lookup (name -> address)
    // API endpoint: https://www.aptosnames.com/api/{network}/v1/address/{name}
    // The API expects the name WITHOUT .apt suffix
    const nameWithoutSuffix = normalizedName.replace(/\.apt$/, "");
    const network = "mainnet"; // Could be made dynamic if needed
    
    // Try aptosnames.com API - forward lookup endpoint
    const aptosNamesUrl = `https://www.aptosnames.com/api/${network}/v1/address/${encodeURIComponent(nameWithoutSuffix)}`;
    
    const response = await fetch(aptosNamesUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`ANS API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // aptosnames.com API returns: {"address": "0x..."}
    if (data && data.address) {
      return data.address;
    }

    return null;
  } catch (error) {
    console.error("Failed to resolve ANS:", error);
    return null;
  }
};

// Unified name resolution function that handles both NFD and ANS
export const resolveName = async (
  name: string,
  network: BlockchainNetwork
): Promise<string | null> => {
  if (network === BlockchainNetwork.ALGORAND && name.endsWith(".algo")) {
    return resolveNFD(name);
  } else if (network === BlockchainNetwork.APTOS) {
    // For Aptos, check if it's a potential ANS name (contains .apt or could be one)
    // resolveANS will handle adding .apt if needed
    return resolveANS(name);
  }
  return null;
};

// Reverse lookup: Address -> NFD name
export const resolveAddressToNFD = async (address: string): Promise<string | null> => {
  if (!address || !validateAddress(address, BlockchainNetwork.ALGORAND)) {
    return null;
  }

  try {
    // NFD API reverse lookup: address -> NFD name
    const response = await fetch(
      `https://api.nf.domains/nfd/lookup?address=${encodeURIComponent(address)}&view=tiny&poll=false&nocache=false`
    );
    const data = await response.json();

    // NFD API returns an array of NFDs, get the first one (primary)
    if (Array.isArray(data) && data.length > 0 && data[0]?.name) {
      return data[0].name;
    }

    // Check if single object response
    if (data && data.name && data.name !== "notFound") {
      return data.name;
    }

    return null;
  } catch (error) {
    console.error("Failed to resolve address to NFD:", error);
    return null;
  }
};

// Reverse lookup: Address -> ANS name
export const resolveAddressToANS = async (address: string): Promise<string | null> => {
  if (!address || !validateAddress(address, BlockchainNetwork.APTOS)) {
    return null;
  }

  try {
    // ANS reverse lookup: address -> ANS name
    // API endpoint: https://www.aptosnames.com/api/{network}/v1/primary-name/{address}
    const network = "mainnet"; // Could be made dynamic if needed
    const ansUrl = `https://www.aptosnames.com/api/${network}/v1/primary-name/${encodeURIComponent(address)}`;
    
    const response = await fetch(ansUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`ANS reverse lookup API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API returns: {"name": "xxiled.apt"} or similar
    if (data && data.name) {
      return data.name;
    }

    return null;
  } catch (error) {
    console.error("Failed to resolve address to ANS:", error);
    return null;
  }
};

// Unified reverse lookup: Address -> Name (NFD or ANS)
export const resolveAddressToName = async (
  address: string,
  network: BlockchainNetwork
): Promise<string | null> => {
  if (!address) return null;

  if (network === BlockchainNetwork.ALGORAND) {
    return resolveAddressToNFD(address);
  } else if (network === BlockchainNetwork.APTOS) {
    return resolveAddressToANS(address);
  }
  
  return null;
};

