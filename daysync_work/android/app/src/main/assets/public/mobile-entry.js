var Rs=Object.defineProperty;var X=(n,e)=>()=>(n&&(e=n(n=0)),e);var le=(n,e)=>{for(var t in e)Rs(n,t,{get:e[t],enumerable:!0})};var $e,Oe,_s,qs,Fs,Me,G,Y,Ga,Wa,Gt,So,js,Bs,Us,Hs,Wt,Ao,Ya,Ja,Yt,ko,J=X(()=>{(function(n){n.Unimplemented="UNIMPLEMENTED",n.Unavailable="UNAVAILABLE"})($e||($e={}));Oe=class extends Error{constructor(e,t,s){super(e),this.message=e,this.code=t,this.data=s}},_s=n=>{var e,t;return n?.androidBridge?"android":!((t=(e=n?.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},qs=n=>{let e=n.CapacitorCustomPlatform||null,t=n.Capacitor||{},s=t.Plugins=t.Plugins||{},i=()=>e!==null?e.name:_s(n),o=()=>i()!=="web",d=f=>{let x=g.get(f);return!!(x?.platforms.has(i())||p(f))},p=f=>{var x;return(x=t.PluginHeaders)===null||x===void 0?void 0:x.find(I=>I.name===f)},r=f=>n.console.error(f),g=new Map,h=(f,x={})=>{let I=g.get(f);if(I)return console.warn(`Capacitor plugin "${f}" already registered. Cannot register plugins twice.`),I.proxy;let E=i(),T=p(f),w,D=async()=>(!w&&E in x?w=typeof x[E]=="function"?w=await x[E]():w=x[E]:e!==null&&!w&&"web"in x&&(w=typeof x.web=="function"?w=await x.web():w=x.web),w),q=(m,y)=>{var b,N;if(T){let C=T?.methods.find(R=>y===R.name);if(C)return C.rtype==="promise"?R=>t.nativePromise(f,y.toString(),R):(R,j)=>t.nativeCallback(f,y.toString(),R,j);if(m)return(b=m[y])===null||b===void 0?void 0:b.bind(m)}else{if(m)return(N=m[y])===null||N===void 0?void 0:N.bind(m);throw new Oe(`"${f}" plugin is not implemented on ${E}`,$e.Unimplemented)}},F=m=>{let y,b=(...N)=>{let C=D().then(R=>{let j=q(R,m);if(j){let K=j(...N);return y=K?.remove,K}else throw new Oe(`"${f}.${m}()" is not implemented on ${E}`,$e.Unimplemented)});return m==="addListener"&&(C.remove=async()=>y()),C};return b.toString=()=>`${m.toString()}() { [capacitor code] }`,Object.defineProperty(b,"name",{value:m,writable:!1,configurable:!1}),b},L=F("addListener"),S=F("removeListener"),u=(m,y)=>{let b=L({eventName:m},y),N=async()=>{let R=await b;S({eventName:m,callbackId:R},y)},C=new Promise(R=>b.then(()=>R({remove:N})));return C.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await N()},C},l=new Proxy({},{get(m,y){switch(y){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return T?u:L;case"removeListener":return S;default:return F(y)}}});return s[f]=l,g.set(f,{name:f,proxy:l,platforms:new Set([...Object.keys(x),...T?[E]:[]])}),l};return t.convertFileSrc||(t.convertFileSrc=f=>f),t.getPlatform=i,t.handleError=r,t.isNativePlatform=o,t.isPluginAvailable=d,t.registerPlugin=h,t.Exception=Oe,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},Fs=n=>n.Capacitor=qs(n),Me=Fs(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),G=Me.registerPlugin,Y=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let s=!1;this.listeners[e]||(this.listeners[e]=[],s=!0),this.listeners[e].push(t);let o=this.windowListeners[e];o&&!o.registered&&this.addWindowListener(o),s&&this.sendRetainedArgumentsForEvent(e);let d=async()=>this.removeListener(e,t);return Promise.resolve({remove:d})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,s){let i=this.listeners[e];if(!i){if(s){let o=this.retainedEventArguments[e];o||(o=[]),o.push(t),this.retainedEventArguments[e]=o}return}i.forEach(o=>o(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:s=>{this.notifyListeners(t,s)}}}unimplemented(e="not implemented"){return new Me.Exception(e,$e.Unimplemented)}unavailable(e="not available"){return new Me.Exception(e,$e.Unavailable)}async removeListener(e,t){let s=this.listeners[e];if(!s)return;let i=s.indexOf(t);i!==-1&&this.listeners[e].splice(i,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(s=>{this.notifyListeners(e,s)}))}},Ga=n=>encodeURIComponent(n).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Wa=n=>n.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),Gt=class extends Y{async getCookies(){let e=document.cookie,t={};return e.split(";").forEach(s=>{if(s.length<=0)return;let[i,o]=s.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");i=Wa(i).trim(),o=Wa(o).trim(),t[i]=o}),t}async setCookie(e){try{let t=Ga(e.key),s=Ga(e.value),i=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",o=(e.path||"/").replace("path=",""),d=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${s||""}${i}; path=${o}; ${d};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{let e=document.cookie.split(";")||[];for(let t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},So=G("CapacitorCookies",{web:()=>new Gt}),js=async n=>new Promise((e,t)=>{let s=new FileReader;s.onload=()=>{let i=s.result;e(i.indexOf(",")>=0?i.split(",")[1]:i)},s.onerror=i=>t(i),s.readAsDataURL(n)}),Bs=(n={})=>{let e=Object.keys(n);return Object.keys(n).map(i=>i.toLocaleLowerCase()).reduce((i,o,d)=>(i[o]=n[e[d]],i),{})},Us=(n,e=!0)=>n?Object.entries(n).reduce((s,i)=>{let[o,d]=i,p,r;return Array.isArray(d)?(r="",d.forEach(g=>{p=e?encodeURIComponent(g):g,r+=`${o}=${p}&`}),r.slice(0,-1)):(p=e?encodeURIComponent(d):d,r=`${o}=${p}`),`${s}&${r}`},"").substr(1):null,Hs=(n,e={})=>{let t=Object.assign({method:n.method||"GET",headers:n.headers},e),i=Bs(n.headers)["content-type"]||"";if(typeof n.data=="string")t.body=n.data;else if(i.includes("application/x-www-form-urlencoded")){let o=new URLSearchParams;for(let[d,p]of Object.entries(n.data||{}))o.set(d,p);t.body=o.toString()}else if(i.includes("multipart/form-data")||n.data instanceof FormData){let o=new FormData;if(n.data instanceof FormData)n.data.forEach((p,r)=>{o.append(r,p)});else for(let p of Object.keys(n.data))o.append(p,n.data[p]);t.body=o;let d=new Headers(t.headers);d.delete("content-type"),t.headers=d}else(i.includes("application/json")||typeof n.data=="object")&&(t.body=JSON.stringify(n.data));return t},Wt=class extends Y{async request(e){let t=Hs(e,e.webFetchExtra),s=Us(e.params,e.shouldEncodeUrlParams),i=s?`${e.url}?${s}`:e.url,o=await fetch(i,t),d=o.headers.get("content-type")||"",{responseType:p="text"}=o.ok?e:{};d.includes("application/json")&&(p="json");let r,g;switch(p){case"arraybuffer":case"blob":g=await o.blob(),r=await js(g);break;case"json":r=await o.json();break;case"document":case"text":default:r=await o.text()}let h={};return o.headers.forEach((f,x)=>{h[x]=f}),{data:r,headers:h,status:o.status,url:o.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}},Ao=G("CapacitorHttp",{web:()=>new Wt});(function(n){n.Dark="DARK",n.Light="LIGHT",n.Default="DEFAULT"})(Ya||(Ya={}));(function(n){n.StatusBar="StatusBar",n.NavigationBar="NavigationBar"})(Ja||(Ja={}));Yt=class extends Y{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}},ko=G("SystemBars",{web:()=>new Yt})});var Va={};le(Va,{SecureStoragePluginWeb:()=>Jt});var Jt,Ka=X(()=>{J();Jt=class extends Y{constructor(){super(...arguments),this.PREFIX="cap_sec_",this.addPrefix=e=>this.PREFIX+e,this.removePrefix=e=>e.replace(this.PREFIX,"")}get(e){let t=localStorage.getItem(this.addPrefix(e.key));return t!==null?Promise.resolve({value:atob(t)}):Promise.reject("Item with given key does not exist")}set(e){return localStorage.setItem(this.addPrefix(e.key),btoa(e.value)),Promise.resolve({value:!0})}remove(e){return localStorage.getItem(this.addPrefix(e.key))?(localStorage.removeItem(this.addPrefix(e.key)),Promise.resolve({value:!0})):Promise.reject("Item with given key does not exist")}clear(){for(let e in localStorage)e.indexOf(this.PREFIX)===0&&localStorage.removeItem(e);return Promise.resolve({value:!0})}keys(){let e=Object.keys(localStorage).filter(t=>t.indexOf(this.PREFIX)===0).map(this.removePrefix);return Promise.resolve({value:e})}getPlatform(){return Promise.resolve({value:"web"})}}});var Za={};le(Za,{LocalNotificationsWeb:()=>Vt});var Vt,en=X(()=>{J();Vt=class extends Y{constructor(){super(...arguments),this.pending=[],this.deliveredNotifications=[],this.hasNotificationSupport=()=>{if(!("Notification"in window)||!Notification.requestPermission)return!1;if(Notification.permission!=="granted")try{new Notification("")}catch(e){if(e instanceof Error&&e.name==="TypeError")return!1}return!0}}async getDeliveredNotifications(){let e=[];for(let t of this.deliveredNotifications){let s={title:t.title,id:parseInt(t.tag),body:t.body};e.push(s)}return{notifications:e}}async removeDeliveredNotifications(e){for(let t of e.notifications){let s=this.deliveredNotifications.find(i=>i.tag===String(t.id));s?.close(),this.deliveredNotifications=this.deliveredNotifications.filter(()=>!s)}}async removeDeliveredNotificationsById(e){for(let t of e.ids){let s=this.deliveredNotifications.find(i=>i.tag===String(t));s?.close(),this.deliveredNotifications=this.deliveredNotifications.filter(i=>i!==s)}}async removeAllDeliveredNotifications(){for(let e of this.deliveredNotifications)e.close();this.deliveredNotifications=[]}async getByIds(e){let t=e.ids.map(o=>String(o)),s=this.pending.filter(o=>t.includes(String(o.id))),i=this.deliveredNotifications.filter(o=>t.includes(o.tag)).map(o=>this.deliveredToSchema(o));return{notifications:[...s,...i]}}async getAll(e){let t=[...this.pending],s=this.deliveredNotifications.map(i=>this.deliveredToSchema(i));return e?.state==="SCHEDULED"?{notifications:t}:e?.state==="TRIGGERED"?{notifications:s}:{notifications:[...t,...s]}}deliveredToSchema(e){return{title:e.title,id:parseInt(e.tag),body:e.body}}async createChannel(){throw this.unimplemented("Not implemented on web.")}async deleteChannel(){throw this.unimplemented("Not implemented on web.")}async listChannels(){throw this.unimplemented("Not implemented on web.")}async schedule(e){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");for(let t of e.notifications)this.sendNotification(t);return{notifications:e.notifications.map(t=>({id:t.id}))}}async update(e){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");let t=[];for(let s of e.notifications){let i=this.pending.findIndex(o=>o.id===s.id);i!==-1&&(this.pending.splice(i,1),this.sendNotification(s),t.push(s))}return{notifications:t.map(s=>({id:s.id}))}}async getPending(){return{notifications:this.pending}}async cancelAll(){this.pending=[]}async registerActionTypes(){throw this.unimplemented("Not implemented on web.")}async cancel(e){this.pending=this.pending.filter(t=>!e.notifications.find(s=>s.id===t.id))}async areEnabled(){let{display:e}=await this.checkPermissions();return{value:e==="granted"}}async changeExactNotificationSetting(){throw this.unimplemented("Not implemented on web.")}async checkExactNotificationSetting(){throw this.unimplemented("Not implemented on web.")}async requestPermissions(){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");return{display:this.transformNotificationPermission(await Notification.requestPermission())}}async checkPermissions(){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");return{display:this.transformNotificationPermission(Notification.permission)}}transformNotificationPermission(e){switch(e){case"granted":return"granted";case"denied":return"denied";default:return"prompt"}}sendPending(){var e;let t=[],s=new Date().getTime();for(let i of this.pending)!((e=i.schedule)===null||e===void 0)&&e.at&&i.schedule.at.getTime()<=s&&(this.buildNotification(i),t.push(i));this.pending=this.pending.filter(i=>!t.find(o=>o===i))}sendNotification(e){var t;if(!((t=e.schedule)===null||t===void 0)&&t.at){let s=e.schedule.at.getTime()-new Date().getTime();this.pending.push(e),setTimeout(()=>{this.sendPending()},s);return}this.buildNotification(e)}buildNotification(e){let t=new Notification(e.title,{body:e.body,tag:String(e.id)});return t.addEventListener("click",this.onClick.bind(this,e),!1),t.addEventListener("show",this.onShow.bind(this,e),!1),t.addEventListener("close",()=>{this.deliveredNotifications=this.deliveredNotifications.filter(()=>!this)},!1),this.deliveredNotifications.push(t),t}onClick(e){let t={actionId:"tap",notification:e};this.notifyListeners("localNotificationActionPerformed",t)}onShow(e){this.notifyListeners("localNotificationReceived",e)}}});var Xe,Qe,fn=X(()=>{Xe=class{constructor(e){this.sqlite=e,this._connectionDict=new Map}async initWebStore(){try{return await this.sqlite.initWebStore(),Promise.resolve()}catch(e){return Promise.reject(e)}}async saveToStore(e){try{return await this.sqlite.saveToStore({database:e}),Promise.resolve()}catch(t){return Promise.reject(t)}}async saveToLocalDisk(e){try{return await this.sqlite.saveToLocalDisk({database:e}),Promise.resolve()}catch(t){return Promise.reject(t)}}async getFromLocalDiskToStore(e){let t=e??!0;try{return await this.sqlite.getFromLocalDiskToStore({overwrite:t}),Promise.resolve()}catch(s){return Promise.reject(s)}}async echo(e){try{let t=await this.sqlite.echo({value:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async isSecretStored(){try{let e=await this.sqlite.isSecretStored();return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async setEncryptionSecret(e){try{return await this.sqlite.setEncryptionSecret({passphrase:e}),Promise.resolve()}catch(t){return Promise.reject(t)}}async changeEncryptionSecret(e,t){try{return await this.sqlite.changeEncryptionSecret({passphrase:e,oldpassphrase:t}),Promise.resolve()}catch(s){return Promise.reject(s)}}async clearEncryptionSecret(){try{return await this.sqlite.clearEncryptionSecret(),Promise.resolve()}catch(e){return Promise.reject(e)}}async checkEncryptionSecret(e){try{let t=await this.sqlite.checkEncryptionSecret({passphrase:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async addUpgradeStatement(e,t){try{return e.endsWith(".db")&&(e=e.slice(0,-3)),await this.sqlite.addUpgradeStatement({database:e,upgrade:t}),Promise.resolve()}catch(s){return Promise.reject(s)}}async createConnection(e,t,s,i,o){try{e.endsWith(".db")&&(e=e.slice(0,-3)),await this.sqlite.createConnection({database:e,encrypted:t,mode:s,version:i,readonly:o});let d=new Qe(e,o,this.sqlite),p=o?`RO_${e}`:`RW_${e}`;return this._connectionDict.set(p,d),Promise.resolve(d)}catch(d){return Promise.reject(d)}}async closeConnection(e,t){try{e.endsWith(".db")&&(e=e.slice(0,-3)),await this.sqlite.closeConnection({database:e,readonly:t});let s=t?`RO_${e}`:`RW_${e}`;return this._connectionDict.delete(s),Promise.resolve()}catch(s){return Promise.reject(s)}}async isConnection(e,t){let s={};e.endsWith(".db")&&(e=e.slice(0,-3));let i=t?`RO_${e}`:`RW_${e}`;return s.result=this._connectionDict.has(i),Promise.resolve(s)}async retrieveConnection(e,t){e.endsWith(".db")&&(e=e.slice(0,-3));let s=t?`RO_${e}`:`RW_${e}`;if(this._connectionDict.has(s)){let i=this._connectionDict.get(s);return typeof i<"u"?Promise.resolve(i):Promise.reject(`Connection ${e} is undefined`)}else return Promise.reject(`Connection ${e} does not exist`)}async getNCDatabasePath(e,t){try{let s=await this.sqlite.getNCDatabasePath({path:e,database:t});return Promise.resolve(s)}catch(s){return Promise.reject(s)}}async createNCConnection(e,t){try{await this.sqlite.createNCConnection({databasePath:e,version:t});let s=new Qe(e,!0,this.sqlite),i=`RO_${e})`;return this._connectionDict.set(i,s),Promise.resolve(s)}catch(s){return Promise.reject(s)}}async closeNCConnection(e){try{await this.sqlite.closeNCConnection({databasePath:e});let t=`RO_${e})`;return this._connectionDict.delete(t),Promise.resolve()}catch(t){return Promise.reject(t)}}async isNCConnection(e){let t={},s=`RO_${e})`;return t.result=this._connectionDict.has(s),Promise.resolve(t)}async retrieveNCConnection(e){if(this._connectionDict.has(e)){let t=`RO_${e})`,s=this._connectionDict.get(t);return typeof s<"u"?Promise.resolve(s):Promise.reject(`Connection ${e} is undefined`)}else return Promise.reject(`Connection ${e} does not exist`)}async isNCDatabase(e){try{let t=await this.sqlite.isNCDatabase({databasePath:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async retrieveAllConnections(){return this._connectionDict}async closeAllConnections(){let e=new Map;try{for(let t of this._connectionDict.keys()){let s=t.substring(3),i=t.substring(0,3)==="RO_";await this.sqlite.closeConnection({database:s,readonly:i}),e.set(t,null)}for(let t of e.keys())this._connectionDict.delete(t);return Promise.resolve()}catch(t){return Promise.reject(t)}}async checkConnectionsConsistency(){try{let e=[...this._connectionDict.keys()],t=[],s=[];for(let o of e)t.push(o.substring(0,2)),s.push(o.substring(3));let i=await this.sqlite.checkConnectionsConsistency({dbNames:s,openModes:t});return i.result||(this._connectionDict=new Map),Promise.resolve(i)}catch(e){return this._connectionDict=new Map,Promise.reject(e)}}async importFromJson(e){try{let t=await this.sqlite.importFromJson({jsonstring:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async isJsonValid(e){try{let t=await this.sqlite.isJsonValid({jsonstring:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async copyFromAssets(e){let t=e??!0;try{return await this.sqlite.copyFromAssets({overwrite:t}),Promise.resolve()}catch(s){return Promise.reject(s)}}async getFromHTTPRequest(e,t){let s=t??!0;try{return await this.sqlite.getFromHTTPRequest({url:e,overwrite:s}),Promise.resolve()}catch(i){return Promise.reject(i)}}async isDatabaseEncrypted(e){e.endsWith(".db")&&(e=e.slice(0,-3));try{let t=await this.sqlite.isDatabaseEncrypted({database:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async isInConfigEncryption(){try{let e=await this.sqlite.isInConfigEncryption();return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isInConfigBiometricAuth(){try{let e=await this.sqlite.isInConfigBiometricAuth();return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isDatabase(e){e.endsWith(".db")&&(e=e.slice(0,-3));try{let t=await this.sqlite.isDatabase({database:e});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async getDatabaseList(){try{let t=(await this.sqlite.getDatabaseList()).values;t.sort();let s={values:t};return Promise.resolve(s)}catch(e){return Promise.reject(e)}}async getMigratableDbList(e){let t=e||"default";try{let s=await this.sqlite.getMigratableDbList({folderPath:t});return Promise.resolve(s)}catch(s){return Promise.reject(s)}}async addSQLiteSuffix(e,t){let s=e||"default",i=t||[];try{let o=await this.sqlite.addSQLiteSuffix({folderPath:s,dbNameList:i});return Promise.resolve(o)}catch(o){return Promise.reject(o)}}async deleteOldDatabases(e,t){let s=e||"default",i=t||[];try{let o=await this.sqlite.deleteOldDatabases({folderPath:s,dbNameList:i});return Promise.resolve(o)}catch(o){return Promise.reject(o)}}async moveDatabasesAndAddSuffix(e,t){let s=e||"default",i=t||[];return this.sqlite.moveDatabasesAndAddSuffix({folderPath:s,dbNameList:i})}},Qe=class{constructor(e,t,s){this.dbName=e,this.readonly=t,this.sqlite=s}getConnectionDBName(){return this.dbName}getConnectionReadOnly(){return this.readonly}async open(){try{return await this.sqlite.open({database:this.dbName,readonly:this.readonly}),Promise.resolve()}catch(e){return Promise.reject(e)}}async close(){try{return await this.sqlite.close({database:this.dbName,readonly:this.readonly}),Promise.resolve()}catch(e){return Promise.reject(e)}}async beginTransaction(){try{let e=await this.sqlite.beginTransaction({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async commitTransaction(){try{let e=await this.sqlite.commitTransaction({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async rollbackTransaction(){try{let e=await this.sqlite.rollbackTransaction({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isTransactionActive(){try{let e=await this.sqlite.isTransactionActive({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async loadExtension(e){try{return await this.sqlite.loadExtension({database:this.dbName,path:e,readonly:this.readonly}),Promise.resolve()}catch(t){return Promise.reject(t)}}async enableLoadExtension(e){try{return await this.sqlite.enableLoadExtension({database:this.dbName,toggle:e,readonly:this.readonly}),Promise.resolve()}catch(t){return Promise.reject(t)}}async getUrl(){try{let e=await this.sqlite.getUrl({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async getVersion(){try{let e=await this.sqlite.getVersion({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async getTableList(){try{let e=await this.sqlite.getTableList({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async execute(e,t=!0,s=!0){try{if(this.readonly)return Promise.reject("not allowed in read-only mode");{let i=await this.sqlite.execute({database:this.dbName,statements:e,transaction:t,readonly:!1,isSQL92:s});return Promise.resolve(i)}}catch(i){return Promise.reject(i)}}async query(e,t,s=!0){let i;try{return t&&t.length>0?i=await this.sqlite.query({database:this.dbName,statement:e,values:t,readonly:this.readonly,isSQL92:!0}):i=await this.sqlite.query({database:this.dbName,statement:e,values:[],readonly:this.readonly,isSQL92:s}),i=await this.reorderRows(i),Promise.resolve(i)}catch(o){return Promise.reject(o)}}async run(e,t,s=!0,i="no",o=!0){let d;try{return this.readonly?Promise.reject("not allowed in read-only mode"):(t&&t.length>0?d=await this.sqlite.run({database:this.dbName,statement:e,values:t,transaction:s,readonly:!1,returnMode:i,isSQL92:!0}):d=await this.sqlite.run({database:this.dbName,statement:e,values:[],transaction:s,readonly:!1,returnMode:i,isSQL92:o}),d.changes=await this.reorderRows(d.changes),Promise.resolve(d))}catch(p){return Promise.reject(p)}}async executeSet(e,t=!0,s="no",i=!0){let o;try{return this.readonly?Promise.reject("not allowed in read-only mode"):(o=await this.sqlite.executeSet({database:this.dbName,set:e,transaction:t,readonly:!1,returnMode:s,isSQL92:i}),o.changes=await this.reorderRows(o.changes),Promise.resolve(o))}catch(d){return Promise.reject(d)}}async isExists(){try{let e=await this.sqlite.isDBExists({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isTable(e){try{let t=await this.sqlite.isTableExists({database:this.dbName,table:e,readonly:this.readonly});return Promise.resolve(t)}catch(t){return Promise.reject(t)}}async isDBOpen(){try{let e=await this.sqlite.isDBOpen({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async delete(){try{return this.readonly?Promise.reject("not allowed in read-only mode"):(await this.sqlite.deleteDatabase({database:this.dbName,readonly:!1}),Promise.resolve())}catch(e){return Promise.reject(e)}}async createSyncTable(){try{if(this.readonly)return Promise.reject("not allowed in read-only mode");{let e=await this.sqlite.createSyncTable({database:this.dbName,readonly:!1});return Promise.resolve(e)}}catch(e){return Promise.reject(e)}}async setSyncDate(e){try{return this.readonly?Promise.reject("not allowed in read-only mode"):(await this.sqlite.setSyncDate({database:this.dbName,syncdate:e,readonly:!1}),Promise.resolve())}catch(t){return Promise.reject(t)}}async getSyncDate(){try{let e=await this.sqlite.getSyncDate({database:this.dbName,readonly:this.readonly}),t="";return e.syncDate>0&&(t=new Date(e.syncDate*1e3).toISOString()),Promise.resolve(t)}catch(e){return Promise.reject(e)}}async exportToJson(e,t=!1){try{let s=await this.sqlite.exportToJson({database:this.dbName,jsonexportmode:e,readonly:this.readonly,encrypted:t});return Promise.resolve(s)}catch(s){return Promise.reject(s)}}async deleteExportedRows(){try{return this.readonly?Promise.reject("not allowed in read-only mode"):(await this.sqlite.deleteExportedRows({database:this.dbName,readonly:!1}),Promise.resolve())}catch(e){return Promise.reject(e)}}async executeTransaction(e,t=!0){let s=0,i=!1;if(this.readonly)return Promise.reject("not allowed in read-only mode");if(await this.sqlite.beginTransaction({database:this.dbName}),i=await this.sqlite.isTransactionActive({database:this.dbName}),!i)return Promise.reject("After Begin Transaction, no transaction active");try{for(let p of e){if(typeof p!="object"||!("statement"in p))throw new Error("Error a task.statement must be provided");if("values"in p&&p.values&&p.values.length>0){let r=p.statement.toUpperCase().includes("RETURNING")?"all":"no",g=await this.sqlite.run({database:this.dbName,statement:p.statement,values:p.values,transaction:!1,readonly:!1,returnMode:r,isSQL92:t});if(g.changes.changes<0)throw new Error("Error in transaction method run ");s+=g.changes.changes}else{let r=await this.sqlite.execute({database:this.dbName,statements:p.statement,transaction:!1,readonly:!1});if(r.changes.changes<0)throw new Error("Error in transaction method execute ");s+=r.changes.changes}}let o=await this.sqlite.commitTransaction({database:this.dbName});s+=o.changes.changes;let d={changes:{changes:s}};return Promise.resolve(d)}catch(o){let d=o.message?o.message:o;return await this.sqlite.rollbackTransaction({database:this.dbName}),Promise.reject(d)}}async reorderRows(e){let t=e;if(e?.values&&typeof e.values[0]=="object"&&Object.keys(e.values[0]).includes("ios_columns")){let s=e.values[0].ios_columns,i=[];for(let o=1;o<e.values.length;o++){let d=e.values[o],p={};for(let r of s)p[r]=d[r];i.push(p)}t.values=i}return Promise.resolve(t)}}});var yn={};le(yn,{CapacitorSQLiteWeb:()=>ea});var ea,bn=X(()=>{J();ea=class extends Y{constructor(){super(...arguments),this.jeepSqliteElement=null,this.isWebStoreOpen=!1}async initWebStore(){await customElements.whenDefined("jeep-sqlite"),this.jeepSqliteElement=document.querySelector("jeep-sqlite"),this.ensureJeepSqliteIsAvailable(),this.jeepSqliteElement.addEventListener("jeepSqliteImportProgress",e=>{this.notifyListeners("sqliteImportProgressEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqliteExportProgress",e=>{this.notifyListeners("sqliteExportProgressEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqliteHTTPRequestEnded",e=>{this.notifyListeners("sqliteHTTPRequestEndedEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqlitePickDatabaseEnded",e=>{this.notifyListeners("sqlitePickDatabaseEndedEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqliteSaveDatabaseToDisk",e=>{this.notifyListeners("sqliteSaveDatabaseToDiskEvent",e.detail)}),this.isWebStoreOpen||(this.isWebStoreOpen=await this.jeepSqliteElement.isStoreOpen())}async saveToStore(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.saveToStore(e);return}catch(t){throw new Error(`${t}`)}}async getFromLocalDiskToStore(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.getFromLocalDiskToStore(e);return}catch(t){throw new Error(`${t}`)}}async saveToLocalDisk(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.saveToLocalDisk(e);return}catch(t){throw new Error(`${t}`)}}async echo(e){return this.ensureJeepSqliteIsAvailable(),await this.jeepSqliteElement.echo(e)}async createConnection(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.createConnection(e);return}catch(t){throw new Error(`${t}`)}}async open(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.open(e);return}catch(t){throw new Error(`${t}`)}}async closeConnection(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.closeConnection(e);return}catch(t){throw new Error(`${t}`)}}async getVersion(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getVersion(e)}catch(t){throw new Error(`${t}`)}}async checkConnectionsConsistency(e){this.ensureJeepSqliteIsAvailable();try{return await this.jeepSqliteElement.checkConnectionsConsistency(e)}catch(t){throw new Error(`${t}`)}}async close(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.close(e);return}catch(t){throw new Error(`${t}`)}}async beginTransaction(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.beginTransaction(e)}catch(t){throw new Error(`${t}`)}}async commitTransaction(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.commitTransaction(e)}catch(t){throw new Error(`${t}`)}}async rollbackTransaction(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.rollbackTransaction(e)}catch(t){throw new Error(`${t}`)}}async isTransactionActive(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isTransactionActive(e)}catch(t){throw new Error(`${t}`)}}async getTableList(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getTableList(e)}catch(t){throw new Error(`${t}`)}}async execute(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.execute(e)}catch(t){throw new Error(`${t}`)}}async executeSet(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.executeSet(e)}catch(t){throw new Error(`${t}`)}}async run(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.run(e)}catch(t){throw new Error(`${t}`)}}async query(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.query(e)}catch(t){throw new Error(`${t}`)}}async isDBExists(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isDBExists(e)}catch(t){throw new Error(`${t}`)}}async isDBOpen(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isDBOpen(e)}catch(t){throw new Error(`${t}`)}}async isDatabase(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isDatabase(e)}catch(t){throw new Error(`${t}`)}}async isTableExists(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isTableExists(e)}catch(t){throw new Error(`${t}`)}}async deleteDatabase(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.deleteDatabase(e);return}catch(t){throw new Error(`${t}`)}}async isJsonValid(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isJsonValid(e)}catch(t){throw new Error(`${t}`)}}async importFromJson(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.importFromJson(e)}catch(t){throw new Error(`${t}`)}}async exportToJson(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.exportToJson(e)}catch(t){throw new Error(`${t}`)}}async createSyncTable(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.createSyncTable(e)}catch(t){throw new Error(`${t}`)}}async setSyncDate(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.setSyncDate(e);return}catch(t){throw new Error(`${t}`)}}async getSyncDate(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getSyncDate(e)}catch(t){throw new Error(`${t}`)}}async deleteExportedRows(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.deleteExportedRows(e);return}catch(t){throw new Error(`${t}`)}}async addUpgradeStatement(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.addUpgradeStatement(e);return}catch(t){throw new Error(`${t}`)}}async copyFromAssets(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.copyFromAssets(e);return}catch(t){throw new Error(`${t}`)}}async getFromHTTPRequest(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.getFromHTTPRequest(e);return}catch(t){throw new Error(`${t}`)}}async getDatabaseList(){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getDatabaseList()}catch(e){throw new Error(`${e}`)}}ensureJeepSqliteIsAvailable(){if(this.jeepSqliteElement===null)throw new Error("The jeep-sqlite element is not present in the DOM! Please check the @capacitor-community/sqlite documentation for instructions regarding the web platform.")}ensureWebstoreIsOpen(){if(!this.isWebStoreOpen)throw new Error('WebStore is not open yet. You have to call "initWebStore()" first.')}async getUrl(){throw this.unimplemented("Not implemented on web.")}async getMigratableDbList(e){throw console.log("getMigratableDbList",e),this.unimplemented("Not implemented on web.")}async addSQLiteSuffix(e){throw console.log("addSQLiteSuffix",e),this.unimplemented("Not implemented on web.")}async deleteOldDatabases(e){throw console.log("deleteOldDatabases",e),this.unimplemented("Not implemented on web.")}async moveDatabasesAndAddSuffix(e){throw console.log("moveDatabasesAndAddSuffix",e),this.unimplemented("Not implemented on web.")}async isSecretStored(){throw this.unimplemented("Not implemented on web.")}async setEncryptionSecret(e){throw console.log("setEncryptionSecret",e),this.unimplemented("Not implemented on web.")}async changeEncryptionSecret(e){throw console.log("changeEncryptionSecret",e),this.unimplemented("Not implemented on web.")}async clearEncryptionSecret(){throw console.log("clearEncryptionSecret"),this.unimplemented("Not implemented on web.")}async checkEncryptionSecret(e){throw console.log("checkEncryptionPassPhrase",e),this.unimplemented("Not implemented on web.")}async getNCDatabasePath(e){throw console.log("getNCDatabasePath",e),this.unimplemented("Not implemented on web.")}async createNCConnection(e){throw console.log("createNCConnection",e),this.unimplemented("Not implemented on web.")}async closeNCConnection(e){throw console.log("closeNCConnection",e),this.unimplemented("Not implemented on web.")}async isNCDatabase(e){throw console.log("isNCDatabase",e),this.unimplemented("Not implemented on web.")}async isDatabaseEncrypted(e){throw console.log("isDatabaseEncrypted",e),this.unimplemented("Not implemented on web.")}async isInConfigEncryption(){throw this.unimplemented("Not implemented on web.")}async isInConfigBiometricAuth(){throw this.unimplemented("Not implemented on web.")}async loadExtension(e){throw console.log("loadExtension",e),this.unimplemented("Not implemented on web.")}async enableLoadExtension(e){throw console.log("enableLoadExtension",e),this.unimplemented("Not implemented on web.")}}});var vn,wn=X(()=>{J();fn();vn=G("CapacitorSQLite",{web:()=>Promise.resolve().then(()=>(bn(),yn)).then(n=>new n.CapacitorSQLiteWeb),electron:()=>window.CapacitorCustomPlatform.plugins.CapacitorSQLite})});var Sn={};le(Sn,{accountCollection:()=>ri,deleteRecord:()=>pi,getCollection:()=>ia,getLocalCollections:()=>di,getLocalProfile:()=>mi,initializeLocalDatabase:()=>sa,saveLocalProfile:()=>hi,saveRecord:()=>ui});function be(){return!!Me.isNativePlatform()}function na(n){if(!(Re.includes(n)||/^acct_[A-Za-z0-9_-]{1,128}__(events|tasks|moods|habits|goals|reminders|notes|habitLogs|expenses|subscriptions|assets|transactions|syncOutbox|syncIdMap|profileCache|goalAchievements)$/.test(n)))throw new Error(`Unsupported local collection: ${n}`)}function ri(n,e){if(!Re.includes(e)||!n)throw new Error("Account and valid collection are required.");let t=String(n).replace(/[^A-Za-z0-9_-]/g,"_").slice(0,128);if(!t)throw new Error("Invalid account identifier.");return`acct_${t}__${e}`}function tt(n,e){try{return JSON.parse(n)}catch{return e}}function ci(n){if(!n||typeof n!="object"||Array.isArray(n))throw new Error("A record must be an object.");let e=n.id??n._id,t=e==null?globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`:String(e);return{...n,id:t}}async function li(){if(!be())throw new Error("Native SQLite is only available on a native device.");let n=await Ze.checkConnectionsConsistency(),e=await Ze.isConnection(ta,!1),t;return e.result?t=await Ze.retrieveConnection(ta,!1):t=await Ze.createConnection(ta,!1,"no-encryption",oi,!1),(await t.isDBOpen()).result||await t.open(),await t.execute(`
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
  `),t}async function Ee(){return et||(et=li().catch(n=>{throw et=null,n})),et}async function sa(){return be()?(await Ee(),{driver:"sqlite",collections:[...Re]}):{driver:"localStorage",collections:[...Re]}}function di(){return[...Re]}async function ia(n){return na(n),be()?((await(await Ee()).query("SELECT payload FROM records WHERE collection = ? ORDER BY updated_at ASC",[n])).values||[]).map(s=>tt(s.payload,null)).filter(s=>s!==null):tt(localStorage.getItem(`${aa}${n}`)||"[]",[])}async function ui(n,e){na(n);let t=ci(e);if(!be()){let i=await ia(n),o=i.findIndex(d=>String(d.id??d._id)===t.id);return o>=0?i[o]={...i[o],...t}:i.push(t),localStorage.setItem(`${aa}${n}`,JSON.stringify(i)),t}return await(await Ee()).run(`INSERT INTO records (collection, id, payload)
     VALUES (?, ?, ?)
     ON CONFLICT(collection, id) DO UPDATE SET
       payload = excluded.payload,
       updated_at = CURRENT_TIMESTAMP`,[n,t.id,JSON.stringify(t)]),t}async function pi(n,e){na(n);let t=String(e);if(!be()){let o=(await ia(n)).filter(d=>String(d.id??d._id)!==t);localStorage.setItem(`${aa}${n}`,JSON.stringify(o));return}await(await Ee()).run("DELETE FROM records WHERE collection = ? AND id = ?",[n,t])}async function mi(){if(!be())return tt(localStorage.getItem(xn)||"null",null);let e=await(await Ee()).query("SELECT payload FROM profile WHERE profile_key = ?",["profile"]);return e.values?.length?tt(e.values[0].payload,null):null}async function hi(n){if(!n||typeof n!="object"||Array.isArray(n))throw new Error("Profile must be an object.");return be()?(await(await Ee()).run(`INSERT INTO profile (profile_key, payload)
     VALUES (?, ?)
     ON CONFLICT(profile_key) DO UPDATE SET payload = excluded.payload`,["profile",JSON.stringify(n)]),n):(localStorage.setItem(xn,JSON.stringify(n)),n)}var ta,oi,Re,xn,aa,Ze,et,oa=X(()=>{J();wn();ta="sahra_local",oi=1,Re=["events","tasks","moods","habits","goals","reminders","notes","habitLogs","expenses","subscriptions","assets","transactions","syncOutbox","syncIdMap","profileCache","goalAchievements"],xn="sahra.local.profile",aa="sahra.local.records.",Ze=new Xe(vn),et=null});var $n={};le($n,{Geolocation:()=>wi,GeolocationWeb:()=>it});var it,wi,En=X(()=>{J();it=class extends Y{constructor(){if(super(),this.latestOrientation=null,typeof window<"u"){let e=window;"ondeviceorientationabsolute"in e?e.addEventListener("deviceorientationabsolute",t=>this.updateOrientation(t,!0),!0):"ondeviceorientation"in e&&e.addEventListener("deviceorientation",t=>this.updateOrientation(t,!1),!0)}}updateOrientation(e,t){let s=null,i=null,o=null;t&&e.alpha!==null?s=(360-e.alpha)%360:e.webkitCompassHeading!==void 0&&e.webkitCompassHeading!==null?(i=e.webkitCompassHeading,o=e.webkitCompassAccuracy):e.alpha!==null&&e.absolute===!0?s=(360-e.alpha)%360:e.alpha!==null&&(i=(360-e.alpha)%360),(s!==null||i!==null)&&(this.latestOrientation={trueHeading:s,magneticHeading:i,headingAccuracy:o})}augmentPosition(e,t=!1){var s,i,o,d,p,r,g;let h=e.coords,f=t?this.latestOrientation:null,x=(o=(i=(s=f?.trueHeading)!==null&&s!==void 0?s:f?.magneticHeading)!==null&&i!==void 0?i:t?h.heading:null)!==null&&o!==void 0?o:null;return{timestamp:e.timestamp,coords:{latitude:h.latitude,longitude:h.longitude,accuracy:h.accuracy,altitude:h.altitude,altitudeAccuracy:h.altitudeAccuracy,speed:h.speed,heading:x,magneticHeading:(d=f?.magneticHeading)!==null&&d!==void 0?d:null,trueHeading:(p=f?.trueHeading)!==null&&p!==void 0?p:null,headingAccuracy:(r=f?.headingAccuracy)!==null&&r!==void 0?r:null,course:(g=t?h.heading:null)!==null&&g!==void 0?g:null}}}async getCurrentPosition(e){return new Promise((t,s)=>{navigator.geolocation.getCurrentPosition(i=>{t(this.augmentPosition(i,!1))},i=>{s(i)},Object.assign({enableHighAccuracy:!1,timeout:1e4,maximumAge:0},e))})}async watchPosition(e,t){return`${navigator.geolocation.watchPosition(i=>{t(this.augmentPosition(i,!0))},i=>{t(null,i)},Object.assign({enableHighAccuracy:!1,timeout:1e4,maximumAge:0,minimumUpdateInterval:5e3},e))}`}async clearWatch(e){navigator.geolocation.clearWatch(parseInt(e.id,10))}async checkPermissions(){if(typeof navigator>"u"||!navigator.permissions)throw this.unavailable("Permissions API not available in this browser");let e=await navigator.permissions.query({name:"geolocation"});return{location:e.state,coarseLocation:e.state}}async requestPermissions(){throw this.unimplemented("Not implemented on web.")}},wi=new it});var xi,ra,Si,Nn=X(()=>{xi="__capgo_keep_url_path_after_reload",ra="__capgo_history_stack__",Si=typeof window<"u"&&typeof document<"u"&&typeof history<"u";if(Si){let n=window;if(!n.__capgoHistoryPatched){n.__capgoHistoryPatched=!0;let e=()=>{try{if(n.__capgoKeepUrlPathAfterReload)return!0}catch{}try{return window.localStorage.getItem(xi)==="1"}catch{return!1}},t=()=>{try{let S=window.sessionStorage.getItem(ra);if(!S)return{stack:[],index:-1};let u=JSON.parse(S);return!u||!Array.isArray(u.stack)||typeof u.index!="number"?{stack:[],index:-1}:u}catch{return{stack:[],index:-1}}},s=(S,u)=>{try{window.sessionStorage.setItem(ra,JSON.stringify({stack:S,index:u}))}catch{}},i=()=>{try{window.sessionStorage.removeItem(ra)}catch{}},o=S=>{try{let u=S??window.location.href,l=new URL(u instanceof URL?u.toString():u,window.location.href);return`${l.pathname}${l.search}${l.hash}`}catch{return null}},d=(S,u)=>{if(S.length<=100)return{stack:S,index:u};let l=S.length-100,m=S.slice(l),y=Math.max(0,u-l);return{stack:m,index:y}},p=S=>{document.readyState==="complete"||document.readyState==="interactive"?S():window.addEventListener("DOMContentLoaded",S,{once:!0})},r=!1,g=!1,h=!1,f=()=>{if(!r)return;let S=t(),u=o();if(u){if(S.stack.length===0){S.stack.push(u),S.index=0,s(S.stack,S.index);return}(S.index<0||S.index>=S.stack.length)&&(S.index=S.stack.length-1),S.stack[S.index]!==u&&(S.stack[S.index]=u,s(S.stack,S.index))}},x=(S,u)=>{if(!r||g)return;let l=o(S);if(!l)return;let{stack:m,index:y}=t();m.length===0?(m.push(l),y=m.length-1):u?((y<0||y>=m.length)&&(y=m.length-1),m[y]=l):y>=m.length-1?(m.push(l),y=m.length-1):(m=m.slice(0,y+1),m.push(l),y=m.length-1),{stack:m,index:y}=d(m,y),s(m,y)},I=()=>{if(!r||g)return;let S=t();if(S.stack.length===0){f();return}let u=S.index>=0&&S.index<S.stack.length?S.index:S.stack.length-1,l=o();if(S.stack.length===1&&l===S.stack[0])return;let m=S.stack[0];if(!m)return;g=!0;try{history.replaceState(history.state,document.title,m);for(let N=1;N<S.stack.length;N+=1)history.pushState(history.state,document.title,S.stack[N])}catch{g=!1;return}g=!1;let y=S.stack.length-1,b=u-y;b!==0?history.go(b):(history.replaceState(history.state,document.title,S.stack[u]),window.dispatchEvent(new PopStateEvent("popstate")))},E=()=>{!r||h||(h=!0,p(()=>{h=!1,I()}))},T=null,w=null,D=()=>{if(!r||g)return;let S=o();if(!S)return;let u=t(),l=u.stack.lastIndexOf(S);l>=0?u.index=l:(u.stack.push(S),u.index=u.stack.length-1);let m=d(u.stack,u.index);s(m.stack,m.index)},q=()=>{T&&w||(T=history.pushState,w=history.replaceState,history.pushState=function(u,l,m){let y=T?.call(history,u,l,m);return x(m,!1),y},history.replaceState=function(u,l,m){let y=w?.call(history,u,l,m);return x(m,!0),y},window.addEventListener("popstate",D))},F=()=>{T&&(history.pushState=T,T=null),w&&(history.replaceState=w,w=null),window.removeEventListener("popstate",D)},L=S=>{if(r===S){r&&(f(),E());return}r=S,r?(q(),f(),E()):(F(),i())};window.addEventListener("CapacitorUpdaterKeepUrlPathAfterReload",S=>{var u;let l=S,m=(u=l?.detail)===null||u===void 0?void 0:u.enabled;typeof m=="boolean"?(n.__capgoKeepUrlPathAfterReload=m,L(m)):(n.__capgoKeepUrlPathAfterReload=!0,L(!0))}),L(e())}}});var rt,Tn,Dn,ca=X(()=>{(function(n){n[n.UNKNOWN=0]="UNKNOWN",n[n.UPDATE_NOT_AVAILABLE=1]="UPDATE_NOT_AVAILABLE",n[n.UPDATE_AVAILABLE=2]="UPDATE_AVAILABLE",n[n.UPDATE_IN_PROGRESS=3]="UPDATE_IN_PROGRESS"})(rt||(rt={}));(function(n){n[n.UNKNOWN=0]="UNKNOWN",n[n.PENDING=1]="PENDING",n[n.DOWNLOADING=2]="DOWNLOADING",n[n.INSTALLING=3]="INSTALLING",n[n.INSTALLED=4]="INSTALLED",n[n.FAILED=5]="FAILED",n[n.CANCELED=6]="CANCELED",n[n.DOWNLOADED=11]="DOWNLOADED"})(Tn||(Tn={}));(function(n){n[n.OK=0]="OK",n[n.CANCELED=1]="CANCELED",n[n.FAILED=2]="FAILED",n[n.NOT_AVAILABLE=3]="NOT_AVAILABLE",n[n.NOT_ALLOWED=4]="NOT_ALLOWED",n[n.INFO_MISSING=5]="INFO_MISSING"})(Dn||(Dn={}))});var In={};le(In,{CapacitorUpdaterWeb:()=>la});var ve,la,Cn=X(()=>{J();ca();ve={status:"success",version:"",downloaded:"1970-01-01T00:00:00.000Z",id:"builtin",checksum:""},la=class extends Y{async setStatsUrl(e){console.warn("Cannot setStatsUrl in web",e)}async setUpdateUrl(e){console.warn("Cannot setUpdateUrl in web",e)}async setChannelUrl(e){console.warn("Cannot setChannelUrl in web",e)}async download(e){return console.warn("Cannot download version in web",e),ve}async next(e){return console.warn("Cannot set next version in web",e),ve}async isAutoUpdateEnabled(){return console.warn("Cannot get isAutoUpdateEnabled in web"),{enabled:!1}}async set(e){console.warn("Cannot set active bundle in web",e)}async startPreviewSession(e){console.warn("Cannot start preview session in web",e)}async listPreviews(){return console.warn("Cannot list previews in web"),{previews:[],currentBundle:ve}}async setPreview(e){console.warn("Cannot set preview in web",e)}async resetPreview(){console.warn("Cannot reset preview in web")}async deletePreview(e){return console.warn("Cannot delete preview in web",e),{removed:!1,deleted:!1}}async checkPreviewUpdate(e){throw console.warn("Cannot check preview update in web",e),this.unimplemented("Preview updates are not available on web platform")}async updatePreview(e){throw console.warn("Cannot update preview in web",e),this.unimplemented("Preview updates are not available on web platform")}async getDeviceId(){return console.warn("Cannot get ID in web"),{deviceId:"default"}}async getBuiltinVersion(){return console.warn("Cannot get version in web"),{version:"default"}}async getPluginVersion(){return console.warn("Cannot get plugin version in web"),{version:"default"}}async delete(e){console.warn("Cannot delete bundle in web",e)}async setBundleError(e){return console.warn("Cannot setBundleError in web",e),ve}async list(){return console.warn("Cannot list bundles in web"),{bundles:[]}}async reset(e){console.warn("Cannot reset version in web",e)}async current(){return console.warn("Cannot get current bundle in web"),{bundle:ve,native:"0.0.0"}}async reload(){console.warn("Cannot reload current bundle in web")}async getLatest(){return console.warn("Cannot getLatest current bundle in web"),{version:"0.0.0",message:"Cannot getLatest current bundle in web"}}async triggerUpdateCheck(){return console.warn("Cannot triggerUpdateCheck in web"),{status:"unavailable",queued:!1}}async getMissingBundleFiles(e){var t,s,i;console.warn("Cannot inspect missing bundle files in web",{manifestLength:(s=(t=e.manifest)===null||t===void 0?void 0:t.length)!==null&&s!==void 0?s:0});let o=(i=e.manifest)!==null&&i!==void 0?i:[];return{missing:o,total:o.length,missingCount:o.length,reusableCount:0}}async getBundleDownloadSize(e){var t,s,i,o,d;return console.warn("Cannot estimate bundle download size in web",{manifestLength:(s=(t=e.manifest)===null||t===void 0?void 0:t.length)!==null&&s!==void 0?s:0}),{totalSize:0,knownFiles:0,unknownFiles:(o=(i=e.manifest)===null||i===void 0?void 0:i.length)!==null&&o!==void 0?o:0,files:((d=e.manifest)!==null&&d!==void 0?d:[]).map(p=>({file_name:p.file_name,file_hash:p.file_hash,download_url:p.download_url,error:"unavailable"}))}}async setChannel(e){return console.warn("Cannot setChannel in web",e),{status:"error",error:"Cannot setChannel in web"}}async unsetChannel(e){console.warn("Cannot unsetChannel in web",e)}async setCustomId(e){console.warn("Cannot setCustomId in web",e)}async getChannel(){return console.warn("Cannot getChannel in web"),{status:"error",error:"Cannot getChannel in web"}}async listChannels(){throw console.warn("Cannot listChannels in web"),{message:"Cannot listChannels in web",error:"platform_not_supported"}}async notifyAppReady(){return{bundle:ve}}async setMultiDelay(e){console.warn("Cannot setMultiDelay in web",e?.delayConditions)}async cancelDelay(){console.warn("Cannot cancelDelay in web")}async isAutoUpdateAvailable(){return console.warn("Cannot isAutoUpdateAvailable in web"),{available:!1}}async getCurrentBundle(){return console.warn("Cannot get current bundle in web"),ve}async getNextBundle(){return Promise.resolve(null)}async getFailedUpdate(){return console.warn("Cannot getFailedUpdate in web"),null}async setShakeMenu(e){throw this.unimplemented("Shake menu not available on web platform")}async isShakeMenuEnabled(){return Promise.resolve({enabled:!1,gesture:"shake"})}async setShakeChannelSelector(e){throw this.unimplemented("Shake channel selector not available on web platform")}async isShakeChannelSelectorEnabled(){return Promise.resolve({enabled:!1})}async getAppId(){return console.warn("Cannot getAppId in web"),{appId:"default"}}async setAppId(e){console.warn("Cannot setAppId in web",e)}async getAppUpdateInfo(e){return console.warn("getAppUpdateInfo is not available on web platform"),{currentVersionName:"0.0.0",currentVersionCode:"0",updateAvailability:rt.UNKNOWN}}async openAppStore(e){throw this.unimplemented("openAppStore is not available on web platform")}async performImmediateUpdate(){throw this.unimplemented("performImmediateUpdate is only available on Android")}async startFlexibleUpdate(){throw this.unimplemented("startFlexibleUpdate is only available on Android")}async completeFlexibleUpdate(){throw this.unimplemented("completeFlexibleUpdate is only available on Android")}}});var Pn,Ln=X(()=>{J();Nn();ca();Pn=G("CapacitorUpdater",{web:()=>Promise.resolve().then(()=>(Cn(),In)).then(n=>new n.CapacitorUpdaterWeb)})});var On={};le(On,{markSahraOtaReady:()=>Ai});async function Ai(){if(!(da||!window.Capacitor?.isNativePlatform())){da=!0;try{await Pn.notifyAppReady(),console.info("Sahra OTA: app marked ready.")}catch(n){da=!1,console.error("Sahra OTA: readiness notification failed.",n)}}}var da,Mn=X(()=>{Ln();da=!1});var ms={};le(ms,{AppWeb:()=>Pa});var Pa,hs=X(()=>{J();Pa=class extends Y{constructor(){super(),this.handleVisibilityChange=()=>{let e={isActive:document.hidden!==!0};this.notifyListeners("appStateChange",e),document.hidden?this.notifyListeners("pause",null):this.notifyListeners("resume",null)},document.addEventListener("visibilitychange",this.handleVisibilityChange,!1)}exitApp(){throw this.unimplemented("Not implemented on web.")}async getInfo(){throw this.unimplemented("Not implemented on web.")}async getLaunchUrl(){return{url:""}}async getState(){return{isActive:document.hidden!==!0}}async minimizeApp(){throw this.unimplemented("Not implemented on web.")}async toggleBackButtonHandler(){throw this.unimplemented("Not implemented on web.")}async getAppLanguage(){return{value:navigator.language.split("-")[0].toLowerCase()}}}});var bs={};le(bs,{SpeechRecognition:()=>yo,SpeechRecognitionWeb:()=>$t});var $t,yo,vs=X(()=>{J();$t=class extends Y{available(){throw this.unimplemented("Method not implemented on web.")}start(e){throw this.unimplemented("Method not implemented on web.")}stop(){throw this.unimplemented("Method not implemented on web.")}getSupportedLanguages(){throw this.unimplemented("Method not implemented on web.")}hasPermission(){throw this.unimplemented("Method not implemented on web.")}isListening(){throw this.unimplemented("Method not implemented on web.")}requestPermission(){throw this.unimplemented("Method not implemented on web.")}checkPermissions(){throw this.unimplemented("Method not implemented on web.")}requestPermissions(){throw this.unimplemented("Method not implemented on web.")}},yo=new $t});J();var We=G("SecureStoragePlugin",{web:()=>Promise.resolve().then(()=>(Ka(),Va)).then(n=>new n.SecureStoragePluginWeb)});function Xa(n){let e=typeof n=="string"?n:n?.message||n?.error||"";return String(e).includes("Item with given key does not exist")}window.SAHRA_AUTH_STORAGE={async get(n){try{return(await We.get({key:n}))?.value??null}catch(e){if(Xa(e))return null;throw e}},async set(n,e){await We.set({key:n,value:e})},async remove(n){try{await We.remove({key:n})}catch(e){if(Xa(e))return;throw e}}};J();var Qa;(function(n){n[n.Sunday=1]="Sunday",n[n.Monday=2]="Monday",n[n.Tuesday=3]="Tuesday",n[n.Wednesday=4]="Wednesday",n[n.Thursday=5]="Thursday",n[n.Friday=6]="Friday",n[n.Saturday=7]="Saturday"})(Qa||(Qa={}));var B=G("LocalNotifications",{web:()=>Promise.resolve().then(()=>(en(),Za)).then(n=>new n.LocalNotificationsWeb)});var an="sahraNativeNotificationIds",Kt="daysyncNativeNotificationSignature",Ye="daysyncNotificationPermission",zs="daysyncPendingFocusAlarmAction",de=localStorage.getItem(Ye)||"unknown",tn=!1,Xt=Promise.resolve();function ye(){return!!window.Capacitor?.isNativePlatform?.()}function nn(){try{let n=JSON.parse(localStorage.getItem(an)||"[]");return Array.isArray(n)?n.filter(Number.isInteger):[]}catch{return[]}}function sn(n){localStorage.setItem(an,JSON.stringify([...new Set(n)]))}function on(n){return n?.display?n.display:"unknown"}async function Je(){if(!ye())return{display:"unsupported"};try{let n=await B.checkPermissions();return de=on(n),localStorage.setItem(Ye,de),window.dispatchEvent(new CustomEvent("daysync:permissions-updated")),n}catch(n){return console.warn("Could not check notification permission:",n),{display:de}}}async function rn(){if(!ye())return{display:"unsupported"};let n=await Je();if(n.display==="granted")return n;try{let e=await B.requestPermissions();return de=on(e),localStorage.setItem(Ye,de),window.dispatchEvent(new CustomEvent("daysync:permissions-updated")),e}catch(e){return console.warn("Notification permission request failed:",e),de="denied",localStorage.setItem(Ye,de),{display:de}}}function Gs(n){return JSON.stringify(n.map(e=>({id:e.id,title:e.title,body:e.body,at:e.schedule?.at instanceof Date?e.schedule.at.getTime():null,channelId:e.channelId||"",sound:e.sound||"",extra:e.extra||{}})).sort((e,t)=>e.id-t.id))}async function Ws(n,{requestPermission:e=!1}={}){if(!ye())return{native:!1,scheduled:0,permission:"unsupported"};await Xt;let t=await Je();if(t.display!=="granted"&&e&&(t=await rn()),t.display!=="granted")return{native:!0,scheduled:0,permission:t.display||"denied"};let s=(Array.isArray(n)?n:[]).filter(p=>Number.isInteger(p?.id)&&p?.schedule?.at instanceof Date&&Number.isFinite(p.schedule.at.getTime())&&p.schedule.at.getTime()>Date.now()),i=Gs(s),o=localStorage.getItem(Kt)||"",d=nn();if(i===o)return{native:!0,scheduled:s.length,permission:"granted",unchanged:!0};if(d.length)try{await B.cancel({notifications:d.map(p=>({id:p}))})}catch(p){console.warn("Could not cancel old reminders:",p.message)}return s.length&&await B.schedule({notifications:s}),sn(s.map(p=>p.id)),localStorage.setItem(Kt,i),{native:!0,scheduled:s.length,permission:"granted"}}async function Ys(){if(!ye())return;let n=nn();n.length&&await B.cancel({notifications:n.map(e=>({id:e}))}),sn([]),localStorage.removeItem(Kt)}function Js(n){if(!(!n||!["stop","reset"].includes(n.actionId))){if(!window.SAHRA_FOCUS_TIMER_READY||typeof window.SAHRA_HANDLE_FOCUS_ALARM_ACTION!="function"){try{localStorage.setItem(zs,JSON.stringify(n))}catch{}return}window.SAHRA_HANDLE_FOCUS_ALARM_ACTION(n)}}async function Vs(){if(!(!ye()||tn)){tn=!0;try{await B.registerActionTypes({types:[{id:"daysync-focus-alarm",actions:[{id:"stop",title:"Stop",destructive:!0,foreground:!0},{id:"reset",title:"Reset",foreground:!0}]}]})}catch(n){console.warn("Focus Timer notification actions could not be registered:",n.message)}if(window.Capacitor.getPlatform()==="android"){try{await B.createChannel({id:"daysync-reminders",name:"DaySync reminders",description:"Task and calendar reminders from DaySync",importance:4,visibility:1,sound:"default",vibration:!0})}catch(n){console.warn("Could not create DaySync reminders channel:",n.message)}try{await B.createChannel({id:"daysync-focus-alarm",name:"DaySync Focus Timer",description:"Focus session completion alarm",importance:5,visibility:1,sound:"daysync_alarm.wav",vibration:!0,lights:!0})}catch(n){console.warn("Could not create Focus Timer alarm channel:",n.message)}}await B.addListener("localNotificationActionPerformed",n=>{let e=n?.notification||{},t=e.extra||{},s=String(n?.actionId||"tap").toLowerCase();if(t.type==="focus-alarm"){let o=["stop","reset"].includes(s)?s:"reset";Js({actionId:o,sessionId:String(t.sessionId||"")}),B.cancel({notifications:[{id:e.id}]}).catch(()=>{}),B.removeDeliveredNotifications({notifications:[{id:e.id}]}).catch(()=>{});return}if(!/^\d{4}-\d{2}-\d{2}$/.test(t.date||""))return;let i="/index.html";window.location.href=`${i}?date=${encodeURIComponent(t.date)}&resource=${encodeURIComponent(t.resource||"")}&id=${encodeURIComponent(t.id||"")}`})}}window.SAHRA_NOTIFICATIONS={isNative:ye,permissionStatus:Je,requestPermission:rn,reconcile:Ws,cancelAllSahraNotifications:Ys,getCachedPermission:()=>de,get ready(){return Xt}};Xt=Vs().catch(n=>{console.error("Native notification setup failed:",n.message)});document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&ye()&&Je()});function Ks(n){return new Date(n.getTime()-n.getTimezoneOffset()*6e4).toISOString().slice(0,10)}function Q(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Ve(n){if(!n)return"Not set";let e=String(n).match(/^(\d{1,2}):(\d{2})$/);if(!e)return Q(n);let t=Number(e[1]),s=e[2],i=t>=12?"PM":"AM";return`${t%12||12}:${s} ${i}`}function Xs(n){if(!n)return"Not set";let e=new Date(`${n}T00:00:00`);return Number.isNaN(e.getTime())?Q(n):e.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}function Qt(){return`
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
  `}function Qs(n){let e=n.calendarDetail;if(!e)return"";let t=e.item||{},i=(e.type||"task")==="event",o=t.title||"Untitled",d=Xs(t.date),p=t.description?Q(t.description):"No description",r=t.category?Q(t.category):"General",g=i?"Scheduled":t.status||(t.completed?"Completed":"Pending"),h=String(g).toLowerCase().replace(/\s+/g,"-");return`
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
              ${i?"\u{1F4C5}":"\u2705"}
            </span>

            <span>
              ${i?"Event":"Task"}
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
            ${Q(o)}
          </h3>


          <div class="calendar-detail-info">

            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                \u{1F4C5}
              </span>

              <div>
                <small>Date</small>
                <strong>${d}</strong>
              </div>

            </div>


            ${i?`
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      \u{1F550}
                    </span>

                    <div>
                      <small>Time</small>

                      <strong>
                        ${Ve(t.startTime)}
                        ${t.endTime?` - ${Ve(t.endTime)}`:""}
                      </strong>

                    </div>

                  </div>
                `:`
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      \u{1F550}
                    </span>

                    <div>
                      <small>Time</small>
                      <strong>
                        ${t.time?Ve(t.time):"No time set"}
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
                <strong>${r}</strong>
              </div>

            </div>


            ${i?"":`
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      \u{1F4CC}
                    </span>

                    <div>
                      <small>Priority</small>
                      <strong>
                        ${Q(t.priority||"Normal")}
                      </strong>
                    </div>

                  </div>
                `}


            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                ${i?"\u{1F4CD}":"\u{1F535}"}
              </span>

              <div>

                <small>Status</small>

                <strong>
                  <span class="calendar-status-badge ${h}">
                    ${Q(g)}
                  </span>
                </strong>

              </div>

            </div>

          </div>


          <div class="calendar-detail-description">

            <h4>Description</h4>

            <p>
              ${p}
            </p>

          </div>

        </div>


        <div class="calendar-detail-footer">

          <button
            class="calendar-detail-delete"
            type="button"
            data-action="${i?"delete-calendar-event":"delete-calendar-task"}"
            data-${i?"event-id":"task-id"}="${Q(t.id||t._id||"")}"
          >
            ${Qt()}
            Delete ${i?"Event":"Task"}
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
  `}function cn(n){let t=`
    ${["January","February","March","April","May","June","July","August","September","October","November","December"][n.currentMonth]}
    ${n.currentYear}
  `,s=new Date(`${n.selectedDate}T00:00:00`),o=(new Date(n.currentYear,n.currentMonth,1).getDay()+6)%7,d=new Date(n.currentYear,n.currentMonth+1,0).getDate(),p=new Date(n.currentYear,n.currentMonth,0).getDate(),r={"\u{1F60A}":"\u{1F60A}","\u{1F610}":"\u{1F610}","\u{1F622}":"\u{1F622}","\u{1F621}":"\u{1F621}","\u{1F634}":"\u{1F634}","\u{1F525}":"\u{1F525}","\u{1F60D}":"\u{1F60D}"},g=["\u{1F60A}","\u{1F610}","\u{1F622}","\u{1F621}","\u{1F634}","\u{1F525}","\u{1F60D}"],h={};n.data.moods.forEach(w=>{h[w.date]=w.mood});let f=n.data.events.filter(w=>w.date===n.selectedDate),x=n.data.tasks.filter(w=>w.date===n.selectedDate),I=n.data.moods.find(w=>w.date===n.selectedDate)?.mood||"\u{1F60A}",E=[];for(let w=0;w<o;w+=1)E.push({blank:!0,value:p-o+w+1});for(let w=1;w<=d;w+=1){let D=new Date(n.currentYear,n.currentMonth,w),q=Ks(D);E.push({blank:!1,value:w,iso:q,mood:h[q]||""})}for(;E.length%7!==0;)E.push({blank:!0,value:E.length-d-o+1});return`

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
            ${t}
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

          ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(w=>`
                <div class="calendar-weekday">
                  ${w}
                </div>
              `).join("")}


          ${E.map(w=>{let D=w.iso||"",q=D===n.selectedDate,F=D?n.data.events.filter(l=>l.date===D):[],L=D?n.data.tasks.filter(l=>l.date===D):[],S=D?n.data.moods.find(l=>l.date===D)?.mood:null,u=[];return F.length&&u.push('<span class="mini-indicator event"></span>'),L.length&&u.push('<span class="mini-indicator task"></span>'),S&&u.push('<span class="mini-indicator mood"></span>'),`

                <button

                  class="
                    calendar-day
                    ${w.blank?"dim":""}
                    ${q?"selected":""}
                  "

                  type="button"

                  data-date="${D}"

                  ${w.blank?"disabled":""}

                >

                  <span>
                    ${w.value}
                  </span>


                  ${u.length?`
                        <span class="calendar-indicators">
                          ${u.join("")}
                        </span>
                      `:""}

                </button>

              `}).join("")}

        </div>

      </div>



      <!-- SELECTED DAY -->

      <div class="glass-card layout-card">

        <div class="card-header">

          <h3>

            ${s.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}

          </h3>


          <div class="mood-selector-wrap">

            <button
              class="mood-selector-toggle"
              type="button"
              data-action="toggle-mood-picker"
              aria-label="Select mood"
            >
              ${r[I]||I}
            </button>


            ${n.moodPickerOpen?`

                  <div class="mood-selector-panel">

                    ${g.map(w=>`

                          <button
                            type="button"
                            class="
                              mood-picker-emoji
                              ${I===w?"selected":""}
                            "
                            data-mood-value="${w}"
                            aria-label="Choose mood ${w}"
                          >
                            ${w}
                          </button>

                        `).join("")}

                  </div>

                `:""}

          </div>

        </div>



        <!-- EVENTS -->

        <div class="life-card-section">

          <h4>
            \u{1F4C5} Events
          </h4>


          ${f.length?f.map(w=>{let D=w.id||w._id;return`

                      <div
                        class="calendar-entry-row event-row"
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-event"
                        data-event-id="${Q(D||"")}"
                      >

                        <span class="calendar-entry-time">
                          ${Ve(w.startTime)}
                        </span>


                        <strong class="calendar-entry-title">
                          ${Q(w.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-event"
                          data-event-id="${Q(D||"")}"
                          aria-label="Delete event"
                          title="Delete event"
                        >
                          ${Qt()}
                        </button>

                      </div>

                    `}).join(""):`
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


          ${x.length?x.map(w=>{let D=w.id||w._id,q=w.completed||w.status==="Completed";return`

                      <div
                        class="
                          calendar-entry-row
                          task-row
                          ${q?"completed-row":""}
                        "
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-task"
                        data-task-id="${Q(D||"")}"
                      >

                        <span class="calendar-entry-time">
                          ${Q(w.status||(q?"Completed":"Pending"))}
                        </span>


                        <strong class="calendar-entry-title">
                          ${Q(w.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-task"
                          data-task-id="${Q(D||"")}"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          ${Qt()}
                        </button>

                      </div>

                    `}).join(""):`
                <p class="mini-empty">
                  No tasks
                </p>
              `}

        </div>

      </div>


      <!-- DETAIL POPUP -->

      ${Qs(n)}

    </section>

  `}function ln(n){let e=["\u{1F60A}","\u{1F610}","\u{1F622}","\u{1F621}","\u{1F634}","\u{1F525}","\u{1F60D}"],t=e.reduce((s,i)=>(s[i]=n.data.moods.filter(o=>o.mood===i).length,s),{});return`
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
          ${e.map(s=>`
            <button class="mood-pill ${s==="\u{1F60A}"?"selected":""}" type="button">${s}</button>
          `).join("")}
        </div>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Monthly mood</h3>
        </div>
        <div class="list">
          ${e.map(s=>`
            <div class="list-item">
              <span class="dot"></span>
              <div>
                <strong>${s} ${s==="\u{1F525}"?"Motivated":s==="\u{1F60A}"?"Happy":s==="\u{1F610}"?"Normal":s==="\u{1F634}"?"Tired":s==="\u{1F622}"?"Sad":s==="\u{1F621}"?"Angry":"Excited"}</strong>
                <small>${t[s]||0} days</small>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `}function dn(n){let e=n.data.tasks||[],t=n.todoFilter||"All",s=new Date(new Date().getTime()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10),o=e.map(r=>({...r,id:r.id||r._id,status:r.status||(r.completed?"Completed":"Pending"),priority:r.priority||"Normal",title:r.title||"Untitled task",date:r.date||s,time:r.time||null})).filter(r=>{let g=r.status==="Completed"||r.completed;return t==="Pending"?!g:t==="Completed"?g:t==="Today"?r.date===s:!0}),d=["All","Pending","Completed","Today"],p=o.length?o.map(r=>{let g=r.status==="Completed"||r.completed,h=(r.priority||"Normal").toLowerCase(),f=r.date?new Date(`${r.date}T00:00:00`).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"No date",x=r.time?new Date(`2000-01-01T${r.time}`).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}):"All day";return`
          <div class="todo-item ${g?"completed":""}">
            <button class="todo-check ${g?"checked":""}" type="button" data-action="toggle-task" data-task-id="${r.id}">${g?"\u2713":""}</button>

            <div class="todo-content">
              <div class="todo-title-row">
                <h4 class="${g?"done":""}">${r.title}</h4>
                <div class="todo-actions">
                  <button class="icon-btn" type="button" data-action="edit-task" data-task-id="${r.id}" aria-label="Edit task">\u270E</button>
                  <button class="icon-btn" type="button" data-action="delete-task" data-task-id="${r.id}" aria-label="Delete task">\u{1F5D1}</button>
                </div>
              </div>

              <div class="todo-meta">
                <span>\u{1F4C5} ${f}</span>
                <span>\u2022</span>
                <span>${x}</span>
              </div>

              <div class="priority-badge ${h}">${r.priority||"Normal"}</div>
            </div>
          </div>
        `}).join(""):'<div class="todo-item"><div class="todo-content"><div class="todo-title-row"><h4>No tasks yet.</h4></div></div></div>';return`
   

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
        ${d.map(r=>`<button class="filter-btn ${t===r?"active":""}" type="button" data-task-filter="${r}">${r==="All"?"\u{1F4CB}":r==="Pending"?"\u25EF":r==="Completed"?"\u2713":"\u{1F5D3}\uFE0F"} ${r==="All"?"All":r==="Pending"?"Pending":r==="Completed"?"Completed":"Today"}</button>`).join("")}
      </div>

      <div class="task-create-action">
        <button class="task-create-button" type="button" data-action="open-add-entry" data-type="task" aria-label="Add new task">+</button>
      </div>

      <div class="todo-list">
        ${p}
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
  `}function un(n){return`
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
          ${n.data.habits.map(e=>{let t=Math.min(100,e.progress/e.goal*100);return`
              <div class="progress-row">
                <div class="progress-label">
                  <span>${e.name}</span>
                  <strong>${e.progress}/${e.goal}</strong>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${t}%"></div>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    </section>
  `}function pn(n){return`
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
          ${n.data.goals.map(e=>`
            <div class="progress-row">
              <div class="progress-label">
                <span>${e.title}</span>
                <strong>${e.progress}%</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${e.progress}%"></div>
              </div>
              <small style="color: var(--muted);">${e.current} / ${e.target} days</small>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `}function Ke(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function mn(n={}){let e=Array.isArray(n.assistantMessages)&&n.assistantMessages.length?n.assistantMessages:[{role:"assistant",text:"I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress."}],t=n.assistantLoading?"disabled":"",s=String(n.user?.name||"Sahra").match(/[A-Za-z]/)?.[0]?.toUpperCase()||"S";return`
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
        ${e.map(i=>{let o=i.role==="user";return i.role==="system"?`
              <div class="assistant-system-row" role="status" aria-live="polite">
                <div class="assistant-system-note">${Ke(i.text)}</div>
              </div>
            `:`
            <div class="chat-row ${o?"user-row":"assistant-row"}">
              ${o?"":'<div class="chat-avatar bot-avatar">\u{1F916}</div>'}
              <div class="message-bubble ${o?"user-bubble":"assistant-bubble"}">${Ke(i.text)}</div>
              ${o?`<div class="chat-avatar user-avatar" aria-label="Your profile">${s}</div>`:""}
            </div>
            ${!o&&i.retryRequestId?`<div class="chat-row assistant-row"><div class="chat-avatar bot-avatar">\u{1F916}</div><button class="link-btn" type="button" data-assistant-retry="${Ke(i.retryRequestId)}" data-retry-message="${Ke(i.retryMessage||"")}" ${t}>Retry request</button></div>`:""}
          `}).join("")}

        ${n.assistantLoading?'<div class="message-time">Sahra is thinking...</div>':""}
        <div class="assistant-scroll-anchor" aria-hidden="true"></div>
      </div>

      <div class="assistant-composer assistant-fixed-composer">
        <!-- Replace your old mic emoji/icon with this -->
    <button type="button" data-action="toggle-mic" style="background: transparent; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;">
    <img src="mic.png" alt="Mic" class="mic-icon" id="chat-mic-img" style="width: 45px; height: 45px; object-fit: contain;">
    </button>
        <input class="assistant-input" type="text" placeholder="Type a message or speak..." aria-label="Type a message" ${t} />
        <button class="composer-send" type="button" aria-label="Send message" ${t}>\u27A4</button>
      </div>
    </section>
  `}function Zt(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function hn(n){let e=n?.data?.assets&&n.data.assets.length>0?n.data.assets:n?.data?.notes||[],t=(n.noteSearchQuery||"").toLowerCase(),s=e.filter(o=>{let d=(o.title||"").toLowerCase(),p=(o.content||o.description||"").toLowerCase();return d.includes(t)||p.includes(t)}),i=["note-yellow","note-blue","note-pink","note-green","note-purple","note-orange"];return`
    <div class="notepad-container ${n.notepadSearchOpen?"search-open":""}">
      <!-- Glowing Glassmorphic Top Header[cite: 3] -->
     <div class="notepad-page-header"
     style="background: linear-gradient(135deg, rgba(28, 42, 82, 0.65), rgba(13, 23, 52, 0.85)); border: 1px solid rgba(122, 180, 255, 0.4); border-radius: 24px; padding: 22px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 0 25px rgba(88, 140, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.18); margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">Notepad</h1>
          <span style="font-size: 0.85rem; color: #9fb4df; margin-top: 4px; display: block;">${e.length} saved</span>
        </div>
        
        <button data-action="toggle-notepad-search" style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #8ad4ff, #5092ff); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 18px rgba(80, 146, 255, 0.6), inset 0 1px 2px rgba(255,255,255,0.6); transition: transform 0.2s;">
          <svg width="22" height="22" fill="none" stroke="#0a1930" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      <!-- Search Bar -->
      <div style="margin-bottom: 24px; ${n.notepadSearchOpen?"display: block;":"display: none;"}">
        <input type="text" data-action="notepad-search-input" value="${Zt(n.noteSearchQuery||"")}" placeholder="Search notes..." style="width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(122, 180, 255, 0.3); outline: none; font-size: 1rem; color: #1e293b; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.15); box-sizing: border-box;" />
      </div>

      <!-- Notes Grid -->
      <div class="notepad-notes">
        ${s.length===0?'<div style="text-align:center; color:rgba(255,255,255,0.4); padding: 40px 0;">No notes found.</div>':""}
        ${s.map((o,d)=>{let p=o.createdAt?new Date(o.createdAt):new Date,r=[String(p.getDate()).padStart(2,"0"),String(p.getMonth()+1).padStart(2,"0"),p.getFullYear()].join("/"),g=o.id||o._id;return`
            <div class="${i[d%i.length]}" style="border-radius: 16px; padding: 20px; position: relative;">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; padding-right: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${Zt(o.title||"Untitled")}
                </h3>
                
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                  <button data-action="edit-note" data-note-id="${g}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">\u270F\uFE0F</button>
                  <button data-action="delete-note" data-note-id="${g}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">\u{1F5D1}\uFE0F</button>
                </div>
              </div>
              
              <p style="font-size: 0.95rem; margin: 0 0 16px 0; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${Zt(o.content||o.description||"")}</p>
              
              <div style="display: flex; align-items: center; font-size: 0.85rem; font-weight: 500; opacity: 0.85;">
                <svg style="width: 16px; height: 16px; margin-right: 6px; opacity: 0.8;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${r}
              </div>

            </div>
          `}).join("")}
      </div>
      
<!-- FLOATING ADD BUTTON (+) FIXED & STRICTLY LOCKED TO PHONE FRAME -->
      <div style="position: fixed; bottom: 180px; left: 49%; transform: translateX(-50%); width: 100%; max-width: 430px; display: flex; justify-content: flex-end; padding-right: 20px; box-sizing: border-box; pointer-events: none; z-index: 9999;">
        
        <button data-action="open-add-entry" data-type="note" style="pointer-events: auto; width: 56px; height: 56px; border-radius: 50%; background: #6366f1; color: white; border: none; font-size: 28px; font-weight: 300; cursor: pointer; box-shadow: 0 4px 15px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center;">
          +
        </button>
        
      </div>

    </div>
  `}function Zs(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function gn(n){let e=n.financeView||"dashboard",t=n.financeData||[],s=(n.financeSearchQuery||"").toLowerCase(),i=n.financeTypeFilter||"all";t.filter(r=>{let g=(r.category||r.title||"").toLowerCase().includes(s),h=String(r.amount||"").includes(s),f=i==="all"||r.type===i;return(g||h)&&f}).sort((r,g)=>new Date(g.date)-new Date(r.date));let d=`
    <div style="display: flex; gap: 10px; margin-bottom: 16px; position: relative; z-index: 10;">
        <input 
            type="text" 
            data-action="finance-search" 
            placeholder="Search transactions..." 
            value="${(n.financeSearchQuery||"").replace(/"/g,"&quot;")}"
            style="flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; outline: none;"
        />
        <select 
            data-action="finance-filter" 
            style="padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: #1a1a2e; color: white; outline: none; cursor: pointer;"
        >
            <option value="all" ${i==="all"?"selected":""}>All</option>
            <option value="income" ${i==="income"?"selected":""}>Income</option>
            <option value="expense" ${i==="expense"?"selected":""}>Expense</option>
        </select>
    </div>
`,p="";return e==="add-choice"?p=ai(n):e==="add-expense"?p=ni(n):e==="transactions"?p=ti(t,n):p=ei(t,n),n.financeDetail&&(p+=si(n.financeDetail)),n.showFinanceResetConfirm&&(p+=ii(n)),p}function ei(n,e){let t=e.financeFilter||"week",s=new Date;s.setHours(0,0,0,0);let i=n.filter(E=>{let T=new Date(E.date||Date.now());if(T.setHours(0,0,0,0),t==="week"){let w=(s-T)/864e5;return w>=0&&w<7}return t==="month"?T.getMonth()===s.getMonth()&&T.getFullYear()===s.getFullYear():t==="year"?T.getFullYear()===s.getFullYear():!0}),o=0,d=0;i.forEach(E=>{let T=Number(E.amount)||0;E.type==="income"&&(o+=T),E.type==="expense"&&(d+=T)});let p=o-d,r=t==="week"?"Weekly Breakdown":t==="month"?"Monthly Breakdown":"Yearly Breakdown",g=o+d,h=0,f=0,x=0;g>0&&(h=o/g*360,f=Math.round(o/g*100),x=Math.round(d/g*100));let I=g>0?`conic-gradient(#34d399 0deg ${h}deg, #f87171 ${h}deg 360deg)`:"rgba(255,255,255,0.05)";return`
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
          class="finance-dashboard-title-copy"
          style="
            position: relative;
            z-index: 2;
            text-align: left;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: flex-start;
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
            ${new Date().toLocaleString("default",{month:"long",year:"numeric"})}
          </div>
        </div>
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
          \u20B9${p.toFixed(2)}
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
              \u20B9${o.toFixed(2)}
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
              \u20B9${d.toFixed(2)}
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
          class="${t==="week"?"active":""}"
          data-action="set-finance-filter"
          data-filter="week"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${t==="week"?"linear-gradient(135deg, #3b82f6, #1d4ed8)":"transparent"};
            color:
              ${t==="week"?"white":"#8b92a5"};
            border:
              ${t==="week"?"1px solid rgba(255,255,255,0.3)":"none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${t==="week"?"0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)":"none"};
            transition: all 0.2s;
          "
        >
          Week
        </button>

        <button
          class="${t==="month"?"active":""}"
          data-action="set-finance-filter"
          data-filter="month"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${t==="month"?"linear-gradient(135deg, #3b82f6, #1d4ed8)":"transparent"};
            color:
              ${t==="month"?"white":"#8b92a5"};
            border:
              ${t==="month"?"1px solid rgba(255,255,255,0.3)":"none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${t==="month"?"0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)":"none"};
            transition: all 0.2s;
          "
        >
          Month
        </button>

        <button
          class="${t==="year"?"active":""}"
          data-action="set-finance-filter"
          data-filter="year"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${t==="year"?"linear-gradient(135deg, #3b82f6, #1d4ed8)":"transparent"};
            color:
              ${t==="year"?"white":"#8b92a5"};
            border:
              ${t==="year"?"1px solid rgba(255,255,255,0.3)":"none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${t==="year"?"0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)":"none"};
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
            ${r}
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
              background: ${I};
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
                \u20B9${d.toFixed(2)}
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
              ${f}%
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
              ${x}%
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
  `}function ti(n,e){let t=Array.isArray(n)?[...n]:[];if(t.sort((d,p)=>new Date(p.date||0)-new Date(d.date||0)),t.length===0)return`
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
    `;let s={};return t.forEach(d=>{let p=new Date(d.date);if(Number.isNaN(p.getTime()))return;let r=p.getFullYear(),g=p.getMonth(),h=`${r}-${String(g+1).padStart(2,"0")}`;s[h]||(s[h]={year:r,month:g,transactions:[]}),s[h].transactions.push(d)}),`
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
      ${Object.values(s).sort((d,p)=>d.year!==p.year?p.year-d.year:p.month-d.month).map(d=>{let p=new Date(d.year,d.month,1).toLocaleDateString("en-IN",{month:"long"}),r=d.transactions.sort((g,h)=>new Date(h.date||0)-new Date(g.date||0)).map(g=>{let h=g.type==="expense",f=h?"-":"+",x=h?"#ff8f9c":"#63e6b1",I=g._id||g.id,E=Zs(g.category||g.title||"Transaction"),w=new Date(g.date).toLocaleDateString("en-IN");return`
          <button
            class="finance-transaction-row"
            type="button"
            data-action="show-transaction-detail"
            data-id="${I}"
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
                  ${E}
                </div>

                <div
                  style="
                    margin-top: 4px;
                    color: #8b92a5;
                    font-size: 0.82rem;
                  "
                >
                  ${w}
                </div>

              </div>

            </div>

            <!-- AMOUNT -->
            <div
              style="
                color: ${x};
                font-size: 1.05rem;
                font-weight: 800;
                white-space: nowrap;
                flex-shrink: 0;
              "
            >
              ${f}\u20B9${Math.abs(Number(g.amount)||0).toFixed(2)}
            </div>

          </button>
        `}).join("");return`
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
            ${d.year}
          </div>

          <div class="finance-month-name"
            style="
              color: #f2f3f5;
              font-size: 1.75rem;
              font-weight: 500;
              line-height: 1.1;
            "
          >
            ${p}
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
          ${r}
        </div>

      </section>
    `}).join("")}

    </div>
  `}function ai(n){return`
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
  `}function ni(n){let e=n.tempFinanceType||"expense",t=e==="income";return`
    <div class="finance-entry-page" style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 130px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; display: flex; flex-direction: column; box-sizing: border-box;">
      
      <!-- Top Bar -->
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <button data-action="set-finance-view" data-view="add-choice" style="background: linear-gradient(135deg, #222634, #14161c); border: 1px solid rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.25); width: 42px; height: 42px; border-radius: 14px; color: white; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; margin-right: 16px; box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);">\u2190</button>
        <h1 style="font-size: 1.3rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Add ${t?"Income":"Expense"} Details</h1>
      </div>

      <!-- Amount Input Card -->
      <div class="finance-amount-card" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.25); border-radius: 24px; padding: 24px; text-align: center; margin-bottom: 24px; box-shadow: 0 16px 35px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15);">
        <div style="color: #8b92a5; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 8px;">ENTER AMOUNT</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span style="font-size: 2.2rem; font-weight: 700; color: ${t?"#34d399":"#60a5ff"}; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">\u20B9</span>
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
              ${t?`
                <option value="Salary" style="background: #14161c;">\u{1F4B0} Salary</option>
                <option value="Freelance" style="background: #14161c;">\u{1F4BB} Freelance & Gigs</option>
                <option value="Investments" style="background: #14161c;">\u{1F4C8} Investments</option>
                <option value="Business" style="background: #14161c;">\u{1F3E2} Business</option>
                <option value="Gift" style="background: #14161c;">\u{1F381} Gift / Other</option>
              `:`
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
          <input type="date" id="finance-date" value="${new Date().toISOString().split("T")[0]}" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; text-transform: uppercase; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);" />
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">NOTE (OPTIONAL)</label>
          <input type="text" id="finance-note" placeholder="Add a short note or description..." style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);" />
        </div>

      </div>

      <!-- 3D Action Button -->
      <button data-action="save-finance-transaction" data-type="${e}" style="width: 100%; padding: 18px; border-radius: 100px; background: ${t?"linear-gradient(135deg, #34d399, #059669)":"linear-gradient(135deg, #60a5ff, #2563eb)"}; color: white; border: none; border-top: 1px solid rgba(255,255,255,0.5); font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 12px 30px ${t?"rgba(5, 150, 105, 0.5)":"rgba(37, 99, 235, 0.5)"}, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Save Transaction
      </button>

    </div>
  `}function si(n){if(!n)return"";let e=n.type==="expense",t=e?"-":"+",s=n._id||n.id,o=new Date(n.date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),d=n.note?String(n.note).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):"No description provided";return`
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
                    ${n.category||"Transaction"} <span class="finance-transaction-detail-amount ${e?"expense":"income"}" style="color: ${e?"#fca5a5":"#6ee7b7"}; font-size: 1.4rem; margin-left: 8px;">${t}\u20B9${Math.abs(n.amount).toFixed(2)}</span>
                </h2>

                <!-- Detail Cards -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
                    
                    <!-- Date Row -->
                    <div class="finance-transaction-detail-row" style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #93c5fd;">\u{1F4C5}</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">Date</div>
                            <div style="color: white; font-size: 0.95rem; font-weight: 600;">${o}</div>
                        </div>
                    </div>

                    <!-- Payment Method Row -->
                    <div class="finance-transaction-detail-row" style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #d8b4fe;">\u{1F4B3}</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">Payment Method</div>
                            <div style="color: white; font-size: 0.95rem; font-weight: 600;">${n.paymentMethod||"Unknown"}</div>
                        </div>
                    </div>

                    <!-- Status / Type Row -->
                    <div class="finance-transaction-detail-row" style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #fca5a5;">\u{1F4CC}</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px;">Status</div>
                            <div class="finance-transaction-detail-status" style="display: inline-block; background: ${e?"rgba(239, 68, 68, 0.15)":"rgba(16, 185, 129, 0.15)"}; color: ${e?"#fca5a5":"#6ee7b7"}; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize;">${n.type}</div>
                        </div>
                    </div>

                </div>

                <!-- Description -->
                <div class="finance-transaction-detail-description" style="margin-bottom: 24px;">
                    <div style="color: #e2e8f0; font-size: 0.9rem; font-weight: 600; margin-bottom: 8px;">Description</div>
                    <div style="color: #94a3b8; font-size: 0.95rem; line-height: 1.5;">
                        ${d}
                    </div>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background: #232a3e; margin: 0 -24px 20px -24px;"></div>

                <!-- Footer Actions -->
                <div style="display: flex; gap: 12px;">
                    <button data-action="delete-finance-transaction" data-id="${s}" style="flex: 1; background: #2d1f2b; border: 1px solid #4b2c39; color: #f472b6; padding: 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;">
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
    `}function ii(n){return`
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
                    <button data-action="cancel-finance-reset" ${n.financeResetLoading?"disabled":""} style="flex: 1; background: #202638; border: 1px solid #2e364f; color: white; padding: 14px; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        Cancel
                    </button>
                    <button data-action="confirm-finance-reset" ${n.financeResetLoading?"disabled":""} style="flex: 1; background: linear-gradient(135deg, #ef4444, #b91c1c); border: none; color: white; padding: 14px; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);">
                        ${n.financeResetLoading?"Resetting\u2026":"Yes, Reset Transactions"}
                    </button>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        </div>
    `}oa();var gi=new Set(["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","transactions","expenses","subscriptions","goalAchievements"]);function fi(n){try{let e=String(n||"").split(".")[1];if(!e)return null;let t=e.replace(/-/g,"+").replace(/_/g,"/"),s=JSON.parse(atob(t.padEnd(Math.ceil(t.length/4)*4,"="))),i=s.id||s.sub||s.userId;return i?String(i):null}catch{return null}}function nt(){return globalThis.crypto?.randomUUID?.()||`local-${Date.now()}-${Math.random().toString(36).slice(2)}`}function yi(n){return String(n||"").split("?")[0].replace(/^\/+/,"")}function An(n,e={}){let t=yi(n).replace(/^api\//,""),[s]=t.split("/"),o={events:"events",tasks:"tasks",moods:"moods",habits:"habits",goals:"goals",reminders:"reminders",notes:"notes","habit-logs":"habitLogs",assets:"assets","goal-achievements":"goalAchievements",transactions:"transactions",expenses:"transactions",subscriptions:"transactions"}[s];return o?{collection:o,root:s,id:t.split("/")[1]||null}:null}function at(n){return!n||typeof n!="object"?null:{...n,id:String(n.id||n._id||nt())}}var st=class{constructor({getToken:e,fetchImpl:t=(...o)=>fetch(...o),baseUrl:s=()=>"",storage:i=null}){this.getToken=e,this.fetchImpl=t,this.baseUrl=s,this.storage=i,this.storagePromise=null,this.flushing=!1}async db(){return this.storage?this.storage:(this.storagePromise||(this.storagePromise=Promise.resolve().then(()=>(oa(),Sn))),this.storagePromise)}async scoped(e,t){return(await this.db()).accountCollection(e,t)}async getNamed(e){return(await this.db()).getCollection(e)}async saveNamed(e,t){return(await this.db()).saveRecord(e,t)}async deleteNamed(e,t){return(await this.db()).deleteRecord(e,t)}async accountId(e){let t=fi(e);if(!t)throw new Error("The signed-in token does not contain an account ID; offline cache is disabled for safety.");return t}async collectionName(e,t){return this.scoped(await this.accountId(e),t)}async read(e,t){return this.getNamed(await this.collectionName(e,t))}async write(e,t,s){return this.saveNamed(await this.collectionName(e,t),at(s))}async remove(e,t,s){return this.deleteNamed(await this.collectionName(e,t),String(s))}async cacheDashboard(e,t){let s=await this.accountId(e),i=t?.data||{};for(let o of["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","goalAchievements"]){let d=await this.scoped(s,o),p=Array.isArray(i[o])?i[o]:[];if(!(await this.read(e,"syncOutbox")).some(h=>h.collection===o)){for(let h of await this.getNamed(d))await this.deleteNamed(d,h.id??h._id);for(let h of p)await this.saveNamed(d,at(h))}}await this.write(e,"profileCache",{id:"dashboard",payload:{user:t?.user||null}}).catch(()=>{})}async cacheSuccessfulMutation(e,t,s={},i={}){let o=String(s.method||"GET").toUpperCase();if(!["POST","PUT","PATCH","DELETE"].includes(o))return;let d=An(t,s.body?JSON.parse(s.body):{});if(!d)return;let p=s.body?JSON.parse(s.body):{},r=i.event||i.task||i.mood||i.habit||i.goal||i.goalAchievement||i.reminder||i.asset||i.transaction||i.note;if(o==="DELETE"){let h=await this.accountId(e),f=await this.scoped(h,d.collection);if(d.id)await this.deleteNamed(f,d.id);else for(let x of await this.getNamed(f))await this.deleteNamed(f,x.id||x._id);return}let g=at(r||p);g&&await this.write(e,d.collection,{...g,_offlinePending:!1})}async cacheTransactions(e,t){if((await this.read(e,"syncOutbox")).some(o=>o.collection==="transactions"))return;let i=await this.read(e,"transactions");for(let o of i)await this.remove(e,"transactions",o.id??o._id);for(let o of Array.isArray(t)?t:[])await this.write(e,"transactions",o)}async dashboardFallback(e){let[t,...s]=await Promise.all([this.read(e,"profileCache"),...["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","goalAchievements"].map(d=>this.read(e,d))]),o=Object.fromEntries(["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","goalAchievements"].map((d,p)=>[d,s[p]]));return{user:t.find(d=>d.id==="dashboard")?.payload?.user||null,data:o,offline:!0}}async transactionFallback(e){return this.read(e,"transactions")}async enqueueAndApply(e,t,s={}){let i=String(s.method||"GET").toUpperCase(),o=An(t,s.body?JSON.parse(s.body):{});if(!o||!gi.has(o.collection))throw new Error("This action is not supported offline. Reconnect and try again.");let d=await this.accountId(e),p=s.body?JSON.parse(s.body):{},r=await this.scoped(d,o.collection),g=await this.scoped(d,"syncOutbox"),h=await this.getNamed(r),f=o.id,x=s.idempotencyKey||nt(),I=f,E=null;if(i==="POST"){if(I=nt(),E=at({...p,id:I,_offlinePending:!0,updatedAt:new Date().toISOString()}),o.collection==="transactions"&&(E.type=p.type||"expense",E.date=p.date||new Date().toISOString().slice(0,10)),o.collection==="moods"){let w=h.find(D=>D.date===p.date);w&&(I=w.id,E={...w,...p,id:I,_offlinePending:!0,updatedAt:new Date().toISOString()})}await this.saveNamed(r,E)}else if(i==="PUT"||i==="PATCH"){let w=h.find(D=>String(D.id||D._id)===String(f));if(!w&&o.collection!=="goalAchievements")throw new Error("Cannot edit this item offline because it is not in the local cache. Reconnect and retry.");E={...w,...p,id:String(f),_offlinePending:!0,updatedAt:new Date().toISOString()},await this.saveNamed(r,E)}else if(i==="DELETE")if(f)await this.deleteNamed(r,f);else for(let w of h)await this.deleteNamed(r,w.id||w._id);else throw new Error("Unsupported offline operation.");let T={id:nt(),idempotencyKey:x,accountId:d,path:String(t),method:i,body:p,collection:o.collection,localId:I,serverId:i==="POST"?null:f,createdAt:new Date().toISOString(),attempts:0,status:"pending"};return await this.saveNamed(g,T),i==="DELETE"?{message:"Deleted locally; will sync when online.",offline:!0}:{message:"Saved on this device; will sync when online.",offline:!0,[o.collection==="transactions"?"transaction":o.collection.slice(0,-1)]:E,id:I}}async flush(e){if(this.flushing||!e||!globalThis.navigator?.onLine)return{synced:0,pending:!0};this.flushing=!0;let t=0,s=Date.now()+7e3;try{let i=await this.accountId(e),o=await this.scoped(i,"syncOutbox"),d=await this.scoped(i,"syncIdMap"),p=(await this.getNamed(o)).sort((h,f)=>String(h.createdAt).localeCompare(String(f.createdAt))),r=await this.getNamed(d),g=new Map(r.map(h=>[String(h.localId),String(h.serverId)]));for(let h of p){if(Date.now()>=s)break;let f=h.path;for(let[D,q]of g)f=f.replace(`/${D}`,`/${q}`);let x,I=null,E=typeof AbortController<"u"?new AbortController:null;try{let D=Math.max(1,s-Date.now());E&&(I=setTimeout(()=>E.abort(),Math.min(4500,D))),x=await this.fetchImpl(`${this.baseUrl()}${f}`,{method:h.method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`,"Idempotency-Key":h.idempotencyKey},...E?{signal:E.signal}:{},...h.method==="GET"||h.method==="HEAD"?{}:{body:JSON.stringify(h.body||{})}})}catch(D){console.warn("[OfflineSync] Network request failed:",D?.name||"Error",D?.message||"Unknown network error");break}finally{I!==null&&clearTimeout(I)}let T=await x.json().catch(()=>({}));if(!x.ok){h.attempts=Number(h.attempts||0)+1,h.lastError=T.message||`HTTP ${x.status}`,console.warn("[OfflineSync] Server rejected queued operation:",x.status,h.method,h.path),await this.saveNamed(o,h);break}let w=T.event||T.task||T.mood||T.habit||T.goal||T.goalAchievement||T.reminder||T.asset||T.transaction||T.note;if(h.method==="POST"&&w?.id&&h.localId){let D=await this.scoped(i,h.collection),F=(await this.getNamed(D)).find(L=>String(L.id)===String(h.localId));F&&(await this.deleteNamed(D,h.localId),await this.saveNamed(D,{...F,...w,id:String(w.id),_offlinePending:!1})),await this.saveNamed(d,{id:h.localId,localId:String(h.localId),serverId:String(w.id)}),g.set(String(h.localId),String(w.id))}else if(["PUT","PATCH"].includes(h.method)&&w?.id){let D=await this.scoped(i,h.collection);await this.saveNamed(D,{...w,id:String(w.id),_offlinePending:!1})}await this.deleteNamed(o,h.id),t+=1}return{synced:t,pending:(await this.getNamed(o)).length>0}}finally{this.flushing=!1}}async handleNetworkFailure(e,t,s,i){if(!globalThis.navigator?.onLine||i instanceof TypeError||i?.name==="TypeError")return this.enqueueAndApply(e,t,s);throw i}};J();function bi(n){n.CapacitorUtils.Synapse=new Proxy({},{get(e,t){return new Proxy({},{get(s,i){return(o,d,p)=>{let r=n.Capacitor.Plugins[t];if(r===void 0){p(new Error(`Capacitor plugin ${t} not found`));return}if(typeof r[i]!="function"){p(new Error(`Method ${i} not found in Capacitor plugin ${t}`));return}(async()=>{try{let g=await r[i](o);d(g)}catch(g){p(g)}})()}}})}})}function vi(n){n.CapacitorUtils.Synapse=new Proxy({},{get(e,t){return n.cordova.plugins[t]}})}function kn(n=!1){typeof window>"u"||(window.CapacitorUtils=window.CapacitorUtils||{},window.Capacitor!==void 0&&!n?bi(window):window.cordova!==void 0&&vi(window))}var ot=G("Geolocation",{web:()=>Promise.resolve().then(()=>(En(),$n)).then(n=>new n.GeolocationWeb)});kn();var mt={events:[],tasks:[],moods:[],habits:[],goals:[],reminders:[],notes:[],habitLogs:[],goalAchievements:[],expenses:[],subscriptions:[],assets:[]},Rn=!1,_n=!1,qn=!1,Fn=null;window.SAHRA_APP_READY=!1;function H(n){return new Date(n.getTime()-n.getTimezoneOffset()*6e4).toISOString().slice(0,10)}function P(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ma(n=""){return P(n)}function Z(n){if(!n)return"";let e=String(n).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(e))return e;let t=new Date(n);return Number.isNaN(t.getTime())?"":H(t)}function ki(n=""){return String(n).replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&amp;/gi,"&").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().toLocaleLowerCase("en")}function Te(n){let e=n?.title??n?.name??n?.text??"";return ki(e)==="tytyty"}function _e(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)}function jn(n){if(!n)return"This month";let e=new Date(`${String(n).slice(0,10)}T00:00:00`);return Number.isNaN(e.getTime())?String(n):e.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}function $i(n){let e=new Date(n);if(Number.isNaN(e.getTime()))return"This month";let t=Date.now()-e.getTime();return t>=0&&t<3600*1e3?`${Math.max(1,Math.floor(t/6e4))} min ago`:t>=0&&t<1440*60*1e3?`${Math.floor(t/36e5)} hours ago`:e.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}var as=new URLSearchParams(window.location.search).get("date"),Bn=/^\d{4}-\d{2}-\d{2}$/.test(as||""),a={view:Bn?"calendar":"home",currentMonth:new Date().getMonth(),currentYear:new Date().getFullYear(),selectedDate:Bn?as:H(new Date),authenticated:!1,localDatabaseReady:!1,data:{...mt},user:JSON.parse(localStorage.getItem("sahraUser")||"null")||{name:"DaySync User"},themePreference:["system","light","dark"].includes(localStorage.getItem("themePreference"))?localStorage.getItem("themePreference"):"system",theme:(()=>{let n=localStorage.getItem("themePreference");return n==="light"||n==="dark"?n:window.matchMedia?.("(prefers-color-scheme: light)").matches?"light":"dark"})(),goalAchievementItems:[],goalAchievementFilter:"All",goalAchievementEditingId:null,focusSeconds:1500,focusInitialSeconds:1500,focusRunning:!1,focusStartedAt:null,focusEndsAt:null,focusAlarmActive:!1,focusAlarmStartedAt:null,focusSessionId:null,focusLastCompletedId:null,focusSessions:JSON.parse(localStorage.getItem("sahraFocusSessions")||"[]"),focusStatsData:null,focusLabel:"Study session",menuOpen:!1,profileEditing:!1,profileDraft:null,moreMenuOpen:!1,entryModalOpen:!1,notepadSearchOpen:!1,noteSearchQuery:"",entryDraft:null,todoFilter:"All",moodPickerOpen:!1,navigationHistory:[],assistantMessages:[{role:"assistant",text:"I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress."}],assistantLoading:!1,assistantForceScroll:!1,assistantGeneration:0,assistantDraft:"",voiceListening:!1,progressPickerOpen:!1,progressData:null,progressLoading:!1,showAllActivity:!1,calendarCache:new Set,financeView:"dashboard",financeData:[],financeFilter:"week",financeSearchQuery:"",financeTypeFilter:"all",financeDetail:null,showFinanceResetConfirm:!1,financeResetLoading:!1,tempFinanceType:null,resetOptionsSelected:{tasks:!1,notepad:!1,expenses:!1,calendar:!1,progress:!1,goalAchievements:!1,focus:!1},resetConfirmOpen:!1,resetOptionsBusy:!1,settingsInfoPanel:"",weather:{status:"idle",data:null,locationLabel:"",error:"",updatedAt:null,requestId:0}};a.goalAchievementItems=pe();var Un=null,z=new st({getToken:ge,baseUrl:()=>String(window.SAHRA_API_BASE_URL||"").replace(/\/+$/,"")});function wt(n="system",e={}){let t=["system","light","dark"].includes(n)?n:"system",s=t==="system",i=!!window.matchMedia?.("(prefers-color-scheme: light)").matches,o=s?i?"light":"dark":t;a.themePreference=t,a.theme=o,document.documentElement.setAttribute("data-theme",o),document.documentElement.style.colorScheme=o,document.body.setAttribute("data-theme",o),document.body.style.colorScheme=o,document.body.classList.toggle("theme-light",o==="light"),document.body.classList.toggle("theme-dark",o==="dark"),localStorage.setItem("theme",o),e.persistPreference!==!1&&localStorage.setItem("themePreference",t);let d=document.querySelector('meta[name="theme-color"]');d&&d.setAttribute("content",o==="light"?"#f8faff":"#071126"),window.dispatchEvent(new CustomEvent("daysync:theme-changed",{detail:{theme:o,preference:t,followsSystem:s}}))}function $(n){let e=document.querySelector(".app-toast");e&&e.remove();let t=document.createElement("div");t.className="app-toast",t.textContent=n,document.body.appendChild(t),setTimeout(()=>t.classList.add("show"),10),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>t.remove(),300)},3e3)}window.alert=function(n){$(n)};function ct(n,e,t="Delete"){let s=document.createElement("div");s.className="sahra-confirm-overlay",s.style.cssText="position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px);";let i=document.createElement("div");i.className="sahra-confirm-box",i.style.cssText="background:var(--panel-bg, #1a1a2e); padding:24px; border-radius:16px; width:80%; max-width:320px; text-align:center; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5);";let o=document.createElement("p");o.className="sahra-confirm-message",o.textContent=n,o.style.cssText="color:white; margin-bottom:24px; font-size:1.05rem; font-weight: 500;";let d=document.createElement("div");d.style.cssText="display:flex; gap:12px; justify-content:center;";let p=document.createElement("button");p.textContent="Cancel",p.type="button",p.className="secondary-btn sahra-confirm-cancel",p.style.flex="1";let r=document.createElement("button");r.textContent=t,r.className="primary-btn compact-btn",r.classList.add("sahra-confirm-submit"),r.style.cssText="flex: 1; background: #ff4757; color: white; border: none; font-weight: bold;";let g=!1;p.onclick=()=>s.remove(),r.onclick=async()=>{g||(g=!0,r.disabled=!0,r.textContent=`${t}\u2026`,r.style.opacity="0.6",r.style.pointerEvents="none",s.remove(),await e())},d.append(p,r),i.append(o,d),s.append(i),document.body.appendChild(s)}function ns(){let n=localStorage.getItem("themePreference");return["system","light","dark"].includes(n)?n:"system"}function Ei(){let n=window.matchMedia?.("(prefers-color-scheme: light)");if(!n||window.__daysyncSystemThemeListenerBound)return;let e=()=>{a.themePreference==="system"&&wt("system",{persistPreference:!1})};typeof n.addEventListener=="function"?n.addEventListener("change",e):typeof n.addListener=="function"&&n.addListener(e),window.__daysyncSystemThemeListenerBound=!0}function xt(){return window.SAHRA_IS_NATIVE?"/login.html":"/login"}function Ni(n){let e=String(window.SAHRA_API_BASE_URL||"").replace(/\/+$/,"");return e?`${e}/${String(n).replace(/^\/+/,"")}`:n}async function ge(){if(window.SAHRA_IS_NATIVE){if(!window.SAHRA_AUTH_STORAGE)throw new Error("Secure native sign-in storage is unavailable.");return await window.SAHRA_AUTH_STORAGE.get("sahraToken")}return localStorage.getItem("sahraToken")}async function ss(){if(window.SAHRA_IS_NATIVE){if(!window.SAHRA_AUTH_STORAGE)throw new Error("Secure native sign-in storage is unavailable.");await window.SAHRA_AUTH_STORAGE.remove("sahraToken");return}localStorage.removeItem("sahraToken")}async function _(n,e={}){let t=await ge(),s=String(e.method||"GET").toUpperCase(),i=["POST","PUT","PATCH","DELETE"].includes(s),o=i?e.headers?.["Idempotency-Key"]||globalThis.crypto?.randomUUID?.()||`sahra-${Date.now()}-${Math.random().toString(36).slice(2)}`:null,d,p=null,r=null;try{let f=e.signal;s==="GET"&&!f&&typeof AbortController<"u"&&(r=new AbortController,f=r.signal,p=window.setTimeout(()=>r.abort(),12e3)),d=await fetch(Ni(n),{...e,...f?{signal:f}:{},headers:{"Content-Type":"application/json",...e.headers||{},...o?{"Idempotency-Key":o}:{},...t?{Authorization:`Bearer ${t}`}:{}}})}catch(f){if(t&&a.localDatabaseReady&&s==="GET"&&Ne(n)==="api/dashboard"){let x=await z.dashboardFallback(t);if(x.user||Object.values(x.data||{}).some(I=>I.length))return x}if(t&&a.localDatabaseReady&&s==="GET"&&Ne(n)==="api/transactions"){let x=await z.transactionFallback(t);if(x.length)return x}if(t&&i&&a.localDatabaseReady)try{let x=await z.enqueueAndApply(t,n,{...e,method:s,idempotencyKey:o});return x}catch(x){console.warn("Offline save could not be queued:",x.message)}throw f}finally{p!==null&&window.clearTimeout(p)}let h=(d.headers.get("content-type")||"").includes("application/json")?await d.json():await d.text();if(!d.ok){let f=typeof h=="string"?h:h?.message||"Request failed";if(typeof f=="string"&&/<\s*(?:!doctype|html|head|body|pre)\b/i.test(f)){let E=f.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^<\s]+)/i);E&&/reset-data/i.test(E[2])?f="The DaySync reset API is not deployed on the server yet. Push backend/routes/dashboard.js from the project root and wait for the hosted API to redeploy, then try again.":f=`The server returned an unexpected HTML error (HTTP ${d.status}). Check the API deployment and try again.`}else typeof f=="string"&&(f=f.trim().slice(0,600));if([502,503,504].includes(d.status)&&t)try{if(a.localDatabaseReady&&s==="GET"&&Ne(n)==="api/dashboard"){let E=await z.dashboardFallback(t);if(E.user||Object.values(E.data||{}).some(T=>T.length))return E}if(a.localDatabaseReady&&s==="GET"&&Ne(n)==="api/transactions"){let E=await z.transactionFallback(t);if(E.length)return E}if(i&&a.localDatabaseReady){let E=await z.enqueueAndApply(t,n,{...e,method:s,idempotencyKey:o});return E}}catch(E){console.warn("Offline fallback unavailable:",E.message)}(d.status===401||d.status===404&&f.toLowerCase().includes("user not found"))&&(await ss(),localStorage.removeItem("sahraUser"),a.authenticated=!1,!window.location.pathname.endsWith("/login")&&!window.location.pathname.endsWith("/login.html")&&(window.location.href=xt()));let I=new Error(f);throw I.status=d.status,I}if(t){if(a.localDatabaseReady&&s==="GET"&&Ne(n)==="api/dashboard")z.cacheDashboard(t,h).catch(f=>console.warn("Dashboard cache update failed:",f.message));else if(a.localDatabaseReady&&s==="GET"&&Ne(n)==="api/transactions")z.cacheTransactions(t,Array.isArray(h)?h:h.transactions||[]).catch(f=>console.warn("Transaction cache update failed:",f.message));else if(i&&a.localDatabaseReady)try{await z.cacheSuccessfulMutation(t,n,{...e,method:s},h),globalThis.navigator?.onLine&&z.flush(t).catch(f=>console.warn("Offline sync retry failed:",f.message))}catch(f){console.warn("Local cache update failed:",f.message)}}return h}function Ne(n){return String(n||"").split("?")[0].replace(/^\/+/,"")}var Ti=!1;window.addEventListener("online",async()=>{Ti=!1;try{let n=await ge();a.localDatabaseReady&&n&&await z.flush(n),await V({skipLocalSync:!a.localDatabaseReady}),a.localDatabaseReady&&await ke()}catch(n){console.warn("Reconnect sync failed:",n.message)}});function is(n){let e=2166136261;for(let t of String(n||""))e^=t.charCodeAt(0),e=Math.imul(e,16777619);return 2e5+(e>>>0)%5e5}async function ha(n){if(!window.Capacitor?.isNativePlatform?.())return;let e=is(n.id);try{if(await B.cancel({notifications:[{id:e}]}),!n.reminderTime||n.status==="Completed")return;let t=await B.checkPermissions();if(t.display!=="granted"&&(t=await B.requestPermissions()),t.display!=="granted"){$("Goal saved. Enable notifications to receive reminders.");return}let[s,i]=String(n.reminderTime).split(":").map(Number);if(!Number.isInteger(s)||!Number.isInteger(i))return;let o={on:{hour:s,minute:i},every:n.frequency==="Weekly"?"week":n.frequency==="Monthly"?"month":"day",allowWhileIdle:!0};n.frequency==="Weekly"&&(o.on.weekday=new Date(`${n.targetDate}T12:00:00`).getDay()+1),n.frequency==="Monthly"&&(o.on.day=Math.min(28,Number(String(n.targetDate).slice(8,10))||1)),await B.schedule({notifications:[{id:e,title:`Goal reminder: ${n.title}`,body:`Take one small step toward your ${n.frequency.toLowerCase()} goal.`,schedule:o,extra:{type:"goal-reminder",goalId:n.id}}]})}catch(t){console.warn("Could not schedule goal reminder:",t.message)}}function os(n){return String(n||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"_")}function rs(){let n=[a.user||{}];try{let s=JSON.parse(localStorage.getItem("sahraUser")||"null");s&&typeof s=="object"&&n.push(s)}catch{}let e=[];for(let s of n)for(let i of["id","_id","email","username","name"]){let o=os(s?.[i]);o&&!e.includes(o)&&e.push(o)}!e.length&&!a.authenticated&&e.push("guest");let t=e.map(s=>`daysyncGoalAchievements:${s}`);return[...new Set(t)]}function Sa(){let n=a.user||{},e=n.id||n._id||n.email||n.username||n.name;if(!e)try{let t=JSON.parse(localStorage.getItem("sahraUser")||"null");e=t?.id||t?._id||t?.email||t?.username||t?.name}catch{}return`daysyncGoalAchievements:${os(e||"guest")}`}function pe(){let n=rs(),e=[];for(let s of n)try{let i=JSON.parse(localStorage.getItem(s)||"[]");Array.isArray(i)&&e.push(...i)}catch(i){console.warn(`Could not read saved Goal & Achievements data from ${s}:`,i.message)}let t=typeof Ae=="function"?Ae(e,[]):[...new Map(e.filter(s=>s?.id!=null).map(s=>[String(s.id),s])).values()];if(n.length&&e.length){let s=Sa();try{localStorage.setItem(s,JSON.stringify(t));for(let i of n)i!==s&&localStorage.removeItem(i)}catch(i){console.warn("Could not migrate legacy Goal & Achievements storage:",i.message)}}return t}function Aa(n){a.goalAchievementItems=Array.isArray(n)?n:[],a.data.goalAchievements=a.goalAchievementItems;try{return localStorage.setItem(Sa(),JSON.stringify(a.goalAchievementItems)),!0}catch{return $("Could not save goals on this device. Check available storage."),!1}}function lt(n){let e=pe(),t=new Map(e.filter(d=>d?.id).map(d=>[String(d.id),d])),s=new Date().toISOString(),i=d=>{let p={...d||{}};return delete p.updatedAt,delete p._offlinePending,p},o=(Array.isArray(n)?n:[]).map(d=>{let p=t.get(String(d?.id||"")),r=!p||JSON.stringify(i(p))!==JSON.stringify(i(d));return{...d,updatedAt:r?s:d.updatedAt||p?.updatedAt||s}});if(!Aa(o))return!1;if(a.authenticated){let d=new Set(o.map(p=>String(p.id)));for(let p of o){if(!p?.id)continue;let r=t.get(String(p.id));r&&JSON.stringify(i(r))===JSON.stringify(i(p))||_(`/api/goal-achievements/${encodeURIComponent(p.id)}`,{method:"PUT",body:JSON.stringify(p)}).catch(g=>console.warn("Goal & Achievements sync is pending:",g.message))}for(let p of e)!p?.id||d.has(String(p.id))||_(`/api/goal-achievements/${encodeURIComponent(p.id)}`,{method:"DELETE"}).catch(r=>console.warn("Goal deletion sync is pending:",r.message))}return!0}function Ae(n,e){let t=new Map,s=i=>{let o=Date.parse(i?.updatedAt||i?.createdAt||0);return Number.isFinite(o)?o:0};for(let i of[...Array.isArray(n)?n:[],...Array.isArray(e)?e:[]]){if(!i||i.id==null)continue;let o=String(i.id),d=t.get(o);if(!d){t.set(o,{...i,id:o});continue}let p=s(i)>=s(d),r=p?i:d,g=p?d:i,h=new Map;for(let f of[...Array.isArray(g.logs)?g.logs:[],...Array.isArray(r.logs)?r.logs:[]]){let x=String(f?.id||`${f?.date||""}:${f?.amount||""}:${f?.createdAt||""}`);h.set(x,{...h.get(x)||{},...f})}t.set(o,{...g,...r,id:o,createdAt:[g.createdAt,r.createdAt].filter(Boolean).sort()[0]||r.createdAt,updatedAt:new Date(Math.max(s(g),s(r))||Date.now()).toISOString(),current:Math.max(Number(g.current)||0,Number(r.current)||0),xp:Math.max(Number(g.xp)||0,Number(r.xp)||0),currentStreak:Number(r.currentStreak??g.currentStreak)||0,bestStreak:Math.max(Number(g.bestStreak)||0,Number(r.bestStreak)||0),logs:[...h.values()].sort((f,x)=>String(f.createdAt||f.date||"").localeCompare(String(x.createdAt||x.date||"")))})}return[...t.values()].sort((i,o)=>String(o.createdAt||"").localeCompare(String(i.createdAt||"")))}async function Di(n=[]){let e=pe(),t=Ae(e,n);if(!Aa(t))return{synced:0,pending:!0};if(!a.authenticated)return{synced:0,pending:!1};let s=0;for(let i of t)if(i?.id)try{await _(`/api/goal-achievements/${encodeURIComponent(i.id)}`,{method:"PUT",body:JSON.stringify(i)}),s+=1}catch(o){console.warn("Goal & Achievements sync will retry:",o.message)}return{synced:s,pending:!globalThis.navigator?.onLine}}function Hn(n,e){let t=new Date(`${String(n||H(new Date)).slice(0,10)}T12:00:00`);if(Number.isNaN(t.getTime()))return H(new Date);if(e==="Weekly"){let s=(t.getDay()+6)%7;return t.setDate(t.getDate()-s),`W:${H(t)}`}return e==="Monthly"?`M:${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`:`D:${H(t)}`}function dt(n,e){let t=String(n||"").slice(2);if(e==="Monthly"){let[i,o]=t.split("-").map(Number);return i*12+(o||1)-1}let s=new Date(`${t}T12:00:00`);return Number.isNaN(s.getTime())?-1:Math.floor(Date.UTC(s.getFullYear(),s.getMonth(),s.getDate())/864e5)}function Ii(n){let e=[...new Set((n.logs||[]).map(h=>Hn(h.date,n.frequency)))].sort((h,f)=>dt(h,n.frequency)-dt(f,n.frequency)),t=[...new Set(e.map(h=>dt(h,n.frequency)))].sort((h,f)=>h-f),s=0,i=0,o=null;for(let h of t)i=o!==null&&h===o+1?i+1:1,s=Math.max(s,i),o=h;let d=dt(Hn(H(new Date),n.frequency),n.frequency),p=d-1,r=0,g=t.includes(d)?d:p;if(t.includes(g)){for(let h=t.length-1;h>=0;h--)if(t[h]===g)r++,g--;else if(t[h]<g)break}n.currentStreak=r,n.bestStreak=Math.max(Number(n.bestStreak)||0,s,r)}function Ci(n){return Math.max(0,Math.min(100,Math.round((Number(n.current)||0)/Math.max(1,Number(n.target)||1)*100)))}function zn(){let n=Array.isArray(a.goalAchievementItems)?a.goalAchievementItems:[],e=a.goalAchievementFilter||"All",t=r=>r.status==="Completed"?"Completed":r.targetDate<H(new Date)?"Overdue":"Active",s=n.filter(r=>e==="All"||t(r)===e),i=n.reduce((r,g)=>r+(Number(g.xp)||0),0),o=n.filter(r=>r.status==="Completed").length,d=n.reduce((r,g)=>Math.max(r,Number(g.bestStreak)||0),0),p=P;return`<section class="screen ga-screen" aria-label="Goal and Achievements">
    <header class="ga-header daysync-common-header"><button type="button" class="daysync-page-back-button" data-action="ga-back" aria-label="Back" title="Back">\u2039</button><div class="ga-heading"><p class="ga-eyebrow">PLAN \xB7 PROGRESS \xB7 ACHIEVE</p><h1>Goal &amp; Achievements</h1><p>Small steps, meaningful progress.</p></div><span class="ga-header-icon" aria-hidden="true">\u2726</span></header>
    <div class="ga-summary-grid"><article class="ga-summary-card"><span>Goals completed</span><strong>${o}</strong></article><article class="ga-summary-card"><span>Total XP</span><strong>${i.toLocaleString()}</strong></article><article class="ga-summary-card"><span>Best streak</span><strong>\u{1F525} ${d}</strong></article></div>
    <section class="ga-panel ga-add-goal-panel">
      <div class="ga-section-heading"><div><h2>Set a new goal</h2><p>Create a goal, choose a target and build a routine that works for you.</p></div><span class="ga-panel-symbol" aria-hidden="true">\uFF0B</span></div>
      <button type="button" class="ga-button ga-button-primary ga-add-goal-button" data-action="ga-open-create">\uFF0B Add Goal</button>
    </section>
    <section class="ga-goals-section"><div class="ga-section-heading"><div><h2>Your goals</h2><p>${n.length} saved ${n.length===1?"goal":"goals"}</p></div></div><div class="ga-filters" role="group" aria-label="Filter goals">${["All","Active","Completed","Overdue"].map(r=>`<button type="button" data-action="ga-filter" data-filter="${r}" class="ga-filter ${e===r?"active":""}" aria-pressed="${e===r}">${r}</button>`).join("")}</div>
      ${s.length?`<div class="ga-goal-list">${s.map(r=>{let g=Ci(r),h=r.status!=="Completed"&&r.targetDate<H(new Date),f=r.status==="Completed"?"Completed":h?"Overdue":"Active",x=Math.ceil((new Date(`${r.targetDate}T23:59:59`).getTime()-Date.now())/864e5),I=Array.isArray(r.logs)?r.logs:[];return`<article class="ga-goal-card ${f==="Completed"?"is-complete":""}"><div class="ga-goal-top"><span class="ga-category-chip">${p(r.category||"Personal")}</span><span class="ga-status-chip ${f.toLowerCase()}">${f}</span></div><h3>${p(r.title)}</h3>${r.description?`<p class="ga-goal-description">${p(r.description)}</p>`:""}<div class="ga-progress-row"><div class="ga-progress-ring" style="--ga-progress:${g}%" role="img" aria-label="${g}% complete"><div><strong>${g}%</strong></div></div><div class="ga-progress-copy"><strong>${Number(r.current)||0} / ${Number(r.target)||1} ${p(r.unit||"items")}</strong><span>${f==="Completed"?"Goal achieved!":x<0?`${Math.abs(x)} days overdue`:x===0?"Due today":`${x} days left`}</span><div class="ga-progress-track"><span style="width:${g}%"></span></div></div></div><div class="ga-goal-stats"><span>\u{1F525} <strong>${Number(r.currentStreak)||0}</strong> streak</span><span>\u{1F3C6} <strong>${Number(r.bestStreak)||0}</strong> best</span><span>\u2728 <strong>${Number(r.xp)||0}</strong> XP</span><span>\u{1F4C5} ${p(r.frequency)}</span></div>${f!=="Completed"?`<form class="ga-log-form" data-form="goal-progress" data-goal-id="${p(r.id)}"><label><span class="sr-only">Progress to add</span><input type="number" name="amount" min="1" max="1000000" value="1" required aria-label="Progress amount" /></label><button class="ga-button ga-button-primary" type="submit">\uFF0B Add progress</button></form>`:'<p class="ga-complete-note">\u2713 Completed \u2014 keep this achievement as a reminder of what you can do.</p>'}<div class="ga-card-actions"><button type="button" data-action="ga-edit" data-goal-id="${p(r.id)}">Edit</button><button type="button" data-action="ga-delete" data-goal-id="${p(r.id)}">Delete</button></div></article>`}).join("")}</div>`:`<div class="ga-empty-state"><span>\u2726</span><h3>${n.length?"No goals in this filter yet":"Your next achievement starts here"}</h3><p>${n.length?"Choose another filter to see your goals.":"Create a goal above, then record small steps to watch your progress ring grow."}</p></div>`}
    </section></section>`}function Pi(){let n=H(new Date),e=H(new Date(Date.now()+30*864e5));return`<section class="screen ga-screen ga-create-screen" aria-label="Create a Goal">
    <header class="ga-header daysync-common-header"><button type="button" class="daysync-page-back-button" data-action="ga-back" aria-label="Back" title="Back">\u2039</button><div class="ga-heading"><p class="ga-eyebrow">PLAN \xB7 PROGRESS \xB7 ACHIEVE</p><h1>Create a Goal</h1><p>Turn a small intention into a meaningful achievement.</p></div><span class="ga-header-icon" aria-hidden="true">\uFF0B</span></header>
    <section class="ga-panel ga-create-panel"><div class="ga-section-heading"><div><h2>Create a goal</h2><p>Choose a target and build a routine that works for you.</p></div><span class="ga-panel-symbol" aria-hidden="true">\u2726</span></div>
      <form class="ga-form" data-form="goal-achievement">
        <label class="ga-field ga-field-wide"><span>Goal name *</span><input name="title" maxlength="90" required placeholder="e.g. Learn Java programming" /></label>
        <label class="ga-field ga-field-wide"><span>Description <small>Optional</small></span><textarea name="description" maxlength="240" rows="2" placeholder="Why does this goal matter?"></textarea></label>
        <div class="ga-field-row"><label class="ga-field"><span>Target amount *</span><input name="target" type="number" min="1" max="1000000" required value="30" /></label><label class="ga-field"><span>Unit</span><select name="unit"><option value="sessions">Sessions</option><option value="minutes">Minutes</option><option value="pages">Pages</option><option value="tasks">Tasks</option><option value="items">Items</option></select></label></div>
        <div class="ga-field-row"><label class="ga-field"><span>Target date *</span><input name="targetDate" type="date" required min="${n}" value="${e}" /></label><label class="ga-field"><span>Frequency</span><select name="frequency"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label></div>
        <div class="ga-field-row"><label class="ga-field"><span>Reminder time <small>Optional</small></span><input name="reminderTime" type="time" /></label><label class="ga-field"><span>Category</span><select name="category"><option>Learning</option><option>Health</option><option>Career</option><option>Personal</option><option>Finance</option></select></label></div>
        <div class="ga-form-actions"><button type="button" class="ga-button ga-button-quiet" data-action="ga-cancel-create">Cancel</button><button type="submit" class="ga-button ga-button-primary">\uFF0B Save goal</button></div>
      </form><p class="ga-helper">Progress logs earn 10 XP each. Repeated logs in the same period earn XP, but only one period counts toward a streak.</p>
    </section>
  </section>`}function Li(){let e=(Array.isArray(a.goalAchievementItems)?a.goalAchievementItems:[]).find(r=>String(r.id)===String(a.goalAchievementEditingId));if(!e)return"";let t=P,s=["sessions","minutes","pages","tasks","items"],i=["Learning","Health","Career","Personal","Finance"],o=s.includes(e.unit)?e.unit:"items",d=i.includes(e.category)?e.category:"Personal",p=["Daily","Weekly","Monthly"].includes(e.frequency)?e.frequency:"Daily";return`<section class="screen ga-screen ga-edit-screen" aria-label="Edit Goal">
    <header class="ga-header daysync-common-header"><button type="button" class="daysync-page-back-button" data-action="ga-back" aria-label="Back" title="Back">\u2039</button><div class="ga-heading"><p class="ga-eyebrow">PLAN \xB7 PROGRESS \xB7 ACHIEVE</p><h1>Edit Goal</h1><p>Update your goal details and keep your progress.</p></div><span class="ga-header-icon" aria-hidden="true">\u2726</span></header>
    <section class="ga-panel ga-edit-panel"><div class="ga-section-heading"><div><h2>Update goal details</h2><p>Progress, logs, XP, streaks and achievement history stay unchanged.</p></div><span class="ga-panel-symbol" aria-hidden="true">\u270E</span></div>
      <form class="ga-form" data-form="goal-achievement-edit">
        <label class="ga-field ga-field-wide"><span>Goal name *</span><input name="title" maxlength="90" required value="${t(e.title||"")}" placeholder="e.g. Learn Java programming" /></label>
        <label class="ga-field ga-field-wide"><span>Description <small>Optional</small></span><textarea name="description" maxlength="240" rows="2" placeholder="Why does this goal matter?">${t(e.description||"")}</textarea></label>
        <div class="ga-field-row"><label class="ga-field"><span>Target amount *</span><input name="target" type="number" min="1" max="1000000" required value="${Math.max(1,Number(e.target)||1)}" /></label><label class="ga-field"><span>Unit</span><select name="unit">${s.map(r=>`<option value="${r}" ${r===o?"selected":""}>${r.charAt(0).toUpperCase()+r.slice(1)}</option>`).join("")}</select></label></div>
        <div class="ga-field-row"><label class="ga-field"><span>Target date *</span><input name="targetDate" type="date" required value="${t(e.targetDate||"")}" /></label><label class="ga-field"><span>Frequency</span><select name="frequency">${["Daily","Weekly","Monthly"].map(r=>`<option ${r===p?"selected":""}>${r}</option>`).join("")}</select></label></div>
        <div class="ga-field-row"><label class="ga-field"><span>Reminder time <small>Optional</small></span><input name="reminderTime" type="time" value="${t(e.reminderTime||"")}" /></label><label class="ga-field"><span>Category</span><select name="category">${i.map(r=>`<option ${r===d?"selected":""}>${r}</option>`).join("")}</select></label></div>
        <div class="ga-form-actions"><button type="button" class="ga-button ga-button-quiet" data-action="ga-cancel-edit">Cancel</button><button type="submit" class="ga-button ga-button-primary">Save Changes</button></div>
      </form>
    </section>
  </section>`}function Oi(){return`
    <section class="screen menu-screen" aria-label="Menu">
      <header class="menu-page-heading">
        <h1>Menu</h1>
        <p>Choose a feature</p>
      </header>
      <div class="more-menu-panel menu-page-options" role="navigation" aria-label="Menu options">
        <button class="menu-item" type="button" data-view="goal-achievements">\u{1F3AF} Goal &amp; Achievements</button>
        <button class="menu-item" type="button" data-view="tasks">\u2705 To Do List</button>
        <button class="menu-item" type="button" data-view="vault">\u{1F4DD} Notepad (Vault)</button>
        <button class="menu-item" type="button" data-view="finance">\u{1F4B0} Expense Tracker</button>
        <button class="menu-item" type="button" data-view="focus">\u23F1\uFE0F Focus Timer</button>
        <button class="menu-item" type="button" data-view="progress">\u{1F4C8} Progress &amp; Stats</button>
        <button class="menu-item" type="button" data-view="settings">\u2699\uFE0F Settings</button>
      </div>
    </section>
  `}function Mi(){let n=a.theme==="light",e=["system","light","dark"].includes(a.themePreference)?a.themePreference:"system",t=e==="system"?"\u{1F4F1}":n?"\u2600\uFE0F":"\u{1F319}",s=e==="system"?`System theme \xB7 follows device (${n?"Light":"Dark"})`:`${n?"Light":"Dark"} theme enabled`,i=$a(),o=Array.isArray(a.data?.tasks)?a.data.tasks.length:0,d=Array.isArray(a.data?.assets)&&a.data.assets.length?a.data.assets.length:Array.isArray(a.data?.notes)?a.data.notes.length:0,p=(a.data?.events?.length||0)+(a.data?.reminders?.length||0),r=Array.isArray(a.financeData)&&a.financeData.length?a.financeData.length:(a.data?.expenses?.length||0)+(a.data?.subscriptions?.length||0),g=(a.data?.goals?.length||0)+(a.data?.habits?.length||0)+(a.data?.habitLogs?.length||0)+(a.data?.moods?.length||0),h=ka(),f=h.length,x=h.filter(E=>E.status==="Completed"||Number(E.current||0)>=Number(E.target||1)).length,I=Array.isArray(a.focusSessions)?a.focusSessions.length:0;return`
    <section class="screen daysync-settings-screen" aria-label="DaySync settings">
      <header class="daysync-settings-header daysync-common-header">
        <button class="daysync-settings-back daysync-page-back-button" type="button" data-action="settings-back" aria-label="Back">\u2039</button>
        <div class="daysync-settings-mark" aria-hidden="true">\u2637</div>
        <div class="daysync-settings-title"><h1>Settings</h1><p>Personalize your DaySync experience</p></div>
      </header>
      <section class="daysync-settings-group" aria-labelledby="settings-personalization-heading">
        <p class="daysync-settings-section-label" id="settings-personalization-heading">PERSONALIZATION</p>
        <div class="daysync-settings-list">
          <button class="daysync-setting-row" type="button" data-menu-action="toggle-theme">
            <span class="daysync-setting-icon">${t}</span><span class="daysync-setting-copy"><strong>Appearance</strong><small>${s} \xB7 Tap to change</small></span><span class="daysync-setting-trail">\u203A</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="profile">
            <span class="daysync-setting-icon">\u2659</span><span class="daysync-setting-copy"><strong>Profile</strong><small>${P(a.user?.name||"Your personal information")}</small></span><span class="daysync-setting-trail">\u203A</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="notifications" role="switch" aria-checked="${i}" aria-label="Notifications ${i?"on":"off"}">
            <span class="daysync-setting-icon">\u2667</span><span class="daysync-setting-copy"><strong>Notifications</strong><small>${i?"Device permission granted":"Manage task, event and focus reminders"}</small></span><span class="daysync-settings-switch ${i?"is-on":""}" aria-hidden="true"><span></span></span>
          </button>
        </div>
      </section>
      <section class="daysync-settings-group" aria-labelledby="settings-data-heading">
        <p class="daysync-settings-section-label" id="settings-data-heading">APP &amp; DATA</p>
        <div class="daysync-settings-list">
          <button class="daysync-setting-row" type="button" data-menu-action="sync-now">
            <span class="daysync-setting-icon">\u27F3</span><span class="daysync-setting-copy"><strong>Data &amp; Sync</strong><small>${o} tasks \xB7 ${d} notes \xB7 ${r} transactions \xB7 ${p} calendar items</small><small class="daysync-setting-subline">${g} progress records \xB7 ${f} goals \xB7 ${x} achievements \xB7 ${I} focus sessions \xB7 Tap to sync now</small></span><span class="daysync-setting-trail">\u203A</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="privacy-security" aria-expanded="${a.settingsInfoPanel==="privacy"?"true":"false"}">
            <span class="daysync-setting-icon">\u25C7</span><span class="daysync-setting-copy"><strong>Privacy &amp; Security</strong><small>Account-scoped data and device permissions</small></span><span class="daysync-setting-trail">${a.settingsInfoPanel==="privacy"?"\u2304":"\u203A"}</span>
          </button>
          ${a.settingsInfoPanel==="privacy"?'<div class="daysync-settings-detail-panel" role="group" aria-label="Privacy and device permissions"><strong>Your account and device</strong><p>DaySync requests access only when a feature needs it. Location is used to find local weather. Your saved records are associated with your signed-in account; sign out on shared devices.</p><div class="daysync-settings-detail-actions"><button class="daysync-settings-detail-action" type="button" data-action="open-location-permission-settings"><strong>Location permissions</strong><small>Manage location access for local weather</small></button><button class="daysync-settings-detail-action" type="button" data-action="open-notification-permission-settings"><strong>Notification permissions</strong><small>Manage task, event and focus reminders</small></button><button class="daysync-settings-detail-action" type="button" data-menu-action="exact-alarms"><strong>Timer alarms</strong><small>Manage precise Focus Timer alarms on Android</small></button></div></div>':""}
          <button class="daysync-setting-row daysync-setting-row-danger" type="button" data-action="open-reset-options">
            <span class="daysync-setting-icon daysync-danger-icon">\u26A0</span><span class="daysync-setting-copy"><strong>Reset Options</strong><small>Review saved data by section and date before deleting</small></span><span class="daysync-setting-trail">\u203A</span>
          </button>
        </div>
      </section>
      <p class="daysync-settings-section-label">ABOUT DAYSYNC</p>
      <section class="daysync-about-card"><div class="daysync-about-top"><img class="daysync-about-logo" src="/images/DaySync.png" alt="DaySync logo" width="42" height="42" /><div><strong>DaySync</strong><p>Your personal planner for tasks, calendar, expenses, goals, and focus sessions.</p></div></div><span class="daysync-about-version">DaySync \xB7 Version 1.0 \xB7 AI assistant: Sahra</span></section>
      <button class="daysync-signout-row" type="button" data-menu-action="logout"><span>\u21AA</span> Sign out</button>
    </section>`}var oe={tasks:{title:"To Do List",icon:"\u2705",description:"Saved tasks and their completion status",collections:["tasks"]},notepad:{title:"Notepad",icon:"\u{1F4DD}",description:"Saved notes and vault entries",collections:["notes","assets"]},expenses:{title:"Expense Tracker",icon:"\u{1F4B0}",description:"Income, expenses and transactions",collections:["transactions","expenses","subscriptions"]},calendar:{title:"Calendar Data",icon:"\u{1F5D3}\uFE0F",description:"Calendar events and reminders",collections:["events","reminders"]},progress:{title:"Progress Tracker",icon:"\u{1F4C8}",description:"Goals, habits, mood entries and habit logs",collections:["goals","habits","habitLogs","moods"]},goalAchievements:{title:"Goal & Achievements",icon:"\u{1F3C6}",description:"Your personal goals, progress logs, XP and achievement history",collections:["goalAchievements"]},focus:{title:"Focus Timer",icon:"\u23F1\uFE0F",description:"Saved focus sessions and timer history",collections:[]}};function ka(){let n=[...Array.isArray(a.goalAchievementItems)?a.goalAchievementItems:[],...Array.isArray(a.data?.goalAchievements)?a.data.goalAchievements:[],...pe()];return Ae(n,[])}function ht(n){let e=a.data||{},t=(s,i)=>(Array.isArray(s)?s:[]).map(o=>({...o,_resetKind:i}));if(n==="tasks")return t(e.tasks,"Task");if(n==="notepad"){let s=(e.assets?.length?e.assets:e.notes)||[];return t(s,"Note")}if(n==="expenses"){let s=a.financeData?.length?a.financeData:[...e.expenses||[],...e.subscriptions||[]];return t(s,"Transaction")}return n==="calendar"?[...t(e.events,"Event"),...t(e.reminders,"Reminder")]:n==="progress"?[...t(e.goals,"Goal"),...t(e.habits,"Habit"),...t(e.habitLogs,"Habit log"),...t(e.moods,"Mood entry")]:n==="goalAchievements"?t(ka(),"Goal & achievement"):n==="focus"?t(a.focusSessions,"Focus session"):[]}function Ri(){let n=a.resetOptionsSelected||{},e=Object.keys(oe).filter(i=>n[i]),t=e.reduce((i,o)=>i+ht(o).length,0),s=e.map(i=>`<li>${P(oe[i].title)} <strong>${ht(i).length}</strong></li>`).join("");return`
    <section class="screen daysync-reset-screen" aria-label="Reset options">
      <header class="daysync-reset-header"><div><p class="daysync-eyebrow">APP &amp; DATA</p><h1>Reset Options</h1><p>Choose which sections of saved information to remove.</p></div></header>
      <div class="daysync-reset-warning"><span>\u26A0</span><div><strong>Permanent deletion</strong><p>Select only the sections you want to permanently delete. This action cannot be undone.</p></div></div>
      <div class="daysync-reset-category-list">
        ${Object.entries(oe).map(([i,o])=>{let d=ht(i),p=!!n[i];return`<button type="button" class="daysync-reset-category ${p?"is-selected":""}" data-action="reset-toggle-category" data-category="${i}" aria-pressed="${p}"><span class="daysync-reset-category-check">${p?"\u2713":""}</span><span class="daysync-reset-category-icon">${o.icon}</span><span class="daysync-reset-category-copy"><strong>${o.title}</strong><small>${o.description}</small><small>${d.length} saved ${d.length===1?"item":"items"} \xB7 ${p?"Included in reset":"Tap to select"}</small></span><span class="daysync-setting-trail">${p?"\u2713":"\u203A"}</span></button>`}).join("")}
      </div>
      <div class="daysync-reset-select-actions"><button type="button" data-action="reset-select-all">${e.length===Object.keys(oe).length?"Deselect all sections":"Select all sections"}</button><span>${e.length} sections \xB7 ${t} records selected</span></div>
      <div class="daysync-reset-review-bar"><button type="button" class="daysync-reset-cancel" data-action="reset-back-settings">Cancel</button><button type="button" class="daysync-reset-review-button" data-action="reset-review" ${!e.length||a.resetOptionsBusy?"disabled":""}>Review reset <span>(${e.length})</span></button></div>
      ${a.resetConfirmOpen?`<div class="daysync-reset-modal-backdrop" role="presentation"><section class="daysync-reset-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title"><div class="daysync-reset-danger-symbol">\u26A0\uFE0F</div><p class="daysync-eyebrow">FINAL REVIEW</p><h2 id="reset-confirm-title">Delete selected data?</h2><p class="daysync-reset-confirm-copy">This permanently deletes <strong>${t} saved records</strong> across the selected sections. Your account will not be deleted, but this data cannot be recovered.</p><ul class="daysync-reset-confirm-list">${s}</ul><label class="daysync-reset-ack"><input type="checkbox" data-reset-acknowledge> <span>I understand this deletion is permanent.</span></label><label class="daysync-reset-phrase-label" for="reset-confirm-phrase">Type <strong>DELETE</strong> to confirm</label><input id="reset-confirm-phrase" class="daysync-reset-phrase" type="text" autocomplete="off" autocapitalize="characters" placeholder="Type DELETE" aria-label="Type DELETE to confirm"><div class="daysync-reset-modal-actions"><button type="button" class="daysync-reset-cancel" data-action="reset-cancel">Go back</button><button type="button" class="daysync-reset-confirm-button" data-action="reset-confirm" ${a.resetOptionsBusy?"disabled":""}>${a.resetOptionsBusy?"Deleting\u2026":"Permanently delete"}</button></div></section></div>`:""}
    </section>`}async function _i(n){let e=typeof AbortController<"u"?new AbortController:null,t=e?window.setTimeout(()=>e.abort(),4500):null;try{await _("/api/profile/theme",{method:"PUT",body:JSON.stringify({theme:n}),...e?{signal:e.signal}:{}})}catch(s){console.warn("Theme sync deferred; the device preference remains active:",s.message)}finally{t!==null&&window.clearTimeout(t)}}async function Gn(n){let e=a.user?.preferences?.reminderSettings||{},t=await _("/api/profile/preferences",{method:"PUT",body:JSON.stringify({preferences:{reminderSettings:{...e,...n}}})});a.user=t.user||{...a.user,preferences:{...a.user?.preferences||{},reminderSettings:{...e,...n}}},localStorage.setItem("sahraUser",JSON.stringify(a.user))}function $a(){return a.user?.preferences?.reminderSettings?.enabled===!1?!1:window.SAHRA_NOTIFICATIONS?.isNative?.()?window.SAHRA_NOTIFICATIONS.getCachedPermission?.()==="granted":"Notification"in window&&Notification.permission==="granted"}async function qi(){let n=a.user?.preferences?.reminderSettings||{};if($a()){try{await Gn({enabled:!1}),window.SAHRA_NOTIFICATIONS?.isNative?.()&&await Fe(),$("Device notifications are off.")}catch(t){$(t.message||"Unable to turn notifications off.")}return}try{if(window.SAHRA_NOTIFICATIONS?.isNative?.()){if((await window.SAHRA_NOTIFICATIONS.reconcile([],{requestPermission:!0})).permission!=="granted"){$("Notification permission was not granted. Enable it in device settings to continue.");return}}else{if(!("Notification"in window)){$("Notifications are not supported in this browser.");return}if((Notification.permission==="granted"?"granted":await Notification.requestPermission())!=="granted"){$("Notification permission was not granted.");return}}await Gn({enabled:!0}),window.SAHRA_NOTIFICATIONS?.isNative?.()?await Fe():await ga(),$("Device notifications are on for task and event reminders.")}catch(t){$(t.message||"Unable to turn notifications on.")}}async function V({loadFinanceInBackground:n=!1,skipLocalSync:e=!1}={}){let t=await ge();if(!t){a.authenticated=!1,window.location.href=xt();return}if(a.authenticated=!0,!e&&a.localDatabaseReady)try{let i=await z.dashboardFallback(t);Object.values(i.data||{}).some(d=>Array.isArray(d)&&d.length)&&(a.data={...mt,...i.data||{}},i.user&&(a.user=i.user),a.goalAchievementItems=pe(),v())}catch(i){console.warn("Local dashboard snapshot is unavailable:",i.message)}let s=e||!a.localDatabaseReady||!globalThis.navigator?.onLine;if(!e&&a.localDatabaseReady&&globalThis.navigator?.onLine)try{s=!!(await z.flush(t))?.pending}catch(i){console.warn("Pending offline changes could not be flushed before dashboard load:",i.message),s=!0}n&&!s&&ke();try{let i=await _("/api/dashboard");a.data={...mt,...i.data||{}};let o=Array.isArray(a.data.tasks)?a.data.tasks:[],d=o.filter(Te);d.length&&(a.data.tasks=o.filter(g=>!Te(g)),Promise.all(d.map(g=>{let h=g?.id||g?._id;return h?_(`/api/tasks/${encodeURIComponent(h)}`,{method:"DELETE"}).catch(f=>console.warn("Could not permanently remove a test task:",f.message)):Promise.resolve()}))),a.user=i.user||a.user,a.goalAchievementItems=pe();let p=Array.isArray(a.data.goalAchievements)?a.data.goalAchievements:[];if(s&&a.localDatabaseReady)try{let g=await z.read(t,"goalAchievements");p=Ae(p,g)}catch(g){console.warn("Unable to read the local Goal & Achievements sync cache:",g.message)}let r=Ae(pe(),p);Aa(r),a.localDatabaseReady&&Di(p).catch(g=>console.warn("Goal & Achievements sync will retry:",g.message)),localStorage.setItem("sahraUser",JSON.stringify(a.user)),wt(ns()),ga(),Un||(Un=setInterval(ga,3e4)),v(),Se(!0).catch(g=>console.warn("Background progress refresh failed:",g.message))}catch(i){console.error("Dashboard load failed:",i),a.data&&!a.data.events&&(a.data={...mt}),v()}}async function Se(n=!0){let e=Number(a.currentYear),t=Number(a.currentMonth)+1;if(!Number.isInteger(e)||!Number.isInteger(t))return;a.progressLoading=!0;let[s,i]=await Promise.allSettled([_(`/api/progress?year=${e}&month=${t}`),_(`/api/focus/stats?year=${e}&month=${t}`)]);s.status==="fulfilled"?a.progressData=s.value:(console.warn("Progress load failed:",s.reason?.message||s.reason),a.progressData=null),i.status==="fulfilled"?a.focusStatsData=i.value:(console.warn("Monthly focus history could not be loaded from the server:",i.reason?.message||i.reason),a.focusStatsData=null),a.progressLoading=!1,n&&a.view==="progress"&&v()}async function ue(n,e){let s={event:"/api/events",task:"/api/tasks",mood:"/api/moods",habit:"/api/habits",goal:"/api/goals",expense:"/api/expenses",subscription:"/api/subscriptions",asset:"/api/assets"}[n];if(!s)return;let i=e;(n==="expense"||n==="subscription")&&(i={...e,type:"expense",amount:Number(e.amount),note:String(e.title||e.note||"").trim(),category:String(e.category||"General").trim()||"General",date:e.date||a.selectedDate,paymentMethod:e.paymentMethod||"Cash"}),await _(s,{method:"POST",body:JSON.stringify(i)}),await V(),(n==="event"||n==="task")&&i.reminder&&a.user?.preferences?.reminderSettings?.enabled!==!1&&await Fe()}async function Wn(n){if(!n)return;let e=n.value.trim();if(!e){$("Please enter a task title."),n.focus();return}if(Te({title:e})){$("Please choose a meaningful task title."),n.focus();return}try{await ue("task",{title:e,description:"",date:a.selectedDate,time:null,priority:"Normal",status:"Pending",completed:!1,reminder:"",category:"General"}),n.value="",$("Task added")}catch(t){$(t.message||"Unable to add task")}}function Fi(n){let e=String(n||"").toLowerCase().match(/(\d+)\s*(min(?:ute)?s?|hours?|days?)/);if(!e)return 0;let t=Number(e[1]),s=e[2];return s.startsWith("day")?t*24*60*60*1e3:s.startsWith("hour")?t*60*60*1e3:t*60*1e3}function cs(n,e){let t=e==="event"?n.startTime:n.time;if(!n?.date||!t||!/^\d{2}:\d{2}$/.test(t))return null;let s=new Date(`${n.date}T${t}:00`);return Number.isNaN(s.getTime())?null:new Date(s.getTime()-Fi(n.reminder))}function ji(n,e){let t=`${n}:${e||""}`,s=n==="event"?17:23;for(let i=0;i<t.length;i+=1)s=s*31+t.charCodeAt(i)|0;return Math.abs(s)%2147483646+1}function Yn(n,e){let t=cs(e,n),s=e.id||e._id;if(!t||!s||t.getTime()<=Date.now())return null;let i=n==="event"?e.startTime:e.time;return{id:ji(n,s),title:"DaySync reminder",body:`${n==="event"?"Event":"Task"}: ${e.title}${i?` \u2022 ${i}`:""}`,schedule:{at:t,allowWhileIdle:!0},channelId:"daysync-reminders",sound:"default",extra:{date:e.date,resource:n,id:String(s)}}}async function Fe({requestPermission:n=!1}={}){let e=window.SAHRA_NOTIFICATIONS;if(!e?.isNative?.())return{native:!1};let t=a.user?.preferences?.reminderSettings||{},i=t.enabled!==!1?[...t.tasksEnabled===!1?[]:a.data.tasks.filter(o=>!o.completed&&o.status!=="Completed").map(o=>Yn("task",o)),...t.eventsEnabled===!1?[]:a.data.events.map(o=>Yn("event",o))].filter(Boolean):[];try{let o=await e.reconcile(i,{requestPermission:n});return n&&o.permission!=="granted"?$("Notifications are disabled. You can enable them in your device settings."):n&&o.scheduled&&$(`${o.scheduled} reminder${o.scheduled===1?"":"s"} registered on this device.`),o}catch(o){return console.warn("Native reminder reconciliation failed:",o.message),n&&$("DaySync could not register this device reminder."),{native:!0,error:o}}}async function Bi(n,e){let t="serviceWorker"in navigator?await navigator.serviceWorker.getRegistration():null,s=n==="event"?e.startTime:e.time,i={body:`${n==="event"?"Event":"Task"}: ${e.title}${s?` \u2022 ${s}`:""}`,icon:"/images/sahra.png",badge:"/images/sahra.png",tag:`sahra-${n}-${e.id||e._id}`,data:{date:e.date,resource:n,id:e.id||e._id}};if(t?.showNotification){await t.showNotification("DaySync reminder",i);return}let o=new Notification("DaySync reminder",i);o.onclick=()=>{window.focus(),window.location.href=`/dashboard?date=${encodeURIComponent(e.date)}`}}async function ga(){let n=a.user?.preferences?.reminderSettings||{};if(n.enabled===!1)return;if(window.SAHRA_NOTIFICATIONS?.isNative?.()){await Fe();return}if(!("Notification"in window)||Notification.permission!=="granted")return;let e=Date.now(),t=[...n.tasksEnabled===!1?[]:a.data.tasks.map(s=>({resource:"task",item:s})),...n.eventsEnabled===!1?[]:a.data.events.map(s=>({resource:"event",item:s}))];for(let{resource:s,item:i}of t){if(i.reminderNotifiedAt)continue;let o=cs(i,s);if(!(!o||e<o.getTime()||e-o.getTime()>120*1e3))try{(await _("/api/notifications/mark-sent",{method:"POST",body:JSON.stringify({resource:s,id:i.id||i._id})})).sent&&await Bi(s,i)}catch(d){console.warn("Reminder notification failed:",d.message)}}}async function ls(n){if(!(!a.authenticated||a.calendarCache.has(n))){a.calendarCache.add(n);try{let e=await _(`/api/calendar/${n}`);a.calendarCache.add(n);let t=e.tasks||[],s=e.events||[],i=e.moods||[];a.data.tasks=[...a.data.tasks.filter(o=>o.date!==n),...t],a.data.events=[...a.data.events.filter(o=>o.date!==n),...s],a.data.moods=[...a.data.moods.filter(o=>o.date!==n),...i]}catch(e){a.calendarCache.delete(n),console.warn("Selected day data refresh failed:",e.message)}}}async function Ui(n){a.selectedDate=n;let[e,t,s]=n.split("-").map(Number);a.currentYear=e,a.currentMonth=t-1,await ls(n),v()}function Jn(n){let e=new Date(a.currentYear,a.currentMonth+n,1);a.currentYear=e.getFullYear(),a.currentMonth=e.getMonth(),v()}function Hi(n){if(!n)return!1;try{let e=new Date;return e.setHours(0,0,0,0),new Date(`${n}T00:00:00`)>e}catch{return!1}}function ds(n){if(!n)return!1;try{let e=new Date;return e.setHours(0,0,0,0),new Date(`${n}T00:00:00`)<e}catch{return!1}}function zi(n=52){return`
    <img
      class="sahra-logo"
      src="/images/DaySync.png"
      alt="DaySync logo"
      width="${n}"
      height="${n}"
    />
  `}function Gi(n="event"){if(n==="mood"&&Hi(a.selectedDate)){window.alert("Future dates cannot have a mood.");return}if((n==="event"||n==="task")&&ds(a.selectedDate)){window.alert("Tasks and events can only be added for today or future dates.");return}a.entryModalOpen=!0,a.entryDraft={type:n,title:"",description:"",date:a.selectedDate,startTime:"09:00",endTime:"10:00",category:"General",reminder:"",priority:"Normal",status:"Pending",mood:"\u{1F60A}",note:"",goal:1,frequency:"Daily",target:30,current:0,duration:"30 days",time:"19:00",amount:"",renewalDate:a.selectedDate,content:"",tags:""},v()}function fa(n){a.view!==n&&(a.view&&a.view!=="home"&&a.navigationHistory.push(a.view),a.view=n),v()}function we(){if(a.view==="goal-create"){let n=a.navigationHistory||[];n[n.length-1]==="goal-achievements"&&n.pop(),a.view="goal-achievements",v();return}if(a.view==="goal-edit"){a.goalAchievementEditingId=null;let n=a.navigationHistory||[];n[n.length-1]==="goal-achievements"&&n.pop(),a.view="goal-achievements",v();return}if(a.view==="calendar"){a.view="home",a.navigationHistory=(a.navigationHistory||[]).filter(n=>n!=="menu"&&n!=="calendar"),a.moreMenuOpen=!1,a.menuOpen=!1,v();return}a.navigationHistory.length>0?a.view=a.navigationHistory.pop():a.view="home",v()}function ya(){a.entryModalOpen=!1,a.entryDraft=null,v()}window.sahraIsHome=()=>a.view==="home"&&!a.entryModalOpen&&!a.profileModalOpen&&!a.moreMenuOpen&&!a.menuOpen&&!a.moodPickerOpen&&!a.progressPickerOpen&&!a.resetConfirmOpen;window.sahraHandleNativeBack=()=>a.progressPickerOpen?(a.progressPickerOpen=!1,v(),!0):a.resetConfirmOpen?(a.resetConfirmOpen=!1,v(),!0):a.focusAlarmActive?(xa(),!0):a.entryModalOpen?(ya(),!0):a.profileModalOpen?(a.profileModalOpen=!1,a.profileEditing=!1,v(),!0):a.showFinanceResetConfirm?(a.showFinanceResetConfirm=!1,v(),!0):a.financeDetail?(a.financeDetail=null,v(),!0):a.calendarDetail?(a.calendarDetail=null,v(),!0):a.moreMenuOpen||a.menuOpen||a.moodPickerOpen?(a.moreMenuOpen=!1,a.menuOpen=!1,a.moodPickerOpen=!1,v(),!0):a.view!=="home"?(we(),!0):!1;function Wi(){if(!a.profileModalOpen)return"";let n=a.user||{},e=n.profile||{},t=a.profileDraft||{name:n.name||"",dateOfBirth:e.dateOfBirth?new Date(e.dateOfBirth).toISOString().slice(0,10):""},s=!!a.profileEditing,i=a.profileSuccessMessage||"",o=e.dateOfBirth?new Date(e.dateOfBirth).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"Not set",d=!!e.phone;return`
    <div class="entry-modal-backdrop visible" style="z-index: 2000;">
      <div class="entry-modal" style="width: min(100%, 390px); background: var(--panel-bg); border-color: var(--panel-border); padding: 20px;">
        <div class="entry-modal-header" style="margin-bottom: 14px;">
          <h3 style="font-size: 1.2rem; color: var(--text);">User Profile</h3>
          <button class="entry-close" type="button" data-action="close-profile-modal">\u2715</button>
        </div>

        ${i?`<div style="background: rgba(97, 245, 176, 0.15); color: #61f5b0; padding: 8px 12px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 12px; text-align: center;">${i}</div>`:""}

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div class="profile-avatar large" style="width: 64px; height: 64px; font-size: 1.8rem; margin: 0; background: linear-gradient(135deg, var(--purple), var(--cyan)); color: white; display: grid; place-items: center; border-radius: 20px; font-weight: 800;">
            ${(n.name||"S").charAt(0).toUpperCase()}
          </div>
          <div style="overflow: hidden;">
            <strong style="display: block; font-size: 1.2rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.name||"DaySync User"}</strong>
            <span style="color: var(--muted); font-size: 0.82rem; word-break: break-all;">${n.email||""}</span>
          </div>
        </div>

        ${s?`
          <div style="display: grid; gap: 12px;">
            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Full Name
              <input class="profile-input" data-field="name" value="${(t.name||"").replace(/"/g,"&quot;")}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Date of Birth
              <input class="profile-input" data-field="dateOfBirth" type="date" value="${t.dateOfBirth||""}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
              Email (Cannot be edited)
              <input type="email" disabled value="${n.email||""}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
            </label>

            ${d?`
              <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
                Phone Number (Cannot be edited)
                <input type="text" disabled value="${e.phone}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
              </label>
            `:""}

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
              <button class="secondary-btn" type="button" data-action="profile-cancel-edit" style="padding: 10px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06); color: var(--text); cursor: pointer;">Cancel</button>
              <button class="primary-btn compact-btn" type="button" data-action="profile-save" style="padding: 10px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #9d82ff, #68d5ff); color: white; font-weight: 700; cursor: pointer;">Save</button>
            </div>
          </div>
        `:`
          <div style="display: grid; gap: 8px; margin-bottom: 16px;">
            <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
              <span>Date of Birth</span>
              <strong style="color: var(--text);">${o}</strong>
            </div>

            <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
              <span>Email</span>
              <strong style="color: var(--text);">${n.email||"Not set"}</strong>
            </div>

            ${d?`
              <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
                <span>Phone</span>
                <strong style="color: var(--text);">${e.phone}</strong>
              </div>
            `:""}
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="secondary-btn" type="button" data-action="close-profile-modal" style="padding: 10px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06); color: var(--text); cursor: pointer;">Close</button>
            <button class="primary-btn compact-btn" type="button" data-action="profile-start-edit" style="padding: 10px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #9d82ff, #68d5ff); color: white; font-weight: 700; cursor: pointer;">Edit Profile</button>
          </div>
        `}
      </div>
    </div>
  `}function Yi(){if(!a.entryModalOpen||!a.entryDraft)return"";let n=["\u{1F60A}","\u{1F610}","\u{1F622}","\u{1F621}","\u{1F634}","\u{1F525}","\u{1F60D}"],e=a.entryDraft;return`
    <div class="entry-modal-backdrop visible">
      <div class="entry-modal">
        <div class="entry-modal-header">
          <h3>${e.type==="task"?"Add Task":e.type==="mood"?"Add Mood":e.type==="note"?"Add Note":"Add Event"}</h3>
          <button class="entry-close" type="button" data-action="close-entry-modal">\u2715</button>
        </div>

        <div class="entry-form">

          <!-- 1. STRICTLY NOTE FORM (Only Title & Description) -->
          ${e.type==="note"?`
            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(e.title||"").replace(/"/g,"&quot;")}" placeholder="e.g., My Grocery List" />
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="6" data-entry-field="description" placeholder="Type your note, password, or list here...">${(e.description||e.content||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</textarea>
            </label>
          `:""}

          <!-- 2. TASK FORM -->
          ${e.type==="task"?`
            <label class="entry-field">
              <span>Task Name</span>
              <input type="text" data-entry-field="title" value="${(e.title||"").replace(/"/g,"&quot;")}" placeholder="Study JavaScript" />
            </label>
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" min="${H(new Date)}" value="${e.date||a.selectedDate}" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Time</span>
                <input type="time" data-entry-field="time" value="${e.time||"19:00"}" />
              </label>
              <label class="entry-field">
                <span>Priority</span>
                <select data-entry-field="priority">
                  <option value="Low" ${e.priority==="Low"?"selected":""}>Low</option>
                  <option value="Normal" ${e.priority==="Normal"?"selected":""}>Normal</option>
                  <option value="High" ${e.priority==="High"?"selected":""}>High</option>
                </select>
              </label>
            </div>
            <label class="entry-field">
              <span>Reminder</span>
              <select data-entry-field="reminder">
                <option value="" ${e.reminder?"":"selected"}>No reminder</option>
                <option value="5 minutes before" ${e.reminder==="5 minutes before"?"selected":""}>5 minutes before</option>
                <option value="10 minutes before" ${e.reminder==="10 minutes before"?"selected":""}>10 minutes before</option>
                <option value="15 minutes before" ${e.reminder==="15 minutes before"?"selected":""}>15 minutes before</option>
                <option value="30 minutes before" ${e.reminder==="30 minutes before"?"selected":""}>30 minutes before</option>
                <option value="1 hour before" ${e.reminder==="1 hour before"?"selected":""}>1 hour before</option>
              </select>
            </label>
          `:""}

          <!-- 3. EVENT FORM -->
          ${e.type==="event"?`
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" min="${H(new Date)}" value="${e.date||a.selectedDate}" />
            </label>
            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(e.title||"").replace(/"/g,"&quot;")}" placeholder="Enter title here" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Start</span>
                <input type="time" data-entry-field="startTime" value="${e.startTime||"09:00"}" />
              </label>
              <label class="entry-field">
                <span>End</span>
                <input type="time" data-entry-field="endTime" value="${e.endTime||"10:00"}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Category</span>
              <input type="text" data-entry-field="category" value="${(e.category||"General").replace(/"/g,"&quot;")}" placeholder="General" />
            </label>
            <label class="entry-field">
              <span>Reminder</span>
              <select data-entry-field="reminder">
                <option value="" ${e.reminder?"":"selected"}>No reminder</option>
                <option value="5 minutes before" ${e.reminder==="5 minutes before"?"selected":""}>5 minutes before</option>
                <option value="10 minutes before" ${e.reminder==="10 minutes before"?"selected":""}>10 minutes before</option>
                <option value="15 minutes before" ${e.reminder==="15 minutes before"?"selected":""}>15 minutes before</option>
                <option value="30 minutes before" ${e.reminder==="30 minutes before"?"selected":""}>30 minutes before</option>
                <option value="1 hour before" ${e.reminder==="1 hour before"?"selected":""}>1 hour before</option>
              </select>
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(e.description||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</textarea>
            </label>
          `:""}

          <!-- 4. ASSET FORM -->
          ${e.type==="asset"?`
            <label class="entry-field">
              <span>Title / Name</span>
              <input type="text" data-entry-field="title" value="${(e.title||"").replace(/"/g,"&quot;")}" placeholder="e.g., Round Robin Snippet" />
            </label>
            <label class="entry-field">
              <span>Content / Code / Prompt</span>
              <textarea rows="6" data-entry-field="content" placeholder="Paste your reference material here...">${(e.content||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</textarea>
            </label>
          `:""}

          <!-- 5. EXPENSE FORM -->
          ${e.type==="expense"||e.type==="subscription"?`
            <label class="entry-field">
              <span>${e.type==="expense"?"Expense Name":"Service Name"}</span>
              <input type="text" data-entry-field="title" value="${(e.title||"").replace(/"/g,"&quot;")}" placeholder="e.g., Server Hosting" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Amount ($)</span>
                <input type="number" step="0.01" min="0" data-entry-field="amount" value="${e.amount||""}" placeholder="0.00" />
              </label>
              <label class="entry-field">
                <span>${e.type==="expense"?"Date":"Next Renewal"}</span>
                <input type="date" data-entry-field="${e.type==="expense"?"date":"renewalDate"}" value="${e.type==="expense"?e.date||a.selectedDate:e.renewalDate||a.selectedDate}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Category</span>
              <input type="text" data-entry-field="category" value="${(e.category||"").replace(/"/g,"&quot;")}" placeholder="e.g., Software" />
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(e.description||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</textarea>
            </label>
          `:""}

          <!-- 6. MOOD & HABIT & GOALS (Abbreviated to keep it clean) -->
          ${e.type==="mood"?`
            <div class="mood-picker-wrap">
              <span class="mood-picker-label">Mood</span>
              <div class="mood-picker-grid">
                ${n.map(s=>`
                  <button type="button" class="mood-option ${e.mood===s?"selected":""}" data-entry-field="mood" data-entry-value="${s}">${s}</button>
                `).join("")}
              </div>
            </div>
            <label class="entry-field">
              <span>Note</span>
              <textarea rows="3" data-entry-field="note" placeholder="Add a quick note">${(e.note||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</textarea>
            </label>
          `:""}

          <div class="entry-form-actions">
            <button class="secondary-btn" type="button" data-action="close-entry-modal">Cancel</button>
            <button class="primary-btn compact-btn" type="button" data-action="save-entry">${e.type==="task"?"Add Task":"Save"}</button>
          </div>
        </div>
      </div>
    </div>
  `}function Ji(){let n=new Date,e=H(n),t=new Date(a.currentYear,a.currentMonth,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"}),s=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],o=new Date(a.currentYear,a.currentMonth,1).getDay(),d=new Date(a.currentYear,a.currentMonth+1,0).getDate(),p=new Date(a.currentYear,a.currentMonth,0).getDate(),r={events:new Set((a.data.events||[]).map(k=>Z(k.date))),tasks:new Set((a.data.tasks||[]).filter(k=>!Te(k)).map(k=>Z(k.date))),moods:new Set((a.data.moods||[]).map(k=>Z(k.date)))},g=[];for(let k=0;k<o;k+=1)g.push({value:p-o+k+1,empty:!0});for(let k=1;k<=d;k+=1){let O=H(new Date(a.currentYear,a.currentMonth,k));g.push({value:k,empty:!1,active:O===a.selectedDate,iso:O,hasEvent:r.events.has(O),hasTask:r.tasks.has(O),hasMood:r.moods.has(O)})}for(;g.length%7!==0;)g.push({value:g.length-d-o+1,empty:!0});let f=(Array.isArray(a.data.tasks)?a.data.tasks:[]).filter(k=>!Te(k)).filter(k=>Z(k.date)===e).sort((k,O)=>+!!(k.completed||k.status==="Completed")-+!!(O.completed||O.status==="Completed")),x=f.filter(k=>k.completed||k.status==="Completed").length,I=f.length,E=I?Math.round(x/I*100):0,T=(Array.isArray(a.data.events)?a.data.events:[]).filter(k=>Z(k.date)===e).sort((k,O)=>String(k.time||"").localeCompare(String(O.time||""))),w=Array.isArray(a.financeData)?a.financeData:[],D=w.filter(k=>Z(k.date)===e),q=k=>k.filter(O=>String(O.type||"").toLowerCase()==="income").reduce((O,se)=>O+(Number(se.amount)||0),0),F=k=>k.filter(O=>String(O.type||"").toLowerCase()==="expense").reduce((O,se)=>O+(Number(se.amount)||0),0),L=q(D),S=F(D),u=q(w)-F(w),l=$a(),m=a.theme==="light",y=a.weather||{},b=y.data?.current,N=y.data?.daily,C=b?.weather_code,R=b?gt(C):"Tap View Weather for live conditions",j=b?ft(C,b.is_day):"\u2601\uFE0F",K=a.data.events.filter(k=>Z(k.date)===a.selectedDate).length,te=y.locationLabel?P(y.locationLabel):"Local forecast";return`
    <section class="screen home-screen" aria-label="DaySync home">
      <section class="hero glass-card page-fixed-header home-hero">
        <div class="hero-top">
          <div class="brand">
            <div class="brand-mark">${zi(52)}</div>
            <div class="brand-text"><h1>DaySync</h1><p>DAILY PLANNER</p></div>
          </div>
        </div>
      </section>

      <section class="glass-card layout-card date-weather-card home-weather-card" aria-label="Weather overview">
        <div class="weather-topline">
          <div class="weather-date-copy">
            <div class="date-weather-day">${n.toLocaleDateString("en-IN",{weekday:"long"})}</div>
            <div class="date-weather-date">${n.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <button class="weather-view-button" type="button" data-action="open-weather"><span>View Weather</span><span aria-hidden="true">\u2197</span></button>
        </div>
        <div class="weather-overview-row">
          <div class="date-weather-temp-wrap">
            <div class="temp-value">${b?`${Math.round(Number(b.temperature_2m))}\xB0`:"\u2014\xB0"}<span>C</span></div>
            <div class="weather-meta">${P(R)}</div>
            ${b&&N?`<div class="weather-range">H ${Math.round(Number(N.temperature_2m_max?.[0]))}\xB0 \xB7 L ${Math.round(Number(N.temperature_2m_min?.[0]))}\xB0</div>`:`<div class="weather-range">${y.status==="error"?"Weather unavailable":"Live data \xB7 no sample values"}</div>`}
          </div>
          <div class="weather-icon" aria-hidden="true">${j}</div>
        </div>
        <div class="weather-live-footer"><span class="weather-live-dot ${b?"is-live":""}"></span><span>${b?`Live \xB7 ${te}`:y.status==="loading"?"Loading live weather\u2026":"Real weather appears after you open View Weather"}</span></div>
      </section>

      <section class="glass-card layout-card calendar-card">
        <div class="calendar-header"><h3>${t}</h3><div class="calendar-actions">
          <button class="calendar-arrow" type="button" data-action="prev-month" aria-label="Previous month">\u2039</button>
          <button class="calendar-arrow" type="button" data-action="next-month" aria-label="Next month">\u203A</button>
          <button class="today-button" type="button" data-action="today">Today</button>
        </div></div>
        <div class="calendar-grid">
          ${s.map(k=>`<div class="calendar-weekday">${k}</div>`).join("")}
          ${g.map(k=>{let O=[];return k.hasEvent&&O.push('<span class="mini-indicator event"></span>'),k.hasTask&&O.push('<span class="mini-indicator task"></span>'),k.hasMood&&O.push('<span class="mini-indicator mood"></span>'),`<button class="calendar-day ${k.empty?"dim":""} ${k.active?"selected":""}" type="button" data-date="${k.iso||""}" ${k.empty?"disabled":""}><span>${k.value}</span>${O.length?`<span class="calendar-indicators">${O.join("")}</span>`:""}</button>`}).join("")}
        </div>
        <div class="event-row">
          <div class="event-status"><span class="status-dot"></span><span>${K?`Selected day has ${K} event(s)`:"No events on this day"}</span></div>
          <div class="event-actions"><button class="show-event" type="button" data-action="show-selected-day">Show</button><button class="add-event" type="button" data-action="open-add-entry" data-type="event">+ Add Event</button></div>
        </div>
      </section>

      <section class="glass-card layout-card progress-card">
        <div class="card-header compact"><h3>Today's Progress</h3><span class="chip">${E}%</span></div>
        <div class="progress-block"><div class="progress-row"><div class="progress-label"><span>Today's task completion</span><strong>${E}%</strong></div><div class="progress-bar"><div class="progress-fill" style="width:${E}%"></div></div></div></div>
        <div class="progress-footer">${x} / ${I} tasks complete today</div>
      </section>

      <section class="daily-programs-section" aria-label="Today's Programs">
        <header class="daily-programs-heading"><div><p class="daily-programs-eyebrow">YOUR DAY AT A GLANCE</p><h2>Today's Programs</h2><p>Everything planned and recorded for today.</p></div><span class="daily-date-pill">${n.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span></header>

        <section class="glass-card daily-program-card daily-tasks-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">\u2713</span><div><h3>Today's Tasks</h3><p>${x} of ${I} complete</p></div></div><button class="daily-view-link" type="button" data-view="tasks">View all <span>\u2197</span></button></div>
          ${f.length?`<div class="daily-task-list">${f.map(k=>{let O=!!(k.completed||k.status==="Completed"),se=String(k.priority||"Normal"),W=se.toLowerCase().replace(/[^a-z0-9]+/g,"-"),Ue=k.time?new Date(`2000-01-01T${String(k.time).slice(0,5)}:00`).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}):"",Et=k.id||k._id||"";return`<article class="daily-task-row ${O?"is-complete":""}"><button type="button" class="daily-task-check ${O?"is-checked":""}" data-action="toggle-task" data-task-id="${ma(Et)}" aria-label="${O?"Mark incomplete":"Complete"} ${ma(k.title||k.name||"task")}">${O?"\u2713":""}</button><div class="daily-task-copy"><strong>${P(k.title||k.name||"Untitled task")}</strong><span>${Ue?`${P(Ue)} \xB7 `:""}${P(k.category||"Task")}</span></div><span class="daily-priority priority-${W}">${P(se)}</span></article>`}).join("")}</div>`:`<div class="daily-empty-state"><span class="daily-empty-icon">\u2713</span><div><strong>No tasks for today</strong><p>Add a task with today's date to plan your day.</p></div><button type="button" class="daily-add-button" data-action="open-add-entry" data-type="task">+ Add Task</button></div>`}
        </section>

        <section class="glass-card daily-program-card daily-events-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">\u25A6</span><div><h3>Today's Events</h3><p>${T.length} scheduled</p></div></div><button class="daily-view-link" type="button" data-action="view-today-events">View all <span>\u2197</span></button></div>
          ${T.length?`<div class="daily-event-list">${T.map(k=>{let O=k.time?String(k.time).slice(0,5):"";return`<article class="daily-event-row"><span class="daily-event-time">${O?P(O):"All day"}</span><span class="daily-event-marker" aria-hidden="true"></span><div class="daily-event-copy"><strong>${P(k.title||k.name||"Untitled event")}</strong><span>${P(k.location||k.category||(k.description?String(k.description).slice(0,80):"Scheduled today"))}</span></div><span class="daily-reminder-icon" title="${k.reminder?"Reminder set":"No reminder shown"}" aria-label="${k.reminder?"Reminder set":"No reminder shown"}">${k.reminder?"\u{1F514}":"\u25F7"}</span></article>`}).join("")}</div>`:'<div class="daily-empty-state"><span class="daily-empty-icon">\u25A6</span><div><strong>No events for today</strong><p>Your saved events for today will appear here.</p></div><button type="button" class="daily-add-button" data-action="open-add-entry" data-type="event">+ Add Event</button></div>'}
        </section>

        <section class="glass-card daily-program-card daily-finance-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">\u20B9</span><div><h3>Income &amp; Expenses</h3><p>From your saved transactions</p></div></div><button class="daily-view-link" type="button" data-view="finance">Finance <span>\u2197</span></button></div>
          <div class="daily-money-grid">
            <article class="daily-money-card income"><span>Today's income</span><strong>${_e(L)}</strong></article>
            <article class="daily-money-card expense"><span>Today's expenses</span><strong>${_e(S)}</strong></article>
            <article class="daily-money-card net"><span>Today's net</span><strong>${_e(L-S)}</strong><small>Income minus expenses today</small></article>
            <article class="daily-money-card balance"><span>Total balance</span><strong>${_e(u)}</strong><small>All saved income minus expenses</small></article>
          </div>
          ${D.length?`<div class="daily-transactions-list"><h4>Today's transactions</h4>${D.slice().sort((k,O)=>new Date(O.date)-new Date(k.date)).map(k=>{let O=String(k.type||"").toLowerCase()==="income";return`<div class="daily-transaction-row"><span class="daily-transaction-type ${O?"is-income":"is-expense"}">${O?"\u2199":"\u2197"}</span><span class="daily-transaction-name">${P(k.category||k.title||k.note||(O?"Income":"Expense"))}<small>${P(k.note||k.description||k.paymentMethod||k.payment_method||"")}</small></span><strong class="${O?"money-positive":"money-negative"}">${O?"+":"\u2212"}${_e(k.amount).replace(/^₹\s?/,"\u20B9")}</strong></div>`}).join("")}</div>`:'<p class="daily-finance-empty">No income or expense transactions recorded today.</p>'}
        </section>
      </section>
    </section>
  `}function gt(n){let e=Number(n);return e===0?"Clear sky":e===1?"Mainly clear":e===2?"Partly cloudy":e===3?"Overcast":e===45||e===48?"Foggy":[51,53,55].includes(e)?"Drizzle":[56,57].includes(e)?"Freezing drizzle":[61,63,65].includes(e)?"Rain":[66,67].includes(e)?"Freezing rain":[71,73,75,77].includes(e)?"Snow":[80,81,82].includes(e)?"Rain showers":[85,86].includes(e)?"Snow showers":e===95?"Thunderstorm":[96,99].includes(e)?"Thunderstorm with hail":"Conditions unavailable"}function ft(n,e=1){let t=Number(n);return t===0?Number(e)?"\u2600\uFE0F":"\u{1F319}":[1,2].includes(t)?Number(e)?"\u{1F324}\uFE0F":"\u2601\uFE0F":t===3?"\u2601\uFE0F":[45,48].includes(t)?"\u{1F32B}\uFE0F":[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(t)?"\u{1F327}\uFE0F":[71,73,75,77,85,86].includes(t)?"\u{1F328}\uFE0F":[95,96,99].includes(t)?"\u26C8\uFE0F":"\u{1F326}\uFE0F"}function ut(n){if(!n)return"\u2014";let e=new Date(n);return Number.isNaN(e.getTime())?String(n).slice(-5):e.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}function Vi(){let n=a.weather||{},e=n.data,t=e?.current,s=e?.daily,i=e?.hourly,o=t&&i?.time?.length?Math.max(0,i.time.reduce((h,f,x)=>{let I=Date.parse(t.time||""),E=Date.parse(f||"");return!Number.isFinite(E)||!Number.isFinite(I)?h:Math.abs(E-I)<Math.abs(Date.parse(i.time[h]||"")-I)?x:h},0)):0,d=a.theme==="light",p=P(n.locationLabel||"Current location"),r=(h,f,x="",I="\u2022")=>`<article class="weather-metric-card"><span class="weather-metric-icon" aria-hidden="true">${I}</span><div class="weather-metric-copy"><span>${h}</span><strong>${f}</strong>${x?`<small>${x}</small>`:""}</div></article>`,g=n.status==="loading"?'<div class="weather-status-panel is-loading"><span class="weather-spinner"></span><div><strong>Getting real weather\u2026</strong><p>Fetching current conditions and the forecast.</p></div></div>':n.status==="error"?`<div class="weather-status-panel is-error"><span class="weather-status-symbol">!</span><div><strong>Weather unavailable</strong><p>${P(n.error||"Could not fetch weather data.")}</p><p>Allow location access or search for a city below.</p>${window.Capacitor?.isNativePlatform?.()&&/location|permission|gps|services|denied/i.test(n.error||"")?'<div class="weather-permission-actions"><button type="button" data-action="open-location-permission-settings">App permissions</button><button type="button" data-action="open-device-location-settings">Device location</button></div>':""}</div></div>`:t?"":'<div class="weather-status-panel"><span class="weather-status-symbol">\u2601</span><div><strong>Live weather, not estimates</strong><p>Use your device location or search a city to load current weather from the forecast service.</p></div></div>';return`
    <section class="screen weather-page" aria-label="Detailed weather">
      <header class="weather-page-header"><button type="button" class="weather-back-button" data-action="weather-back" aria-label="Back to home">\u2039</button><div class="weather-page-heading"><p>DAYSYNC \u2022 LIVE FORECAST</p><h1>Weather</h1><span>${p}</span></div><button type="button" class="weather-refresh-button" data-action="weather-refresh" ${n.status==="loading"?"disabled":""} aria-label="Refresh weather">\u21BB</button></header>
      ${g}
      ${t&&e?`
        <section class="weather-hero-panel">
          <div class="weather-hero-top"><span class="weather-live-label"><i></i> LIVE DATA</span><span class="weather-updated">Updated ${P(ut(n.updatedAt))}</span></div>
          <div class="weather-hero-main"><div><p class="weather-condition-label">${P(gt(t.weather_code))}</p><div class="weather-hero-temperature">${Math.round(Number(t.temperature_2m))}<span>\xB0C</span></div><p class="weather-feels-like">Feels like ${Math.round(Number(t.apparent_temperature))}\xB0C</p></div><div class="weather-hero-icon" aria-hidden="true">${ft(t.weather_code,t.is_day)}</div></div>
          <div class="weather-hero-range"><span>Today\u2019s high <strong>${Math.round(Number(s?.temperature_2m_max?.[0]))}\xB0</strong></span><span>Today\u2019s low <strong>${Math.round(Number(s?.temperature_2m_min?.[0]))}\xB0</strong></span></div>
        </section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>RIGHT NOW</p><h2>Weather details</h2></div><span>Real-time forecast</span></div>
          <div class="weather-metrics-grid">
            ${r("Humidity",`${Math.round(Number(t.relative_humidity_2m))}%`,"Relative humidity","\u25CC")}
            ${r("Wind speed",`${Math.round(Number(t.wind_speed_10m))} km/h`,`Direction ${Math.round(Number(t.wind_direction_10m))}\xB0`,"\u2197")}
            ${r("Wind gusts",`${Math.round(Number(t.wind_gusts_10m))} km/h`,"Peak wind gust","\u224B")}
            ${r("Pressure",`${Math.round(Number(t.pressure_msl))} hPa`,"Sea-level pressure","\u2301")}
            ${r("Visibility",Number.isFinite(Number(i?.visibility?.[o]))?`${(Number(i.visibility[o])/1e3).toFixed(1)} km`:"\u2014","Forecast estimate","\u25C9")}
            ${r("Dew point",Number.isFinite(Number(i?.dew_point_2m?.[o]))?`${Math.round(Number(i.dew_point_2m[o]))}\xB0C`:"\u2014","Moisture in the air","\u2744")}
            ${r("UV index",Number.isFinite(Number(i?.uv_index?.[o]))?Number(i.uv_index[o]).toFixed(1):Number.isFinite(Number(s?.uv_index_max?.[0]))?`Max ${Number(s.uv_index_max[0]).toFixed(1)}`:"\u2014","Sun exposure level","\u263C")}
            ${r("Precipitation",`${Number(t.precipitation||0).toFixed(1)} mm`,`Rain ${Number(t.rain||0).toFixed(1)} mm \xB7 Showers ${Number(t.showers||0).toFixed(1)} mm`,"\u2602")}
            ${r("Cloud cover",`${Math.round(Number(t.cloud_cover))}%`,"Sky covered by clouds","\u2601")}
            ${r("Rain chance",Number.isFinite(Number(i?.precipitation_probability?.[o]))?`${Math.round(Number(i.precipitation_probability[o]))}%`:Number.isFinite(Number(s?.precipitation_probability_max?.[0]))?`${Math.round(Number(s.precipitation_probability_max[0]))}% max today`:"\u2014","Probability of precipitation","\u25D2")}
          </div>
        </section>
        <section class="weather-sun-grid"><article class="weather-sun-card sunrise"><span>\u2600</span><div><small>Sunrise</small><strong>${P(ut(s?.sunrise?.[0]))}</strong></div></article><article class="weather-sun-card sunset"><span>\u263E</span><div><small>Sunset</small><strong>${P(ut(s?.sunset?.[0]))}</strong></div></article></section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>COMING UP</p><h2>Hourly forecast</h2></div><span>Next 6 hours</span></div><div class="weather-hourly-strip">${(i?.time||[]).slice(o,o+6).map((h,f)=>{let x=o+f;return`<article class="weather-hour-card"><span>${f===0?"Now":P(ut(h))}</span><span class="weather-hour-icon">${ft(i.weather_code?.[x],1)}</span><strong>${Math.round(Number(i.temperature_2m?.[x]))}\xB0</strong><small>${Number.isFinite(Number(i.precipitation_probability?.[x]))?`${Math.round(Number(i.precipitation_probability[x]))}% rain`:P(gt(i.weather_code?.[x]))}</small></article>`}).join("")}</div></section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>PLAN AHEAD</p><h2>7-day forecast</h2></div><span>Daily outlook</span></div><div class="weather-daily-list">${(s?.time||[]).map((h,f)=>`<article class="weather-daily-row"><div class="weather-daily-day"><strong>${f===0?"Today":P(new Date(`${h}T12:00:00`).toLocaleDateString("en-IN",{weekday:"short"}))}</strong><small>${P(new Date(`${h}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"}))}</small></div><span class="weather-daily-icon">${ft(s.weather_code?.[f],1)}</span><span class="weather-daily-condition">${P(gt(s.weather_code?.[f]))}</span><div class="weather-daily-temps"><span>${Math.round(Number(s.temperature_2m_min?.[f]))}\xB0</span><i><b style="width:${Math.max(8,Math.min(100,(Number(s.temperature_2m_max?.[f])-Number(s.temperature_2m_min?.[f])+8)*5))}%"></b></i><strong>${Math.round(Number(s.temperature_2m_max?.[f]))}\xB0</strong></div></article>`).join("")}</div></section>
      `:""}
      <section class="weather-search-panel"><div><p>LOCATION</p><h2>Check another city</h2><span>Search a city to load its real forecast.</span></div><form data-weather-search-form class="weather-search-form"><input name="city" type="search" placeholder="Enter city or town" autocomplete="off" required minlength="2" aria-label="City for weather forecast"><button type="submit" ${n.status==="loading"?"disabled":""}>Search</button></form><button type="button" class="weather-use-location" data-action="weather-refresh" ${n.status==="loading"?"disabled":""}>\u2197 Use my current location</button></section>
      <p class="weather-source-note">Weather and forecast provided by Open-Meteo. Location access is used only to find local forecast coordinates.</p>
    </section>`}async function ua(n){let e=window.Capacitor?.Plugins?.DaySyncSettings;if(!window.Capacitor?.isNativePlatform?.()||typeof e?.[n]!="function"){$("Open your device Settings and select DaySync permissions.");return}try{await e[n]()}catch(t){$(t.message||"Could not open device settings.")}}async function Vn(n){let e=`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({name:n,count:"1",language:"en",format:"json"})}`,t=await fetch(e);if(!t.ok)throw new Error("City search failed. Please try again.");let i=(await t.json()).results?.[0];if(!i)throw new Error(`No location found for \u201C${n}\u201D. Check the spelling and try again.`);return{latitude:i.latitude,longitude:i.longitude,label:[i.name,i.admin1,i.country].filter(Boolean).filter((o,d,p)=>p.indexOf(o)===d).join(", ")}}async function Ki(){if(!!window.Capacitor?.isNativePlatform?.())try{let e=await ot.checkPermissions(),t=()=>e.location==="granted"||e.coarseLocation==="granted";if(t()||(e=await ot.requestPermissions({permissions:["location","coarseLocation"]})),!t())throw new Error("Location permission was denied. Allow DaySync location access in Android Settings, or search for a city below.");let s=await ot.getCurrentPosition({enableHighAccuracy:e.location==="granted",timeout:15e3,maximumAge:300*1e3});return{latitude:s.coords.latitude,longitude:s.coords.longitude,label:"Your current location"}}catch(e){let t=String(e?.message||"");throw/denied|permission/i.test(t)?new Error("Location permission is unavailable. Enable location for DaySync in Android Settings, or search for a city below."):/disabled|services|location provider/i.test(t)?new Error("Turn on device location services and try again, or search for a city below."):new Error(`${t||"Could not determine your device location."} You can also search for a city below.`)}if(!navigator.geolocation)throw new Error("This browser does not support location access. Search for a city below.");return new Promise((e,t)=>{navigator.geolocation.getCurrentPosition(s=>e({latitude:s.coords.latitude,longitude:s.coords.longitude,label:"Your current location"}),s=>t(new Error(s.code===1?"Location permission was denied. Allow location access in browser settings, or search for a city below.":s.code===2?"Your location is unavailable. Turn on location services or search for a city below.":"Location lookup timed out. Try again or search for a city below.")),{enableHighAccuracy:!1,timeout:15e3,maximumAge:300*1e3})})}async function Xi(n,e){let t=new URLSearchParams({latitude:String(n.latitude),longitude:String(n.longitude),current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",hourly:"temperature_2m,precipitation_probability,weather_code,visibility,dew_point_2m,uv_index",daily:"weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",timezone:"auto",forecast_days:"7",wind_speed_unit:"kmh",temperature_unit:"celsius",precipitation_unit:"mm"}),s=await fetch(`https://api.open-meteo.com/v1/forecast?${t.toString()}`,{headers:{Accept:"application/json"}});if(!s.ok)throw new Error(`Weather service returned ${s.status}. Please try again.`);let i=await s.json();if(!i.current||!i.daily||!i.hourly)throw new Error("The weather service returned incomplete data. Please refresh.");if(a.weather.requestId===e){a.weather={...a.weather,status:"success",data:i,locationLabel:n.label,error:"",updatedAt:new Date().toISOString()};try{localStorage.setItem("daysyncWeatherLocation",JSON.stringify({latitude:Number(n.latitude),longitude:Number(n.longitude),label:String(n.label||"Selected location")}))}catch{}}}async function ba(n=""){let e=Number(a.weather.requestId||0)+1;a.weather={...a.weather,requestId:e,status:"loading",error:"",data:null},a.view==="weather"&&v();try{let t;if(n)t=await Vn(n);else try{t=await Ki()}catch(s){let i=null;try{i=JSON.parse(localStorage.getItem("daysyncWeatherLocation")||"null")}catch{}if(i&&Number.isFinite(Number(i.latitude))&&Number.isFinite(Number(i.longitude))&&Math.abs(Number(i.latitude))<=90&&Math.abs(Number(i.longitude))<=180)t={latitude:Number(i.latitude),longitude:Number(i.longitude),label:`${String(i.label||"Selected location")} \xB7 last selected`};else{let o=a.user?.location||a.user?.preferences?.location||a.user?.city||"";if(!String(o).trim())throw new Error(`${s.message} Allow location access in your browser, or search for a city below.`);t=await Vn(String(o)),t.label=`${t.label} \xB7 saved profile location`}}await Xi(t,e)}catch(t){a.weather.requestId===e&&(a.weather={...a.weather,status:"error",error:t.message||"Unable to load weather data."})}finally{a.view==="weather"&&a.weather.requestId===e&&v()}}function Qi(){let n=Math.max(1,Number(a.focusInitialSeconds)||1500),e=Math.max(0,Number(a.focusSeconds)||0),t=Math.min(100,Math.max(0,(n-e)/n*100)),s=String(Math.floor(e/60)).padStart(2,"0"),i=String(e%60).padStart(2,"0"),o=a.theme==="light",d=Array.isArray(a.focusSessions)?a.focusSessions:[],p=H(new Date),r=d.filter(h=>h.date===p&&h.completed),g=r.reduce((h,f)=>h+(Number(f.minutes)||0),0);return`
    <section class="screen focus-screen" aria-label="Focus Timer">
      <header class="focus-header">
        <button class="focus-back" type="button" data-action="focus-back" aria-label="Back">\u2039</button>
        <div class="focus-title-copy"><p class="focus-eyebrow">DAYSYNC \u2022 FOCUS SESSION</p><h1>Focus Timer</h1></div>
        <span class="focus-mode-pill">${a.focusRunning?"FOCUSING":a.focusAlarmActive?"COMPLETE":"READY"}</span>
      </header>
      <div class="focus-card glass-card">
        <div class="focus-label-row"><label for="focus-label">Session</label><input id="focus-label" maxlength="60" value="${ma(a.focusLabel||"Study session")}" placeholder="Study session" /></div>
        <div class="focus-ring-wrap">
          <svg class="focus-ring" viewBox="0 0 240 240" role="img" aria-label="Timer progress">
            <defs><linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="52%" stop-color="#22d3a6"/><stop offset="100%" stop-color="#4ade80"/></linearGradient></defs>
            <g class="focus-ring-ticks">${Array.from({length:60},(h,f)=>`<line x1="120" y1="7" x2="120" y2="${f%5===0?16:11}" transform="rotate(${f*6} 120 120)" />`).join("")}</g>
            <circle class="focus-ring-track" cx="120" cy="120" r="101"></circle>
            <circle class="focus-ring-progress" cx="120" cy="120" r="101" style="stroke-dasharray: ${2*Math.PI*101}; stroke-dashoffset: ${2*Math.PI*101*(1-t/100)}"></circle>
          </svg>
          <div class="focus-clock"><strong id="focus-clock">${s}:${i}</strong><span id="focus-status">${a.focusRunning?"STAY IN THE FLOW":a.focusAlarmActive?"SESSION COMPLETE":"READY WHEN YOU ARE"}</span></div>
        </div>
        <div class="focus-controls">
          <button type="button" class="focus-control secondary" data-action="focus-reset" aria-label="Reset timer" title="Reset">\u21BA</button>
          <button type="button" class="focus-control primary" data-action="focus-start" aria-label="Start timer" title="Start">\u25B6</button>
          <button type="button" class="focus-control secondary" data-action="focus-pause" aria-label="Pause timer" title="Pause">\u2B1C</button>
        </div>
        <div class="focus-custom"><label for="focus-minutes">Session length</label><div class="focus-custom-row"><input id="focus-minutes" type="number" min="1" max="180" value="${Math.max(1,Math.round((a.focusSeconds>0?a.focusSeconds:n)/60))}" ${a.focusRunning?"disabled":""}/><span>minutes</span><button type="button" data-action="focus-set" ${a.focusRunning?"disabled":""}>Set time</button></div></div>
        <div class="focus-presets"><button type="button" data-focus-minutes="15" ${a.focusRunning?"disabled":""}>15 min</button><button type="button" data-focus-minutes="25" ${a.focusRunning?"disabled":""}>25 min</button><button type="button" data-focus-minutes="45" ${a.focusRunning?"disabled":""}>45 min</button><button type="button" data-focus-minutes="60" ${a.focusRunning?"disabled":""}>60 min</button></div>
        <p class="focus-tip">${o?"A clear mind starts with one focused session.":"One session. One goal. Keep your momentum."}</p>
      </div>
      <div class="focus-stats"><div class="focus-stat glass-card"><span>Today\u2019s focus</span><strong>${g} <small>min</small></strong></div><div class="focus-stat glass-card"><span>Sessions completed</span><strong>${r.length}</strong></div><div class="focus-stat glass-card"><span>Total sessions</span><strong>${d.filter(h=>h.completed).length}</strong></div></div>
    </section>`}var ie=null,va=941207,ee=null,qe=[],yt=null,bt=null,wa=-1,Ea="daysyncFocusTimerState";function Na(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function re(){try{localStorage.setItem(Ea,JSON.stringify({focusSeconds:Number(a.focusSeconds)||0,focusInitialSeconds:Number(a.focusInitialSeconds)||1500,focusRunning:!!a.focusRunning,focusEndsAt:Number(a.focusEndsAt)||null,focusLabel:String(a.focusLabel||"Study session").slice(0,60),focusAlarmActive:!!a.focusAlarmActive,focusAlarmStartedAt:Number(a.focusAlarmStartedAt)||null,focusSessionId:a.focusSessionId||null,focusLastCompletedId:a.focusLastCompletedId||null}))}catch(n){console.warn("Could not persist Focus Timer state:",n)}}function he({closeContext:n=!0}={}){if(yt&&clearInterval(yt),bt&&clearTimeout(bt),yt=null,bt=null,qe.forEach(e=>{try{e.stop()}catch{}}),qe=[],n&&ee){let e=ee;ee=null;try{e.close()}catch{}}}function Zi(){let n=window.AudioContext||window.webkitAudioContext;if(n)try{(!ee||ee.state==="closed")&&(ee=new n),ee.state==="suspended"&&ee.resume().catch(()=>{})}catch(e){console.warn("Focus alarm audio could not be prepared:",e)}}function us(n=1e4){let e=window.AudioContext||window.webkitAudioContext;if(!(!e||n<=0)){he({closeContext:!1});try{(!ee||ee.state==="closed")&&(ee=new e);let t=ee;t.state==="suspended"&&t.resume().catch(()=>{});let s=Date.now(),i=()=>{if(!ee||ee!==t||Date.now()-s>=n)return;let o=t.currentTime;[0,.18].forEach((d,p)=>{let r=t.createOscillator(),g=t.createGain();r.type="sine",r.frequency.value=p?1046.5:880,g.gain.setValueAtTime(1e-4,o+d),g.gain.exponentialRampToValueAtTime(.2,o+d+.02),g.gain.exponentialRampToValueAtTime(1e-4,o+d+.15),r.connect(g),g.connect(t.destination),r.start(o+d),r.stop(o+d+.17),qe.push(r),r.onended=()=>{qe=qe.filter(h=>h!==r);try{r.disconnect(),g.disconnect()}catch{}}})};i(),yt=setInterval(i,650),bt=setTimeout(()=>he({closeContext:!0}),n)}catch(t){console.warn("Focus alarm audio is unavailable on this device:",t),he()}}}async function St({removeDelivered:n=!1}={}){if(window.Capacitor?.isNativePlatform?.())try{await B.cancel({notifications:[{id:va}]}),n&&await B.removeDeliveredNotifications({notifications:[{id:va}]})}catch(e){console.warn("Could not cancel Focus Timer notification:",e.message)}}async function eo(n){if(!window.Capacitor?.isNativePlatform?.()){if("Notification"in window&&Notification.permission==="default")try{await Notification.requestPermission()}catch{}return}try{window.SAHRA_NOTIFICATIONS?.ready&&await window.SAHRA_NOTIFICATIONS.ready;let e=await B.checkPermissions();if(e.display!=="granted"&&["prompt","prompt-with-rationale","unknown"].includes(e.display)&&(e=await B.requestPermissions()),e.display!=="granted"){$("Enable DaySync notifications in Android Settings to receive timer alerts while the app is in the background.");return}await B.schedule({notifications:[{id:va,title:"Focus session complete",body:`${a.focusLabel||"Your focus session"} is finished. Tap Reset to start another session.`,schedule:{at:new Date(Date.now()+Math.max(1,n)*1e3),allowWhileIdle:!0},sound:"daysync_alarm.wav",channelId:"daysync-focus-alarm",actionTypeId:"daysync-focus-alarm",autoCancel:!1,extra:{type:"focus-alarm",sessionId:String(a.focusSessionId||"")}}]})}catch(e){console.warn("Could not schedule background Focus Timer alert:",e.message),$("The on-screen timer works, but Android could not schedule its background alert. Check notification/alarm permissions in Settings.")}}function to(){let n=document.getElementById("focus-clock");n&&(n.textContent=`${String(Math.floor(a.focusSeconds/60)).padStart(2,"0")}:${String(a.focusSeconds%60).padStart(2,"0")}`);let e=document.querySelector(".focus-ring-progress");e&&(e.style.strokeDashoffset=`${2*Math.PI*101*(1-(a.focusInitialSeconds-a.focusSeconds)/Math.max(1,a.focusInitialSeconds))}`)}function Ta(){if(!(a.focusAlarmActive||!a.focusRunning&&a.focusSeconds===0&&a.focusLastCompletedId===a.focusSessionId)){if(clearInterval(ie),ie=null,a.focusRunning=!1,a.focusStartedAt=null,a.focusEndsAt=null,a.focusSeconds=0,a.focusSessionId||(a.focusSessionId=Na()),a.focusLastCompletedId!==a.focusSessionId){let n=Math.max(1,Math.round((a.focusInitialSeconds||1500)/60)),e=new Date,t=new Date(e.getTime()-n*60*1e3),s={date:H(e),sessionDate:H(e),minutes:n,plannedMinutes:n,label:a.focusLabel||"Study session",completed:!0,startedAt:t.toISOString(),endedAt:e.toISOString(),completedAt:e.toISOString(),sessionId:a.focusSessionId},i=Array.isArray(a.focusSessions)?a.focusSessions:[];i.unshift(s),a.focusSessions=i.slice(0,500),a.focusLastCompletedId=a.focusSessionId;try{localStorage.setItem("sahraFocusSessions",JSON.stringify(a.focusSessions))}catch{}a.authenticated&&_("/api/focus/sessions",{method:"POST",headers:{"Idempotency-Key":`focus-${a.focusSessionId}`},body:JSON.stringify({sessionId:a.focusSessionId,sessionDate:s.sessionDate,plannedMinutes:n,startedAt:s.startedAt,endedAt:s.endedAt,completed:!0,label:s.label})}).catch(o=>console.warn("Focus session will remain in local history until it can sync:",o.message))}if(a.focusAlarmActive=!0,a.focusAlarmStartedAt=Date.now(),re(),document.visibilityState!=="hidden"&&us(1e4),"Notification"in window&&Notification.permission==="granted"&&!window.Capacitor?.isNativePlatform?.()&&document.visibilityState==="hidden")try{new Notification("DaySync Focus Timer",{body:`${a.focusLabel||"Focus session"} is complete.`,icon:"./image-192.png",tag:"daysync-focus-complete"})}catch{}document.visibilityState==="visible"&&St({removeDelivered:!0}),$("Focus session complete! Your alarm will stop after 10 seconds."),v()}}function vt(){!a.focusRunning||!a.focusEndsAt||(a.focusSeconds=Math.max(0,Math.ceil((a.focusEndsAt-Date.now())/1e3)),a.focusSeconds!==wa&&(wa=a.focusSeconds,re()),to(),a.focusSeconds<=0&&Ta())}function ps({resume:n=!1}={}){clearInterval(ie),a.focusRunning=!0,(!n||!a.focusEndsAt)&&(a.focusEndsAt=Date.now()+Math.max(1,a.focusSeconds)*1e3),a.focusStartedAt=Date.now(),(!a.focusSessionId||a.focusLastCompletedId===a.focusSessionId)&&(a.focusSessionId=Na()),a.focusAlarmActive=!1,a.focusAlarmStartedAt=null,wa=-1,re(),eo(a.focusSeconds),vt(),a.focusRunning&&(ie=setInterval(vt,250)),v()}function ao(){a.focusRunning&&(a.focusSeconds=Math.max(0,Math.ceil(((a.focusEndsAt||Date.now())-Date.now())/1e3)),a.focusRunning=!1,a.focusStartedAt=null,a.focusEndsAt=null,clearInterval(ie),ie=null,St(),re(),v())}function xa({reset:n=!1,expectedSessionId:e=null}={}){e&&a.focusSessionId&&e!==a.focusSessionId||(he(),a.focusAlarmActive=!1,a.focusAlarmStartedAt=null,a.focusRunning=!1,a.focusEndsAt=null,clearInterval(ie),ie=null,St({removeDelivered:!0}),n&&(a.view="focus",a.focusSeconds=Math.max(1,Number(a.focusInitialSeconds)||1500),a.focusSessionId=null),re(),v())}function Da(){if(document.getElementById("daysync-focus-alarm-overlay")?.remove(),!a.focusAlarmActive)return;let n=document.createElement("section");n.id="daysync-focus-alarm-overlay",n.className="daysync-focus-alarm",n.setAttribute("role","alertdialog"),n.setAttribute("aria-live","assertive"),n.innerHTML=`
    <div class="daysync-focus-alarm-copy"><span class="daysync-focus-alarm-icon" aria-hidden="true">\u23F1</span><div><strong>Focus session completed</strong><p>${P(a.focusLabel||"Your focus session")} is finished.</p></div></div>
    <div class="daysync-focus-alarm-actions"><button type="button" data-focus-alarm-action="stop">Stop</button><button type="button" data-focus-alarm-action="reset">Reset</button></div>`,document.body.appendChild(n)}function Ia({actionId:n,sessionId:e}={}){let t=e?String(e):null;t&&a.focusSessionId&&t!==String(a.focusSessionId)||(a.focusRunning&&a.focusEndsAt&&a.focusEndsAt<=Date.now()&&Ta(),n==="stop"&&xa({expectedSessionId:t}),n==="reset"&&xa({reset:!0,expectedSessionId:t}))}window.SAHRA_HANDLE_FOCUS_ALARM_ACTION=Ia;function no(){try{let n=localStorage.getItem("daysyncPendingFocusAlarmAction");if(!n)return;localStorage.removeItem("daysyncPendingFocusAlarmAction"),Ia(JSON.parse(n))}catch(n){console.warn("Could not restore Focus Timer notification action:",n)}}function so(){try{let n=JSON.parse(localStorage.getItem(Ea)||"null");if(!n||typeof n!="object")return;if(a.focusInitialSeconds=Math.max(60,Math.min(10800,Number(n.focusInitialSeconds)||1500)),a.focusSeconds=Math.max(0,Math.min(a.focusInitialSeconds,Number(n.focusSeconds)||0)),a.focusLabel=String(n.focusLabel||"Study session").slice(0,60),a.focusSessionId=n.focusSessionId||null,a.focusLastCompletedId=n.focusLastCompletedId||null,a.focusAlarmActive=!!n.focusAlarmActive,a.focusAlarmStartedAt=Number(n.focusAlarmStartedAt)||null,n.focusRunning&&Number(n.focusEndsAt)>0)a.focusRunning=!0,a.focusEndsAt=Number(n.focusEndsAt),a.focusSeconds=Math.max(0,Math.ceil((a.focusEndsAt-Date.now())/1e3)),a.focusSeconds<=0?Ta():ps({resume:!0});else{if(a.focusRunning=!1,a.focusEndsAt=null,a.focusAlarmActive){let e=a.focusAlarmStartedAt?Date.now()-a.focusAlarmStartedAt:1e4;e>=0&&e<1e4&&document.visibilityState!=="hidden"&&us(1e4-e)}re()}}catch(n){console.warn("Could not restore Focus Timer state:",n)}v()}function io(){let n=document.getElementById("app");if(!n||a.view!=="focus")return;let e=n.querySelector("#focus-label");e?.addEventListener("change",()=>{a.focusLabel=e.value.trim()||"Study session",re()}),n.querySelectorAll("[data-focus-minutes]").forEach(t=>t.addEventListener("click",()=>{if(a.focusRunning)return;let s=Math.max(1,Math.min(180,Number(t.dataset.focusMinutes)||25));a.focusSeconds=a.focusInitialSeconds=s*60,a.focusSessionId=null,a.focusAlarmActive=!1,re(),v()})),n.querySelectorAll('[data-action^="focus-"]').forEach(t=>t.addEventListener("click",()=>{let s=t.dataset.action;if(s==="focus-back"&&we(),s==="focus-start"){if(a.focusRunning)return;let i=document.getElementById("focus-label");a.focusLabel=i?.value?.trim()||a.focusLabel||"Study session",a.focusSeconds<=0&&(a.focusSeconds=a.focusInitialSeconds),(!a.focusSessionId||a.focusLastCompletedId===a.focusSessionId)&&(a.focusSessionId=Na()),he(),Zi(),ps()}if(s==="focus-reset"&&(a.focusRunning=!1,a.focusEndsAt=null,clearInterval(ie),ie=null,he(),St({removeDelivered:!0}),a.focusAlarmActive=!1,a.focusAlarmStartedAt=null,a.focusSeconds=a.focusInitialSeconds,a.focusSessionId=null,re(),v()),s==="focus-pause"&&a.focusRunning&&ao(),s==="focus-set"){let i=document.getElementById("focus-minutes"),o=Math.max(1,Math.min(180,Number(i?.value)||25));a.focusSeconds=a.focusInitialSeconds=o*60,a.focusSessionId=null,a.focusAlarmActive=!1,re(),v()}}))}document.addEventListener("click",n=>{let e=n.target.closest("[data-focus-alarm-action]");e&&Ia({actionId:e.dataset.focusAlarmAction,sessionId:a.focusSessionId})});window.addEventListener("daysync:resume",()=>{a.focusRunning&&vt(),a.focusAlarmActive&&Da()});document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(a.focusRunning&&vt(),a.focusAlarmActive&&Da())});function oo(){let n=Array.isArray(a.data.tasks)?a.data.tasks:[],e=Array.isArray(a.data.events)?a.data.events:[],t=Array.isArray(a.data.habits)?a.data.habits:[],s=Array.isArray(a.data.goals)?a.data.goals:[],i=["January","February","March","April","May","June","July","August","September","October","November","December"],o=i[a.currentMonth]||i[new Date().getMonth()],d=H(new Date),p=(Array.isArray(a.financeData)?a.financeData:[]).filter(c=>{if(!c?.date)return!1;let A=new Date(c.date);return Number.isNaN(A.getTime())?!1:A.getFullYear()===Number(a.currentYear)&&A.getMonth()===Number(a.currentMonth)}),r=p.filter(c=>String(c.type||"").toLowerCase()==="income").reduce((c,A)=>c+Number(A.amount||0),0),g=p.filter(c=>String(c.type||"").toLowerCase()==="expense").reduce((c,A)=>c+Number(A.amount||0),0),h=r-g,f=n.filter(c=>{if(!c.date)return!1;let A=String(c.date).slice(0,10).split("-");if(A.length<3)return!1;let M=Number(A[0]),U=Number(A[1])-1;return M===Number(a.currentYear)&&U===Number(a.currentMonth)}),x=f.filter(c=>c.completed||c.status==="Completed").length,I=f.filter(c=>c.completed||c.status==="Completed"?!1:c.status==="Overdue"||c.date&&String(c.date).slice(0,10)<d).length,E=f.filter(c=>{let A=c.completed||c.status==="Completed",M=c.status==="Overdue"||c.date&&String(c.date).slice(0,10)<d;return!A&&!M}).length,T=f.length,w=e.filter(c=>{if(!c.date)return!1;let A=String(c.date).slice(0,10).split("-");if(A.length<3)return!1;let M=Number(A[0]),U=Number(A[1])-1;return M===Number(a.currentYear)&&U===Number(a.currentMonth)}),D=[...f.map(c=>({type:c.completed||c.status==="Completed"?"task-complete":"task-pending",label:c.completed||c.status==="Completed"?`Completed task \u201C${c.title}\u201D`:`Task \u201C${c.title}\u201D`,timeLabel:c.date?jn(c.date):"This month"})),...w.map(c=>({type:"event",label:`Event \u201C${c.title}\u201D`,timeLabel:c.date?jn(c.date):"This month"})),...t.slice(0,2).map(c=>({type:"habit",label:`Habit \u201C${c.name}\u201D`,timeLabel:c.frequency||"Daily"})),...s.slice(0,2).map(c=>({type:"goal",label:`Goal \u201C${c.title}\u201D`,timeLabel:c.status||"Active"}))],q=a.progressData?.period?.year===Number(a.currentYear)&&a.progressData?.period?.month===Number(a.currentMonth)+1?a.progressData:null,F=q?.stats||{totalTasks:T,completedTasks:x,pendingTasks:E,overdueTasks:I,completionPercent:T>0?Math.round(x/T*100):0},L=Math.max(0,Number(F.totalTasks??f.length)||0),S=Math.min(L,Math.max(0,Number(F.completedTasks)||0)),u=Math.min(Math.max(0,L-S),Math.max(0,Number(F.overdueTasks)||0)),l=Math.max(0,L-S-u),m=L?Math.max(0,Math.min(100,Math.round(S/L*100))):0,y=`${Number(a.currentYear)}-${String(Number(a.currentMonth)+1).padStart(2,"0")}`,b=c=>{let A=Z(c);return!!(A&&A.slice(0,7)===y)},N=Array.isArray(a.data.assets)&&a.data.assets.length?a.data.assets:Array.isArray(a.data.notes)?a.data.notes:[],C=N.filter(c=>b(c.createdAt||c.date)),R=Ae([...Array.isArray(a.goalAchievementItems)?a.goalAchievementItems:[],...Array.isArray(a.data.goalAchievements)?a.data.goalAchievements:[]],[]),j=R.filter(c=>b(c.createdAt||c.createdOn)),K=R.filter(c=>(c.status==="Completed"||Number(c.current||0)>=Number(c.target||1))&&b(c.completedAt||c.updatedAt||c.createdAt)),te=(Array.isArray(a.data.moods)?a.data.moods:[]).filter(c=>b(c.date||c.createdAt)),k={"\u{1F60A}":"Happy","\u{1F610}":"Normal","\u{1F622}":"Sad","\u{1F621}":"Angry","\u{1F634}":"Tired","\u{1F525}":"Motivated","\u{1F60D}":"Excited"},O=te.reduce((c,A)=>{let M=String(A.mood||"").trim();return M&&(c[M]=(c[M]||0)+1),c},{}),se=Object.entries(O).map(([c,A])=>({emoji:c,count:A,label:k[c]||"Mood"})).sort((c,A)=>A.count-c.count||c.emoji.localeCompare(A.emoji)),W=se[0]||null,Ue=Array.isArray(a.focusStatsData?.records)?a.focusStatsData.records:[],Et=Array.isArray(a.focusSessions)?a.focusSessions:[],Nt=new Map;[...Ue,...Et].forEach((c,A)=>{if(!c||c.completed===!1)return;let M=c.sessionDate||c.date||c.endedAt||c.completedAt||c.startedAt||c.createdAt;if(!b(M))return;let U=`${Z(M)}|${Number(c.minutes??c.plannedMinutes)||0}|${String(c.label||"")}|${A}`,Pe=String(c.sessionId||c._id||c.id||U),Le=Nt.get(Pe);(!Le||!Le._id&&(c._id||c.id))&&Nt.set(Pe,c)});let ce=[...Nt.values()],me=ce.reduce((c,A)=>c+Math.max(0,Number(A.minutes??A.plannedMinutes)||0),0),La=me>=60?`${Math.floor(me/60)}h ${me%60}m`:`${me} min`,Oa=w.filter(c=>String(c.date||"").slice(0,10)>=d).length,xs=Math.max(0,w.length-Oa),Tt=L?Math.round(S/L*100):0,Dt=L?Math.round(l/L*100):0,Ma=L?Math.max(0,100-Tt-Dt):0,fe=new Date(Number(a.currentYear),Number(a.currentMonth)+1,0).getDate(),vo=new Date(Number(a.currentYear),Number(a.currentMonth),1),Ra=new Date(Number(a.currentYear),Number(a.currentMonth)-1,1),Ss=`${Ra.getFullYear()}-${String(Ra.getMonth()+1).padStart(2,"0")}`,It=n.filter(c=>{let A=Z(c.date);return!!(A&&A.slice(0,7)===Ss)}),As=It.filter(c=>c.completed||c.status==="Completed").length,De=It.length?Math.round(As/It.length*100):null,ae=De===null?null:m-De,Ct=["High","Normal","Low"].map(c=>{let A=f.filter(U=>String(U.priority||"Normal").toLowerCase()===c.toLowerCase()),M=A.filter(U=>U.completed||U.status==="Completed").length;return{priority:c,total:A.length,completed:M,open:A.length-M,percent:A.length?Math.round(M/A.length*100):0}}).filter(c=>c.total>0),Pt=Ct.find(c=>c.priority==="High")?.open||0,Lt=new Map;f.forEach(c=>{let A=String(c.category||"General").trim()||"General",M=Lt.get(A)||{category:A,total:0,completed:0};M.total+=1,(c.completed||c.status==="Completed")&&(M.completed+=1),Lt.set(A,M)});let _a=[...Lt.values()].map(c=>({...c,percent:c.total?Math.round(c.completed/c.total*100):0})).sort((c,A)=>A.total-c.total||c.category.localeCompare(A.category)).slice(0,4),ks=[{label:"Week 1",start:1,end:7},{label:"Week 2",start:8,end:14},{label:"Week 3",start:15,end:21},{label:"Week 4",start:22,end:Math.min(28,fe)},{label:"Week 5",start:29,end:fe}].filter(c=>c.start<=fe).map(c=>{let A=f.filter(U=>{let Pe=Z(U.date);if(!Pe)return!1;let Le=Number(Pe.slice(8,10));return Le>=c.start&&Le<=c.end}),M=A.filter(U=>U.completed||U.status==="Completed").length;return{...c,total:A.length,completed:M,open:A.length-M,percent:A.length?Math.round(M/A.length*100):0}}),Ot=new Map;ce.forEach(c=>{let A=c.sessionDate||c.date||c.endedAt||c.completedAt||c.startedAt||c.createdAt,M=Z(A);if(!M)return;let U=Math.max(0,Number(c.minutes??c.plannedMinutes)||0);Ot.set(M,(Ot.get(M)||0)+U)});let Mt=[...Ot.entries()].sort((c,A)=>c[0].localeCompare(A[0])),Ie=Mt.length,qa=ce.length?Math.round(me/ce.length):0,$s=Ie?Math.round(me/Ie):0,Rt=[...Mt].sort((c,A)=>A[1]-c[1])[0]||null,Fa=[{label:"W1",start:1,end:7},{label:"W2",start:8,end:14},{label:"W3",start:15,end:21},{label:"W4",start:22,end:28},{label:"W5",start:29,end:fe}].filter(c=>c.start<=fe).map(c=>{let A=Mt.filter(([M])=>{let U=Number(M.slice(8,10));return U>=c.start&&U<=c.end}).reduce((M,U)=>M+U[1],0);return{...c,minutes:A}}),Es=Math.max(1,...Fa.map(c=>c.minutes)),ja=R.map(c=>{let A=Math.max(0,Number(c.target)||0),M=Math.max(0,Number(c.current)||0),U=c.status==="Completed"||A>0&&M>=A;return{...c,_target:A,_current:M,_completed:U,_percent:A>0?Math.max(0,Math.min(100,Math.round(M/A*100))):null}}),Ns=ja.filter(c=>!c._completed),_t=ja.filter(c=>c._percent!==null),qt=_t.length?Math.round(_t.reduce((c,A)=>c+A._percent,0)/_t.length):null,Ce=j.length,He=K.length,ze=new Set(te.map(c=>Z(c.date||c.createdAt)).filter(Boolean)),Ts=Math.round(ze.size/Math.max(1,fe)*100),Ft=te.map(c=>Number(c.energy)).filter(c=>Number.isFinite(c)&&c>0),Ba=Ft.length?Ft.reduce((c,A)=>c+A,0)/Ft.length:null,jt=new Map;p.filter(c=>String(c.type||"").toLowerCase()==="expense").forEach(c=>{let A=String(c.category||"General").trim()||"General";jt.set(A,(jt.get(A)||0)+Math.max(0,Number(c.amount)||0))});let Ge=[...jt.entries()].sort((c,A)=>A[1]-c[1])[0]||null,Ds=p.filter(c=>String(c.type||"").toLowerCase()==="expense").length,Is=p.filter(c=>String(c.type||"").toLowerCase()==="income").length,Ua=r>0?Math.round(h/r*100):null,Bt=new Map;w.forEach(c=>{let A=String(c.category||"General").trim()||"General";Bt.set(A,(Bt.get(A)||0)+1)});let Ut=[...Bt.entries()].sort((c,A)=>A[1]-c[1])[0]||null,Ht=(Array.isArray(a.data.habitLogs)?a.data.habitLogs:[]).filter(c=>b(c.date||c.createdAt)),Cs=Ht.filter(c=>c.completed),Ps=new Set(Ht.map(c=>Z(c.date||c.createdAt)).filter(Boolean)),Ls=new Set(Ht.map(c=>String(c.habitId||c.habit||"")).filter(Boolean)),ne=[];if(L>0?(m>=80?ne.push({icon:"\u{1F3C6}",title:"Strong task follow-through",text:`You completed ${S} of ${L} scheduled tasks (${m}%). Keep using the same planning rhythm.`}):m>=50?ne.push({icon:"\u{1F4C8}",title:"Good progress with room to improve",text:`${S} tasks are complete. ${l+u} remain open; choose a small number to finish first.`}):ne.push({icon:"\u{1F3AF}",title:"Make the task list more manageable",text:`${S} of ${L} tasks are complete. Consider splitting larger tasks into smaller steps and reviewing due dates.`}),u>0?ne.push({icon:"\u23F0",title:"Overdue tasks need attention",text:`${u} task${u===1?"":"s"} are overdue. Review whether to complete, reschedule or remove each one.`}):Pt>0&&ne.push({icon:"\u26A1",title:"High-priority work is still open",text:`${Pt} high-priority task${Pt===1?"":"s"} remain open. Consider addressing these before lower-priority work.`})):ne.push({icon:"\u{1F4DD}",title:"No tasks scheduled in this month",text:"Add a few realistic tasks to create a useful completion trend for this month."}),ae!==null){let c=ae>0?"higher":ae<0?"lower":"the same";ne.push({icon:ae>0?"\u2197\uFE0F":ae<0?"\u2198\uFE0F":"\u2194\uFE0F",title:"Compared with last month",text:`Your task completion rate is ${Math.abs(ae)} percentage point${Math.abs(ae)===1?"":"s"} ${c} than last month (${De}% previously).`})}ce.length?ne.push({icon:"\u23F1\uFE0F",title:"Focus time recorded",text:`${me} minutes across ${ce.length} completed sessions and ${Ie} active focus day${Ie===1?"":"s"}. Your average session was ${qa} minutes.`}):ne.push({icon:"\u23F1\uFE0F",title:"No completed focus sessions yet",text:"Completed Focus Timer sessions will appear here. Paused or unfinished sessions are not counted as completed focus time."}),(Ce||He)&&ne.push({icon:"\u{1F3C5}",title:"Goal activity",text:`${Ce} goal${Ce===1?"":"s"} added and ${He} completed during this month.`}),te.length&&ne.push({icon:"\u{1F49B}",title:"Mood check-ins",text:`You recorded ${te.length} mood check-in${te.length===1?"":"s"} across ${ze.size} day${ze.size===1?"":"s"}. Your most selected mood was ${W?`${W.emoji} ${W.label}`:"not available"}.`}),p.length&&ne.push({icon:"\u{1F4B0}",title:"Monthly money overview",text:h>=0?`Recorded income exceeded expenses by \u20B9${h.toLocaleString("en-IN",{maximumFractionDigits:2})}. This is based only on transactions entered in DaySync.`:`Recorded expenses exceeded income by \u20B9${Math.abs(h).toLocaleString("en-IN",{maximumFractionDigits:2})}. This is based only on transactions entered in DaySync.`});let Os=ne.slice(0,6),wo=c=>`${Math.max(0,Math.min(100,Number(c)||0))}%`,Ha=c=>`\u20B9${Math.max(0,Number(c)||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`,Ms=c=>{let A=String(c||"").split("-");return A.length===3?`${A[2]} ${i[Math.max(0,Number(A[1])-1)].slice(0,3)}`:"\u2014"},za=(q?.activity||D).map(c=>({...c,timeLabel:c.timeLabel||$i(c.occurredAt)})).slice(0,10),zt=a.progressPickerOpen?"open":"";return`
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

        <div class="month-picker-wrapper ${zt}">

          <button
            class="month-picker"
            type="button"
            data-action="toggle-progress-picker"
            aria-label="Select month and year"
            aria-expanded="${a.progressPickerOpen?"true":"false"}"
          >

            <span class="picker-icon">
              \u{1F5D3}\uFE0F
            </span>

            <span class="picker-label">

              <span class="picker-month">
                ${o}
              </span>

              <span class="picker-year">
                ${a.currentYear}
              </span>

            </span>

            <span class="caret">
              \u2304
            </span>

          </button>

          <!-- BACKDROP -->

          <div
            class="month-picker-backdrop ${zt}"
            data-action="close-progress-picker"
          ></div>

          <!-- PICKER -->

          <div
            class="month-picker-popover ${zt}"
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
                  data-year="${a.currentYear-1}"
                >
                  ${a.currentYear-1}
                </button>

                <span
                  class="year-chip active"
                  aria-current="true"
                >
                  ${a.currentYear}
                </span>

                <button
                  class="year-chip"
                  type="button"
                  data-action="progress-year-set"
                  data-year="${a.currentYear+1}"
                >
                  ${a.currentYear+1}
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

              ${i.map((c,A)=>`
                    <button
                      class="month-option ${A===a.currentMonth?"active":""}"
                      type="button"
                      data-progress-month="${A}"
                      aria-pressed="${A===a.currentMonth?"true":"false"}"
                    >
                      ${c}
                    </button>
                  `).join("")}

            </div>

          </div>

        </div>

      </header>

      <!-- HERO -->

      <section class="glass-card dashboard-hero">

        <div class="hero-copy-block">

          <h2>
            ${L>0?m>=80?`You're doing great! <span class="rocket">\u{1F680}</span>`:m>=50?'Steady progress! <span class="rocket">\u2728</span>':'Keep going! <span class="rocket">\u{1F4AA}</span>':`Ready for ${o}! <span class="rocket">\u{1F3AF}</span>`}
          </h2>

          <p>
            ${L>0?`${m}% of your tasks are complete.`:`No tasks logged for ${o} ${a.currentYear} yet.`}
          </p>

        </div>

        <div class="hero-quote">
          \u201CSmall steps<br>
          every day lead<br>
          to big results.\u201D
        </div>

      </section>

      <!-- TO-DO LIST PROGRESS -->
      <section class="glass-card todo-progress-panel" aria-label="To-Do List monthly progress">
        <div class="todo-progress-heading">
          <div class="todo-progress-title">
            <p class="dashboard-section-kicker">TASK PERFORMANCE</p>
            <h3>To-Do List Progress</h3>
            <p>Tasks scheduled for ${o} ${a.currentYear}</p>
          </div>
          <div class="todo-progress-score" aria-label="${m}% completed">
            <strong>${m}%</strong>
            <span>completed</span>
          </div>
        </div>
        <div class="todo-progress-track" role="img" aria-label="${S} completed, ${l} pending and ${u} overdue tasks">
          <span class="todo-progress-segment is-completed" style="width:${Tt}%"></span>
          <span class="todo-progress-segment is-pending" style="width:${Dt}%"></span>
          <span class="todo-progress-segment is-overdue" style="width:${Ma}%"></span>
        </div>
        <div class="todo-progress-legend">
          <div class="todo-progress-stat"><span class="todo-progress-stat-label"><i class="is-completed"></i>Completed</span><strong>${S}</strong><small>${Tt}% of tasks</small></div>
          <div class="todo-progress-stat"><span class="todo-progress-stat-label"><i class="is-pending"></i>Pending</span><strong>${l}</strong><small>${Dt}% of tasks</small></div>
          <div class="todo-progress-stat"><span class="todo-progress-stat-label"><i class="is-overdue"></i>Overdue</span><strong>${u}</strong><small>${Ma}% of tasks</small></div>
        </div>
        <div class="todo-progress-footer"><span>${L} ${L===1?"task":"tasks"} in this month</span><span>${S} of ${L} completed</span></div>
      </section>

      <!-- MONTHLY APP USAGE -->
      <section class="monthly-highlights-section" aria-label="Monthly app activity">
        <div class="monthly-highlights-heading">
          <div><p class="dashboard-section-kicker">YOUR MONTH IN REVIEW</p><h3>App activity</h3></div>
          <span>${o} ${a.currentYear}</span>
        </div>
        <div class="monthly-highlights-grid">
          <article class="monthly-highlight-card events-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F5D3}\uFE0F</span><span class="monthly-highlight-label">Events</span></div>
            <strong class="monthly-highlight-value">${w.length}</strong>
            <span class="monthly-highlight-caption">Scheduled this month</span>
            <div class="monthly-highlight-foot"><span>${Oa} upcoming</span><span>${xs} earlier</span></div>
          </article>
          <article class="monthly-highlight-card notes-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F4DD}</span><span class="monthly-highlight-label">Notes</span></div>
            <strong class="monthly-highlight-value">${C.length}</strong>
            <span class="monthly-highlight-caption">Created this month</span>
            <div class="monthly-highlight-foot"><span>${N.length} total saved</span></div>
          </article>
          <article class="monthly-highlight-card goals-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F3C6}</span><span class="monthly-highlight-label">Goal &amp; Achievements</span></div>
            <strong class="monthly-highlight-value">${K.length}</strong>
            <span class="monthly-highlight-caption">Completed this month</span>
            <div class="monthly-highlight-foot"><span>${j.length} added</span><span>${R.length} total</span></div>
          </article>
          <article class="monthly-highlight-card focus-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u23F1\uFE0F</span><span class="monthly-highlight-label">Focus Timer</span></div>
            <strong class="monthly-highlight-value">${ce.length}</strong>
            <span class="monthly-highlight-caption">Completed sessions</span>
            <div class="monthly-highlight-foot"><span>${La} focused</span><span>${me} min</span></div>
          </article>
          <article class="monthly-highlight-card mood-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F49B}</span><span class="monthly-highlight-label">This month\u2019s mood</span></div>
            <div class="mood-highlight-body">
              <div class="mood-highlight-feature">
                <span class="mood-highlight-emoji">${W?P(W.emoji):"\u2014"}</span>
                <div><strong>${W?P(W.label):"No mood logged"}</strong><span>${W?`${W.count} of ${te.length} check-ins`:"Record a mood to see your pattern"}</span></div>
              </div>
              <div class="mood-highlight-distribution">${se.length?se.slice(0,4).map(c=>`<span title="${P(c.label)}: ${c.count}"><b>${P(c.emoji)}</b><small>${c.count}</small></span>`).join(""):'<span class="mood-no-data">No check-ins for this month</span>'}</div>
            </div>
          </article>
        </div>
      </section>

      <!-- DETAILED MONTHLY PERFORMANCE ANALYSIS -->
      <section class="performance-analysis-section" aria-label="Detailed monthly performance analysis">
        <div class="performance-analysis-heading">
          <div><p class="dashboard-section-kicker">UNDERSTAND YOUR PROGRESS</p><h3>Detailed performance analysis</h3><p>What your activity says about this month</p></div>
          <span class="analysis-period-chip">${o.slice(0,3)} ${a.currentYear}</span>
        </div>

        <div class="analysis-scorecards">
          <article class="analysis-score-card analysis-score-task"><span class="analysis-score-icon">\u2713</span><small>Task completion</small><strong>${m}%</strong><span>${S} of ${L} tasks</span></article>
          <article class="analysis-score-card analysis-score-focus"><span class="analysis-score-icon">\u23F1</span><small>Focus time</small><strong>${La}</strong><span>${ce.length} completed sessions</span></article>
          <article class="analysis-score-card analysis-score-goal"><span class="analysis-score-icon">\u{1F3C6}</span><small>Goals completed</small><strong>${He}</strong><span>${Ce} added this month</span></article>
          <article class="analysis-score-card analysis-score-mood"><span class="analysis-score-icon">${W?P(W.emoji):"\u{1F49B}"}</span><small>Top mood</small><strong>${W?P(W.label):"No data"}</strong><span>${te.length} mood check-ins</span></article>
        </div>

        <div class="performance-analysis-grid">
          <article class="analysis-detail-card analysis-task-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F4CB}</span><div><h4>Task performance</h4><p>How well you followed through on planned work</p></div></div>
            <div class="analysis-comparison-row">
              <div><small>This month</small><strong>${m}%</strong></div>
              <div class="analysis-comparison-divider"></div>
              <div><small>Previous month</small><strong>${De===null?"\u2014":`${De}%`}</strong></div>
              <span class="analysis-change-pill ${ae===null?"is-neutral":ae>0?"is-up":ae<0?"is-down":"is-neutral"}">${ae===null?"No baseline":`${ae>0?"+":""}${ae} pts`}</span>
            </div>
            <div class="analysis-subheading">Completion by priority</div>
            ${Ct.length?Ct.map(c=>`<div class="analysis-bar-row"><div class="analysis-bar-label"><span>${P(c.priority)} priority</span><strong>${c.completed}/${c.total}</strong></div><div class="analysis-bar-track"><i class="${c.priority.toLowerCase()}" style="width:${c.percent}%"></i></div><small>${c.open} still open \xB7 ${c.percent}% completed</small></div>`).join(""):'<p class="analysis-no-data">No priority information recorded for this month.</p>'}
            ${_a.length?`<div class="analysis-subheading">Task categories</div><div class="analysis-chip-list">${_a.map(c=>`<span>${P(c.category)} <b>${c.completed}/${c.total}</b></span>`).join("")}</div>`:""}
            <p class="analysis-explainer">Completion rate = completed tasks \xF7 tasks scheduled for the selected month. Overdue tasks are counted separately from pending tasks.</p>
          </article>

          <article class="analysis-detail-card analysis-weekly-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F4C5}</span><div><h4>Weekly task rhythm</h4><p>When your tasks were scheduled, and how many you finished</p></div></div>
            <div class="analysis-week-list">${ks.map(c=>`<div class="analysis-week-row"><div class="analysis-week-meta"><span>${c.label}</span><b>${c.completed}/${c.total} done</b></div><div class="analysis-bar-track"><i class="weekly" style="width:${c.percent}%"></i></div><small>${c.total?`${c.percent}% complete \xB7 ${c.open} open`:"No tasks scheduled"}</small></div>`).join("")}</div>
            <p class="analysis-explainer">Weeks are grouped by calendar date (1\u20137, 8\u201314, and so on), not by the day a task was edited.</p>
          </article>

          <article class="analysis-detail-card analysis-planning-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F5D3}\uFE0F</span><div><h4>Planning &amp; app activity</h4><p>How you used DaySync to organise the month</p></div></div>
            <div class="analysis-mini-stats"><div><strong>${w.length}</strong><small>Events scheduled</small></div><div><strong>${C.length}</strong><small>Notes created</small></div><div><strong>${Cs.length}</strong><small>Habit check-ins done</small></div></div>
            <div class="analysis-planning-lines">
              <div><span>Habit-tracking days</span><strong>${Ps.size}</strong></div>
              <div><span>Different habits tracked</span><strong>${Ls.size}</strong></div>
              <div><span>Notes saved overall</span><strong>${N.length}</strong></div>
              ${Ut?`<div><span>Most common event category</span><strong>${P(Ut[0])} \xB7 ${Ut[1]}</strong></div>`:""}
            </div>
            <p class="analysis-explainer">Events are counted by their scheduled date. Notes are counted by creation date. Habit check-ins use their recorded date and completed flag.</p>
          </article>

          <article class="analysis-detail-card analysis-focus-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F3A7}</span><div><h4>Focus &amp; concentration</h4><p>Your completed Focus Timer sessions</p></div></div>
            <div class="analysis-mini-stats"><div><strong>${ce.length}</strong><small>Sessions</small></div><div><strong>${Ie}</strong><small>Focus days</small></div><div><strong>${qa}m</strong><small>Avg. session</small></div></div>
            <div class="analysis-subheading">Focus time by week</div>
            <div class="analysis-focus-weeks">${Fa.map(c=>`<div class="analysis-focus-week"><div class="analysis-focus-column"><i style="height:${Math.max(c.minutes?6:0,Math.round(c.minutes/Es*100))}%"></i></div><span>${c.label}</span><small>${c.minutes}m</small></div>`).join("")}</div>
            <p class="analysis-focus-note">${ce.length?`You averaged ${$s} minutes on days when you completed at least one focus session${Rt?`. Your highest focus day was ${Ms(Rt[0])} (${Rt[1]} minutes)`:""}.`:"Complete a Focus Timer session to start building your focus history."}</p>
            <p class="analysis-explainer">Only completed sessions are counted. A session synced to the server and saved locally is counted once by its session ID.</p>
          </article>

          <article class="analysis-detail-card analysis-goal-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F3AF}</span><div><h4>Goal follow-through</h4><p>Monthly goal activity and your current goal snapshot</p></div></div>
            <div class="analysis-mini-stats"><div><strong>${Ce}</strong><small>Added this month</small></div><div><strong>${He}</strong><small>Completed this month</small></div><div><strong>${Ns.length}</strong><small>Currently active</small></div></div>
            ${qt===null?'<p class="analysis-no-data">Add a target to your goals to see a measurable progress average.</p>':`<div class="analysis-goal-average"><div><span>Average progress across saved goals</span><strong>${qt}%</strong></div><div class="analysis-bar-track"><i class="goal" style="width:${qt}%"></i></div></div>`}
            <p class="analysis-explainer">The monthly added/completed counts use goal creation and completion dates. The average progress is a current snapshot of saved goals, not a month-only change.</p>
          </article>

          <article class="analysis-detail-card analysis-mood-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F49B}</span><div><h4>Mood &amp; check-in pattern</h4><p>Your mood entries during the selected month</p></div></div>
            ${W?`<div class="analysis-top-mood"><span>${P(W.emoji)}</span><div><strong>${P(W.label)}</strong><small>Most selected \xB7 ${W.count} check-ins</small></div></div>`:'<p class="analysis-no-data">No mood check-ins are recorded for this month yet.</p>'}
            <div class="analysis-mood-bars">${se.length?se.map(c=>`<div class="analysis-mood-row"><span>${P(c.emoji)} ${P(c.label)}</span><div class="analysis-bar-track"><i class="mood" style="width:${Math.round(c.count/Math.max(1,te.length)*100)}%"></i></div><b>${c.count}</b></div>`).join(""):""}</div>
            <div class="analysis-mood-footer"><span>${ze.size} of ${fe} days with check-ins</span><strong>${Ts}% coverage</strong></div>
            ${Ba===null?"":`<p class="analysis-explainer">Average recorded energy level: ${Ba.toFixed(1)}. This is based only on check-ins where an energy value was saved.</p>`}
          </article>

          <article class="analysis-detail-card analysis-finance-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F4B3}</span><div><h4>Money activity</h4><p>Recorded income and spending pattern</p></div></div>
            <div class="analysis-money-result ${h>=0?"is-positive":"is-negative"}"><small>Net balance</small><strong>${h<0?"\u2212":"+"}${Ha(Math.abs(h))}</strong><span>${h>=0?"Income is higher than recorded expenses":"Expenses are higher than recorded income"}</span></div>
            <div class="analysis-money-counts"><span>${Is} income entries</span><span>${Ds} expense entries</span></div>
            ${Ge?`<div class="analysis-top-category"><small>Largest expense category</small><strong>${P(Ge[0])}</strong><span>${Ha(Ge[1])} \xB7 ${g?Math.round(Ge[1]/g*100):0}% of expenses</span></div>`:'<p class="analysis-no-data">No expense category data recorded this month.</p>'}
            ${Ua===null?'<p class="analysis-explainer">Savings percentage is unavailable because no income has been recorded for this month.</p>':`<p class="analysis-explainer">Net balance is ${Ua}% of recorded income. This is a summary of entries in DaySync, not a bank balance.</p>`}
          </article>
        </div>

        <section class="analysis-insights-card" aria-label="Personalized monthly insights">
          <div class="analysis-insights-heading"><span>\u{1F9ED}</span><div><h4>What this means for you</h4><p>Simple takeaways based on your recorded activity</p></div></div>
          <div class="analysis-insights-list">${Os.map((c,A)=>`<article class="analysis-insight-item"><span>${c.icon}</span><div><strong>${P(c.title)}</strong><p>${P(c.text)}</p></div></article>`).join("")}</div>
          <div class="analysis-insights-footnote">This analysis uses records available in DaySync for ${o} ${a.currentYear}. Missing or unsynced records may change the totals. It describes recorded activity and does not judge your personal worth or health.</div>
        </section>
      </section>

            <!-- MONTHLY FINANCE -->

      <section class="glass-card monthly-finance-panel">

        <div class="panel-header">
          <h3>Monthly Finance</h3>

          <span class="finance-month-label">
            ${o} ${a.currentYear}
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
              \u20B9${r.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
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
              \u20B9${g.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </strong>

          </div>

        </div>

        <div class="finance-net-row">

          <span>Net Balance</span>

          <strong class="${h>=0?"positive":"negative"}">
            ${h>=0?"+":"-"}\u20B9${Math.abs(h).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
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

          ${za.length?za.map(c=>`
                      <div class="activity-item">

                        <span
                          class="
                            activity-dot
                            ${c.type.includes("task")?"blue":c.type==="event"?"purple":c.type==="habit"?"green":"red"}
                          "
                        >
                          ${c.type==="task-complete"?"\u2713":c.type==="event"?"\u25A3":c.type==="habit"?"\u25CC":"\u25CE"}
                        </span>

                        <span class="activity-text">
                          ${P(c.label)}
                        </span>

                        <span class="activity-time">
                          ${P(c.timeLabel)}
                        </span>

                      </div>
                    `).join(""):`
                <div class="activity-item activity-empty-item">

                  <span class="activity-text">
                    No activity recorded for
                    ${o}
                    ${a.currentYear} yet.
                  </span>

                </div>
              `}

        </div>

      </section>

    </section>
  `}var pa=!1,Kn=null,Xn=null;function ro(){if(["home","assistant","menu"].includes(a.view)||a.view==="finance"&&["transactions","add-choice","add-expense"].includes(a.financeView))return;let n=document.getElementById("app");if(!n)return;let e={tasks:".todo-header",vault:".notepad-page-header",finance:".finance-dashboard-header, .finance-transactions-header",calendar:".page-header",mood:".page-header",habits:".page-header",goals:".page-header",progress:".dashboard-topbar",focus:".focus-header",weather:".weather-page-header",settings:".daysync-settings-header","goal-achievements":".ga-header","goal-create":".ga-header","goal-edit":".ga-header","reset-options":".daysync-reset-header"},t=n.querySelector(e[a.view]||".screen > header, .screen > .page-header");if(!t&&a.view==="finance"&&(t=n.querySelector(".finance-transactions-header")),!t){let i=n.querySelector(".screen, .finance-dashboard-page, .notepad-container")||n.firstElementChild;if(!i)return;t=document.createElement("header"),t.className="daysync-generated-page-header daysync-common-header",i.prepend(t)}t.classList.add("daysync-common-header");let s=t.querySelector(".daysync-page-back-button, .weather-back-button, .focus-back, .daysync-settings-back, .back-button");s?(s.classList.add("daysync-page-back-button"),s.setAttribute("aria-label","Back"),s.title="Back",s.classList.contains("back-button")&&(s.textContent="\u2039")):(s=document.createElement("button"),s.type="button",s.className="daysync-page-back-button",s.dataset.action="shared-page-back",s.setAttribute("aria-label","Back"),s.title="Back",s.textContent="\u2039",t.prepend(s)),t.classList.contains("menu-page-heading")&&t.classList.add("daysync-menu-header")}function v(){if(!pa){pa=!0;try{let D=function(u,l){clearTimeout(f),clearTimeout(x),l&&(l.value=u),x=setTimeout(()=>{q()},3e3)},n=document.getElementById("app"),e=a.view!==Fn,t=document.querySelector(".assistant-chat"),s=t?t.scrollHeight-t.scrollTop-t.clientHeight<100:!0,i=!!a.assistantForceScroll;a.assistantForceScroll=!1,Fn=a.view,a.view==="calendar"&&a.authenticated&&!a.calendarCache.has(a.selectedDate)&&ls(a.selectedDate);let o="";if(a.view==="calendar")o=cn(a);else if(a.view==="finance")o=gn(a);else if(a.view==="vault")o=hn(a);else if(a.view==="mood")o=ln(a);else if(a.view==="tasks")o=dn(a);else if(a.view==="habits")o=un(a);else if(a.view==="goals")o=pn(a);else if(a.view==="goal-achievements")o=zn();else if(a.view==="goal-create")o=Pi();else if(a.view==="goal-edit")if((a.goalAchievementItems||[]).some(l=>String(l.id)===String(a.goalAchievementEditingId)))o=Li();else{a.goalAchievementEditingId=null;let l=a.navigationHistory||[];l[l.length-1]==="goal-achievements"&&l.pop(),a.view="goal-achievements",o=zn(),$("This goal is no longer available.")}else a.view==="assistant"?o=mn(a):a.view==="menu"?o=Oi():a.view==="settings"?o=Mi():a.view==="reset-options"?o=Ri():a.view==="focus"?o=Qi():a.view==="weather"?o=Vi():a.view==="progress"||a.view==="more"?o=oo():o=Ji();n.innerHTML=o+Yi()+Wi(),Da(),ro();let d=Array.isArray(a.assistantMessages)?a.assistantMessages.length:0,p=!!a.assistantLoading,r=a.view==="assistant"&&!e&&(d!==Kn||p!==Xn);Kn=d,Xn=p,a.view==="assistant"&&(e||r)&&requestAnimationFrame(()=>{if(a.view!=="assistant")return;let u=document.getElementById("app");if(!u)return;let l=u.querySelector(".assistant-chat");if(l&&(e||s||i)){let y=()=>{l.isConnected&&(l.scrollTop=l.scrollHeight)};y(),requestAnimationFrame(y),requestAnimationFrame(()=>requestAnimationFrame(y)),window.setTimeout(y,90),document.querySelector(".bottom-nav")?.classList.remove("scroll-hidden")}}),e&&(n.scrollTop=0,window.scrollTo({top:0,left:0,behavior:"auto"}),document.querySelector(".bottom-nav")?.classList.remove("scroll-hidden")),xe();let g=["menu","tasks","vault","finance","progress","habits","goals","goal-achievements","goal-create","goal-edit","focus","weather","settings","reset-options"];document.querySelectorAll(".bottom-nav .nav-item").forEach(u=>{u.dataset.action==="toggle-more-menu"?u.classList.toggle("active",a.moreMenuOpen||g.includes(a.view)):u.classList.toggle("active",u.dataset.view===a.view&&!a.moreMenuOpen)}),requestAnimationFrame(()=>{let u=document.querySelector(".nav-indicator"),l=document.querySelector(".bottom-nav .nav-item.active");u&&l&&(u.style.width=`${l.offsetWidth}px`,u.style.transform=`translateX(${l.offsetLeft}px)`)}),n.querySelectorAll("[data-view]").forEach(u=>{u.dataset.view&&u.addEventListener("click",()=>{["home","calendar","assistant","more","progress","tasks","habits","goals","goal-achievements","mood","finance","vault","focus","weather","settings","reset-options"].includes(u.dataset.view)&&(a.view!==u.dataset.view&&a.view!=="home"&&a.view!=="assistant"&&a.navigationHistory.push(a.view),a.view=u.dataset.view,a.entryModalOpen=!1,a.entryDraft=null,a.moreMenuOpen=!1,v())})});let h,f,x,I=!!window.Capacitor?.isNativePlatform?.(),E=()=>window.SAHRA_SPEECH_RECOGNITION||window.Capacitor?.Plugins?.SpeechRecognition||null,T=window.SpeechRecognition||window.webkitSpeechRecognition;T&&!I&&(h=new T,h.continuous=!0,h.interimResults=!0),document.querySelectorAll('[data-action="toggle-mic"]').forEach(u=>{u.addEventListener("click",async()=>{let l=document.getElementById("chat-mic-img"),m=document.querySelector('input[placeholder*="speak"]');if(!l)return;if(!I&&!h){$("Voice recognition isn't supported on this browser.");return}if(l.classList.contains("listening"))q();else try{if(I){let b=E();if(!b){$("Voice input is unavailable in this mobile build. Please update the app.");return}let N=await b.checkPermissions();if(N.speechRecognition!=="granted"&&(N=await b.requestPermissions()),N.speechRecognition!=="granted"){$("Microphone permission is required for voice input.");return}}await w(l,m)}catch(b){console.error("Unable to start voice input:",b),$("Voice input could not be started.")}})});async function w(u,l){if(u)if(u.classList.add("listening"),l&&(l.value=""),f=setTimeout(()=>{q(),$("Microphone turned off (no speech detected)")},5e3),I){let m=E();if(!m)throw new Error("Native speech recognition plugin is unavailable.");await m.start({language:"en-US",partialResults:!0,popup:!1}),await m.addListener("partialResults",y=>{y.matches?.[0]&&D(y.matches[0],l)})}else{if(h&&h.state==="listening")return;try{h.start(),h.onresult=m=>{let y="";for(let b=m.resultIndex;b<m.results.length;++b)y+=m.results[b][0].transcript;D(y,l)},h.onend=()=>{let m=document.getElementById("chat-mic-img");m&&m.classList.remove("listening")}}catch(m){if(m&&m.name!=="InvalidStateError")throw m;if(h&&h.state==="listening")return;console.warn("Speech recognition already active; ignoring duplicate start request.")}}}async function q(){clearTimeout(f),clearTimeout(x);let u=document.getElementById("chat-mic-img");if(u&&u.classList.remove("listening"),I){let m=E();m&&(await m.stop(),await m.removeAllListeners())}else h&&h.state==="listening"&&h.stop();let l=document.querySelector('input[placeholder*="speak"]');if(l&&l.value.trim()!==""){let m=l.nextElementSibling;m&&m.click()}}document.querySelectorAll('[data-action="toggle-progress-picker"]').forEach(u=>{u.addEventListener("click",l=>{l.stopPropagation(),a.progressPickerOpen=!a.progressPickerOpen,v()})}),document.querySelectorAll('[data-action="close-profile-modal"]').forEach(u=>{u.addEventListener("click",()=>{a.profileModalOpen=!1,a.profileEditing=!1,a.profileDraft=null,a.profileSuccessMessage="",v()})}),document.querySelectorAll('[data-action="profile-start-edit"]').forEach(u=>{u.addEventListener("click",()=>{a.profileEditing=!0,a.profileSuccessMessage="";let l=a.user?.profile||{};a.profileDraft={name:a.user?.name||"",dateOfBirth:l.dateOfBirth?new Date(l.dateOfBirth).toISOString().slice(0,10):""},v()})}),document.querySelectorAll('[data-action="profile-cancel-edit"]').forEach(u=>{u.addEventListener("click",()=>{a.profileEditing=!1,a.profileSuccessMessage="",v()})}),document.querySelectorAll('[data-action="profile-save"]').forEach(u=>{u.addEventListener("click",async()=>{let l=a.profileDraft||{},m={name:l.name,dateOfBirth:l.dateOfBirth||null};try{let y=await _("/api/profile",{method:"PUT",body:JSON.stringify(m)});a.user=y.user||a.user,a.goalAchievementItems=pe(),localStorage.setItem("sahraUser",JSON.stringify(a.user)),a.profileEditing=!1,a.profileSuccessMessage="Profile updated successfully!",v(),setTimeout(()=>{a.profileSuccessMessage&&(a.profileSuccessMessage="",v())},3e3)}catch(y){window.alert(y.message||"Unable to save profile")}})}),document.querySelectorAll(".profile-input").forEach(u=>{u.addEventListener("input",l=>{let m=l.target.dataset.field,y=l.target.value;a.profileDraft=a.profileDraft||{},a.profileDraft[m]=y})}),document.querySelectorAll('[data-action="prev-month"]').forEach(u=>{u.addEventListener("click",()=>Jn(-1))}),document.querySelectorAll('[data-action="next-month"]').forEach(u=>{u.addEventListener("click",()=>Jn(1))}),document.querySelectorAll('[data-action="today"]').forEach(u=>{u.addEventListener("click",()=>{let l=new Date;a.currentMonth=l.getMonth(),a.currentYear=l.getFullYear(),a.selectedDate=H(l),v()})}),document.querySelectorAll("[data-date]").forEach(u=>{let l=u.dataset.date;l&&u.addEventListener("click",()=>Ui(l))}),document.querySelectorAll('[data-action="show-calendar-event"]').forEach(u=>{u.addEventListener("click",l=>{if(l.target.closest('[data-action="delete-calendar-event"]'))return;let m=u.dataset.eventId,y=a.data.events.find(b=>String(b.id||b._id)===String(m));y&&(a.calendarDetail={type:"event",item:y},v())}),u.addEventListener("keydown",l=>{if(l.key!=="Enter"&&l.key!==" ")return;l.preventDefault();let m=u.dataset.eventId,y=a.data.events.find(b=>String(b.id||b._id)===String(m));y&&(a.calendarDetail={type:"event",item:y},v())})}),document.querySelectorAll('[data-action="show-calendar-task"]').forEach(u=>{u.addEventListener("click",l=>{if(l.target.closest('[data-action="delete-calendar-task"]'))return;let m=u.dataset.taskId,y=a.data.tasks.find(b=>String(b.id||b._id)===String(m));y&&(a.calendarDetail={type:"task",item:y},v())}),u.addEventListener("keydown",l=>{if(l.key!=="Enter"&&l.key!==" ")return;l.preventDefault();let m=u.dataset.taskId,y=a.data.tasks.find(b=>String(b.id||b._id)===String(m));y&&(a.calendarDetail={type:"task",item:y},v())})}),document.querySelectorAll('[data-action="delete-calendar-task"]').forEach(u=>{u.addEventListener("click",l=>{l.stopPropagation();let m=u.dataset.taskId;m&&ct("Are you sure you want to delete this task?",async()=>{try{await _(`/api/tasks/${m}`,{method:"DELETE"}),a.data.tasks=a.data.tasks.filter(y=>String(y.id||y._id)!==String(m)),a.calendarCache.delete(a.selectedDate),a.calendarDetail=null,$("Task deleted successfully"),v()}catch(y){$(y.message||"Unable to delete task")}})})}),document.querySelectorAll('[data-action="delete-calendar-event"]').forEach(u=>{u.addEventListener("click",l=>{l.stopPropagation();let m=u.dataset.eventId;m&&ct("Are you sure you want to delete this event?",async()=>{try{await _(`/api/events/${m}`,{method:"DELETE"}),a.data.events=a.data.events.filter(y=>String(y.id||y._id)!==String(m)),a.calendarCache.delete(a.selectedDate),a.calendarDetail=null,$("Event deleted successfully"),v()}catch(y){$(y.message||"Unable to delete event")}})})}),document.querySelectorAll('[data-action="close-calendar-detail"]').forEach(u=>{u.addEventListener("click",l=>{l.target.closest("[data-calendar-detail-content]")&&!l.target.closest('[data-action="close-calendar-detail"]')||(a.calendarDetail=null,v())})}),document.querySelectorAll('[data-action="open-add-entry"]').forEach(u=>{u.addEventListener("click",()=>{Gi(u.dataset.type||"event")})}),document.querySelectorAll(".task-input").forEach(u=>{u.addEventListener("keydown",l=>{l.key==="Enter"&&(l.preventDefault(),Wn(u))})}),document.querySelectorAll('[data-action="quick-task-add"]').forEach(u=>{u.addEventListener("click",()=>{let l=document.querySelector(".task-input");Wn(l)})}),document.querySelectorAll('[data-action="show-selected-day"]').forEach(u=>{u.addEventListener("click",()=>{fa("calendar")})}),document.querySelectorAll("[data-task-filter]").forEach(u=>{u.addEventListener("click",()=>{a.todoFilter=u.dataset.taskFilter||"All",v()})}),document.querySelectorAll('[data-action="toggle-mood-picker"]').forEach(u=>{u.addEventListener("click",()=>{a.moodPickerOpen=!a.moodPickerOpen,v()})}),document.querySelectorAll("[data-mood-value]").forEach(u=>{u.addEventListener("click",async()=>{let l=u.dataset.moodValue;if(!l)return;a.moodPickerOpen=!1,v();let m=a.data.moods.find(y=>y.date===a.selectedDate);try{m?(await _(`/api/moods/${m.id||m._id}`,{method:"PUT",body:JSON.stringify({mood:l,energy:80,note:m.note||""})}),await V()):await ue("mood",{date:a.selectedDate,mood:l,energy:80,note:""})}catch(y){window.alert(y.message||"Unable to save mood")}})}),qn||(qn=!0,document.addEventListener("change",u=>{let l=u.target;l.getAttribute("data-action")==="finance-filter"&&(a.financeTypeFilter=l.value,es())}),document.addEventListener("input",u=>{let l=u.target.closest('[data-action="finance-search"]');if(l){let m=l.selectionStart??l.value.length;a.financeSearchQuery=l.value,es(),setTimeout(()=>{let y=document.querySelector('[data-action="finance-search"]');if(y){y.focus();let b=Math.min(m,y.value.length);y.setSelectionRange(b,b)}},0)}})),document.querySelectorAll('[data-action="edit-task"]').forEach(u=>{u.addEventListener("click",()=>{let l=a.data.tasks.find(m=>String(m.id||m._id)===String(u.dataset.taskId));l&&(a.entryModalOpen=!0,a.entryDraft={type:"task",id:l.id||l._id,title:l.title||"",description:l.description||"",date:l.date||a.selectedDate,time:l.time||"19:00",priority:l.priority||"Normal",status:l.status||"Pending",reminder:l.reminder||"",category:l.category||"General"},v())})}),document.querySelectorAll('[data-action="delete-task"]').forEach(u=>{u.addEventListener("click",()=>{let l=u.dataset.taskId;l&&ct("Are you sure you want to delete this task?",async()=>{try{await _(`/api/tasks/${l}`,{method:"DELETE"}),await V(),$("Task deleted successfully")}catch(m){$(m.message||"Unable to delete task")}})})}),document.querySelectorAll('[data-action="toggle-task"]').forEach(u=>{u.addEventListener("click",async()=>{let l=u.dataset.taskId,m=a.data.tasks.find(b=>String(b.id||b._id)===String(l));if(!m)return;let y=!(m.completed||m.status==="Completed");try{await _(`/api/tasks/${l}`,{method:"PUT",body:JSON.stringify({title:m.title,description:m.description||"",date:m.date||a.selectedDate,time:m.time||null,priority:m.priority||"Normal",status:y?"Completed":"Pending",completed:y,reminder:m.reminder||"",category:m.category||"General"})}),await V()}catch(b){window.alert(b.message||"Unable to update task")}})}),document.querySelectorAll('[data-action="copy-asset"]').forEach(u=>{u.addEventListener("click",l=>{let m=u.dataset.content||"";navigator.clipboard.writeText(m),u.textContent="Copied!",setTimeout(()=>{u.textContent="Copy"},2e3)})}),document.querySelectorAll('[data-action="close-entry-modal"]').forEach(u=>{u.addEventListener("click",()=>{ya()})}),document.querySelectorAll('[data-action="save-entry"]').forEach(u=>{u.addEventListener("click",async()=>{document.querySelectorAll("[data-entry-field]").forEach(b=>{let N=b.dataset.entryField;N&&(a.entryDraft=a.entryDraft||{},a.entryDraft[N]=b.type==="checkbox"?b.checked:b.value)});let l=a.entryDraft||{},m=l.type||"event",y=l.date||a.selectedDate;if(m==="task"&&Te({title:l.title||l.name||""})){$("That test task name has been removed. Please enter a meaningful task title."),u.dataset.submitting="false",u.textContent="Add Task";return}if((m==="event"||m==="task")&&ds(y)){window.alert("Tasks and events can only be added for today or future dates.");return}try{if(m==="event"){let b=(l.title||"").trim();if(!b){window.alert("Please enter an event title.");return}await ue("event",{title:b,description:l.description||"",date:y,startTime:l.startTime||"09:00",endTime:l.endTime||"10:00",category:l.category||"General",reminder:l.reminder||""})}else if(m==="task"){let b=(l.title||"").trim();if(!b){window.alert("Please enter a task title.");return}let N={title:b,description:l.description||"",date:y,time:l.time||null,priority:l.priority||"Normal",status:l.status||"Pending",completed:l.completed||!1,reminder:l.reminder||"",category:l.category||"General"};l.id?(await _(`/api/tasks/${l.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(N)}),await V()):await ue("task",N)}else if(m==="habit"){let b=(l.title||"").trim();if(!b){window.alert("Please enter a habit name.");return}await ue("habit",{name:b,description:l.description||"",goal:Number(l.goal||1),progress:0,frequency:l.frequency||"Daily"})}else if(m==="goal"){let b=(l.title||"").trim();if(!b){window.alert("Please enter a goal title.");return}let N=Number(l.current||0),C=Math.max(Number(l.target||30),1);await ue("goal",{title:b,description:l.description||"",duration:l.duration||"30 days",current:N,target:C,progress:Math.min(100,Math.round(N/C*100)),status:"Active"})}else if(m==="mood"){let b=l.mood||"\u{1F60A}";await ue("mood",{date:y,mood:b,energy:80,note:l.note||""})}else if(m==="asset"||m==="note"){let b=(l.title||"").trim(),N=(l.description||l.content||"").trim();if(!b||!N){window.alert("Please enter a title and description.");return}let C={title:b,content:N,tags:l.tags||"Note"};l.id?(await _(`/api/assets/${l.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(C)}),await V(),v()):await ue("asset",C)}else if(m==="expense"||m==="subscription"){let b=(l.title||"").trim(),N=Number(l.amount);if(!b){window.alert("Please enter a title.");return}if(!Number.isFinite(N)||N<=0){window.alert("Please enter a valid amount.");return}await ue(m,{title:b,amount:N,date:l.date||a.selectedDate,renewalDate:l.renewalDate||a.selectedDate,category:l.category||"General"})}ya(),typeof $=="function"?$("Saved successfully!"):window.alert("Saved successfully!")}catch(b){console.error("Save entry failed:",b),typeof $=="function"?$(b.message||"Unable to save item"):window.alert(b.message||"Unable to save item")}})}),document.querySelectorAll("[data-entry-field]").forEach(u=>{let l=u.dataset.entryField;if(!l)return;let m=y=>{let b=y.type==="checkbox"?y.checked:y.value;a.entryDraft={...a.entryDraft||{},[l]:b},l==="type"&&v()};u.addEventListener("input",()=>m(u)),u.addEventListener("change",()=>m(u))});let F=document.querySelector(".menu-button"),L=document.querySelector(".menu-panel");if(F&&L&&F.addEventListener("click",u=>{u.stopPropagation(),a.menuOpen=!a.menuOpen,L.classList.toggle("hidden",!a.menuOpen),L.classList.toggle("open",a.menuOpen)}),_n||(_n=!0,document.addEventListener("click",async u=>{let l=u.target.closest?.("[data-menu-action]");if(!l)return;let m=l.dataset.menuAction;if(m==="toggle-theme"){let y=a.themePreference==="system"?"light":a.themePreference==="light"?"dark":"system";a.menuOpen=!1,wt(y),v(),_i(a.theme);return}if(a.menuOpen=!1,m==="profile"){a.profileModalOpen=!0,a.profileEditing=!1,a.profileSuccessMessage="",a.profileDraft={name:a.user?.name||"",dateOfBirth:a.user?.profile?.dateOfBirth?new Date(a.user.profile.dateOfBirth).toISOString().slice(0,10):""},v();return}if(m==="notifications"){a.menuOpen=!1,v(),await qi(),v();return}if(m==="privacy-security"){a.settingsInfoPanel=a.settingsInfoPanel==="privacy"?"":"privacy",v();return}if(m==="sync-now"){try{let y=await ge();if(!a.localDatabaseReady){await V({skipLocalSync:!0}),$("Online data refreshed. Local storage is still initializing.");return}y&&globalThis.navigator?.onLine&&await z.flush(y),await V(),y&&globalThis.navigator?.onLine&&await z.flush(y),await ke(),$("DaySync data sync finished.")}catch(y){$(y.message||"Unable to sync DaySync data.")}return}if(m==="exact-alarms"){try{if(!window.Capacitor?.isNativePlatform?.()){$("Timer alarm settings are available in the installed mobile app.");return}(await B.checkExactNotificationSetting()).exact_alarm!=="granted"?(await B.changeExactNotificationSetting(),$("Check Android alarm access, then return to DaySync.")):$("Precise timer alarms are already allowed.")}catch(y){$(y.message||"Unable to open Android alarm settings.")}return}m==="logout"&&(he(),a.focusRunning=!1,a.focusEndsAt=null,clearInterval(ie),ie=null,re(),await ss(),localStorage.removeItem("sahraUser"),a.authenticated=!1,a.user={name:"DaySync User"},a.goalAchievementItems=pe(),a.view="home",window.location.href=xt())})),!Rn){let u=function(l,m){let y=document.createElement("div");y.className="notepad-confirm-overlay",y.style.cssText="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px);";let b=document.createElement("div");b.className="notepad-confirm-box",b.style.cssText="background: #1e293b; padding: 24px; border-radius: 16px; width: 85%; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid rgba(255,255,255,0.1);";let N=document.createElement("p");N.className="notepad-confirm-message",N.style.cssText="margin: 0 0 24px 0; font-size: 1.1rem; line-height: 1.5; color: #f8fafc; font-weight: 500;",N.innerText=l;let C=document.createElement("div");C.style.cssText="display: flex; gap: 12px; justify-content: center;";let R=document.createElement("button");R.innerText="Cancel",R.type="button",R.style.cssText="padding: 12px; border-radius: 10px; border: none; background: #334155; color: white; font-weight: 600; cursor: pointer; flex: 1;";let j=document.createElement("button");j.innerText="Delete",j.style.cssText="padding: 12px; border-radius: 10px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer; flex: 1; box-shadow: 0 4px 10px rgba(239,68,68,0.3);",R.onclick=()=>document.body.removeChild(y);let K=!1;j.onclick=async()=>{K||(K=!0,j.disabled=!0,j.textContent="Deleting...",j.style.opacity="0.6",j.style.pointerEvents="none",y.remove(),await m())},C.appendChild(R),C.appendChild(j),b.appendChild(N),b.appendChild(C),y.appendChild(b),document.body.appendChild(y)};Rn=!0,document.addEventListener("click",l=>{if(!l.target.closest('[data-action="toggle-notepad-search"]'))return;let y=document.querySelector("#app"),b=y?y.scrollTop:0;a.notepadSearchOpen=!a.notepadSearchOpen,v(),requestAnimationFrame(()=>{let N=document.querySelector("#app");if(N&&(N.scrollTop=b),a.notepadSearchOpen){let C=document.querySelector('[data-action="notepad-search-input"]');C&&C.focus()}})}),document.addEventListener("input",l=>{let m=l.target.closest('[data-action="notepad-search-input"]');if(!m)return;let y=m.selectionStart??m.value.length,b=document.querySelector("#app"),N=b?b.scrollTop:0;a.noteSearchQuery=m.value,v(),requestAnimationFrame(()=>{let C=document.querySelector("#app");C&&(C.scrollTop=N);let R=document.querySelector('[data-action="notepad-search-input"]');if(!R)return;R.focus();let j=Math.min(y,R.value.length);R.setSelectionRange(j,j)})}),document.addEventListener("click",l=>{let m=l.target.closest('[data-action="edit-note"]');if(m){let y=m.dataset.noteId,N=(a.data.assets||a.data.notes||[]).find(C=>String(C.id||C._id)===String(y));if(!N)return;a.entryModalOpen=!0,a.entryDraft={type:"asset",id:N.id||N._id,title:N.title||"",content:N.content||N.description||"",description:N.content||N.description||"",tags:N.tags||"Note"},v()}}),document.addEventListener("click",l=>{let m=l.target.closest('[data-action="delete-note"]');if(m){l.preventDefault(),l.stopPropagation();let y=m.dataset.noteId;u("Are you sure you want to delete this note?",async()=>{try{await _(`/api/assets/${y}`,{method:"DELETE"}),await V(),typeof $=="function"&&$("Note deleted")}catch(b){typeof $=="function"&&$(b.message||"Failed to delete note")}})}})}document.querySelectorAll('[data-action="back-home"]').forEach(u=>{u.addEventListener("click",()=>{a.profileModalOpen=!1,a.profileDraft=null,a.entryModalOpen=!1,a.entryDraft=null,a.view==="progress"||a.view==="more"?(a.view="menu",a.navigationHistory=(a.navigationHistory||[]).filter(l=>!["progress","more","menu"].includes(l))):(a.view="home",a.navigationHistory=(a.navigationHistory||[]).filter(l=>l!=="calendar"&&l!=="menu")),a.moreMenuOpen=!1,a.menuOpen=!1,v()})});let S=async(u,l,m=!0)=>{if(a.assistantLoading)return;if(navigator.onLine===!1){m&&a.assistantMessages.push({role:"user",text:u}),a.assistantMessages.push({role:"system",text:"You are offline. Please check your internet connection and try again."}),a.assistantForceScroll=!0,a.assistantLoading=!1,v();return}let y=a.assistantGeneration;m&&a.assistantMessages.push({role:"user",text:u}),a.assistantForceScroll=!0,a.assistantLoading=!0,v();try{let b;for(let N=0;N<2;N+=1){let C=new AbortController,R=setTimeout(()=>C.abort(),15e3);try{b=await _("/api/assistant/chat",{method:"POST",signal:C.signal,body:JSON.stringify({message:u,requestId:l})});break}catch(j){let K=!Number.isInteger(j.status)||j.status>=500||j.status===408;if(N===0&&K){await new Promise(te=>setTimeout(te,250));continue}throw j}finally{clearTimeout(R)}}if(y===a.assistantGeneration&&a.assistantMessages.push({role:"assistant",text:b.message||"Sahra is temporarily unavailable."}),y===a.assistantGeneration&&b.action==="requiresConfirmation"&&b.confirmationToken){let N=/delete/i.test(b.message||"")?"Delete task":/complete/i.test(b.message||"")?"Mark complete":/event/i.test(b.message||"")?"Add event":"Add task";ct("Do you want Sahra to perform this change?",async()=>{a.assistantLoading=!0,v();try{let C=await _("/api/assistant/execute",{method:"POST",body:JSON.stringify({confirmationToken:b.confirmationToken})});a.assistantMessages.push({role:"assistant",text:C.message||"The change was completed."}),await V()}catch(C){a.assistantMessages.push({role:"assistant",text:C.message||"Sahra could not complete that change."})}finally{a.assistantLoading=!1,v()}},N)}else["createdTask","createdEvent","createdNote","createdTransaction"].includes(b.action)&&(await V(),b.action==="createdTransaction"&&await ke())}catch(b){let N=b.message||"Sahra is temporarily unavailable.",C=!Number.isInteger(b.status)||b.status>=500||b.status===408,R=navigator.onLine===!1||!Number.isInteger(b.status)&&/failed to fetch|networkerror|network request failed|load failed/i.test(N);y===a.assistantGeneration&&(R?a.assistantMessages.push({role:"system",text:"You are offline. Please check your internet connection and try again."}):a.assistantMessages.push({role:"assistant",text:C?`${N} You can retry safely.`:N,...C?{retryRequestId:l,retryMessage:u}:{}}))}finally{a.assistantLoading=!1,a.view==="assistant"&&(a.assistantForceScroll=!0),v()}};document.querySelectorAll(".composer-send").forEach(u=>{u.addEventListener("click",async()=>{let l=document.querySelector(".assistant-input"),m=l?.value?.trim();if(!m||a.assistantLoading)return;l&&(l.value="");let y=window.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;await S(m,y)})}),document.querySelectorAll("[data-assistant-retry]").forEach(u=>{u.addEventListener("click",async()=>{let l=u.dataset.retryMessage||"",m=u.dataset.assistantRetry||"";l&&m&&await S(l,m,!1)})}),document.querySelectorAll("[data-progress-month]").forEach(u=>{u.addEventListener("click",async l=>{l.stopPropagation();let m=Number(u.dataset.progressMonth);!Number.isInteger(m)||m<0||m>11||(a.currentMonth=m,a.progressPickerOpen=!1,a.progressLoading=!0,v(),await Se(!0))})}),document.querySelectorAll('[data-action="close-progress-picker"]').forEach(u=>{u.addEventListener("click",l=>{l.stopPropagation(),a.progressPickerOpen=!1,v()})}),document.querySelectorAll('[data-action="progress-year-change"]').forEach(u=>{u.addEventListener("click",async l=>{l.stopPropagation();let m=Number(u.dataset.direction||0);m&&(a.currentYear+=m,a.progressData=null,v(),await Se(!0))})}),document.querySelectorAll('[data-action="progress-year-set"]').forEach(u=>{u.addEventListener("click",async l=>{l.stopPropagation();let m=Number(u.dataset.year);!Number.isInteger(m)||m<1900||m>2200||(a.currentYear=m,a.progressData=null,v(),await Se(!0))})}),document.querySelectorAll(".assistant-input").forEach(u=>{u.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),document.querySelector(".composer-send")?.click())})}),document.querySelectorAll(".composer-mic").forEach(u=>{u.addEventListener("click",()=>{let l=window.SpeechRecognition||window.webkitSpeechRecognition;if(!l){window.alert("Voice input is not supported in this browser.");return}u.style.color="#ff4757";let m=new l;m.lang="en-US",m.interimResults=!1,m.onresult=y=>{let b=y.results[0][0].transcript,N=document.querySelector(".assistant-input"),C=document.querySelector(".composer-send");N&&(N.value=b),C&&C.click()},m.onend=()=>{u.style.color=""},m.start()})}),n.querySelectorAll('[data-action="close-more-menu"]').forEach(u=>{u.addEventListener("click",()=>{a.moreMenuOpen=!1,v()})}),io()}finally{pa=!1}}}function co(){document.querySelectorAll(".bottom-nav .nav-item").forEach(n=>{n.addEventListener("click",async e=>{if(n.dataset.action==="toggle-more-menu"){e.stopPropagation(),a.entryModalOpen=!1,a.entryDraft=null,a.progressPickerOpen=!1,a.profileModalOpen=!1,a.moreMenuOpen=!1,a.menuOpen=!1,a.moodPickerOpen=!1,a.view="menu",v();return}let t=n.dataset.view;t&&(a.entryModalOpen=!1,a.entryDraft=null,a.progressPickerOpen=!1,a.profileModalOpen=!1,a.moreMenuOpen=!1,a.view!==t&&a.view!=="home"&&a.view!=="assistant"&&a.navigationHistory.push(a.view),a.view=t,v(),t==="progress"&&await Se(!0))})})}var Qn=!1,pt=0,Zn=!1;function Ca(n){return!!n?.matches?.('input:not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]')}function xe(){let n=window.visualViewport,e=Ca(document.activeElement),t=window.matchMedia?.("(max-width: 760px)").matches||window.innerWidth<=760,s=!!(n&&(window.innerHeight-n.height>120||n.height<window.innerHeight*.76)),i=!!(t&&e&&(s||document.activeElement));document.body.classList.toggle("keyboard-open",i),document.documentElement.classList.toggle("keyboard-open",i),document.querySelector(".bottom-nav")?.classList.toggle("keyboard-hidden",i),n&&document.documentElement.style.setProperty("--sahra-visual-height",`${Math.max(220,n.height)}px`)}function lo(n){if(!Ca(n))return;let e=n;[100,320,520].forEach(t=>{window.setTimeout(()=>{if(!e.isConnected||document.activeElement!==e)return;xe();let s=window.visualViewport?.height||window.innerHeight,i=e.getBoundingClientRect();(i.bottom>s-26||i.top<10)&&e.scrollIntoView({block:"center",behavior:t>100?"smooth":"auto"})},t)})}function uo(){if(Zn)return;Zn=!0;let n=document.getElementById("app"),e=document.querySelector(".bottom-nav");n&&e&&(pt=n.scrollTop,n.addEventListener("scroll",()=>{let d=n.scrollTop;if(document.body.classList.contains("keyboard-open")){e.classList.add("keyboard-hidden"),pt=d;return}let p=d-pt;d<=8?e.classList.remove("scroll-hidden"):p>5?e.classList.add("scroll-hidden"):p<-5&&e.classList.remove("scroll-hidden"),pt=d},{passive:!0})),document.addEventListener("scroll",d=>{let p=d.target;if(!p?.classList?.contains("assistant-chat"))return;let r=document.querySelector(".bottom-nav");if(!r||document.body.classList.contains("keyboard-open"))return;let g=p.scrollHeight-p.scrollTop-p.clientHeight;r.classList.toggle("scroll-hidden",g>72)},!0);let t=null,s=0,i=0,o='input, textarea, select, [contenteditable="true"], [role="slider"], input[type="range"], .assistant-fixed-composer, .bottom-nav, .month-picker-wrapper, .month-picker-popover, .focus-ring-wrap, .entry-modal-backdrop, .daysync-reset-modal-backdrop, .sahra-confirm-overlay, [data-no-swipe]';document.addEventListener("touchstart",d=>{if(t=null,d.touches?.length!==1||!["home","assistant","menu"].includes(a.view)||document.body.classList.contains("keyboard-open")||a.entryModalOpen||a.profileModalOpen||a.moreMenuOpen||a.menuOpen||(d.target instanceof Element?d.target:d.target?.parentElement)?.closest?.(o))return;let r=d.touches[0];t={identifier:r.identifier,x:r.clientX,y:r.clientY,startedAt:performance.now(),axis:null}},{passive:!0,capture:!0}),document.addEventListener("touchmove",d=>{if(!t||d.touches?.length!==1)return;let p=d.touches[0];if(p.identifier!==t.identifier)return;let r=Math.abs(p.clientX-t.x),g=Math.abs(p.clientY-t.y);r<9&&g<9||(r>g*1.12?t.axis="horizontal":g>r*1.05&&(t.axis="vertical"))},{passive:!0,capture:!0}),document.addEventListener("touchend",d=>{if(!t||d.changedTouches?.length!==1){t=null;return}let p=d.changedTouches[0];if(p.identifier!==t.identifier){t=null;return}let r=p.clientX-t.x,g=p.clientY-t.y,h=Math.max(1,performance.now()-t.startedAt),f=t.axis;if(t=null,f==="vertical"||Math.abs(r)<=Math.abs(g)*1.15||Math.abs(g)>76)return;let x=Math.abs(r),I=x/h,E=x>=Math.max(34,Math.min(46,window.innerWidth*.105)),T=x>=25&&h<=260&&I>=.34;if(!E&&!T)return;let w=performance.now();if(w-s<320)return;s=w;let D=null;a.view==="home"&&r<0?D="assistant":a.view==="assistant"&&r<0?D="menu":a.view==="menu"&&r>0?D="assistant":a.view==="assistant"&&r>0&&(D="home"),D&&(i=Date.now()+280,a.entryModalOpen=!1,a.entryDraft=null,a.moreMenuOpen=!1,a.menuOpen=!1,a.view=D,v())},{passive:!0,capture:!0}),document.addEventListener("touchcancel",()=>{t=null},{passive:!0,capture:!0}),document.addEventListener("click",d=>{Date.now()>=i||(d.preventDefault(),d.stopImmediatePropagation())},!0),document.addEventListener("focusin",d=>{Ca(d.target)&&(xe(),lo(d.target))}),document.addEventListener("focusout",()=>{window.setTimeout(()=>{xe(),document.body.classList.contains("keyboard-open")||document.querySelector(".bottom-nav")?.classList.remove("keyboard-hidden")},180)}),window.addEventListener("resize",xe,{passive:!0}),window.visualViewport?.addEventListener("resize",xe,{passive:!0}),window.visualViewport?.addEventListener("scroll",xe,{passive:!0})}async function po(n,e){let t=oe[e]?.collections||[],s=new Set(t);e==="notepad"&&(s.add("notes"),s.add("assets")),e==="expenses"&&(s.add("transactions"),s.add("expenses"),s.add("subscriptions")),e==="calendar"&&(s.add("events"),s.add("reminders")),e==="progress"&&(s.add("goals"),s.add("habits"),s.add("habitLogs"),s.add("moods")),e==="goalAchievements"&&s.add("goalAchievements");for(let i of s)try{let o=await z.read(n,i);for(let d of o)await z.remove(n,i,d.id||d._id)}catch(o){console.warn(`Could not clear ${i} local cache after reset:`,o.message)}try{let i=await z.read(n,"syncOutbox"),o=e==="tasks"?["tasks"]:e==="notepad"?["assets","notes"]:e==="expenses"?["transactions","expenses","subscriptions"]:e==="calendar"?["events","reminders"]:e==="progress"?["goals","habits","habitlogs","habit-logs","moods"]:e==="goalAchievements"?["goal-achievements","goalachievements","goal_achievements"]:[];for(let d of i){let p=String(d?.resource?.collection||d?.resource||d?.root||d?.collection||"").toLowerCase(),r=e==="goalAchievements"&&(p==="goalachievements"||String(d?.path||"").toLowerCase().includes("/goal-achievements"));(o.includes(p)||r)&&await z.remove(n,"syncOutbox",d.id||d._id)}}catch(i){console.warn("Could not reconcile reset queue:",i.message)}}async function mo(){let n=Object.keys(oe).filter(t=>a.resetOptionsSelected?.[t]);if(!n.length){$("Select at least one data section to reset.");return}let e=await ge();if(!e){$("Sign in again to reset saved data.");return}if(!globalThis.navigator?.onLine){$("Connect to the internet before resetting synced data.");return}if(!a.localDatabaseReady){$("Local storage is still initializing. Please try again in a moment.");return}a.resetOptionsBusy=!0,v();try{if((await z.flush(e))?.pending)throw new Error("Some offline changes are still waiting to sync. Reconnect and try again before resetting so deleted data cannot return.");let s=[];for(let o of n){let d=ht(o).length,p=o==="goalAchievements"?ka():[],g=await _(`/api/reset-data/${encodeURIComponent(o==="goalAchievements"?"goal-achievements":o)}`,{method:"DELETE"});if(await po(e,o),s.push({category:o,count:Math.max(Number(g.deletedCount||0),d)}),o==="goalAchievements"){await Promise.all(p.map(h=>ha({...h,status:"Completed",reminderTime:""}))),a.goalAchievementItems=[],a.data.goalAchievements=[];for(let h of rs())try{localStorage.removeItem(h)}catch{}try{localStorage.removeItem(Sa())}catch{}}if(o==="focus"){he(),a.focusRunning=!1,a.focusEndsAt=null,a.focusStartedAt=null,a.focusAlarmActive=!1,a.focusAlarmStartedAt=null,a.focusSessionId=null,a.focusSeconds=a.focusInitialSeconds||1500,a.focusSessions=[],a.focusStatsData=null;try{localStorage.removeItem("sahraFocusSessions"),localStorage.removeItem(Ea)}catch{}try{await B.cancel({notifications:[{id:7001}]})}catch{}}}n.includes("tasks")&&(a.data.tasks=[]),n.includes("notepad")&&(a.data.assets=[],a.data.notes=[]),n.includes("expenses")&&(a.financeData=[],a.data.expenses=[],a.data.subscriptions=[]),n.includes("calendar")&&(a.data.events=[],a.data.reminders=[],a.calendarCache=new Set),n.includes("progress")&&(a.data.goals=[],a.data.habits=[],a.data.habitLogs=[],a.data.moods=[],a.progressData=null),a.resetConfirmOpen=!1,a.resetOptionsSelected={tasks:!1,notepad:!1,expenses:!1,calendar:!1,progress:!1,goalAchievements:!1,focus:!1},await V(),await ke(),await Se(!1);try{await Fe()}catch(o){console.warn("Notification reconciliation after reset failed:",o.message)}let i=s.map(o=>`${oe[o.category].title}: ${o.count}`).join(" \xB7 ");$(`Selected data reset. ${i}`),a.view="settings",v()}catch(t){console.error("DaySync reset operation failed:",t),$(t.message||"The reset could not finish. Check your connection and review the selected data.");try{await V(),await ke(),await Se(!1)}catch(s){console.warn("Unable to refresh after a partial reset:",s.message)}a.resetConfirmOpen=!0,v()}finally{a.resetOptionsBusy=!1,v()}}function ho(){Qn||(Qn=!0,uo(),document.addEventListener("submit",n=>{let e=n.target.closest('form[data-form="goal-achievement"], form[data-form="goal-achievement-edit"], form[data-form="goal-progress"]');if(!e)return;n.preventDefault();let t=[...a.goalAchievementItems||[]];if(e.dataset.form==="goal-achievement"||e.dataset.form==="goal-achievement-edit"){let g=new FormData(e),h=String(g.get("title")||"").trim(),f=Number(g.get("target")),x=String(g.get("targetDate")||"");if(!h||!Number.isFinite(f)||f<=0||f>1e6||!/^\d{4}-\d{2}-\d{2}$/.test(x)){$("Enter a goal name, positive target, and valid target date.");return}let I={title:h,description:String(g.get("description")||"").trim(),target:f,targetDate:x,unit:String(g.get("unit")||"items"),frequency:String(g.get("frequency")||"Daily"),reminderTime:String(g.get("reminderTime")||""),category:String(g.get("category")||"Personal")};if(e.dataset.form==="goal-achievement-edit"){let q=a.goalAchievementEditingId,F=t.findIndex(y=>String(y.id)===String(q));if(F<0){a.goalAchievementEditingId=null,a.view="goal-achievements";let y=a.navigationHistory||[];y[y.length-1]==="goal-achievements"&&y.pop(),$("This goal is no longer available."),v();return}let L=t[F],S={...L,...I},u=H(new Date);S.status=Number(S.current||0)>=f?"Completed":x<u?"Overdue":"Active",L.status!=="Completed"&&S.status==="Completed"&&(S.completedAt=new Date().toISOString());let l=[...t];if(l[F]=S,!lt(l)){a.goalAchievementItems=t,v();return}a.goalAchievementEditingId=null,a.goalAchievementFilter="All",a.view="goal-achievements";let m=a.navigationHistory||[];m[m.length-1]==="goal-achievements"&&m.pop(),ha(S),$("Goal updated. Existing progress and achievements were preserved."),v();return}let T={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,current:0,xp:0,logs:[],currentStreak:0,bestStreak:0,status:"Active",createdAt:new Date().toISOString(),...I};T.status=Number(T.current)>=T.target?"Completed":T.targetDate<H(new Date)?"Overdue":"Active";let w=[T,...t];if(!lt(w)){a.goalAchievementItems=t,v();return}a.goalAchievementEditingId=null,a.goalAchievementFilter="All",a.view="goal-achievements";let D=a.navigationHistory||[];D[D.length-1]==="goal-achievements"&&D.pop(),ha(T),$("Goal saved"),v();return}let s=t.find(g=>g.id===e.dataset.goalId);if(!s||s.status==="Completed")return;let i=Number(new FormData(e).get("amount"));if(!Number.isFinite(i)||i<=0){$("Enter a positive progress amount.");return}let o=H(new Date);s.logs=Array.isArray(s.logs)?s.logs:[];let d=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,p=s.logs[s.logs.length-1];if(p&&p.date===o&&Number(p.amount)===i&&Date.now()-new Date(p.createdAt||0).getTime()<8e3){$("That progress entry was just saved. Wait before submitting it again.");return}s.logs.push({id:d,date:o,amount:i,xp:10,createdAt:new Date().toISOString()}),s.current=Math.min(Number(s.target)||1,(Number(s.current)||0)+i),s.xp=(Number(s.xp)||0)+10,Ii(s);let r=s.status==="Completed";s.status=s.current>=s.target?"Completed":s.targetDate<o?"Overdue":"Active",!r&&s.status==="Completed"&&(s.completedAt=new Date().toISOString()),lt(t),$(s.status==="Completed"?"Goal completed! Achievement unlocked.":"+10 XP \xB7 Progress saved"),v()}),document.addEventListener("click",async n=>{let e=n.target.closest('[data-action^="ga-"]');if(e){let u=e.dataset.action;if(u==="ga-back"){we();return}if(u==="ga-filter"){a.goalAchievementFilter=e.dataset.filter||"All",v();return}if(u==="ga-cancel-create"){we();return}if(u==="ga-open-create"){a.view!=="goal-create"&&(a.navigationHistory=Array.isArray(a.navigationHistory)?a.navigationHistory:[],a.navigationHistory.push(a.view||"goal-achievements"),a.view="goal-create"),v();return}if(u==="ga-cancel-edit"){we();return}if(u==="ga-edit"){let l=(a.goalAchievementItems||[]).find(m=>String(m.id)===String(e.dataset.goalId));if(!l){$("This goal is no longer available."),v();return}a.goalAchievementEditingId=l.id,a.view!=="goal-edit"&&(a.navigationHistory.push(a.view||"goal-achievements"),a.view="goal-edit"),v();return}if(u==="ga-delete"){let l=(a.goalAchievementItems||[]).find(m=>m.id===e.dataset.goalId);if(!l||!window.confirm(`Delete the goal \u201C${l.title}\u201D and its progress history?`))return;lt((a.goalAchievementItems||[]).filter(m=>m.id!==l.id)),window.Capacitor?.isNativePlatform?.()&&B.cancel({notifications:[{id:is(l.id)}]}).catch(()=>{}),a.goalAchievementEditingId=null,$("Goal deleted"),v();return}}if(n.target.closest('[data-action="shared-page-back"]')){we();return}if(n.target.closest('[data-action="open-reset-options"]')){a.resetOptionsSelected={tasks:!1,notepad:!1,expenses:!1,calendar:!1,progress:!1,goalAchievements:!1,focus:!1},a.resetConfirmOpen=!1,fa("reset-options");return}if(n.target.closest('[data-action="reset-back-settings"]')){a.resetConfirmOpen=!1,a.view="settings",v();return}let o=n.target.closest('[data-action="reset-toggle-category"]');if(o){let u=o.dataset.category;Object.prototype.hasOwnProperty.call(oe,u)&&(a.resetOptionsSelected={...a.resetOptionsSelected,[u]:!a.resetOptionsSelected[u]},v());return}if(n.target.closest('[data-action="reset-select-all"]')){let u=Object.keys(oe).every(l=>a.resetOptionsSelected?.[l]);a.resetOptionsSelected=Object.fromEntries(Object.keys(oe).map(l=>[l,!u])),v();return}if(n.target.closest('[data-action="reset-review"]')){if(!Object.keys(oe).some(l=>a.resetOptionsSelected?.[l])){$("Select at least one data section to reset.");return}a.resetConfirmOpen=!0,v();return}if(n.target.closest('[data-action="reset-cancel"]')){a.resetConfirmOpen=!1,v();return}if(n.target.closest('[data-action="reset-confirm"]')){if(a.resetOptionsBusy)return;let u=String(document.getElementById("reset-confirm-phrase")?.value||"").trim(),l=!!document.querySelector("[data-reset-acknowledge]")?.checked;if(u!=="DELETE"||!l){$("Check the permanent deletion acknowledgment and type DELETE to continue.");return}await mo();return}if(n.target.closest('[data-action="open-location-permission-settings"]')){ua("openAppSettings");return}if(n.target.closest('[data-action="open-device-location-settings"]')){ua("openLocationSettings");return}if(n.target.closest('[data-action="open-notification-permission-settings"]')){ua("openNotificationSettings");return}if(n.target.closest('[data-action="open-settings"]')){a.menuOpen=!1,a.moreMenuOpen=!1,a.entryModalOpen=!1,a.entryDraft=null,fa("settings");return}if(n.target.closest('[data-action="settings-back"]')){we();return}if(n.target.closest('[data-action="clear-assistant-chat"]')){a.assistantGeneration+=1,a.assistantMessages=[{role:"assistant",text:"I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress."}],v();return}let w=n.target.closest(".month-picker-wrapper"),D=n.target.closest(".menu-panel, .menu-button"),q=n.target.closest(".mood-selector-wrap"),F=n.target.closest(".more-menu-panel"),L=n.target.closest('[data-action="toggle-more-menu"]'),S=!1;!D&&a.menuOpen&&(a.menuOpen=!1,S=!0),a.progressPickerOpen&&!w&&(a.progressPickerOpen=!1,S=!0),a.moodPickerOpen&&!q&&(a.moodPickerOpen=!1,S=!0),a.moreMenuOpen&&!F&&!L&&(a.moreMenuOpen=!1,S=!0),S&&v()}),document.addEventListener("keydown",n=>{if(n.key!=="Escape")return;let e=!1;a.resetConfirmOpen&&(a.resetConfirmOpen=!1,e=!0),a.progressPickerOpen&&(a.progressPickerOpen=!1,e=!0),a.menuOpen&&(a.menuOpen=!1,e=!0),a.moodPickerOpen&&(a.moodPickerOpen=!1,e=!0),a.moreMenuOpen&&(a.moreMenuOpen=!1,e=!0),e&&v()}))}function es(){v()}async function ke(){if(a.authenticated)try{let n=await _("/api/transactions");a.financeData=Array.isArray(n)?n:n.transactions||[],v()}catch(n){if(console.error("Failed to load finance data:",n),a.localDatabaseReady)try{let e=await z.transactionFallback(await ge());e.length&&(a.financeData=e,v())}catch(e){console.warn("Finance cache unavailable:",e.message)}}}var ts=!1;function go(){ts||(ts=!0,document.addEventListener("click",async n=>{let e=n.target.closest("[data-action]");if(!e)return;let t=e.dataset.action;if(t==="quick-amount"){n.preventDefault();let s=document.getElementById("finance-amount"),i=Number(e.dataset.val);if(!s||!Number.isFinite(i)||i<=0)return;let o=Number.parseFloat(s.value),d=Number.isFinite(o)&&o>0?o:0;s.value=String(Number((d+i).toFixed(2))),s.dispatchEvent(new Event("input",{bubbles:!0})),s.dispatchEvent(new Event("change",{bubbles:!0})),e.classList.add("quick-amount-applied"),window.setTimeout(()=>e.classList.remove("quick-amount-applied"),240);return}if(t==="set-finance-view"){a.financeView=e.dataset.view||"dashboard",v();return}if(t==="set-finance-filter"){a.financeFilter=e.dataset.filter||"week",v();return}if(t==="select-finance-type"){a.tempFinanceType=e.dataset.type||"expense",a.financeView="add-expense",v();return}if(t==="show-finance-reset-confirm"){a.showFinanceResetConfirm=!0,v();return}if(t==="cancel-finance-reset"){a.showFinanceResetConfirm=!1,v();return}if(t==="confirm-finance-reset"){if(a.financeResetLoading)return;a.financeResetLoading=!0,v();let s=new AbortController,i=setTimeout(()=>s.abort(),15e3);try{let o=await _("/api/transactions",{method:"DELETE",signal:s.signal});a.financeData=[],a.financeDetail=null,a.showFinanceResetConfirm=!1,a.tempFinanceType=null,a.financeView="dashboard",$(`${o.deletedCount||0} transactions deleted`),v()}catch(o){console.error("Reset transactions error:",o),$(o.name==="AbortError"?"Reset timed out. Check your connection and retry.":o.message||"Unable to reset transactions")}finally{clearTimeout(i),a.financeResetLoading=!1,v()}return}if(t==="show-transaction-detail"){let s=e.dataset.id,i=a.financeData.find(o=>String(o._id||o.id)===String(s));if(!i)return;a.financeDetail=i,v();return}if(t==="close-transaction-detail"){a.financeDetail=null,v();return}if(t==="delete-finance-transaction"){let s=e.dataset.id;if(!s){$("Transaction ID is missing");return}if(e.dataset.deleting==="true")return;let i=a.financeData.findIndex(d=>String(d._id||d.id)===String(s));if(i===-1){$("Transaction not found");return}let o=a.financeData[i];e.dataset.deleting="true",e.disabled=!0,a.financeData.splice(i,1),a.financeDetail=null,v();try{await _(`/api/transactions/${s}`,{method:"DELETE"}),$("Transaction deleted successfully")}catch(d){console.error("Delete transaction error:",d),a.financeData.splice(i,0,o),a.financeDetail=o,v(),$(d.message||"Unable to delete transaction")}return}if(t==="save-finance-transaction"){if(e.dataset.submitting==="true")return;e.dataset.submitting="true",e.textContent="Saving...";let s=document.getElementById("finance-amount")?.value,i=document.getElementById("finance-category")?.value,o=document.getElementById("finance-date")?.value,d=document.getElementById("finance-note")?.value,p=document.getElementById("finance-payment-method")?.value||"Cash",r=e.dataset.type||a.tempFinanceType||"expense";if(!s||Number(s)<=0){$("Please enter a valid amount."),e.dataset.submitting="false",e.textContent="Save Transaction";return}try{await _("/api/transactions",{method:"POST",body:JSON.stringify({amount:Number(s),category:i||"Other",date:o||new Date().toISOString(),note:d||"",type:r,paymentMethod:p})}),a.financeView="dashboard",a.tempFinanceType=null,await ke(),$("Transaction saved successfully")}catch(g){console.error(g),$(g.message||"Unable to save transaction"),e.dataset.submitting="false",e.textContent="Save Transaction"}return}}))}document.addEventListener("click",n=>{let e=n.target.closest('[data-action="open-weather"], [data-action="weather-back"], [data-action="weather-refresh"], [data-action="view-today-events"]');if(!e)return;let t=e.dataset.action;t==="open-weather"?(a.view="weather",a.entryModalOpen=!1,a.entryDraft=null,v(),ba()):t==="weather-back"?(a.view="home",v()):t==="weather-refresh"?ba():t==="view-today-events"&&(a.selectedDate=H(new Date),a.currentMonth=new Date().getMonth(),a.currentYear=new Date().getFullYear(),a.view="calendar",v())});document.addEventListener("submit",n=>{let e=n.target.closest("[data-weather-search-form]");if(!e)return;n.preventDefault();let t=String(new FormData(e).get("city")||"").trim();t.length>=2&&ba(t)});async function fo(){wt(ns()),Ei(),co(),ho(),go(),window.addEventListener("daysync:permissions-updated",()=>{a.view==="settings"&&v()});let n=sa(),e;try{e=await ge()}catch(i){throw n.catch(()=>{}),i}if(a.authenticated=!!e,!e){n.catch(()=>{}),window.location.href=xt();return}a.authenticated=!0,window.SAHRA_APP_READY=!0,v(),so(),window.SAHRA_FOCUS_TIMER_READY=!0,no();let t=null,s=await Promise.race([n.then(()=>"ready").catch(i=>({error:i})),new Promise(i=>{t=window.setTimeout(()=>i("timeout"),3500)})]);t!==null&&window.clearTimeout(t),s==="ready"?(a.localDatabaseReady=!0,await V({loadFinanceInBackground:!0})):(a.localDatabaseReady=!1,s==="timeout"?(console.warn("Local database is taking longer than expected; opening DaySync in online mode first."),await V({skipLocalSync:!0}),n.then(()=>(a.localDatabaseReady=!0,V({loadFinanceInBackground:!0}))).catch(i=>{console.warn("Offline storage is unavailable; online DaySync remains usable:",i.message)})):(console.warn("Local database could not be initialized; continuing in online mode:",s.error?.message||s.error),await V({skipLocalSync:!0}))),window.SAHRA_NOTIFICATIONS?.isNative?.()&&window.SAHRA_NOTIFICATIONS.permissionStatus().then(()=>{a.view==="settings"&&v()}).catch(i=>console.warn("Notification permission status unavailable:",i.message)),window.Capacitor?.isNativePlatform()&&Promise.resolve().then(()=>(Mn(),On)).then(({markSahraOtaReady:i})=>i()).catch(i=>console.warn("Sahra OTA readiness could not be updated:",i.message))}fo().catch(n=>{console.error("App initialization failed:",n),$(n.message||"Unable to initialize DaySync."),v()});J();var At=G("App",{web:()=>Promise.resolve().then(()=>(hs(),ms)).then(n=>new n.AppWeb)});J();var gs;(function(n){n.Dark="DARK",n.Light="LIGHT",n.Default="DEFAULT"})(gs||(gs={}));var kt;(function(n){n.Body="body",n.Ionic="ionic",n.Native="native",n.None="none"})(kt||(kt={}));var fs=G("Keyboard");J();var je;(function(n){n.Dark="DARK",n.Light="LIGHT",n.Default="DEFAULT"})(je||(je={}));var ys;(function(n){n.None="NONE",n.Slide="SLIDE",n.Fade="FADE"})(ys||(ys={}));var Be=G("StatusBar");J();var ws=G("SpeechRecognition",{web:()=>Promise.resolve().then(()=>(vs(),bs)).then(n=>new n.SpeechRecognitionWeb)});window.SAHRA_SPEECH_RECOGNITION=ws;async function bo(){let n=window.Capacitor;if(!n?.isNativePlatform())return;let e=n.getPlatform();try{await At.addListener("backButton",()=>{window.SAHRA_APP_READY===!0&&(window.sahraHandleNativeBack?.()||e==="android"&&window.sahraIsHome?.()&&At.exitApp())})}catch(t){console.error("Native Back listener registration failed:",t)}try{await Be.setOverlaysWebView({overlay:!1}),await Be.show()}catch(t){console.warn("Native status-bar visibility configuration failed:",t)}try{let t=()=>{let i=document.documentElement.getAttribute("data-theme");return i==="light"||i==="dark"?i:window.matchMedia?.("(prefers-color-scheme: light)").matches?"light":"dark"},s=async(i=t())=>{let o=i==="light";await Be.setStyle({style:o?je.Dark:je.Light}),e==="android"&&await Be.setBackgroundColor({color:o?"#f8faff":"#071126"});let d=document.querySelector('meta[name="theme-color"]');d&&d.setAttribute("content",o?"#f8faff":"#071126")};await s(),window.addEventListener("daysync:theme-changed",i=>{s(i.detail?.theme||t()).catch(o=>console.warn("Status bar theme update failed:",o))}),window.addEventListener("daysync:resume",()=>{s().catch(i=>console.warn("Status bar resume theme update failed:",i))})}catch(t){console.warn("Native status-bar theme configuration failed:",t)}try{await fs.setResizeMode({mode:kt.Body})}catch(t){console.warn("Native keyboard configuration failed:",t)}try{await At.addListener("appStateChange",({isActive:t})=>{t&&window.dispatchEvent(new Event("daysync:resume"))})}catch(t){console.warn("Native app-resume listener registration failed:",t)}}bo();
