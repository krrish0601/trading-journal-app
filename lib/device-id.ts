import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "trading_journal_device_id";

/**
 * Generate a UUID v4-like string
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a unique device ID for this installation.
 * This ensures each device has its own isolated trade data.
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      return existingId;
    }

    // Generate new device ID if it doesn't exist
    const newId = generateUUID();

    // Store it for future use
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error("Failed to get device ID:", error);
    // Fallback to a random ID if storage fails
    return `device_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Clear the device ID (useful for testing or resetting the app)
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error("Failed to clear device ID:", error);
  }
}
