var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@capacitor/core/dist/index.js
var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
var init_dist = __esm({
  "node_modules/@capacitor/core/dist/index.js"() {
    (function(ExceptionCode2) {
      ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
      ExceptionCode2["Unavailable"] = "UNAVAILABLE";
    })(ExceptionCode || (ExceptionCode = {}));
    CapacitorException = class extends Error {
      constructor(message, code, data) {
        super(message);
        this.message = message;
        this.code = code;
        this.data = data;
      }
    };
    getPlatformId = (win) => {
      var _a, _b;
      if (win === null || win === void 0 ? void 0 : win.androidBridge) {
        return "android";
      } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
        return "ios";
      } else {
        return "web";
      }
    };
    createCapacitor = (win) => {
      const capCustomPlatform = win.CapacitorCustomPlatform || null;
      const cap = win.Capacitor || {};
      const Plugins = cap.Plugins = cap.Plugins || {};
      const getPlatform = () => {
        return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
      };
      const isNativePlatform = () => getPlatform() !== "web";
      const isPluginAvailable = (pluginName) => {
        const plugin = registeredPlugins.get(pluginName);
        if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
          return true;
        }
        if (getPluginHeader(pluginName)) {
          return true;
        }
        return false;
      };
      const getPluginHeader = (pluginName) => {
        var _a;
        return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
      };
      const handleError = (err) => win.console.error(err);
      const registeredPlugins = /* @__PURE__ */ new Map();
      const registerPlugin2 = (pluginName, jsImplementations = {}) => {
        const registeredPlugin = registeredPlugins.get(pluginName);
        if (registeredPlugin) {
          console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
          return registeredPlugin.proxy;
        }
        const platform = getPlatform();
        const pluginHeader = getPluginHeader(pluginName);
        let jsImplementation;
        const loadPluginImplementation = async () => {
          if (!jsImplementation && platform in jsImplementations) {
            jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
          } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
            jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
          }
          return jsImplementation;
        };
        const createPluginMethod = (impl, prop) => {
          var _a, _b;
          if (pluginHeader) {
            const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
            if (methodHeader) {
              if (methodHeader.rtype === "promise") {
                return (options) => cap.nativePromise(pluginName, prop.toString(), options);
              } else {
                return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
              }
            } else if (impl) {
              return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
            }
          } else if (impl) {
            return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
          } else {
            throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
          }
        };
        const createPluginMethodWrapper = (prop) => {
          let remove;
          const wrapper = (...args) => {
            const p = loadPluginImplementation().then((impl) => {
              const fn = createPluginMethod(impl, prop);
              if (fn) {
                const p2 = fn(...args);
                remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                return p2;
              } else {
                throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
              }
            });
            if (prop === "addListener") {
              p.remove = async () => remove();
            }
            return p;
          };
          wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
          Object.defineProperty(wrapper, "name", {
            value: prop,
            writable: false,
            configurable: false
          });
          return wrapper;
        };
        const addListener = createPluginMethodWrapper("addListener");
        const removeListener = createPluginMethodWrapper("removeListener");
        const addListenerNative = (eventName, callback) => {
          const call = addListener({ eventName }, callback);
          const remove = async () => {
            const callbackId = await call;
            removeListener({
              eventName,
              callbackId
            }, callback);
          };
          const p = new Promise((resolve) => call.then(() => resolve({ remove })));
          p.remove = async () => {
            console.warn(`Using addListener() without 'await' is deprecated.`);
            await remove();
          };
          return p;
        };
        const proxy = new Proxy({}, {
          get(_, prop) {
            switch (prop) {
              // https://github.com/facebook/react/issues/20030
              case "$$typeof":
                return void 0;
              case "toJSON":
                return () => ({});
              case "addListener":
                return pluginHeader ? addListenerNative : addListener;
              case "removeListener":
                return removeListener;
              default:
                return createPluginMethodWrapper(prop);
            }
          }
        });
        Plugins[pluginName] = proxy;
        registeredPlugins.set(pluginName, {
          name: pluginName,
          proxy,
          platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
        });
        return proxy;
      };
      if (!cap.convertFileSrc) {
        cap.convertFileSrc = (filePath) => filePath;
      }
      cap.getPlatform = getPlatform;
      cap.handleError = handleError;
      cap.isNativePlatform = isNativePlatform;
      cap.isPluginAvailable = isPluginAvailable;
      cap.registerPlugin = registerPlugin2;
      cap.Exception = CapacitorException;
      cap.DEBUG = !!cap.DEBUG;
      cap.isLoggingEnabled = !!cap.isLoggingEnabled;
      return cap;
    };
    initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
    Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
    registerPlugin = Capacitor.registerPlugin;
    WebPlugin = class {
      constructor() {
        this.listeners = {};
        this.retainedEventArguments = {};
        this.windowListeners = {};
      }
      addListener(eventName, listenerFunc) {
        let firstListener = false;
        const listeners = this.listeners[eventName];
        if (!listeners) {
          this.listeners[eventName] = [];
          firstListener = true;
        }
        this.listeners[eventName].push(listenerFunc);
        const windowListener = this.windowListeners[eventName];
        if (windowListener && !windowListener.registered) {
          this.addWindowListener(windowListener);
        }
        if (firstListener) {
          this.sendRetainedArgumentsForEvent(eventName);
        }
        const remove = async () => this.removeListener(eventName, listenerFunc);
        const p = Promise.resolve({ remove });
        return p;
      }
      async removeAllListeners() {
        this.listeners = {};
        for (const listener in this.windowListeners) {
          this.removeWindowListener(this.windowListeners[listener]);
        }
        this.windowListeners = {};
      }
      notifyListeners(eventName, data, retainUntilConsumed) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
          if (retainUntilConsumed) {
            let args = this.retainedEventArguments[eventName];
            if (!args) {
              args = [];
            }
            args.push(data);
            this.retainedEventArguments[eventName] = args;
          }
          return;
        }
        listeners.forEach((listener) => listener(data));
      }
      hasListeners(eventName) {
        var _a;
        return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
      }
      registerWindowListener(windowEventName, pluginEventName) {
        this.windowListeners[pluginEventName] = {
          registered: false,
          windowEventName,
          pluginEventName,
          handler: (event) => {
            this.notifyListeners(pluginEventName, event);
          }
        };
      }
      unimplemented(msg = "not implemented") {
        return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
      }
      unavailable(msg = "not available") {
        return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
      }
      async removeListener(eventName, listenerFunc) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
          return;
        }
        const index = listeners.indexOf(listenerFunc);
        if (index !== -1) {
          this.listeners[eventName].splice(index, 1);
        }
        if (!this.listeners[eventName].length) {
          this.removeWindowListener(this.windowListeners[eventName]);
        }
      }
      addWindowListener(handle) {
        window.addEventListener(handle.windowEventName, handle.handler);
        handle.registered = true;
      }
      removeWindowListener(handle) {
        if (!handle) {
          return;
        }
        window.removeEventListener(handle.windowEventName, handle.handler);
        handle.registered = false;
      }
      sendRetainedArgumentsForEvent(eventName) {
        const args = this.retainedEventArguments[eventName];
        if (!args) {
          return;
        }
        delete this.retainedEventArguments[eventName];
        args.forEach((arg) => {
          this.notifyListeners(eventName, arg);
        });
      }
    };
    encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
    decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    CapacitorCookiesPluginWeb = class extends WebPlugin {
      async getCookies() {
        const cookies = document.cookie;
        const cookieMap = {};
        cookies.split(";").forEach((cookie) => {
          if (cookie.length <= 0)
            return;
          let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
          key = decode(key).trim();
          value = decode(value).trim();
          cookieMap[key] = value;
        });
        return cookieMap;
      }
      async setCookie(options) {
        try {
          const encodedKey = encode(options.key);
          const encodedValue = encode(options.value);
          const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
          const path = (options.path || "/").replace("path=", "");
          const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
          document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async deleteCookie(options) {
        try {
          document.cookie = `${options.key}=; Max-Age=0`;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async clearCookies() {
        try {
          const cookies = document.cookie.split(";") || [];
          for (const cookie of cookies) {
            document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
          }
        } catch (error) {
          return Promise.reject(error);
        }
      }
      async clearAllCookies() {
        try {
          await this.clearCookies();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    };
    CapacitorCookies = registerPlugin("CapacitorCookies", {
      web: () => new CapacitorCookiesPluginWeb()
    });
    readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
    normalizeHttpHeaders = (headers = {}) => {
      const originalKeys = Object.keys(headers);
      const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
      const normalized = loweredKeys.reduce((acc, key, index) => {
        acc[key] = headers[originalKeys[index]];
        return acc;
      }, {});
      return normalized;
    };
    buildUrlParams = (params, shouldEncode = true) => {
      if (!params)
        return null;
      const output = Object.entries(params).reduce((accumulator, entry) => {
        const [key, value] = entry;
        let encodedValue;
        let item;
        if (Array.isArray(value)) {
          item = "";
          value.forEach((str) => {
            encodedValue = shouldEncode ? encodeURIComponent(str) : str;
            item += `${key}=${encodedValue}&`;
          });
          item.slice(0, -1);
        } else {
          encodedValue = shouldEncode ? encodeURIComponent(value) : value;
          item = `${key}=${encodedValue}`;
        }
        return `${accumulator}&${item}`;
      }, "");
      return output.substr(1);
    };
    buildRequestInit = (options, extra = {}) => {
      const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
      const headers = normalizeHttpHeaders(options.headers);
      const type = headers["content-type"] || "";
      if (typeof options.data === "string") {
        output.body = options.data;
      } else if (type.includes("application/x-www-form-urlencoded")) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(options.data || {})) {
          params.set(key, value);
        }
        output.body = params.toString();
      } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
        const form = new FormData();
        if (options.data instanceof FormData) {
          options.data.forEach((value, key) => {
            form.append(key, value);
          });
        } else {
          for (const key of Object.keys(options.data)) {
            form.append(key, options.data[key]);
          }
        }
        output.body = form;
        const headers2 = new Headers(output.headers);
        headers2.delete("content-type");
        output.headers = headers2;
      } else if (type.includes("application/json") || typeof options.data === "object") {
        output.body = JSON.stringify(options.data);
      }
      return output;
    };
    CapacitorHttpPluginWeb = class extends WebPlugin {
      /**
       * Perform an Http request given a set of options
       * @param options Options to build the HTTP request
       */
      async request(options) {
        const requestInit = buildRequestInit(options, options.webFetchExtra);
        const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
        const url = urlParams ? `${options.url}?${urlParams}` : options.url;
        const response = await fetch(url, requestInit);
        const contentType = response.headers.get("content-type") || "";
        let { responseType = "text" } = response.ok ? options : {};
        if (contentType.includes("application/json")) {
          responseType = "json";
        }
        let data;
        let blob;
        switch (responseType) {
          case "arraybuffer":
          case "blob":
            blob = await response.blob();
            data = await readBlobAsBase64(blob);
            break;
          case "json":
            data = await response.json();
            break;
          case "document":
          case "text":
          default:
            data = await response.text();
        }
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        return {
          data,
          headers,
          status: response.status,
          url: response.url
        };
      }
      /**
       * Perform an Http GET request given a set of options
       * @param options Options to build the HTTP request
       */
      async get(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
      }
      /**
       * Perform an Http POST request given a set of options
       * @param options Options to build the HTTP request
       */
      async post(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
      }
      /**
       * Perform an Http PUT request given a set of options
       * @param options Options to build the HTTP request
       */
      async put(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
      }
      /**
       * Perform an Http PATCH request given a set of options
       * @param options Options to build the HTTP request
       */
      async patch(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
      }
      /**
       * Perform an Http DELETE request given a set of options
       * @param options Options to build the HTTP request
       */
      async delete(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
      }
    };
    CapacitorHttp = registerPlugin("CapacitorHttp", {
      web: () => new CapacitorHttpPluginWeb()
    });
    (function(SystemBarsStyle2) {
      SystemBarsStyle2["Dark"] = "DARK";
      SystemBarsStyle2["Light"] = "LIGHT";
      SystemBarsStyle2["Default"] = "DEFAULT";
    })(SystemBarsStyle || (SystemBarsStyle = {}));
    (function(SystemBarType2) {
      SystemBarType2["StatusBar"] = "StatusBar";
      SystemBarType2["NavigationBar"] = "NavigationBar";
    })(SystemBarType || (SystemBarType = {}));
    SystemBarsPluginWeb = class extends WebPlugin {
      async setStyle() {
        this.unavailable("not available for web");
      }
      async setAnimation() {
        this.unavailable("not available for web");
      }
      async show() {
        this.unavailable("not available for web");
      }
      async hide() {
        this.unavailable("not available for web");
      }
    };
    SystemBars = registerPlugin("SystemBars", {
      web: () => new SystemBarsPluginWeb()
    });
  }
});

// node_modules/@capacitor-community/sqlite/dist/esm/definitions.js
var SQLiteConnection, SQLiteDBConnection;
var init_definitions = __esm({
  "node_modules/@capacitor-community/sqlite/dist/esm/definitions.js"() {
    SQLiteConnection = class {
      constructor(sqlite2) {
        this.sqlite = sqlite2;
        this._connectionDict = /* @__PURE__ */ new Map();
      }
      async initWebStore() {
        try {
          await this.sqlite.initWebStore();
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async saveToStore(database) {
        try {
          await this.sqlite.saveToStore({ database });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async saveToLocalDisk(database) {
        try {
          await this.sqlite.saveToLocalDisk({ database });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getFromLocalDiskToStore(overwrite) {
        const mOverwrite = overwrite != null ? overwrite : true;
        try {
          await this.sqlite.getFromLocalDiskToStore({ overwrite: mOverwrite });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async echo(value) {
        try {
          const res = await this.sqlite.echo({ value });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isSecretStored() {
        try {
          const res = await this.sqlite.isSecretStored();
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async setEncryptionSecret(passphrase) {
        try {
          await this.sqlite.setEncryptionSecret({ passphrase });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async changeEncryptionSecret(passphrase, oldpassphrase) {
        try {
          await this.sqlite.changeEncryptionSecret({
            passphrase,
            oldpassphrase
          });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async clearEncryptionSecret() {
        try {
          await this.sqlite.clearEncryptionSecret();
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async checkEncryptionSecret(passphrase) {
        try {
          const res = await this.sqlite.checkEncryptionSecret({
            passphrase
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async addUpgradeStatement(database, upgrade) {
        try {
          if (database.endsWith(".db"))
            database = database.slice(0, -3);
          await this.sqlite.addUpgradeStatement({
            database,
            upgrade
          });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async createConnection(database, encrypted, mode, version, readonly) {
        try {
          if (database.endsWith(".db"))
            database = database.slice(0, -3);
          await this.sqlite.createConnection({
            database,
            encrypted,
            mode,
            version,
            readonly
          });
          const conn = new SQLiteDBConnection(database, readonly, this.sqlite);
          const connName = readonly ? `RO_${database}` : `RW_${database}`;
          this._connectionDict.set(connName, conn);
          return Promise.resolve(conn);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async closeConnection(database, readonly) {
        try {
          if (database.endsWith(".db"))
            database = database.slice(0, -3);
          await this.sqlite.closeConnection({ database, readonly });
          const connName = readonly ? `RO_${database}` : `RW_${database}`;
          this._connectionDict.delete(connName);
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isConnection(database, readonly) {
        const res = {};
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        const connName = readonly ? `RO_${database}` : `RW_${database}`;
        res.result = this._connectionDict.has(connName);
        return Promise.resolve(res);
      }
      async retrieveConnection(database, readonly) {
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        const connName = readonly ? `RO_${database}` : `RW_${database}`;
        if (this._connectionDict.has(connName)) {
          const conn = this._connectionDict.get(connName);
          if (typeof conn != "undefined")
            return Promise.resolve(conn);
          else {
            return Promise.reject(`Connection ${database} is undefined`);
          }
        } else {
          return Promise.reject(`Connection ${database} does not exist`);
        }
      }
      async getNCDatabasePath(path, database) {
        try {
          const databasePath = await this.sqlite.getNCDatabasePath({
            path,
            database
          });
          return Promise.resolve(databasePath);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async createNCConnection(databasePath, version) {
        try {
          await this.sqlite.createNCConnection({
            databasePath,
            version
          });
          const conn = new SQLiteDBConnection(databasePath, true, this.sqlite);
          const connName = `RO_${databasePath})`;
          this._connectionDict.set(connName, conn);
          return Promise.resolve(conn);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async closeNCConnection(databasePath) {
        try {
          await this.sqlite.closeNCConnection({ databasePath });
          const connName = `RO_${databasePath})`;
          this._connectionDict.delete(connName);
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isNCConnection(databasePath) {
        const res = {};
        const connName = `RO_${databasePath})`;
        res.result = this._connectionDict.has(connName);
        return Promise.resolve(res);
      }
      async retrieveNCConnection(databasePath) {
        if (this._connectionDict.has(databasePath)) {
          const connName = `RO_${databasePath})`;
          const conn = this._connectionDict.get(connName);
          if (typeof conn != "undefined")
            return Promise.resolve(conn);
          else {
            return Promise.reject(`Connection ${databasePath} is undefined`);
          }
        } else {
          return Promise.reject(`Connection ${databasePath} does not exist`);
        }
      }
      async isNCDatabase(databasePath) {
        try {
          const res = await this.sqlite.isNCDatabase({ databasePath });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async retrieveAllConnections() {
        return this._connectionDict;
      }
      async closeAllConnections() {
        const delDict = /* @__PURE__ */ new Map();
        try {
          for (const key of this._connectionDict.keys()) {
            const database = key.substring(3);
            const readonly = key.substring(0, 3) === "RO_" ? true : false;
            await this.sqlite.closeConnection({ database, readonly });
            delDict.set(key, null);
          }
          for (const key of delDict.keys()) {
            this._connectionDict.delete(key);
          }
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async checkConnectionsConsistency() {
        try {
          const keys = [...this._connectionDict.keys()];
          const openModes = [];
          const dbNames = [];
          for (const key of keys) {
            openModes.push(key.substring(0, 2));
            dbNames.push(key.substring(3));
          }
          const res = await this.sqlite.checkConnectionsConsistency({
            dbNames,
            openModes
          });
          if (!res.result)
            this._connectionDict = /* @__PURE__ */ new Map();
          return Promise.resolve(res);
        } catch (err) {
          this._connectionDict = /* @__PURE__ */ new Map();
          return Promise.reject(err);
        }
      }
      async importFromJson(jsonstring) {
        try {
          const ret = await this.sqlite.importFromJson({ jsonstring });
          return Promise.resolve(ret);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isJsonValid(jsonstring) {
        try {
          const ret = await this.sqlite.isJsonValid({ jsonstring });
          return Promise.resolve(ret);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async copyFromAssets(overwrite) {
        const mOverwrite = overwrite != null ? overwrite : true;
        try {
          await this.sqlite.copyFromAssets({ overwrite: mOverwrite });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getFromHTTPRequest(url, overwrite) {
        const mOverwrite = overwrite != null ? overwrite : true;
        try {
          await this.sqlite.getFromHTTPRequest({ url, overwrite: mOverwrite });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isDatabaseEncrypted(database) {
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        try {
          const res = await this.sqlite.isDatabaseEncrypted({ database });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isInConfigEncryption() {
        try {
          const res = await this.sqlite.isInConfigEncryption();
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isInConfigBiometricAuth() {
        try {
          const res = await this.sqlite.isInConfigBiometricAuth();
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isDatabase(database) {
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        try {
          const res = await this.sqlite.isDatabase({ database });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getDatabaseList() {
        try {
          const res = await this.sqlite.getDatabaseList();
          const values = res.values;
          values.sort();
          const ret = { values };
          return Promise.resolve(ret);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getMigratableDbList(folderPath) {
        const path = folderPath ? folderPath : "default";
        try {
          const res = await this.sqlite.getMigratableDbList({
            folderPath: path
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async addSQLiteSuffix(folderPath, dbNameList) {
        const path = folderPath ? folderPath : "default";
        const dbList = dbNameList ? dbNameList : [];
        try {
          const res = await this.sqlite.addSQLiteSuffix({
            folderPath: path,
            dbNameList: dbList
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async deleteOldDatabases(folderPath, dbNameList) {
        const path = folderPath ? folderPath : "default";
        const dbList = dbNameList ? dbNameList : [];
        try {
          const res = await this.sqlite.deleteOldDatabases({
            folderPath: path,
            dbNameList: dbList
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async moveDatabasesAndAddSuffix(folderPath, dbNameList) {
        const path = folderPath ? folderPath : "default";
        const dbList = dbNameList ? dbNameList : [];
        return this.sqlite.moveDatabasesAndAddSuffix({
          folderPath: path,
          dbNameList: dbList
        });
      }
    };
    SQLiteDBConnection = class {
      constructor(dbName, readonly, sqlite2) {
        this.dbName = dbName;
        this.readonly = readonly;
        this.sqlite = sqlite2;
      }
      getConnectionDBName() {
        return this.dbName;
      }
      getConnectionReadOnly() {
        return this.readonly;
      }
      async open() {
        try {
          await this.sqlite.open({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async close() {
        try {
          await this.sqlite.close({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async beginTransaction() {
        try {
          const changes = await this.sqlite.beginTransaction({
            database: this.dbName
          });
          return Promise.resolve(changes);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async commitTransaction() {
        try {
          const changes = await this.sqlite.commitTransaction({
            database: this.dbName
          });
          return Promise.resolve(changes);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async rollbackTransaction() {
        try {
          const changes = await this.sqlite.rollbackTransaction({
            database: this.dbName
          });
          return Promise.resolve(changes);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isTransactionActive() {
        try {
          const result = await this.sqlite.isTransactionActive({
            database: this.dbName
          });
          return Promise.resolve(result);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async loadExtension(path) {
        try {
          await this.sqlite.loadExtension({
            database: this.dbName,
            path,
            readonly: this.readonly
          });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async enableLoadExtension(toggle) {
        try {
          await this.sqlite.enableLoadExtension({
            database: this.dbName,
            toggle,
            readonly: this.readonly
          });
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getUrl() {
        try {
          const res = await this.sqlite.getUrl({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getVersion() {
        try {
          const version = await this.sqlite.getVersion({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve(version);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getTableList() {
        try {
          const res = await this.sqlite.getTableList({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async execute(statements, transaction = true, isSQL92 = true) {
        try {
          if (!this.readonly) {
            const res = await this.sqlite.execute({
              database: this.dbName,
              statements,
              transaction,
              readonly: false,
              isSQL92
            });
            return Promise.resolve(res);
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async query(statement, values, isSQL92 = true) {
        let res;
        try {
          if (values && values.length > 0) {
            res = await this.sqlite.query({
              database: this.dbName,
              statement,
              values,
              readonly: this.readonly,
              isSQL92: true
            });
          } else {
            res = await this.sqlite.query({
              database: this.dbName,
              statement,
              values: [],
              readonly: this.readonly,
              isSQL92
            });
          }
          res = await this.reorderRows(res);
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async run(statement, values, transaction = true, returnMode = "no", isSQL92 = true) {
        let res;
        try {
          if (!this.readonly) {
            if (values && values.length > 0) {
              res = await this.sqlite.run({
                database: this.dbName,
                statement,
                values,
                transaction,
                readonly: false,
                returnMode,
                isSQL92: true
              });
            } else {
              res = await this.sqlite.run({
                database: this.dbName,
                statement,
                values: [],
                transaction,
                readonly: false,
                returnMode,
                isSQL92
              });
            }
            res.changes = await this.reorderRows(res.changes);
            return Promise.resolve(res);
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async executeSet(set, transaction = true, returnMode = "no", isSQL92 = true) {
        let res;
        try {
          if (!this.readonly) {
            res = await this.sqlite.executeSet({
              database: this.dbName,
              set,
              transaction,
              readonly: false,
              returnMode,
              isSQL92
            });
            res.changes = await this.reorderRows(res.changes);
            return Promise.resolve(res);
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isExists() {
        try {
          const res = await this.sqlite.isDBExists({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isTable(table) {
        try {
          const res = await this.sqlite.isTableExists({
            database: this.dbName,
            table,
            readonly: this.readonly
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async isDBOpen() {
        try {
          const res = await this.sqlite.isDBOpen({
            database: this.dbName,
            readonly: this.readonly
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async delete() {
        try {
          if (!this.readonly) {
            await this.sqlite.deleteDatabase({
              database: this.dbName,
              readonly: false
            });
            return Promise.resolve();
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async createSyncTable() {
        try {
          if (!this.readonly) {
            const res = await this.sqlite.createSyncTable({
              database: this.dbName,
              readonly: false
            });
            return Promise.resolve(res);
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async setSyncDate(syncdate) {
        try {
          if (!this.readonly) {
            await this.sqlite.setSyncDate({
              database: this.dbName,
              syncdate,
              readonly: false
            });
            return Promise.resolve();
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async getSyncDate() {
        try {
          const res = await this.sqlite.getSyncDate({
            database: this.dbName,
            readonly: this.readonly
          });
          let retDate = "";
          if (res.syncDate > 0)
            retDate = new Date(res.syncDate * 1e3).toISOString();
          return Promise.resolve(retDate);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async exportToJson(mode, encrypted = false) {
        try {
          const res = await this.sqlite.exportToJson({
            database: this.dbName,
            jsonexportmode: mode,
            readonly: this.readonly,
            encrypted
          });
          return Promise.resolve(res);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async deleteExportedRows() {
        try {
          if (!this.readonly) {
            await this.sqlite.deleteExportedRows({
              database: this.dbName,
              readonly: false
            });
            return Promise.resolve();
          } else {
            return Promise.reject("not allowed in read-only mode");
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async executeTransaction(txn, isSQL92 = true) {
        let changes = 0;
        let isActive = false;
        if (!this.readonly) {
          await this.sqlite.beginTransaction({
            database: this.dbName
          });
          isActive = await this.sqlite.isTransactionActive({
            database: this.dbName
          });
          if (!isActive) {
            return Promise.reject("After Begin Transaction, no transaction active");
          }
          try {
            for (const task of txn) {
              if (typeof task !== "object" || !("statement" in task)) {
                throw new Error("Error a task.statement must be provided");
              }
              if ("values" in task && task.values && task.values.length > 0) {
                const retMode = task.statement.toUpperCase().includes("RETURNING") ? "all" : "no";
                const ret = await this.sqlite.run({
                  database: this.dbName,
                  statement: task.statement,
                  values: task.values,
                  transaction: false,
                  readonly: false,
                  returnMode: retMode,
                  isSQL92
                });
                if (ret.changes.changes < 0) {
                  throw new Error("Error in transaction method run ");
                }
                changes += ret.changes.changes;
              } else {
                const ret = await this.sqlite.execute({
                  database: this.dbName,
                  statements: task.statement,
                  transaction: false,
                  readonly: false
                });
                if (ret.changes.changes < 0) {
                  throw new Error("Error in transaction method execute ");
                }
                changes += ret.changes.changes;
              }
            }
            const retC = await this.sqlite.commitTransaction({
              database: this.dbName
            });
            changes += retC.changes.changes;
            const retChanges = { changes: { changes } };
            return Promise.resolve(retChanges);
          } catch (err) {
            const msg = err.message ? err.message : err;
            await this.sqlite.rollbackTransaction({
              database: this.dbName
            });
            return Promise.reject(msg);
          }
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      }
      async reorderRows(res) {
        const retRes = res;
        if (res?.values && typeof res.values[0] === "object") {
          if (Object.keys(res.values[0]).includes("ios_columns")) {
            const columnList = res.values[0]["ios_columns"];
            const iosRes = [];
            for (let i = 1; i < res.values.length; i++) {
              const rowJson = res.values[i];
              const resRowJson = {};
              for (const item of columnList) {
                resRowJson[item] = rowJson[item];
              }
              iosRes.push(resRowJson);
            }
            retRes["values"] = iosRes;
          }
        }
        return Promise.resolve(retRes);
      }
    };
  }
});

// node_modules/@capacitor-community/sqlite/dist/esm/web.js
var web_exports = {};
__export(web_exports, {
  CapacitorSQLiteWeb: () => CapacitorSQLiteWeb
});
var CapacitorSQLiteWeb;
var init_web = __esm({
  "node_modules/@capacitor-community/sqlite/dist/esm/web.js"() {
    init_dist();
    CapacitorSQLiteWeb = class extends WebPlugin {
      constructor() {
        super(...arguments);
        this.jeepSqliteElement = null;
        this.isWebStoreOpen = false;
      }
      async initWebStore() {
        await customElements.whenDefined("jeep-sqlite");
        this.jeepSqliteElement = document.querySelector("jeep-sqlite");
        this.ensureJeepSqliteIsAvailable();
        this.jeepSqliteElement.addEventListener("jeepSqliteImportProgress", (event) => {
          this.notifyListeners("sqliteImportProgressEvent", event.detail);
        });
        this.jeepSqliteElement.addEventListener("jeepSqliteExportProgress", (event) => {
          this.notifyListeners("sqliteExportProgressEvent", event.detail);
        });
        this.jeepSqliteElement.addEventListener("jeepSqliteHTTPRequestEnded", (event) => {
          this.notifyListeners("sqliteHTTPRequestEndedEvent", event.detail);
        });
        this.jeepSqliteElement.addEventListener("jeepSqlitePickDatabaseEnded", (event) => {
          this.notifyListeners("sqlitePickDatabaseEndedEvent", event.detail);
        });
        this.jeepSqliteElement.addEventListener("jeepSqliteSaveDatabaseToDisk", (event) => {
          this.notifyListeners("sqliteSaveDatabaseToDiskEvent", event.detail);
        });
        if (!this.isWebStoreOpen) {
          this.isWebStoreOpen = await this.jeepSqliteElement.isStoreOpen();
        }
        return;
      }
      async saveToStore(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.saveToStore(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async getFromLocalDiskToStore(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.getFromLocalDiskToStore(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async saveToLocalDisk(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.saveToLocalDisk(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async echo(options) {
        this.ensureJeepSqliteIsAvailable();
        const echoResult = await this.jeepSqliteElement.echo(options);
        return echoResult;
      }
      async createConnection(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.createConnection(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async open(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.open(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async closeConnection(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.closeConnection(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async getVersion(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const versionResult = await this.jeepSqliteElement.getVersion(options);
          return versionResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async checkConnectionsConsistency(options) {
        this.ensureJeepSqliteIsAvailable();
        try {
          const consistencyResult = await this.jeepSqliteElement.checkConnectionsConsistency(options);
          return consistencyResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async close(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.close(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async beginTransaction(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const changes = await this.jeepSqliteElement.beginTransaction(options);
          return changes;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async commitTransaction(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const changes = await this.jeepSqliteElement.commitTransaction(options);
          return changes;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async rollbackTransaction(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const changes = await this.jeepSqliteElement.rollbackTransaction(options);
          return changes;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async isTransactionActive(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const result = await this.jeepSqliteElement.isTransactionActive(options);
          return result;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async getTableList(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const tableListResult = await this.jeepSqliteElement.getTableList(options);
          return tableListResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async execute(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const executeResult = await this.jeepSqliteElement.execute(options);
          return executeResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async executeSet(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const executeResult = await this.jeepSqliteElement.executeSet(options);
          return executeResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async run(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const runResult = await this.jeepSqliteElement.run(options);
          return runResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async query(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const queryResult = await this.jeepSqliteElement.query(options);
          return queryResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async isDBExists(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const dbExistsResult = await this.jeepSqliteElement.isDBExists(options);
          return dbExistsResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async isDBOpen(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const isDBOpenResult = await this.jeepSqliteElement.isDBOpen(options);
          return isDBOpenResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async isDatabase(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const isDatabaseResult = await this.jeepSqliteElement.isDatabase(options);
          return isDatabaseResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async isTableExists(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const tableExistsResult = await this.jeepSqliteElement.isTableExists(options);
          return tableExistsResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async deleteDatabase(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.deleteDatabase(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async isJsonValid(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const isJsonValidResult = await this.jeepSqliteElement.isJsonValid(options);
          return isJsonValidResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async importFromJson(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const importFromJsonResult = await this.jeepSqliteElement.importFromJson(options);
          return importFromJsonResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async exportToJson(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const exportToJsonResult = await this.jeepSqliteElement.exportToJson(options);
          return exportToJsonResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async createSyncTable(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const createSyncTableResult = await this.jeepSqliteElement.createSyncTable(options);
          return createSyncTableResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async setSyncDate(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.setSyncDate(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async getSyncDate(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const getSyncDateResult = await this.jeepSqliteElement.getSyncDate(options);
          return getSyncDateResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async deleteExportedRows(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.deleteExportedRows(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async addUpgradeStatement(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.addUpgradeStatement(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async copyFromAssets(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.copyFromAssets(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async getFromHTTPRequest(options) {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          await this.jeepSqliteElement.getFromHTTPRequest(options);
          return;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      async getDatabaseList() {
        this.ensureJeepSqliteIsAvailable();
        this.ensureWebstoreIsOpen();
        try {
          const databaseListResult = await this.jeepSqliteElement.getDatabaseList();
          return databaseListResult;
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
      /**
       * Checks if the `jeep-sqlite` element is present in the DOM.
       * If it's not in the DOM, this method throws an Error.
       *
       * Attention: This will always fail, if the `intWebStore()` method wasn't called before.
       */
      ensureJeepSqliteIsAvailable() {
        if (this.jeepSqliteElement === null) {
          throw new Error(`The jeep-sqlite element is not present in the DOM! Please check the @capacitor-community/sqlite documentation for instructions regarding the web platform.`);
        }
      }
      ensureWebstoreIsOpen() {
        if (!this.isWebStoreOpen) {
          throw new Error('WebStore is not open yet. You have to call "initWebStore()" first.');
        }
      }
      ////////////////////////////////////
      ////// UNIMPLEMENTED METHODS
      ////////////////////////////////////
      async getUrl() {
        throw this.unimplemented("Not implemented on web.");
      }
      async getMigratableDbList(options) {
        console.log("getMigratableDbList", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async addSQLiteSuffix(options) {
        console.log("addSQLiteSuffix", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async deleteOldDatabases(options) {
        console.log("deleteOldDatabases", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async moveDatabasesAndAddSuffix(options) {
        console.log("moveDatabasesAndAddSuffix", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async isSecretStored() {
        throw this.unimplemented("Not implemented on web.");
      }
      async setEncryptionSecret(options) {
        console.log("setEncryptionSecret", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async changeEncryptionSecret(options) {
        console.log("changeEncryptionSecret", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async clearEncryptionSecret() {
        console.log("clearEncryptionSecret");
        throw this.unimplemented("Not implemented on web.");
      }
      async checkEncryptionSecret(options) {
        console.log("checkEncryptionPassPhrase", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async getNCDatabasePath(options) {
        console.log("getNCDatabasePath", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async createNCConnection(options) {
        console.log("createNCConnection", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async closeNCConnection(options) {
        console.log("closeNCConnection", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async isNCDatabase(options) {
        console.log("isNCDatabase", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async isDatabaseEncrypted(options) {
        console.log("isDatabaseEncrypted", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async isInConfigEncryption() {
        throw this.unimplemented("Not implemented on web.");
      }
      async isInConfigBiometricAuth() {
        throw this.unimplemented("Not implemented on web.");
      }
      async loadExtension(options) {
        console.log("loadExtension", options);
        throw this.unimplemented("Not implemented on web.");
      }
      async enableLoadExtension(options) {
        console.log("enableLoadExtension", options);
        throw this.unimplemented("Not implemented on web.");
      }
    };
  }
});

// node_modules/@capacitor-community/sqlite/dist/esm/index.js
var CapacitorSQLite;
var init_esm = __esm({
  "node_modules/@capacitor-community/sqlite/dist/esm/index.js"() {
    init_dist();
    init_definitions();
    CapacitorSQLite = registerPlugin("CapacitorSQLite", {
      web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.CapacitorSQLiteWeb()),
      electron: () => window.CapacitorCustomPlatform.plugins.CapacitorSQLite
    });
  }
});

// scripts/local-database.js
var local_database_exports = {};
__export(local_database_exports, {
  accountCollection: () => accountCollection,
  deleteRecord: () => deleteRecord,
  getCollection: () => getCollection,
  getLocalCollections: () => getLocalCollections,
  getLocalProfile: () => getLocalProfile,
  initializeLocalDatabase: () => initializeLocalDatabase,
  saveLocalProfile: () => saveLocalProfile,
  saveRecord: () => saveRecord
});
function isNative() {
  return Boolean(Capacitor.isNativePlatform());
}
function validateCollection(collection) {
  const valid = COLLECTIONS.includes(collection) || /^acct_[A-Za-z0-9_-]{1,128}__(events|tasks|moods|habits|goals|reminders|notes|habitLogs|expenses|subscriptions|assets|transactions|syncOutbox|syncIdMap|profileCache)$/.test(collection);
  if (!valid) throw new Error(`Unsupported local collection: ${collection}`);
}
function accountCollection(accountId, collection) {
  if (!COLLECTIONS.includes(collection) || !accountId) throw new Error("Account and valid collection are required.");
  const safeId = String(accountId).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 128);
  if (!safeId) throw new Error("Invalid account identifier.");
  return `acct_${safeId}__${collection}`;
}
function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
function normalizeRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("A record must be an object.");
  }
  const originalId = record.id ?? record._id;
  const id = originalId == null ? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}` : String(originalId);
  return { ...record, id };
}
async function openDatabase() {
  if (!isNative()) {
    throw new Error("Native SQLite is only available on a native device.");
  }
  const consistency = await sqlite.checkConnectionsConsistency();
  const existing = await sqlite.isConnection(DATABASE_NAME, false);
  let db;
  if (existing.result) {
    db = await sqlite.retrieveConnection(DATABASE_NAME, false);
  } else {
    db = await sqlite.createConnection(
      DATABASE_NAME,
      false,
      "no-encryption",
      DATABASE_VERSION,
      false
    );
  }
  const openStatus = await db.isDBOpen();
  if (!openStatus.result) {
    await db.open();
  }
  await db.execute(`
    CREATE TABLE IF NOT EXISTS records (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (collection, id)
    );

    CREATE INDEX IF NOT EXISTS idx_records_collection
    ON records (collection);

    CREATE TABLE IF NOT EXISTS profile (
      profile_key TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
  `);
  return db;
}
async function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}
async function initializeLocalDatabase() {
  if (!isNative()) {
    return { driver: "localStorage", collections: [...COLLECTIONS] };
  }
  await getDatabase();
  return { driver: "sqlite", collections: [...COLLECTIONS] };
}
function getLocalCollections() {
  return [...COLLECTIONS];
}
async function getCollection(collection) {
  validateCollection(collection);
  if (!isNative()) {
    return parseJson(
      localStorage.getItem(`${RECORDS_PREFIX}${collection}`) || "[]",
      []
    );
  }
  const db = await getDatabase();
  const result = await db.query(
    "SELECT payload FROM records WHERE collection = ? ORDER BY updated_at ASC",
    [collection]
  );
  return (result.values || []).map((row) => parseJson(row.payload, null)).filter((record) => record !== null);
}
async function saveRecord(collection, record) {
  validateCollection(collection);
  const normalized = normalizeRecord(record);
  if (!isNative()) {
    const records = await getCollection(collection);
    const index = records.findIndex((item) => String(item.id ?? item._id) === normalized.id);
    if (index >= 0) {
      records[index] = { ...records[index], ...normalized };
    } else {
      records.push(normalized);
    }
    localStorage.setItem(`${RECORDS_PREFIX}${collection}`, JSON.stringify(records));
    return normalized;
  }
  const db = await getDatabase();
  await db.run(
    `INSERT INTO records (collection, id, payload)
     VALUES (?, ?, ?)
     ON CONFLICT(collection, id) DO UPDATE SET
       payload = excluded.payload,
       updated_at = CURRENT_TIMESTAMP`,
    [collection, normalized.id, JSON.stringify(normalized)]
  );
  return normalized;
}
async function deleteRecord(collection, id) {
  validateCollection(collection);
  const recordId = String(id);
  if (!isNative()) {
    const records = await getCollection(collection);
    const remaining = records.filter(
      (item) => String(item.id ?? item._id) !== recordId
    );
    localStorage.setItem(`${RECORDS_PREFIX}${collection}`, JSON.stringify(remaining));
    return;
  }
  const db = await getDatabase();
  await db.run(
    "DELETE FROM records WHERE collection = ? AND id = ?",
    [collection, recordId]
  );
}
async function getLocalProfile() {
  if (!isNative()) {
    return parseJson(localStorage.getItem(PROFILE_KEY) || "null", null);
  }
  const db = await getDatabase();
  const result = await db.query(
    "SELECT payload FROM profile WHERE profile_key = ?",
    ["profile"]
  );
  return result.values?.length ? parseJson(result.values[0].payload, null) : null;
}
async function saveLocalProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("Profile must be an object.");
  }
  if (!isNative()) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  }
  const db = await getDatabase();
  await db.run(
    `INSERT INTO profile (profile_key, payload)
     VALUES (?, ?)
     ON CONFLICT(profile_key) DO UPDATE SET payload = excluded.payload`,
    ["profile", JSON.stringify(profile)]
  );
  return profile;
}
var DATABASE_NAME, DATABASE_VERSION, COLLECTIONS, PROFILE_KEY, RECORDS_PREFIX, sqlite, databasePromise;
var init_local_database = __esm({
  "scripts/local-database.js"() {
    init_dist();
    init_esm();
    DATABASE_NAME = "sahra_local";
    DATABASE_VERSION = 1;
    COLLECTIONS = [
      "events",
      "tasks",
      "moods",
      "habits",
      "goals",
      "reminders",
      "notes",
      "habitLogs",
      "expenses",
      "subscriptions",
      "assets",
      "transactions",
      "syncOutbox",
      "syncIdMap",
      "profileCache"
    ];
    PROFILE_KEY = "sahra.local.profile";
    RECORDS_PREFIX = "sahra.local.records.";
    sqlite = new SQLiteConnection(CapacitorSQLite);
    databasePromise = null;
  }
});

// node_modules/@capgo/capacitor-updater/dist/esm/history.js
var KEEP_FLAG_KEY, HISTORY_STORAGE_KEY, MAX_STACK_ENTRIES, isBrowser;
var init_history = __esm({
  "node_modules/@capgo/capacitor-updater/dist/esm/history.js"() {
    KEEP_FLAG_KEY = "__capgo_keep_url_path_after_reload";
    HISTORY_STORAGE_KEY = "__capgo_history_stack__";
    MAX_STACK_ENTRIES = 100;
    isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && typeof history !== "undefined";
    if (isBrowser) {
      const win = window;
      if (!win.__capgoHistoryPatched) {
        win.__capgoHistoryPatched = true;
        const isFeatureConfigured = () => {
          try {
            if (win.__capgoKeepUrlPathAfterReload) {
              return true;
            }
          } catch (_a) {
          }
          try {
            return window.localStorage.getItem(KEEP_FLAG_KEY) === "1";
          } catch (_b) {
            return false;
          }
        };
        const readStored = () => {
          try {
            const raw = window.sessionStorage.getItem(HISTORY_STORAGE_KEY);
            if (!raw) {
              return { stack: [], index: -1 };
            }
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.stack) || typeof parsed.index !== "number") {
              return { stack: [], index: -1 };
            }
            return parsed;
          } catch (_a) {
            return { stack: [], index: -1 };
          }
        };
        const writeStored = (stack, index) => {
          try {
            window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ stack, index }));
          } catch (_a) {
          }
        };
        const clearStored = () => {
          try {
            window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
          } catch (_a) {
          }
        };
        const normalize = (url) => {
          try {
            const base = url !== null && url !== void 0 ? url : window.location.href;
            const parsed = new URL(base instanceof URL ? base.toString() : base, window.location.href);
            return `${parsed.pathname}${parsed.search}${parsed.hash}`;
          } catch (_a) {
            return null;
          }
        };
        const trimStack = (stack, index) => {
          if (stack.length <= MAX_STACK_ENTRIES) {
            return { stack, index };
          }
          const start = stack.length - MAX_STACK_ENTRIES;
          const trimmed = stack.slice(start);
          const adjustedIndex = Math.max(0, index - start);
          return { stack: trimmed, index: adjustedIndex };
        };
        const runWhenReady = (fn) => {
          if (document.readyState === "complete" || document.readyState === "interactive") {
            fn();
          } else {
            window.addEventListener("DOMContentLoaded", fn, { once: true });
          }
        };
        let featureActive = false;
        let isRestoring = false;
        let restoreScheduled = false;
        const ensureCurrentTracked = () => {
          if (!featureActive) {
            return;
          }
          const stored = readStored();
          const current = normalize();
          if (!current) {
            return;
          }
          if (stored.stack.length === 0) {
            stored.stack.push(current);
            stored.index = 0;
            writeStored(stored.stack, stored.index);
            return;
          }
          if (stored.index < 0 || stored.index >= stored.stack.length) {
            stored.index = stored.stack.length - 1;
          }
          if (stored.stack[stored.index] !== current) {
            stored.stack[stored.index] = current;
            writeStored(stored.stack, stored.index);
          }
        };
        const record = (url, replace) => {
          if (!featureActive || isRestoring) {
            return;
          }
          const normalized = normalize(url);
          if (!normalized) {
            return;
          }
          let { stack, index } = readStored();
          if (stack.length === 0) {
            stack.push(normalized);
            index = stack.length - 1;
          } else if (replace) {
            if (index < 0 || index >= stack.length) {
              index = stack.length - 1;
            }
            stack[index] = normalized;
          } else {
            if (index >= stack.length - 1) {
              stack.push(normalized);
              index = stack.length - 1;
            } else {
              stack = stack.slice(0, index + 1);
              stack.push(normalized);
              index = stack.length - 1;
            }
          }
          ({ stack, index } = trimStack(stack, index));
          writeStored(stack, index);
        };
        const restoreHistory = () => {
          if (!featureActive || isRestoring) {
            return;
          }
          const stored = readStored();
          if (stored.stack.length === 0) {
            ensureCurrentTracked();
            return;
          }
          const targetIndex = stored.index >= 0 && stored.index < stored.stack.length ? stored.index : stored.stack.length - 1;
          const normalizedCurrent = normalize();
          if (stored.stack.length === 1 && normalizedCurrent === stored.stack[0]) {
            return;
          }
          const firstEntry = stored.stack[0];
          if (!firstEntry) {
            return;
          }
          isRestoring = true;
          try {
            history.replaceState(history.state, document.title, firstEntry);
            for (let i = 1; i < stored.stack.length; i += 1) {
              history.pushState(history.state, document.title, stored.stack[i]);
            }
          } catch (_a) {
            isRestoring = false;
            return;
          }
          isRestoring = false;
          const currentIndex = stored.stack.length - 1;
          const offset = targetIndex - currentIndex;
          if (offset !== 0) {
            history.go(offset);
          } else {
            history.replaceState(history.state, document.title, stored.stack[targetIndex]);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }
        };
        const scheduleRestore = () => {
          if (!featureActive || restoreScheduled) {
            return;
          }
          restoreScheduled = true;
          runWhenReady(() => {
            restoreScheduled = false;
            restoreHistory();
          });
        };
        let originalPushState = null;
        let originalReplaceState = null;
        const popstateHandler = () => {
          if (!featureActive || isRestoring) {
            return;
          }
          const normalized = normalize();
          if (!normalized) {
            return;
          }
          const stored = readStored();
          const idx = stored.stack.lastIndexOf(normalized);
          if (idx >= 0) {
            stored.index = idx;
          } else {
            stored.stack.push(normalized);
            stored.index = stored.stack.length - 1;
          }
          const trimmed = trimStack(stored.stack, stored.index);
          writeStored(trimmed.stack, trimmed.index);
        };
        const patchHistory = () => {
          if (originalPushState && originalReplaceState) {
            return;
          }
          originalPushState = history.pushState;
          originalReplaceState = history.replaceState;
          history.pushState = function pushStatePatched(state2, title, url) {
            const result = originalPushState === null || originalPushState === void 0 ? void 0 : originalPushState.call(history, state2, title, url);
            record(url, false);
            return result;
          };
          history.replaceState = function replaceStatePatched(state2, title, url) {
            const result = originalReplaceState === null || originalReplaceState === void 0 ? void 0 : originalReplaceState.call(history, state2, title, url);
            record(url, true);
            return result;
          };
          window.addEventListener("popstate", popstateHandler);
        };
        const unpatchHistory = () => {
          if (originalPushState) {
            history.pushState = originalPushState;
            originalPushState = null;
          }
          if (originalReplaceState) {
            history.replaceState = originalReplaceState;
            originalReplaceState = null;
          }
          window.removeEventListener("popstate", popstateHandler);
        };
        const setFeatureActive = (enabled) => {
          if (featureActive === enabled) {
            if (featureActive) {
              ensureCurrentTracked();
              scheduleRestore();
            }
            return;
          }
          featureActive = enabled;
          if (featureActive) {
            patchHistory();
            ensureCurrentTracked();
            scheduleRestore();
          } else {
            unpatchHistory();
            clearStored();
          }
        };
        window.addEventListener("CapacitorUpdaterKeepUrlPathAfterReload", (event) => {
          var _a;
          const evt = event;
          const enabled = (_a = evt === null || evt === void 0 ? void 0 : evt.detail) === null || _a === void 0 ? void 0 : _a.enabled;
          if (typeof enabled === "boolean") {
            win.__capgoKeepUrlPathAfterReload = enabled;
            setFeatureActive(enabled);
          } else {
            win.__capgoKeepUrlPathAfterReload = true;
            setFeatureActive(true);
          }
        });
        setFeatureActive(isFeatureConfigured());
      }
    }
  }
});

// node_modules/@capgo/capacitor-updater/dist/esm/definitions.js
var AppUpdateAvailability, FlexibleUpdateInstallStatus, AppUpdateResultCode;
var init_definitions2 = __esm({
  "node_modules/@capgo/capacitor-updater/dist/esm/definitions.js"() {
    (function(AppUpdateAvailability2) {
      AppUpdateAvailability2[AppUpdateAvailability2["UNKNOWN"] = 0] = "UNKNOWN";
      AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_NOT_AVAILABLE"] = 1] = "UPDATE_NOT_AVAILABLE";
      AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_AVAILABLE"] = 2] = "UPDATE_AVAILABLE";
      AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_IN_PROGRESS"] = 3] = "UPDATE_IN_PROGRESS";
    })(AppUpdateAvailability || (AppUpdateAvailability = {}));
    (function(FlexibleUpdateInstallStatus2) {
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["UNKNOWN"] = 0] = "UNKNOWN";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["PENDING"] = 1] = "PENDING";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["DOWNLOADING"] = 2] = "DOWNLOADING";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["INSTALLING"] = 3] = "INSTALLING";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["INSTALLED"] = 4] = "INSTALLED";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["FAILED"] = 5] = "FAILED";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["CANCELED"] = 6] = "CANCELED";
      FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["DOWNLOADED"] = 11] = "DOWNLOADED";
    })(FlexibleUpdateInstallStatus || (FlexibleUpdateInstallStatus = {}));
    (function(AppUpdateResultCode2) {
      AppUpdateResultCode2[AppUpdateResultCode2["OK"] = 0] = "OK";
      AppUpdateResultCode2[AppUpdateResultCode2["CANCELED"] = 1] = "CANCELED";
      AppUpdateResultCode2[AppUpdateResultCode2["FAILED"] = 2] = "FAILED";
      AppUpdateResultCode2[AppUpdateResultCode2["NOT_AVAILABLE"] = 3] = "NOT_AVAILABLE";
      AppUpdateResultCode2[AppUpdateResultCode2["NOT_ALLOWED"] = 4] = "NOT_ALLOWED";
      AppUpdateResultCode2[AppUpdateResultCode2["INFO_MISSING"] = 5] = "INFO_MISSING";
    })(AppUpdateResultCode || (AppUpdateResultCode = {}));
  }
});

// node_modules/@capgo/capacitor-updater/dist/esm/web.js
var web_exports2 = {};
__export(web_exports2, {
  CapacitorUpdaterWeb: () => CapacitorUpdaterWeb
});
var BUNDLE_BUILTIN, CapacitorUpdaterWeb;
var init_web2 = __esm({
  "node_modules/@capgo/capacitor-updater/dist/esm/web.js"() {
    init_dist();
    init_definitions2();
    BUNDLE_BUILTIN = {
      status: "success",
      version: "",
      downloaded: "1970-01-01T00:00:00.000Z",
      id: "builtin",
      checksum: ""
    };
    CapacitorUpdaterWeb = class extends WebPlugin {
      async setStatsUrl(options) {
        console.warn("Cannot setStatsUrl in web", options);
        return;
      }
      async setUpdateUrl(options) {
        console.warn("Cannot setUpdateUrl in web", options);
        return;
      }
      async setChannelUrl(options) {
        console.warn("Cannot setChannelUrl in web", options);
        return;
      }
      async download(options) {
        console.warn("Cannot download version in web", options);
        return BUNDLE_BUILTIN;
      }
      async next(options) {
        console.warn("Cannot set next version in web", options);
        return BUNDLE_BUILTIN;
      }
      async isAutoUpdateEnabled() {
        console.warn("Cannot get isAutoUpdateEnabled in web");
        return { enabled: false };
      }
      async set(options) {
        console.warn("Cannot set active bundle in web", options);
        return;
      }
      async startPreviewSession(options) {
        console.warn("Cannot start preview session in web", options);
        return;
      }
      async listPreviews() {
        console.warn("Cannot list previews in web");
        return { previews: [], currentBundle: BUNDLE_BUILTIN };
      }
      async setPreview(options) {
        console.warn("Cannot set preview in web", options);
        return;
      }
      async resetPreview() {
        console.warn("Cannot reset preview in web");
        return;
      }
      async deletePreview(options) {
        console.warn("Cannot delete preview in web", options);
        return { removed: false, deleted: false };
      }
      async checkPreviewUpdate(options) {
        console.warn("Cannot check preview update in web", options);
        throw this.unimplemented("Preview updates are not available on web platform");
      }
      async updatePreview(options) {
        console.warn("Cannot update preview in web", options);
        throw this.unimplemented("Preview updates are not available on web platform");
      }
      async getDeviceId() {
        console.warn("Cannot get ID in web");
        return { deviceId: "default" };
      }
      async getBuiltinVersion() {
        console.warn("Cannot get version in web");
        return { version: "default" };
      }
      async getPluginVersion() {
        console.warn("Cannot get plugin version in web");
        return { version: "default" };
      }
      async delete(options) {
        console.warn("Cannot delete bundle in web", options);
      }
      async setBundleError(options) {
        console.warn("Cannot setBundleError in web", options);
        return BUNDLE_BUILTIN;
      }
      async list() {
        console.warn("Cannot list bundles in web");
        return { bundles: [] };
      }
      async reset(options) {
        console.warn("Cannot reset version in web", options);
      }
      async current() {
        console.warn("Cannot get current bundle in web");
        return { bundle: BUNDLE_BUILTIN, native: "0.0.0" };
      }
      async reload() {
        console.warn("Cannot reload current bundle in web");
        return;
      }
      async getLatest() {
        console.warn("Cannot getLatest current bundle in web");
        return {
          version: "0.0.0",
          message: "Cannot getLatest current bundle in web"
        };
      }
      async triggerUpdateCheck() {
        console.warn("Cannot triggerUpdateCheck in web");
        return { status: "unavailable", queued: false };
      }
      async getMissingBundleFiles(options) {
        var _a, _b, _c;
        console.warn("Cannot inspect missing bundle files in web", { manifestLength: (_b = (_a = options.manifest) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0 });
        const missing = (_c = options.manifest) !== null && _c !== void 0 ? _c : [];
        return {
          missing,
          total: missing.length,
          missingCount: missing.length,
          reusableCount: 0
        };
      }
      async getBundleDownloadSize(options) {
        var _a, _b, _c, _d, _e;
        console.warn("Cannot estimate bundle download size in web", { manifestLength: (_b = (_a = options.manifest) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0 });
        return {
          totalSize: 0,
          knownFiles: 0,
          unknownFiles: (_d = (_c = options.manifest) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0,
          files: ((_e = options.manifest) !== null && _e !== void 0 ? _e : []).map((entry) => ({
            file_name: entry.file_name,
            file_hash: entry.file_hash,
            download_url: entry.download_url,
            error: "unavailable"
          }))
        };
      }
      async setChannel(options) {
        console.warn("Cannot setChannel in web", options);
        return {
          status: "error",
          error: "Cannot setChannel in web"
        };
      }
      async unsetChannel(options) {
        console.warn("Cannot unsetChannel in web", options);
        return;
      }
      async setCustomId(options) {
        console.warn("Cannot setCustomId in web", options);
        return;
      }
      async getChannel() {
        console.warn("Cannot getChannel in web");
        return {
          status: "error",
          error: "Cannot getChannel in web"
        };
      }
      async listChannels() {
        console.warn("Cannot listChannels in web");
        throw {
          message: "Cannot listChannels in web",
          error: "platform_not_supported"
        };
      }
      async notifyAppReady() {
        return { bundle: BUNDLE_BUILTIN };
      }
      async setMultiDelay(options) {
        console.warn("Cannot setMultiDelay in web", options === null || options === void 0 ? void 0 : options.delayConditions);
        return;
      }
      async cancelDelay() {
        console.warn("Cannot cancelDelay in web");
        return;
      }
      async isAutoUpdateAvailable() {
        console.warn("Cannot isAutoUpdateAvailable in web");
        return { available: false };
      }
      async getCurrentBundle() {
        console.warn("Cannot get current bundle in web");
        return BUNDLE_BUILTIN;
      }
      async getNextBundle() {
        return Promise.resolve(null);
      }
      async getFailedUpdate() {
        console.warn("Cannot getFailedUpdate in web");
        return null;
      }
      async setShakeMenu(_options) {
        throw this.unimplemented("Shake menu not available on web platform");
      }
      async isShakeMenuEnabled() {
        return Promise.resolve({ enabled: false, gesture: "shake" });
      }
      async setShakeChannelSelector(_options) {
        throw this.unimplemented("Shake channel selector not available on web platform");
      }
      async isShakeChannelSelectorEnabled() {
        return Promise.resolve({ enabled: false });
      }
      async getAppId() {
        console.warn("Cannot getAppId in web");
        return { appId: "default" };
      }
      async setAppId(options) {
        console.warn("Cannot setAppId in web", options);
        return;
      }
      // ============================================================================
      // App Store / Play Store Update Methods (Web stubs)
      // ============================================================================
      async getAppUpdateInfo(_options) {
        console.warn("getAppUpdateInfo is not available on web platform");
        return {
          currentVersionName: "0.0.0",
          currentVersionCode: "0",
          updateAvailability: AppUpdateAvailability.UNKNOWN
        };
      }
      async openAppStore(_options) {
        throw this.unimplemented("openAppStore is not available on web platform");
      }
      async performImmediateUpdate() {
        throw this.unimplemented("performImmediateUpdate is only available on Android");
      }
      async startFlexibleUpdate() {
        throw this.unimplemented("startFlexibleUpdate is only available on Android");
      }
      async completeFlexibleUpdate() {
        throw this.unimplemented("completeFlexibleUpdate is only available on Android");
      }
    };
  }
});

// node_modules/@capgo/capacitor-updater/dist/esm/index.js
var CapacitorUpdater;
var init_esm2 = __esm({
  "node_modules/@capgo/capacitor-updater/dist/esm/index.js"() {
    init_dist();
    init_history();
    init_definitions2();
    CapacitorUpdater = registerPlugin("CapacitorUpdater", {
      web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.CapacitorUpdaterWeb())
    });
  }
});

// scripts/mobile-ota.js
var mobile_ota_exports = {};
__export(mobile_ota_exports, {
  markSahraOtaReady: () => markSahraOtaReady
});
async function markSahraOtaReady() {
  if (readyNotified || !window.Capacitor?.isNativePlatform()) return;
  readyNotified = true;
  try {
    await CapacitorUpdater.notifyAppReady();
    console.info("Sahra OTA: app marked ready.");
  } catch (error) {
    readyNotified = false;
    console.error("Sahra OTA: readiness notification failed.", error);
  }
}
var readyNotified;
var init_mobile_ota = __esm({
  "scripts/mobile-ota.js"() {
    init_esm2();
    readyNotified = false;
  }
});

// pages/calendar.js
function formatDateKey(date) {
  const normalized = new Date(
    date.getTime() - date.getTimezoneOffset() * 6e4
  );
  return normalized.toISOString().slice(0, 10);
}
function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function formatTime(value) {
  if (!value) return "Not set";
  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return escapeHtml(value);
  }
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
}
function formatDetailDate(dateString) {
  if (!dateString) return "Not set";
  const date = /* @__PURE__ */ new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return escapeHtml(dateString);
  }
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
function renderDeleteIcon() {
  return `
    <svg
      class="calendar-trash-icon"
      viewBox="0 0 24 24"
      width="15"
      height="15"
      aria-hidden="true"
    >
      <path
        d="M6 7h12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <path
        d="M9 7V5.5C9 4.67 9.67 4 10.5 4h3c.83 0 1.5.67 1.5 1.5V7"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <path
        d="M8 7.5l.7 11c.05.84.75 1.5 1.59 1.5h3.42c.84 0 1.54-.66 1.59-1.5l.7-11"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />

      <path
        d="M10.5 10.5v6M13.5 10.5v6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  `;
}
function renderCalendarDetailModal(state2) {
  const detail = state2.calendarDetail;
  if (!detail) {
    return "";
  }
  const item = detail.item || {};
  const type = detail.type || "task";
  const isEvent = type === "event";
  const title = item.title || "Untitled";
  const date = formatDetailDate(item.date);
  const description = item.description ? escapeHtml(item.description) : "No description";
  const category = item.category ? escapeHtml(item.category) : "General";
  const status = isEvent ? "Scheduled" : item.status || (item.completed ? "Completed" : "Pending");
  const statusClass = String(status).toLowerCase().replace(/\s+/g, "-");
  return `
    <div
      class="calendar-detail-backdrop"
      data-action="close-calendar-detail"
    >

      <div
        class="calendar-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-detail-title"
        data-calendar-detail-content
      >

        <div class="calendar-detail-header">

          <div class="calendar-detail-type">
            <span class="calendar-detail-type-icon">
              ${isEvent ? "\u{1F4C5}" : "\u2705"}
            </span>

            <span>
              ${isEvent ? "Event" : "Task"}
            </span>
          </div>

          <button
            class="calendar-detail-close"
            type="button"
            data-action="close-calendar-detail"
            aria-label="Close"
          >
            \u2715
          </button>

        </div>


        <div class="calendar-detail-body">

          <h3 id="calendar-detail-title">
            ${escapeHtml(title)}
          </h3>


          <div class="calendar-detail-info">

            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                \u{1F4C5}
              </span>

              <div>
                <small>Date</small>
                <strong>${date}</strong>
              </div>

            </div>


            ${isEvent ? `
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      \u{1F550}
                    </span>

                    <div>
                      <small>Time</small>

                      <strong>
                        ${formatTime(item.startTime)}
                        ${item.endTime ? ` - ${formatTime(item.endTime)}` : ""}
                      </strong>

                    </div>

                  </div>
                ` : `
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      \u{1F550}
                    </span>

                    <div>
                      <small>Time</small>
                      <strong>
                        ${item.time ? formatTime(item.time) : "No time set"}
                      </strong>
                    </div>

                  </div>
                `}


            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                \u{1F3F7}\uFE0F
              </span>

              <div>
                <small>Category</small>
                <strong>${category}</strong>
              </div>

            </div>


            ${!isEvent ? `
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      \u{1F4CC}
                    </span>

                    <div>
                      <small>Priority</small>
                      <strong>
                        ${escapeHtml(item.priority || "Normal")}
                      </strong>
                    </div>

                  </div>
                ` : ""}


            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                ${isEvent ? "\u{1F4CD}" : "\u{1F535}"}
              </span>

              <div>

                <small>Status</small>

                <strong>
                  <span class="calendar-status-badge ${statusClass}">
                    ${escapeHtml(status)}
                  </span>
                </strong>

              </div>

            </div>

          </div>


          <div class="calendar-detail-description">

            <h4>Description</h4>

            <p>
              ${description}
            </p>

          </div>

        </div>


        <div class="calendar-detail-footer">

          <button
            class="calendar-detail-delete"
            type="button"
            data-action="${isEvent ? "delete-calendar-event" : "delete-calendar-task"}"
            data-${isEvent ? "event-id" : "task-id"}="${escapeHtml(item.id || item._id || "")}"
          >
            ${renderDeleteIcon()}
            Delete ${isEvent ? "Event" : "Task"}
          </button>


          <button
            class="calendar-detail-close-btn"
            type="button"
            data-action="close-calendar-detail"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  `;
}
function renderCalendarPage(state2) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const monthName = `
    ${monthNames[state2.currentMonth]}
    ${state2.currentYear}
  `;
  const selectedDate = /* @__PURE__ */ new Date(
    `${state2.selectedDate}T00:00:00`
  );
  const firstDayOfMonth = new Date(
    state2.currentYear,
    state2.currentMonth,
    1
  );
  const weekdayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = new Date(
    state2.currentYear,
    state2.currentMonth + 1,
    0
  ).getDate();
  const prevMonthDays = new Date(
    state2.currentYear,
    state2.currentMonth,
    0
  ).getDate();
  const moodMap = {
    "\u{1F60A}": "\u{1F60A}",
    "\u{1F610}": "\u{1F610}",
    "\u{1F622}": "\u{1F622}",
    "\u{1F621}": "\u{1F621}",
    "\u{1F634}": "\u{1F634}",
    "\u{1F525}": "\u{1F525}",
    "\u{1F60D}": "\u{1F60D}"
  };
  const moodOptions = [
    "\u{1F60A}",
    "\u{1F610}",
    "\u{1F622}",
    "\u{1F621}",
    "\u{1F634}",
    "\u{1F525}",
    "\u{1F60D}"
  ];
  const moodByDate = {};
  state2.data.moods.forEach((entry) => {
    moodByDate[entry.date] = entry.mood;
  });
  const eventsForSelectedDay = state2.data.events.filter(
    (event) => event.date === state2.selectedDate
  );
  const tasksForSelectedDay = state2.data.tasks.filter(
    (task) => task.date === state2.selectedDate
  );
  const mood = state2.data.moods.find(
    (entry) => entry.date === state2.selectedDate
  )?.mood || "\u{1F60A}";
  const days = [];
  for (let i = 0; i < weekdayOffset; i += 1) {
    days.push({
      blank: true,
      value: prevMonthDays - weekdayOffset + i + 1
    });
  }
  for (let day = 1; day <= totalDays; day += 1) {
    const dateValue = new Date(
      state2.currentYear,
      state2.currentMonth,
      day
    );
    const iso = formatDateKey(dateValue);
    days.push({
      blank: false,
      value: day,
      iso,
      mood: moodByDate[iso] || ""
    });
  }
  while (days.length % 7 !== 0) {
    days.push({
      blank: true,
      value: days.length - totalDays - weekdayOffset + 1
    });
  }
  const weekdays = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ];
  return `

    <section class="screen calendar-screen">


      <!-- HEADER -->

      <div
        class="page-header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >

        <div
          style="
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >

          <button
            class="back-button"
            type="button"
            data-action="back-home"
          >
            \u2190 Back
          </button>

          <h2>Calendar</h2>

        </div>


        <button
          class="ghost-btn"
          type="button"
          data-action="today"
        >
          Today
        </button>

      </div>



      <!-- MONTH CALENDAR -->

      <div class="glass-card layout-card">

        <div class="card-header">

          <h3>
            ${monthName}
          </h3>


          <div class="action-row">

            <button
              class="small-btn"
              type="button"
              data-action="prev-month"
              aria-label="Previous month"
            >
              \u25C0
            </button>


            <button
              class="small-btn"
              type="button"
              data-action="next-month"
              aria-label="Next month"
            >
              \u25B6
            </button>

          </div>

        </div>


        <div class="calendar-grid">

          ${weekdays.map(
    (day) => `
                <div class="calendar-weekday">
                  ${day}
                </div>
              `
  ).join("")}


          ${days.map((day) => {
    const iso = day.iso || "";
    const isSelected = iso === state2.selectedDate;
    const matchingEvents = iso ? state2.data.events.filter(
      (event) => event.date === iso
    ) : [];
    const matchingTasks = iso ? state2.data.tasks.filter(
      (task) => task.date === iso
    ) : [];
    const matchingMood = iso ? state2.data.moods.find(
      (entry) => entry.date === iso
    )?.mood : null;
    const indicators = [];
    if (matchingEvents.length) {
      indicators.push(
        '<span class="mini-indicator event"></span>'
      );
    }
    if (matchingTasks.length) {
      indicators.push(
        '<span class="mini-indicator task"></span>'
      );
    }
    if (matchingMood) {
      indicators.push(
        '<span class="mini-indicator mood"></span>'
      );
    }
    return `

                <button

                  class="
                    calendar-day
                    ${day.blank ? "dim" : ""}
                    ${isSelected ? "selected" : ""}
                  "

                  type="button"

                  data-date="${iso}"

                  ${day.blank ? "disabled" : ""}

                >

                  <span>
                    ${day.value}
                  </span>


                  ${indicators.length ? `
                        <span class="calendar-indicators">
                          ${indicators.join("")}
                        </span>
                      ` : ""}

                </button>

              `;
  }).join("")}

        </div>

      </div>



      <!-- SELECTED DAY -->

      <div class="glass-card layout-card">

        <div class="card-header">

          <h3>

            ${selectedDate.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  )}

          </h3>


          <div class="mood-selector-wrap">

            <button
              class="mood-selector-toggle"
              type="button"
              data-action="toggle-mood-picker"
              aria-label="Select mood"
            >
              ${moodMap[mood] || mood}
            </button>


            ${state2.moodPickerOpen ? `

                  <div class="mood-selector-panel">

                    ${moodOptions.map(
    (emoji) => `

                          <button
                            type="button"
                            class="
                              mood-picker-emoji
                              ${mood === emoji ? "selected" : ""}
                            "
                            data-mood-value="${emoji}"
                            aria-label="Choose mood ${emoji}"
                          >
                            ${emoji}
                          </button>

                        `
  ).join("")}

                  </div>

                ` : ""}

          </div>

        </div>



        <!-- EVENTS -->

        <div class="life-card-section">

          <h4>
            \u{1F4C5} Events
          </h4>


          ${eventsForSelectedDay.length ? eventsForSelectedDay.map((event) => {
    const eventId = event.id || event._id;
    return `

                      <div
                        class="calendar-entry-row event-row"
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-event"
                        data-event-id="${escapeHtml(eventId || "")}"
                      >

                        <span class="calendar-entry-time">
                          ${formatTime(event.startTime)}
                        </span>


                        <strong class="calendar-entry-title">
                          ${escapeHtml(event.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-event"
                          data-event-id="${escapeHtml(eventId || "")}"
                          aria-label="Delete event"
                          title="Delete event"
                        >
                          ${renderDeleteIcon()}
                        </button>

                      </div>

                    `;
  }).join("") : `
                <p class="mini-empty">
                  No events
                </p>
              `}

        </div>



        <!-- TASKS -->

        <div class="life-card-section">

          <h4>
            \u2705 Tasks
          </h4>


          ${tasksForSelectedDay.length ? tasksForSelectedDay.map((task) => {
    const taskId = task.id || task._id;
    const completed = task.completed || task.status === "Completed";
    return `

                      <div
                        class="
                          calendar-entry-row
                          task-row
                          ${completed ? "completed-row" : ""}
                        "
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-task"
                        data-task-id="${escapeHtml(taskId || "")}"
                      >

                        <span class="calendar-entry-time">
                          ${escapeHtml(
      task.status || (completed ? "Completed" : "Pending")
    )}
                        </span>


                        <strong class="calendar-entry-title">
                          ${escapeHtml(task.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-task"
                          data-task-id="${escapeHtml(taskId || "")}"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          ${renderDeleteIcon()}
                        </button>

                      </div>

                    `;
  }).join("") : `
                <p class="mini-empty">
                  No tasks
                </p>
              `}

        </div>

      </div>


      <!-- DETAIL POPUP -->

      ${renderCalendarDetailModal(state2)}

    </section>

  `;
}

// pages/mood.js
function renderMoodPage(state2) {
  const moods = ["\u{1F60A}", "\u{1F610}", "\u{1F622}", "\u{1F621}", "\u{1F634}", "\u{1F525}", "\u{1F60D}"];
  const counts = moods.reduce((acc, mood) => {
    acc[mood] = state2.data.moods.filter((entry) => entry.mood === mood).length;
    return acc;
  }, {});
  return `
    <section class="screen">
      <div class="page-header">
        <button class="back-button" type="button" data-action="back-home">\u2190 Back</button>
        <h2>Mood</h2>
        <button class="ghost-btn" type="button" data-create="mood">+ Add</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>How are you feeling?</h3>
        </div>
        <div class="mood-row">
          ${moods.map((mood) => `
            <button class="mood-pill ${mood === "\u{1F60A}" ? "selected" : ""}" type="button">${mood}</button>
          `).join("")}
        </div>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Monthly mood</h3>
        </div>
        <div class="list">
          ${moods.map((mood) => `
            <div class="list-item">
              <span class="dot"></span>
              <div>
                <strong>${mood} ${mood === "\u{1F525}" ? "Motivated" : mood === "\u{1F60A}" ? "Happy" : mood === "\u{1F610}" ? "Normal" : mood === "\u{1F634}" ? "Tired" : mood === "\u{1F622}" ? "Sad" : mood === "\u{1F621}" ? "Angry" : "Excited"}</strong>
                <small>${counts[mood] || 0} days</small>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

// pages/tasks.js
function renderTasksPage(state2) {
  const tasks = state2.data.tasks || [];
  const activeFilter = state2.todoFilter || "All";
  const todayIso = new Date((/* @__PURE__ */ new Date()).getTime() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const normalizedTasks = tasks.map((task) => ({
    ...task,
    id: task.id || task._id,
    status: task.status || (task.completed ? "Completed" : "Pending"),
    priority: task.priority || "Normal",
    title: task.title || "Untitled task",
    date: task.date || todayIso,
    time: task.time || null
  }));
  const filteredTasks = normalizedTasks.filter((task) => {
    const isCompleted = task.status === "Completed" || task.completed;
    if (activeFilter === "Pending") return !isCompleted;
    if (activeFilter === "Completed") return isCompleted;
    if (activeFilter === "Today") return task.date === todayIso;
    return true;
  });
  const filters = ["All", "Pending", "Completed", "Today"];
  const taskRows = filteredTasks.length ? filteredTasks.map((task) => {
    const isCompleted = task.status === "Completed" || task.completed;
    const priorityClass = (task.priority || "Normal").toLowerCase();
    const taskDate = task.date ? (/* @__PURE__ */ new Date(`${task.date}T00:00:00`)).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) : "No date";
    const taskTime = task.time ? (/* @__PURE__ */ new Date(`2000-01-01T${task.time}`)).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "All day";
    return `
          <div class="todo-item ${isCompleted ? "completed" : ""}">
            <button class="todo-check ${isCompleted ? "checked" : ""}" type="button" data-action="toggle-task" data-task-id="${task.id}">${isCompleted ? "\u2713" : ""}</button>

            <div class="todo-content">
              <div class="todo-title-row">
                <h4 class="${isCompleted ? "done" : ""}">${task.title}</h4>
                <div class="todo-actions">
                  <button class="icon-btn" type="button" data-action="edit-task" data-task-id="${task.id}" aria-label="Edit task">\u270E</button>
                  <button class="icon-btn" type="button" data-action="delete-task" data-task-id="${task.id}" aria-label="Delete task">\u{1F5D1}</button>
                </div>
              </div>

              <div class="todo-meta">
                <span>\u{1F4C5} ${taskDate}</span>
                <span>\u2022</span>
                <span>${taskTime}</span>
              </div>

              <div class="priority-badge ${priorityClass}">${task.priority || "Normal"}</div>
            </div>
          </div>
        `;
  }).join("") : '<div class="todo-item"><div class="todo-content"><div class="todo-title-row"><h4>No tasks yet.</h4></div></div></div>';
  return `
   

    <section class="screen todo-screen">
      <header class="todo-header todo-page-header page-fixed-header">
        <div class="todo-heading">
          <div class="todo-icon">\u2611\uFE0F</div>
          <div>
            <h2>To Do List</h2>
            <p>Plan today, build your tomorrow</p>
          </div>
        </div>

      </header>

      <main class="todo-page-content">
      <div class="filter-row">
        ${filters.map((filter) => {
    const label = filter === "All" ? "All" : filter === "Pending" ? "Pending" : filter === "Completed" ? "Completed" : "Today";
    const active = activeFilter === filter ? "active" : "";
    const icon = filter === "All" ? "\u{1F4CB}" : filter === "Pending" ? "\u25EF" : filter === "Completed" ? "\u2713" : "\u{1F5D3}\uFE0F";
    return `<button class="filter-btn ${active}" type="button" data-task-filter="${filter}">${icon} ${label}</button>`;
  }).join("")}
      </div>

      <div class="task-create-action">
        <button class="task-create-button" type="button" data-action="open-add-entry" data-type="task" aria-label="Add new task">+</button>
      </div>

      <div class="todo-list">
        ${taskRows}
      </div>

      <div class="motivation-card">
        <div class="sparkle">\u2726</div>
        <div>
          <h3>Small steps, big progress!</h3>
          <p>Keep going, you're doing great.</p>
        </div>
      </div>
      </main>
    </section>
  `;
}

// pages/habits.js
function renderHabitsPage(state2) {
  return `
    <section class="screen">
      <div class="page-header">
        <button class="back-button" type="button" data-action="back-home">\u2190 Back</button>
        <h2>Habits</h2>
        <button class="ghost-btn" type="button" data-create="habit">+ Add</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Today's habits</h3>
        </div>
        <div class="progress-block">
          ${state2.data.habits.map((habit) => {
    const percent = Math.min(100, habit.progress / habit.goal * 100);
    return `
              <div class="progress-row">
                <div class="progress-label">
                  <span>${habit.name}</span>
                  <strong>${habit.progress}/${habit.goal}</strong>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${percent}%"></div>
                </div>
              </div>
            `;
  }).join("")}
        </div>
      </div>
    </section>
  `;
}

// pages/goals.js
function renderGoalsPage(state2) {
  return `
    <section class="screen">
      <div class="page-header">
        <button class="back-button" type="button" data-action="back-home">\u2190 Back</button>
        <h2>Goals</h2>
        <button class="ghost-btn" type="button" data-create="goal">+ Add</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Personal growth</h3>
        </div>
        <div class="progress-block">
          ${state2.data.goals.map((goal) => `
            <div class="progress-row">
              <div class="progress-label">
                <span>${goal.title}</span>
                <strong>${goal.progress}%</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${goal.progress}%"></div>
              </div>
              <small style="color: var(--muted);">${goal.current} / ${goal.target} days</small>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

// pages/assistant.js
function escapeHtml2(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderAssistantPage(state2 = {}) {
  const messages = Array.isArray(state2.assistantMessages) && state2.assistantMessages.length ? state2.assistantMessages : [
    { role: "assistant", text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." }
  ];
  const disabled = state2.assistantLoading ? "disabled" : "";
  const userInitial = String(state2.user?.name || "Sahra").match(/[A-Za-z]/)?.[0]?.toUpperCase() || "S";
  return `
    <section class="screen assistant-screen">
      <header class="assistant-header glass-card page-fixed-header">
        <div class="assistant-header-row">
          
          <div class="assistant-brand">
            <div class="assistant-mark"><img class="sahra-logo" src="/images/sahra.png" alt="Sahra logo" width="48" height="48" /></div>
            <div class="assistant-title">
              <h1>Sahra</h1>
              <span>AI ASSISTANT:</span>
            </div>
          </div>
          <button class="assistant-clear-btn" type="button" data-action="clear-assistant-chat" aria-label="Clear chat">\u{1F5D1} Clear</button>
        </div>
      </header>

      <div class="assistant-chat">
        ${messages.map((message) => {
    const isUser = message.role === "user";
    return `
            <div class="chat-row ${isUser ? "user-row" : "assistant-row"}">
              ${!isUser ? '<div class="chat-avatar bot-avatar">\u{1F916}</div>' : ""}
              <div class="message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}">${escapeHtml2(message.text)}</div>
              ${isUser ? `<div class="chat-avatar user-avatar" aria-label="Your profile">${userInitial}</div>` : ""}
            </div>
            ${!isUser && message.retryRequestId ? `<div class="chat-row assistant-row"><div class="chat-avatar bot-avatar">\u{1F916}</div><button class="link-btn" type="button" data-assistant-retry="${escapeHtml2(message.retryRequestId)}" data-retry-message="${escapeHtml2(message.retryMessage || "")}" ${disabled}>Retry request</button></div>` : ""}
          `;
  }).join("")}

        ${state2.assistantLoading ? '<div class="message-time">Sahra is thinking...</div>' : ""}
      </div>

      <div class="assistant-composer assistant-fixed-composer">
        <!-- Replace your old mic emoji/icon with this -->
    <button type="button" data-action="toggle-mic" style="background: transparent; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;">
    <img src="mic.png" alt="Mic" class="mic-icon" id="chat-mic-img" style="width: 45px; height: 45px; object-fit: contain;">
    </button>
        <input class="assistant-input" type="text" placeholder="Type a message or speak..." aria-label="Type a message" ${disabled} />
        <button class="composer-send" type="button" aria-label="Send message" ${disabled}>\u27A4</button>
      </div>
    </section>
  `;
}

// pages/notepad.js
function escapeHtml3(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderVaultPage(state2) {
  const notes = state2?.data?.assets && state2.data.assets.length > 0 ? state2.data.assets : state2?.data?.notes || [];
  const query = (state2.noteSearchQuery || "").toLowerCase();
  const filteredNotes = notes.filter((note) => {
    const title = (note.title || "").toLowerCase();
    const content = (note.content || note.description || "").toLowerCase();
    return title.includes(query) || content.includes(query);
  });
  const noteColors = ["note-yellow", "note-blue", "note-pink", "note-green", "note-purple", "note-orange"];
  return `
    <div class="notepad-container ${state2.notepadSearchOpen ? "search-open" : ""}">
      <!-- Glowing Glassmorphic Top Header[cite: 3] -->
     <div class="notepad-page-header"
     style="background: linear-gradient(135deg, rgba(28, 42, 82, 0.65), rgba(13, 23, 52, 0.85)); border: 1px solid rgba(122, 180, 255, 0.4); border-radius: 24px; padding: 22px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 0 25px rgba(88, 140, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.18); margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">Notepad</h1>
          <span style="font-size: 0.85rem; color: #9fb4df; margin-top: 4px; display: block;">${notes.length} saved</span>
        </div>
        
        <button data-action="toggle-notepad-search" style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #8ad4ff, #5092ff); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 18px rgba(80, 146, 255, 0.6), inset 0 1px 2px rgba(255,255,255,0.6); transition: transform 0.2s;">
          <svg width="22" height="22" fill="none" stroke="#0a1930" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      <!-- Search Bar -->
      <div style="margin-bottom: 24px; ${state2.notepadSearchOpen ? "display: block;" : "display: none;"}">
        <input type="text" data-action="notepad-search-input" value="${escapeHtml3(state2.noteSearchQuery || "")}" placeholder="Search notes..." style="width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(122, 180, 255, 0.3); outline: none; font-size: 1rem; color: #1e293b; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.15); box-sizing: border-box;" />
      </div>

      <!-- Notes Grid -->
      <div class="notepad-notes">
        ${filteredNotes.length === 0 ? `<div style="text-align:center; color:rgba(255,255,255,0.4); padding: 40px 0;">No notes found.</div>` : ""}
        ${filteredNotes.map((note, index) => {
    const noteDate = note.createdAt ? new Date(note.createdAt) : /* @__PURE__ */ new Date();
    const formattedDate = [String(noteDate.getDate()).padStart(2, "0"), String(noteDate.getMonth() + 1).padStart(2, "0"), noteDate.getFullYear()].join("/");
    const noteId = note.id || note._id;
    const colorClass = noteColors[index % noteColors.length];
    return `
            <div class="${colorClass}" style="border-radius: 16px; padding: 20px; position: relative;">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; padding-right: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml3(note.title || "Untitled")}
                </h3>
                
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                  <button data-action="edit-note" data-note-id="${noteId}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">\u270F\uFE0F</button>
                  <button data-action="delete-note" data-note-id="${noteId}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">\u{1F5D1}\uFE0F</button>
                </div>
              </div>
              
              <p style="font-size: 0.95rem; margin: 0 0 16px 0; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml3(note.content || note.description || "")}</p>
              
              <div style="display: flex; align-items: center; font-size: 0.85rem; font-weight: 500; opacity: 0.85;">
                <svg style="width: 16px; height: 16px; margin-right: 6px; opacity: 0.8;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${formattedDate}
              </div>

            </div>
          `;
  }).join("")}
      </div>
      
<!-- FLOATING ADD BUTTON (+) FIXED & STRICTLY LOCKED TO PHONE FRAME -->
      <div style="position: fixed; bottom: 210px; left: 49%; transform: translateX(-50%); width: 100%; max-width: 430px; display: flex; justify-content: flex-end; padding-right: 20px; box-sizing: border-box; pointer-events: none; z-index: 9999;">
        
        <button data-action="open-add-entry" data-type="note" style="pointer-events: auto; width: 56px; height: 56px; border-radius: 50%; background: #6366f1; color: white; border: none; font-size: 28px; font-weight: 300; cursor: pointer; box-shadow: 0 4px 15px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center;">
          +
        </button>
        
      </div>

    </div>
  `;
}

// pages/finance.js
function escapeHtml4(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderFinancePage(state2) {
  const view = state2.financeView || "dashboard";
  const transactions = state2.financeData || [];
  const query = (state2.financeSearchQuery || "").toLowerCase();
  const typeFilter = state2.financeTypeFilter || "all";
  let displayTransactions = transactions.filter((t) => {
    const titleMatch = (t.category || t.title || "").toLowerCase().includes(query);
    const amountMatch = String(t.amount || "").includes(query);
    const typeMatch = typeFilter === "all" || t.type === typeFilter;
    return (titleMatch || amountMatch) && typeMatch;
  });
  displayTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  const searchAndFilterHTML = `
    <div style="display: flex; gap: 10px; margin-bottom: 16px; position: relative; z-index: 10;">
        <input 
            type="text" 
            data-action="finance-search" 
            placeholder="Search transactions..." 
            value="${(state2.financeSearchQuery || "").replace(/"/g, "&quot;")}"
            style="flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; outline: none;"
        />
        <select 
            data-action="finance-filter" 
            style="padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: #1a1a2e; color: white; outline: none; cursor: pointer;"
        >
            <option value="all" ${typeFilter === "all" ? "selected" : ""}>All</option>
            <option value="income" ${typeFilter === "income" ? "selected" : ""}>Income</option>
            <option value="expense" ${typeFilter === "expense" ? "selected" : ""}>Expense</option>
        </select>
    </div>
`;
  let html = "";
  if (view === "add-choice") {
    html = renderAddChoice(state2);
  } else if (view === "add-expense") {
    html = renderAddExpense(state2);
  } else if (view === "transactions") {
    html = renderTransactions(transactions, state2);
  } else {
    html = renderDashboard(transactions, state2);
  }
  if (state2.financeDetail) {
    html += renderTransactionDetailModal(state2.financeDetail);
  }
  if (state2.showFinanceResetConfirm) {
    html += renderResetConfirmModal(state2);
  }
  return html;
}
function renderDashboard(transactions, state2) {
  const filter = state2.financeFilter || "week";
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date || Date.now());
    tDate.setHours(0, 0, 0, 0);
    if (filter === "week") {
      const diffDays = (now - tDate) / (1e3 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    }
    if (filter === "month") {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    }
    if (filter === "year") {
      return tDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
  let totalIncome = 0;
  let totalExpense = 0;
  filteredTransactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === "income") {
      totalIncome += amt;
    }
    if (t.type === "expense") {
      totalExpense += amt;
    }
  });
  const totalBalance = totalIncome - totalExpense;
  const spendingTitle = filter === "week" ? "Weekly Breakdown" : filter === "month" ? "Monthly Breakdown" : "Yearly Breakdown";
  const totalFlow = totalIncome + totalExpense;
  let incomeAngle = 0;
  let incomePercent = 0;
  let expensePercent = 0;
  if (totalFlow > 0) {
    incomeAngle = totalIncome / totalFlow * 360;
    incomePercent = Math.round(totalIncome / totalFlow * 100);
    expensePercent = Math.round(totalExpense / totalFlow * 100);
  }
  const chartGradient = totalFlow > 0 ? `conic-gradient(#34d399 0deg ${incomeAngle}deg, #f87171 ${incomeAngle}deg 360deg)` : "rgba(255,255,255,0.05)";
  return `
    <div
  class="finance-dashboard-page"
  style="
    background: transparent;
    width: 100%;
    max-width: 410px;
    margin-left: auto;
    margin-right: auto;
    min-height: 100vh;
    padding: 24px 20px;
    padding-bottom: 170px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: white;
    box-sizing: border-box;
  "
>

      <!-- Top Header -->
      <div
        class="finance-dashboard-header"
        style="
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 -6px 24px;
          padding: 18px 14px 20px;
          border-radius: 22px;
          background:
            linear-gradient(
              135deg,
              rgba(96,165,255,0.18),
              rgba(37,99,235,0.08) 55%,
              rgba(255,255,255,0.025)
            );
          border: 1px solid rgba(96,165,255,0.18);
          box-shadow:
            0 12px 30px rgba(0,0,0,0.28),
            inset 0 1px 1px rgba(255,255,255,0.10);
          overflow: hidden;
        "
      >

        <!-- Soft glow -->
        <div
          style="
            position: absolute;
            width: 150px;
            height: 150px;
            top: -90px;
            left: -50px;
            background: rgba(96,165,255,0.18);
            filter: blur(45px);
            border-radius: 50%;
            pointer-events: none;
          "
        ></div>

        <!-- Header Text -->
        <div
          style="
            position: relative;
            z-index: 2;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              gap: 9px;
              margin-bottom: 5px;
            "
          >
            <span
              style="
                width: 5px;
                height: 28px;
                border-radius: 10px;
                background:
                  linear-gradient(
                    180deg,
                    #60a5ff,
                    #8b5cf6
                  );
                box-shadow:
                  0 0 14px rgba(96,165,255,0.7);
              "
            ></span>

            <h1
              style="
                margin: 0;
                font-size: 1.85rem;
                line-height: 1;
                font-weight: 850;
                color: #ffffff;
                letter-spacing: -0.035em;
                text-shadow:
                  0 2px 10px rgba(96,165,255,0.25);
              "
            >
              Dashboard
            </h1>
          </div>

          <div
            style="
              margin-left: 14px;
              color: #9fb6d9;
              font-size: 0.82rem;
              font-weight: 600;
              letter-spacing: 0.02em;
            "
          >
            ${(/* @__PURE__ */ new Date()).toLocaleString("default", {
    month: "long",
    year: "numeric"
  })}
          </div>
        </div>

        <!-- Reset Button -->
        <button
          data-action="show-finance-reset-confirm"
          type="button"
          title="Reset Transactions"
          style="
            position: relative;
            z-index: 3;
            width: 44px;
            height: 44px;
            border-radius: 15px;
            display: grid;
            place-items: center;
            background:
              linear-gradient(
                145deg,
                rgba(47,55,72,0.95),
                rgba(20,24,34,0.95)
              );
            border: 1px solid rgba(255,255,255,0.14);
            border-top: 1px solid rgba(255,255,255,0.28);
            color: #8dc1ff;
            cursor: pointer;
            box-shadow:
              0 8px 18px rgba(0,0,0,0.35),
              inset 0 1px 1px rgba(255,255,255,0.12);
            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease;
          "
        >
          \u{1F504}
        </button>
      </div>


      <!-- TOTAL BALANCE -->
      <!-- WIDTH = FULL INNER FINANCE WIDTH -->
      <div
        class="finance-balance-card"
        style="
          width: 100%;
          max-width: 100%;
          margin: 0 auto 24px;
          box-sizing: border-box;
          background: linear-gradient(145deg, #60a5ff, #2563eb);
          border-radius: 28px;
          padding: 26px;
          box-shadow:
            0 20px 45px rgba(37, 99, 235, 0.4),
            inset 0 2px 4px rgba(255,255,255,0.5),
            inset 0 -3px 8px rgba(0,0,0,0.3);
          border-top:
            1px solid rgba(255,255,255,0.4);
        "
      >

        <div
          style="
            color: rgba(255,255,255,0.9);
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          "
        >
          Total Balance
        </div>

        <div
          style="
            font-size: 2.6rem;
            font-weight: 800;
            margin-bottom: 24px;
            letter-spacing: -0.02em;
            text-shadow: 0 3px 6px rgba(0,0,0,0.25);
          "
        >
          \u20B9${totalBalance.toFixed(2)}
        </div>

        <div
          class="finance-income-expense-row"
          style="
            display: flex;
            align-items: center;
            background: rgba(0,0,0,0.15);
            padding: 14px 16px;
            border-radius: 18px;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.15);
          "
        >

          <div style="flex: 1; min-width: 0;">
            <div
              style="
                font-size: 0.72rem;
                font-weight: 800;
                color: #a7f3d0;
                margin-bottom: 4px;
                letter-spacing: 0.05em;
              "
            >
              \u2713 INCOME
            </div>

            <div
              style="
                font-size: 1.25rem;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                white-space: nowrap;
              "
            >
              \u20B9${totalIncome.toFixed(2)}
            </div>
          </div>

          <div
            style="
              width: 1px;
              height: 36px;
              background: rgba(255,255,255,0.25);
              flex-shrink: 0;
            "
          ></div>

          <div
            style="
              flex: 1;
              min-width: 0;
              padding-left: 16px;
            "
          >
            <div
              style="
                font-size: 0.72rem;
                font-weight: 800;
                color: #fecaca;
                margin-bottom: 4px;
                letter-spacing: 0.05em;
              "
            >
              \u2197 EXPENSES
            </div>

            <div
              style="
                font-size: 1.25rem;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                white-space: nowrap;
              "
            >
              \u20B9${totalExpense.toFixed(2)}
            </div>
          </div>

        </div>
      </div>


      <!-- TIME FRAME -->
      <!-- WIDTH = SAME AS TOTAL BALANCE -->
      <div
        class="finance-period-filter"
        style="
          width: 100%;
          max-width: 100%;
          margin: 0 auto 24px;
          box-sizing: border-box;
          background: linear-gradient(145deg, #181b24, #101218);
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.15);
          border-radius: 24px;
          padding: 6px;
          display: flex;
          gap: 6px;
          box-shadow:
            0 10px 25px rgba(0,0,0,0.4),
            inset 0 1px 2px rgba(255,255,255,0.08);
        "
      >

        <button
          class="${filter === "week" ? "active" : ""}"
          data-action="set-finance-filter"
          data-filter="week"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${filter === "week" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "transparent"};
            color:
              ${filter === "week" ? "white" : "#8b92a5"};
            border:
              ${filter === "week" ? "1px solid rgba(255,255,255,0.3)" : "none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${filter === "week" ? "0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)" : "none"};
            transition: all 0.2s;
          "
        >
          Week
        </button>

        <button
          class="${filter === "month" ? "active" : ""}"
          data-action="set-finance-filter"
          data-filter="month"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${filter === "month" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "transparent"};
            color:
              ${filter === "month" ? "white" : "#8b92a5"};
            border:
              ${filter === "month" ? "1px solid rgba(255,255,255,0.3)" : "none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${filter === "month" ? "0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)" : "none"};
            transition: all 0.2s;
          "
        >
          Month
        </button>

        <button
          class="${filter === "year" ? "active" : ""}"
          data-action="set-finance-filter"
          data-filter="year"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${filter === "year" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "transparent"};
            color:
              ${filter === "year" ? "white" : "#8b92a5"};
            border:
              ${filter === "year" ? "1px solid rgba(255,255,255,0.3)" : "none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${filter === "year" ? "0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)" : "none"};
            transition: all 0.2s;
          "
        >
          Year
        </button>

      </div>


      <!-- WEEKLY / MONTHLY / YEARLY BREAKDOWN -->
      <!-- WIDTH = SAME AS OTHER TWO -->
      <div
        class="finance-spending-card"
        style="
          width: 100%;
          max-width: 100%;
          margin: 0 auto 24px;
          box-sizing: border-box;
          background: linear-gradient(145deg, #191c26, #11131a);
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.2);
          border-radius: 28px;
          padding: 24px;
          box-shadow:
            0 16px 35px rgba(0,0,0,0.5),
            inset 0 1px 1px rgba(255,255,255,0.1);
        "
      >

        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
          "
        >

          <h3
            style="
              margin: 0;
              font-size: 1.15rem;
              font-weight: 700;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "
          >
            ${spendingTitle}
          </h3>

          <button
            data-action="set-finance-view"
            data-view="transactions"
            style="
              background: none;
              border: none;
              color: #60a5ff;
              font-size: 0.9rem;
              font-weight: 700;
              cursor: pointer;
              white-space: nowrap;
            "
          >
            Details >
          </button>

        </div>


        <!-- DONUT -->
        <div
          style="
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
          "
        >

          <div
            style="
              width: 176px;
              height: 176px;
              flex-shrink: 0;
              border-radius: 50%;
              background: ${chartGradient};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow:
                0 12px 30px rgba(0,0,0,0.6),
                inset 0 3px 6px rgba(255,255,255,0.3);
            "
          >

            <div
              style="
                width: 128px;
                height: 128px;
                border-radius: 50%;
                background: #12141c;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow:
                  inset 0 4px 8px rgba(0,0,0,0.6);
              "
            >

              <div
                style="
                  font-size: 1.35rem;
                  font-weight: 800;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                "
              >
                \u20B9${totalExpense.toFixed(2)}
              </div>

              <div
                style="
                  font-size: 0.7rem;
                  color: #8b92a5;
                  margin-top: 4px;
                  font-weight: 800;
                  letter-spacing: 0.08em;
                "
              >
                SPENT
              </div>

            </div>
          </div>
        </div>


        <!-- PERCENTAGES -->
        <div
          class="finance-percentages"
          style="
            display: flex;
            gap: 12px;
            background: rgba(0,0,0,0.25);
            padding: 14px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.06);
            box-shadow:
              inset 0 2px 4px rgba(0,0,0,0.4);
          "
        >

          <div
            style="
              flex: 1;
              text-align: center;
              border-right:
                1px solid rgba(255,255,255,0.1);
              min-width: 0;
            "
          >
            <div
              style="
                font-size: 0.72rem;
                color: #34d399;
                font-weight: 800;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
              "
            >
              \u{1F7E2} EARNED
            </div>

            <div
              style="
                font-size: 1.15rem;
                font-weight: 700;
                color: #34d399;
                text-shadow:
                  0 2px 4px rgba(0,0,0,0.3);
              "
            >
              ${incomePercent}%
            </div>
          </div>

          <div
            style="
              flex: 1;
              text-align: center;
              min-width: 0;
            "
          >
            <div
              style="
                font-size: 0.72rem;
                color: #f87171;
                font-weight: 800;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
              "
            >
              \u{1F534} SPENT
            </div>

            <div
              style="
                font-size: 1.15rem;
                font-weight: 700;
                color: #f87171;
                text-shadow:
                  0 2px 4px rgba(0,0,0,0.3);
              "
            >
              ${expensePercent}%
            </div>
          </div>

        </div>
      </div>


      <!-- FLOATING ADD BUTTON -->
      <div
        style="
          position: fixed;
          bottom: 95px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          display: flex;
          justify-content: flex-end;
          padding-right: 20px;
          box-sizing: border-box;
          pointer-events: none;
          z-index: 9999;
        "
      >
        <button
          class="finance-add-button"
          data-action="set-finance-view"
          data-view="add-choice"
          style="
            pointer-events: auto;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background:
              linear-gradient(135deg, #60a5ff, #2563eb);
            color: white;
            border: none;
            border-top:
              1px solid rgba(255,255,255,0.5);
            font-size: 34px;
            font-weight: 300;
            cursor: pointer;
            box-shadow:
              0 12px 30px rgba(37,99,235,0.6),
              inset 0 2px 4px rgba(255,255,255,0.6),
              inset 0 -3px 6px rgba(0,0,0,0.3);
            display: grid;
            place-items: center;
            transition: transform 0.1s;
          "
        >
          +
        </button>
      </div>

    </div>
  `;
}
function renderTransactions(transactions, state2) {
  const allTransactions = Array.isArray(transactions) ? [...transactions] : [];
  allTransactions.sort((a, b) => {
    return new Date(b.date || 0) - new Date(a.date || 0);
  });
  if (allTransactions.length === 0) {
    return `
      <div
        class="finance-transactions-empty"
        style="
          background: #0c0e14;
          min-height: 100vh;
          padding: 24px 20px 130px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: white;
          box-sizing: border-box;
        "
      >
        <div
          class="finance-month-separator"
          style="
            display: flex;
            align-items: center;
            margin-bottom: 24px;
          "
        >
          <button
            type="button"
            data-action="set-finance-view"
            data-view="dashboard"
            style="
              width: 42px;
              height: 42px;
              border-radius: 14px;
              background: linear-gradient(135deg, #222634, #14161c);
              border: 1px solid rgba(255,255,255,0.12);
              color: white;
              font-size: 1.2rem;
              cursor: pointer;
              display: grid;
              place-items: center;
              margin-right: 14px;
            "
          >
            \u2190
          </button>

          <h1
            style="
              margin: 0;
              font-size: 1.5rem;
              font-weight: 700;
            "
          >
            All Transactions
          </h1>
        </div>

        <div
          class="finance-transaction-rows"
          style="
            text-align: center;
            color: #8b92a5;
            margin-top: 60px;
          "
        >
          No transactions found.
        </div>
      </div>
    `;
  }
  const monthGroups = {};
  allTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    if (Number.isNaN(date.getTime())) return;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    if (!monthGroups[key]) {
      monthGroups[key] = {
        year,
        month,
        transactions: []
      };
    }
    monthGroups[key].transactions.push(transaction);
  });
  const sortedGroups = Object.values(monthGroups).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.month - a.month;
  });
  const sections = sortedGroups.map((group) => {
    const monthName = new Date(
      group.year,
      group.month,
      1
    ).toLocaleDateString("en-IN", {
      month: "long"
    });
    const transactionRows = group.transactions.sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    }).map((t) => {
      const isExpense = t.type === "expense";
      const sign = isExpense ? "-" : "+";
      const amountColor = isExpense ? "#ff8f9c" : "#63e6b1";
      const txId = t._id || t.id;
      const category = escapeHtml4(
        t.category || t.title || "Transaction"
      );
      const date = new Date(t.date);
      const formattedDate = date.toLocaleDateString("en-IN");
      return `
          <button
            class="finance-transaction-row"
            type="button"
            data-action="show-transaction-detail"
            data-id="${txId}"
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;

              padding: 16px 0;

              background: transparent;
              border: none;
              border-bottom: 1px solid rgba(255,255,255,0.06);

              color: white;
              text-align: left;

              cursor: pointer;
              box-sizing: border-box;
            "
          >

            <!-- LEFT -->
            <div
              style="
                display: flex;
                align-items: center;
                gap: 14px;
                min-width: 0;
                flex: 1;
              "
            >

              <div
                style="
                  width: 46px;
                  height: 46px;
                  min-width: 46px;
                  border-radius: 14px;

                  background: rgba(255,255,255,0.06);

                  display: grid;
                  place-items: center;

                  font-size: 1.15rem;
                "
              >
                \u{1F4B0}
              </div>

              <div
                style="
                  min-width: 0;
                "
              >

                <div
                  style="
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;

                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  ${category}
                </div>

                <div
                  style="
                    margin-top: 4px;
                    color: #8b92a5;
                    font-size: 0.82rem;
                  "
                >
                  ${formattedDate}
                </div>

              </div>

            </div>

            <!-- AMOUNT -->
            <div
              style="
                color: ${amountColor};
                font-size: 1.05rem;
                font-weight: 800;
                white-space: nowrap;
                flex-shrink: 0;
              "
            >
              ${sign}\u20B9${Math.abs(Number(t.amount) || 0).toFixed(2)}
            </div>

          </button>
        `;
    }).join("");
    return `
      <section
        class="finance-transaction-month"
        style="
          margin: 0;
        "
      >

        <!-- MONTH SEPARATOR -->
        <div
          class="finance-month-separator"
          style="
            width: 100%;

            padding:
              20px 20px 16px;

            background: #1a1b1d;

            border-top:
              1px solid rgba(255,255,255,0.04);

            border-bottom:
              1px solid rgba(255,255,255,0.05);

            box-sizing: border-box;
          "
        >

          <div class="finance-month-year"
            style="
              color: #aeb4be;
              font-size: 0.95rem;
              font-weight: 600;
              margin-bottom: 2px;
            "
          >
            ${group.year}
          </div>

          <div class="finance-month-name"
            style="
              color: #f2f3f5;
              font-size: 1.75rem;
              font-weight: 500;
              line-height: 1.1;
            "
          >
            ${monthName}
          </div>

        </div>

        <!-- ONLY TRANSACTIONS OF THIS MONTH -->
        <div
          class="finance-transaction-rows"
          style="
            padding: 0 20px;
            background: #0f1012;
          "
        >
          ${transactionRows}
        </div>

      </section>
    `;
  }).join("");
  return `
   <div
  class="finance-transactions-page"
  style="
    background: #040404;
    min-height: 100vh;

    padding: 18px 14px 170px;

    font-family:
      'Segoe UI',
      system-ui,
      sans-serif;

    color: white;

    box-sizing: border-box;
  "
>

      <!-- HEADER -->
      <div
  class="finance-transactions-header"
  style="
    display: flex;
    align-items: center;

    padding: 14px 20px;

    background: #050505;
  "
>

        <button
          type="button"
          data-action="set-finance-view"
          data-view="dashboard"
          style="
            width: 42px;
            height: 42px;

            border-radius: 13px;

            background:
              linear-gradient(
                145deg,
                #292d34,
                #17191d
              );

            border:
              1px solid rgba(255,255,255,0.10);

            color: white;

            font-size: 1.2rem;

            cursor: pointer;

            display: grid;
            place-items: center;

            margin-right: 14px;
          "
        >
          \u2190
        </button>

        <h1
          style="
            margin: 0;

            font-size: 1.5rem;

            font-weight: 800;

            color: #f5f6f8;
          "
        >
          All Transactions
        </h1>

      </div>

      <!-- MONTH GROUPS -->
      ${sections}

    </div>
  `;
}
function renderAddChoice(state2) {
  return `
    <div class="finance-type-page" style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 130px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; position: relative;">
      
      <div style="position: absolute; top: 24px; left: 20px;">
        <button data-action="set-finance-view" data-view="dashboard" style="background: linear-gradient(135deg, #222634, #14161c); border: 1px solid rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.25); width: 42px; height: 42px; border-radius: 14px; color: white; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);">\u2190</button>
      </div>

      <div style="text-align: center; margin-bottom: 36px;">
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Select Type</h1>
        <p style="color: #8b92a5; font-size: 0.95rem;">Choose transaction category</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 340px;">
        <button class="finance-type-option income-type-option" data-action="select-finance-type" data-type="income" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(52, 211, 153, 0.4); border-top: 1px solid rgba(52, 211, 153, 0.7); border-radius: 24px; padding: 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; color: white; text-align: left; box-shadow: 0 12px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15);">
          <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(52, 211, 153, 0.2); color: #34d399; display: grid; place-items: center; font-size: 1.6rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">\u{1F4B0}</div>
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; color: #34d399; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Income Money</div>
            <div style="font-size: 0.85rem; color: #8b92a5;">Salary, Gifts, Freelance</div>
          </div>
        </button>

        <button class="finance-type-option expense-type-option" data-action="select-finance-type" data-type="expense" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(96, 165, 255, 0.4); border-top: 1px solid rgba(96, 165, 255, 0.7); border-radius: 24px; padding: 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; color: white; text-align: left; box-shadow: 0 12px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15);">
          <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(96, 165, 255, 0.2); color: #60a5ff; display: grid; place-items: center; font-size: 1.6rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">\u{1F4B8}</div>
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; color: #60a5ff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Expense Money</div>
            <div style="font-size: 0.85rem; color: #8b92a5;">Food, Bills, Shopping</div>
          </div>
        </button>
      </div>

    </div>
  `;
}
function renderAddExpense(state2) {
  const type = state2.tempFinanceType || "expense";
  const isIncome = type === "income";
  return `
    <div class="finance-entry-page" style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 130px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; display: flex; flex-direction: column; box-sizing: border-box;">
      
      <!-- Top Bar -->
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <button data-action="set-finance-view" data-view="add-choice" style="background: linear-gradient(135deg, #222634, #14161c); border: 1px solid rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.25); width: 42px; height: 42px; border-radius: 14px; color: white; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; margin-right: 16px; box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);">\u2190</button>
        <h1 style="font-size: 1.3rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Add ${isIncome ? "Income" : "Expense"} Details</h1>
      </div>

      <!-- Amount Input Card -->
      <div class="finance-amount-card" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.25); border-radius: 24px; padding: 24px; text-align: center; margin-bottom: 24px; box-shadow: 0 16px 35px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15);">
        <div style="color: #8b92a5; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 8px;">ENTER AMOUNT</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span style="font-size: 2.2rem; font-weight: 700; color: ${isIncome ? "#34d399" : "#60a5ff"}; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">\u20B9</span>
          <input type="number" id="finance-amount" placeholder="0.00" style="background: transparent; border: none; color: white; font-size: 2.8rem; font-weight: 800; text-align: center; width: 180px; outline: none; text-shadow: 0 2px 6px rgba(0,0,0,0.4);" />
        </div>

        <!-- Quick Amount Chips -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 16px;">
          <button type="button" data-action="quick-amount" data-val="100" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+100</button>
          <button type="button" data-action="quick-amount" data-val="500" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+500</button>
          <button type="button" data-action="quick-amount" data-val="1000" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+1000</button>
          <button type="button" data-action="quick-amount" data-val="5000" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+5000</button>
        </div>
      </div>

      <!-- Form Fields Container -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
        
        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">CATEGORY</label>
          <div style="position: relative;">
            <select id="finance-category" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; appearance: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
              ${isIncome ? `
                <option value="Salary" style="background: #14161c;">\u{1F4B0} Salary</option>
                <option value="Freelance" style="background: #14161c;">\u{1F4BB} Freelance & Gigs</option>
                <option value="Investments" style="background: #14161c;">\u{1F4C8} Investments</option>
                <option value="Business" style="background: #14161c;">\u{1F3E2} Business</option>
                <option value="Gift" style="background: #14161c;">\u{1F381} Gift / Other</option>
              ` : `
                <option value="Food" style="background: #14161c;">\u{1F354} Food & Dining</option>
                <option value="Transport" style="background: #14161c;">\u{1F68C} Transport & Fuel</option>
                <option value="Shopping" style="background: #14161c;">\u{1F6CD}\uFE0F Shopping</option>
                <option value="Bills" style="background: #14161c;">\u26A1 Bills & Utilities</option>
                <option value="Entertainment" style="background: #14161c;">\u{1F3AC} Entertainment</option>
                <option value="Health" style="background: #14161c;">\u{1F48A} Health & Fitness</option>
                <option value="Education" style="background: #14161c;">\u{1F4DA} Education</option>
                <option value="Other" style="background: #14161c;">\u{1F4B8} Other Expense</option>
              `}
            </select>
            <span style="color: #8b92a5; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.8rem;">\u25BC</span>
          </div>
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">PAYMENT METHOD</label>
          <div style="position: relative;">
            <select id="finance-payment-method" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; appearance: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
              <option value="UPI" style="background: #14161c;">\u{1F4F1} UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Bank" style="background: #14161c;">\u{1F3E6} Bank Account / NetBanking</option>
              <option value="Card" style="background: #14161c;">\u{1F4B3} Credit / Debit Card</option>
              <option value="Cash" style="background: #14161c;">\u{1F4B5} Cash</option>
            </select>
            <span style="color: #8b92a5; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.8rem;">\u25BC</span>
          </div>
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">DATE</label>
          <input type="date" id="finance-date" value="${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; text-transform: uppercase; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);" />
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">NOTE (OPTIONAL)</label>
          <input type="text" id="finance-note" placeholder="Add a short note or description..." style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);" />
        </div>

      </div>

      <!-- 3D Action Button -->
      <button data-action="save-finance-transaction" data-type="${type}" style="width: 100%; padding: 18px; border-radius: 100px; background: ${isIncome ? "linear-gradient(135deg, #34d399, #059669)" : "linear-gradient(135deg, #60a5ff, #2563eb)"}; color: white; border: none; border-top: 1px solid rgba(255,255,255,0.5); font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 12px 30px ${isIncome ? "rgba(5, 150, 105, 0.5)" : "rgba(37, 99, 235, 0.5)"}, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Save Transaction
      </button>

    </div>
  `;
}
function renderTransactionDetailModal(transaction) {
  if (!transaction) return "";
  const isExpense = transaction.type === "expense";
  const sign = isExpense ? "-" : "+";
  const txId = transaction._id || transaction.id;
  const dateObj = new Date(transaction.date);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const safeNote = transaction.note ? String(transaction.note).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "No description provided";
  return `
        <!-- Modal Backdrop -->
        <div class="finance-transaction-detail-backdrop" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Segoe UI', system-ui, sans-serif; animation: fadeIn 0.2s ease-out;">
            
            <!-- Modal Container -->
            <div class="finance-transaction-detail-modal" style="background: #141827; width: 100%; max-width: 420px; border-radius: 20px; border: 1px solid #232a3e; box-shadow: 0 25px 50px rgba(0,0,0,0.5); padding: 24px; display: flex; flex-direction: column; box-sizing: border-box; animation: scaleIn 0.2s ease-out;">
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">\u{1F4CA}</span>
                        <span class="finance-transaction-detail-label" style="color: #a0aec0; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">TRANSACTION</span>
                    </div>
                    <button data-action="close-transaction-detail" style="background: #232a3e; border: none; width: 32px; height: 32px; border-radius: 8px; color: #a0aec0; font-size: 1.1rem; display: grid; place-items: center; cursor: pointer; transition: background 0.2s;">\u2715</button>
                </div>

                <!-- Main Title (Category & Amount) -->
                <h2 class="finance-transaction-detail-title" style="margin: 0 0 20px 0; font-size: 1.7rem; font-weight: 700; color: white;">
                    ${transaction.category || "Transaction"} <span class="finance-transaction-detail-amount ${isExpense ? "expense" : "income"}" style="color: ${isExpense ? "#fca5a5" : "#6ee7b7"}; font-size: 1.4rem; margin-left: 8px;">${sign}\u20B9${Math.abs(transaction.amount).toFixed(2)}</span>
                </h2>

                <!-- Detail Cards -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
                    
                    <!-- Date Row -->
                    <div class="finance-transaction-detail-row" style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #93c5fd;">\u{1F4C5}</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">Date</div>
                            <div style="color: white; font-size: 0.95rem; font-weight: 600;">${formattedDate}</div>
                        </div>
                    </div>

                    <!-- Payment Method Row -->
                    <div class="finance-transaction-detail-row" style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #d8b4fe;">\u{1F4B3}</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">Payment Method</div>
                            <div style="color: white; font-size: 0.95rem; font-weight: 600;">${transaction.paymentMethod || "Unknown"}</div>
                        </div>
                    </div>

                    <!-- Status / Type Row -->
                    <div class="finance-transaction-detail-row" style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #fca5a5;">\u{1F4CC}</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px;">Status</div>
                            <div class="finance-transaction-detail-status" style="display: inline-block; background: ${isExpense ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)"}; color: ${isExpense ? "#fca5a5" : "#6ee7b7"}; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize;">${transaction.type}</div>
                        </div>
                    </div>

                </div>

                <!-- Description -->
                <div class="finance-transaction-detail-description" style="margin-bottom: 24px;">
                    <div style="color: #e2e8f0; font-size: 0.9rem; font-weight: 600; margin-bottom: 8px;">Description</div>
                    <div style="color: #94a3b8; font-size: 0.95rem; line-height: 1.5;">
                        ${safeNote}
                    </div>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background: #232a3e; margin: 0 -24px 20px -24px;"></div>

                <!-- Footer Actions -->
                <div style="display: flex; gap: 12px;">
                    <button data-action="delete-finance-transaction" data-id="${txId}" style="flex: 1; background: #2d1f2b; border: 1px solid #4b2c39; color: #f472b6; padding: 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete
                    </button>
                    <button data-action="close-transaction-detail" style="flex: 1; background: #202638; border: 1px solid #2e364f; color: white; padding: 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Close
                    </button>
                </div>

            </div>

            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        </div>
    `;
}
function renderResetConfirmModal(state2) {
  return `
        <!-- Modal Backdrop -->
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Segoe UI', system-ui, sans-serif; animation: fadeIn 0.2s ease-out;">
            
            <!-- Custom Modal Container -->
            <div style="background: #141827; width: 100%; max-width: 380px; border-radius: 24px; border: 1px solid #3f2c39; box-shadow: 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05); padding: 32px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; animation: scaleIn 0.2s ease-out; box-sizing: border-box;">
                
                <!-- Warning Icon -->
                <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(239, 68, 68, 0.2);">
                    <span style="font-size: 2rem;">\u26A0\uFE0F</span>
                </div>

                <!-- Text -->
                <h2 style="margin: 0 0 12px 0; font-size: 1.4rem; font-weight: 800; color: white;">Reset Transactions?</h2>
                <p style="margin: 0 0 28px 0; color: #94a3b8; font-size: 0.95rem; line-height: 1.5;">
                This permanently deletes all of your income and expense transactions. Your tasks, events, notes, and account will not be deleted. This <strong>cannot be undone</strong>.
                </p>

                <!-- Action Buttons (Cancel / Confirm) -->
                <div style="display: flex; gap: 12px; width: 100%;">
                    <button data-action="cancel-finance-reset" ${state2.financeResetLoading ? "disabled" : ""} style="flex: 1; background: #202638; border: 1px solid #2e364f; color: white; padding: 14px; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        Cancel
                    </button>
                    <button data-action="confirm-finance-reset" ${state2.financeResetLoading ? "disabled" : ""} style="flex: 1; background: linear-gradient(135deg, #ef4444, #b91c1c); border: none; color: white; padding: 14px; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);">
                        ${state2.financeResetLoading ? "Resetting\u2026" : "Yes, Reset Transactions"}
                    </button>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        </div>
    `;
}

// app.js
init_local_database();

// scripts/offline-sync.js
var DATA_COLLECTIONS = /* @__PURE__ */ new Set([
  "events",
  "tasks",
  "moods",
  "habits",
  "goals",
  "reminders",
  "notes",
  "habitLogs",
  "assets",
  "transactions",
  "expenses",
  "subscriptions"
]);
function parseTokenAccount(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    const id = decoded.id || decoded.sub || decoded.userId;
    return id ? String(id) : null;
  } catch {
    return null;
  }
}
function makeId() {
  return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function cleanPath(path) {
  return String(path || "").split("?")[0].replace(/^\/+/, "");
}
function resourceFor(path, body = {}) {
  const clean = cleanPath(path).replace(/^api\//, "");
  const [root] = clean.split("/");
  const map = {
    events: "events",
    tasks: "tasks",
    moods: "moods",
    habits: "habits",
    goals: "goals",
    reminders: "reminders",
    notes: "notes",
    "habit-logs": "habitLogs",
    assets: "assets",
    transactions: "transactions",
    expenses: "transactions",
    subscriptions: "transactions"
  };
  const collection = map[root];
  if (!collection) return null;
  return { collection, root, id: clean.split("/")[1] || null };
}
function normalizeServerRecord(record) {
  if (!record || typeof record !== "object") return null;
  return { ...record, id: String(record.id || record._id || makeId()) };
}
var OfflineSync = class {
  constructor({ getToken, fetchImpl = (...args) => fetch(...args), baseUrl = () => "", storage = null }) {
    this.getToken = getToken;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
    this.storage = storage;
    this.storagePromise = null;
    this.flushing = false;
  }
  async db() {
    if (this.storage) return this.storage;
    if (!this.storagePromise) this.storagePromise = Promise.resolve().then(() => (init_local_database(), local_database_exports));
    return this.storagePromise;
  }
  async scoped(accountId, collection) {
    return (await this.db()).accountCollection(accountId, collection);
  }
  async getNamed(name) {
    return (await this.db()).getCollection(name);
  }
  async saveNamed(name, record) {
    return (await this.db()).saveRecord(name, record);
  }
  async deleteNamed(name, id) {
    return (await this.db()).deleteRecord(name, id);
  }
  async accountId(token) {
    const id = parseTokenAccount(token);
    if (!id) throw new Error("The signed-in token does not contain an account ID; offline cache is disabled for safety.");
    return id;
  }
  async collectionName(token, collection) {
    return this.scoped(await this.accountId(token), collection);
  }
  async read(token, collection) {
    return this.getNamed(await this.collectionName(token, collection));
  }
  async write(token, collection, record) {
    return this.saveNamed(await this.collectionName(token, collection), normalizeServerRecord(record));
  }
  async remove(token, collection, id) {
    return this.deleteNamed(await this.collectionName(token, collection), String(id));
  }
  async cacheDashboard(token, payload) {
    const account = await this.accountId(token);
    const data = payload?.data || {};
    for (const collection of ["events", "tasks", "moods", "habits", "goals", "reminders", "notes", "habitLogs", "assets"]) {
      const name = await this.scoped(account, collection);
      const incoming = Array.isArray(data[collection]) ? data[collection] : [];
      const pending = await this.read(token, "syncOutbox");
      const collectionPending = pending.some((op) => op.collection === collection);
      if (!collectionPending) {
        for (const existing of await this.getNamed(name)) await this.deleteNamed(name, existing.id ?? existing._id);
        for (const record of incoming) await this.saveNamed(name, normalizeServerRecord(record));
      }
    }
    await this.write(token, "profileCache", { id: "dashboard", payload: { user: payload?.user || null } }).catch(() => {
    });
  }
  async cacheSuccessfulMutation(token, path, options = {}, payload = {}) {
    const method = String(options.method || "GET").toUpperCase();
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return;
    const resource = resourceFor(path, options.body ? JSON.parse(options.body) : {});
    if (!resource) return;
    const body = options.body ? JSON.parse(options.body) : {};
    const returned = payload.event || payload.task || payload.mood || payload.habit || payload.goal || payload.reminder || payload.asset || payload.transaction || payload.note;
    if (method === "DELETE") {
      const tokenAccount = await this.accountId(token);
      const name = await this.scoped(tokenAccount, resource.collection);
      if (resource.id) await this.deleteNamed(name, resource.id);
      else for (const row of await this.getNamed(name)) await this.deleteNamed(name, row.id || row._id);
      return;
    }
    const record = normalizeServerRecord(returned || body);
    if (!record) return;
    await this.write(token, resource.collection, { ...record, _offlinePending: false });
  }
  async cacheTransactions(token, transactions) {
    const pending = await this.read(token, "syncOutbox");
    if (pending.some((op) => op.collection === "transactions")) return;
    const existing = await this.read(token, "transactions");
    for (const row of existing) await this.remove(token, "transactions", row.id ?? row._id);
    for (const row of Array.isArray(transactions) ? transactions : []) await this.write(token, "transactions", row);
  }
  async dashboardFallback(token) {
    const [userCache, ...values] = await Promise.all([
      this.read(token, "profileCache"),
      ...["events", "tasks", "moods", "habits", "goals", "reminders", "notes", "habitLogs", "assets"].map((c) => this.read(token, c))
    ]);
    const names = ["events", "tasks", "moods", "habits", "goals", "reminders", "notes", "habitLogs", "assets"];
    const data = Object.fromEntries(names.map((name, i) => [name, values[i]]));
    return { user: userCache.find((x) => x.id === "dashboard")?.payload?.user || null, data, offline: true };
  }
  async transactionFallback(token) {
    return this.read(token, "transactions");
  }
  async enqueueAndApply(token, path, options = {}) {
    const method = String(options.method || "GET").toUpperCase();
    const resource = resourceFor(path, options.body ? JSON.parse(options.body) : {});
    if (!resource || !DATA_COLLECTIONS.has(resource.collection)) throw new Error("This action is not supported offline. Reconnect and try again.");
    const account = await this.accountId(token);
    const body = options.body ? JSON.parse(options.body) : {};
    const collectionName = await this.scoped(account, resource.collection);
    const outboxName = await this.scoped(account, "syncOutbox");
    const rows = await this.getNamed(collectionName);
    const recordId = resource.id;
    const idempotencyKey = options.idempotencyKey || makeId();
    let localId = recordId;
    let localRecord = null;
    if (method === "POST") {
      localId = makeId();
      localRecord = normalizeServerRecord({ ...body, id: localId, _offlinePending: true, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      if (resource.collection === "transactions") {
        localRecord.type = body.type || "expense";
        localRecord.date = body.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      }
      if (resource.collection === "moods") {
        const sameDate = rows.find((r) => r.date === body.date);
        if (sameDate) {
          localId = sameDate.id;
          localRecord = { ...sameDate, ...body, id: localId, _offlinePending: true, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        }
      }
      await this.saveNamed(collectionName, localRecord);
    } else if (method === "PUT" || method === "PATCH") {
      const existing = rows.find((r) => String(r.id || r._id) === String(recordId));
      if (!existing) throw new Error("Cannot edit this item offline because it is not in the local cache. Reconnect and retry.");
      localRecord = { ...existing, ...body, id: String(recordId), _offlinePending: true, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      await this.saveNamed(collectionName, localRecord);
    } else if (method === "DELETE") {
      if (!recordId) {
        for (const row of rows) await this.deleteNamed(collectionName, row.id || row._id);
      } else {
        await this.deleteNamed(collectionName, recordId);
      }
    } else {
      throw new Error("Unsupported offline operation.");
    }
    const op = {
      id: makeId(),
      idempotencyKey,
      accountId: account,
      path: String(path),
      method,
      body,
      collection: resource.collection,
      localId,
      serverId: method === "POST" ? null : recordId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      attempts: 0,
      status: "pending"
    };
    await this.saveNamed(outboxName, op);
    return method === "DELETE" ? { message: "Deleted locally; will sync when online.", offline: true } : {
      message: "Saved on this device; will sync when online.",
      offline: true,
      [resource.collection === "transactions" ? "transaction" : resource.collection.slice(0, -1)]: localRecord,
      id: localId
    };
  }
  async flush(token) {
    if (this.flushing || !token || !globalThis.navigator?.onLine) return { synced: 0, pending: true };
    this.flushing = true;
    let synced = 0;
    try {
      const account = await this.accountId(token);
      const outboxName = await this.scoped(account, "syncOutbox");
      const idMapName = await this.scoped(account, "syncIdMap");
      const ops = (await this.getNamed(outboxName)).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
      const mappings = await this.getNamed(idMapName);
      const idMap = new Map(mappings.map((m) => [String(m.localId), String(m.serverId)]));
      for (const op of ops) {
        let path = op.path;
        for (const [localId, serverId] of idMap) path = path.replace(`/${localId}`, `/${serverId}`);
        let response;
        try {
          response = await this.fetchImpl(`${this.baseUrl()}${path}`, {
            method: op.method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": op.idempotencyKey },
            ...op.method === "GET" || op.method === "HEAD" ? {} : { body: JSON.stringify(op.body || {}) }
          });
        } catch (error) {
          console.warn("[OfflineSync] Network request failed:", error?.name || "Error", error?.message || "Unknown network error");
          break;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          op.attempts = Number(op.attempts || 0) + 1;
          op.lastError = payload.message || `HTTP ${response.status}`;
          console.warn("[OfflineSync] Server rejected queued operation:", response.status, op.method, op.path);
          await this.saveNamed(outboxName, op);
          break;
        }
        const returned = payload.event || payload.task || payload.mood || payload.habit || payload.goal || payload.reminder || payload.asset || payload.transaction || payload.note;
        if (op.method === "POST" && returned?.id && op.localId) {
          const dataName = await this.scoped(account, op.collection);
          const oldRows = await this.getNamed(dataName);
          const localRow = oldRows.find((r) => String(r.id) === String(op.localId));
          if (localRow) {
            await this.deleteNamed(dataName, op.localId);
            await this.saveNamed(dataName, { ...localRow, ...returned, id: String(returned.id), _offlinePending: false });
          }
          await this.saveNamed(idMapName, { id: op.localId, localId: String(op.localId), serverId: String(returned.id) });
          idMap.set(String(op.localId), String(returned.id));
        }
        await this.deleteNamed(outboxName, op.id);
        synced += 1;
      }
      return { synced, pending: (await this.getNamed(outboxName)).length > 0 };
    } finally {
      this.flushing = false;
    }
  }
  async handleNetworkFailure(token, path, options, error) {
    if (!globalThis.navigator?.onLine || error instanceof TypeError || error?.name === "TypeError") {
      return this.enqueueAndApply(token, path, options);
    }
    throw error;
  }
};

// app.js
var EMPTY_DATA = {
  events: [],
  tasks: [],
  moods: [],
  habits: [],
  goals: [],
  reminders: [],
  notes: [],
  habitLogs: [],
  expenses: [],
  subscriptions: [],
  assets: []
};
var notepadEventsBound = false;
function formatDateKey2(date) {
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 6e4);
  return normalized.toISOString().slice(0, 10);
}
function escapeHtml5(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function formatFriendlyDate(dateString) {
  if (!dateString) return "This month";
  const date = /* @__PURE__ */ new Date(`${String(dateString).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatActivityTime(value) {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "This month";
  const elapsed = Date.now() - time.getTime();
  if (elapsed >= 0 && elapsed < 60 * 60 * 1e3) return `${Math.max(1, Math.floor(elapsed / 6e4))} min ago`;
  if (elapsed >= 0 && elapsed < 24 * 60 * 60 * 1e3) return `${Math.floor(elapsed / 36e5)} hours ago`;
  return time.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
var notificationTargetDate = new URLSearchParams(window.location.search).get("date");
var hasNotificationTarget = /^\d{4}-\d{2}-\d{2}$/.test(notificationTargetDate || "");
var state = {
  view: hasNotificationTarget ? "calendar" : "home",
  currentMonth: (/* @__PURE__ */ new Date()).getMonth(),
  currentYear: (/* @__PURE__ */ new Date()).getFullYear(),
  selectedDate: hasNotificationTarget ? notificationTargetDate : formatDateKey2(/* @__PURE__ */ new Date()),
  authenticated: false,
  data: { ...EMPTY_DATA },
  user: JSON.parse(localStorage.getItem("sahraUser") || "null") || { name: "Sahra" },
  theme: localStorage.getItem("theme") || "dark",
  menuOpen: false,
  profileEditing: false,
  profileDraft: null,
  moreMenuOpen: false,
  entryModalOpen: false,
  notepadSearchOpen: false,
  noteSearchQuery: "",
  entryDraft: null,
  todoFilter: "All",
  moodPickerOpen: false,
  navigationHistory: [],
  assistantMessages: [
    { role: "assistant", text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." }
  ],
  assistantLoading: false,
  assistantGeneration: 0,
  assistantDraft: "",
  voiceListening: false,
  progressPickerOpen: false,
  progressData: null,
  progressLoading: false,
  showAllActivity: false,
  calendarCache: /* @__PURE__ */ new Set(),
  financeView: "dashboard",
  financeData: [],
  financeFilter: "week",
  financeSearchQuery: "",
  financeTypeFilter: "all",
  financeDetail: null,
  showFinanceResetConfirm: false,
  financeResetLoading: false,
  tempFinanceType: null
};
var notificationInterval = null;
var offlineSync = new OfflineSync({ getToken: getAuthToken, baseUrl: () => String(window.SAHRA_API_BASE_URL || "").replace(/\/+$/, "") });
function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  state.theme = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.body.setAttribute("data-theme", nextTheme);
  document.body.classList.toggle("theme-light", nextTheme === "light");
  document.body.classList.toggle("theme-dark", nextTheme === "dark");
  localStorage.setItem("theme", nextTheme);
}
function showToast(message) {
  const existing = document.querySelector(".app-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3e3);
}
window.alert = function(message) {
  showToast(message);
};
function showAppConfirm(message, onConfirm, confirmLabel = "Delete") {
  const overlay = document.createElement("div");
  overlay.className = "sahra-confirm-overlay";
  overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px);";
  const box = document.createElement("div");
  box.className = "sahra-confirm-box";
  box.style.cssText = "background:var(--panel-bg, #1a1a2e); padding:24px; border-radius:16px; width:80%; max-width:320px; text-align:center; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5);";
  const text = document.createElement("p");
  text.className = "sahra-confirm-message";
  text.textContent = message;
  text.style.cssText = "color:white; margin-bottom:24px; font-size:1.05rem; font-weight: 500;";
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex; gap:12px; justify-content:center;";
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.type = "button";
  cancelBtn.className = "secondary-btn sahra-confirm-cancel";
  cancelBtn.style.flex = "1";
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = confirmLabel;
  confirmBtn.className = "primary-btn compact-btn";
  confirmBtn.classList.add("sahra-confirm-submit");
  confirmBtn.style.cssText = "flex: 1; background: #ff4757; color: white; border: none; font-weight: bold;";
  let confirmed = false;
  cancelBtn.onclick = () => overlay.remove();
  confirmBtn.onclick = async () => {
    if (confirmed) return;
    confirmed = true;
    confirmBtn.disabled = true;
    confirmBtn.textContent = `${confirmLabel}\u2026`;
    confirmBtn.style.opacity = "0.6";
    confirmBtn.style.pointerEvents = "none";
    overlay.remove();
    await onConfirm();
  };
  btnRow.append(cancelBtn, confirmBtn);
  box.append(text, btnRow);
  overlay.append(box);
  document.body.appendChild(overlay);
}
function getStoredTheme() {
  return localStorage.getItem("theme") || "dark";
}
function getLoginPath() {
  return window.SAHRA_IS_NATIVE ? "/login.html" : "/login";
}
function getApiUrl(path) {
  const baseUrl = String(window.SAHRA_API_BASE_URL || "").replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}/${String(path).replace(/^\/+/, "")}` : path;
}
async function getAuthToken() {
  if (window.SAHRA_IS_NATIVE) {
    if (!window.SAHRA_AUTH_STORAGE) {
      throw new Error("Secure native sign-in storage is unavailable.");
    }
    return await window.SAHRA_AUTH_STORAGE.get("sahraToken");
  }
  return localStorage.getItem("sahraToken");
}
async function removeAuthToken() {
  if (window.SAHRA_IS_NATIVE) {
    if (!window.SAHRA_AUTH_STORAGE) {
      throw new Error("Secure native sign-in storage is unavailable.");
    }
    await window.SAHRA_AUTH_STORAGE.remove("sahraToken");
    return;
  }
  localStorage.removeItem("sahraToken");
}
async function apiRequest(path, options = {}) {
  const token = await getAuthToken();
  const method = String(options.method || "GET").toUpperCase();
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const idempotencyKey = isWrite ? options.headers?.["Idempotency-Key"] || globalThis.crypto?.randomUUID?.() || `sahra-${Date.now()}-${Math.random().toString(36).slice(2)}` : null;
  let response;
  try {
    response = await fetch(getApiUrl(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers || {},
        ...idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
        ...token ? { Authorization: `Bearer ${token}` } : {}
      }
    });
  } catch (networkError) {
    if (token && method === "GET" && cleanApiPath(path) === "api/dashboard") {
      const cached = await offlineSync.dashboardFallback(token);
      if (cached.user || Object.values(cached.data || {}).some((rows) => rows.length)) {
        showOfflineBannerOnce();
        return cached;
      }
    }
    if (token && method === "GET" && cleanApiPath(path) === "api/transactions") {
      const cached = await offlineSync.transactionFallback(token);
      if (cached.length) {
        showOfflineBannerOnce();
        return cached;
      }
    }
    if (token && isWrite) {
      try {
        const queued = await offlineSync.enqueueAndApply(token, path, { ...options, method, idempotencyKey });
        showOfflineBannerOnce();
        return queued;
      } catch (queueError) {
        console.warn("Offline save could not be queued:", queueError.message);
      }
    }
    throw networkError;
  }
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message || "Request failed";
    if ([502, 503, 504].includes(response.status) && token) {
      try {
        if (method === "GET" && cleanApiPath(path) === "api/dashboard") {
          const cached = await offlineSync.dashboardFallback(token);
          if (cached.user || Object.values(cached.data || {}).some((rows) => rows.length)) {
            showOfflineBannerOnce();
            return cached;
          }
        }
        if (method === "GET" && cleanApiPath(path) === "api/transactions") {
          const cached = await offlineSync.transactionFallback(token);
          if (cached.length) {
            showOfflineBannerOnce();
            return cached;
          }
        }
        if (isWrite) {
          const queued = await offlineSync.enqueueAndApply(token, path, { ...options, method, idempotencyKey });
          showOfflineBannerOnce();
          return queued;
        }
      } catch (offlineError) {
        console.warn("Offline fallback unavailable:", offlineError.message);
      }
    }
    const isExpiredSession = response.status === 401 || response.status === 404 && message.toLowerCase().includes("user not found");
    if (isExpiredSession) {
      await removeAuthToken();
      localStorage.removeItem("sahraUser");
      state.authenticated = false;
      if (!window.location.pathname.endsWith("/login") && !window.location.pathname.endsWith("/login.html")) {
        window.location.href = getLoginPath();
      }
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (token) {
    try {
      if (method === "GET" && cleanApiPath(path) === "api/dashboard") await offlineSync.cacheDashboard(token, payload);
      else if (method === "GET" && cleanApiPath(path) === "api/transactions") await offlineSync.cacheTransactions(token, Array.isArray(payload) ? payload : payload.transactions || []);
      else if (isWrite) await offlineSync.cacheSuccessfulMutation(token, path, { ...options, method }, payload);
      if (globalThis.navigator?.onLine) void offlineSync.flush(token).catch((error) => console.warn("Offline sync retry failed:", error.message));
    } catch (cacheError) {
      console.warn("Local cache update failed:", cacheError.message);
    }
  }
  return payload;
}
function cleanApiPath(path) {
  return String(path || "").split("?")[0].replace(/^\/+/, "");
}
var offlineBannerShown = false;
function showOfflineBannerOnce() {
}
window.addEventListener("online", async () => {
  offlineBannerShown = false;
  try {
    const token = await getAuthToken();
    await offlineSync.flush(token);
    await loadDashboardData();
    await fetchFinanceData();
  } catch (error) {
    console.warn("Reconnect sync failed:", error.message);
  }
});
function renderMenuPage() {
  return `
    <section class="screen menu-screen" aria-label="Menu">
      <header class="menu-page-heading">
        <h1>Menu</h1>
        <p>Choose a feature</p>
      </header>
      <div class="more-menu-panel menu-page-options" role="navigation" aria-label="Menu options">
        <button class="menu-item" type="button" data-view="tasks">✅ To Do List</button>
        <button class="menu-item" type="button" data-view="vault">📝 Notepad (Vault)</button>
        <button class="menu-item" type="button" data-view="finance">💰 Expense Tracker</button>
        <button class="menu-item" type="button" data-view="progress">📈 Progress &amp; Stats</button>
      </div>
    </section>
  `;
}
function renderMoreMenu() {
  if (!state.moreMenuOpen) return "";
  return `
    <div class="more-menu-backdrop" data-action="close-more-menu" style="position: fixed; inset: 0; z-index: 1000;"></div>
    
    <!-- Added height: fit-content; and min-height: 0; to remove the empty space -->
    <div class="more-menu-panel" style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px; z-index: 1001; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); height: fit-content; min-height: 0;">
      
      <button class="menu-item" type="button" data-view="tasks" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        \u2705 To Do List
      </button>

      <button class="menu-item" type="button" data-view="vault" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        \u{1F4DD} Notepad (Vault)
      </button>
      
      <button class="menu-item" type="button" data-view="finance" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        \u{1F4B0} Expense Tracker
      </button>
      
      <button class="menu-item" type="button" data-view="progress" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        \u{1F4C8} Progress & Stats
      </button>
      
    </div>
  `;
}
async function updateThemeInDatabase(theme) {
  try {
    await apiRequest("/api/profile/theme", {
      method: "PUT",
      body: JSON.stringify({ theme })
    });
  } catch (error) {
    console.warn("Theme sync failed:", error.message);
  }
}
async function saveReminderSettings(settings) {
  const current = state.user?.preferences?.reminderSettings || {};
  const response = await apiRequest("/api/profile/preferences", {
    method: "PUT",
    body: JSON.stringify({
      preferences: {
        reminderSettings: { ...current, ...settings }
      }
    })
  });
  state.user = response.user || {
    ...state.user,
    preferences: {
      ...state.user?.preferences || {},
      reminderSettings: { ...current, ...settings }
    }
  };
  localStorage.setItem("sahraUser", JSON.stringify(state.user));
}
function areDeviceNotificationsEnabled() {
  if (state.user?.preferences?.reminderSettings?.enabled === false) return false;
  if (!window.SAHRA_NOTIFICATIONS?.isNative?.()) {
    return "Notification" in window && Notification.permission === "granted";
  }
  return true;
}
async function toggleDeviceNotifications() {
  const current = state.user?.preferences?.reminderSettings || {};
  const enabled = areDeviceNotificationsEnabled();
  if (enabled) {
    try {
      await saveReminderSettings({ enabled: false });
      if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
        await reconcileNativeNotifications();
      }
      showToast("Device notifications are off.");
    } catch (error) {
      showToast(error.message || "Unable to turn notifications off.");
    }
    return;
  }
  try {
    if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
      const permission = await window.SAHRA_NOTIFICATIONS.reconcile([], { requestPermission: true });
      if (permission.permission !== "granted") {
        showToast("Notification permission was not granted. Enable it in device settings to continue.");
        return;
      }
    } else {
      if (!("Notification" in window)) {
        showToast("Notifications are not supported in this browser.");
        return;
      }
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") {
        showToast("Notification permission was not granted.");
        return;
      }
    }
    await saveReminderSettings({ enabled: true });
    if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
      await reconcileNativeNotifications();
    } else {
      await checkDueNotifications();
    }
    showToast("Device notifications are on for task and event reminders.");
  } catch (error) {
    showToast(error.message || "Unable to turn notifications on.");
  }
}
async function loadDashboardData() {
  const token = await getAuthToken();
  if (!token) {
    state.authenticated = false;
    window.location.href = getLoginPath();
    return;
  }
  state.authenticated = true;
  try {
    const payload = await apiRequest("/api/dashboard");
    state.data = {
      ...EMPTY_DATA,
      ...payload.data || {}
    };
    state.user = payload.user || state.user;
    localStorage.setItem(
      "sahraUser",
      JSON.stringify(state.user)
    );
    if (payload.user?.preferences?.theme) {
      applyTheme(payload.user.preferences.theme);
    } else {
      applyTheme(getStoredTheme());
    }
    await loadProgressData(false);
    checkDueNotifications();
    if (!notificationInterval) {
      notificationInterval = setInterval(checkDueNotifications, 3e4);
    }
    renderLayout();
  } catch (error) {
    console.error("Dashboard load failed:", error);
    if (state.data && !state.data.events) {
      state.data = { ...EMPTY_DATA };
    }
    renderLayout();
  }
}
async function loadProgressData(renderWhenDone = true) {
  const year = Number(state.currentYear);
  const month = Number(state.currentMonth) + 1;
  if (!Number.isInteger(year) || !Number.isInteger(month)) return;
  state.progressLoading = true;
  try {
    const payload = await apiRequest(`/api/progress?year=${year}&month=${month}`);
    state.progressData = payload;
  } catch (error) {
    console.warn("Progress load failed:", error.message);
    state.progressData = null;
  } finally {
    state.progressLoading = false;
    if (renderWhenDone && state.view === "progress") renderLayout();
  }
}
async function createResource(type, body) {
  const endpoints = {
    event: "/api/events",
    task: "/api/tasks",
    mood: "/api/moods",
    habit: "/api/habits",
    goal: "/api/goals",
    expense: "/api/expenses",
    subscription: "/api/subscriptions",
    asset: "/api/assets"
  };
  const endpoint = endpoints[type];
  if (!endpoint) return;
  let payload = body;
  if (type === "expense" || type === "subscription") {
    payload = {
      ...body,
      type: "expense",
      amount: Number(body.amount),
      note: String(body.title || body.note || "").trim(),
      category: String(body.category || "General").trim() || "General",
      date: body.date || state.selectedDate,
      paymentMethod: body.paymentMethod || "Cash"
    };
  }
  await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  await loadDashboardData();
  if ((type === "event" || type === "task") && payload.reminder && state.user?.preferences?.reminderSettings?.enabled !== false) {
    await reconcileNativeNotifications();
  }
}
async function addQuickTaskFromInput(input) {
  if (!input) return;
  const title = input.value.trim();
  if (!title) {
    showToast("Please enter a task title.");
    input.focus();
    return;
  }
  try {
    await createResource("task", {
      title,
      description: "",
      date: state.selectedDate,
      time: null,
      priority: "Normal",
      status: "Pending",
      completed: false,
      reminder: "",
      category: "General"
    });
    input.value = "";
    showToast("Task added");
  } catch (error) {
    showToast(error.message || "Unable to add task");
  }
}
function getReminderOffsetMs(reminder) {
  const match = String(reminder || "").toLowerCase().match(/(\d+)\s*(min(?:ute)?s?|hours?|days?)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit.startsWith("day")) return amount * 24 * 60 * 60 * 1e3;
  if (unit.startsWith("hour")) return amount * 60 * 60 * 1e3;
  return amount * 60 * 1e3;
}
function getReminderMoment(item, resource) {
  const time = resource === "event" ? item.startTime : item.time;
  if (!item?.date || !time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const scheduled = /* @__PURE__ */ new Date(`${item.date}T${time}:00`);
  if (Number.isNaN(scheduled.getTime())) return null;
  return new Date(scheduled.getTime() - getReminderOffsetMs(item.reminder));
}
function stableNotificationId(resource, itemId) {
  const source = `${resource}:${itemId || ""}`;
  let hash = resource === "event" ? 17 : 23;
  for (let index = 0; index < source.length; index += 1) {
    hash = hash * 31 + source.charCodeAt(index) | 0;
  }
  return Math.abs(hash) % 2147483646 + 1;
}
function nativeReminderPayload(resource, item) {
  const scheduledAt = getReminderMoment(item, resource);
  const itemId = item.id || item._id;
  if (!scheduledAt || !itemId || scheduledAt.getTime() <= Date.now()) return null;
  const time = resource === "event" ? item.startTime : item.time;
  return {
    id: stableNotificationId(resource, itemId),
    title: "Sahra reminder",
    body: `${resource === "event" ? "Event" : "Task"}: ${item.title}${time ? ` \u2022 ${time}` : ""}`,
    schedule: { at: scheduledAt, allowWhileIdle: true },
    channelId: "sahra-reminders",
    sound: "default",
    extra: { date: item.date, resource, id: String(itemId) }
  };
}
async function reconcileNativeNotifications({ requestPermission = false } = {}) {
  const bridge = window.SAHRA_NOTIFICATIONS;
  if (!bridge?.isNative?.()) return { native: false };
  const preferences = state.user?.preferences?.reminderSettings || {};
  const remindersEnabled = preferences.enabled !== false;
  const notifications = remindersEnabled ? [
    ...preferences.tasksEnabled === false ? [] : state.data.tasks.filter((task) => !task.completed && task.status !== "Completed").map((item) => nativeReminderPayload("task", item)),
    ...preferences.eventsEnabled === false ? [] : state.data.events.map((item) => nativeReminderPayload("event", item))
  ].filter(Boolean) : [];
  try {
    const result = await bridge.reconcile(notifications, { requestPermission });
    if (requestPermission && result.permission !== "granted") {
      showToast("Notifications are disabled. You can enable them in your device settings.");
    } else if (requestPermission && result.scheduled) {
      showToast(`${result.scheduled} reminder${result.scheduled === 1 ? "" : "s"} registered on this device.`);
    }
    return result;
  } catch (error) {
    console.warn("Native reminder reconciliation failed:", error.message);
    if (requestPermission) showToast("Sahra could not register this device reminder.");
    return { native: true, error };
  }
}
async function showSahraNotification(resource, item) {
  const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
  const time = resource === "event" ? item.startTime : item.time;
  const options = {
    body: `${resource === "event" ? "Event" : "Task"}: ${item.title}${time ? ` \u2022 ${time}` : ""}`,
    icon: "/images/sahra.png",
    badge: "/images/sahra.png",
    tag: `sahra-${resource}-${item.id || item._id}`,
    data: { date: item.date, resource, id: item.id || item._id }
  };
  if (registration?.showNotification) {
    await registration.showNotification("Sahra reminder", options);
    return;
  }
  const notification = new Notification("Sahra reminder", options);
  notification.onclick = () => {
    window.focus();
    window.location.href = `/dashboard?date=${encodeURIComponent(item.date)}`;
  };
}
async function checkDueNotifications() {
  const preferences = state.user?.preferences?.reminderSettings || {};
  if (preferences.enabled === false) return;
  if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
    await reconcileNativeNotifications();
    return;
  }
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const now = Date.now();
  const resources = [
    ...preferences.tasksEnabled === false ? [] : state.data.tasks.map((item) => ({ resource: "task", item })),
    ...preferences.eventsEnabled === false ? [] : state.data.events.map((item) => ({ resource: "event", item }))
  ];
  for (const { resource, item } of resources) {
    if (item.reminderNotifiedAt) continue;
    const dueAt = getReminderMoment(item, resource);
    if (!dueAt || now < dueAt.getTime() || now - dueAt.getTime() > 2 * 60 * 1e3) continue;
    try {
      const response = await apiRequest("/api/notifications/mark-sent", {
        method: "POST",
        body: JSON.stringify({ resource, id: item.id || item._id })
      });
      if (response.sent) await showSahraNotification(resource, item);
    } catch (error) {
      console.warn("Reminder notification failed:", error.message);
    }
  }
}
async function loadSelectedDateData(dateString) {
  if (!state.authenticated || state.calendarCache.has(dateString)) return;
  state.calendarCache.add(dateString);
  try {
    const payload = await apiRequest(`/api/calendar/${dateString}`);
    state.calendarCache.add(dateString);
    const nextTasks = payload.tasks || [];
    const nextEvents = payload.events || [];
    const nextMoods = payload.moods || [];
    state.data.tasks = [
      ...state.data.tasks.filter((task) => task.date !== dateString),
      ...nextTasks
    ];
    state.data.events = [
      ...state.data.events.filter((event) => event.date !== dateString),
      ...nextEvents
    ];
    state.data.moods = [
      ...state.data.moods.filter((mood) => mood.date !== dateString),
      ...nextMoods
    ];
  } catch (error) {
    state.calendarCache.delete(dateString);
    console.warn("Selected day data refresh failed:", error.message);
  }
}
async function setSelectedDate(dateString) {
  state.selectedDate = dateString;
  const [year, month, day] = dateString.split("-").map(Number);
  state.currentYear = year;
  state.currentMonth = month - 1;
  await loadSelectedDateData(dateString);
  renderLayout();
}
function shiftMonth(offset) {
  const nextDate = new Date(state.currentYear, state.currentMonth + offset, 1);
  state.currentYear = nextDate.getFullYear();
  state.currentMonth = nextDate.getMonth();
  renderLayout();
}
function isFutureDate(dateString) {
  if (!dateString) return false;
  try {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const target = /* @__PURE__ */ new Date(`${dateString}T00:00:00`);
    return target > today;
  } catch (error) {
    return false;
  }
}
function isPastDate(dateString) {
  if (!dateString) return false;
  try {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const target = /* @__PURE__ */ new Date(`${dateString}T00:00:00`);
    return target < today;
  } catch (error) {
    return false;
  }
}
function renderSahraLogo(size = 52) {
  return `
    <img
      class="sahra-logo"
      src="/images/sahra.png"
      alt="Sahra logo"
      width="${size}"
      height="${size}"
    />
  `;
}
function openEntryModal(type = "event") {
  if (type === "mood" && isFutureDate(state.selectedDate)) {
    window.alert("Future dates cannot have a mood.");
    return;
  }
  if ((type === "event" || type === "task") && isPastDate(state.selectedDate)) {
    window.alert("Tasks and events can only be added for today or future dates.");
    return;
  }
  state.entryModalOpen = true;
  state.entryDraft = {
    type,
    title: "",
    description: "",
    date: state.selectedDate,
    startTime: "09:00",
    endTime: "10:00",
    category: "General",
    reminder: "",
    priority: "Normal",
    status: "Pending",
    mood: "\u{1F60A}",
    note: "",
    goal: 1,
    frequency: "Daily",
    target: 30,
    current: 0,
    duration: "30 days",
    time: "19:00",
    amount: "",
    renewalDate: state.selectedDate,
    content: "",
    tags: ""
  };
  renderLayout();
}
function setView(nextView) {
  if (state.view !== nextView) {
    if (state.view && state.view !== "home") {
      state.navigationHistory.push(state.view);
    }
    state.view = nextView;
  }
  renderLayout();
}
function goBackFromView() {
  if (state.navigationHistory.length > 0) {
    state.view = state.navigationHistory.pop();
  } else {
    state.view = "home";
  }
  renderLayout();
}
function closeEntryModal() {
  state.entryModalOpen = false;
  state.entryDraft = null;
  renderLayout();
}
window.sahraHandleNativeBack = () => {
  if (state.entryModalOpen) {
    closeEntryModal();
    return true;
  }
  if (state.profileModalOpen) {
    state.profileModalOpen = false;
    state.profileEditing = false;
    renderLayout();
    return true;
  }
  if (state.showFinanceResetConfirm) {
    state.showFinanceResetConfirm = false;
    renderLayout();
    return true;
  }
  if (state.financeDetail) {
    state.financeDetail = null;
    renderLayout();
    return true;
  }
  if (state.calendarDetail) {
    state.calendarDetail = null;
    renderLayout();
    return true;
  }
  if (state.moreMenuOpen || state.menuOpen || state.moodPickerOpen) {
    state.moreMenuOpen = false;
    state.menuOpen = false;
    state.moodPickerOpen = false;
    renderLayout();
    return true;
  }
  if (state.view !== "home") {
    goBackFromView();
    return true;
  }
  return false;
};
function renderProfileModal() {
  if (!state.profileModalOpen) return "";
  const user = state.user || {};
  const profile = user.profile || {};
  const draft = state.profileDraft || {
    name: user.name || "",
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : ""
  };
  const isEditing = Boolean(state.profileEditing);
  const successMessage = state.profileSuccessMessage || "";
  const formattedDob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not set";
  const hasPhone = Boolean(profile.phone);
  return `
    <div class="entry-modal-backdrop visible" style="z-index: 2000;">
      <div class="entry-modal" style="width: min(100%, 390px); background: var(--panel-bg); border-color: var(--panel-border); padding: 20px;">
        <div class="entry-modal-header" style="margin-bottom: 14px;">
          <h3 style="font-size: 1.2rem; color: var(--text);">User Profile</h3>
          <button class="entry-close" type="button" data-action="close-profile-modal">\u2715</button>
        </div>

        ${successMessage ? `<div style="background: rgba(97, 245, 176, 0.15); color: #61f5b0; padding: 8px 12px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 12px; text-align: center;">${successMessage}</div>` : ""}

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div class="profile-avatar large" style="width: 64px; height: 64px; font-size: 1.8rem; margin: 0; background: linear-gradient(135deg, var(--purple), var(--cyan)); color: white; display: grid; place-items: center; border-radius: 20px; font-weight: 800;">
            ${(user.name || "S").charAt(0).toUpperCase()}
          </div>
          <div style="overflow: hidden;">
            <strong style="display: block; font-size: 1.2rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name || "Sahra User"}</strong>
            <span style="color: var(--muted); font-size: 0.82rem; word-break: break-all;">${user.email || ""}</span>
          </div>
        </div>

        ${isEditing ? `
          <div style="display: grid; gap: 12px;">
            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Full Name
              <input class="profile-input" data-field="name" value="${(draft.name || "").replace(/"/g, "&quot;")}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Date of Birth
              <input class="profile-input" data-field="dateOfBirth" type="date" value="${draft.dateOfBirth || ""}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
              Email (Cannot be edited)
              <input type="email" disabled value="${user.email || ""}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
            </label>

            ${hasPhone ? `
              <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
                Phone Number (Cannot be edited)
                <input type="text" disabled value="${profile.phone}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
              </label>
            ` : ""}

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
              <button class="secondary-btn" type="button" data-action="profile-cancel-edit" style="padding: 10px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06); color: var(--text); cursor: pointer;">Cancel</button>
              <button class="primary-btn compact-btn" type="button" data-action="profile-save" style="padding: 10px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #9d82ff, #68d5ff); color: white; font-weight: 700; cursor: pointer;">Save</button>
            </div>
          </div>
        ` : `
          <div style="display: grid; gap: 8px; margin-bottom: 16px;">
            <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
              <span>Date of Birth</span>
              <strong style="color: var(--text);">${formattedDob}</strong>
            </div>

            <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
              <span>Email</span>
              <strong style="color: var(--text);">${user.email || "Not set"}</strong>
            </div>

            ${hasPhone ? `
              <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
                <span>Phone</span>
                <strong style="color: var(--text);">${profile.phone}</strong>
              </div>
            ` : ""}
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="secondary-btn" type="button" data-action="close-profile-modal" style="padding: 10px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06); color: var(--text); cursor: pointer;">Close</button>
            <button class="primary-btn compact-btn" type="button" data-action="profile-start-edit" style="padding: 10px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #9d82ff, #68d5ff); color: white; font-weight: 700; cursor: pointer;">Edit Profile</button>
          </div>
        `}
      </div>
    </div>
  `;
}
function renderEntryModal() {
  if (!state.entryModalOpen || !state.entryDraft) return "";
  const moodOptions = ["\u{1F60A}", "\u{1F610}", "\u{1F622}", "\u{1F621}", "\u{1F634}", "\u{1F525}", "\u{1F60D}"];
  const draft = state.entryDraft;
  const modalTitle = draft.type === "task" ? "Add Task" : draft.type === "mood" ? "Add Mood" : draft.type === "note" ? "Add Note" : "Add Event";
  return `
    <div class="entry-modal-backdrop visible">
      <div class="entry-modal">
        <div class="entry-modal-header">
          <h3>${modalTitle}</h3>
          <button class="entry-close" type="button" data-action="close-entry-modal">\u2715</button>
        </div>

        <div class="entry-form">

          <!-- 1. STRICTLY NOTE FORM (Only Title & Description) -->
          ${draft.type === "note" ? `
            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(draft.title || "").replace(/"/g, "&quot;")}" placeholder="e.g., My Grocery List" />
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="6" data-entry-field="description" placeholder="Type your note, password, or list here...">${(draft.description || draft.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
            </label>
          ` : ""}

          <!-- 2. TASK FORM -->
          ${draft.type === "task" ? `
            <label class="entry-field">
              <span>Task Name</span>
              <input type="text" data-entry-field="title" value="${(draft.title || "").replace(/"/g, "&quot;")}" placeholder="Study JavaScript" />
            </label>
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" min="${formatDateKey2(/* @__PURE__ */ new Date())}" value="${draft.date || state.selectedDate}" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Time</span>
                <input type="time" data-entry-field="time" value="${draft.time || "19:00"}" />
              </label>
              <label class="entry-field">
                <span>Priority</span>
                <select data-entry-field="priority">
                  <option value="Low" ${draft.priority === "Low" ? "selected" : ""}>Low</option>
                  <option value="Normal" ${draft.priority === "Normal" ? "selected" : ""}>Normal</option>
                  <option value="High" ${draft.priority === "High" ? "selected" : ""}>High</option>
                </select>
              </label>
            </div>
            <label class="entry-field">
              <span>Reminder</span>
              <select data-entry-field="reminder">
                <option value="" ${!draft.reminder ? "selected" : ""}>No reminder</option>
                <option value="5 minutes before" ${draft.reminder === "5 minutes before" ? "selected" : ""}>5 minutes before</option>
                <option value="10 minutes before" ${draft.reminder === "10 minutes before" ? "selected" : ""}>10 minutes before</option>
                <option value="15 minutes before" ${draft.reminder === "15 minutes before" ? "selected" : ""}>15 minutes before</option>
                <option value="30 minutes before" ${draft.reminder === "30 minutes before" ? "selected" : ""}>30 minutes before</option>
                <option value="1 hour before" ${draft.reminder === "1 hour before" ? "selected" : ""}>1 hour before</option>
              </select>
            </label>
          ` : ""}

          <!-- 3. EVENT FORM -->
          ${draft.type === "event" ? `
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" min="${formatDateKey2(/* @__PURE__ */ new Date())}" value="${draft.date || state.selectedDate}" />
            </label>
            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(draft.title || "").replace(/"/g, "&quot;")}" placeholder="Enter title here" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Start</span>
                <input type="time" data-entry-field="startTime" value="${draft.startTime || "09:00"}" />
              </label>
              <label class="entry-field">
                <span>End</span>
                <input type="time" data-entry-field="endTime" value="${draft.endTime || "10:00"}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Category</span>
              <input type="text" data-entry-field="category" value="${(draft.category || "General").replace(/"/g, "&quot;")}" placeholder="General" />
            </label>
            <label class="entry-field">
              <span>Reminder</span>
              <select data-entry-field="reminder">
                <option value="" ${!draft.reminder ? "selected" : ""}>No reminder</option>
                <option value="5 minutes before" ${draft.reminder === "5 minutes before" ? "selected" : ""}>5 minutes before</option>
                <option value="10 minutes before" ${draft.reminder === "10 minutes before" ? "selected" : ""}>10 minutes before</option>
                <option value="15 minutes before" ${draft.reminder === "15 minutes before" ? "selected" : ""}>15 minutes before</option>
                <option value="30 minutes before" ${draft.reminder === "30 minutes before" ? "selected" : ""}>30 minutes before</option>
                <option value="1 hour before" ${draft.reminder === "1 hour before" ? "selected" : ""}>1 hour before</option>
              </select>
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(draft.description || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
            </label>
          ` : ""}

          <!-- 4. ASSET FORM -->
          ${draft.type === "asset" ? `
            <label class="entry-field">
              <span>Title / Name</span>
              <input type="text" data-entry-field="title" value="${(draft.title || "").replace(/"/g, "&quot;")}" placeholder="e.g., Round Robin Snippet" />
            </label>
            <label class="entry-field">
              <span>Content / Code / Prompt</span>
              <textarea rows="6" data-entry-field="content" placeholder="Paste your reference material here...">${(draft.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
            </label>
          ` : ""}

          <!-- 5. EXPENSE FORM -->
          ${draft.type === "expense" || draft.type === "subscription" ? `
            <label class="entry-field">
              <span>${draft.type === "expense" ? "Expense Name" : "Service Name"}</span>
              <input type="text" data-entry-field="title" value="${(draft.title || "").replace(/"/g, "&quot;")}" placeholder="e.g., Server Hosting" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Amount ($)</span>
                <input type="number" step="0.01" min="0" data-entry-field="amount" value="${draft.amount || ""}" placeholder="0.00" />
              </label>
              <label class="entry-field">
                <span>${draft.type === "expense" ? "Date" : "Next Renewal"}</span>
                <input type="date" data-entry-field="${draft.type === "expense" ? "date" : "renewalDate"}" value="${draft.type === "expense" ? draft.date || state.selectedDate : draft.renewalDate || state.selectedDate}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Category</span>
              <input type="text" data-entry-field="category" value="${(draft.category || "").replace(/"/g, "&quot;")}" placeholder="e.g., Software" />
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(draft.description || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
            </label>
          ` : ""}

          <!-- 6. MOOD & HABIT & GOALS (Abbreviated to keep it clean) -->
          ${draft.type === "mood" ? `
            <div class="mood-picker-wrap">
              <span class="mood-picker-label">Mood</span>
              <div class="mood-picker-grid">
                ${moodOptions.map((mood) => `
                  <button type="button" class="mood-option ${draft.mood === mood ? "selected" : ""}" data-entry-field="mood" data-entry-value="${mood}">${mood}</button>
                `).join("")}
              </div>
            </div>
            <label class="entry-field">
              <span>Note</span>
              <textarea rows="3" data-entry-field="note" placeholder="Add a quick note">${(draft.note || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
            </label>
          ` : ""}

          <div class="entry-form-actions">
            <button class="secondary-btn" type="button" data-action="close-entry-modal">Cancel</button>
            <button class="primary-btn compact-btn" type="button" data-action="save-entry">${draft.type === "task" ? "Add Task" : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderHomePage() {
  const today = /* @__PURE__ */ new Date();
  const monthLabel = new Date(
    state.currentYear,
    state.currentMonth,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStart = new Date(state.currentYear, state.currentMonth, 1);
  const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1);
  const offset = firstDayOfMonth.getDay();
  const totalDaysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
  const entriesByDate = {
    events: new Set((state.data.events || []).map((event) => event.date)),
    tasks: new Set((state.data.tasks || []).map((task) => task.date)),
    moods: new Set((state.data.moods || []).map((mood) => mood.date))
  };
  const calendarDays = [];
  for (let i = 0; i < offset; i += 1) {
    calendarDays.push({ value: totalDaysInPrevMonth - offset + i + 1, empty: true });
  }
  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    const dateValue = new Date(state.currentYear, state.currentMonth, day);
    const iso = formatDateKey2(dateValue);
    const dayEvents = entriesByDate.events.has(iso);
    const dayTasks = entriesByDate.tasks.has(iso);
    const dayMood = entriesByDate.moods.has(iso);
    calendarDays.push({
      value: day,
      empty: false,
      active: iso === state.selectedDate,
      iso,
      hasEvent: dayEvents,
      hasTask: dayTasks,
      hasMood: dayMood
    });
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ value: calendarDays.length - totalDaysInMonth - offset + 1, empty: true });
  }
  const userName = state.user?.name ? state.user.name.split(" ")[0] : "Friend";
  const tasks = state.data.tasks || [];
  const taskPreview = tasks.slice(0, 3);
  const completedTasks = tasks.filter((task) => task.completed || task.status === "Completed").length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks ? Math.round(completedTasks / totalTasks * 100) : 0;
  const deviceNotificationsEnabled = areDeviceNotificationsEnabled();
  const isLightTheme = state.theme === "light";
  return `
    <section class="screen home-screen">
      <section class="hero glass-card page-fixed-header">
        <div class="hero-top">
          <div class="brand">
            <div class="brand-mark">${renderSahraLogo(52)}</div>
            <div class="brand-text">
              <h1>Sahra</h1>
              <p>LIFE CALENDAR</p>
            </div>
          </div>

          <div class="menu-wrap">
            <button class="menu-button" type="button" aria-label="Open menu">\u22EE</button>
            <div class="menu-panel ${state.menuOpen ? "open" : "hidden"}">
              <button class="menu-item settings-toggle-item theme-menu-item" type="button" data-menu-action="toggle-theme" role="switch" aria-checked="${isLightTheme}" aria-label="${isLightTheme ? "Switch to dark mode" : "Switch to light mode"}">
                <span class="settings-toggle-icon" aria-hidden="true">${isLightTheme ? "\u2600\uFE0F" : "\u{1F319}"}</span>
                <span class="settings-toggle-copy"><strong>Appearance</strong><small>${isLightTheme ? "Light mode" : "Dark mode"}</small></span>
                <span class="settings-switch ${isLightTheme ? "is-on" : ""}" aria-hidden="true"><span></span></span>
              </button>
              <button class="menu-item" type="button" data-menu-action="profile"><span>\u{1F464}</span> Profile</button>
              <button class="menu-item settings-toggle-item notification-menu-item" type="button" data-menu-action="notifications" role="switch" aria-checked="${deviceNotificationsEnabled}" aria-label="Device notifications ${deviceNotificationsEnabled ? "on" : "off"}">
                <span class="settings-toggle-icon" aria-hidden="true">\u{1F514}</span>
                <span class="settings-toggle-copy"><strong>Notifications</strong><small>${deviceNotificationsEnabled ? "Reminders are on" : "Reminders are off"}</small></span>
                <span class="notification-switch settings-switch ${deviceNotificationsEnabled ? "is-on" : ""}" aria-hidden="true"><span></span></span>
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item danger" type="button" data-menu-action="logout"><span>\u{1F6AA}</span> Logout</button>
            </div>
          </div>
        </div>
      </section>

      <section class="glass-card layout-card date-weather-card">
        <div class="date-weather-row">
          <div>
            <div class="date-weather-day">${today.toLocaleDateString("en-IN", { weekday: "long" })}</div>
            <div class="date-weather-date">${today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <div class="weather-icon">\u26C5</div>
        </div>
        <div class="date-weather-temp-wrap">
          <div class="temp-value">27\xB0<span>C</span></div>
          <div class="weather-meta">Partly Cloudy</div>
        </div>
      </section>

      <section class="glass-card layout-card calendar-card">
        <div class="calendar-header">
          <h3>${monthLabel}</h3>
          <div class="calendar-actions">
            <button class="calendar-arrow" type="button" data-action="prev-month" aria-label="Previous month">\u2039</button>
            <button class="calendar-arrow" type="button" data-action="next-month" aria-label="Next month">\u203A</button>
            <button class="today-button" type="button" data-action="today">Today</button>
          </div>
        </div>

        <div class="calendar-grid">
          ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
          ${calendarDays.map((day) => {
    const indicators = [];
    if (day.hasEvent) indicators.push('<span class="mini-indicator event"></span>');
    if (day.hasTask) indicators.push('<span class="mini-indicator task"></span>');
    if (day.hasMood) indicators.push('<span class="mini-indicator mood"></span>');
    return `
              <button
                class="calendar-day ${day.empty ? "dim" : ""} ${day.active ? "selected" : ""}"
                type="button"
                data-date="${day.iso || ""}"
                ${day.empty ? "disabled" : ""}
              >
                <span>${day.value}</span>
                ${indicators.length ? `<span class="calendar-indicators">${indicators.join("")}</span>` : ""}
              </button>
            `;
  }).join("")}
        </div>

        <div class="event-row">
          <div class="event-status">
            <span class="status-dot"></span>
            <span>${state.data.events.filter((event) => event.date === state.selectedDate).length ? `Selected day has ${state.data.events.filter((event) => event.date === state.selectedDate).length} event(s)` : "No events on this day"}</span>
          </div>
          <div class="event-actions">
            <button class="show-event" type="button" data-action="show-selected-day">Show</button>
            <button class="add-event" type="button" data-action="open-add-entry" data-type="event">+ Add Event</button>
          </div>
        </div>
      </section>

      <section class="glass-card layout-card todo-card">
        <div class="card-header compact">
          <h3>To Do List</h3>
          <button class="small-btn" type="button" data-view="tasks">+ Add Task</button>
        </div>

        ${taskPreview.length ? `
          <div class="mini-todo-list">
            ${taskPreview.map((task) => `
              <div class="mini-todo-item">
                <span class="mini-check ${task.completed || task.status === "Completed" ? "done" : ""}">${task.completed || task.status === "Completed" ? "\u2713" : ""}</span>
                <span>${task.title}</span>
              </div>
            `).join("")}
          </div>
        ` : `
          <div class="empty-task-state">
            <div class="task-icon">\u2713</div>
            <div class="task-copy">
              <strong>No tasks yet.</strong>
              <span>Add a task to stay productive!</span>
            </div>
          </div>
        `}
      </section>

      <section class="glass-card layout-card progress-card">
        <div class="card-header compact">
          <h3>Today's Progress</h3>
          <span class="chip">${progressPercent}%</span>
        </div>

        <div class="progress-block">
          <div class="progress-row">
            <div class="progress-label">
              <span>Goal completion</span>
              <strong>${progressPercent}%</strong>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${progressPercent}%"></div></div>
          </div>
        </div>

        <div class="progress-footer">${completedTasks} / ${totalTasks} tasks complete</div>
      </section>
    </section>
  `;
}
function renderProgressPage() {
  const tasks = Array.isArray(state.data.tasks) ? state.data.tasks : [];
  const events = Array.isArray(state.data.events) ? state.data.events : [];
  const habits = Array.isArray(state.data.habits) ? state.data.habits : [];
  const goals = Array.isArray(state.data.goals) ? state.data.goals : [];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const currentMonthName = months[state.currentMonth] || months[(/* @__PURE__ */ new Date()).getMonth()];
  const todayIso = formatDateKey2(/* @__PURE__ */ new Date());
  const monthlyTransactions = (Array.isArray(state.financeData) ? state.financeData : []).filter((transaction) => {
    if (!transaction?.date) return false;
    const transactionDate = new Date(transaction.date);
    if (Number.isNaN(transactionDate.getTime())) return false;
    return transactionDate.getFullYear() === Number(state.currentYear) && transactionDate.getMonth() === Number(state.currentMonth);
  });
  const monthlyIncome = monthlyTransactions.filter(
    (transaction) => String(transaction.type || "").toLowerCase() === "income"
  ).reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );
  const monthlyExpense = monthlyTransactions.filter(
    (transaction) => String(transaction.type || "").toLowerCase() === "expense"
  ).reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0
  );
  const monthlyBalance = monthlyIncome - monthlyExpense;
  const monthTasks = tasks.filter((task) => {
    if (!task.date) return false;
    const parts = String(task.date).slice(0, 10).split("-");
    if (parts.length < 3) return false;
    const taskYear = Number(parts[0]);
    const taskMonth = Number(parts[1]) - 1;
    return taskYear === Number(state.currentYear) && taskMonth === Number(state.currentMonth);
  });
  const fallbackCompletedTasks = monthTasks.filter(
    (task) => task.completed || task.status === "Completed"
  ).length;
  const fallbackPendingTasks = monthTasks.filter(
    (task) => !task.completed && task.status !== "Completed"
  ).length;
  const fallbackOverdueTasks = monthTasks.filter((task) => {
    const completed = task.completed || task.status === "Completed";
    if (completed) return false;
    return task.status === "Overdue" || task.date && String(task.date).slice(0, 10) < todayIso;
  }).length;
  const fallbackTotalTasks = monthTasks.length;
  const monthEvents = events.filter((event) => {
    if (!event.date) return false;
    const parts = String(event.date).slice(0, 10).split("-");
    if (parts.length < 3) return false;
    const eventYear = Number(parts[0]);
    const eventMonth = Number(parts[1]) - 1;
    return eventYear === Number(state.currentYear) && eventMonth === Number(state.currentMonth);
  });
  const fallbackActivity = [
    ...monthTasks.map((task) => ({
      type: task.completed || task.status === "Completed" ? "task-complete" : "task-pending",
      label: task.completed || task.status === "Completed" ? `Completed task \u201C${task.title}\u201D` : `Task \u201C${task.title}\u201D`,
      timeLabel: task.date ? formatFriendlyDate(task.date) : "This month"
    })),
    ...monthEvents.map((event) => ({
      type: "event",
      label: `Event \u201C${event.title}\u201D`,
      timeLabel: event.date ? formatFriendlyDate(event.date) : "This month"
    })),
    ...habits.slice(0, 2).map((habit) => ({
      type: "habit",
      label: `Habit \u201C${habit.name}\u201D`,
      timeLabel: habit.frequency || "Daily"
    })),
    ...goals.slice(0, 2).map((goal) => ({
      type: "goal",
      label: `Goal \u201C${goal.title}\u201D`,
      timeLabel: goal.status || "Active"
    }))
  ];
  const selectedProgress = state.progressData?.period?.year === Number(state.currentYear) && state.progressData?.period?.month === Number(state.currentMonth) + 1 ? state.progressData : null;
  const stats = selectedProgress?.stats || {
    totalTasks: fallbackTotalTasks,
    completedTasks: fallbackCompletedTasks,
    pendingTasks: fallbackPendingTasks,
    overdueTasks: fallbackOverdueTasks,
    completionPercent: fallbackTotalTasks > 0 ? Math.round(
      fallbackCompletedTasks / fallbackTotalTasks * 100
    ) : 0
  };
  const totalTasks = Number(stats.totalTasks || 0);
  const completedTasks = Number(stats.completedTasks || 0);
  const pendingTasks = Number(stats.pendingTasks || 0);
  const overdueTasks = Number(stats.overdueTasks || 0);
  const completionPercent = Math.max(
    0,
    Math.min(
      100,
      Number(stats.completionPercent || 0)
    )
  );
  const activityItems = (selectedProgress?.activity || fallbackActivity).map((item) => ({
    ...item,
    timeLabel: item.timeLabel || formatActivityTime(item.occurredAt)
  })).slice(0, 10);
  const pickerOpenClass = state.progressPickerOpen ? "open" : "";
  return `
    <section class="screen dashboard-screen">

      <!-- TOP BAR -->

      <header class="dashboard-topbar page-fixed-header">

        <button
          class="back-button"
          type="button"
          data-action="back-home"
        >
          \u2190 Back
        </button>

        <!-- MONTH SELECTOR -->

        <div class="month-picker-wrapper ${pickerOpenClass}">

          <button
            class="month-picker"
            type="button"
            data-action="toggle-progress-picker"
            aria-label="Select month and year"
            aria-expanded="${state.progressPickerOpen ? "true" : "false"}"
          >

            <span class="picker-icon">
              \u{1F5D3}\uFE0F
            </span>

            <span class="picker-label">

              <span class="picker-month">
                ${currentMonthName}
              </span>

              <span class="picker-year">
                ${state.currentYear}
              </span>

            </span>

            <span class="caret">
              \u2304
            </span>

          </button>

          <!-- BACKDROP -->

          <div
            class="month-picker-backdrop ${pickerOpenClass}"
            data-action="close-progress-picker"
          ></div>

          <!-- PICKER -->

          <div
            class="month-picker-popover ${pickerOpenClass}"
            role="dialog"
            aria-modal="true"
            aria-label="Month and year picker"
          >

            <div class="month-picker-header">

              <button
                class="month-picker-nav"
                type="button"
                data-action="progress-year-change"
                data-direction="-1"
                aria-label="Previous year"
              >
                \u2039
              </button>

              <div class="year-selector-row">

                <button
                  class="year-chip"
                  type="button"
                  data-action="progress-year-set"
                  data-year="${state.currentYear - 1}"
                >
                  ${state.currentYear - 1}
                </button>

                <span
                  class="year-chip active"
                  aria-current="true"
                >
                  ${state.currentYear}
                </span>

                <button
                  class="year-chip"
                  type="button"
                  data-action="progress-year-set"
                  data-year="${state.currentYear + 1}"
                >
                  ${state.currentYear + 1}
                </button>

              </div>

              <button
                class="month-picker-nav"
                type="button"
                data-action="progress-year-change"
                data-direction="1"
                aria-label="Next year"
              >
                \u203A
              </button>

            </div>

            <div class="month-picker-grid">

              ${months.map(
    (month, index) => `
                    <button
                      class="month-option ${index === state.currentMonth ? "active" : ""}"
                      type="button"
                      data-progress-month="${index}"
                      aria-pressed="${index === state.currentMonth ? "true" : "false"}"
                    >
                      ${month}
                    </button>
                  `
  ).join("")}

            </div>

          </div>

        </div>

      </header>

      <!-- HERO -->

      <section class="glass-card dashboard-hero">

        <div class="hero-copy-block">

          <h2>
            ${totalTasks > 0 ? completionPercent >= 80 ? `You're doing great! <span class="rocket">\u{1F680}</span>` : completionPercent >= 50 ? `Steady progress! <span class="rocket">\u2728</span>` : `Keep going! <span class="rocket">\u{1F4AA}</span>` : `Ready for ${currentMonthName}! <span class="rocket">\u{1F3AF}</span>`}
          </h2>

          <p>
            ${totalTasks > 0 ? `${completionPercent}% of your tasks are complete.` : `No tasks logged for ${currentMonthName} ${state.currentYear} yet.`}
          </p>

        </div>

        <div class="hero-quote">
          \u201CSmall steps<br>
          every day lead<br>
          to big results.\u201D
        </div>

      </section>

      <!-- OVERALL PROGRESS -->

      <section class="glass-card progress-panel">

        <div class="panel-header">

          <h3>
            Overall Progress
          </h3>

      

        </div>

        <div class="progress-grid">

          <div class="donut-wrap">

            <div
              class="donut-chart"
              style="
                background:
                  conic-gradient(
                    from 220deg,
                    #7ad8ff 0 ${completionPercent}%,
                    #9f7cff ${completionPercent}% 100%
                  );
              "
            >

              <div class="donut-center">

                <strong>
                  ${completionPercent}%
                </strong>

                <span>
                  Completed
                </span>

              </div>

            </div>

          </div>

          <div class="progress-metrics">

            <div class="metric-item">

              <span class="metric-icon success">
                \u2713
              </span>

              <span class="metric-label">
                Tasks Completed
              </span>

              <strong>
                ${completedTasks}
              </strong>

            </div>

            <div class="metric-item">

              <span class="metric-icon pending">
                \u25D4
              </span>

              <span class="metric-label">
                Pending
              </span>

              <strong>
                ${pendingTasks}
              </strong>

            </div>

            <div class="metric-item">

              <span class="metric-icon overdue">
                \u2022
              </span>

              <span class="metric-label">
                Overdue
              </span>

              <strong>
                ${overdueTasks}
              </strong>

            </div>

          </div>

          </div>

        </div>

      </section>

            <!-- MONTHLY FINANCE -->

      <section class="glass-card monthly-finance-panel">

        <div class="panel-header">
          <h3>Monthly Finance</h3>

          <span class="finance-month-label">
            ${currentMonthName} ${state.currentYear}
          </span>
        </div>

        <div class="monthly-finance-grid">

          <div class="finance-summary-card income-card">

            <div class="finance-summary-icon">
              \u2197
            </div>

            <div class="finance-summary-label">
              Income
            </div>

            <strong>
              \u20B9${monthlyIncome.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}
            </strong>

          </div>

          <div class="finance-summary-card expense-card">

            <div class="finance-summary-icon">
              \u2198
            </div>

            <div class="finance-summary-label">
              Expense
            </div>

            <strong>
              \u20B9${monthlyExpense.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}
            </strong>

          </div>

        </div>

        <div class="finance-net-row">

          <span>Net Balance</span>

          <strong class="${monthlyBalance >= 0 ? "positive" : "negative"}">
            ${monthlyBalance >= 0 ? "+" : "-"}\u20B9${Math.abs(monthlyBalance).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}
          </strong>

        </div>

      </section>

      <!-- RECENT ACTIVITY -->

      <section class="glass-card activity-panel">

        <div class="panel-header">

          <h3>
            Recent Activity
          </h3>

        </div>

        <div class="activity-list">

          ${activityItems.length ? activityItems.map(
    (item) => `
                      <div class="activity-item">

                        <span
                          class="
                            activity-dot
                            ${item.type.includes("task") ? "blue" : item.type === "event" ? "purple" : item.type === "habit" ? "green" : "red"}
                          "
                        >
                          ${item.type === "task-complete" ? "\u2713" : item.type === "event" ? "\u25A3" : item.type === "habit" ? "\u25CC" : "\u25CE"}
                        </span>

                        <span class="activity-text">
                          ${escapeHtml5(item.label)}
                        </span>

                        <span class="activity-time">
                          ${escapeHtml5(item.timeLabel)}
                        </span>

                      </div>
                    `
  ).join("") : `
                <div class="activity-item">

                  <span class="activity-text">
                    No activity recorded for
                    ${currentMonthName}
                    ${state.currentYear} yet.
                  </span>

                </div>
              `}

        </div>

      </section>

    </section>
  `;
}
var isRendering = false;
var lastAssistantMessageCount = null;
var lastAssistantLoadingState = null;
var lastRenderedView = null;
function renderLayout() {
  if (isRendering) return;
  isRendering = true;
  const app = document.getElementById("app");
  const viewChanged = state.view !== lastRenderedView;
  lastRenderedView = state.view;
  if (state.view === "calendar" && state.authenticated && !state.calendarCache.has(state.selectedDate)) {
    loadSelectedDateData(state.selectedDate);
  }
  let content = renderHomePage();
  if (state.view === "calendar") {
    content = renderCalendarPage(state);
  } else if (state.view === "finance") {
    content = renderFinancePage(state);
  } else if (state.view === "vault") {
    content = renderVaultPage(state);
  } else if (state.view === "mood") {
    content = renderMoodPage(state);
  } else if (state.view === "tasks") {
    content = renderTasksPage(state);
  } else if (state.view === "habits") {
    content = renderHabitsPage(state);
  } else if (state.view === "goals") {
    content = renderGoalsPage(state);
  } else if (state.view === "assistant") {
    content = renderAssistantPage(state);
  } else if (state.view === "menu") {
    content = renderMenuPage();
  } else if (state.view === "progress" || state.view === "more") {
    content = renderProgressPage();
  }
  app.innerHTML = content + renderEntryModal() + renderProfileModal();

  // Follow the newest assistant message after a conversation update.
  const assistantMessageCount = Array.isArray(state.assistantMessages) ? state.assistantMessages.length : 0;
  const assistantLoadingNow = Boolean(state.assistantLoading);
  const assistantConversationChanged = state.view === "assistant" && !viewChanged && (
    assistantMessageCount !== lastAssistantMessageCount ||
    assistantLoadingNow !== lastAssistantLoadingState
  );
  lastAssistantMessageCount = assistantMessageCount;
  lastAssistantLoadingState = assistantLoadingNow;
  if (assistantConversationChanged) {
    requestAnimationFrame(() => {
      if (state.view !== "assistant") return;
      const currentApp = document.getElementById("app");
      if (!currentApp) return;
      currentApp.scrollTo({
        top: Math.max(0, currentApp.scrollHeight - currentApp.clientHeight),
        behavior: "smooth"
      });
    });
  }
  if (viewChanged) {
    app.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector(".bottom-nav")?.classList.remove("scroll-hidden");
  }
  syncKeyboardViewport();
  const menuSubPages = ["menu", "tasks", "vault", "finance", "progress", "habits", "goals"];
  document.querySelectorAll(".bottom-nav .nav-item").forEach((button) => {
    const isMenuButton = button.dataset.action === "toggle-more-menu";
    if (isMenuButton) {
      button.classList.toggle("active", state.moreMenuOpen || menuSubPages.includes(state.view));
    } else {
      button.classList.toggle("active", button.dataset.view === state.view && !state.moreMenuOpen);
    }
  });
  requestAnimationFrame(() => {
    const indicator = document.querySelector(".nav-indicator");
    const activeBtn = document.querySelector(".bottom-nav .nav-item.active");
    if (indicator && activeBtn) {
      indicator.style.width = `${activeBtn.offsetWidth}px`;
      indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }
  });
  app.querySelectorAll("[data-view]").forEach((button) => {
    if (!button.dataset.view) return;
    button.addEventListener("click", () => {
      if (["home", "calendar", "assistant", "more", "progress", "tasks", "habits", "goals", "mood", "finance", "vault"].includes(button.dataset.view)) {
        state.view = button.dataset.view;
        state.entryModalOpen = false;
        state.entryDraft = null;
        state.moreMenuOpen = false;
        renderLayout();
      }
    });
  });
  let webRecognition;
  let idleTimer;
  let pauseTimer;
  const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.());
  const getNativeSpeechRecognition = () => window.SAHRA_SPEECH_RECOGNITION || window.Capacitor?.Plugins?.SpeechRecognition || null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && !isNativeApp) {
    webRecognition = new SpeechRecognition();
    webRecognition.continuous = true;
    webRecognition.interimResults = true;
  }
  document.querySelectorAll('[data-action="toggle-mic"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const micImg = document.getElementById("chat-mic-img");
      const chatInput = document.querySelector('input[placeholder*="speak"]');
      if (!micImg) return;
      if (!isNativeApp && !webRecognition) {
        showToast("Voice recognition isn't supported on this browser.");
        return;
      }
      const isListening = micImg.classList.contains("listening");
      if (isListening) {
        stopListening();
      } else {
        try {
          if (isNativeApp) {
            const nativeSpeech = getNativeSpeechRecognition();
            if (!nativeSpeech) {
              showToast("Voice input is unavailable in this mobile build. Please update the app.");
              return;
            }
            let permissions = await nativeSpeech.checkPermissions();
            if (permissions.speechRecognition !== "granted") {
              permissions = await nativeSpeech.requestPermissions();
            }
            if (permissions.speechRecognition !== "granted") {
              showToast("Microphone permission is required for voice input.");
              return;
            }
          }
          await startListening(micImg, chatInput);
        } catch (error) {
          console.error("Unable to start voice input:", error);
          showToast("Voice input could not be started.");
        }
      }
    });
  });
  async function startListening(micImg, chatInput) {
    if (!micImg) return;
    micImg.classList.add("listening");
    if (chatInput) chatInput.value = "";
    idleTimer = setTimeout(() => {
      stopListening();
      showToast("Microphone turned off (no speech detected)");
    }, 5e3);
    if (isNativeApp) {
      const nativeSpeech = getNativeSpeechRecognition();
      if (!nativeSpeech) throw new Error("Native speech recognition plugin is unavailable.");
      await nativeSpeech.start({
        language: "en-US",
        partialResults: true,
        popup: false
      });
      await nativeSpeech.addListener("partialResults", (data) => {
        if (data.matches?.[0]) handleSpeechResult(data.matches[0], chatInput);
      });
    } else {
      if (webRecognition && webRecognition.state === "listening") {
        return;
      }
      try {
        webRecognition.start();
        webRecognition.onresult = (event) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          handleSpeechResult(transcript, chatInput);
        };
        webRecognition.onend = () => {
          const micImgEl = document.getElementById("chat-mic-img");
          if (micImgEl) micImgEl.classList.remove("listening");
        };
      } catch (error) {
        if (error && error.name !== "InvalidStateError") {
          throw error;
        }
        if (webRecognition && webRecognition.state === "listening") {
          return;
        }
        console.warn("Speech recognition already active; ignoring duplicate start request.");
      }
    }
  }
  function handleSpeechResult(transcript, chatInput) {
    clearTimeout(idleTimer);
    clearTimeout(pauseTimer);
    if (chatInput) chatInput.value = transcript;
    pauseTimer = setTimeout(() => {
      stopListening();
    }, 3e3);
  }
  async function stopListening() {
    clearTimeout(idleTimer);
    clearTimeout(pauseTimer);
    const micImg = document.getElementById("chat-mic-img");
    if (micImg) micImg.classList.remove("listening");
    if (isNativeApp) {
      const nativeSpeech = getNativeSpeechRecognition();
      if (nativeSpeech) {
        await nativeSpeech.stop();
        await nativeSpeech.removeAllListeners();
      }
    } else if (webRecognition) {
      if (webRecognition.state === "listening") {
        webRecognition.stop();
      }
    }
    const chatInput = document.querySelector('input[placeholder*="speak"]');
    if (chatInput && chatInput.value.trim() !== "") {
      const sendBtn = chatInput.nextElementSibling;
      if (sendBtn) sendBtn.click();
    }
  }
  document.querySelectorAll('[data-action="toggle-progress-picker"]').forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      state.progressPickerOpen = !state.progressPickerOpen;
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="close-profile-modal"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileModalOpen = false;
      state.profileEditing = false;
      state.profileDraft = null;
      state.profileSuccessMessage = "";
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="profile-start-edit"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileEditing = true;
      state.profileSuccessMessage = "";
      const profile = state.user?.profile || {};
      state.profileDraft = {
        name: state.user?.name || "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : ""
      };
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="profile-cancel-edit"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileEditing = false;
      state.profileSuccessMessage = "";
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="profile-save"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const draft = state.profileDraft || {};
      const payload = {
        name: draft.name,
        dateOfBirth: draft.dateOfBirth || null
      };
      try {
        const response = await apiRequest("/api/profile", {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        state.user = response.user || state.user;
        localStorage.setItem("sahraUser", JSON.stringify(state.user));
        state.profileEditing = false;
        state.profileSuccessMessage = "Profile updated successfully!";
        renderLayout();
        setTimeout(() => {
          if (state.profileSuccessMessage) {
            state.profileSuccessMessage = "";
            renderLayout();
          }
        }, 3e3);
      } catch (error) {
        window.alert(error.message || "Unable to save profile");
      }
    });
  });
  document.querySelectorAll(".profile-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const field = event.target.dataset.field;
      const value = event.target.value;
      state.profileDraft = state.profileDraft || {};
      state.profileDraft[field] = value;
    });
  });
  document.querySelectorAll('[data-action="prev-month"]').forEach((button) => {
    button.addEventListener("click", () => shiftMonth(-1));
  });
  document.querySelectorAll('[data-action="next-month"]').forEach((button) => {
    button.addEventListener("click", () => shiftMonth(1));
  });
  document.querySelectorAll('[data-action="today"]').forEach((button) => {
    button.addEventListener("click", () => {
      const today = /* @__PURE__ */ new Date();
      state.currentMonth = today.getMonth();
      state.currentYear = today.getFullYear();
      state.selectedDate = formatDateKey2(today);
      renderLayout();
    });
  });
  document.querySelectorAll("[data-date]").forEach((button) => {
    const dateValue = button.dataset.date;
    if (!dateValue) return;
    button.addEventListener("click", () => setSelectedDate(dateValue));
  });
  document.querySelectorAll('[data-action="show-calendar-event"]').forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest('[data-action="delete-calendar-event"]')) {
        return;
      }
      const eventId = row.dataset.eventId;
      const calendarEvent = state.data.events.find(
        (item) => String(item.id || item._id) === String(eventId)
      );
      if (!calendarEvent) return;
      state.calendarDetail = {
        type: "event",
        item: calendarEvent
      };
      renderLayout();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      const eventId = row.dataset.eventId;
      const calendarEvent = state.data.events.find(
        (item) => String(item.id || item._id) === String(eventId)
      );
      if (!calendarEvent) return;
      state.calendarDetail = {
        type: "event",
        item: calendarEvent
      };
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="show-calendar-task"]').forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest('[data-action="delete-calendar-task"]')) {
        return;
      }
      const taskId = row.dataset.taskId;
      const task = state.data.tasks.find(
        (item) => String(item.id || item._id) === String(taskId)
      );
      if (!task) return;
      state.calendarDetail = {
        type: "task",
        item: task
      };
      renderLayout();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      const taskId = row.dataset.taskId;
      const task = state.data.tasks.find(
        (item) => String(item.id || item._id) === String(taskId)
      );
      if (!task) return;
      state.calendarDetail = {
        type: "task",
        item: task
      };
      renderLayout();
    });
  });
  document.querySelectorAll(
    '[data-action="delete-calendar-task"]'
  ).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const taskId = button.dataset.taskId;
      if (!taskId) return;
      showAppConfirm(
        "Are you sure you want to delete this task?",
        async () => {
          try {
            await apiRequest(
              `/api/tasks/${taskId}`,
              {
                method: "DELETE"
              }
            );
            state.data.tasks = state.data.tasks.filter(
              (task) => String(task.id || task._id) !== String(taskId)
            );
            state.calendarCache.delete(
              state.selectedDate
            );
            state.calendarDetail = null;
            showToast(
              "Task deleted successfully"
            );
            renderLayout();
          } catch (error) {
            showToast(
              error.message || "Unable to delete task"
            );
          }
        }
      );
    });
  });
  document.querySelectorAll(
    '[data-action="delete-calendar-event"]'
  ).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const eventId = button.dataset.eventId;
      if (!eventId) return;
      showAppConfirm(
        "Are you sure you want to delete this event?",
        async () => {
          try {
            await apiRequest(
              `/api/events/${eventId}`,
              {
                method: "DELETE"
              }
            );
            state.data.events = state.data.events.filter(
              (calendarEvent) => String(
                calendarEvent.id || calendarEvent._id
              ) !== String(eventId)
            );
            state.calendarCache.delete(
              state.selectedDate
            );
            state.calendarDetail = null;
            showToast(
              "Event deleted successfully"
            );
            renderLayout();
          } catch (error) {
            showToast(
              error.message || "Unable to delete event"
            );
          }
        }
      );
    });
  });
  document.querySelectorAll(
    '[data-action="close-calendar-detail"]'
  ).forEach((button) => {
    button.addEventListener("click", (event) => {
      if (event.target.closest(
        "[data-calendar-detail-content]"
      ) && !event.target.closest(
        '[data-action="close-calendar-detail"]'
      )) {
        return;
      }
      state.calendarDetail = null;
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="open-add-entry"]').forEach((button) => {
    button.addEventListener("click", () => {
      openEntryModal(button.dataset.type || "event");
    });
  });
  document.querySelectorAll(".task-input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addQuickTaskFromInput(input);
      }
    });
  });
  document.querySelectorAll('[data-action="quick-task-add"]').forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(".task-input");
      addQuickTaskFromInput(input);
    });
  });
  document.querySelectorAll('[data-action="show-selected-day"]').forEach((button) => {
    button.addEventListener("click", () => {
      setView("calendar");
    });
  });
  document.querySelectorAll("[data-task-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.todoFilter = button.dataset.taskFilter || "All";
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="toggle-mood-picker"]').forEach((button) => {
    button.addEventListener("click", () => {
      state.moodPickerOpen = !state.moodPickerOpen;
      renderLayout();
    });
  });
  document.querySelectorAll("[data-mood-value]").forEach((button) => {
    button.addEventListener("click", async () => {
      const mood = button.dataset.moodValue;
      if (!mood) return;
      state.moodPickerOpen = false;
      renderLayout();
      const existingMood = state.data.moods.find((m) => m.date === state.selectedDate);
      try {
        if (existingMood) {
          await apiRequest(`/api/moods/${existingMood.id || existingMood._id}`, {
            method: "PUT",
            body: JSON.stringify({ mood, energy: 80, note: existingMood.note || "" })
          });
          await loadDashboardData();
        } else {
          await createResource("mood", {
            date: state.selectedDate,
            mood,
            energy: 80,
            note: ""
          });
        }
      } catch (error) {
        window.alert(error.message || "Unable to save mood");
      }
    });
  });
  document.addEventListener("change", (e) => {
    const target = e.target;
    if (target.getAttribute("data-action") === "finance-filter") {
      state.financeTypeFilter = target.value;
      triggerAppRender();
    }
  });
  document.addEventListener("input", (e) => {
    const searchInput = e.target.closest('[data-action="finance-search"]');
    if (searchInput) {
      const cursorPosition = searchInput.selectionStart ?? searchInput.value.length;
      state.financeSearchQuery = searchInput.value;
      triggerAppRender();
      setTimeout(() => {
        const newInput = document.querySelector('[data-action="finance-search"]');
        if (newInput) {
          newInput.focus();
          const position = Math.min(cursorPosition, newInput.value.length);
          newInput.setSelectionRange(position, position);
        }
      }, 0);
    }
  });
  document.querySelectorAll('[data-action="edit-task"]').forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.data.tasks.find((item) => String(item.id || item._id) === String(button.dataset.taskId));
      if (!task) return;
      state.entryModalOpen = true;
      state.entryDraft = {
        type: "task",
        id: task.id || task._id,
        title: task.title || "",
        description: task.description || "",
        date: task.date || state.selectedDate,
        time: task.time || "19:00",
        priority: task.priority || "Normal",
        status: task.status || "Pending",
        reminder: task.reminder || "",
        category: task.category || "General"
      };
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="delete-task"]').forEach((button) => {
    button.addEventListener("click", () => {
      const taskId = button.dataset.taskId;
      if (!taskId) return;
      showAppConfirm("Are you sure you want to delete this task?", async () => {
        try {
          await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" });
          await loadDashboardData();
          showToast("Task deleted successfully");
        } catch (error) {
          showToast(error.message || "Unable to delete task");
        }
      });
    });
  });
  document.querySelectorAll('[data-action="toggle-task"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const taskId = button.dataset.taskId;
      const task = state.data.tasks.find((item) => String(item.id || item._id) === String(taskId));
      if (!task) return;
      const nextCompleted = !(task.completed || task.status === "Completed");
      try {
        await apiRequest(`/api/tasks/${taskId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: task.title,
            description: task.description || "",
            date: task.date || state.selectedDate,
            time: task.time || null,
            priority: task.priority || "Normal",
            status: nextCompleted ? "Completed" : "Pending",
            completed: nextCompleted,
            reminder: task.reminder || "",
            category: task.category || "General"
          })
        });
        await loadDashboardData();
      } catch (error) {
        window.alert(error.message || "Unable to update task");
      }
    });
  });
  document.querySelectorAll('[data-action="copy-asset"]').forEach((button) => {
    button.addEventListener("click", (e) => {
      const content2 = button.dataset.content || "";
      navigator.clipboard.writeText(content2);
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2e3);
    });
  });
  document.querySelectorAll('[data-action="close-entry-modal"]').forEach((button) => {
    button.addEventListener("click", () => {
      closeEntryModal();
    });
  });
  document.querySelectorAll('[data-action="save-entry"]').forEach((button) => {
    button.addEventListener("click", async () => {
      document.querySelectorAll("[data-entry-field]").forEach((field) => {
        const fieldName = field.dataset.entryField;
        if (fieldName) {
          state.entryDraft = state.entryDraft || {};
          state.entryDraft[fieldName] = field.type === "checkbox" ? field.checked : field.value;
        }
      });
      const draft = state.entryDraft || {};
      const type = draft.type || "event";
      const date = draft.date || state.selectedDate;
      if ((type === "event" || type === "task") && isPastDate(date)) {
        window.alert(
          "Tasks and events can only be added for today or future dates."
        );
        return;
      }
      try {
        if (type === "event") {
          const title = (draft.title || "").trim();
          if (!title) {
            window.alert("Please enter an event title.");
            return;
          }
          await createResource("event", {
            title,
            description: draft.description || "",
            date,
            startTime: draft.startTime || "09:00",
            endTime: draft.endTime || "10:00",
            category: draft.category || "General",
            reminder: draft.reminder || ""
          });
        } else if (type === "task") {
          const title = (draft.title || "").trim();
          if (!title) {
            window.alert("Please enter a task title.");
            return;
          }
          const taskPayload = {
            title,
            description: draft.description || "",
            date,
            time: draft.time || null,
            priority: draft.priority || "Normal",
            status: draft.status || "Pending",
            completed: draft.completed || false,
            reminder: draft.reminder || "",
            category: draft.category || "General"
          };
          if (draft.id) {
            await apiRequest(`/api/tasks/${draft.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(taskPayload)
            });
            await loadDashboardData();
          } else {
            await createResource("task", taskPayload);
          }
        } else if (type === "habit") {
          const name = (draft.title || "").trim();
          if (!name) {
            window.alert("Please enter a habit name.");
            return;
          }
          await createResource("habit", {
            name,
            description: draft.description || "",
            goal: Number(draft.goal || 1),
            progress: 0,
            frequency: draft.frequency || "Daily"
          });
        } else if (type === "goal") {
          const title = (draft.title || "").trim();
          if (!title) {
            window.alert("Please enter a goal title.");
            return;
          }
          const current = Number(draft.current || 0);
          const target = Math.max(Number(draft.target || 30), 1);
          await createResource("goal", {
            title,
            description: draft.description || "",
            duration: draft.duration || "30 days",
            current,
            target,
            progress: Math.min(100, Math.round(current / target * 100)),
            status: "Active"
          });
        } else if (type === "mood") {
          const mood = draft.mood || "\u{1F60A}";
          await createResource("mood", {
            date,
            mood,
            energy: 80,
            note: draft.note || ""
          });
        } else if (type === "asset" || type === "note") {
          const title = (draft.title || "").trim();
          const description = (draft.description || draft.content || "").trim();
          if (!title || !description) {
            window.alert("Please enter a title and description.");
            return;
          }
          const payload = { title, content: description, tags: draft.tags || "Note" };
          if (draft.id) {
            await apiRequest(`/api/assets/${draft.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            });
            await loadDashboardData();
            renderLayout();
          } else {
            await createResource("asset", payload);
          }
        } else if (type === "expense" || type === "subscription") {
          const title = (draft.title || "").trim();
          const amount = Number(draft.amount);
          if (!title) {
            window.alert("Please enter a title.");
            return;
          }
          if (!Number.isFinite(amount) || amount <= 0) {
            window.alert("Please enter a valid amount.");
            return;
          }
          await createResource(type, {
            title,
            amount,
            date: draft.date || state.selectedDate,
            renewalDate: draft.renewalDate || state.selectedDate,
            category: draft.category || "General"
          });
        }
        closeEntryModal();
        if (typeof showToast === "function") {
          showToast("Saved successfully!");
        } else {
          window.alert("Saved successfully!");
        }
      } catch (error) {
        console.error("Save entry failed:", error);
        if (typeof showToast === "function") {
          showToast(error.message || "Unable to save item");
        } else {
          window.alert(error.message || "Unable to save item");
        }
      }
    });
  });
  document.querySelectorAll("[data-entry-field]").forEach((field) => {
    const fieldName = field.dataset.entryField;
    if (!fieldName) return;
    const updateDraft = (element) => {
      const value = element.type === "checkbox" ? element.checked : element.value;
      state.entryDraft = {
        ...state.entryDraft || {},
        [fieldName]: value
      };
      if (fieldName === "type") {
        renderLayout();
      }
    };
    field.addEventListener("input", () => updateDraft(field));
    field.addEventListener("change", () => updateDraft(field));
  });
  const menuButton = document.querySelector(".menu-button");
  const menuPanel = document.querySelector(".menu-panel");
  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      state.menuOpen = !state.menuOpen;
      menuPanel.classList.toggle("hidden", !state.menuOpen);
      menuPanel.classList.toggle("open", state.menuOpen);
    });
  }
  document.querySelectorAll("[data-menu-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.menuAction;
      if (action === "toggle-theme") {
        const nextTheme = state.theme === "light" ? "dark" : "light";
        state.menuOpen = true;
        applyTheme(nextTheme);
        renderLayout();
        await updateThemeInDatabase(nextTheme);
        return;
      }
      state.menuOpen = false;
      if (action === "profile") {
        state.profileModalOpen = true;
        state.profileEditing = false;
        state.profileSuccessMessage = "";
        state.profileDraft = {
          name: state.user?.name || "",
          dateOfBirth: state.user?.profile?.dateOfBirth ? new Date(state.user.profile.dateOfBirth).toISOString().slice(0, 10) : ""
        };
        renderLayout();
        return;
      }
      if (action === "notifications") {
        state.menuOpen = true;
        renderLayout();
        await toggleDeviceNotifications();
        renderLayout();
        return;
      }
      if (action === "logout") {
        await removeAuthToken();
        localStorage.removeItem("sahraUser");
        state.authenticated = false;
        state.user = { name: "Sahra" };
        state.view = "home";
        window.location.href = getLoginPath();
      }
    });
  });
  if (!notepadEventsBound) {
    let showCustomNotepadConfirm = function(message, onConfirm) {
      const overlay = document.createElement("div");
      overlay.className = "notepad-confirm-overlay";
      overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px);";
      const box = document.createElement("div");
      box.className = "notepad-confirm-box";
      box.style.cssText = "background: #1e293b; padding: 24px; border-radius: 16px; width: 85%; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid rgba(255,255,255,0.1);";
      const text = document.createElement("p");
      text.className = "notepad-confirm-message";
      text.style.cssText = "margin: 0 0 24px 0; font-size: 1.1rem; line-height: 1.5; color: #f8fafc; font-weight: 500;";
      text.innerText = message;
      const btnContainer = document.createElement("div");
      btnContainer.style.cssText = "display: flex; gap: 12px; justify-content: center;";
      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "Cancel";
      cancelBtn.type = "button";
      cancelBtn.style.cssText = "padding: 12px; border-radius: 10px; border: none; background: #334155; color: white; font-weight: 600; cursor: pointer; flex: 1;";
      const confirmBtn = document.createElement("button");
      confirmBtn.innerText = "Delete";
      confirmBtn.style.cssText = "padding: 12px; border-radius: 10px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer; flex: 1; box-shadow: 0 4px 10px rgba(239,68,68,0.3);";
      cancelBtn.onclick = () => document.body.removeChild(overlay);
      let confirmed = false;
      confirmBtn.onclick = async () => {
        if (confirmed) return;
        confirmed = true;
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Deleting...";
        confirmBtn.style.opacity = "0.6";
        confirmBtn.style.pointerEvents = "none";
        overlay.remove();
        await onConfirm();
      };
      btnContainer.appendChild(cancelBtn);
      btnContainer.appendChild(confirmBtn);
      box.appendChild(text);
      box.appendChild(btnContainer);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    };
    notepadEventsBound = true;
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest('[data-action="toggle-notepad-search"]');
      if (!toggleBtn) return;
      const app2 = document.querySelector("#app");
      const currentScroll = app2 ? app2.scrollTop : 0;
      state.notepadSearchOpen = !state.notepadSearchOpen;
      renderLayout();
      requestAnimationFrame(() => {
        const newApp = document.querySelector("#app");
        if (newApp) {
          newApp.scrollTop = currentScroll;
        }
        if (state.notepadSearchOpen) {
          const searchInput = document.querySelector(
            '[data-action="notepad-search-input"]'
          );
          if (searchInput) {
            searchInput.focus();
          }
        }
      });
    });
    document.addEventListener("input", (e) => {
      const input = e.target.closest(
        '[data-action="notepad-search-input"]'
      );
      if (!input) return;
      const cursorPosition = input.selectionStart ?? input.value.length;
      const app2 = document.querySelector("#app");
      const currentScroll = app2 ? app2.scrollTop : 0;
      state.noteSearchQuery = input.value;
      renderLayout();
      requestAnimationFrame(() => {
        const newApp = document.querySelector("#app");
        if (newApp) {
          newApp.scrollTop = currentScroll;
        }
        const newInput = document.querySelector(
          '[data-action="notepad-search-input"]'
        );
        if (!newInput) return;
        newInput.focus();
        const position = Math.min(
          cursorPosition,
          newInput.value.length
        );
        newInput.setSelectionRange(position, position);
      });
    });
    document.addEventListener("click", (e) => {
      const editBtn = e.target.closest('[data-action="edit-note"]');
      if (editBtn) {
        const noteId = editBtn.dataset.noteId;
        const notes = state.data.assets || state.data.notes || [];
        const note = notes.find((n) => String(n.id || n._id) === String(noteId));
        if (!note) return;
        state.entryModalOpen = true;
        state.entryDraft = {
          type: "asset",
          id: note.id || note._id,
          title: note.title || "",
          content: note.content || note.description || "",
          description: note.content || note.description || "",
          tags: note.tags || "Note"
        };
        renderLayout();
      }
    });
    document.addEventListener("click", (e) => {
      const delBtn = e.target.closest('[data-action="delete-note"]');
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const noteId = delBtn.dataset.noteId;
        showCustomNotepadConfirm("Are you sure you want to delete this note?", async () => {
          try {
            await apiRequest(`/api/assets/${noteId}`, {
              method: "DELETE"
            });
            await loadDashboardData();
            if (typeof showToast === "function") showToast("Note deleted");
          } catch (error) {
            if (typeof showToast === "function") showToast(error.message || "Failed to delete note");
          }
        });
      }
    });
  }
  document.querySelectorAll('[data-action="back-home"]').forEach((button) => {
    button.addEventListener("click", () => {
      state.profileModalOpen = false;
      state.profileDraft = null;
      state.entryModalOpen = false;
      state.entryDraft = null;
      const previousView = state.navigationHistory.length > 0 ? state.navigationHistory.pop() : "home";
      state.view = previousView;
      renderLayout();
    });
  });
  const submitAssistantMessage = async (message, requestId, addUserMessage = true) => {
    if (state.assistantLoading) return;
    const generation = state.assistantGeneration;
    if (addUserMessage) state.assistantMessages.push({ role: "user", text: message });
    state.assistantLoading = true;
    renderLayout();
    try {
      let response;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15e3);
        try {
          response = await apiRequest("/api/assistant/chat", {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({ message, requestId })
          });
          break;
        } catch (error) {
          const retryable = !Number.isInteger(error.status) || error.status >= 500 || error.status === 408;
          if (attempt === 0 && retryable) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            continue;
          }
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      }
      if (generation === state.assistantGeneration) {
        state.assistantMessages.push({ role: "assistant", text: response.message || "Sahra is temporarily unavailable." });
      }
      if (generation === state.assistantGeneration && response.action === "requiresConfirmation" && response.confirmationToken) {
        const label = /delete/i.test(response.message || "") ? "Delete task" : /complete/i.test(response.message || "") ? "Mark complete" : /event/i.test(response.message || "") ? "Add event" : "Add task";
        showAppConfirm("Do you want Sahra to perform this change?", async () => {
          state.assistantLoading = true;
          renderLayout();
          try {
            const execution = await apiRequest("/api/assistant/execute", {
              method: "POST",
              body: JSON.stringify({ confirmationToken: response.confirmationToken })
            });
            state.assistantMessages.push({ role: "assistant", text: execution.message || "The change was completed." });
            await loadDashboardData();
          } catch (error) {
            state.assistantMessages.push({ role: "assistant", text: error.message || "Sahra could not complete that change." });
          } finally {
            state.assistantLoading = false;
            renderLayout();
          }
        }, label);
      } else if (["createdTask", "createdEvent", "createdNote", "createdTransaction"].includes(response.action)) {
        await loadDashboardData();
        if (response.action === "createdTransaction") await fetchFinanceData();
      }
    } catch (error) {
      const messageText = error.message || "Sahra is temporarily unavailable.";
      const canRetry = !Number.isInteger(error.status) || error.status >= 500 || error.status === 408;
      if (generation === state.assistantGeneration) {
        state.assistantMessages.push({
          role: "assistant",
          text: canRetry ? `${messageText} You can retry safely.` : messageText,
          ...canRetry ? { retryRequestId: requestId, retryMessage: message } : {}
        });
      }
    } finally {
      state.assistantLoading = false;
      renderLayout();
    }
  };
  document.querySelectorAll(".composer-send").forEach((button) => {
    button.addEventListener("click", async () => {
      const input = document.querySelector(".assistant-input");
      const message = input?.value?.trim();
      if (!message || state.assistantLoading) return;
      if (input) input.value = "";
      const requestId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await submitAssistantMessage(message, requestId);
    });
  });
  document.querySelectorAll("[data-assistant-retry]").forEach((button) => {
    button.addEventListener("click", async () => {
      const message = button.dataset.retryMessage || "";
      const requestId = button.dataset.assistantRetry || "";
      if (message && requestId) await submitAssistantMessage(message, requestId, false);
    });
  });
  document.querySelectorAll("[data-progress-month]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const month = Number(button.dataset.progressMonth);
      if (!Number.isInteger(month) || month < 0 || month > 11) return;
      state.currentMonth = month;
      state.progressPickerOpen = false;
      state.progressLoading = true;
      renderLayout();
      await loadProgressData(true);
    });
  });
  document.querySelectorAll('[data-action="close-progress-picker"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.progressPickerOpen = false;
      renderLayout();
    });
  });
  document.querySelectorAll('[data-action="progress-year-change"]').forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const direction = Number(button.dataset.direction || 0);
      if (!direction) return;
      state.currentYear += direction;
      state.progressData = null;
      renderLayout();
      await loadProgressData(true);
    });
  });
  document.querySelectorAll('[data-action="progress-year-set"]').forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const targetYear = Number(button.dataset.year);
      if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 2200) return;
      state.currentYear = targetYear;
      state.progressData = null;
      renderLayout();
      await loadProgressData(true);
    });
  });
  document.querySelectorAll(".assistant-input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const sendButton = document.querySelector(".composer-send");
        sendButton?.click();
      }
    });
  });
  document.querySelectorAll(".composer-mic").forEach((button) => {
    button.addEventListener("click", () => {
      const SpeechRecognition2 = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition2) {
        window.alert("Voice input is not supported in this browser.");
        return;
      }
      button.style.color = "#ff4757";
      const recognition = new SpeechRecognition2();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.querySelector(".assistant-input");
        const sendButton = document.querySelector(".composer-send");
        if (input) {
          input.value = transcript;
        }
        if (sendButton) {
          sendButton.click();
        }
      };
      recognition.onend = () => {
        button.style.color = "";
      };
      recognition.start();
    });
  });
  app.querySelectorAll('[data-action="close-more-menu"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.moreMenuOpen = false;
      renderLayout();
    });
  });
  isRendering = false;
}
function bindBottomNav() {
  document.querySelectorAll(".bottom-nav .nav-item").forEach((button) => {
    button.addEventListener("click", async (e) => {
      // The Menu button opens a dedicated page instead of a popup over the current page.
      if (button.dataset.action === "toggle-more-menu") {
        e.stopPropagation();
        state.entryModalOpen = false;
        state.entryDraft = null;
        state.progressPickerOpen = false;
        state.profileModalOpen = false;
        state.moreMenuOpen = false;
        state.menuOpen = false;
        state.moodPickerOpen = false;
        state.view = "menu";
        renderLayout();
        return;
      }
      const view = button.dataset.view;
      if (!view) return;
      state.entryModalOpen = false;
      state.entryDraft = null;
      state.progressPickerOpen = false;
      state.profileModalOpen = false;
      state.moreMenuOpen = false;
      state.view = view;
      renderLayout();
      if (view === "progress") {
        await loadProgressData(true);
      }
    });
  });
}
var globalListenersBound = false;
var lastAppScrollTop = 0;
var smartNavBound = false;
function isEditableControl(element) {
  return Boolean(element?.matches?.('input:not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]'));
}
function syncKeyboardViewport() {
  const viewport = window.visualViewport;
  const activeEditable = isEditableControl(document.activeElement);
  const isSmallScreen = window.matchMedia?.('(max-width: 760px)').matches || window.innerWidth <= 760;
  const viewportReduced = Boolean(viewport && (window.innerHeight - viewport.height > 120 || viewport.height < window.innerHeight * 0.76));
  const keyboardOpen = Boolean(isSmallScreen && activeEditable && (viewportReduced || document.activeElement));
  document.body.classList.toggle('keyboard-open', keyboardOpen);
  document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
  document.querySelector('.bottom-nav')?.classList.toggle('keyboard-hidden', keyboardOpen);
  if (viewport) document.documentElement.style.setProperty('--sahra-visual-height', `${Math.max(220, viewport.height)}px`);
}
function revealFocusedControl(element) {
  if (!isEditableControl(element)) return;
  const target = element;
  [100, 320, 520].forEach((delay) => {
    window.setTimeout(() => {
      if (!target.isConnected || document.activeElement !== target) return;
      syncKeyboardViewport();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const rect = target.getBoundingClientRect();
      if (rect.bottom > viewportHeight - 26 || rect.top < 10) {
        target.scrollIntoView({ block: 'center', behavior: delay > 100 ? 'smooth' : 'auto' });
      }
    }, delay);
  });
}
function bindSmartNavigationAndKeyboard() {
  if (smartNavBound) return;
  smartNavBound = true;
  const app = document.getElementById('app');
  const nav = document.querySelector('.bottom-nav');
  if (app && nav) {
    lastAppScrollTop = app.scrollTop;
    app.addEventListener('scroll', () => {
      const currentTop = app.scrollTop;
      if (document.body.classList.contains('keyboard-open')) {
        nav.classList.add('keyboard-hidden');
        lastAppScrollTop = currentTop;
        return;
      }
      const delta = currentTop - lastAppScrollTop;
      if (currentTop <= 8) nav.classList.remove('scroll-hidden');
      else if (delta > 5) nav.classList.add('scroll-hidden');
      else if (delta < -5) nav.classList.remove('scroll-hidden');
      lastAppScrollTop = currentTop;
    }, { passive: true });
  }
  document.addEventListener('focusin', (event) => {
    if (!isEditableControl(event.target)) return;
    syncKeyboardViewport();
    revealFocusedControl(event.target);
  });
  document.addEventListener('focusout', () => {
    window.setTimeout(() => {
      syncKeyboardViewport();
      if (!document.body.classList.contains('keyboard-open')) document.querySelector('.bottom-nav')?.classList.remove('keyboard-hidden');
    }, 180);
  });
  window.addEventListener('resize', syncKeyboardViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', syncKeyboardViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', syncKeyboardViewport, { passive: true });
}
function bindGlobalListeners() {
  if (globalListenersBound) return;
  globalListenersBound = true;
  bindSmartNavigationAndKeyboard();
  document.addEventListener("click", (event) => {
    const clearAssistantButton = event.target.closest('[data-action="clear-assistant-chat"]');
    if (clearAssistantButton) {
      state.assistantGeneration += 1;
      state.assistantMessages = [
        { role: "assistant", text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." }
      ];
      renderLayout();
      return;
    }
    const clickedMonthPicker = event.target.closest(".month-picker-wrapper");
    const clickedMenu = event.target.closest(".menu-panel, .menu-button");
    const clickedMoodPicker = event.target.closest(".mood-selector-wrap");
    const clickedMoreMenu = event.target.closest(".more-menu-panel");
    const clickedMoreMenuToggle = event.target.closest('[data-action="toggle-more-menu"]');
    let needsRender = false;
    if (!clickedMenu && state.menuOpen) {
      state.menuOpen = false;
      needsRender = true;
    }
    if (state.progressPickerOpen && !clickedMonthPicker) {
      state.progressPickerOpen = false;
      needsRender = true;
    }
    if (state.moodPickerOpen && !clickedMoodPicker) {
      state.moodPickerOpen = false;
      needsRender = true;
    }
    if (state.moreMenuOpen && !clickedMoreMenu && !clickedMoreMenuToggle) {
      state.moreMenuOpen = false;
      needsRender = true;
    }
    if (needsRender) {
      renderLayout();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    let changed = false;
    if (state.progressPickerOpen) {
      state.progressPickerOpen = false;
      changed = true;
    }
    if (state.menuOpen) {
      state.menuOpen = false;
      changed = true;
    }
    if (state.moodPickerOpen) {
      state.moodPickerOpen = false;
      changed = true;
    }
    if (state.moreMenuOpen) {
      state.moreMenuOpen = false;
      changed = true;
    }
    if (changed) {
      renderLayout();
    }
  });
}
function triggerAppRender() {
  renderLayout();
}
async function fetchFinanceData() {
  if (!state.authenticated) return;
  try {
    const payload = await apiRequest("/api/transactions");
    state.financeData = Array.isArray(payload) ? payload : payload.transactions || [];
    renderLayout();
  } catch (error) {
    console.error("Failed to load finance data:", error);
    try {
      const cached = await offlineSync.transactionFallback(await getAuthToken());
      if (cached.length) {
        state.financeData = cached;
        showOfflineBannerOnce();
        renderLayout();
      }
    } catch (cacheError) {
      console.warn("Finance cache unavailable:", cacheError.message);
    }
  }
}
var financeListenersBound = false;
function bindFinanceListeners() {
  if (financeListenersBound) return;
  financeListenersBound = true;
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;

    // Quick amount chips add their value for both income and expense forms.
    if (action === "quick-amount") {
      event.preventDefault();
      const amountInput = document.getElementById("finance-amount");
      const increment = Number(button.dataset.val);
      if (!amountInput || !Number.isFinite(increment) || increment <= 0) return;
      const currentAmount = Number.parseFloat(amountInput.value);
      const current = Number.isFinite(currentAmount) && currentAmount > 0 ? currentAmount : 0;
      amountInput.value = String(Number((current + increment).toFixed(2)));
      amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      amountInput.dispatchEvent(new Event("change", { bubbles: true }));
      button.classList.add("quick-amount-applied");
      window.setTimeout(() => button.classList.remove("quick-amount-applied"), 240);
      return;
    }
    if (action === "set-finance-view") {
      state.financeView = button.dataset.view || "dashboard";
      renderLayout();
      return;
    }
    if (action === "set-finance-filter") {
      state.financeFilter = button.dataset.filter || "week";
      renderLayout();
      return;
    }
    if (action === "select-finance-type") {
      state.tempFinanceType = button.dataset.type || "expense";
      state.financeView = "add-expense";
      renderLayout();
      return;
    }
    if (action === "show-finance-reset-confirm") {
      state.showFinanceResetConfirm = true;
      renderLayout();
      return;
    }
    if (action === "cancel-finance-reset") {
      state.showFinanceResetConfirm = false;
      renderLayout();
      return;
    }
    if (action === "confirm-finance-reset") {
      if (state.financeResetLoading) return;
      state.financeResetLoading = true;
      renderLayout();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15e3);
      try {
        const response = await apiRequest("/api/transactions", {
          method: "DELETE",
          signal: controller.signal
        });
        state.financeData = [];
        state.financeDetail = null;
        state.showFinanceResetConfirm = false;
        state.tempFinanceType = null;
        state.financeView = "dashboard";
        showToast(
          `${response.deletedCount || 0} transactions deleted`
        );
        renderLayout();
      } catch (error) {
        console.error("Reset transactions error:", error);
        showToast(error.name === "AbortError" ? "Reset timed out. Check your connection and retry." : error.message || "Unable to reset transactions");
      } finally {
        clearTimeout(timeout);
        state.financeResetLoading = false;
        renderLayout();
      }
      return;
    }
    if (action === "show-transaction-detail") {
      const id = button.dataset.id;
      const transaction = state.financeData.find(
        (item) => String(item._id || item.id) === String(id)
      );
      if (!transaction) return;
      state.financeDetail = transaction;
      renderLayout();
      return;
    }
    if (action === "close-transaction-detail") {
      state.financeDetail = null;
      renderLayout();
      return;
    }
    if (action === "delete-finance-transaction") {
      const id = button.dataset.id;
      if (!id) {
        showToast("Transaction ID is missing");
        return;
      }
      if (button.dataset.deleting === "true") {
        return;
      }
      const index = state.financeData.findIndex(
        (item) => String(item._id || item.id) === String(id)
      );
      if (index === -1) {
        showToast("Transaction not found");
        return;
      }
      const deletedTransaction = state.financeData[index];
      button.dataset.deleting = "true";
      button.disabled = true;
      state.financeData.splice(index, 1);
      state.financeDetail = null;
      renderLayout();
      try {
        await apiRequest(`/api/transactions/${id}`, {
          method: "DELETE"
        });
        showToast("Transaction deleted successfully");
      } catch (error) {
        console.error("Delete transaction error:", error);
        state.financeData.splice(index, 0, deletedTransaction);
        state.financeDetail = deletedTransaction;
        renderLayout();
        showToast(
          error.message || "Unable to delete transaction"
        );
      }
      return;
    }
    if (action === "save-finance-transaction") {
      if (button.dataset.submitting === "true") return;
      button.dataset.submitting = "true";
      button.textContent = "Saving...";
      const amount = document.getElementById("finance-amount")?.value;
      const category = document.getElementById("finance-category")?.value;
      const date = document.getElementById("finance-date")?.value;
      const note = document.getElementById("finance-note")?.value;
      const paymentMethod = document.getElementById("finance-payment-method")?.value || "Cash";
      const type = button.dataset.type || state.tempFinanceType || "expense";
      if (!amount || Number(amount) <= 0) {
        showToast("Please enter a valid amount.");
        button.dataset.submitting = "false";
        button.textContent = "Save Transaction";
        return;
      }
      try {
        await apiRequest("/api/transactions", {
          method: "POST",
          body: JSON.stringify({
            amount: Number(amount),
            category: category || "Other",
            date: date || (/* @__PURE__ */ new Date()).toISOString(),
            note: note || "",
            type,
            paymentMethod
            // 👈 2. ADD THIS LINE to send it to the database
          })
        });
        state.financeView = "dashboard";
        state.tempFinanceType = null;
        await fetchFinanceData();
        showToast("Transaction saved successfully");
      } catch (error) {
        console.error(error);
        showToast(
          error.message || "Unable to save transaction"
        );
        button.dataset.submitting = "false";
        button.textContent = "Save Transaction";
      }
      return;
    }
  });
}
async function initializeApp() {
  await initializeLocalDatabase();
  applyTheme(getStoredTheme());
  bindBottomNav();
  bindGlobalListeners();
  bindFinanceListeners();
  const token = await getAuthToken();
  state.authenticated = Boolean(token);
  if (!token) {
    window.location.href = getLoginPath();
    return;
  }
  if (globalThis.navigator?.onLine) await offlineSync.flush(token);
  await loadDashboardData();
  await fetchFinanceData();
  if (window.Capacitor?.isNativePlatform()) {
    const { markSahraOtaReady: markSahraOtaReady2 } = await Promise.resolve().then(() => (init_mobile_ota(), mobile_ota_exports));
    await markSahraOtaReady2();
  }
}
initializeApp().catch((error) => {
  console.error("App initialization failed:", error);
  showToast(error.message || "Unable to initialize Sahra.");
  renderLayout();
});
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
