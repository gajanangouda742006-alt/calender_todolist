import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

window.SAHRA_AUTH_STORAGE = {
  async get(key) {
    try {
      const result = await SecureStoragePlugin.get({ key });
      return result.value || null;
    } catch (error) {
      if (error === 'Item with given key does not exist') return null;
      throw error;
    }
  },
  async set(key, value) {
    await SecureStoragePlugin.set({ key, value });
  },
  async remove(key) {
    await SecureStoragePlugin.remove({ key });
  },
};
