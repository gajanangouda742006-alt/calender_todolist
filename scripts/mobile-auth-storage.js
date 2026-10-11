
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

function isMissingKeyError(error) {
  const message =
    typeof error === 'string'
      ? error
      : error?.message || error?.error || '';

  return String(message).includes(
    'Item with given key does not exist'
  );
}

window.SAHRA_AUTH_STORAGE = {
  async get(key) {
    try {
      const result = await SecureStoragePlugin.get({ key });
      return result?.value ?? null;
    } catch (error) {
      if (isMissingKeyError(error)) return null;
      throw error;
    }
  },

  async set(key, value) {
    await SecureStoragePlugin.set({ key, value });
  },

  async remove(key) {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch (error) {
      if (isMissingKeyError(error)) return;
      throw error;
    }
  },
};
