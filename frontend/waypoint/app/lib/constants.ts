/**
 * Application Constants
 * Centralized environment variables for easy access throughout the app
 */

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://waypoint-backend-zhlb7.ondigitalocean.app";

// Aptos contract address
export const SIMPLE_LINEAR_ADDRESS = import.meta.env.VITE_SIMPLE_LINEAR_ADDRESS || "0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::linear_stream_fa";

// Algorand Registry App ID
export const ALGORAND_REGISTRY_APP = import.meta.env.VITE_ALGORAND_REGISTRY_APP || "3253603509";

// Algorand FluxGate Oracle App ID
export const ALGORAND_FLUX_ORACLE = import.meta.env.VITE_ALGORAND_FLUX_ORACLE || "3219204562";
