var ss=Object.defineProperty;var te=(n,e)=>()=>(n&&(e=n(n=0)),e);var xe=(n,e)=>{for(var a in e)ss(n,a,{get:e[a],enumerable:!0})};var Se,Pe,hs,fs,ys,Le,se,Z,Fa,ja,_t,Hi,bs,vs,ws,xs,qt,Gi,Ba,Ua,Ft,Wi,ce=te(()=>{(function(n){n.Unimplemented="UNIMPLEMENTED",n.Unavailable="UNAVAILABLE"})(Se||(Se={}));Pe=class extends Error{constructor(e,a,s){super(e),this.message=e,this.code=a,this.data=s}},hs=n=>{var e,a;return n?.androidBridge?"android":!((a=(e=n?.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||a===void 0)&&a.bridge?"ios":"web"},fs=n=>{let e=n.CapacitorCustomPlatform||null,a=n.Capacitor||{},s=a.Plugins=a.Plugins||{},i=()=>e!==null?e.name:hs(n),o=()=>i()!=="web",l=f=>{let w=h.get(f);return!!(w?.platforms.has(i())||m(f))},m=f=>{var w;return(w=a.PluginHeaders)===null||w===void 0?void 0:w.find(I=>I.name===f)},r=f=>n.console.error(f),h=new Map,g=(f,w={})=>{let I=h.get(f);if(I)return console.warn(`Capacitor plugin "${f}" already registered. Cannot register plugins twice.`),I.proxy;let N=i(),D=m(f),v,C=async()=>(!v&&N in w?v=typeof w[N]=="function"?v=await w[N]():v=w[N]:e!==null&&!v&&"web"in w&&(v=typeof w.web=="function"?v=await w.web():v=w.web),v),F=(d,y)=>{var S,k;if(D){let T=D?.methods.find(O=>y===O.name);if(T)return T.rtype==="promise"?O=>a.nativePromise(f,y.toString(),O):(O,_)=>a.nativeCallback(f,y.toString(),O,_);if(d)return(S=d[y])===null||S===void 0?void 0:S.bind(d)}else{if(d)return(k=d[y])===null||k===void 0?void 0:k.bind(d);throw new Pe(`"${f}" plugin is not implemented on ${N}`,Se.Unimplemented)}},j=d=>{let y,S=(...k)=>{let T=C().then(O=>{let _=F(O,d);if(_){let H=_(...k);return y=H?.remove,H}else throw new Pe(`"${f}.${d}()" is not implemented on ${N}`,Se.Unimplemented)});return d==="addListener"&&(T.remove=async()=>y()),T};return S.toString=()=>`${d.toString()}() { [capacitor code] }`,Object.defineProperty(S,"name",{value:d,writable:!1,configurable:!1}),S},L=j("addListener"),x=j("removeListener"),u=(d,y)=>{let S=L({eventName:d},y),k=async()=>{let O=await S;x({eventName:d,callbackId:O},y)},T=new Promise(O=>S.then(()=>O({remove:k})));return T.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await k()},T},p=new Proxy({},{get(d,y){switch(y){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return D?u:L;case"removeListener":return x;default:return j(y)}}});return s[f]=p,h.set(f,{name:f,proxy:p,platforms:new Set([...Object.keys(w),...D?[N]:[]])}),p};return a.convertFileSrc||(a.convertFileSrc=f=>f),a.getPlatform=i,a.handleError=r,a.isNativePlatform=o,a.isPluginAvailable=l,a.registerPlugin=g,a.Exception=Pe,a.DEBUG=!!a.DEBUG,a.isLoggingEnabled=!!a.isLoggingEnabled,a},ys=n=>n.Capacitor=fs(n),Le=ys(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),se=Le.registerPlugin,Z=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,a){let s=!1;this.listeners[e]||(this.listeners[e]=[],s=!0),this.listeners[e].push(a);let o=this.windowListeners[e];o&&!o.registered&&this.addWindowListener(o),s&&this.sendRetainedArgumentsForEvent(e);let l=async()=>this.removeListener(e,a);return Promise.resolve({remove:l})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,a,s){let i=this.listeners[e];if(!i){if(s){let o=this.retainedEventArguments[e];o||(o=[]),o.push(a),this.retainedEventArguments[e]=o}return}i.forEach(o=>o(a))}hasListeners(e){var a;return!!(!((a=this.listeners[e])===null||a===void 0)&&a.length)}registerWindowListener(e,a){this.windowListeners[a]={registered:!1,windowEventName:e,pluginEventName:a,handler:s=>{this.notifyListeners(a,s)}}}unimplemented(e="not implemented"){return new Le.Exception(e,Se.Unimplemented)}unavailable(e="not available"){return new Le.Exception(e,Se.Unavailable)}async removeListener(e,a){let s=this.listeners[e];if(!s)return;let i=s.indexOf(a);i!==-1&&this.listeners[e].splice(i,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let a=this.retainedEventArguments[e];a&&(delete this.retainedEventArguments[e],a.forEach(s=>{this.notifyListeners(e,s)}))}},Fa=n=>encodeURIComponent(n).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),ja=n=>n.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),_t=class extends Z{async getCookies(){let e=document.cookie,a={};return e.split(";").forEach(s=>{if(s.length<=0)return;let[i,o]=s.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");i=ja(i).trim(),o=ja(o).trim(),a[i]=o}),a}async setCookie(e){try{let a=Fa(e.key),s=Fa(e.value),i=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",o=(e.path||"/").replace("path=",""),l=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${a}=${s||""}${i}; path=${o}; ${l};`}catch(a){return Promise.reject(a)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(a){return Promise.reject(a)}}async clearCookies(){try{let e=document.cookie.split(";")||[];for(let a of e)document.cookie=a.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},Hi=se("CapacitorCookies",{web:()=>new _t}),bs=async n=>new Promise((e,a)=>{let s=new FileReader;s.onload=()=>{let i=s.result;e(i.indexOf(",")>=0?i.split(",")[1]:i)},s.onerror=i=>a(i),s.readAsDataURL(n)}),vs=(n={})=>{let e=Object.keys(n);return Object.keys(n).map(i=>i.toLocaleLowerCase()).reduce((i,o,l)=>(i[o]=n[e[l]],i),{})},ws=(n,e=!0)=>n?Object.entries(n).reduce((s,i)=>{let[o,l]=i,m,r;return Array.isArray(l)?(r="",l.forEach(h=>{m=e?encodeURIComponent(h):h,r+=`${o}=${m}&`}),r.slice(0,-1)):(m=e?encodeURIComponent(l):l,r=`${o}=${m}`),`${s}&${r}`},"").substr(1):null,xs=(n,e={})=>{let a=Object.assign({method:n.method||"GET",headers:n.headers},e),i=vs(n.headers)["content-type"]||"";if(typeof n.data=="string")a.body=n.data;else if(i.includes("application/x-www-form-urlencoded")){let o=new URLSearchParams;for(let[l,m]of Object.entries(n.data||{}))o.set(l,m);a.body=o.toString()}else if(i.includes("multipart/form-data")||n.data instanceof FormData){let o=new FormData;if(n.data instanceof FormData)n.data.forEach((m,r)=>{o.append(r,m)});else for(let m of Object.keys(n.data))o.append(m,n.data[m]);a.body=o;let l=new Headers(a.headers);l.delete("content-type"),a.headers=l}else(i.includes("application/json")||typeof n.data=="object")&&(a.body=JSON.stringify(n.data));return a},qt=class extends Z{async request(e){let a=xs(e,e.webFetchExtra),s=ws(e.params,e.shouldEncodeUrlParams),i=s?`${e.url}?${s}`:e.url,o=await fetch(i,a),l=o.headers.get("content-type")||"",{responseType:m="text"}=o.ok?e:{};l.includes("application/json")&&(m="json");let r,h;switch(m){case"arraybuffer":case"blob":h=await o.blob(),r=await bs(h);break;case"json":r=await o.json();break;case"document":case"text":default:r=await o.text()}let g={};return o.headers.forEach((f,w)=>{g[w]=f}),{data:r,headers:g,status:o.status,url:o.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}},Gi=se("CapacitorHttp",{web:()=>new qt});(function(n){n.Dark="DARK",n.Light="LIGHT",n.Default="DEFAULT"})(Ba||(Ba={}));(function(n){n.StatusBar="StatusBar",n.NavigationBar="NavigationBar"})(Ua||(Ua={}));Ft=class extends Z{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}},Wi=se("SystemBars",{web:()=>new Ft})});var Ge,We,za=te(()=>{Ge=class{constructor(e){this.sqlite=e,this._connectionDict=new Map}async initWebStore(){try{return await this.sqlite.initWebStore(),Promise.resolve()}catch(e){return Promise.reject(e)}}async saveToStore(e){try{return await this.sqlite.saveToStore({database:e}),Promise.resolve()}catch(a){return Promise.reject(a)}}async saveToLocalDisk(e){try{return await this.sqlite.saveToLocalDisk({database:e}),Promise.resolve()}catch(a){return Promise.reject(a)}}async getFromLocalDiskToStore(e){let a=e??!0;try{return await this.sqlite.getFromLocalDiskToStore({overwrite:a}),Promise.resolve()}catch(s){return Promise.reject(s)}}async echo(e){try{let a=await this.sqlite.echo({value:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async isSecretStored(){try{let e=await this.sqlite.isSecretStored();return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async setEncryptionSecret(e){try{return await this.sqlite.setEncryptionSecret({passphrase:e}),Promise.resolve()}catch(a){return Promise.reject(a)}}async changeEncryptionSecret(e,a){try{return await this.sqlite.changeEncryptionSecret({passphrase:e,oldpassphrase:a}),Promise.resolve()}catch(s){return Promise.reject(s)}}async clearEncryptionSecret(){try{return await this.sqlite.clearEncryptionSecret(),Promise.resolve()}catch(e){return Promise.reject(e)}}async checkEncryptionSecret(e){try{let a=await this.sqlite.checkEncryptionSecret({passphrase:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async addUpgradeStatement(e,a){try{return e.endsWith(".db")&&(e=e.slice(0,-3)),await this.sqlite.addUpgradeStatement({database:e,upgrade:a}),Promise.resolve()}catch(s){return Promise.reject(s)}}async createConnection(e,a,s,i,o){try{e.endsWith(".db")&&(e=e.slice(0,-3)),await this.sqlite.createConnection({database:e,encrypted:a,mode:s,version:i,readonly:o});let l=new We(e,o,this.sqlite),m=o?`RO_${e}`:`RW_${e}`;return this._connectionDict.set(m,l),Promise.resolve(l)}catch(l){return Promise.reject(l)}}async closeConnection(e,a){try{e.endsWith(".db")&&(e=e.slice(0,-3)),await this.sqlite.closeConnection({database:e,readonly:a});let s=a?`RO_${e}`:`RW_${e}`;return this._connectionDict.delete(s),Promise.resolve()}catch(s){return Promise.reject(s)}}async isConnection(e,a){let s={};e.endsWith(".db")&&(e=e.slice(0,-3));let i=a?`RO_${e}`:`RW_${e}`;return s.result=this._connectionDict.has(i),Promise.resolve(s)}async retrieveConnection(e,a){e.endsWith(".db")&&(e=e.slice(0,-3));let s=a?`RO_${e}`:`RW_${e}`;if(this._connectionDict.has(s)){let i=this._connectionDict.get(s);return typeof i<"u"?Promise.resolve(i):Promise.reject(`Connection ${e} is undefined`)}else return Promise.reject(`Connection ${e} does not exist`)}async getNCDatabasePath(e,a){try{let s=await this.sqlite.getNCDatabasePath({path:e,database:a});return Promise.resolve(s)}catch(s){return Promise.reject(s)}}async createNCConnection(e,a){try{await this.sqlite.createNCConnection({databasePath:e,version:a});let s=new We(e,!0,this.sqlite),i=`RO_${e})`;return this._connectionDict.set(i,s),Promise.resolve(s)}catch(s){return Promise.reject(s)}}async closeNCConnection(e){try{await this.sqlite.closeNCConnection({databasePath:e});let a=`RO_${e})`;return this._connectionDict.delete(a),Promise.resolve()}catch(a){return Promise.reject(a)}}async isNCConnection(e){let a={},s=`RO_${e})`;return a.result=this._connectionDict.has(s),Promise.resolve(a)}async retrieveNCConnection(e){if(this._connectionDict.has(e)){let a=`RO_${e})`,s=this._connectionDict.get(a);return typeof s<"u"?Promise.resolve(s):Promise.reject(`Connection ${e} is undefined`)}else return Promise.reject(`Connection ${e} does not exist`)}async isNCDatabase(e){try{let a=await this.sqlite.isNCDatabase({databasePath:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async retrieveAllConnections(){return this._connectionDict}async closeAllConnections(){let e=new Map;try{for(let a of this._connectionDict.keys()){let s=a.substring(3),i=a.substring(0,3)==="RO_";await this.sqlite.closeConnection({database:s,readonly:i}),e.set(a,null)}for(let a of e.keys())this._connectionDict.delete(a);return Promise.resolve()}catch(a){return Promise.reject(a)}}async checkConnectionsConsistency(){try{let e=[...this._connectionDict.keys()],a=[],s=[];for(let o of e)a.push(o.substring(0,2)),s.push(o.substring(3));let i=await this.sqlite.checkConnectionsConsistency({dbNames:s,openModes:a});return i.result||(this._connectionDict=new Map),Promise.resolve(i)}catch(e){return this._connectionDict=new Map,Promise.reject(e)}}async importFromJson(e){try{let a=await this.sqlite.importFromJson({jsonstring:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async isJsonValid(e){try{let a=await this.sqlite.isJsonValid({jsonstring:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async copyFromAssets(e){let a=e??!0;try{return await this.sqlite.copyFromAssets({overwrite:a}),Promise.resolve()}catch(s){return Promise.reject(s)}}async getFromHTTPRequest(e,a){let s=a??!0;try{return await this.sqlite.getFromHTTPRequest({url:e,overwrite:s}),Promise.resolve()}catch(i){return Promise.reject(i)}}async isDatabaseEncrypted(e){e.endsWith(".db")&&(e=e.slice(0,-3));try{let a=await this.sqlite.isDatabaseEncrypted({database:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async isInConfigEncryption(){try{let e=await this.sqlite.isInConfigEncryption();return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isInConfigBiometricAuth(){try{let e=await this.sqlite.isInConfigBiometricAuth();return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isDatabase(e){e.endsWith(".db")&&(e=e.slice(0,-3));try{let a=await this.sqlite.isDatabase({database:e});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async getDatabaseList(){try{let a=(await this.sqlite.getDatabaseList()).values;a.sort();let s={values:a};return Promise.resolve(s)}catch(e){return Promise.reject(e)}}async getMigratableDbList(e){let a=e||"default";try{let s=await this.sqlite.getMigratableDbList({folderPath:a});return Promise.resolve(s)}catch(s){return Promise.reject(s)}}async addSQLiteSuffix(e,a){let s=e||"default",i=a||[];try{let o=await this.sqlite.addSQLiteSuffix({folderPath:s,dbNameList:i});return Promise.resolve(o)}catch(o){return Promise.reject(o)}}async deleteOldDatabases(e,a){let s=e||"default",i=a||[];try{let o=await this.sqlite.deleteOldDatabases({folderPath:s,dbNameList:i});return Promise.resolve(o)}catch(o){return Promise.reject(o)}}async moveDatabasesAndAddSuffix(e,a){let s=e||"default",i=a||[];return this.sqlite.moveDatabasesAndAddSuffix({folderPath:s,dbNameList:i})}},We=class{constructor(e,a,s){this.dbName=e,this.readonly=a,this.sqlite=s}getConnectionDBName(){return this.dbName}getConnectionReadOnly(){return this.readonly}async open(){try{return await this.sqlite.open({database:this.dbName,readonly:this.readonly}),Promise.resolve()}catch(e){return Promise.reject(e)}}async close(){try{return await this.sqlite.close({database:this.dbName,readonly:this.readonly}),Promise.resolve()}catch(e){return Promise.reject(e)}}async beginTransaction(){try{let e=await this.sqlite.beginTransaction({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async commitTransaction(){try{let e=await this.sqlite.commitTransaction({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async rollbackTransaction(){try{let e=await this.sqlite.rollbackTransaction({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isTransactionActive(){try{let e=await this.sqlite.isTransactionActive({database:this.dbName});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async loadExtension(e){try{return await this.sqlite.loadExtension({database:this.dbName,path:e,readonly:this.readonly}),Promise.resolve()}catch(a){return Promise.reject(a)}}async enableLoadExtension(e){try{return await this.sqlite.enableLoadExtension({database:this.dbName,toggle:e,readonly:this.readonly}),Promise.resolve()}catch(a){return Promise.reject(a)}}async getUrl(){try{let e=await this.sqlite.getUrl({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async getVersion(){try{let e=await this.sqlite.getVersion({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async getTableList(){try{let e=await this.sqlite.getTableList({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async execute(e,a=!0,s=!0){try{if(this.readonly)return Promise.reject("not allowed in read-only mode");{let i=await this.sqlite.execute({database:this.dbName,statements:e,transaction:a,readonly:!1,isSQL92:s});return Promise.resolve(i)}}catch(i){return Promise.reject(i)}}async query(e,a,s=!0){let i;try{return a&&a.length>0?i=await this.sqlite.query({database:this.dbName,statement:e,values:a,readonly:this.readonly,isSQL92:!0}):i=await this.sqlite.query({database:this.dbName,statement:e,values:[],readonly:this.readonly,isSQL92:s}),i=await this.reorderRows(i),Promise.resolve(i)}catch(o){return Promise.reject(o)}}async run(e,a,s=!0,i="no",o=!0){let l;try{return this.readonly?Promise.reject("not allowed in read-only mode"):(a&&a.length>0?l=await this.sqlite.run({database:this.dbName,statement:e,values:a,transaction:s,readonly:!1,returnMode:i,isSQL92:!0}):l=await this.sqlite.run({database:this.dbName,statement:e,values:[],transaction:s,readonly:!1,returnMode:i,isSQL92:o}),l.changes=await this.reorderRows(l.changes),Promise.resolve(l))}catch(m){return Promise.reject(m)}}async executeSet(e,a=!0,s="no",i=!0){let o;try{return this.readonly?Promise.reject("not allowed in read-only mode"):(o=await this.sqlite.executeSet({database:this.dbName,set:e,transaction:a,readonly:!1,returnMode:s,isSQL92:i}),o.changes=await this.reorderRows(o.changes),Promise.resolve(o))}catch(l){return Promise.reject(l)}}async isExists(){try{let e=await this.sqlite.isDBExists({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async isTable(e){try{let a=await this.sqlite.isTableExists({database:this.dbName,table:e,readonly:this.readonly});return Promise.resolve(a)}catch(a){return Promise.reject(a)}}async isDBOpen(){try{let e=await this.sqlite.isDBOpen({database:this.dbName,readonly:this.readonly});return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async delete(){try{return this.readonly?Promise.reject("not allowed in read-only mode"):(await this.sqlite.deleteDatabase({database:this.dbName,readonly:!1}),Promise.resolve())}catch(e){return Promise.reject(e)}}async createSyncTable(){try{if(this.readonly)return Promise.reject("not allowed in read-only mode");{let e=await this.sqlite.createSyncTable({database:this.dbName,readonly:!1});return Promise.resolve(e)}}catch(e){return Promise.reject(e)}}async setSyncDate(e){try{return this.readonly?Promise.reject("not allowed in read-only mode"):(await this.sqlite.setSyncDate({database:this.dbName,syncdate:e,readonly:!1}),Promise.resolve())}catch(a){return Promise.reject(a)}}async getSyncDate(){try{let e=await this.sqlite.getSyncDate({database:this.dbName,readonly:this.readonly}),a="";return e.syncDate>0&&(a=new Date(e.syncDate*1e3).toISOString()),Promise.resolve(a)}catch(e){return Promise.reject(e)}}async exportToJson(e,a=!1){try{let s=await this.sqlite.exportToJson({database:this.dbName,jsonexportmode:e,readonly:this.readonly,encrypted:a});return Promise.resolve(s)}catch(s){return Promise.reject(s)}}async deleteExportedRows(){try{return this.readonly?Promise.reject("not allowed in read-only mode"):(await this.sqlite.deleteExportedRows({database:this.dbName,readonly:!1}),Promise.resolve())}catch(e){return Promise.reject(e)}}async executeTransaction(e,a=!0){let s=0,i=!1;if(this.readonly)return Promise.reject("not allowed in read-only mode");if(await this.sqlite.beginTransaction({database:this.dbName}),i=await this.sqlite.isTransactionActive({database:this.dbName}),!i)return Promise.reject("After Begin Transaction, no transaction active");try{for(let m of e){if(typeof m!="object"||!("statement"in m))throw new Error("Error a task.statement must be provided");if("values"in m&&m.values&&m.values.length>0){let r=m.statement.toUpperCase().includes("RETURNING")?"all":"no",h=await this.sqlite.run({database:this.dbName,statement:m.statement,values:m.values,transaction:!1,readonly:!1,returnMode:r,isSQL92:a});if(h.changes.changes<0)throw new Error("Error in transaction method run ");s+=h.changes.changes}else{let r=await this.sqlite.execute({database:this.dbName,statements:m.statement,transaction:!1,readonly:!1});if(r.changes.changes<0)throw new Error("Error in transaction method execute ");s+=r.changes.changes}}let o=await this.sqlite.commitTransaction({database:this.dbName});s+=o.changes.changes;let l={changes:{changes:s}};return Promise.resolve(l)}catch(o){let l=o.message?o.message:o;return await this.sqlite.rollbackTransaction({database:this.dbName}),Promise.reject(l)}}async reorderRows(e){let a=e;if(e?.values&&typeof e.values[0]=="object"&&Object.keys(e.values[0]).includes("ios_columns")){let s=e.values[0].ios_columns,i=[];for(let o=1;o<e.values.length;o++){let l=e.values[o],m={};for(let r of s)m[r]=l[r];i.push(m)}a.values=i}return Promise.resolve(a)}}});var Ha={};xe(Ha,{CapacitorSQLiteWeb:()=>jt});var jt,Ga=te(()=>{ce();jt=class extends Z{constructor(){super(...arguments),this.jeepSqliteElement=null,this.isWebStoreOpen=!1}async initWebStore(){await customElements.whenDefined("jeep-sqlite"),this.jeepSqliteElement=document.querySelector("jeep-sqlite"),this.ensureJeepSqliteIsAvailable(),this.jeepSqliteElement.addEventListener("jeepSqliteImportProgress",e=>{this.notifyListeners("sqliteImportProgressEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqliteExportProgress",e=>{this.notifyListeners("sqliteExportProgressEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqliteHTTPRequestEnded",e=>{this.notifyListeners("sqliteHTTPRequestEndedEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqlitePickDatabaseEnded",e=>{this.notifyListeners("sqlitePickDatabaseEndedEvent",e.detail)}),this.jeepSqliteElement.addEventListener("jeepSqliteSaveDatabaseToDisk",e=>{this.notifyListeners("sqliteSaveDatabaseToDiskEvent",e.detail)}),this.isWebStoreOpen||(this.isWebStoreOpen=await this.jeepSqliteElement.isStoreOpen())}async saveToStore(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.saveToStore(e);return}catch(a){throw new Error(`${a}`)}}async getFromLocalDiskToStore(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.getFromLocalDiskToStore(e);return}catch(a){throw new Error(`${a}`)}}async saveToLocalDisk(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.saveToLocalDisk(e);return}catch(a){throw new Error(`${a}`)}}async echo(e){return this.ensureJeepSqliteIsAvailable(),await this.jeepSqliteElement.echo(e)}async createConnection(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.createConnection(e);return}catch(a){throw new Error(`${a}`)}}async open(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.open(e);return}catch(a){throw new Error(`${a}`)}}async closeConnection(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.closeConnection(e);return}catch(a){throw new Error(`${a}`)}}async getVersion(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getVersion(e)}catch(a){throw new Error(`${a}`)}}async checkConnectionsConsistency(e){this.ensureJeepSqliteIsAvailable();try{return await this.jeepSqliteElement.checkConnectionsConsistency(e)}catch(a){throw new Error(`${a}`)}}async close(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.close(e);return}catch(a){throw new Error(`${a}`)}}async beginTransaction(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.beginTransaction(e)}catch(a){throw new Error(`${a}`)}}async commitTransaction(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.commitTransaction(e)}catch(a){throw new Error(`${a}`)}}async rollbackTransaction(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.rollbackTransaction(e)}catch(a){throw new Error(`${a}`)}}async isTransactionActive(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isTransactionActive(e)}catch(a){throw new Error(`${a}`)}}async getTableList(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getTableList(e)}catch(a){throw new Error(`${a}`)}}async execute(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.execute(e)}catch(a){throw new Error(`${a}`)}}async executeSet(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.executeSet(e)}catch(a){throw new Error(`${a}`)}}async run(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.run(e)}catch(a){throw new Error(`${a}`)}}async query(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.query(e)}catch(a){throw new Error(`${a}`)}}async isDBExists(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isDBExists(e)}catch(a){throw new Error(`${a}`)}}async isDBOpen(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isDBOpen(e)}catch(a){throw new Error(`${a}`)}}async isDatabase(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isDatabase(e)}catch(a){throw new Error(`${a}`)}}async isTableExists(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isTableExists(e)}catch(a){throw new Error(`${a}`)}}async deleteDatabase(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.deleteDatabase(e);return}catch(a){throw new Error(`${a}`)}}async isJsonValid(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.isJsonValid(e)}catch(a){throw new Error(`${a}`)}}async importFromJson(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.importFromJson(e)}catch(a){throw new Error(`${a}`)}}async exportToJson(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.exportToJson(e)}catch(a){throw new Error(`${a}`)}}async createSyncTable(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.createSyncTable(e)}catch(a){throw new Error(`${a}`)}}async setSyncDate(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.setSyncDate(e);return}catch(a){throw new Error(`${a}`)}}async getSyncDate(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getSyncDate(e)}catch(a){throw new Error(`${a}`)}}async deleteExportedRows(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.deleteExportedRows(e);return}catch(a){throw new Error(`${a}`)}}async addUpgradeStatement(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.addUpgradeStatement(e);return}catch(a){throw new Error(`${a}`)}}async copyFromAssets(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.copyFromAssets(e);return}catch(a){throw new Error(`${a}`)}}async getFromHTTPRequest(e){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{await this.jeepSqliteElement.getFromHTTPRequest(e);return}catch(a){throw new Error(`${a}`)}}async getDatabaseList(){this.ensureJeepSqliteIsAvailable(),this.ensureWebstoreIsOpen();try{return await this.jeepSqliteElement.getDatabaseList()}catch(e){throw new Error(`${e}`)}}ensureJeepSqliteIsAvailable(){if(this.jeepSqliteElement===null)throw new Error("The jeep-sqlite element is not present in the DOM! Please check the @capacitor-community/sqlite documentation for instructions regarding the web platform.")}ensureWebstoreIsOpen(){if(!this.isWebStoreOpen)throw new Error('WebStore is not open yet. You have to call "initWebStore()" first.')}async getUrl(){throw this.unimplemented("Not implemented on web.")}async getMigratableDbList(e){throw console.log("getMigratableDbList",e),this.unimplemented("Not implemented on web.")}async addSQLiteSuffix(e){throw console.log("addSQLiteSuffix",e),this.unimplemented("Not implemented on web.")}async deleteOldDatabases(e){throw console.log("deleteOldDatabases",e),this.unimplemented("Not implemented on web.")}async moveDatabasesAndAddSuffix(e){throw console.log("moveDatabasesAndAddSuffix",e),this.unimplemented("Not implemented on web.")}async isSecretStored(){throw this.unimplemented("Not implemented on web.")}async setEncryptionSecret(e){throw console.log("setEncryptionSecret",e),this.unimplemented("Not implemented on web.")}async changeEncryptionSecret(e){throw console.log("changeEncryptionSecret",e),this.unimplemented("Not implemented on web.")}async clearEncryptionSecret(){throw console.log("clearEncryptionSecret"),this.unimplemented("Not implemented on web.")}async checkEncryptionSecret(e){throw console.log("checkEncryptionPassPhrase",e),this.unimplemented("Not implemented on web.")}async getNCDatabasePath(e){throw console.log("getNCDatabasePath",e),this.unimplemented("Not implemented on web.")}async createNCConnection(e){throw console.log("createNCConnection",e),this.unimplemented("Not implemented on web.")}async closeNCConnection(e){throw console.log("closeNCConnection",e),this.unimplemented("Not implemented on web.")}async isNCDatabase(e){throw console.log("isNCDatabase",e),this.unimplemented("Not implemented on web.")}async isDatabaseEncrypted(e){throw console.log("isDatabaseEncrypted",e),this.unimplemented("Not implemented on web.")}async isInConfigEncryption(){throw this.unimplemented("Not implemented on web.")}async isInConfigBiometricAuth(){throw this.unimplemented("Not implemented on web.")}async loadExtension(e){throw console.log("loadExtension",e),this.unimplemented("Not implemented on web.")}async enableLoadExtension(e){throw console.log("enableLoadExtension",e),this.unimplemented("Not implemented on web.")}}});var Wa,Ya=te(()=>{ce();za();Wa=se("CapacitorSQLite",{web:()=>Promise.resolve().then(()=>(Ga(),Ha)).then(n=>new n.CapacitorSQLiteWeb),electron:()=>window.CapacitorCustomPlatform.plugins.CapacitorSQLite})});var Va={};xe(Va,{accountCollection:()=>ks,deleteRecord:()=>Ts,getCollection:()=>Gt,getLocalCollections:()=>Es,getLocalProfile:()=>Ds,initializeLocalDatabase:()=>Ht,saveLocalProfile:()=>Cs,saveRecord:()=>Ns});function he(){return!!Le.isNativePlatform()}function zt(n){if(!(Oe.includes(n)||/^acct_[A-Za-z0-9_-]{1,128}__(events|tasks|moods|habits|goals|reminders|notes|habitLogs|expenses|subscriptions|assets|transactions|syncOutbox|syncIdMap|profileCache|goalAchievements)$/.test(n)))throw new Error(`Unsupported local collection: ${n}`)}function ks(n,e){if(!Oe.includes(e)||!n)throw new Error("Account and valid collection are required.");let a=String(n).replace(/[^A-Za-z0-9_-]/g,"_").slice(0,128);if(!a)throw new Error("Invalid account identifier.");return`acct_${a}__${e}`}function Ve(n,e){try{return JSON.parse(n)}catch{return e}}function As(n){if(!n||typeof n!="object"||Array.isArray(n))throw new Error("A record must be an object.");let e=n.id??n._id,a=e==null?globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`:String(e);return{...n,id:a}}async function $s(){if(!he())throw new Error("Native SQLite is only available on a native device.");let n=await Ye.checkConnectionsConsistency(),e=await Ye.isConnection(Bt,!1),a;return e.result?a=await Ye.retrieveConnection(Bt,!1):a=await Ye.createConnection(Bt,!1,"no-encryption",Ss,!1),(await a.isDBOpen()).result||await a.open(),await a.execute(`
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
  `),a}async function ke(){return Je||(Je=$s().catch(n=>{throw Je=null,n})),Je}async function Ht(){return he()?(await ke(),{driver:"sqlite",collections:[...Oe]}):{driver:"localStorage",collections:[...Oe]}}function Es(){return[...Oe]}async function Gt(n){return zt(n),he()?((await(await ke()).query("SELECT payload FROM records WHERE collection = ? ORDER BY updated_at ASC",[n])).values||[]).map(s=>Ve(s.payload,null)).filter(s=>s!==null):Ve(localStorage.getItem(`${Ut}${n}`)||"[]",[])}async function Ns(n,e){zt(n);let a=As(e);if(!he()){let i=await Gt(n),o=i.findIndex(l=>String(l.id??l._id)===a.id);return o>=0?i[o]={...i[o],...a}:i.push(a),localStorage.setItem(`${Ut}${n}`,JSON.stringify(i)),a}return await(await ke()).run(`INSERT INTO records (collection, id, payload)
     VALUES (?, ?, ?)
     ON CONFLICT(collection, id) DO UPDATE SET
       payload = excluded.payload,
       updated_at = CURRENT_TIMESTAMP`,[n,a.id,JSON.stringify(a)]),a}async function Ts(n,e){zt(n);let a=String(e);if(!he()){let o=(await Gt(n)).filter(l=>String(l.id??l._id)!==a);localStorage.setItem(`${Ut}${n}`,JSON.stringify(o));return}await(await ke()).run("DELETE FROM records WHERE collection = ? AND id = ?",[n,a])}async function Ds(){if(!he())return Ve(localStorage.getItem(Ja)||"null",null);let e=await(await ke()).query("SELECT payload FROM profile WHERE profile_key = ?",["profile"]);return e.values?.length?Ve(e.values[0].payload,null):null}async function Cs(n){if(!n||typeof n!="object"||Array.isArray(n))throw new Error("Profile must be an object.");return he()?(await(await ke()).run(`INSERT INTO profile (profile_key, payload)
     VALUES (?, ?)
     ON CONFLICT(profile_key) DO UPDATE SET payload = excluded.payload`,["profile",JSON.stringify(n)]),n):(localStorage.setItem(Ja,JSON.stringify(n)),n)}var Bt,Ss,Oe,Ja,Ut,Ye,Je,Wt=te(()=>{ce();Ya();Bt="sahra_local",Ss=1,Oe=["events","tasks","moods","habits","goals","reminders","notes","habitLogs","expenses","subscriptions","assets","transactions","syncOutbox","syncIdMap","profileCache","goalAchievements"],Ja="sahra.local.profile",Ut="sahra.local.records.",Ye=new Ge(Wa),Je=null});var Qa={};xe(Qa,{LocalNotificationsWeb:()=>Yt});var Yt,Za=te(()=>{ce();Yt=class extends Z{constructor(){super(...arguments),this.pending=[],this.deliveredNotifications=[],this.hasNotificationSupport=()=>{if(!("Notification"in window)||!Notification.requestPermission)return!1;if(Notification.permission!=="granted")try{new Notification("")}catch(e){if(e instanceof Error&&e.name==="TypeError")return!1}return!0}}async getDeliveredNotifications(){let e=[];for(let a of this.deliveredNotifications){let s={title:a.title,id:parseInt(a.tag),body:a.body};e.push(s)}return{notifications:e}}async removeDeliveredNotifications(e){for(let a of e.notifications){let s=this.deliveredNotifications.find(i=>i.tag===String(a.id));s?.close(),this.deliveredNotifications=this.deliveredNotifications.filter(()=>!s)}}async removeDeliveredNotificationsById(e){for(let a of e.ids){let s=this.deliveredNotifications.find(i=>i.tag===String(a));s?.close(),this.deliveredNotifications=this.deliveredNotifications.filter(i=>i!==s)}}async removeAllDeliveredNotifications(){for(let e of this.deliveredNotifications)e.close();this.deliveredNotifications=[]}async getByIds(e){let a=e.ids.map(o=>String(o)),s=this.pending.filter(o=>a.includes(String(o.id))),i=this.deliveredNotifications.filter(o=>a.includes(o.tag)).map(o=>this.deliveredToSchema(o));return{notifications:[...s,...i]}}async getAll(e){let a=[...this.pending],s=this.deliveredNotifications.map(i=>this.deliveredToSchema(i));return e?.state==="SCHEDULED"?{notifications:a}:e?.state==="TRIGGERED"?{notifications:s}:{notifications:[...a,...s]}}deliveredToSchema(e){return{title:e.title,id:parseInt(e.tag),body:e.body}}async createChannel(){throw this.unimplemented("Not implemented on web.")}async deleteChannel(){throw this.unimplemented("Not implemented on web.")}async listChannels(){throw this.unimplemented("Not implemented on web.")}async schedule(e){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");for(let a of e.notifications)this.sendNotification(a);return{notifications:e.notifications.map(a=>({id:a.id}))}}async update(e){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");let a=[];for(let s of e.notifications){let i=this.pending.findIndex(o=>o.id===s.id);i!==-1&&(this.pending.splice(i,1),this.sendNotification(s),a.push(s))}return{notifications:a.map(s=>({id:s.id}))}}async getPending(){return{notifications:this.pending}}async cancelAll(){this.pending=[]}async registerActionTypes(){throw this.unimplemented("Not implemented on web.")}async cancel(e){this.pending=this.pending.filter(a=>!e.notifications.find(s=>s.id===a.id))}async areEnabled(){let{display:e}=await this.checkPermissions();return{value:e==="granted"}}async changeExactNotificationSetting(){throw this.unimplemented("Not implemented on web.")}async checkExactNotificationSetting(){throw this.unimplemented("Not implemented on web.")}async requestPermissions(){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");return{display:this.transformNotificationPermission(await Notification.requestPermission())}}async checkPermissions(){if(!this.hasNotificationSupport())throw this.unavailable("Notifications not supported in this browser.");return{display:this.transformNotificationPermission(Notification.permission)}}transformNotificationPermission(e){switch(e){case"granted":return"granted";case"denied":return"denied";default:return"prompt"}}sendPending(){var e;let a=[],s=new Date().getTime();for(let i of this.pending)!((e=i.schedule)===null||e===void 0)&&e.at&&i.schedule.at.getTime()<=s&&(this.buildNotification(i),a.push(i));this.pending=this.pending.filter(i=>!a.find(o=>o===i))}sendNotification(e){var a;if(!((a=e.schedule)===null||a===void 0)&&a.at){let s=e.schedule.at.getTime()-new Date().getTime();this.pending.push(e),setTimeout(()=>{this.sendPending()},s);return}this.buildNotification(e)}buildNotification(e){let a=new Notification(e.title,{body:e.body,tag:String(e.id)});return a.addEventListener("click",this.onClick.bind(this,e),!1),a.addEventListener("show",this.onShow.bind(this,e),!1),a.addEventListener("close",()=>{this.deliveredNotifications=this.deliveredNotifications.filter(()=>!this)},!1),this.deliveredNotifications.push(a),a}onClick(e){let a={actionId:"tap",notification:e};this.notifyListeners("localNotificationActionPerformed",a)}onShow(e){this.notifyListeners("localNotificationReceived",e)}}});var tn={};xe(tn,{Geolocation:()=>Rs,GeolocationWeb:()=>Ze});var Ze,Rs,an=te(()=>{ce();Ze=class extends Z{constructor(){if(super(),this.latestOrientation=null,typeof window<"u"){let e=window;"ondeviceorientationabsolute"in e?e.addEventListener("deviceorientationabsolute",a=>this.updateOrientation(a,!0),!0):"ondeviceorientation"in e&&e.addEventListener("deviceorientation",a=>this.updateOrientation(a,!1),!0)}}updateOrientation(e,a){let s=null,i=null,o=null;a&&e.alpha!==null?s=(360-e.alpha)%360:e.webkitCompassHeading!==void 0&&e.webkitCompassHeading!==null?(i=e.webkitCompassHeading,o=e.webkitCompassAccuracy):e.alpha!==null&&e.absolute===!0?s=(360-e.alpha)%360:e.alpha!==null&&(i=(360-e.alpha)%360),(s!==null||i!==null)&&(this.latestOrientation={trueHeading:s,magneticHeading:i,headingAccuracy:o})}augmentPosition(e,a=!1){var s,i,o,l,m,r,h;let g=e.coords,f=a?this.latestOrientation:null,w=(o=(i=(s=f?.trueHeading)!==null&&s!==void 0?s:f?.magneticHeading)!==null&&i!==void 0?i:a?g.heading:null)!==null&&o!==void 0?o:null;return{timestamp:e.timestamp,coords:{latitude:g.latitude,longitude:g.longitude,accuracy:g.accuracy,altitude:g.altitude,altitudeAccuracy:g.altitudeAccuracy,speed:g.speed,heading:w,magneticHeading:(l=f?.magneticHeading)!==null&&l!==void 0?l:null,trueHeading:(m=f?.trueHeading)!==null&&m!==void 0?m:null,headingAccuracy:(r=f?.headingAccuracy)!==null&&r!==void 0?r:null,course:(h=a?g.heading:null)!==null&&h!==void 0?h:null}}}async getCurrentPosition(e){return new Promise((a,s)=>{navigator.geolocation.getCurrentPosition(i=>{a(this.augmentPosition(i,!1))},i=>{s(i)},Object.assign({enableHighAccuracy:!1,timeout:1e4,maximumAge:0},e))})}async watchPosition(e,a){return`${navigator.geolocation.watchPosition(i=>{a(this.augmentPosition(i,!0))},i=>{a(null,i)},Object.assign({enableHighAccuracy:!1,timeout:1e4,maximumAge:0,minimumUpdateInterval:5e3},e))}`}async clearWatch(e){navigator.geolocation.clearWatch(parseInt(e.id,10))}async checkPermissions(){if(typeof navigator>"u"||!navigator.permissions)throw this.unavailable("Permissions API not available in this browser");let e=await navigator.permissions.query({name:"geolocation"});return{location:e.state,coarseLocation:e.state}}async requestPermissions(){throw this.unimplemented("Not implemented on web.")}},Rs=new Ze});var _s,Jt,qs,nn=te(()=>{_s="__capgo_keep_url_path_after_reload",Jt="__capgo_history_stack__",qs=typeof window<"u"&&typeof document<"u"&&typeof history<"u";if(qs){let n=window;if(!n.__capgoHistoryPatched){n.__capgoHistoryPatched=!0;let e=()=>{try{if(n.__capgoKeepUrlPathAfterReload)return!0}catch{}try{return window.localStorage.getItem(_s)==="1"}catch{return!1}},a=()=>{try{let x=window.sessionStorage.getItem(Jt);if(!x)return{stack:[],index:-1};let u=JSON.parse(x);return!u||!Array.isArray(u.stack)||typeof u.index!="number"?{stack:[],index:-1}:u}catch{return{stack:[],index:-1}}},s=(x,u)=>{try{window.sessionStorage.setItem(Jt,JSON.stringify({stack:x,index:u}))}catch{}},i=()=>{try{window.sessionStorage.removeItem(Jt)}catch{}},o=x=>{try{let u=x??window.location.href,p=new URL(u instanceof URL?u.toString():u,window.location.href);return`${p.pathname}${p.search}${p.hash}`}catch{return null}},l=(x,u)=>{if(x.length<=100)return{stack:x,index:u};let p=x.length-100,d=x.slice(p),y=Math.max(0,u-p);return{stack:d,index:y}},m=x=>{document.readyState==="complete"||document.readyState==="interactive"?x():window.addEventListener("DOMContentLoaded",x,{once:!0})},r=!1,h=!1,g=!1,f=()=>{if(!r)return;let x=a(),u=o();if(u){if(x.stack.length===0){x.stack.push(u),x.index=0,s(x.stack,x.index);return}(x.index<0||x.index>=x.stack.length)&&(x.index=x.stack.length-1),x.stack[x.index]!==u&&(x.stack[x.index]=u,s(x.stack,x.index))}},w=(x,u)=>{if(!r||h)return;let p=o(x);if(!p)return;let{stack:d,index:y}=a();d.length===0?(d.push(p),y=d.length-1):u?((y<0||y>=d.length)&&(y=d.length-1),d[y]=p):y>=d.length-1?(d.push(p),y=d.length-1):(d=d.slice(0,y+1),d.push(p),y=d.length-1),{stack:d,index:y}=l(d,y),s(d,y)},I=()=>{if(!r||h)return;let x=a();if(x.stack.length===0){f();return}let u=x.index>=0&&x.index<x.stack.length?x.index:x.stack.length-1,p=o();if(x.stack.length===1&&p===x.stack[0])return;let d=x.stack[0];if(!d)return;h=!0;try{history.replaceState(history.state,document.title,d);for(let k=1;k<x.stack.length;k+=1)history.pushState(history.state,document.title,x.stack[k])}catch{h=!1;return}h=!1;let y=x.stack.length-1,S=u-y;S!==0?history.go(S):(history.replaceState(history.state,document.title,x.stack[u]),window.dispatchEvent(new PopStateEvent("popstate")))},N=()=>{!r||g||(g=!0,m(()=>{g=!1,I()}))},D=null,v=null,C=()=>{if(!r||h)return;let x=o();if(!x)return;let u=a(),p=u.stack.lastIndexOf(x);p>=0?u.index=p:(u.stack.push(x),u.index=u.stack.length-1);let d=l(u.stack,u.index);s(d.stack,d.index)},F=()=>{D&&v||(D=history.pushState,v=history.replaceState,history.pushState=function(u,p,d){let y=D?.call(history,u,p,d);return w(d,!1),y},history.replaceState=function(u,p,d){let y=v?.call(history,u,p,d);return w(d,!0),y},window.addEventListener("popstate",C))},j=()=>{D&&(history.pushState=D,D=null),v&&(history.replaceState=v,v=null),window.removeEventListener("popstate",C)},L=x=>{if(r===x){r&&(f(),N());return}r=x,r?(F(),f(),N()):(j(),i())};window.addEventListener("CapacitorUpdaterKeepUrlPathAfterReload",x=>{var u;let p=x,d=(u=p?.detail)===null||u===void 0?void 0:u.enabled;typeof d=="boolean"?(n.__capgoKeepUrlPathAfterReload=d,L(d)):(n.__capgoKeepUrlPathAfterReload=!0,L(!0))}),L(e())}}});var tt,sn,on,Vt=te(()=>{(function(n){n[n.UNKNOWN=0]="UNKNOWN",n[n.UPDATE_NOT_AVAILABLE=1]="UPDATE_NOT_AVAILABLE",n[n.UPDATE_AVAILABLE=2]="UPDATE_AVAILABLE",n[n.UPDATE_IN_PROGRESS=3]="UPDATE_IN_PROGRESS"})(tt||(tt={}));(function(n){n[n.UNKNOWN=0]="UNKNOWN",n[n.PENDING=1]="PENDING",n[n.DOWNLOADING=2]="DOWNLOADING",n[n.INSTALLING=3]="INSTALLING",n[n.INSTALLED=4]="INSTALLED",n[n.FAILED=5]="FAILED",n[n.CANCELED=6]="CANCELED",n[n.DOWNLOADED=11]="DOWNLOADED"})(sn||(sn={}));(function(n){n[n.OK=0]="OK",n[n.CANCELED=1]="CANCELED",n[n.FAILED=2]="FAILED",n[n.NOT_AVAILABLE=3]="NOT_AVAILABLE",n[n.NOT_ALLOWED=4]="NOT_ALLOWED",n[n.INFO_MISSING=5]="INFO_MISSING"})(on||(on={}))});var rn={};xe(rn,{CapacitorUpdaterWeb:()=>Kt});var fe,Kt,cn=te(()=>{ce();Vt();fe={status:"success",version:"",downloaded:"1970-01-01T00:00:00.000Z",id:"builtin",checksum:""},Kt=class extends Z{async setStatsUrl(e){console.warn("Cannot setStatsUrl in web",e)}async setUpdateUrl(e){console.warn("Cannot setUpdateUrl in web",e)}async setChannelUrl(e){console.warn("Cannot setChannelUrl in web",e)}async download(e){return console.warn("Cannot download version in web",e),fe}async next(e){return console.warn("Cannot set next version in web",e),fe}async isAutoUpdateEnabled(){return console.warn("Cannot get isAutoUpdateEnabled in web"),{enabled:!1}}async set(e){console.warn("Cannot set active bundle in web",e)}async startPreviewSession(e){console.warn("Cannot start preview session in web",e)}async listPreviews(){return console.warn("Cannot list previews in web"),{previews:[],currentBundle:fe}}async setPreview(e){console.warn("Cannot set preview in web",e)}async resetPreview(){console.warn("Cannot reset preview in web")}async deletePreview(e){return console.warn("Cannot delete preview in web",e),{removed:!1,deleted:!1}}async checkPreviewUpdate(e){throw console.warn("Cannot check preview update in web",e),this.unimplemented("Preview updates are not available on web platform")}async updatePreview(e){throw console.warn("Cannot update preview in web",e),this.unimplemented("Preview updates are not available on web platform")}async getDeviceId(){return console.warn("Cannot get ID in web"),{deviceId:"default"}}async getBuiltinVersion(){return console.warn("Cannot get version in web"),{version:"default"}}async getPluginVersion(){return console.warn("Cannot get plugin version in web"),{version:"default"}}async delete(e){console.warn("Cannot delete bundle in web",e)}async setBundleError(e){return console.warn("Cannot setBundleError in web",e),fe}async list(){return console.warn("Cannot list bundles in web"),{bundles:[]}}async reset(e){console.warn("Cannot reset version in web",e)}async current(){return console.warn("Cannot get current bundle in web"),{bundle:fe,native:"0.0.0"}}async reload(){console.warn("Cannot reload current bundle in web")}async getLatest(){return console.warn("Cannot getLatest current bundle in web"),{version:"0.0.0",message:"Cannot getLatest current bundle in web"}}async triggerUpdateCheck(){return console.warn("Cannot triggerUpdateCheck in web"),{status:"unavailable",queued:!1}}async getMissingBundleFiles(e){var a,s,i;console.warn("Cannot inspect missing bundle files in web",{manifestLength:(s=(a=e.manifest)===null||a===void 0?void 0:a.length)!==null&&s!==void 0?s:0});let o=(i=e.manifest)!==null&&i!==void 0?i:[];return{missing:o,total:o.length,missingCount:o.length,reusableCount:0}}async getBundleDownloadSize(e){var a,s,i,o,l;return console.warn("Cannot estimate bundle download size in web",{manifestLength:(s=(a=e.manifest)===null||a===void 0?void 0:a.length)!==null&&s!==void 0?s:0}),{totalSize:0,knownFiles:0,unknownFiles:(o=(i=e.manifest)===null||i===void 0?void 0:i.length)!==null&&o!==void 0?o:0,files:((l=e.manifest)!==null&&l!==void 0?l:[]).map(m=>({file_name:m.file_name,file_hash:m.file_hash,download_url:m.download_url,error:"unavailable"}))}}async setChannel(e){return console.warn("Cannot setChannel in web",e),{status:"error",error:"Cannot setChannel in web"}}async unsetChannel(e){console.warn("Cannot unsetChannel in web",e)}async setCustomId(e){console.warn("Cannot setCustomId in web",e)}async getChannel(){return console.warn("Cannot getChannel in web"),{status:"error",error:"Cannot getChannel in web"}}async listChannels(){throw console.warn("Cannot listChannels in web"),{message:"Cannot listChannels in web",error:"platform_not_supported"}}async notifyAppReady(){return{bundle:fe}}async setMultiDelay(e){console.warn("Cannot setMultiDelay in web",e?.delayConditions)}async cancelDelay(){console.warn("Cannot cancelDelay in web")}async isAutoUpdateAvailable(){return console.warn("Cannot isAutoUpdateAvailable in web"),{available:!1}}async getCurrentBundle(){return console.warn("Cannot get current bundle in web"),fe}async getNextBundle(){return Promise.resolve(null)}async getFailedUpdate(){return console.warn("Cannot getFailedUpdate in web"),null}async setShakeMenu(e){throw this.unimplemented("Shake menu not available on web platform")}async isShakeMenuEnabled(){return Promise.resolve({enabled:!1,gesture:"shake"})}async setShakeChannelSelector(e){throw this.unimplemented("Shake channel selector not available on web platform")}async isShakeChannelSelectorEnabled(){return Promise.resolve({enabled:!1})}async getAppId(){return console.warn("Cannot getAppId in web"),{appId:"default"}}async setAppId(e){console.warn("Cannot setAppId in web",e)}async getAppUpdateInfo(e){return console.warn("getAppUpdateInfo is not available on web platform"),{currentVersionName:"0.0.0",currentVersionCode:"0",updateAvailability:tt.UNKNOWN}}async openAppStore(e){throw this.unimplemented("openAppStore is not available on web platform")}async performImmediateUpdate(){throw this.unimplemented("performImmediateUpdate is only available on Android")}async startFlexibleUpdate(){throw this.unimplemented("startFlexibleUpdate is only available on Android")}async completeFlexibleUpdate(){throw this.unimplemented("completeFlexibleUpdate is only available on Android")}}});var ln,dn=te(()=>{ce();nn();Vt();ln=se("CapacitorUpdater",{web:()=>Promise.resolve().then(()=>(cn(),rn)).then(n=>new n.CapacitorUpdaterWeb)})});var un={};xe(un,{markSahraOtaReady:()=>Fs});async function Fs(){if(!(Xt||!window.Capacitor?.isNativePlatform())){Xt=!0;try{await ln.notifyAppReady(),console.info("Sahra OTA: app marked ready.")}catch(n){Xt=!1,console.error("Sahra OTA: readiness notification failed.",n)}}}var Xt,pn=te(()=>{dn();Xt=!1});function is(n){return new Date(n.getTime()-n.getTimezoneOffset()*6e4).toISOString().slice(0,10)}function Y(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ze(n){if(!n)return"Not set";let e=String(n).match(/^(\d{1,2}):(\d{2})$/);if(!e)return Y(n);let a=Number(e[1]),s=e[2],i=a>=12?"PM":"AM";return`${a%12||12}:${s} ${i}`}function os(n){if(!n)return"Not set";let e=new Date(`${n}T00:00:00`);return Number.isNaN(e.getTime())?Y(n):e.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}function Mt(){return`
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
  `}function rs(n){let e=n.calendarDetail;if(!e)return"";let a=e.item||{},i=(e.type||"task")==="event",o=a.title||"Untitled",l=os(a.date),m=a.description?Y(a.description):"No description",r=a.category?Y(a.category):"General",h=i?"Scheduled":a.status||(a.completed?"Completed":"Pending"),g=String(h).toLowerCase().replace(/\s+/g,"-");return`
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
            ${Y(o)}
          </h3>


          <div class="calendar-detail-info">

            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                \u{1F4C5}
              </span>

              <div>
                <small>Date</small>
                <strong>${l}</strong>
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
                        ${ze(a.startTime)}
                        ${a.endTime?` - ${ze(a.endTime)}`:""}
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
                        ${a.time?ze(a.time):"No time set"}
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
                        ${Y(a.priority||"Normal")}
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
                  <span class="calendar-status-badge ${g}">
                    ${Y(h)}
                  </span>
                </strong>

              </div>

            </div>

          </div>


          <div class="calendar-detail-description">

            <h4>Description</h4>

            <p>
              ${m}
            </p>

          </div>

        </div>


        <div class="calendar-detail-footer">

          <button
            class="calendar-detail-delete"
            type="button"
            data-action="${i?"delete-calendar-event":"delete-calendar-task"}"
            data-${i?"event-id":"task-id"}="${Y(a.id||a._id||"")}"
          >
            ${Mt()}
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
  `}function Ia(n){let a=`
    ${["January","February","March","April","May","June","July","August","September","October","November","December"][n.currentMonth]}
    ${n.currentYear}
  `,s=new Date(`${n.selectedDate}T00:00:00`),o=(new Date(n.currentYear,n.currentMonth,1).getDay()+6)%7,l=new Date(n.currentYear,n.currentMonth+1,0).getDate(),m=new Date(n.currentYear,n.currentMonth,0).getDate(),r={"\u{1F60A}":"\u{1F60A}","\u{1F610}":"\u{1F610}","\u{1F622}":"\u{1F622}","\u{1F621}":"\u{1F621}","\u{1F634}":"\u{1F634}","\u{1F525}":"\u{1F525}","\u{1F60D}":"\u{1F60D}"},h=["\u{1F60A}","\u{1F610}","\u{1F622}","\u{1F621}","\u{1F634}","\u{1F525}","\u{1F60D}"],g={};n.data.moods.forEach(v=>{g[v.date]=v.mood});let f=n.data.events.filter(v=>v.date===n.selectedDate),w=n.data.tasks.filter(v=>v.date===n.selectedDate),I=n.data.moods.find(v=>v.date===n.selectedDate)?.mood||"\u{1F60A}",N=[];for(let v=0;v<o;v+=1)N.push({blank:!0,value:m-o+v+1});for(let v=1;v<=l;v+=1){let C=new Date(n.currentYear,n.currentMonth,v),F=is(C);N.push({blank:!1,value:v,iso:F,mood:g[F]||""})}for(;N.length%7!==0;)N.push({blank:!0,value:N.length-l-o+1});return`

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
            ${a}
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

          ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(v=>`
                <div class="calendar-weekday">
                  ${v}
                </div>
              `).join("")}


          ${N.map(v=>{let C=v.iso||"",F=C===n.selectedDate,j=C?n.data.events.filter(p=>p.date===C):[],L=C?n.data.tasks.filter(p=>p.date===C):[],x=C?n.data.moods.find(p=>p.date===C)?.mood:null,u=[];return j.length&&u.push('<span class="mini-indicator event"></span>'),L.length&&u.push('<span class="mini-indicator task"></span>'),x&&u.push('<span class="mini-indicator mood"></span>'),`

                <button

                  class="
                    calendar-day
                    ${v.blank?"dim":""}
                    ${F?"selected":""}
                  "

                  type="button"

                  data-date="${C}"

                  ${v.blank?"disabled":""}

                >

                  <span>
                    ${v.value}
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

                    ${h.map(v=>`

                          <button
                            type="button"
                            class="
                              mood-picker-emoji
                              ${I===v?"selected":""}
                            "
                            data-mood-value="${v}"
                            aria-label="Choose mood ${v}"
                          >
                            ${v}
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


          ${f.length?f.map(v=>{let C=v.id||v._id;return`

                      <div
                        class="calendar-entry-row event-row"
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-event"
                        data-event-id="${Y(C||"")}"
                      >

                        <span class="calendar-entry-time">
                          ${ze(v.startTime)}
                        </span>


                        <strong class="calendar-entry-title">
                          ${Y(v.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-event"
                          data-event-id="${Y(C||"")}"
                          aria-label="Delete event"
                          title="Delete event"
                        >
                          ${Mt()}
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


          ${w.length?w.map(v=>{let C=v.id||v._id,F=v.completed||v.status==="Completed";return`

                      <div
                        class="
                          calendar-entry-row
                          task-row
                          ${F?"completed-row":""}
                        "
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-task"
                        data-task-id="${Y(C||"")}"
                      >

                        <span class="calendar-entry-time">
                          ${Y(v.status||(F?"Completed":"Pending"))}
                        </span>


                        <strong class="calendar-entry-title">
                          ${Y(v.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-task"
                          data-task-id="${Y(C||"")}"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          ${Mt()}
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

      ${rs(n)}

    </section>

  `}function Pa(n){let e=["\u{1F60A}","\u{1F610}","\u{1F622}","\u{1F621}","\u{1F634}","\u{1F525}","\u{1F60D}"],a=e.reduce((s,i)=>(s[i]=n.data.moods.filter(o=>o.mood===i).length,s),{});return`
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
                <small>${a[s]||0} days</small>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `}function La(n){let e=n.data.tasks||[],a=n.todoFilter||"All",s=new Date(new Date().getTime()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10),o=e.map(r=>({...r,id:r.id||r._id,status:r.status||(r.completed?"Completed":"Pending"),priority:r.priority||"Normal",title:r.title||"Untitled task",date:r.date||s,time:r.time||null})).filter(r=>{let h=r.status==="Completed"||r.completed;return a==="Pending"?!h:a==="Completed"?h:a==="Today"?r.date===s:!0}),l=["All","Pending","Completed","Today"],m=o.length?o.map(r=>{let h=r.status==="Completed"||r.completed,g=(r.priority||"Normal").toLowerCase(),f=r.date?new Date(`${r.date}T00:00:00`).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"No date",w=r.time?new Date(`2000-01-01T${r.time}`).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}):"All day";return`
          <div class="todo-item ${h?"completed":""}">
            <button class="todo-check ${h?"checked":""}" type="button" data-action="toggle-task" data-task-id="${r.id}">${h?"\u2713":""}</button>

            <div class="todo-content">
              <div class="todo-title-row">
                <h4 class="${h?"done":""}">${r.title}</h4>
                <div class="todo-actions">
                  <button class="icon-btn" type="button" data-action="edit-task" data-task-id="${r.id}" aria-label="Edit task">\u270E</button>
                  <button class="icon-btn" type="button" data-action="delete-task" data-task-id="${r.id}" aria-label="Delete task">\u{1F5D1}</button>
                </div>
              </div>

              <div class="todo-meta">
                <span>\u{1F4C5} ${f}</span>
                <span>\u2022</span>
                <span>${w}</span>
              </div>

              <div class="priority-badge ${g}">${r.priority||"Normal"}</div>
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
        ${l.map(r=>`<button class="filter-btn ${a===r?"active":""}" type="button" data-task-filter="${r}">${r==="All"?"\u{1F4CB}":r==="Pending"?"\u25EF":r==="Completed"?"\u2713":"\u{1F5D3}\uFE0F"} ${r==="All"?"All":r==="Pending"?"Pending":r==="Completed"?"Completed":"Today"}</button>`).join("")}
      </div>

      <div class="task-create-action">
        <button class="task-create-button" type="button" data-action="open-add-entry" data-type="task" aria-label="Add new task">+</button>
      </div>

      <div class="todo-list">
        ${m}
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
  `}function Oa(n){return`
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
          ${n.data.habits.map(e=>{let a=Math.min(100,e.progress/e.goal*100);return`
              <div class="progress-row">
                <div class="progress-label">
                  <span>${e.name}</span>
                  <strong>${e.progress}/${e.goal}</strong>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${a}%"></div>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    </section>
  `}function Ma(n){return`
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
  `}function He(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Ra(n={}){let e=Array.isArray(n.assistantMessages)&&n.assistantMessages.length?n.assistantMessages:[{role:"assistant",text:"I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress."}],a=n.assistantLoading?"disabled":"",s=String(n.user?.name||"Sahra").match(/[A-Za-z]/)?.[0]?.toUpperCase()||"S";return`
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
                <div class="assistant-system-note">${He(i.text)}</div>
              </div>
            `:`
            <div class="chat-row ${o?"user-row":"assistant-row"}">
              ${o?"":'<div class="chat-avatar bot-avatar">\u{1F916}</div>'}
              <div class="message-bubble ${o?"user-bubble":"assistant-bubble"}">${He(i.text)}</div>
              ${o?`<div class="chat-avatar user-avatar" aria-label="Your profile">${s}</div>`:""}
            </div>
            ${!o&&i.retryRequestId?`<div class="chat-row assistant-row"><div class="chat-avatar bot-avatar">\u{1F916}</div><button class="link-btn" type="button" data-assistant-retry="${He(i.retryRequestId)}" data-retry-message="${He(i.retryMessage||"")}" ${a}>Retry request</button></div>`:""}
          `}).join("")}

        ${n.assistantLoading?'<div class="message-time">Sahra is thinking...</div>':""}
        <div class="assistant-scroll-anchor" aria-hidden="true"></div>
      </div>

      <div class="assistant-composer assistant-fixed-composer">
        <!-- Replace your old mic emoji/icon with this -->
    <button type="button" data-action="toggle-mic" style="background: transparent; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;">
    <img src="mic.png" alt="Mic" class="mic-icon" id="chat-mic-img" style="width: 45px; height: 45px; object-fit: contain;">
    </button>
        <input class="assistant-input" type="text" placeholder="Type a message or speak..." aria-label="Type a message" ${a} />
        <button class="composer-send" type="button" aria-label="Send message" ${a}>\u27A4</button>
      </div>
    </section>
  `}function Rt(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function _a(n){let e=n?.data?.assets&&n.data.assets.length>0?n.data.assets:n?.data?.notes||[],a=(n.noteSearchQuery||"").toLowerCase(),s=e.filter(o=>{let l=(o.title||"").toLowerCase(),m=(o.content||o.description||"").toLowerCase();return l.includes(a)||m.includes(a)}),i=["note-yellow","note-blue","note-pink","note-green","note-purple","note-orange"];return`
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
        <input type="text" data-action="notepad-search-input" value="${Rt(n.noteSearchQuery||"")}" placeholder="Search notes..." style="width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(122, 180, 255, 0.3); outline: none; font-size: 1rem; color: #1e293b; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.15); box-sizing: border-box;" />
      </div>

      <!-- Notes Grid -->
      <div class="notepad-notes">
        ${s.length===0?'<div style="text-align:center; color:rgba(255,255,255,0.4); padding: 40px 0;">No notes found.</div>':""}
        ${s.map((o,l)=>{let m=o.createdAt?new Date(o.createdAt):new Date,r=[String(m.getDate()).padStart(2,"0"),String(m.getMonth()+1).padStart(2,"0"),m.getFullYear()].join("/"),h=o.id||o._id;return`
            <div class="${i[l%i.length]}" style="border-radius: 16px; padding: 20px; position: relative;">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; padding-right: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${Rt(o.title||"Untitled")}
                </h3>
                
                <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                  <button data-action="edit-note" data-note-id="${h}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">\u270F\uFE0F</button>
                  <button data-action="delete-note" data-note-id="${h}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.6); border: none; cursor: pointer; display: grid; place-items: center; font-size: 14px;">\u{1F5D1}\uFE0F</button>
                </div>
              </div>
              
              <p style="font-size: 0.95rem; margin: 0 0 16px 0; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${Rt(o.content||o.description||"")}</p>
              
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
  `}function cs(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function qa(n){let e=n.financeView||"dashboard",a=n.financeData||[],s=(n.financeSearchQuery||"").toLowerCase(),i=n.financeTypeFilter||"all";a.filter(r=>{let h=(r.category||r.title||"").toLowerCase().includes(s),g=String(r.amount||"").includes(s),f=i==="all"||r.type===i;return(h||g)&&f}).sort((r,h)=>new Date(h.date)-new Date(r.date));let l=`
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
`,m="";return e==="add-choice"?m=us(n):e==="add-expense"?m=ps(n):e==="transactions"?m=ds(a,n):m=ls(a,n),n.financeDetail&&(m+=ms(n.financeDetail)),n.showFinanceResetConfirm&&(m+=gs(n)),m}function ls(n,e){let a=e.financeFilter||"week",s=new Date;s.setHours(0,0,0,0);let i=n.filter(N=>{let D=new Date(N.date||Date.now());if(D.setHours(0,0,0,0),a==="week"){let v=(s-D)/864e5;return v>=0&&v<7}return a==="month"?D.getMonth()===s.getMonth()&&D.getFullYear()===s.getFullYear():a==="year"?D.getFullYear()===s.getFullYear():!0}),o=0,l=0;i.forEach(N=>{let D=Number(N.amount)||0;N.type==="income"&&(o+=D),N.type==="expense"&&(l+=D)});let m=o-l,r=a==="week"?"Weekly Breakdown":a==="month"?"Monthly Breakdown":"Yearly Breakdown",h=o+l,g=0,f=0,w=0;h>0&&(g=o/h*360,f=Math.round(o/h*100),w=Math.round(l/h*100));let I=h>0?`conic-gradient(#34d399 0deg ${g}deg, #f87171 ${g}deg 360deg)`:"rgba(255,255,255,0.05)";return`
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
          \u20B9${m.toFixed(2)}
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
              \u20B9${l.toFixed(2)}
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
          class="${a==="week"?"active":""}"
          data-action="set-finance-filter"
          data-filter="week"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${a==="week"?"linear-gradient(135deg, #3b82f6, #1d4ed8)":"transparent"};
            color:
              ${a==="week"?"white":"#8b92a5"};
            border:
              ${a==="week"?"1px solid rgba(255,255,255,0.3)":"none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${a==="week"?"0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)":"none"};
            transition: all 0.2s;
          "
        >
          Week
        </button>

        <button
          class="${a==="month"?"active":""}"
          data-action="set-finance-filter"
          data-filter="month"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${a==="month"?"linear-gradient(135deg, #3b82f6, #1d4ed8)":"transparent"};
            color:
              ${a==="month"?"white":"#8b92a5"};
            border:
              ${a==="month"?"1px solid rgba(255,255,255,0.3)":"none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${a==="month"?"0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)":"none"};
            transition: all 0.2s;
          "
        >
          Month
        </button>

        <button
          class="${a==="year"?"active":""}"
          data-action="set-finance-filter"
          data-filter="year"
          style="
            flex: 1;
            padding: 12px 0;
            border-radius: 18px;
            background:
              ${a==="year"?"linear-gradient(135deg, #3b82f6, #1d4ed8)":"transparent"};
            color:
              ${a==="year"?"white":"#8b92a5"};
            border:
              ${a==="year"?"1px solid rgba(255,255,255,0.3)":"none"};
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow:
              ${a==="year"?"0 6px 16px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.4)":"none"};
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
                \u20B9${l.toFixed(2)}
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
              ${w}%
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
  `}function ds(n,e){let a=Array.isArray(n)?[...n]:[];if(a.sort((l,m)=>new Date(m.date||0)-new Date(l.date||0)),a.length===0)return`
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
    `;let s={};return a.forEach(l=>{let m=new Date(l.date);if(Number.isNaN(m.getTime()))return;let r=m.getFullYear(),h=m.getMonth(),g=`${r}-${String(h+1).padStart(2,"0")}`;s[g]||(s[g]={year:r,month:h,transactions:[]}),s[g].transactions.push(l)}),`
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
      ${Object.values(s).sort((l,m)=>l.year!==m.year?m.year-l.year:m.month-l.month).map(l=>{let m=new Date(l.year,l.month,1).toLocaleDateString("en-IN",{month:"long"}),r=l.transactions.sort((h,g)=>new Date(g.date||0)-new Date(h.date||0)).map(h=>{let g=h.type==="expense",f=g?"-":"+",w=g?"#ff8f9c":"#63e6b1",I=h._id||h.id,N=cs(h.category||h.title||"Transaction"),v=new Date(h.date).toLocaleDateString("en-IN");return`
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
                  ${N}
                </div>

                <div
                  style="
                    margin-top: 4px;
                    color: #8b92a5;
                    font-size: 0.82rem;
                  "
                >
                  ${v}
                </div>

              </div>

            </div>

            <!-- AMOUNT -->
            <div
              style="
                color: ${w};
                font-size: 1.05rem;
                font-weight: 800;
                white-space: nowrap;
                flex-shrink: 0;
              "
            >
              ${f}\u20B9${Math.abs(Number(h.amount)||0).toFixed(2)}
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
            ${l.year}
          </div>

          <div class="finance-month-name"
            style="
              color: #f2f3f5;
              font-size: 1.75rem;
              font-weight: 500;
              line-height: 1.1;
            "
          >
            ${m}
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
  `}function us(n){return`
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
  `}function ps(n){let e=n.tempFinanceType||"expense",a=e==="income";return`
    <div class="finance-entry-page" style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 130px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; display: flex; flex-direction: column; box-sizing: border-box;">
      
      <!-- Top Bar -->
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <button data-action="set-finance-view" data-view="add-choice" style="background: linear-gradient(135deg, #222634, #14161c); border: 1px solid rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.25); width: 42px; height: 42px; border-radius: 14px; color: white; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; margin-right: 16px; box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);">\u2190</button>
        <h1 style="font-size: 1.3rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Add ${a?"Income":"Expense"} Details</h1>
      </div>

      <!-- Amount Input Card -->
      <div class="finance-amount-card" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.25); border-radius: 24px; padding: 24px; text-align: center; margin-bottom: 24px; box-shadow: 0 16px 35px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15);">
        <div style="color: #8b92a5; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 8px;">ENTER AMOUNT</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span style="font-size: 2.2rem; font-weight: 700; color: ${a?"#34d399":"#60a5ff"}; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">\u20B9</span>
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
              ${a?`
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
      <button data-action="save-finance-transaction" data-type="${e}" style="width: 100%; padding: 18px; border-radius: 100px; background: ${a?"linear-gradient(135deg, #34d399, #059669)":"linear-gradient(135deg, #60a5ff, #2563eb)"}; color: white; border: none; border-top: 1px solid rgba(255,255,255,0.5); font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 12px 30px ${a?"rgba(5, 150, 105, 0.5)":"rgba(37, 99, 235, 0.5)"}, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Save Transaction
      </button>

    </div>
  `}function ms(n){if(!n)return"";let e=n.type==="expense",a=e?"-":"+",s=n._id||n.id,o=new Date(n.date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),l=n.note?String(n.note).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):"No description provided";return`
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
                    ${n.category||"Transaction"} <span class="finance-transaction-detail-amount ${e?"expense":"income"}" style="color: ${e?"#fca5a5":"#6ee7b7"}; font-size: 1.4rem; margin-left: 8px;">${a}\u20B9${Math.abs(n.amount).toFixed(2)}</span>
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
                        ${l}
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
    `}function gs(n){return`
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
    `}Wt();var Is=new Set(["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","transactions","expenses","subscriptions","goalAchievements"]);function Ps(n){try{let e=String(n||"").split(".")[1];if(!e)return null;let a=e.replace(/-/g,"+").replace(/_/g,"/"),s=JSON.parse(atob(a.padEnd(Math.ceil(a.length/4)*4,"="))),i=s.id||s.sub||s.userId;return i?String(i):null}catch{return null}}function Xe(){return globalThis.crypto?.randomUUID?.()||`local-${Date.now()}-${Math.random().toString(36).slice(2)}`}function Ls(n){return String(n||"").split("?")[0].replace(/^\/+/,"")}function Ka(n,e={}){let a=Ls(n).replace(/^api\//,""),[s]=a.split("/"),o={events:"events",tasks:"tasks",moods:"moods",habits:"habits",goals:"goals",reminders:"reminders",notes:"notes","habit-logs":"habitLogs",assets:"assets","goal-achievements":"goalAchievements",transactions:"transactions",expenses:"transactions",subscriptions:"transactions"}[s];return o?{collection:o,root:s,id:a.split("/")[1]||null}:null}function Ke(n){return!n||typeof n!="object"?null:{...n,id:String(n.id||n._id||Xe())}}var Qe=class{constructor({getToken:e,fetchImpl:a=(...o)=>fetch(...o),baseUrl:s=()=>"",storage:i=null}){this.getToken=e,this.fetchImpl=a,this.baseUrl=s,this.storage=i,this.storagePromise=null,this.flushing=!1}async db(){return this.storage?this.storage:(this.storagePromise||(this.storagePromise=Promise.resolve().then(()=>(Wt(),Va))),this.storagePromise)}async scoped(e,a){return(await this.db()).accountCollection(e,a)}async getNamed(e){return(await this.db()).getCollection(e)}async saveNamed(e,a){return(await this.db()).saveRecord(e,a)}async deleteNamed(e,a){return(await this.db()).deleteRecord(e,a)}async accountId(e){let a=Ps(e);if(!a)throw new Error("The signed-in token does not contain an account ID; offline cache is disabled for safety.");return a}async collectionName(e,a){return this.scoped(await this.accountId(e),a)}async read(e,a){return this.getNamed(await this.collectionName(e,a))}async write(e,a,s){return this.saveNamed(await this.collectionName(e,a),Ke(s))}async remove(e,a,s){return this.deleteNamed(await this.collectionName(e,a),String(s))}async cacheDashboard(e,a){let s=await this.accountId(e),i=a?.data||{};for(let o of["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","goalAchievements"]){let l=await this.scoped(s,o),m=Array.isArray(i[o])?i[o]:[];if(!(await this.read(e,"syncOutbox")).some(g=>g.collection===o)){for(let g of await this.getNamed(l))await this.deleteNamed(l,g.id??g._id);for(let g of m)await this.saveNamed(l,Ke(g))}}await this.write(e,"profileCache",{id:"dashboard",payload:{user:a?.user||null}}).catch(()=>{})}async cacheSuccessfulMutation(e,a,s={},i={}){let o=String(s.method||"GET").toUpperCase();if(!["POST","PUT","PATCH","DELETE"].includes(o))return;let l=Ka(a,s.body?JSON.parse(s.body):{});if(!l)return;let m=s.body?JSON.parse(s.body):{},r=i.event||i.task||i.mood||i.habit||i.goal||i.goalAchievement||i.reminder||i.asset||i.transaction||i.note;if(o==="DELETE"){let g=await this.accountId(e),f=await this.scoped(g,l.collection);if(l.id)await this.deleteNamed(f,l.id);else for(let w of await this.getNamed(f))await this.deleteNamed(f,w.id||w._id);return}let h=Ke(r||m);h&&await this.write(e,l.collection,{...h,_offlinePending:!1})}async cacheTransactions(e,a){if((await this.read(e,"syncOutbox")).some(o=>o.collection==="transactions"))return;let i=await this.read(e,"transactions");for(let o of i)await this.remove(e,"transactions",o.id??o._id);for(let o of Array.isArray(a)?a:[])await this.write(e,"transactions",o)}async dashboardFallback(e){let[a,...s]=await Promise.all([this.read(e,"profileCache"),...["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","goalAchievements"].map(l=>this.read(e,l))]),o=Object.fromEntries(["events","tasks","moods","habits","goals","reminders","notes","habitLogs","assets","goalAchievements"].map((l,m)=>[l,s[m]]));return{user:a.find(l=>l.id==="dashboard")?.payload?.user||null,data:o,offline:!0}}async transactionFallback(e){return this.read(e,"transactions")}async enqueueAndApply(e,a,s={}){let i=String(s.method||"GET").toUpperCase(),o=Ka(a,s.body?JSON.parse(s.body):{});if(!o||!Is.has(o.collection))throw new Error("This action is not supported offline. Reconnect and try again.");let l=await this.accountId(e),m=s.body?JSON.parse(s.body):{},r=await this.scoped(l,o.collection),h=await this.scoped(l,"syncOutbox"),g=await this.getNamed(r),f=o.id,w=s.idempotencyKey||Xe(),I=f,N=null;if(i==="POST"){if(I=Xe(),N=Ke({...m,id:I,_offlinePending:!0,updatedAt:new Date().toISOString()}),o.collection==="transactions"&&(N.type=m.type||"expense",N.date=m.date||new Date().toISOString().slice(0,10)),o.collection==="moods"){let v=g.find(C=>C.date===m.date);v&&(I=v.id,N={...v,...m,id:I,_offlinePending:!0,updatedAt:new Date().toISOString()})}await this.saveNamed(r,N)}else if(i==="PUT"||i==="PATCH"){let v=g.find(C=>String(C.id||C._id)===String(f));if(!v&&o.collection!=="goalAchievements")throw new Error("Cannot edit this item offline because it is not in the local cache. Reconnect and retry.");N={...v,...m,id:String(f),_offlinePending:!0,updatedAt:new Date().toISOString()},await this.saveNamed(r,N)}else if(i==="DELETE")if(f)await this.deleteNamed(r,f);else for(let v of g)await this.deleteNamed(r,v.id||v._id);else throw new Error("Unsupported offline operation.");let D={id:Xe(),idempotencyKey:w,accountId:l,path:String(a),method:i,body:m,collection:o.collection,localId:I,serverId:i==="POST"?null:f,createdAt:new Date().toISOString(),attempts:0,status:"pending"};return await this.saveNamed(h,D),i==="DELETE"?{message:"Deleted locally; will sync when online.",offline:!0}:{message:"Saved on this device; will sync when online.",offline:!0,[o.collection==="transactions"?"transaction":o.collection.slice(0,-1)]:N,id:I}}async flush(e){if(this.flushing||!e||!globalThis.navigator?.onLine)return{synced:0,pending:!0};this.flushing=!0;let a=0,s=Date.now()+7e3;try{let i=await this.accountId(e),o=await this.scoped(i,"syncOutbox"),l=await this.scoped(i,"syncIdMap"),m=(await this.getNamed(o)).sort((g,f)=>String(g.createdAt).localeCompare(String(f.createdAt))),r=await this.getNamed(l),h=new Map(r.map(g=>[String(g.localId),String(g.serverId)]));for(let g of m){if(Date.now()>=s)break;let f=g.path;for(let[C,F]of h)f=f.replace(`/${C}`,`/${F}`);let w,I=null,N=typeof AbortController<"u"?new AbortController:null;try{let C=Math.max(1,s-Date.now());N&&(I=setTimeout(()=>N.abort(),Math.min(4500,C))),w=await this.fetchImpl(`${this.baseUrl()}${f}`,{method:g.method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`,"Idempotency-Key":g.idempotencyKey},...N?{signal:N.signal}:{},...g.method==="GET"||g.method==="HEAD"?{}:{body:JSON.stringify(g.body||{})}})}catch(C){console.warn("[OfflineSync] Network request failed:",C?.name||"Error",C?.message||"Unknown network error");break}finally{I!==null&&clearTimeout(I)}let D=await w.json().catch(()=>({}));if(!w.ok){g.attempts=Number(g.attempts||0)+1,g.lastError=D.message||`HTTP ${w.status}`,console.warn("[OfflineSync] Server rejected queued operation:",w.status,g.method,g.path),await this.saveNamed(o,g);break}let v=D.event||D.task||D.mood||D.habit||D.goal||D.goalAchievement||D.reminder||D.asset||D.transaction||D.note;if(g.method==="POST"&&v?.id&&g.localId){let C=await this.scoped(i,g.collection),j=(await this.getNamed(C)).find(L=>String(L.id)===String(g.localId));j&&(await this.deleteNamed(C,g.localId),await this.saveNamed(C,{...j,...v,id:String(v.id),_offlinePending:!1})),await this.saveNamed(l,{id:g.localId,localId:String(g.localId),serverId:String(v.id)}),h.set(String(g.localId),String(v.id))}else if(["PUT","PATCH"].includes(g.method)&&v?.id){let C=await this.scoped(i,g.collection);await this.saveNamed(C,{...v,id:String(v.id),_offlinePending:!1})}await this.deleteNamed(o,g.id),a+=1}return{synced:a,pending:(await this.getNamed(o)).length>0}}finally{this.flushing=!1}}async handleNetworkFailure(e,a,s,i){if(!globalThis.navigator?.onLine||i instanceof TypeError||i?.name==="TypeError")return this.enqueueAndApply(e,a,s);throw i}};ce();var Xa;(function(n){n[n.Sunday=1]="Sunday",n[n.Monday=2]="Monday",n[n.Tuesday=3]="Tuesday",n[n.Wednesday=4]="Wednesday",n[n.Thursday=5]="Thursday",n[n.Friday=6]="Friday",n[n.Saturday=7]="Saturday"})(Xa||(Xa={}));var J=se("LocalNotifications",{web:()=>Promise.resolve().then(()=>(Za(),Qa)).then(n=>new n.LocalNotificationsWeb)});ce();function Os(n){n.CapacitorUtils.Synapse=new Proxy({},{get(e,a){return new Proxy({},{get(s,i){return(o,l,m)=>{let r=n.Capacitor.Plugins[a];if(r===void 0){m(new Error(`Capacitor plugin ${a} not found`));return}if(typeof r[i]!="function"){m(new Error(`Method ${i} not found in Capacitor plugin ${a}`));return}(async()=>{try{let h=await r[i](o);l(h)}catch(h){m(h)}})()}}})}})}function Ms(n){n.CapacitorUtils.Synapse=new Proxy({},{get(e,a){return n.cordova.plugins[a]}})}function en(n=!1){typeof window>"u"||(window.CapacitorUtils=window.CapacitorUtils||{},window.Capacitor!==void 0&&!n?Os(window):window.cordova!==void 0&&Ms(window))}var et=se("Geolocation",{web:()=>Promise.resolve().then(()=>(an(),tn)).then(n=>new n.GeolocationWeb)});en();var ot={events:[],tasks:[],moods:[],habits:[],goals:[],reminders:[],notes:[],habitLogs:[],goalAchievements:[],expenses:[],subscriptions:[],assets:[]},mn=!1,gn=!1,hn=!1,fn=null;window.SAHRA_APP_READY=!1;function U(n){return new Date(n.getTime()-n.getTimezoneOffset()*6e4).toISOString().slice(0,10)}function P(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ea(n=""){return P(n)}function V(n){if(!n)return"";let e=String(n).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(e))return e;let a=new Date(n);return Number.isNaN(a.getTime())?"":U(a)}function js(n=""){return String(n).replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&amp;/gi,"&").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().toLocaleLowerCase("en")}function $e(n){let e=n?.title??n?.name??n?.text??"";return js(e)==="tytyty"}function Me(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)}function yn(n){if(!n)return"This month";let e=new Date(`${String(n).slice(0,10)}T00:00:00`);return Number.isNaN(e.getTime())?String(n):e.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}function Bs(n){let e=new Date(n);if(Number.isNaN(e.getTime()))return"This month";let a=Date.now()-e.getTime();return a>=0&&a<3600*1e3?`${Math.max(1,Math.floor(a/6e4))} min ago`:a>=0&&a<1440*60*1e3?`${Math.floor(a/36e5)} hours ago`:e.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}var Pn=new URLSearchParams(window.location.search).get("date"),bn=/^\d{4}-\d{2}-\d{2}$/.test(Pn||""),t={view:bn?"calendar":"home",currentMonth:new Date().getMonth(),currentYear:new Date().getFullYear(),selectedDate:bn?Pn:U(new Date),authenticated:!1,localDatabaseReady:!1,data:{...ot},user:JSON.parse(localStorage.getItem("sahraUser")||"null")||{name:"DaySync User"},themePreference:["system","light","dark"].includes(localStorage.getItem("themePreference"))?localStorage.getItem("themePreference"):"system",theme:(()=>{let n=localStorage.getItem("themePreference");return n==="light"||n==="dark"?n:window.matchMedia?.("(prefers-color-scheme: light)").matches?"light":"dark"})(),goalAchievementItems:[],goalAchievementFilter:"All",goalAchievementEditingId:null,focusSeconds:1500,focusInitialSeconds:1500,focusRunning:!1,focusStartedAt:null,focusEndsAt:null,focusAlarmActive:!1,focusAlarmStartedAt:null,focusSessionId:null,focusLastCompletedId:null,focusSessions:JSON.parse(localStorage.getItem("sahraFocusSessions")||"[]"),focusStatsData:null,focusLabel:"Study session",menuOpen:!1,profileEditing:!1,profileDraft:null,moreMenuOpen:!1,entryModalOpen:!1,notepadSearchOpen:!1,noteSearchQuery:"",entryDraft:null,todoFilter:"All",moodPickerOpen:!1,navigationHistory:[],assistantMessages:[{role:"assistant",text:"I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress."}],assistantLoading:!1,assistantForceScroll:!1,assistantGeneration:0,assistantDraft:"",voiceListening:!1,progressPickerOpen:!1,progressData:null,progressLoading:!1,showAllActivity:!1,calendarCache:new Set,financeView:"dashboard",financeData:[],financeFilter:"week",financeSearchQuery:"",financeTypeFilter:"all",financeDetail:null,showFinanceResetConfirm:!1,financeResetLoading:!1,tempFinanceType:null,resetOptionsSelected:{tasks:!1,notepad:!1,expenses:!1,calendar:!1,progress:!1,goalAchievements:!1,focus:!1},resetConfirmOpen:!1,resetOptionsBusy:!1,settingsInfoPanel:"",weather:{status:"idle",data:null,locationLabel:"",error:"",updatedAt:null,requestId:0}};t.goalAchievementItems=de();var vn=null,z=new Qe({getToken:me,baseUrl:()=>String(window.SAHRA_API_BASE_URL||"").replace(/\/+$/,"")});function mt(n="system",e={}){let a=["system","light","dark"].includes(n)?n:"system",s=a==="system",i=!!window.matchMedia?.("(prefers-color-scheme: light)").matches,o=s?i?"light":"dark":a;t.themePreference=a,t.theme=o,document.documentElement.setAttribute("data-theme",o),document.documentElement.style.colorScheme=o,document.body.setAttribute("data-theme",o),document.body.style.colorScheme=o,document.body.classList.toggle("theme-light",o==="light"),document.body.classList.toggle("theme-dark",o==="dark"),localStorage.setItem("theme",o),e.persistPreference!==!1&&localStorage.setItem("themePreference",a);let l=document.querySelector('meta[name="theme-color"]');l&&l.setAttribute("content",o==="light"?"#f8faff":"#071126"),window.dispatchEvent(new CustomEvent("daysync:theme-changed",{detail:{theme:o,preference:a,followsSystem:s}}))}function E(n){let e=document.querySelector(".app-toast");e&&e.remove();let a=document.createElement("div");a.className="app-toast",a.textContent=n,document.body.appendChild(a),setTimeout(()=>a.classList.add("show"),10),setTimeout(()=>{a.classList.remove("show"),setTimeout(()=>a.remove(),300)},3e3)}window.alert=function(n){E(n)};function Re(n,e,a="Delete"){let s=document.createElement("div");s.className="sahra-confirm-overlay",s.style.cssText="position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px);";let i=document.createElement("div");i.className="sahra-confirm-box",i.style.cssText="background:var(--panel-bg, #1a1a2e); padding:24px; border-radius:16px; width:80%; max-width:320px; text-align:center; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5);";let o=document.createElement("p");o.className="sahra-confirm-message",o.textContent=n,o.style.cssText="color:white; margin-bottom:24px; font-size:1.05rem; font-weight: 500;";let l=document.createElement("div");l.style.cssText="display:flex; gap:12px; justify-content:center;";let m=document.createElement("button");m.textContent="Cancel",m.type="button",m.className="secondary-btn sahra-confirm-cancel",m.style.flex="1";let r=document.createElement("button");r.textContent=a,r.className="primary-btn compact-btn",r.classList.add("sahra-confirm-submit"),r.style.cssText="flex: 1; background: #ff4757; color: white; border: none; font-weight: bold;";let h=!1;m.onclick=()=>s.remove(),r.onclick=async()=>{h||(h=!0,r.disabled=!0,r.textContent=`${a}\u2026`,r.style.opacity="0.6",r.style.pointerEvents="none",s.remove(),await e())},l.append(m,r),i.append(o,l),s.append(i),document.body.appendChild(s)}function Ln(){let n=localStorage.getItem("themePreference");return["system","light","dark"].includes(n)?n:"system"}function Us(){let n=window.matchMedia?.("(prefers-color-scheme: light)");if(!n||window.__daysyncSystemThemeListenerBound)return;let e=()=>{t.themePreference==="system"&&mt("system",{persistPreference:!1})};typeof n.addEventListener=="function"?n.addEventListener("change",e):typeof n.addListener=="function"&&n.addListener(e),window.__daysyncSystemThemeListenerBound=!0}function gt(){return window.SAHRA_IS_NATIVE?"/login.html":"/login"}function zs(n){let e=String(window.SAHRA_API_BASE_URL||"").replace(/\/+$/,"");return e?`${e}/${String(n).replace(/^\/+/,"")}`:n}async function me(){if(window.SAHRA_IS_NATIVE){if(!window.SAHRA_AUTH_STORAGE)throw new Error("Secure native sign-in storage is unavailable.");return await window.SAHRA_AUTH_STORAGE.get("sahraToken")}return localStorage.getItem("sahraToken")}async function On(){if(window.SAHRA_IS_NATIVE){if(!window.SAHRA_AUTH_STORAGE)throw new Error("Secure native sign-in storage is unavailable.");await window.SAHRA_AUTH_STORAGE.remove("sahraToken");return}localStorage.removeItem("sahraToken")}async function q(n,e={}){let a=await me(),s=String(e.method||"GET").toUpperCase(),i=["POST","PUT","PATCH","DELETE"].includes(s),o=i?e.headers?.["Idempotency-Key"]||globalThis.crypto?.randomUUID?.()||`sahra-${Date.now()}-${Math.random().toString(36).slice(2)}`:null,l,m=null,r=null;try{let f=e.signal;s==="GET"&&!f&&typeof AbortController<"u"&&(r=new AbortController,f=r.signal,m=window.setTimeout(()=>r.abort(),12e3)),l=await fetch(zs(n),{...e,...f?{signal:f}:{},headers:{"Content-Type":"application/json",...e.headers||{},...o?{"Idempotency-Key":o}:{},...a?{Authorization:`Bearer ${a}`}:{}}})}catch(f){if(a&&t.localDatabaseReady&&s==="GET"&&Ae(n)==="api/dashboard"){let w=await z.dashboardFallback(a);if(w.user||Object.values(w.data||{}).some(I=>I.length))return w}if(a&&t.localDatabaseReady&&s==="GET"&&Ae(n)==="api/transactions"){let w=await z.transactionFallback(a);if(w.length)return w}if(a&&i&&t.localDatabaseReady)try{let w=await z.enqueueAndApply(a,n,{...e,method:s,idempotencyKey:o});return w}catch(w){console.warn("Offline save could not be queued:",w.message)}throw f}finally{m!==null&&window.clearTimeout(m)}let g=(l.headers.get("content-type")||"").includes("application/json")?await l.json():await l.text();if(!l.ok){let f=typeof g=="string"?g:g?.message||"Request failed";if(typeof f=="string"&&/<\s*(?:!doctype|html|head|body|pre)\b/i.test(f)){let N=f.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^<\s]+)/i);N&&/reset-data/i.test(N[2])?f="The DaySync reset API is not deployed on the server yet. Push backend/routes/dashboard.js from the project root and wait for the hosted API to redeploy, then try again.":f=`The server returned an unexpected HTML error (HTTP ${l.status}). Check the API deployment and try again.`}else typeof f=="string"&&(f=f.trim().slice(0,600));if([502,503,504].includes(l.status)&&a)try{if(t.localDatabaseReady&&s==="GET"&&Ae(n)==="api/dashboard"){let N=await z.dashboardFallback(a);if(N.user||Object.values(N.data||{}).some(D=>D.length))return N}if(t.localDatabaseReady&&s==="GET"&&Ae(n)==="api/transactions"){let N=await z.transactionFallback(a);if(N.length)return N}if(i&&t.localDatabaseReady){let N=await z.enqueueAndApply(a,n,{...e,method:s,idempotencyKey:o});return N}}catch(N){console.warn("Offline fallback unavailable:",N.message)}(l.status===401||l.status===404&&f.toLowerCase().includes("user not found"))&&(await On(),localStorage.removeItem("sahraUser"),t.authenticated=!1,!window.location.pathname.endsWith("/login")&&!window.location.pathname.endsWith("/login.html")&&(window.location.href=gt()));let I=new Error(f);throw I.status=l.status,I}return a&&(t.localDatabaseReady&&s==="GET"&&Ae(n)==="api/dashboard"?z.cacheDashboard(a,g).catch(f=>console.warn("Dashboard cache update failed:",f.message)):t.localDatabaseReady&&s==="GET"&&Ae(n)==="api/transactions"?z.cacheTransactions(a,Array.isArray(g)?g:g.transactions||[]).catch(f=>console.warn("Transaction cache update failed:",f.message)):i&&t.localDatabaseReady&&z.cacheSuccessfulMutation(a,n,{...e,method:s},g).then(()=>{globalThis.navigator?.onLine&&z.flush(a).catch(f=>console.warn("Offline sync retry failed:",f.message))}).catch(f=>console.warn("Local cache update failed:",f.message))),g}function Ae(n){return String(n||"").split("?")[0].replace(/^\/+/,"")}var Hs=!1;window.addEventListener("online",async()=>{Hs=!1;try{let n=await me();t.localDatabaseReady&&n&&await z.flush(n),await ae({skipLocalSync:!t.localDatabaseReady}),t.localDatabaseReady&&await Ee()}catch(n){console.warn("Reconnect sync failed:",n.message)}});function Mn(n){let e=2166136261;for(let a of String(n||""))e^=a.charCodeAt(0),e=Math.imul(e,16777619);return 2e5+(e>>>0)%5e5}async function ta(n){if(!window.Capacitor?.isNativePlatform?.())return;let e=Mn(n.id);try{if(await J.cancel({notifications:[{id:e}]}),!n.reminderTime||n.status==="Completed")return;let a=await J.checkPermissions();if(a.display!=="granted"&&(a=await J.requestPermissions()),a.display!=="granted"){E("Goal saved. Enable notifications to receive reminders.");return}let[s,i]=String(n.reminderTime).split(":").map(Number);if(!Number.isInteger(s)||!Number.isInteger(i))return;let o={on:{hour:s,minute:i},every:n.frequency==="Weekly"?"week":n.frequency==="Monthly"?"month":"day",allowWhileIdle:!0};n.frequency==="Weekly"&&(o.on.weekday=new Date(`${n.targetDate}T12:00:00`).getDay()+1),n.frequency==="Monthly"&&(o.on.day=Math.min(28,Number(String(n.targetDate).slice(8,10))||1)),await J.schedule({notifications:[{id:e,title:`Goal reminder: ${n.title}`,body:`Take one small step toward your ${n.frequency.toLowerCase()} goal.`,schedule:o,extra:{type:"goal-reminder",goalId:n.id}}]})}catch(a){console.warn("Could not schedule goal reminder:",a.message)}}function Rn(n){return String(n||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"_")}function _n(){let n=[t.user||{}];try{let s=JSON.parse(localStorage.getItem("sahraUser")||"null");s&&typeof s=="object"&&n.push(s)}catch{}let e=[];for(let s of n)for(let i of["id","_id","email","username","name"]){let o=Rn(s?.[i]);o&&!e.includes(o)&&e.push(o)}!e.length&&!t.authenticated&&e.push("guest");let a=e.map(s=>`daysyncGoalAchievements:${s}`);return[...new Set(a)]}function la(){let n=t.user||{},e=n.id||n._id||n.email||n.username||n.name;if(!e)try{let a=JSON.parse(localStorage.getItem("sahraUser")||"null");e=a?.id||a?._id||a?.email||a?.username||a?.name}catch{}return`daysyncGoalAchievements:${Rn(e||"guest")}`}function de(){let n=_n(),e=[];for(let s of n)try{let i=JSON.parse(localStorage.getItem(s)||"[]");Array.isArray(i)&&e.push(...i)}catch(i){console.warn(`Could not read saved Goal & Achievements data from ${s}:`,i.message)}let a=typeof we=="function"?we(e,[]):[...new Map(e.filter(s=>s?.id!=null).map(s=>[String(s.id),s])).values()];if(n.length&&e.length){let s=la();try{localStorage.setItem(s,JSON.stringify(a));for(let i of n)i!==s&&localStorage.removeItem(i)}catch(i){console.warn("Could not migrate legacy Goal & Achievements storage:",i.message)}}return a}function da(n){t.goalAchievementItems=Array.isArray(n)?n:[],t.data.goalAchievements=t.goalAchievementItems;try{return localStorage.setItem(la(),JSON.stringify(t.goalAchievementItems)),!0}catch{return E("Could not save goals on this device. Check available storage."),!1}}function at(n){let e=de(),a=new Map(e.filter(l=>l?.id).map(l=>[String(l.id),l])),s=new Date().toISOString(),i=l=>{let m={...l||{}};return delete m.updatedAt,delete m._offlinePending,m},o=(Array.isArray(n)?n:[]).map(l=>{let m=a.get(String(l?.id||"")),r=!m||JSON.stringify(i(m))!==JSON.stringify(i(l));return{...l,updatedAt:r?s:l.updatedAt||m?.updatedAt||s}});if(!da(o))return!1;if(t.authenticated){let l=new Set(o.map(m=>String(m.id)));for(let m of o){if(!m?.id)continue;let r=a.get(String(m.id));r&&JSON.stringify(i(r))===JSON.stringify(i(m))||q(`/api/goal-achievements/${encodeURIComponent(m.id)}`,{method:"PUT",body:JSON.stringify(m)}).catch(h=>console.warn("Goal & Achievements sync is pending:",h.message))}for(let m of e)!m?.id||l.has(String(m.id))||q(`/api/goal-achievements/${encodeURIComponent(m.id)}`,{method:"DELETE"}).catch(r=>console.warn("Goal deletion sync is pending:",r.message))}return!0}function we(n,e){let a=new Map,s=i=>{let o=Date.parse(i?.updatedAt||i?.createdAt||0);return Number.isFinite(o)?o:0};for(let i of[...Array.isArray(n)?n:[],...Array.isArray(e)?e:[]]){if(!i||i.id==null)continue;let o=String(i.id),l=a.get(o);if(!l){a.set(o,{...i,id:o});continue}let m=s(i)>=s(l),r=m?i:l,h=m?l:i,g=new Map;for(let f of[...Array.isArray(h.logs)?h.logs:[],...Array.isArray(r.logs)?r.logs:[]]){let w=String(f?.id||`${f?.date||""}:${f?.amount||""}:${f?.createdAt||""}`);g.set(w,{...g.get(w)||{},...f})}a.set(o,{...h,...r,id:o,createdAt:[h.createdAt,r.createdAt].filter(Boolean).sort()[0]||r.createdAt,updatedAt:new Date(Math.max(s(h),s(r))||Date.now()).toISOString(),current:Math.max(Number(h.current)||0,Number(r.current)||0),xp:Math.max(Number(h.xp)||0,Number(r.xp)||0),currentStreak:Number(r.currentStreak??h.currentStreak)||0,bestStreak:Math.max(Number(h.bestStreak)||0,Number(r.bestStreak)||0),logs:[...g.values()].sort((f,w)=>String(f.createdAt||f.date||"").localeCompare(String(w.createdAt||w.date||"")))})}return[...a.values()].sort((i,o)=>String(o.createdAt||"").localeCompare(String(i.createdAt||"")))}async function Gs(n=[]){let e=de(),a=we(e,n);if(!da(a))return{synced:0,pending:!0};if(!t.authenticated)return{synced:0,pending:!1};let s=0;for(let i of a)if(i?.id)try{await q(`/api/goal-achievements/${encodeURIComponent(i.id)}`,{method:"PUT",body:JSON.stringify(i)}),s+=1}catch(o){console.warn("Goal & Achievements sync will retry:",o.message)}return{synced:s,pending:!globalThis.navigator?.onLine}}function wn(n,e){let a=new Date(`${String(n||U(new Date)).slice(0,10)}T12:00:00`);if(Number.isNaN(a.getTime()))return U(new Date);if(e==="Weekly"){let s=(a.getDay()+6)%7;return a.setDate(a.getDate()-s),`W:${U(a)}`}return e==="Monthly"?`M:${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}`:`D:${U(a)}`}function nt(n,e){let a=String(n||"").slice(2);if(e==="Monthly"){let[i,o]=a.split("-").map(Number);return i*12+(o||1)-1}let s=new Date(`${a}T12:00:00`);return Number.isNaN(s.getTime())?-1:Math.floor(Date.UTC(s.getFullYear(),s.getMonth(),s.getDate())/864e5)}function Ws(n){let e=[...new Set((n.logs||[]).map(g=>wn(g.date,n.frequency)))].sort((g,f)=>nt(g,n.frequency)-nt(f,n.frequency)),a=[...new Set(e.map(g=>nt(g,n.frequency)))].sort((g,f)=>g-f),s=0,i=0,o=null;for(let g of a)i=o!==null&&g===o+1?i+1:1,s=Math.max(s,i),o=g;let l=nt(wn(U(new Date),n.frequency),n.frequency),m=l-1,r=0,h=a.includes(l)?l:m;if(a.includes(h)){for(let g=a.length-1;g>=0;g--)if(a[g]===h)r++,h--;else if(a[g]<h)break}n.currentStreak=r,n.bestStreak=Math.max(Number(n.bestStreak)||0,s,r)}function Ys(n){return Math.max(0,Math.min(100,Math.round((Number(n.current)||0)/Math.max(1,Number(n.target)||1)*100)))}function xn(){let n=Array.isArray(t.goalAchievementItems)?t.goalAchievementItems:[],e=t.goalAchievementFilter||"All",a=r=>r.status==="Completed"?"Completed":r.targetDate<U(new Date)?"Overdue":"Active",s=n.filter(r=>e==="All"||a(r)===e),i=n.reduce((r,h)=>r+(Number(h.xp)||0),0),o=n.filter(r=>r.status==="Completed").length,l=n.reduce((r,h)=>Math.max(r,Number(h.bestStreak)||0),0),m=P;return`<section class="screen ga-screen" aria-label="Goal and Achievements">
    <header class="ga-header daysync-common-header"><button type="button" class="daysync-page-back-button" data-action="ga-back" aria-label="Back" title="Back">\u2039</button><div class="ga-heading"><p class="ga-eyebrow">PLAN \xB7 PROGRESS \xB7 ACHIEVE</p><h1>Goal &amp; Achievements</h1><p>Small steps, meaningful progress.</p></div><span class="ga-header-icon" aria-hidden="true">\u2726</span></header>
    <div class="ga-summary-grid"><article class="ga-summary-card"><span>Goals completed</span><strong>${o}</strong></article><article class="ga-summary-card"><span>Total XP</span><strong>${i.toLocaleString()}</strong></article><article class="ga-summary-card"><span>Best streak</span><strong>\u{1F525} ${l}</strong></article></div>
    <section class="ga-panel ga-add-goal-panel">
      <div class="ga-section-heading"><div><h2>Set a new goal</h2><p>Create a goal, choose a target and build a routine that works for you.</p></div><span class="ga-panel-symbol" aria-hidden="true">\uFF0B</span></div>
      <button type="button" class="ga-button ga-button-primary ga-add-goal-button" data-action="ga-open-create">\uFF0B Add Goal</button>
    </section>
    <section class="ga-goals-section"><div class="ga-section-heading"><div><h2>Your goals</h2><p>${n.length} saved ${n.length===1?"goal":"goals"}</p></div></div><div class="ga-filters" role="group" aria-label="Filter goals">${["All","Active","Completed","Overdue"].map(r=>`<button type="button" data-action="ga-filter" data-filter="${r}" class="ga-filter ${e===r?"active":""}" aria-pressed="${e===r}">${r}</button>`).join("")}</div>
      ${s.length?`<div class="ga-goal-list">${s.map(r=>{let h=Ys(r),g=r.status!=="Completed"&&r.targetDate<U(new Date),f=r.status==="Completed"?"Completed":g?"Overdue":"Active",w=Math.ceil((new Date(`${r.targetDate}T23:59:59`).getTime()-Date.now())/864e5),I=Array.isArray(r.logs)?r.logs:[];return`<article class="ga-goal-card ${f==="Completed"?"is-complete":""}"><div class="ga-goal-top"><span class="ga-category-chip">${m(r.category||"Personal")}</span><span class="ga-status-chip ${f.toLowerCase()}">${f}</span></div><h3>${m(r.title)}</h3>${r.description?`<p class="ga-goal-description">${m(r.description)}</p>`:""}<div class="ga-progress-row"><div class="ga-progress-ring" style="--ga-progress:${h}%" role="img" aria-label="${h}% complete"><div><strong>${h}%</strong></div></div><div class="ga-progress-copy"><strong>${Number(r.current)||0} / ${Number(r.target)||1} ${m(r.unit||"items")}</strong><span>${f==="Completed"?"Goal achieved!":w<0?`${Math.abs(w)} days overdue`:w===0?"Due today":`${w} days left`}</span><div class="ga-progress-track"><span style="width:${h}%"></span></div></div></div><div class="ga-goal-stats"><span>\u{1F525} <strong>${Number(r.currentStreak)||0}</strong> streak</span><span>\u{1F3C6} <strong>${Number(r.bestStreak)||0}</strong> best</span><span>\u2728 <strong>${Number(r.xp)||0}</strong> XP</span><span>\u{1F4C5} ${m(r.frequency)}</span></div>${f!=="Completed"?`<form class="ga-log-form" data-form="goal-progress" data-goal-id="${m(r.id)}"><label><span class="sr-only">Progress to add</span><input type="number" name="amount" min="1" max="1000000" value="1" required aria-label="Progress amount" /></label><button class="ga-button ga-button-primary" type="submit">\uFF0B Add progress</button></form>`:'<p class="ga-complete-note">\u2713 Completed \u2014 keep this achievement as a reminder of what you can do.</p>'}<div class="ga-card-actions"><button type="button" data-action="ga-edit" data-goal-id="${m(r.id)}">Edit</button><button type="button" data-action="ga-delete" data-goal-id="${m(r.id)}">Delete</button></div></article>`}).join("")}</div>`:`<div class="ga-empty-state"><span>\u2726</span><h3>${n.length?"No goals in this filter yet":"Your next achievement starts here"}</h3><p>${n.length?"Choose another filter to see your goals.":"Create a goal above, then record small steps to watch your progress ring grow."}</p></div>`}
    </section></section>`}function Js(){let n=U(new Date),e=U(new Date(Date.now()+30*864e5));return`<section class="screen ga-screen ga-create-screen" aria-label="Create a Goal">
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
  </section>`}function Vs(){let e=(Array.isArray(t.goalAchievementItems)?t.goalAchievementItems:[]).find(r=>String(r.id)===String(t.goalAchievementEditingId));if(!e)return"";let a=P,s=["sessions","minutes","pages","tasks","items"],i=["Learning","Health","Career","Personal","Finance"],o=s.includes(e.unit)?e.unit:"items",l=i.includes(e.category)?e.category:"Personal",m=["Daily","Weekly","Monthly"].includes(e.frequency)?e.frequency:"Daily";return`<section class="screen ga-screen ga-edit-screen" aria-label="Edit Goal">
    <header class="ga-header daysync-common-header"><button type="button" class="daysync-page-back-button" data-action="ga-back" aria-label="Back" title="Back">\u2039</button><div class="ga-heading"><p class="ga-eyebrow">PLAN \xB7 PROGRESS \xB7 ACHIEVE</p><h1>Edit Goal</h1><p>Update your goal details and keep your progress.</p></div><span class="ga-header-icon" aria-hidden="true">\u2726</span></header>
    <section class="ga-panel ga-edit-panel"><div class="ga-section-heading"><div><h2>Update goal details</h2><p>Progress, logs, XP, streaks and achievement history stay unchanged.</p></div><span class="ga-panel-symbol" aria-hidden="true">\u270E</span></div>
      <form class="ga-form" data-form="goal-achievement-edit">
        <label class="ga-field ga-field-wide"><span>Goal name *</span><input name="title" maxlength="90" required value="${a(e.title||"")}" placeholder="e.g. Learn Java programming" /></label>
        <label class="ga-field ga-field-wide"><span>Description <small>Optional</small></span><textarea name="description" maxlength="240" rows="2" placeholder="Why does this goal matter?">${a(e.description||"")}</textarea></label>
        <div class="ga-field-row"><label class="ga-field"><span>Target amount *</span><input name="target" type="number" min="1" max="1000000" required value="${Math.max(1,Number(e.target)||1)}" /></label><label class="ga-field"><span>Unit</span><select name="unit">${s.map(r=>`<option value="${r}" ${r===o?"selected":""}>${r.charAt(0).toUpperCase()+r.slice(1)}</option>`).join("")}</select></label></div>
        <div class="ga-field-row"><label class="ga-field"><span>Target date *</span><input name="targetDate" type="date" required value="${a(e.targetDate||"")}" /></label><label class="ga-field"><span>Frequency</span><select name="frequency">${["Daily","Weekly","Monthly"].map(r=>`<option ${r===m?"selected":""}>${r}</option>`).join("")}</select></label></div>
        <div class="ga-field-row"><label class="ga-field"><span>Reminder time <small>Optional</small></span><input name="reminderTime" type="time" value="${a(e.reminderTime||"")}" /></label><label class="ga-field"><span>Category</span><select name="category">${i.map(r=>`<option ${r===l?"selected":""}>${r}</option>`).join("")}</select></label></div>
        <div class="ga-form-actions"><button type="button" class="ga-button ga-button-quiet" data-action="ga-cancel-edit">Cancel</button><button type="submit" class="ga-button ga-button-primary">Save Changes</button></div>
      </form>
    </section>
  </section>`}function Ks(){return`
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
  `}function Xs(){let n=t.theme==="light",e=["system","light","dark"].includes(t.themePreference)?t.themePreference:"system",a=e==="system"?"\u{1F4F1}":n?"\u2600\uFE0F":"\u{1F319}",s=e==="system"?`System theme \xB7 follows device (${n?"Light":"Dark"})`:`${n?"Light":"Dark"} theme enabled`,i=pa(),o=Array.isArray(t.data?.tasks)?t.data.tasks.length:0,l=Array.isArray(t.data?.assets)&&t.data.assets.length?t.data.assets.length:Array.isArray(t.data?.notes)?t.data.notes.length:0,m=(t.data?.events?.length||0)+(t.data?.reminders?.length||0),r=Array.isArray(t.financeData)&&t.financeData.length?t.financeData.length:(t.data?.expenses?.length||0)+(t.data?.subscriptions?.length||0),h=(t.data?.goals?.length||0)+(t.data?.habits?.length||0)+(t.data?.habitLogs?.length||0)+(t.data?.moods?.length||0),g=ua(),f=g.length,w=g.filter(N=>N.status==="Completed"||Number(N.current||0)>=Number(N.target||1)).length,I=Array.isArray(t.focusSessions)?t.focusSessions.length:0;return`
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
            <span class="daysync-setting-icon">${a}</span><span class="daysync-setting-copy"><strong>Appearance</strong><small>${s} \xB7 Tap to change</small></span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="profile">
            <span class="daysync-setting-icon">\u2659</span><span class="daysync-setting-copy"><strong>Profile</strong><small>${P(t.user?.name||"Your personal information")}</small></span><span class="daysync-setting-trail">\u203A</span>
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
            <span class="daysync-setting-icon">\u27F3</span><span class="daysync-setting-copy"><strong>Data &amp; Sync</strong><small>${o} tasks \xB7 ${l} notes \xB7 ${r} transactions \xB7 ${m} calendar items</small><small class="daysync-setting-subline">${h} progress records \xB7 ${f} goals \xB7 ${w} achievements \xB7 ${I} focus sessions \xB7 Tap to sync now</small></span><span class="daysync-setting-trail">\u203A</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="privacy-security" aria-expanded="${t.settingsInfoPanel==="privacy"?"true":"false"}">
            <span class="daysync-setting-icon">\u25C7</span><span class="daysync-setting-copy"><strong>Privacy &amp; Security</strong><small>Account-scoped data and device permissions</small></span><span class="daysync-setting-trail">${t.settingsInfoPanel==="privacy"?"\u2304":"\u203A"}</span>
          </button>
          ${t.settingsInfoPanel==="privacy"?'<div class="daysync-settings-detail-panel" role="group" aria-label="Privacy and device permissions"><strong>Your account and device</strong><p>DaySync requests access only when a feature needs it. Location is used to find local weather. Your saved records are associated with your signed-in account; sign out on shared devices.</p><div class="daysync-settings-detail-actions"><button class="daysync-settings-detail-action" type="button" data-action="open-location-permission-settings"><strong>Location permissions</strong><small>Manage location access for local weather</small></button><button class="daysync-settings-detail-action" type="button" data-action="open-notification-permission-settings"><strong>Notification permissions</strong><small>Manage task, event and focus reminders</small></button><button class="daysync-settings-detail-action" type="button" data-menu-action="exact-alarms"><strong>Timer alarms</strong><small>Manage precise Focus Timer alarms on Android</small></button></div></div>':""}
          <button class="daysync-setting-row daysync-setting-row-danger" type="button" data-action="open-reset-options">
            <span class="daysync-setting-icon daysync-danger-icon">\u26A0</span><span class="daysync-setting-copy"><strong>Reset Options</strong><small>Review saved data by section and date before deleting</small></span><span class="daysync-setting-trail">\u203A</span>
          </button>
        </div>
      </section>
      <p class="daysync-settings-section-label">ABOUT DAYSYNC</p>
      <section class="daysync-about-card"><div class="daysync-about-top"><img class="daysync-about-logo" src="/images/DaySync.png" alt="DaySync logo" width="42" height="42" /><div><strong>DaySync</strong><p>Your personal planner for tasks, calendar, expenses, goals, and focus sessions.</p></div></div><span class="daysync-about-version">DaySync \xB7 Version 1.0 \xB7 AI assistant: Sahra</span></section>
      <button class="daysync-signout-row" type="button" data-menu-action="logout"><span>\u21AA</span> Sign out</button>
    </section>`}var ie={tasks:{title:"To Do List",icon:"\u2705",description:"Saved tasks and their completion status",collections:["tasks"]},notepad:{title:"Notepad",icon:"\u{1F4DD}",description:"Saved notes and vault entries",collections:["notes","assets"]},expenses:{title:"Expense Tracker",icon:"\u{1F4B0}",description:"Income, expenses and transactions",collections:["transactions","expenses","subscriptions"]},calendar:{title:"Calendar Data",icon:"\u{1F5D3}\uFE0F",description:"Calendar events and reminders",collections:["events","reminders"]},progress:{title:"Progress Tracker",icon:"\u{1F4C8}",description:"Goals, habits, mood entries and habit logs",collections:["goals","habits","habitLogs","moods"]},goalAchievements:{title:"Goal & Achievements",icon:"\u{1F3C6}",description:"Your personal goals, progress logs, XP and achievement history",collections:["goalAchievements"]},focus:{title:"Focus Timer",icon:"\u23F1\uFE0F",description:"Saved focus sessions and timer history",collections:[]}};function ua(){let n=[...Array.isArray(t.goalAchievementItems)?t.goalAchievementItems:[],...Array.isArray(t.data?.goalAchievements)?t.data.goalAchievements:[],...de()];return we(n,[])}function rt(n){let e=t.data||{},a=(s,i)=>(Array.isArray(s)?s:[]).map(o=>({...o,_resetKind:i}));if(n==="tasks")return a(e.tasks,"Task");if(n==="notepad"){let s=(e.assets?.length?e.assets:e.notes)||[];return a(s,"Note")}if(n==="expenses"){let s=t.financeData?.length?t.financeData:[...e.expenses||[],...e.subscriptions||[]];return a(s,"Transaction")}return n==="calendar"?[...a(e.events,"Event"),...a(e.reminders,"Reminder")]:n==="progress"?[...a(e.goals,"Goal"),...a(e.habits,"Habit"),...a(e.habitLogs,"Habit log"),...a(e.moods,"Mood entry")]:n==="goalAchievements"?a(ua(),"Goal & achievement"):n==="focus"?a(t.focusSessions,"Focus session"):[]}function Qs(){let n=t.resetOptionsSelected||{},e=Object.keys(ie).filter(i=>n[i]),a=e.reduce((i,o)=>i+rt(o).length,0),s=e.map(i=>`<li>${P(ie[i].title)} <strong>${rt(i).length}</strong></li>`).join("");return`
    <section class="screen daysync-reset-screen" aria-label="Reset options">
      <header class="daysync-reset-header daysync-common-header"><button type="button" class="daysync-page-back-button" data-action="reset-back-settings" aria-label="Back to Settings" title="Back to Settings">\u2039</button><div class="daysync-reset-header-copy"><p class="daysync-eyebrow">APP &amp; DATA</p><h1>Reset Options</h1><p>Choose which sections of saved information to remove.</p></div></header>
      <div class="daysync-reset-warning"><span>\u26A0</span><div><strong>Permanent deletion</strong><p>Select only the sections you want to permanently delete. This action cannot be undone.</p></div></div>
      <div class="daysync-reset-category-list">
        ${Object.entries(ie).map(([i,o])=>{let l=rt(i),m=!!n[i];return`<button type="button" class="daysync-reset-category ${m?"is-selected":""}" data-action="reset-toggle-category" data-category="${i}" aria-pressed="${m}"><span class="daysync-reset-category-check">${m?"\u2713":""}</span><span class="daysync-reset-category-icon">${o.icon}</span><span class="daysync-reset-category-copy"><strong>${o.title}</strong><small>${o.description}</small><small>${l.length} saved ${l.length===1?"item":"items"} \xB7 ${m?"Included in reset":"Tap to select"}</small></span><span class="daysync-setting-trail">${m?"\u2713":"\u203A"}</span></button>`}).join("")}
      </div>
      <div class="daysync-reset-select-actions"><button type="button" data-action="reset-select-all">${e.length===Object.keys(ie).length?"Deselect all sections":"Select all sections"}</button><span>${e.length} sections \xB7 ${a} records selected</span></div>
      <div class="daysync-reset-review-bar"><button type="button" class="daysync-reset-cancel" data-action="reset-back-settings">Cancel</button><button type="button" class="daysync-reset-review-button" data-action="reset-review" ${!e.length||t.resetOptionsBusy?"disabled":""}>Review reset <span>(${e.length})</span></button></div>
      ${t.resetConfirmOpen?`<div class="daysync-reset-modal-backdrop" role="presentation"><section class="daysync-reset-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title"><div class="daysync-reset-danger-symbol">\u26A0\uFE0F</div><p class="daysync-eyebrow">FINAL REVIEW</p><h2 id="reset-confirm-title">Delete selected data?</h2><p class="daysync-reset-confirm-copy">This permanently deletes <strong>${a} saved records</strong> across the selected sections. Your account will not be deleted, but this data cannot be recovered.</p><ul class="daysync-reset-confirm-list">${s}</ul><label class="daysync-reset-ack"><input type="checkbox" data-reset-acknowledge> <span>I understand this deletion is permanent.</span></label><label class="daysync-reset-phrase-label" for="reset-confirm-phrase">Type <strong>DELETE</strong> to confirm</label><input id="reset-confirm-phrase" class="daysync-reset-phrase" type="text" autocomplete="off" autocapitalize="characters" placeholder="Type DELETE" aria-label="Type DELETE to confirm"><div class="daysync-reset-modal-actions"><button type="button" class="daysync-reset-cancel" data-action="reset-cancel">Go back</button><button type="button" class="daysync-reset-confirm-button" data-action="reset-confirm" ${t.resetOptionsBusy?"disabled":""}>${t.resetOptionsBusy?"Deleting\u2026":"Permanently delete"}</button></div></section></div>`:""}
    </section>`}async function Zs(n){let e=typeof AbortController<"u"?new AbortController:null,a=e?window.setTimeout(()=>e.abort(),4500):null;try{await q("/api/profile/theme",{method:"PUT",body:JSON.stringify({theme:n}),...e?{signal:e.signal}:{}})}catch(s){console.warn("Theme sync deferred; the device preference remains active:",s.message)}finally{a!==null&&window.clearTimeout(a)}}async function Sn(n){let e=t.user?.preferences?.reminderSettings||{},a=await q("/api/profile/preferences",{method:"PUT",body:JSON.stringify({preferences:{reminderSettings:{...e,...n}}})});t.user=a.user||{...t.user,preferences:{...t.user?.preferences||{},reminderSettings:{...e,...n}}},localStorage.setItem("sahraUser",JSON.stringify(t.user))}function pa(){return t.user?.preferences?.reminderSettings?.enabled===!1?!1:window.SAHRA_NOTIFICATIONS?.isNative?.()?window.SAHRA_NOTIFICATIONS.getCachedPermission?.()==="granted":"Notification"in window&&Notification.permission==="granted"}async function ei(){let n=t.user?.preferences?.reminderSettings||{};if(pa()){try{await Sn({enabled:!1}),window.SAHRA_NOTIFICATIONS?.isNative?.()&&await qe(),E("Device notifications are off.")}catch(a){E(a.message||"Unable to turn notifications off.")}return}try{if(window.SAHRA_NOTIFICATIONS?.isNative?.()){if((await window.SAHRA_NOTIFICATIONS.reconcile([],{requestPermission:!0})).permission!=="granted"){E("Notification permission was not granted. Enable it in device settings to continue.");return}}else{if(!("Notification"in window)){E("Notifications are not supported in this browser.");return}if((Notification.permission==="granted"?"granted":await Notification.requestPermission())!=="granted"){E("Notification permission was not granted.");return}}await Sn({enabled:!0}),window.SAHRA_NOTIFICATIONS?.isNative?.()?await qe():await aa(),E("Device notifications are on for task and event reminders.")}catch(a){E(a.message||"Unable to turn notifications on.")}}async function ae({loadFinanceInBackground:n=!1,skipLocalSync:e=!1}={}){let a=await me();if(!a){t.authenticated=!1,window.location.href=gt();return}if(t.authenticated=!0,!e&&t.localDatabaseReady)try{let i=await z.dashboardFallback(a);Object.values(i.data||{}).some(l=>Array.isArray(l)&&l.length)&&(t.data={...ot,...i.data||{}},i.user&&(t.user=i.user),t.goalAchievementItems=de(),b())}catch(i){console.warn("Local dashboard snapshot is unavailable:",i.message)}let s=e||!t.localDatabaseReady||!globalThis.navigator?.onLine;if(!e&&t.localDatabaseReady&&globalThis.navigator?.onLine)try{s=!!(await z.flush(a))?.pending}catch(i){console.warn("Pending offline changes could not be flushed before dashboard load:",i.message),s=!0}n&&!s&&Ee();try{let i=await q("/api/dashboard");t.data={...ot,...i.data||{}};let o=Array.isArray(t.data.tasks)?t.data.tasks:[],l=o.filter($e);l.length&&(t.data.tasks=o.filter(h=>!$e(h)),Promise.all(l.map(h=>{let g=h?.id||h?._id;return g?q(`/api/tasks/${encodeURIComponent(g)}`,{method:"DELETE"}).catch(f=>console.warn("Could not permanently remove a test task:",f.message)):Promise.resolve()}))),t.user=i.user||t.user,t.goalAchievementItems=de();let m=Array.isArray(t.data.goalAchievements)?t.data.goalAchievements:[];if(s&&t.localDatabaseReady)try{let h=await z.read(a,"goalAchievements");m=we(m,h)}catch(h){console.warn("Unable to read the local Goal & Achievements sync cache:",h.message)}let r=we(de(),m);da(r),t.localDatabaseReady&&Gs(m).catch(h=>console.warn("Goal & Achievements sync will retry:",h.message)),localStorage.setItem("sahraUser",JSON.stringify(t.user)),mt(Ln()),aa(),vn||(vn=setInterval(aa,3e4)),b(),ve(!0).catch(h=>console.warn("Background progress refresh failed:",h.message))}catch(i){console.error("Dashboard load failed:",i),t.data&&!t.data.events&&(t.data={...ot}),b()}}async function ve(n=!0){let e=Number(t.currentYear),a=Number(t.currentMonth)+1;if(!Number.isInteger(e)||!Number.isInteger(a))return;t.progressLoading=!0;let[s,i]=await Promise.allSettled([q(`/api/progress?year=${e}&month=${a}`),q(`/api/focus/stats?year=${e}&month=${a}`)]);s.status==="fulfilled"?t.progressData=s.value:(console.warn("Progress load failed:",s.reason?.message||s.reason),t.progressData=null),i.status==="fulfilled"?t.focusStatsData=i.value:(console.warn("Monthly focus history could not be loaded from the server:",i.reason?.message||i.reason),t.focusStatsData=null),t.progressLoading=!1,n&&t.view==="progress"&&b()}async function le(n,e){let s={event:"/api/events",task:"/api/tasks",mood:"/api/moods",habit:"/api/habits",goal:"/api/goals",expense:"/api/expenses",subscription:"/api/subscriptions",asset:"/api/assets"}[n];if(!s)return null;let i=e;(n==="expense"||n==="subscription")&&(i={...e,type:"expense",amount:Number(e.amount),note:String(e.title||e.note||"").trim(),category:String(e.category||"General").trim()||"General",date:e.date||t.selectedDate,paymentMethod:e.paymentMethod||"Cash"});let o=await q(s,{method:"POST",body:JSON.stringify(i)}),m={event:"event",task:"task",mood:"mood",habit:"habit",goal:"goal",asset:"data",expense:"transaction",subscription:"transaction"}[n],r=m&&o?.[m]||(o?.offline?o?.[n==="asset"?"asset":n==="subscription"||n==="expense"?"transaction":n]:null)||null;if(n==="expense"||n==="subscription")r&&(Array.isArray(t.financeData)||(t.financeData=[]),t.financeData=[r,...t.financeData.filter(h=>String(h.id||h._id)!==String(r.id||r._id))]);else{let h=n==="asset"?"assets":{event:"events",task:"tasks",mood:"moods",habit:"habits",goal:"goals"}[n];h&&(Array.isArray(t.data[h])||(t.data[h]=[]),r&&(t.data[h]=[r,...t.data[h].filter(g=>String(g.id||g._id)!==String(r.id||r._id))]))}return(n==="event"||n==="task")&&i.reminder&&t.user?.preferences?.reminderSettings?.enabled!==!1&&qe().catch(h=>console.warn("Reminder reconciliation deferred:",h.message)),t.entryModalOpen||b(),o}async function kn(n){if(!n)return;let e=n.value.trim();if(!e){E("Please enter a task title."),n.focus();return}if($e({title:e})){E("Please choose a meaningful task title."),n.focus();return}try{await le("task",{title:e,description:"",date:t.selectedDate,time:null,priority:"Normal",status:"Pending",completed:!1,reminder:"",category:"General"}),n.value="",E("Task added")}catch(a){E(a.message||"Unable to add task")}}function ti(n){let e=String(n||"").toLowerCase().match(/(\d+)\s*(min(?:ute)?s?|hours?|days?)/);if(!e)return 0;let a=Number(e[1]),s=e[2];return s.startsWith("day")?a*24*60*60*1e3:s.startsWith("hour")?a*60*60*1e3:a*60*1e3}function qn(n,e){let a=e==="event"?n.startTime:n.time;if(!n?.date||!a||!/^\d{2}:\d{2}$/.test(a))return null;let s=new Date(`${n.date}T${a}:00`);return Number.isNaN(s.getTime())?null:new Date(s.getTime()-ti(n.reminder))}function ai(n,e){let a=`${n}:${e||""}`,s=n==="event"?17:23;for(let i=0;i<a.length;i+=1)s=s*31+a.charCodeAt(i)|0;return Math.abs(s)%2147483646+1}function An(n,e){let a=qn(e,n),s=e.id||e._id;if(!a||!s||a.getTime()<=Date.now())return null;let i=n==="event"?e.startTime:e.time;return{id:ai(n,s),title:"DaySync reminder",body:`${n==="event"?"Event":"Task"}: ${e.title}${i?` \u2022 ${i}`:""}`,schedule:{at:a,allowWhileIdle:!0},channelId:"daysync-reminders",sound:"default",extra:{date:e.date,resource:n,id:String(s)}}}async function qe({requestPermission:n=!1}={}){let e=window.SAHRA_NOTIFICATIONS;if(!e?.isNative?.())return{native:!1};let a=t.user?.preferences?.reminderSettings||{},i=a.enabled!==!1?[...a.tasksEnabled===!1?[]:t.data.tasks.filter(o=>!o.completed&&o.status!=="Completed").map(o=>An("task",o)),...a.eventsEnabled===!1?[]:t.data.events.map(o=>An("event",o))].filter(Boolean):[];try{let o=await e.reconcile(i,{requestPermission:n});return n&&o.permission!=="granted"?E("Notifications are disabled. You can enable them in your device settings."):n&&o.scheduled&&E(`${o.scheduled} reminder${o.scheduled===1?"":"s"} registered on this device.`),o}catch(o){return console.warn("Native reminder reconciliation failed:",o.message),n&&E("DaySync could not register this device reminder."),{native:!0,error:o}}}async function ni(n,e){let a="serviceWorker"in navigator?await navigator.serviceWorker.getRegistration():null,s=n==="event"?e.startTime:e.time,i={body:`${n==="event"?"Event":"Task"}: ${e.title}${s?` \u2022 ${s}`:""}`,icon:"/images/sahra.png",badge:"/images/sahra.png",tag:`sahra-${n}-${e.id||e._id}`,data:{date:e.date,resource:n,id:e.id||e._id}};if(a?.showNotification){await a.showNotification("DaySync reminder",i);return}let o=new Notification("DaySync reminder",i);o.onclick=()=>{window.focus(),window.location.href=`/dashboard?date=${encodeURIComponent(e.date)}`}}async function aa(){let n=t.user?.preferences?.reminderSettings||{};if(n.enabled===!1)return;if(window.SAHRA_NOTIFICATIONS?.isNative?.()){await qe();return}if(!("Notification"in window)||Notification.permission!=="granted")return;let e=Date.now(),a=[...n.tasksEnabled===!1?[]:t.data.tasks.map(s=>({resource:"task",item:s})),...n.eventsEnabled===!1?[]:t.data.events.map(s=>({resource:"event",item:s}))];for(let{resource:s,item:i}of a){if(i.reminderNotifiedAt)continue;let o=qn(i,s);if(!(!o||e<o.getTime()||e-o.getTime()>120*1e3))try{(await q("/api/notifications/mark-sent",{method:"POST",body:JSON.stringify({resource:s,id:i.id||i._id})})).sent&&await ni(s,i)}catch(l){console.warn("Reminder notification failed:",l.message)}}}async function Fn(n){if(!(!t.authenticated||t.calendarCache.has(n))){t.calendarCache.add(n);try{let e=await q(`/api/calendar/${n}`);t.calendarCache.add(n);let a=e.tasks||[],s=e.events||[],i=e.moods||[];t.data.tasks=[...t.data.tasks.filter(o=>o.date!==n),...a],t.data.events=[...t.data.events.filter(o=>o.date!==n),...s],t.data.moods=[...t.data.moods.filter(o=>o.date!==n),...i]}catch(e){t.calendarCache.delete(n),console.warn("Selected day data refresh failed:",e.message)}}}async function si(n){t.selectedDate=n;let[e,a,s]=n.split("-").map(Number);t.currentYear=e,t.currentMonth=a-1,await Fn(n),b()}function $n(n){let e=new Date(t.currentYear,t.currentMonth+n,1);t.currentYear=e.getFullYear(),t.currentMonth=e.getMonth(),b()}function ii(n){if(!n)return!1;try{let e=new Date;return e.setHours(0,0,0,0),new Date(`${n}T00:00:00`)>e}catch{return!1}}function jn(n){if(!n)return!1;try{let e=new Date;return e.setHours(0,0,0,0),new Date(`${n}T00:00:00`)<e}catch{return!1}}function oi(n=52){return`
    <img
      class="sahra-logo"
      src="/images/DaySync.png"
      alt="DaySync logo"
      width="${n}"
      height="${n}"
    />
  `}function ri(n="event"){if(n==="mood"&&ii(t.selectedDate)){window.alert("Future dates cannot have a mood.");return}if((n==="event"||n==="task")&&jn(t.selectedDate)){window.alert("Tasks and events can only be added for today or future dates.");return}t.entryModalOpen=!0,t.entryDraft={type:n,title:"",description:"",date:t.selectedDate,startTime:"09:00",endTime:"10:00",category:"General",reminder:"",priority:"Normal",status:"Pending",mood:"\u{1F60A}",note:"",goal:1,frequency:"Daily",target:30,current:0,duration:"30 days",time:"19:00",amount:"",renewalDate:t.selectedDate,content:"",tags:""},b()}function na(n){t.view!==n&&(t.view&&t.view!=="home"&&t.navigationHistory.push(t.view),t.view=n),b()}function ye(){if(t.view==="reset-options"){t.resetConfirmOpen=!1;let n=Array.isArray(t.navigationHistory)?t.navigationHistory:[];n[n.length-1]==="settings"&&n.pop(),t.view="settings",b();return}if(t.view==="goal-create"){let n=t.navigationHistory||[];n[n.length-1]==="goal-achievements"&&n.pop(),t.view="goal-achievements",b();return}if(t.view==="goal-edit"){t.goalAchievementEditingId=null;let n=t.navigationHistory||[];n[n.length-1]==="goal-achievements"&&n.pop(),t.view="goal-achievements",b();return}if(t.view==="calendar"){t.view="home",t.navigationHistory=(t.navigationHistory||[]).filter(n=>n!=="menu"&&n!=="calendar"),t.moreMenuOpen=!1,t.menuOpen=!1,b();return}t.navigationHistory.length>0?t.view=t.navigationHistory.pop():t.view="home",b()}function sa(){t.entryModalOpen=!1,t.entryDraft=null,b()}window.sahraIsHome=()=>t.view==="home"&&!t.entryModalOpen&&!t.profileModalOpen&&!t.moreMenuOpen&&!t.menuOpen&&!t.moodPickerOpen&&!t.progressPickerOpen&&!t.resetConfirmOpen;window.sahraHandleNativeBack=()=>t.progressPickerOpen?(t.progressPickerOpen=!1,b(),!0):t.resetConfirmOpen?(t.resetConfirmOpen=!1,b(),!0):t.focusAlarmActive?(ca(),!0):t.entryModalOpen?(sa(),!0):t.profileModalOpen?(t.profileModalOpen=!1,t.profileEditing=!1,b(),!0):t.showFinanceResetConfirm?(t.showFinanceResetConfirm=!1,b(),!0):t.financeDetail?(t.financeDetail=null,b(),!0):t.calendarDetail?(t.calendarDetail=null,b(),!0):t.moreMenuOpen||t.menuOpen||t.moodPickerOpen?(t.moreMenuOpen=!1,t.menuOpen=!1,t.moodPickerOpen=!1,b(),!0):t.view!=="home"?(ye(),!0):!1;function ci(){if(!t.profileModalOpen)return"";let n=t.user||{},e=n.profile||{},a=t.profileDraft||{name:n.name||"",dateOfBirth:e.dateOfBirth?new Date(e.dateOfBirth).toISOString().slice(0,10):""},s=!!t.profileEditing,i=t.profileSuccessMessage||"",o=e.dateOfBirth?new Date(e.dateOfBirth).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"Not set",l=!!e.phone;return`
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
              <input class="profile-input" data-field="name" value="${(a.name||"").replace(/"/g,"&quot;")}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Date of Birth
              <input class="profile-input" data-field="dateOfBirth" type="date" value="${a.dateOfBirth||""}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
              Email (Cannot be edited)
              <input type="email" disabled value="${n.email||""}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
            </label>

            ${l?`
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

            ${l?`
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
  `}function li(){if(!t.entryModalOpen||!t.entryDraft)return"";let n=["\u{1F60A}","\u{1F610}","\u{1F622}","\u{1F621}","\u{1F634}","\u{1F525}","\u{1F60D}"],e=t.entryDraft;return`
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
              <input type="date" data-entry-field="date" min="${U(new Date)}" value="${e.date||t.selectedDate}" />
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
              <input type="date" data-entry-field="date" min="${U(new Date)}" value="${e.date||t.selectedDate}" />
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
                <input type="date" data-entry-field="${e.type==="expense"?"date":"renewalDate"}" value="${e.type==="expense"?e.date||t.selectedDate:e.renewalDate||t.selectedDate}" />
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
  `}function di(){let n=new Date,e=U(n),a=new Date(t.currentYear,t.currentMonth,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"}),s=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],o=new Date(t.currentYear,t.currentMonth,1).getDay(),l=new Date(t.currentYear,t.currentMonth+1,0).getDate(),m=new Date(t.currentYear,t.currentMonth,0).getDate(),r={events:new Set((t.data.events||[]).map($=>V($.date))),tasks:new Set((t.data.tasks||[]).filter($=>!$e($)).map($=>V($.date))),moods:new Set((t.data.moods||[]).map($=>V($.date)))},h=[];for(let $=0;$<o;$+=1)h.push({value:m-o+$+1,empty:!0});for(let $=1;$<=l;$+=1){let M=U(new Date(t.currentYear,t.currentMonth,$));h.push({value:$,empty:!1,active:M===t.selectedDate,iso:M,hasEvent:r.events.has(M),hasTask:r.tasks.has(M),hasMood:r.moods.has(M)})}for(;h.length%7!==0;)h.push({value:h.length-l-o+1,empty:!0});let f=(Array.isArray(t.data.tasks)?t.data.tasks:[]).filter($=>!$e($)).filter($=>V($.date)===e).sort(($,M)=>+!!($.completed||$.status==="Completed")-+!!(M.completed||M.status==="Completed")),w=f.filter($=>$.completed||$.status==="Completed").length,I=f.length,N=I?Math.round(w/I*100):0,D=(Array.isArray(t.data.events)?t.data.events:[]).filter($=>V($.date)===e).sort(($,M)=>String($.time||"").localeCompare(String(M.time||""))),v=Array.isArray(t.financeData)?t.financeData:[],C=v.filter($=>V($.date)===e),F=$=>$.filter(M=>String(M.type||"").toLowerCase()==="income").reduce((M,ee)=>M+(Number(ee.amount)||0),0),j=$=>$.filter(M=>String(M.type||"").toLowerCase()==="expense").reduce((M,ee)=>M+(Number(ee.amount)||0),0),L=F(C),x=j(C),u=F(v)-j(v),p=pa(),d=t.theme==="light",y=t.weather||{},S=y.data?.current,k=y.data?.daily,T=S?.weather_code,O=S?ct(T):"Tap View Weather for live conditions",_=S?lt(T,S.is_day):"\u2601\uFE0F",H=t.data.events.filter($=>V($.date)===t.selectedDate).length,W=y.locationLabel?P(y.locationLabel):"Local forecast";return`
    <section class="screen home-screen" aria-label="DaySync home">
      <section class="hero glass-card page-fixed-header home-hero">
        <div class="hero-top">
          <div class="brand">
            <div class="brand-mark">${oi(52)}</div>
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
            <div class="temp-value">${S?`${Math.round(Number(S.temperature_2m))}\xB0`:"\u2014\xB0"}<span>C</span></div>
            <div class="weather-meta">${P(O)}</div>
            ${S&&k?`<div class="weather-range">H ${Math.round(Number(k.temperature_2m_max?.[0]))}\xB0 \xB7 L ${Math.round(Number(k.temperature_2m_min?.[0]))}\xB0</div>`:`<div class="weather-range">${y.status==="error"?"Weather unavailable":"Live data \xB7 no sample values"}</div>`}
          </div>
          <div class="weather-icon" aria-hidden="true">${_}</div>
        </div>
        <div class="weather-live-footer"><span class="weather-live-dot ${S?"is-live":""}"></span><span>${S?`Live \xB7 ${W}`:y.status==="loading"?"Loading live weather\u2026":"Real weather appears after you open View Weather"}</span></div>
      </section>

      <section class="glass-card layout-card calendar-card">
        <div class="calendar-header"><h3>${a}</h3><div class="calendar-actions">
          <button class="calendar-arrow" type="button" data-action="prev-month" aria-label="Previous month">\u2039</button>
          <button class="calendar-arrow" type="button" data-action="next-month" aria-label="Next month">\u203A</button>
          <button class="today-button" type="button" data-action="today">Today</button>
        </div></div>
        <div class="calendar-grid">
          ${s.map($=>`<div class="calendar-weekday">${$}</div>`).join("")}
          ${h.map($=>{let M=[];return $.hasEvent&&M.push('<span class="mini-indicator event"></span>'),$.hasTask&&M.push('<span class="mini-indicator task"></span>'),$.hasMood&&M.push('<span class="mini-indicator mood"></span>'),`<button class="calendar-day ${$.empty?"dim":""} ${$.active?"selected":""}" type="button" data-date="${$.iso||""}" ${$.empty?"disabled":""}><span>${$.value}</span>${M.length?`<span class="calendar-indicators">${M.join("")}</span>`:""}</button>`}).join("")}
        </div>
        <div class="event-row">
          <div class="event-status"><span class="status-dot"></span><span>${H?`Selected day has ${H} event(s)`:"No events on this day"}</span></div>
          <div class="event-actions"><button class="show-event" type="button" data-action="show-selected-day">Show</button><button class="add-event" type="button" data-action="open-add-entry" data-type="event">+ Add Event</button></div>
        </div>
      </section>

      <section class="glass-card layout-card progress-card">
        <div class="card-header compact"><h3>Today's Progress</h3><span class="chip">${N}%</span></div>
        <div class="progress-block"><div class="progress-row"><div class="progress-label"><span>Today's task completion</span><strong>${N}%</strong></div><div class="progress-bar"><div class="progress-fill" style="width:${N}%"></div></div></div></div>
        <div class="progress-footer">${w} / ${I} tasks complete today</div>
      </section>

      <section class="daily-programs-section" aria-label="Today's Programs">
        <header class="daily-programs-heading"><div><p class="daily-programs-eyebrow">YOUR DAY AT A GLANCE</p><h2>Today's Programs</h2><p>Everything planned and recorded for today.</p></div><span class="daily-date-pill">${n.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span></header>

        <section class="glass-card daily-program-card daily-tasks-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">\u2713</span><div><h3>Today's Tasks</h3><p>${w} of ${I} complete</p></div></div><button class="daily-view-link" type="button" data-view="tasks">View all <span>\u2197</span></button></div>
          ${f.length?`<div class="daily-task-list">${f.map($=>{let M=!!($.completed||$.status==="Completed"),ee=String($.priority||"Normal"),G=ee.toLowerCase().replace(/[^a-z0-9]+/g,"-"),Fe=$.time?new Date(`2000-01-01T${String($.time).slice(0,5)}:00`).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}):"",ft=$.id||$._id||"";return`<article class="daily-task-row ${M?"is-complete":""}"><button type="button" class="daily-task-check ${M?"is-checked":""}" data-action="toggle-task" data-task-id="${ea(ft)}" aria-label="${M?"Mark incomplete":"Complete"} ${ea($.title||$.name||"task")}">${M?"\u2713":""}</button><div class="daily-task-copy"><strong>${P($.title||$.name||"Untitled task")}</strong><span>${Fe?`${P(Fe)} \xB7 `:""}${P($.category||"Task")}</span></div><span class="daily-priority priority-${G}">${P(ee)}</span></article>`}).join("")}</div>`:`<div class="daily-empty-state"><span class="daily-empty-icon">\u2713</span><div><strong>No tasks for today</strong><p>Add a task with today's date to plan your day.</p></div><button type="button" class="daily-add-button" data-action="open-add-entry" data-type="task">+ Add Task</button></div>`}
        </section>

        <section class="glass-card daily-program-card daily-events-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">\u25A6</span><div><h3>Today's Events</h3><p>${D.length} scheduled</p></div></div><button class="daily-view-link" type="button" data-action="view-today-events">View all <span>\u2197</span></button></div>
          ${D.length?`<div class="daily-event-list">${D.map($=>{let M=$.time?String($.time).slice(0,5):"";return`<article class="daily-event-row"><span class="daily-event-time">${M?P(M):"All day"}</span><span class="daily-event-marker" aria-hidden="true"></span><div class="daily-event-copy"><strong>${P($.title||$.name||"Untitled event")}</strong><span>${P($.location||$.category||($.description?String($.description).slice(0,80):"Scheduled today"))}</span></div><span class="daily-reminder-icon" title="${$.reminder?"Reminder set":"No reminder shown"}" aria-label="${$.reminder?"Reminder set":"No reminder shown"}">${$.reminder?"\u{1F514}":"\u25F7"}</span></article>`}).join("")}</div>`:'<div class="daily-empty-state"><span class="daily-empty-icon">\u25A6</span><div><strong>No events for today</strong><p>Your saved events for today will appear here.</p></div><button type="button" class="daily-add-button" data-action="open-add-entry" data-type="event">+ Add Event</button></div>'}
        </section>

        <section class="glass-card daily-program-card daily-finance-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">\u20B9</span><div><h3>Income &amp; Expenses</h3><p>From your saved transactions</p></div></div><button class="daily-view-link" type="button" data-view="finance">Finance <span>\u2197</span></button></div>
          <div class="daily-money-grid">
            <article class="daily-money-card income"><span>Today's income</span><strong>${Me(L)}</strong></article>
            <article class="daily-money-card expense"><span>Today's expenses</span><strong>${Me(x)}</strong></article>
            <article class="daily-money-card net"><span>Today's net</span><strong>${Me(L-x)}</strong><small>Income minus expenses today</small></article>
            <article class="daily-money-card balance"><span>Total balance</span><strong>${Me(u)}</strong><small>All saved income minus expenses</small></article>
          </div>
          ${C.length?`<div class="daily-transactions-list"><h4>Today's transactions</h4>${C.slice().sort(($,M)=>new Date(M.date)-new Date($.date)).map($=>{let M=String($.type||"").toLowerCase()==="income";return`<div class="daily-transaction-row"><span class="daily-transaction-type ${M?"is-income":"is-expense"}">${M?"\u2199":"\u2197"}</span><span class="daily-transaction-name">${P($.category||$.title||$.note||(M?"Income":"Expense"))}<small>${P($.note||$.description||$.paymentMethod||$.payment_method||"")}</small></span><strong class="${M?"money-positive":"money-negative"}">${M?"+":"\u2212"}${Me($.amount).replace(/^₹\s?/,"\u20B9")}</strong></div>`}).join("")}</div>`:'<p class="daily-finance-empty">No income or expense transactions recorded today.</p>'}
        </section>
      </section>
    </section>
  `}function ct(n){let e=Number(n);return e===0?"Clear sky":e===1?"Mainly clear":e===2?"Partly cloudy":e===3?"Overcast":e===45||e===48?"Foggy":[51,53,55].includes(e)?"Drizzle":[56,57].includes(e)?"Freezing drizzle":[61,63,65].includes(e)?"Rain":[66,67].includes(e)?"Freezing rain":[71,73,75,77].includes(e)?"Snow":[80,81,82].includes(e)?"Rain showers":[85,86].includes(e)?"Snow showers":e===95?"Thunderstorm":[96,99].includes(e)?"Thunderstorm with hail":"Conditions unavailable"}function lt(n,e=1){let a=Number(n);return a===0?Number(e)?"\u2600\uFE0F":"\u{1F319}":[1,2].includes(a)?Number(e)?"\u{1F324}\uFE0F":"\u2601\uFE0F":a===3?"\u2601\uFE0F":[45,48].includes(a)?"\u{1F32B}\uFE0F":[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(a)?"\u{1F327}\uFE0F":[71,73,75,77,85,86].includes(a)?"\u{1F328}\uFE0F":[95,96,99].includes(a)?"\u26C8\uFE0F":"\u{1F326}\uFE0F"}function st(n){if(!n)return"\u2014";let e=new Date(n);return Number.isNaN(e.getTime())?String(n).slice(-5):e.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}function ui(){let n=t.weather||{},e=n.data,a=e?.current,s=e?.daily,i=e?.hourly,o=a&&i?.time?.length?Math.max(0,i.time.reduce((g,f,w)=>{let I=Date.parse(a.time||""),N=Date.parse(f||"");return!Number.isFinite(N)||!Number.isFinite(I)?g:Math.abs(N-I)<Math.abs(Date.parse(i.time[g]||"")-I)?w:g},0)):0,l=t.theme==="light",m=P(n.locationLabel||"Current location"),r=(g,f,w="",I="\u2022")=>`<article class="weather-metric-card"><span class="weather-metric-icon" aria-hidden="true">${I}</span><div class="weather-metric-copy"><span>${g}</span><strong>${f}</strong>${w?`<small>${w}</small>`:""}</div></article>`,h=n.status==="loading"?'<div class="weather-status-panel is-loading"><span class="weather-spinner"></span><div><strong>Getting real weather\u2026</strong><p>Fetching current conditions and the forecast.</p></div></div>':n.status==="error"?`<div class="weather-status-panel is-error"><span class="weather-status-symbol">!</span><div><strong>Weather unavailable</strong><p>${P(n.error||"Could not fetch weather data.")}</p><p>Allow location access or search for a city below.</p>${window.Capacitor?.isNativePlatform?.()&&/location|permission|gps|services|denied/i.test(n.error||"")?'<div class="weather-permission-actions"><button type="button" data-action="open-location-permission-settings">App permissions</button><button type="button" data-action="open-device-location-settings">Device location</button></div>':""}</div></div>`:a?"":'<div class="weather-status-panel"><span class="weather-status-symbol">\u2601</span><div><strong>Live weather, not estimates</strong><p>Use your device location or search a city to load current weather from the forecast service.</p></div></div>';return`
    <section class="screen weather-page" aria-label="Detailed weather">
      <header class="weather-page-header daysync-common-header"><button type="button" class="weather-back-button" data-action="weather-back" aria-label="Back to home">\u2039</button><div class="weather-page-heading"><p>DAYSYNC \u2022 LIVE FORECAST</p><h1>Weather</h1><span>${m}</span></div><button type="button" class="weather-refresh-button" data-action="weather-refresh" ${n.status==="loading"?"disabled":""} aria-label="Refresh weather">\u21BB</button></header>
      ${h}
      ${a&&e?`
        <section class="weather-hero-panel">
          <div class="weather-hero-top"><span class="weather-live-label"><i></i> LIVE DATA</span><span class="weather-updated">Updated ${P(st(n.updatedAt))}</span></div>
          <div class="weather-hero-main"><div><p class="weather-condition-label">${P(ct(a.weather_code))}</p><div class="weather-hero-temperature">${Math.round(Number(a.temperature_2m))}<span>\xB0C</span></div><p class="weather-feels-like">Feels like ${Math.round(Number(a.apparent_temperature))}\xB0C</p></div><div class="weather-hero-icon" aria-hidden="true">${lt(a.weather_code,a.is_day)}</div></div>
          <div class="weather-hero-range"><span>Today\u2019s high <strong>${Math.round(Number(s?.temperature_2m_max?.[0]))}\xB0</strong></span><span>Today\u2019s low <strong>${Math.round(Number(s?.temperature_2m_min?.[0]))}\xB0</strong></span></div>
        </section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>RIGHT NOW</p><h2>Weather details</h2></div><span>Real-time forecast</span></div>
          <div class="weather-metrics-grid">
            ${r("Humidity",`${Math.round(Number(a.relative_humidity_2m))}%`,"Relative humidity","\u25CC")}
            ${r("Wind speed",`${Math.round(Number(a.wind_speed_10m))} km/h`,`Direction ${Math.round(Number(a.wind_direction_10m))}\xB0`,"\u2197")}
            ${r("Wind gusts",`${Math.round(Number(a.wind_gusts_10m))} km/h`,"Peak wind gust","\u224B")}
            ${r("Pressure",`${Math.round(Number(a.pressure_msl))} hPa`,"Sea-level pressure","\u2301")}
            ${r("Visibility",Number.isFinite(Number(i?.visibility?.[o]))?`${(Number(i.visibility[o])/1e3).toFixed(1)} km`:"\u2014","Forecast estimate","\u25C9")}
            ${r("Dew point",Number.isFinite(Number(i?.dew_point_2m?.[o]))?`${Math.round(Number(i.dew_point_2m[o]))}\xB0C`:"\u2014","Moisture in the air","\u2744")}
            ${r("UV index",Number.isFinite(Number(i?.uv_index?.[o]))?Number(i.uv_index[o]).toFixed(1):Number.isFinite(Number(s?.uv_index_max?.[0]))?`Max ${Number(s.uv_index_max[0]).toFixed(1)}`:"\u2014","Sun exposure level","\u263C")}
            ${r("Precipitation",`${Number(a.precipitation||0).toFixed(1)} mm`,`Rain ${Number(a.rain||0).toFixed(1)} mm \xB7 Showers ${Number(a.showers||0).toFixed(1)} mm`,"\u2602")}
            ${r("Cloud cover",`${Math.round(Number(a.cloud_cover))}%`,"Sky covered by clouds","\u2601")}
            ${r("Rain chance",Number.isFinite(Number(i?.precipitation_probability?.[o]))?`${Math.round(Number(i.precipitation_probability[o]))}%`:Number.isFinite(Number(s?.precipitation_probability_max?.[0]))?`${Math.round(Number(s.precipitation_probability_max[0]))}% max today`:"\u2014","Probability of precipitation","\u25D2")}
          </div>
        </section>
        <section class="weather-sun-grid"><article class="weather-sun-card sunrise"><span>\u2600</span><div><small>Sunrise</small><strong>${P(st(s?.sunrise?.[0]))}</strong></div></article><article class="weather-sun-card sunset"><span>\u263E</span><div><small>Sunset</small><strong>${P(st(s?.sunset?.[0]))}</strong></div></article></section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>COMING UP</p><h2>Hourly forecast</h2></div><span>Next 6 hours</span></div><div class="weather-hourly-strip">${(i?.time||[]).slice(o,o+6).map((g,f)=>{let w=o+f;return`<article class="weather-hour-card"><span>${f===0?"Now":P(st(g))}</span><span class="weather-hour-icon">${lt(i.weather_code?.[w],1)}</span><strong>${Math.round(Number(i.temperature_2m?.[w]))}\xB0</strong><small>${Number.isFinite(Number(i.precipitation_probability?.[w]))?`${Math.round(Number(i.precipitation_probability[w]))}% rain`:P(ct(i.weather_code?.[w]))}</small></article>`}).join("")}</div></section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>PLAN AHEAD</p><h2>7-day forecast</h2></div><span>Daily outlook</span></div><div class="weather-daily-list">${(s?.time||[]).map((g,f)=>`<article class="weather-daily-row"><div class="weather-daily-day"><strong>${f===0?"Today":P(new Date(`${g}T12:00:00`).toLocaleDateString("en-IN",{weekday:"short"}))}</strong><small>${P(new Date(`${g}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short"}))}</small></div><span class="weather-daily-icon">${lt(s.weather_code?.[f],1)}</span><span class="weather-daily-condition">${P(ct(s.weather_code?.[f]))}</span><div class="weather-daily-temps"><span>${Math.round(Number(s.temperature_2m_min?.[f]))}\xB0</span><i><b style="width:${Math.max(8,Math.min(100,(Number(s.temperature_2m_max?.[f])-Number(s.temperature_2m_min?.[f])+8)*5))}%"></b></i><strong>${Math.round(Number(s.temperature_2m_max?.[f]))}\xB0</strong></div></article>`).join("")}</div></section>
      `:""}
      <section class="weather-search-panel"><div><p>LOCATION</p><h2>Check another city</h2><span>Search a city to load its real forecast.</span></div><form data-weather-search-form class="weather-search-form"><input name="city" type="search" placeholder="Enter city or town" autocomplete="off" required minlength="2" aria-label="City for weather forecast"><button type="submit" ${n.status==="loading"?"disabled":""}>Search</button></form><button type="button" class="weather-use-location" data-action="weather-refresh" ${n.status==="loading"?"disabled":""}>\u2197 Use my current location</button></section>
      <p class="weather-source-note">Weather and forecast provided by Open-Meteo. Location access is used only to find local forecast coordinates.</p>
    </section>`}async function Qt(n){let e=window.Capacitor?.Plugins?.DaySyncSettings;if(!window.Capacitor?.isNativePlatform?.()||typeof e?.[n]!="function"){E("Open your device Settings and select DaySync permissions.");return}try{await e[n]()}catch(a){E(a.message||"Could not open device settings.")}}async function pi(n){let e=`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({name:n,count:"1",language:"en",format:"json"})}`,a=await fetch(e);if(!a.ok)throw new Error("City search failed. Please try again.");let i=(await a.json()).results?.[0];if(!i)throw new Error(`No location found for \u201C${n}\u201D. Check the spelling and try again.`);return{latitude:i.latitude,longitude:i.longitude,label:[i.name,i.admin1,i.country].filter(Boolean).filter((o,l,m)=>m.indexOf(o)===l).join(", ")}}async function mi(){if(!!window.Capacitor?.isNativePlatform?.())try{let e=await et.checkPermissions(),a=()=>e.location==="granted"||e.coarseLocation==="granted";if(a()||(e=await et.requestPermissions({permissions:["location","coarseLocation"]})),!a())throw new Error("Location permission was denied. Allow DaySync location access in Android Settings, or search for a city below.");let s=await et.getCurrentPosition({enableHighAccuracy:e.location==="granted",timeout:15e3,maximumAge:0});return{latitude:s.coords.latitude,longitude:s.coords.longitude,label:"Your current location"}}catch(e){let a=String(e?.message||"");throw/denied|permission/i.test(a)?new Error("Location permission is unavailable. Enable location for DaySync in Android Settings, or search for a city below."):/disabled|services|location provider/i.test(a)?new Error("Turn on device location services and try again, or search for a city below."):new Error(`${a||"Could not determine your device location."} You can also search for a city below.`)}if(!navigator.geolocation)throw new Error("This browser does not support location access. Search for a city below.");return new Promise((e,a)=>{navigator.geolocation.getCurrentPosition(s=>e({latitude:s.coords.latitude,longitude:s.coords.longitude,label:"Your current location"}),s=>a(new Error(s.code===1?"Location permission was denied. Allow location access in browser settings, or search for a city below.":s.code===2?"Your location is unavailable. Turn on location services or search for a city below.":"Location lookup timed out. Try again or search for a city below.")),{enableHighAccuracy:!1,timeout:15e3,maximumAge:0})})}async function gi(n,e){let a=new URLSearchParams({latitude:String(n.latitude),longitude:String(n.longitude),current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",hourly:"temperature_2m,precipitation_probability,weather_code,visibility,dew_point_2m,uv_index",daily:"weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",timezone:"auto",forecast_days:"7",wind_speed_unit:"kmh",temperature_unit:"celsius",precipitation_unit:"mm"}),s=await fetch(`https://api.open-meteo.com/v1/forecast?${a.toString()}`,{headers:{Accept:"application/json"}});if(!s.ok)throw new Error(`Weather service returned ${s.status}. Please try again.`);let i=await s.json();if(!i.current||!i.daily||!i.hourly)throw new Error("The weather service returned incomplete data. Please refresh.");t.weather.requestId===e&&(t.weather={...t.weather,status:"success",data:i,locationLabel:n.label,error:"",updatedAt:new Date().toISOString()})}async function ia(n=""){let e=Number(t.weather.requestId||0)+1;t.weather={...t.weather,requestId:e,status:"loading",error:"",data:null,locationLabel:n?"":"Your current location"},t.view==="weather"&&b();try{let a;n?a=await pi(n):a=await mi(),await gi(a,e)}catch(a){t.weather.requestId===e&&(t.weather={...t.weather,status:"error",error:a.message||"Unable to load weather data."})}finally{t.view==="weather"&&t.weather.requestId===e&&b()}}function hi(){let n=Math.max(1,Number(t.focusInitialSeconds)||1500),e=Math.max(0,Number(t.focusSeconds)||0),a=Math.min(100,Math.max(0,(n-e)/n*100)),s=String(Math.floor(e/60)).padStart(2,"0"),i=String(e%60).padStart(2,"0"),o=t.theme==="light",l=Array.isArray(t.focusSessions)?t.focusSessions:[],m=U(new Date),r=l.filter(g=>g.date===m&&g.completed),h=r.reduce((g,f)=>g+(Number(f.minutes)||0),0);return`
    <section class="screen focus-screen" aria-label="Focus Timer">
      <header class="focus-header">
        <button class="focus-back" type="button" data-action="focus-back" aria-label="Back">\u2039</button>
        <div class="focus-title-copy"><p class="focus-eyebrow">DAYSYNC \u2022 FOCUS SESSION</p><h1>Focus Timer</h1></div>
        <span class="focus-mode-pill">${t.focusRunning?"FOCUSING":t.focusAlarmActive?"COMPLETE":"READY"}</span>
      </header>
      <div class="focus-card glass-card">
        <div class="focus-label-row"><label for="focus-label">Session</label><input id="focus-label" maxlength="60" value="${ea(t.focusLabel||"Study session")}" placeholder="Study session" /></div>
        <div class="focus-ring-wrap">
          <svg class="focus-ring" viewBox="0 0 240 240" role="img" aria-label="Timer progress">
            <defs><linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="52%" stop-color="#22d3a6"/><stop offset="100%" stop-color="#4ade80"/></linearGradient></defs>
            <g class="focus-ring-ticks">${Array.from({length:60},(g,f)=>`<line x1="120" y1="7" x2="120" y2="${f%5===0?16:11}" transform="rotate(${f*6} 120 120)" />`).join("")}</g>
            <circle class="focus-ring-track" cx="120" cy="120" r="101"></circle>
            <circle class="focus-ring-progress" cx="120" cy="120" r="101" style="stroke-dasharray: ${2*Math.PI*101}; stroke-dashoffset: ${2*Math.PI*101*(1-a/100)}"></circle>
          </svg>
          <div class="focus-clock"><strong id="focus-clock">${s}:${i}</strong><span id="focus-status">${t.focusRunning?"STAY IN THE FLOW":t.focusAlarmActive?"SESSION COMPLETE":"READY WHEN YOU ARE"}</span></div>
        </div>
        <div class="focus-controls">
          <button type="button" class="focus-control secondary" data-action="focus-reset" aria-label="Reset timer" title="Reset">\u21BA</button>
          <button type="button" class="focus-control primary" data-action="focus-start" aria-label="Start timer" title="Start">\u25B6</button>
          <button type="button" class="focus-control secondary" data-action="focus-pause" aria-label="Pause timer" title="Pause">\u2B1C</button>
        </div>
        <div class="focus-custom"><label for="focus-minutes">Session length</label><div class="focus-custom-row"><input id="focus-minutes" type="number" min="1" max="180" value="${Math.max(1,Math.round((t.focusSeconds>0?t.focusSeconds:n)/60))}" ${t.focusRunning?"disabled":""}/><span>minutes</span><button type="button" data-action="focus-set" ${t.focusRunning?"disabled":""}>Set time</button></div></div>
        <div class="focus-presets"><button type="button" data-focus-minutes="15" ${t.focusRunning?"disabled":""}>15 min</button><button type="button" data-focus-minutes="25" ${t.focusRunning?"disabled":""}>25 min</button><button type="button" data-focus-minutes="45" ${t.focusRunning?"disabled":""}>45 min</button><button type="button" data-focus-minutes="60" ${t.focusRunning?"disabled":""}>60 min</button></div>
        <p class="focus-tip">${o?"A clear mind starts with one focused session.":"One session. One goal. Keep your momentum."}</p>
      </div>
      <div class="focus-stats"><div class="focus-stat glass-card"><span>Today\u2019s focus</span><strong>${h} <small>min</small></strong></div><div class="focus-stat glass-card"><span>Sessions completed</span><strong>${r.length}</strong></div><div class="focus-stat glass-card"><span>Total sessions</span><strong>${l.filter(g=>g.completed).length}</strong></div></div>
    </section>`}var ne=null,oa=941207,K=null,_e=[],dt=null,ut=null,ra=-1,ma="daysyncFocusTimerState";function ga(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function oe(){try{localStorage.setItem(ma,JSON.stringify({focusSeconds:Number(t.focusSeconds)||0,focusInitialSeconds:Number(t.focusInitialSeconds)||1500,focusRunning:!!t.focusRunning,focusEndsAt:Number(t.focusEndsAt)||null,focusLabel:String(t.focusLabel||"Study session").slice(0,60),focusAlarmActive:!!t.focusAlarmActive,focusAlarmStartedAt:Number(t.focusAlarmStartedAt)||null,focusSessionId:t.focusSessionId||null,focusLastCompletedId:t.focusLastCompletedId||null}))}catch(n){console.warn("Could not persist Focus Timer state:",n)}}function pe({closeContext:n=!0}={}){if(dt&&clearInterval(dt),ut&&clearTimeout(ut),dt=null,ut=null,_e.forEach(e=>{try{e.stop()}catch{}}),_e=[],n&&K){let e=K;K=null;try{e.close()}catch{}}}function fi(){let n=window.AudioContext||window.webkitAudioContext;if(n)try{(!K||K.state==="closed")&&(K=new n),K.state==="suspended"&&K.resume().catch(()=>{})}catch(e){console.warn("Focus alarm audio could not be prepared:",e)}}function Bn(n=1e4){let e=window.AudioContext||window.webkitAudioContext;if(!(!e||n<=0)){pe({closeContext:!1});try{(!K||K.state==="closed")&&(K=new e);let a=K;a.state==="suspended"&&a.resume().catch(()=>{});let s=Date.now(),i=()=>{if(!K||K!==a||Date.now()-s>=n)return;let o=a.currentTime;[0,.18].forEach((l,m)=>{let r=a.createOscillator(),h=a.createGain();r.type="sine",r.frequency.value=m?1046.5:880,h.gain.setValueAtTime(1e-4,o+l),h.gain.exponentialRampToValueAtTime(.2,o+l+.02),h.gain.exponentialRampToValueAtTime(1e-4,o+l+.15),r.connect(h),h.connect(a.destination),r.start(o+l),r.stop(o+l+.17),_e.push(r),r.onended=()=>{_e=_e.filter(g=>g!==r);try{r.disconnect(),h.disconnect()}catch{}}})};i(),dt=setInterval(i,650),ut=setTimeout(()=>pe({closeContext:!0}),n)}catch(a){console.warn("Focus alarm audio is unavailable on this device:",a),pe()}}}async function ht({removeDelivered:n=!1}={}){if(window.Capacitor?.isNativePlatform?.())try{await J.cancel({notifications:[{id:oa}]}),n&&await J.removeDeliveredNotifications({notifications:[{id:oa}]})}catch(e){console.warn("Could not cancel Focus Timer notification:",e.message)}}async function yi(n){if(!window.Capacitor?.isNativePlatform?.()){if("Notification"in window&&Notification.permission==="default")try{await Notification.requestPermission()}catch{}return}try{window.SAHRA_NOTIFICATIONS?.ready&&await window.SAHRA_NOTIFICATIONS.ready;let e=await J.checkPermissions();if(e.display!=="granted"&&["prompt","prompt-with-rationale","unknown"].includes(e.display)&&(e=await J.requestPermissions()),e.display!=="granted"){E("Enable DaySync notifications in Android Settings to receive timer alerts while the app is in the background.");return}await J.schedule({notifications:[{id:oa,title:"Focus session complete",body:`${t.focusLabel||"Your focus session"} is finished. Tap Reset to start another session.`,schedule:{at:new Date(Date.now()+Math.max(1,n)*1e3),allowWhileIdle:!0},sound:"daysync_alarm.wav",channelId:"daysync-focus-alarm",actionTypeId:"daysync-focus-alarm",autoCancel:!1,ongoing:!0,foreground:!0,isExactNotification:!0,isExactMandatory:!0,extra:{type:"focus-alarm",sessionId:String(t.focusSessionId||"")}}]})}catch(e){console.warn("Could not schedule background Focus Timer alert:",e.message),E("Android could not schedule the exact Focus alarm. Allow DaySync notifications and Alarms & reminders in Settings, then start the timer again.")}}function bi(){let n=document.getElementById("focus-clock");n&&(n.textContent=`${String(Math.floor(t.focusSeconds/60)).padStart(2,"0")}:${String(t.focusSeconds%60).padStart(2,"0")}`);let e=document.querySelector(".focus-ring-progress");e&&(e.style.strokeDashoffset=`${2*Math.PI*101*(1-(t.focusInitialSeconds-t.focusSeconds)/Math.max(1,t.focusInitialSeconds))}`)}function ha(){if(!(t.focusAlarmActive||!t.focusRunning&&t.focusSeconds===0&&t.focusLastCompletedId===t.focusSessionId)){if(clearInterval(ne),ne=null,t.focusRunning=!1,t.focusStartedAt=null,t.focusEndsAt=null,t.focusSeconds=0,t.focusSessionId||(t.focusSessionId=ga()),t.focusLastCompletedId!==t.focusSessionId){let n=Math.max(1,Math.round((t.focusInitialSeconds||1500)/60)),e=new Date,a=new Date(e.getTime()-n*60*1e3),s={date:U(e),sessionDate:U(e),minutes:n,plannedMinutes:n,label:t.focusLabel||"Study session",completed:!0,startedAt:a.toISOString(),endedAt:e.toISOString(),completedAt:e.toISOString(),sessionId:t.focusSessionId},i=Array.isArray(t.focusSessions)?t.focusSessions:[];i.unshift(s),t.focusSessions=i.slice(0,500),t.focusLastCompletedId=t.focusSessionId;try{localStorage.setItem("sahraFocusSessions",JSON.stringify(t.focusSessions))}catch{}t.authenticated&&q("/api/focus/sessions",{method:"POST",headers:{"Idempotency-Key":`focus-${t.focusSessionId}`},body:JSON.stringify({sessionId:t.focusSessionId,sessionDate:s.sessionDate,plannedMinutes:n,startedAt:s.startedAt,endedAt:s.endedAt,completed:!0,label:s.label})}).catch(o=>console.warn("Focus session will remain in local history until it can sync:",o.message))}if(t.focusAlarmActive=!0,t.focusAlarmStartedAt=Date.now(),oe(),document.visibilityState!=="hidden"&&Bn(1e4),"Notification"in window&&Notification.permission==="granted"&&!window.Capacitor?.isNativePlatform?.()&&document.visibilityState==="hidden")try{new Notification("DaySync Focus Timer",{body:`${t.focusLabel||"Focus session"} is complete.`,icon:"./image-192.png",tag:"daysync-focus-complete"})}catch{}document.visibilityState==="visible"&&ht({removeDelivered:!0}),E("Focus session complete! Your alarm will stop after 10 seconds."),b()}}function pt(){!t.focusRunning||!t.focusEndsAt||(t.focusSeconds=Math.max(0,Math.ceil((t.focusEndsAt-Date.now())/1e3)),t.focusSeconds!==ra&&(ra=t.focusSeconds,oe()),bi(),t.focusSeconds<=0&&ha())}function Un({resume:n=!1}={}){clearInterval(ne),t.focusRunning=!0,(!n||!t.focusEndsAt)&&(t.focusEndsAt=Date.now()+Math.max(1,t.focusSeconds)*1e3),t.focusStartedAt=Date.now(),(!t.focusSessionId||t.focusLastCompletedId===t.focusSessionId)&&(t.focusSessionId=ga()),t.focusAlarmActive=!1,t.focusAlarmStartedAt=null,ra=-1,oe(),yi(t.focusSeconds),pt(),t.focusRunning&&(ne=setInterval(pt,250)),b()}function vi(){t.focusRunning&&(t.focusSeconds=Math.max(0,Math.ceil(((t.focusEndsAt||Date.now())-Date.now())/1e3)),t.focusRunning=!1,t.focusStartedAt=null,t.focusEndsAt=null,clearInterval(ne),ne=null,ht(),oe(),b())}function ca({reset:n=!1,expectedSessionId:e=null}={}){e&&t.focusSessionId&&e!==t.focusSessionId||(pe(),t.focusAlarmActive=!1,t.focusAlarmStartedAt=null,t.focusRunning=!1,t.focusEndsAt=null,clearInterval(ne),ne=null,ht({removeDelivered:!0}),n&&(t.view="focus",t.focusSeconds=Math.max(1,Number(t.focusInitialSeconds)||1500),t.focusSessionId=null),oe(),b())}function fa(){if(document.getElementById("daysync-focus-alarm-overlay")?.remove(),!t.focusAlarmActive)return;let n=document.createElement("section");n.id="daysync-focus-alarm-overlay",n.className="daysync-focus-alarm",n.setAttribute("role","alertdialog"),n.setAttribute("aria-live","assertive"),n.innerHTML=`
    <div class="daysync-focus-alarm-copy"><span class="daysync-focus-alarm-icon" aria-hidden="true">\u23F1</span><div><strong>Focus session completed</strong><p>${P(t.focusLabel||"Your focus session")} is finished.</p></div></div>
    <div class="daysync-focus-alarm-actions"><button type="button" data-focus-alarm-action="stop">Stop</button><button type="button" data-focus-alarm-action="reset">Reset</button></div>`,document.body.appendChild(n)}function ya({actionId:n,sessionId:e}={}){let a=e?String(e):null;a&&t.focusSessionId&&a!==String(t.focusSessionId)||(t.focusRunning&&t.focusEndsAt&&t.focusEndsAt<=Date.now()&&ha(),n==="stop"&&ca({expectedSessionId:a}),n==="reset"&&ca({reset:!0,expectedSessionId:a}))}window.SAHRA_HANDLE_FOCUS_ALARM_ACTION=ya;function wi(){try{let n=localStorage.getItem("daysyncPendingFocusAlarmAction");if(!n)return;localStorage.removeItem("daysyncPendingFocusAlarmAction"),ya(JSON.parse(n))}catch(n){console.warn("Could not restore Focus Timer notification action:",n)}}function xi(){try{let n=JSON.parse(localStorage.getItem(ma)||"null");if(!n||typeof n!="object")return;if(t.focusInitialSeconds=Math.max(60,Math.min(10800,Number(n.focusInitialSeconds)||1500)),t.focusSeconds=Math.max(0,Math.min(t.focusInitialSeconds,Number(n.focusSeconds)||0)),t.focusLabel=String(n.focusLabel||"Study session").slice(0,60),t.focusSessionId=n.focusSessionId||null,t.focusLastCompletedId=n.focusLastCompletedId||null,t.focusAlarmActive=!!n.focusAlarmActive,t.focusAlarmStartedAt=Number(n.focusAlarmStartedAt)||null,n.focusRunning&&Number(n.focusEndsAt)>0)t.focusRunning=!0,t.focusEndsAt=Number(n.focusEndsAt),t.focusSeconds=Math.max(0,Math.ceil((t.focusEndsAt-Date.now())/1e3)),t.focusSeconds<=0?ha():Un({resume:!0});else{if(t.focusRunning=!1,t.focusEndsAt=null,t.focusAlarmActive){let e=t.focusAlarmStartedAt?Date.now()-t.focusAlarmStartedAt:1e4;e>=0&&e<1e4&&document.visibilityState!=="hidden"&&Bn(1e4-e)}oe()}}catch(n){console.warn("Could not restore Focus Timer state:",n)}b()}function Si(){let n=document.getElementById("app");if(!n||t.view!=="focus")return;let e=n.querySelector("#focus-label");e?.addEventListener("change",()=>{t.focusLabel=e.value.trim()||"Study session",oe()}),n.querySelectorAll("[data-focus-minutes]").forEach(a=>a.addEventListener("click",()=>{if(t.focusRunning)return;let s=Math.max(1,Math.min(180,Number(a.dataset.focusMinutes)||25));t.focusSeconds=t.focusInitialSeconds=s*60,t.focusSessionId=null,t.focusAlarmActive=!1,oe(),b()})),n.querySelectorAll('[data-action^="focus-"]').forEach(a=>a.addEventListener("click",()=>{let s=a.dataset.action;if(s==="focus-back"&&ye(),s==="focus-start"){if(t.focusRunning)return;let i=document.getElementById("focus-label");t.focusLabel=i?.value?.trim()||t.focusLabel||"Study session",t.focusSeconds<=0&&(t.focusSeconds=t.focusInitialSeconds),(!t.focusSessionId||t.focusLastCompletedId===t.focusSessionId)&&(t.focusSessionId=ga()),pe(),fi(),Un()}if(s==="focus-reset"&&(t.focusRunning=!1,t.focusEndsAt=null,clearInterval(ne),ne=null,pe(),ht({removeDelivered:!0}),t.focusAlarmActive=!1,t.focusAlarmStartedAt=null,t.focusSeconds=t.focusInitialSeconds,t.focusSessionId=null,oe(),b()),s==="focus-pause"&&t.focusRunning&&vi(),s==="focus-set"){let i=document.getElementById("focus-minutes"),o=Math.max(1,Math.min(180,Number(i?.value)||25));t.focusSeconds=t.focusInitialSeconds=o*60,t.focusSessionId=null,t.focusAlarmActive=!1,oe(),b()}}))}document.addEventListener("click",n=>{let e=n.target.closest("[data-focus-alarm-action]");e&&ya({actionId:e.dataset.focusAlarmAction,sessionId:t.focusSessionId})});window.addEventListener("daysync:resume",()=>{t.focusRunning&&pt(),t.focusAlarmActive&&fa()});document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(t.focusRunning&&pt(),t.focusAlarmActive&&fa())});function ki(){let n=Array.isArray(t.data.tasks)?t.data.tasks:[],e=Array.isArray(t.data.events)?t.data.events:[],a=Array.isArray(t.data.habits)?t.data.habits:[],s=Array.isArray(t.data.goals)?t.data.goals:[],i=["January","February","March","April","May","June","July","August","September","October","November","December"],o=i[t.currentMonth]||i[new Date().getMonth()],l=U(new Date),m=(Array.isArray(t.financeData)?t.financeData:[]).filter(c=>{if(!c?.date)return!1;let A=new Date(c.date);return Number.isNaN(A.getTime())?!1:A.getFullYear()===Number(t.currentYear)&&A.getMonth()===Number(t.currentMonth)}),r=m.filter(c=>String(c.type||"").toLowerCase()==="income").reduce((c,A)=>c+Number(A.amount||0),0),h=m.filter(c=>String(c.type||"").toLowerCase()==="expense").reduce((c,A)=>c+Number(A.amount||0),0),g=r-h,f=n.filter(c=>{if(!c.date)return!1;let A=String(c.date).slice(0,10).split("-");if(A.length<3)return!1;let R=Number(A[0]),B=Number(A[1])-1;return R===Number(t.currentYear)&&B===Number(t.currentMonth)}),w=f.filter(c=>c.completed||c.status==="Completed").length,I=f.filter(c=>c.completed||c.status==="Completed"?!1:c.status==="Overdue"||c.date&&String(c.date).slice(0,10)<l).length,N=f.filter(c=>{let A=c.completed||c.status==="Completed",R=c.status==="Overdue"||c.date&&String(c.date).slice(0,10)<l;return!A&&!R}).length,D=f.length,v=e.filter(c=>{if(!c.date)return!1;let A=String(c.date).slice(0,10).split("-");if(A.length<3)return!1;let R=Number(A[0]),B=Number(A[1])-1;return R===Number(t.currentYear)&&B===Number(t.currentMonth)}),C=[...f.map(c=>({type:c.completed||c.status==="Completed"?"task-complete":"task-pending",label:c.completed||c.status==="Completed"?`Completed task \u201C${c.title}\u201D`:`Task \u201C${c.title}\u201D`,timeLabel:c.date?yn(c.date):"This month"})),...v.map(c=>({type:"event",label:`Event \u201C${c.title}\u201D`,timeLabel:c.date?yn(c.date):"This month"})),...a.slice(0,2).map(c=>({type:"habit",label:`Habit \u201C${c.name}\u201D`,timeLabel:c.frequency||"Daily"})),...s.slice(0,2).map(c=>({type:"goal",label:`Goal \u201C${c.title}\u201D`,timeLabel:c.status||"Active"}))],F=t.progressData?.period?.year===Number(t.currentYear)&&t.progressData?.period?.month===Number(t.currentMonth)+1?t.progressData:null,j=F?.stats||{totalTasks:D,completedTasks:w,pendingTasks:N,overdueTasks:I,completionPercent:D>0?Math.round(w/D*100):0},L=Math.max(0,Number(j.totalTasks??f.length)||0),x=Math.min(L,Math.max(0,Number(j.completedTasks)||0)),u=Math.min(Math.max(0,L-x),Math.max(0,Number(j.overdueTasks)||0)),p=Math.max(0,L-x-u),d=L?Math.max(0,Math.min(100,Math.round(x/L*100))):0,y=`${Number(t.currentYear)}-${String(Number(t.currentMonth)+1).padStart(2,"0")}`,S=c=>{let A=V(c);return!!(A&&A.slice(0,7)===y)},k=Array.isArray(t.data.assets)&&t.data.assets.length?t.data.assets:Array.isArray(t.data.notes)?t.data.notes:[],T=k.filter(c=>S(c.createdAt||c.date)),O=we([...Array.isArray(t.goalAchievementItems)?t.goalAchievementItems:[],...Array.isArray(t.data.goalAchievements)?t.data.goalAchievements:[]],[]),_=O.filter(c=>S(c.createdAt||c.createdOn)),H=O.filter(c=>(c.status==="Completed"||Number(c.current||0)>=Number(c.target||1))&&S(c.completedAt||c.updatedAt||c.createdAt)),W=(Array.isArray(t.data.moods)?t.data.moods:[]).filter(c=>S(c.date||c.createdAt)),$={"\u{1F60A}":"Happy","\u{1F610}":"Normal","\u{1F622}":"Sad","\u{1F621}":"Angry","\u{1F634}":"Tired","\u{1F525}":"Motivated","\u{1F60D}":"Excited"},M=W.reduce((c,A)=>{let R=String(A.mood||"").trim();return R&&(c[R]=(c[R]||0)+1),c},{}),ee=Object.entries(M).map(([c,A])=>({emoji:c,count:A,label:$[c]||"Mood"})).sort((c,A)=>A.count-c.count||c.emoji.localeCompare(A.emoji)),G=ee[0]||null,Fe=Array.isArray(t.focusStatsData?.records)?t.focusStatsData.records:[],ft=Array.isArray(t.focusSessions)?t.focusSessions:[],yt=new Map;[...Fe,...ft].forEach((c,A)=>{if(!c||c.completed===!1)return;let R=c.sessionDate||c.date||c.endedAt||c.completedAt||c.startedAt||c.createdAt;if(!S(R))return;let B=`${V(R)}|${Number(c.minutes??c.plannedMinutes)||0}|${String(c.label||"")}|${A}`,Ce=String(c.sessionId||c._id||c.id||B),Ie=yt.get(Ce);(!Ie||!Ie._id&&(c._id||c.id))&&yt.set(Ce,c)});let re=[...yt.values()],ue=re.reduce((c,A)=>c+Math.max(0,Number(A.minutes??A.plannedMinutes)||0),0),va=ue>=60?`${Math.floor(ue/60)}h ${ue%60}m`:`${ue} min`,wa=v.filter(c=>String(c.date||"").slice(0,10)>=l).length,zn=Math.max(0,v.length-wa),bt=L?Math.round(x/L*100):0,vt=L?Math.round(p/L*100):0,xa=L?Math.max(0,100-bt-vt):0,ge=new Date(Number(t.currentYear),Number(t.currentMonth)+1,0).getDate(),Li=new Date(Number(t.currentYear),Number(t.currentMonth),1),Sa=new Date(Number(t.currentYear),Number(t.currentMonth)-1,1),Hn=`${Sa.getFullYear()}-${String(Sa.getMonth()+1).padStart(2,"0")}`,wt=n.filter(c=>{let A=V(c.date);return!!(A&&A.slice(0,7)===Hn)}),Gn=wt.filter(c=>c.completed||c.status==="Completed").length,Ne=wt.length?Math.round(Gn/wt.length*100):null,X=Ne===null?null:d-Ne,xt=["High","Normal","Low"].map(c=>{let A=f.filter(B=>String(B.priority||"Normal").toLowerCase()===c.toLowerCase()),R=A.filter(B=>B.completed||B.status==="Completed").length;return{priority:c,total:A.length,completed:R,open:A.length-R,percent:A.length?Math.round(R/A.length*100):0}}).filter(c=>c.total>0),St=xt.find(c=>c.priority==="High")?.open||0,kt=new Map;f.forEach(c=>{let A=String(c.category||"General").trim()||"General",R=kt.get(A)||{category:A,total:0,completed:0};R.total+=1,(c.completed||c.status==="Completed")&&(R.completed+=1),kt.set(A,R)});let ka=[...kt.values()].map(c=>({...c,percent:c.total?Math.round(c.completed/c.total*100):0})).sort((c,A)=>A.total-c.total||c.category.localeCompare(A.category)).slice(0,4),Wn=[{label:"Week 1",start:1,end:7},{label:"Week 2",start:8,end:14},{label:"Week 3",start:15,end:21},{label:"Week 4",start:22,end:Math.min(28,ge)},{label:"Week 5",start:29,end:ge}].filter(c=>c.start<=ge).map(c=>{let A=f.filter(B=>{let Ce=V(B.date);if(!Ce)return!1;let Ie=Number(Ce.slice(8,10));return Ie>=c.start&&Ie<=c.end}),R=A.filter(B=>B.completed||B.status==="Completed").length;return{...c,total:A.length,completed:R,open:A.length-R,percent:A.length?Math.round(R/A.length*100):0}}),At=new Map;re.forEach(c=>{let A=c.sessionDate||c.date||c.endedAt||c.completedAt||c.startedAt||c.createdAt,R=V(A);if(!R)return;let B=Math.max(0,Number(c.minutes??c.plannedMinutes)||0);At.set(R,(At.get(R)||0)+B)});let $t=[...At.entries()].sort((c,A)=>c[0].localeCompare(A[0])),Te=$t.length,Aa=re.length?Math.round(ue/re.length):0,Yn=Te?Math.round(ue/Te):0,Et=[...$t].sort((c,A)=>A[1]-c[1])[0]||null,$a=[{label:"W1",start:1,end:7},{label:"W2",start:8,end:14},{label:"W3",start:15,end:21},{label:"W4",start:22,end:28},{label:"W5",start:29,end:ge}].filter(c=>c.start<=ge).map(c=>{let A=$t.filter(([R])=>{let B=Number(R.slice(8,10));return B>=c.start&&B<=c.end}).reduce((R,B)=>R+B[1],0);return{...c,minutes:A}}),Jn=Math.max(1,...$a.map(c=>c.minutes)),Ea=O.map(c=>{let A=Math.max(0,Number(c.target)||0),R=Math.max(0,Number(c.current)||0),B=c.status==="Completed"||A>0&&R>=A;return{...c,_target:A,_current:R,_completed:B,_percent:A>0?Math.max(0,Math.min(100,Math.round(R/A*100))):null}}),Vn=Ea.filter(c=>!c._completed),Nt=Ea.filter(c=>c._percent!==null),Tt=Nt.length?Math.round(Nt.reduce((c,A)=>c+A._percent,0)/Nt.length):null,De=_.length,je=H.length,Be=new Set(W.map(c=>V(c.date||c.createdAt)).filter(Boolean)),Kn=Math.round(Be.size/Math.max(1,ge)*100),Dt=W.map(c=>Number(c.energy)).filter(c=>Number.isFinite(c)&&c>0),Na=Dt.length?Dt.reduce((c,A)=>c+A,0)/Dt.length:null,Ct=new Map;m.filter(c=>String(c.type||"").toLowerCase()==="expense").forEach(c=>{let A=String(c.category||"General").trim()||"General";Ct.set(A,(Ct.get(A)||0)+Math.max(0,Number(c.amount)||0))});let Ue=[...Ct.entries()].sort((c,A)=>A[1]-c[1])[0]||null,Xn=m.filter(c=>String(c.type||"").toLowerCase()==="expense").length,Qn=m.filter(c=>String(c.type||"").toLowerCase()==="income").length,Ta=r>0?Math.round(g/r*100):null,It=new Map;v.forEach(c=>{let A=String(c.category||"General").trim()||"General";It.set(A,(It.get(A)||0)+1)});let Pt=[...It.entries()].sort((c,A)=>A[1]-c[1])[0]||null,Lt=(Array.isArray(t.data.habitLogs)?t.data.habitLogs:[]).filter(c=>S(c.date||c.createdAt)),Zn=Lt.filter(c=>c.completed),es=new Set(Lt.map(c=>V(c.date||c.createdAt)).filter(Boolean)),ts=new Set(Lt.map(c=>String(c.habitId||c.habit||"")).filter(Boolean)),Q=[];if(L>0?(d>=80?Q.push({icon:"\u{1F3C6}",title:"Strong task follow-through",text:`You completed ${x} of ${L} scheduled tasks (${d}%). Keep using the same planning rhythm.`}):d>=50?Q.push({icon:"\u{1F4C8}",title:"Good progress with room to improve",text:`${x} tasks are complete. ${p+u} remain open; choose a small number to finish first.`}):Q.push({icon:"\u{1F3AF}",title:"Make the task list more manageable",text:`${x} of ${L} tasks are complete. Consider splitting larger tasks into smaller steps and reviewing due dates.`}),u>0?Q.push({icon:"\u23F0",title:"Overdue tasks need attention",text:`${u} task${u===1?"":"s"} are overdue. Review whether to complete, reschedule or remove each one.`}):St>0&&Q.push({icon:"\u26A1",title:"High-priority work is still open",text:`${St} high-priority task${St===1?"":"s"} remain open. Consider addressing these before lower-priority work.`})):Q.push({icon:"\u{1F4DD}",title:"No tasks scheduled in this month",text:"Add a few realistic tasks to create a useful completion trend for this month."}),X!==null){let c=X>0?"higher":X<0?"lower":"the same";Q.push({icon:X>0?"\u2197\uFE0F":X<0?"\u2198\uFE0F":"\u2194\uFE0F",title:"Compared with last month",text:`Your task completion rate is ${Math.abs(X)} percentage point${Math.abs(X)===1?"":"s"} ${c} than last month (${Ne}% previously).`})}re.length?Q.push({icon:"\u23F1\uFE0F",title:"Focus time recorded",text:`${ue} minutes across ${re.length} completed sessions and ${Te} active focus day${Te===1?"":"s"}. Your average session was ${Aa} minutes.`}):Q.push({icon:"\u23F1\uFE0F",title:"No completed focus sessions yet",text:"Completed Focus Timer sessions will appear here. Paused or unfinished sessions are not counted as completed focus time."}),(De||je)&&Q.push({icon:"\u{1F3C5}",title:"Goal activity",text:`${De} goal${De===1?"":"s"} added and ${je} completed during this month.`}),W.length&&Q.push({icon:"\u{1F49B}",title:"Mood check-ins",text:`You recorded ${W.length} mood check-in${W.length===1?"":"s"} across ${Be.size} day${Be.size===1?"":"s"}. Your most selected mood was ${G?`${G.emoji} ${G.label}`:"not available"}.`}),m.length&&Q.push({icon:"\u{1F4B0}",title:"Monthly money overview",text:g>=0?`Recorded income exceeded expenses by \u20B9${g.toLocaleString("en-IN",{maximumFractionDigits:2})}. This is based only on transactions entered in DaySync.`:`Recorded expenses exceeded income by \u20B9${Math.abs(g).toLocaleString("en-IN",{maximumFractionDigits:2})}. This is based only on transactions entered in DaySync.`});let as=Q.slice(0,6),Oi=c=>`${Math.max(0,Math.min(100,Number(c)||0))}%`,Da=c=>`\u20B9${Math.max(0,Number(c)||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`,ns=c=>{let A=String(c||"").split("-");return A.length===3?`${A[2]} ${i[Math.max(0,Number(A[1])-1)].slice(0,3)}`:"\u2014"},Ca=(F?.activity||C).map(c=>({...c,timeLabel:c.timeLabel||Bs(c.occurredAt)})).slice(0,10),Ot=t.progressPickerOpen?"open":"";return`
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

        <div class="month-picker-wrapper ${Ot}">

          <button
            class="month-picker"
            type="button"
            data-action="toggle-progress-picker"
            aria-label="Select month and year"
            aria-expanded="${t.progressPickerOpen?"true":"false"}"
          >

            <span class="picker-icon">
              \u{1F5D3}\uFE0F
            </span>

            <span class="picker-label">

              <span class="picker-month">
                ${o}
              </span>

              <span class="picker-year">
                ${t.currentYear}
              </span>

            </span>

            <span class="caret">
              \u2304
            </span>

          </button>

          <!-- BACKDROP -->

          <div
            class="month-picker-backdrop ${Ot}"
            data-action="close-progress-picker"
          ></div>

          <!-- PICKER -->

          <div
            class="month-picker-popover ${Ot}"
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
                  data-year="${t.currentYear-1}"
                >
                  ${t.currentYear-1}
                </button>

                <span
                  class="year-chip active"
                  aria-current="true"
                >
                  ${t.currentYear}
                </span>

                <button
                  class="year-chip"
                  type="button"
                  data-action="progress-year-set"
                  data-year="${t.currentYear+1}"
                >
                  ${t.currentYear+1}
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
                      class="month-option ${A===t.currentMonth?"active":""}"
                      type="button"
                      data-progress-month="${A}"
                      aria-pressed="${A===t.currentMonth?"true":"false"}"
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
            ${L>0?d>=80?`You're doing great! <span class="rocket">\u{1F680}</span>`:d>=50?'Steady progress! <span class="rocket">\u2728</span>':'Keep going! <span class="rocket">\u{1F4AA}</span>':`Ready for ${o}! <span class="rocket">\u{1F3AF}</span>`}
          </h2>

          <p>
            ${L>0?`${d}% of your tasks are complete.`:`No tasks logged for ${o} ${t.currentYear} yet.`}
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
            <p>Tasks scheduled for ${o} ${t.currentYear}</p>
          </div>
          <div class="todo-progress-score" aria-label="${d}% completed">
            <strong>${d}%</strong>
            <span>completed</span>
          </div>
        </div>
        <div class="todo-progress-track" role="img" aria-label="${x} completed, ${p} pending and ${u} overdue tasks">
          <span class="todo-progress-segment is-completed" style="width:${bt}%"></span>
          <span class="todo-progress-segment is-pending" style="width:${vt}%"></span>
          <span class="todo-progress-segment is-overdue" style="width:${xa}%"></span>
        </div>
        <div class="todo-progress-legend">
          <div class="todo-progress-stat"><span class="todo-progress-stat-label"><i class="is-completed"></i>Completed</span><strong>${x}</strong><small>${bt}% of tasks</small></div>
          <div class="todo-progress-stat"><span class="todo-progress-stat-label"><i class="is-pending"></i>Pending</span><strong>${p}</strong><small>${vt}% of tasks</small></div>
          <div class="todo-progress-stat"><span class="todo-progress-stat-label"><i class="is-overdue"></i>Overdue</span><strong>${u}</strong><small>${xa}% of tasks</small></div>
        </div>
        <div class="todo-progress-footer"><span>${L} ${L===1?"task":"tasks"} in this month</span><span>${x} of ${L} completed</span></div>
      </section>

      <!-- MONTHLY APP USAGE -->
      <section class="monthly-highlights-section" aria-label="Monthly app activity">
        <div class="monthly-highlights-heading">
          <div><p class="dashboard-section-kicker">YOUR MONTH IN REVIEW</p><h3>App activity</h3></div>
          <span>${o} ${t.currentYear}</span>
        </div>
        <div class="monthly-highlights-grid">
          <article class="monthly-highlight-card events-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F5D3}\uFE0F</span><span class="monthly-highlight-label">Events</span></div>
            <strong class="monthly-highlight-value">${v.length}</strong>
            <span class="monthly-highlight-caption">Scheduled this month</span>
            <div class="monthly-highlight-foot"><span>${wa} upcoming</span><span>${zn} earlier</span></div>
          </article>
          <article class="monthly-highlight-card notes-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F4DD}</span><span class="monthly-highlight-label">Notes</span></div>
            <strong class="monthly-highlight-value">${T.length}</strong>
            <span class="monthly-highlight-caption">Created this month</span>
            <div class="monthly-highlight-foot"><span>${k.length} total saved</span></div>
          </article>
          <article class="monthly-highlight-card goals-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F3C6}</span><span class="monthly-highlight-label">Goal &amp; Achievements</span></div>
            <strong class="monthly-highlight-value">${H.length}</strong>
            <span class="monthly-highlight-caption">Completed this month</span>
            <div class="monthly-highlight-foot"><span>${_.length} added</span><span>${O.length} total</span></div>
          </article>
          <article class="monthly-highlight-card focus-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u23F1\uFE0F</span><span class="monthly-highlight-label">Focus Timer</span></div>
            <strong class="monthly-highlight-value">${re.length}</strong>
            <span class="monthly-highlight-caption">Completed sessions</span>
            <div class="monthly-highlight-foot"><span>${va} focused</span><span>${ue} min</span></div>
          </article>
          <article class="monthly-highlight-card mood-highlight-card">
            <div class="monthly-highlight-top"><span class="monthly-highlight-icon">\u{1F49B}</span><span class="monthly-highlight-label">This month\u2019s mood</span></div>
            <div class="mood-highlight-body">
              <div class="mood-highlight-feature">
                <span class="mood-highlight-emoji">${G?P(G.emoji):"\u2014"}</span>
                <div><strong>${G?P(G.label):"No mood logged"}</strong><span>${G?`${G.count} of ${W.length} check-ins`:"Record a mood to see your pattern"}</span></div>
              </div>
              <div class="mood-highlight-distribution">${ee.length?ee.slice(0,4).map(c=>`<span title="${P(c.label)}: ${c.count}"><b>${P(c.emoji)}</b><small>${c.count}</small></span>`).join(""):'<span class="mood-no-data">No check-ins for this month</span>'}</div>
            </div>
          </article>
        </div>
      </section>

      <!-- DETAILED MONTHLY PERFORMANCE ANALYSIS -->
      <section class="performance-analysis-section" aria-label="Detailed monthly performance analysis">
        <div class="performance-analysis-heading">
          <div><p class="dashboard-section-kicker">UNDERSTAND YOUR PROGRESS</p><h3>Detailed performance analysis</h3><p>What your activity says about this month</p></div>
          <span class="analysis-period-chip">${o.slice(0,3)} ${t.currentYear}</span>
        </div>

        <div class="analysis-scorecards">
          <article class="analysis-score-card analysis-score-task"><span class="analysis-score-icon">\u2713</span><small>Task completion</small><strong>${d}%</strong><span>${x} of ${L} tasks</span></article>
          <article class="analysis-score-card analysis-score-focus"><span class="analysis-score-icon">\u23F1</span><small>Focus time</small><strong>${va}</strong><span>${re.length} completed sessions</span></article>
          <article class="analysis-score-card analysis-score-goal"><span class="analysis-score-icon">\u{1F3C6}</span><small>Goals completed</small><strong>${je}</strong><span>${De} added this month</span></article>
          <article class="analysis-score-card analysis-score-mood"><span class="analysis-score-icon">${G?P(G.emoji):"\u{1F49B}"}</span><small>Top mood</small><strong>${G?P(G.label):"No data"}</strong><span>${W.length} mood check-ins</span></article>
        </div>

        <div class="performance-analysis-grid">
          <article class="analysis-detail-card analysis-task-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F4CB}</span><div><h4>Task performance</h4><p>How well you followed through on planned work</p></div></div>
            <div class="analysis-comparison-row">
              <div><small>This month</small><strong>${d}%</strong></div>
              <div class="analysis-comparison-divider"></div>
              <div><small>Previous month</small><strong>${Ne===null?"\u2014":`${Ne}%`}</strong></div>
              <span class="analysis-change-pill ${X===null?"is-neutral":X>0?"is-up":X<0?"is-down":"is-neutral"}">${X===null?"No baseline":`${X>0?"+":""}${X} pts`}</span>
            </div>
            <div class="analysis-subheading">Completion by priority</div>
            ${xt.length?xt.map(c=>`<div class="analysis-bar-row"><div class="analysis-bar-label"><span>${P(c.priority)} priority</span><strong>${c.completed}/${c.total}</strong></div><div class="analysis-bar-track"><i class="${c.priority.toLowerCase()}" style="width:${c.percent}%"></i></div><small>${c.open} still open \xB7 ${c.percent}% completed</small></div>`).join(""):'<p class="analysis-no-data">No priority information recorded for this month.</p>'}
            ${ka.length?`<div class="analysis-subheading">Task categories</div><div class="analysis-chip-list">${ka.map(c=>`<span>${P(c.category)} <b>${c.completed}/${c.total}</b></span>`).join("")}</div>`:""}
            <p class="analysis-explainer">Completion rate = completed tasks \xF7 tasks scheduled for the selected month. Overdue tasks are counted separately from pending tasks.</p>
          </article>

          <article class="analysis-detail-card analysis-weekly-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F4C5}</span><div><h4>Weekly task rhythm</h4><p>When your tasks were scheduled, and how many you finished</p></div></div>
            <div class="analysis-week-list">${Wn.map(c=>`<div class="analysis-week-row"><div class="analysis-week-meta"><span>${c.label}</span><b>${c.completed}/${c.total} done</b></div><div class="analysis-bar-track"><i class="weekly" style="width:${c.percent}%"></i></div><small>${c.total?`${c.percent}% complete \xB7 ${c.open} open`:"No tasks scheduled"}</small></div>`).join("")}</div>
            <p class="analysis-explainer">Weeks are grouped by calendar date (1\u20137, 8\u201314, and so on), not by the day a task was edited.</p>
          </article>

          <article class="analysis-detail-card analysis-planning-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F5D3}\uFE0F</span><div><h4>Planning &amp; app activity</h4><p>How you used DaySync to organise the month</p></div></div>
            <div class="analysis-mini-stats"><div><strong>${v.length}</strong><small>Events scheduled</small></div><div><strong>${T.length}</strong><small>Notes created</small></div><div><strong>${Zn.length}</strong><small>Habit check-ins done</small></div></div>
            <div class="analysis-planning-lines">
              <div><span>Habit-tracking days</span><strong>${es.size}</strong></div>
              <div><span>Different habits tracked</span><strong>${ts.size}</strong></div>
              <div><span>Notes saved overall</span><strong>${k.length}</strong></div>
              ${Pt?`<div><span>Most common event category</span><strong>${P(Pt[0])} \xB7 ${Pt[1]}</strong></div>`:""}
            </div>
            <p class="analysis-explainer">Events are counted by their scheduled date. Notes are counted by creation date. Habit check-ins use their recorded date and completed flag.</p>
          </article>

          <article class="analysis-detail-card analysis-focus-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F3A7}</span><div><h4>Focus &amp; concentration</h4><p>Your completed Focus Timer sessions</p></div></div>
            <div class="analysis-mini-stats"><div><strong>${re.length}</strong><small>Sessions</small></div><div><strong>${Te}</strong><small>Focus days</small></div><div><strong>${Aa}m</strong><small>Avg. session</small></div></div>
            <div class="analysis-subheading">Focus time by week</div>
            <div class="analysis-focus-weeks">${$a.map(c=>`<div class="analysis-focus-week"><div class="analysis-focus-column"><i style="height:${Math.max(c.minutes?6:0,Math.round(c.minutes/Jn*100))}%"></i></div><span>${c.label}</span><small>${c.minutes}m</small></div>`).join("")}</div>
            <p class="analysis-focus-note">${re.length?`You averaged ${Yn} minutes on days when you completed at least one focus session${Et?`. Your highest focus day was ${ns(Et[0])} (${Et[1]} minutes)`:""}.`:"Complete a Focus Timer session to start building your focus history."}</p>
            <p class="analysis-explainer">Only completed sessions are counted. A session synced to the server and saved locally is counted once by its session ID.</p>
          </article>

          <article class="analysis-detail-card analysis-goal-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F3AF}</span><div><h4>Goal follow-through</h4><p>Monthly goal activity and your current goal snapshot</p></div></div>
            <div class="analysis-mini-stats"><div><strong>${De}</strong><small>Added this month</small></div><div><strong>${je}</strong><small>Completed this month</small></div><div><strong>${Vn.length}</strong><small>Currently active</small></div></div>
            ${Tt===null?'<p class="analysis-no-data">Add a target to your goals to see a measurable progress average.</p>':`<div class="analysis-goal-average"><div><span>Average progress across saved goals</span><strong>${Tt}%</strong></div><div class="analysis-bar-track"><i class="goal" style="width:${Tt}%"></i></div></div>`}
            <p class="analysis-explainer">The monthly added/completed counts use goal creation and completion dates. The average progress is a current snapshot of saved goals, not a month-only change.</p>
          </article>

          <article class="analysis-detail-card analysis-mood-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F49B}</span><div><h4>Mood &amp; check-in pattern</h4><p>Your mood entries during the selected month</p></div></div>
            ${G?`<div class="analysis-top-mood"><span>${P(G.emoji)}</span><div><strong>${P(G.label)}</strong><small>Most selected \xB7 ${G.count} check-ins</small></div></div>`:'<p class="analysis-no-data">No mood check-ins are recorded for this month yet.</p>'}
            <div class="analysis-mood-bars">${ee.length?ee.map(c=>`<div class="analysis-mood-row"><span>${P(c.emoji)} ${P(c.label)}</span><div class="analysis-bar-track"><i class="mood" style="width:${Math.round(c.count/Math.max(1,W.length)*100)}%"></i></div><b>${c.count}</b></div>`).join(""):""}</div>
            <div class="analysis-mood-footer"><span>${Be.size} of ${ge} days with check-ins</span><strong>${Kn}% coverage</strong></div>
            ${Na===null?"":`<p class="analysis-explainer">Average recorded energy level: ${Na.toFixed(1)}. This is based only on check-ins where an energy value was saved.</p>`}
          </article>

          <article class="analysis-detail-card analysis-finance-detail">
            <div class="analysis-card-heading"><span class="analysis-card-icon">\u{1F4B3}</span><div><h4>Money activity</h4><p>Recorded income and spending pattern</p></div></div>
            <div class="analysis-money-result ${g>=0?"is-positive":"is-negative"}"><small>Net balance</small><strong>${g<0?"\u2212":"+"}${Da(Math.abs(g))}</strong><span>${g>=0?"Income is higher than recorded expenses":"Expenses are higher than recorded income"}</span></div>
            <div class="analysis-money-counts"><span>${Qn} income entries</span><span>${Xn} expense entries</span></div>
            ${Ue?`<div class="analysis-top-category"><small>Largest expense category</small><strong>${P(Ue[0])}</strong><span>${Da(Ue[1])} \xB7 ${h?Math.round(Ue[1]/h*100):0}% of expenses</span></div>`:'<p class="analysis-no-data">No expense category data recorded this month.</p>'}
            ${Ta===null?'<p class="analysis-explainer">Savings percentage is unavailable because no income has been recorded for this month.</p>':`<p class="analysis-explainer">Net balance is ${Ta}% of recorded income. This is a summary of entries in DaySync, not a bank balance.</p>`}
          </article>
        </div>

        <section class="analysis-insights-card" aria-label="Personalized monthly insights">
          <div class="analysis-insights-heading"><span>\u{1F9ED}</span><div><h4>What this means for you</h4><p>Simple takeaways based on your recorded activity</p></div></div>
          <div class="analysis-insights-list">${as.map((c,A)=>`<article class="analysis-insight-item"><span>${c.icon}</span><div><strong>${P(c.title)}</strong><p>${P(c.text)}</p></div></article>`).join("")}</div>
          <div class="analysis-insights-footnote">This analysis uses records available in DaySync for ${o} ${t.currentYear}. Missing or unsynced records may change the totals. It describes recorded activity and does not judge your personal worth or health.</div>
        </section>
      </section>

            <!-- MONTHLY FINANCE -->

      <section class="glass-card monthly-finance-panel">

        <div class="panel-header">
          <h3>Monthly Finance</h3>

          <span class="finance-month-label">
            ${o} ${t.currentYear}
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
              \u20B9${h.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </strong>

          </div>

        </div>

        <div class="finance-net-row">

          <span>Net Balance</span>

          <strong class="${g>=0?"positive":"negative"}">
            ${g>=0?"+":"-"}\u20B9${Math.abs(g).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
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

          ${Ca.length?Ca.map(c=>`
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
                    ${t.currentYear} yet.
                  </span>

                </div>
              `}

        </div>

      </section>

    </section>
  `}var Zt=!1,En=null,Nn=null;function Ai(){if(["home","assistant","menu"].includes(t.view)||t.view==="finance"&&["transactions","add-choice","add-expense"].includes(t.financeView))return;let n=document.getElementById("app");if(!n)return;let e={tasks:".todo-header",vault:".notepad-page-header",finance:".finance-dashboard-header, .finance-transactions-header",calendar:".page-header",mood:".page-header",habits:".page-header",goals:".page-header",progress:".dashboard-topbar",focus:".focus-header",weather:".weather-page-header",settings:".daysync-settings-header","goal-achievements":".ga-header","goal-create":".ga-header","goal-edit":".ga-header","reset-options":".daysync-reset-header"},a=n.querySelector(e[t.view]||".screen > header, .screen > .page-header");if(!a&&t.view==="finance"&&(a=n.querySelector(".finance-transactions-header")),!a){let i=n.querySelector(".screen, .finance-dashboard-page, .notepad-container")||n.firstElementChild;if(!i)return;a=document.createElement("header"),a.className="daysync-generated-page-header daysync-common-header",i.prepend(a)}a.classList.add("daysync-common-header");let s=a.querySelector(".daysync-page-back-button, .weather-back-button, .focus-back, .daysync-settings-back, .back-button");s?(s.classList.add("daysync-page-back-button"),s.setAttribute("aria-label","Back"),s.title="Back",s.classList.contains("back-button")&&(s.textContent="\u2039")):(s=document.createElement("button"),s.type="button",s.className="daysync-page-back-button",s.dataset.action="shared-page-back",s.setAttribute("aria-label","Back"),s.title="Back",s.textContent="\u2039",a.prepend(s)),a.classList.contains("menu-page-heading")&&a.classList.add("daysync-menu-header")}function b(){if(!Zt){Zt=!0;try{let C=function(u,p){clearTimeout(f),clearTimeout(w),p&&(p.value=u),w=setTimeout(()=>{F()},3e3)},n=document.getElementById("app"),e=t.view!==fn,a=document.querySelector(".assistant-chat"),s=a?a.scrollHeight-a.scrollTop-a.clientHeight<100:!0,i=!!t.assistantForceScroll;t.assistantForceScroll=!1,fn=t.view,t.view==="calendar"&&t.authenticated&&!t.calendarCache.has(t.selectedDate)&&Fn(t.selectedDate);let o="";if(t.view==="calendar")o=Ia(t);else if(t.view==="finance")o=qa(t);else if(t.view==="vault")o=_a(t);else if(t.view==="mood")o=Pa(t);else if(t.view==="tasks")o=La(t);else if(t.view==="habits")o=Oa(t);else if(t.view==="goals")o=Ma(t);else if(t.view==="goal-achievements")o=xn();else if(t.view==="goal-create")o=Js();else if(t.view==="goal-edit")if((t.goalAchievementItems||[]).some(p=>String(p.id)===String(t.goalAchievementEditingId)))o=Vs();else{t.goalAchievementEditingId=null;let p=t.navigationHistory||[];p[p.length-1]==="goal-achievements"&&p.pop(),t.view="goal-achievements",o=xn(),E("This goal is no longer available.")}else t.view==="assistant"?o=Ra(t):t.view==="menu"?o=Ks():t.view==="settings"?o=Xs():t.view==="reset-options"?o=Qs():t.view==="focus"?o=hi():t.view==="weather"?o=ui():t.view==="progress"||t.view==="more"?o=ki():o=di();n.innerHTML=o+li()+ci(),fa(),Ai();let l=Array.isArray(t.assistantMessages)?t.assistantMessages.length:0,m=!!t.assistantLoading,r=t.view==="assistant"&&!e&&(l!==En||m!==Nn);En=l,Nn=m,t.view==="assistant"&&(e||r)&&requestAnimationFrame(()=>{if(t.view!=="assistant")return;let u=document.getElementById("app");if(!u)return;let p=u.querySelector(".assistant-chat");if(p&&(e||s||i)){let y=()=>{p.isConnected&&(p.scrollTop=p.scrollHeight)};y(),requestAnimationFrame(y),requestAnimationFrame(()=>requestAnimationFrame(y)),window.setTimeout(y,90),document.querySelector(".bottom-nav")?.classList.remove("scroll-hidden")}}),e&&(n.scrollTop=0,window.scrollTo({top:0,left:0,behavior:"auto"}),document.querySelector(".bottom-nav")?.classList.remove("scroll-hidden")),be();let h=["menu","tasks","vault","finance","progress","habits","goals","goal-achievements","goal-create","goal-edit","focus","weather","settings","reset-options"];document.querySelectorAll(".bottom-nav .nav-item").forEach(u=>{u.dataset.action==="toggle-more-menu"?u.classList.toggle("active",t.moreMenuOpen||h.includes(t.view)):u.classList.toggle("active",u.dataset.view===t.view&&!t.moreMenuOpen)}),requestAnimationFrame(()=>{let u=document.querySelector(".nav-indicator"),p=document.querySelector(".bottom-nav .nav-item.active");u&&p&&(u.style.width=`${p.offsetWidth}px`,u.style.transform=`translateX(${p.offsetLeft}px)`)}),n.querySelectorAll("[data-view]").forEach(u=>{u.dataset.view&&u.addEventListener("click",()=>{["home","calendar","assistant","more","progress","tasks","habits","goals","goal-achievements","mood","finance","vault","focus","weather","settings","reset-options"].includes(u.dataset.view)&&(t.view!==u.dataset.view&&t.view!=="home"&&t.view!=="assistant"&&t.navigationHistory.push(t.view),t.view=u.dataset.view,t.entryModalOpen=!1,t.entryDraft=null,t.moreMenuOpen=!1,b())})});let g,f,w,I=!!window.Capacitor?.isNativePlatform?.(),N=()=>window.SAHRA_SPEECH_RECOGNITION||window.Capacitor?.Plugins?.SpeechRecognition||null,D=window.SpeechRecognition||window.webkitSpeechRecognition;D&&!I&&(g=new D,g.continuous=!0,g.interimResults=!0),document.querySelectorAll('[data-action="toggle-mic"]').forEach(u=>{u.addEventListener("click",async()=>{let p=document.getElementById("chat-mic-img"),d=document.querySelector('input[placeholder*="speak"]');if(!p)return;if(!I&&!g){E("Voice recognition isn't supported on this browser.");return}if(p.classList.contains("listening"))F();else try{if(I){let S=N();if(!S){E("Voice input is unavailable in this mobile build. Please update the app.");return}let k=await S.checkPermissions();if(k.speechRecognition!=="granted"&&(k=await S.requestPermissions()),k.speechRecognition!=="granted"){E("Microphone permission is required for voice input.");return}}await v(p,d)}catch(S){console.error("Unable to start voice input:",S),E("Voice input could not be started.")}})});async function v(u,p){if(u)if(u.classList.add("listening"),p&&(p.value=""),f=setTimeout(()=>{F(),E("Microphone turned off (no speech detected)")},5e3),I){let d=N();if(!d)throw new Error("Native speech recognition plugin is unavailable.");await d.start({language:"en-US",partialResults:!0,popup:!1}),await d.addListener("partialResults",y=>{y.matches?.[0]&&C(y.matches[0],p)})}else{if(g&&g.state==="listening")return;try{g.start(),g.onresult=d=>{let y="";for(let S=d.resultIndex;S<d.results.length;++S)y+=d.results[S][0].transcript;C(y,p)},g.onend=()=>{let d=document.getElementById("chat-mic-img");d&&d.classList.remove("listening")}}catch(d){if(d&&d.name!=="InvalidStateError")throw d;if(g&&g.state==="listening")return;console.warn("Speech recognition already active; ignoring duplicate start request.")}}}async function F(){clearTimeout(f),clearTimeout(w);let u=document.getElementById("chat-mic-img");if(u&&u.classList.remove("listening"),I){let d=N();d&&(await d.stop(),await d.removeAllListeners())}else g&&g.state==="listening"&&g.stop();let p=document.querySelector('input[placeholder*="speak"]');if(p&&p.value.trim()!==""){let d=p.nextElementSibling;d&&d.click()}}document.querySelectorAll('[data-action="toggle-progress-picker"]').forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation(),t.progressPickerOpen=!t.progressPickerOpen,b()})}),document.querySelectorAll('[data-action="close-profile-modal"]').forEach(u=>{u.addEventListener("click",()=>{t.profileModalOpen=!1,t.profileEditing=!1,t.profileDraft=null,t.profileSuccessMessage="",b()})}),document.querySelectorAll('[data-action="profile-start-edit"]').forEach(u=>{u.addEventListener("click",()=>{t.profileEditing=!0,t.profileSuccessMessage="";let p=t.user?.profile||{};t.profileDraft={name:t.user?.name||"",dateOfBirth:p.dateOfBirth?new Date(p.dateOfBirth).toISOString().slice(0,10):""},b()})}),document.querySelectorAll('[data-action="profile-cancel-edit"]').forEach(u=>{u.addEventListener("click",()=>{t.profileEditing=!1,t.profileSuccessMessage="",b()})}),document.querySelectorAll('[data-action="profile-save"]').forEach(u=>{u.addEventListener("click",async()=>{let p=t.profileDraft||{},d={name:p.name,dateOfBirth:p.dateOfBirth||null};try{let y=await q("/api/profile",{method:"PUT",body:JSON.stringify(d)});t.user=y.user||t.user,t.goalAchievementItems=de(),localStorage.setItem("sahraUser",JSON.stringify(t.user)),t.profileEditing=!1,t.profileSuccessMessage="Profile updated successfully!",b(),setTimeout(()=>{t.profileSuccessMessage&&(t.profileSuccessMessage="",b())},3e3)}catch(y){window.alert(y.message||"Unable to save profile")}})}),document.querySelectorAll(".profile-input").forEach(u=>{u.addEventListener("input",p=>{let d=p.target.dataset.field,y=p.target.value;t.profileDraft=t.profileDraft||{},t.profileDraft[d]=y})}),document.querySelectorAll('[data-action="prev-month"]').forEach(u=>{u.addEventListener("click",()=>$n(-1))}),document.querySelectorAll('[data-action="next-month"]').forEach(u=>{u.addEventListener("click",()=>$n(1))}),document.querySelectorAll('[data-action="today"]').forEach(u=>{u.addEventListener("click",()=>{let p=new Date;t.currentMonth=p.getMonth(),t.currentYear=p.getFullYear(),t.selectedDate=U(p),b()})}),document.querySelectorAll("[data-date]").forEach(u=>{let p=u.dataset.date;p&&u.addEventListener("click",()=>si(p))}),document.querySelectorAll('[data-action="show-calendar-event"]').forEach(u=>{u.addEventListener("click",p=>{if(p.target.closest('[data-action="delete-calendar-event"]'))return;let d=u.dataset.eventId,y=t.data.events.find(S=>String(S.id||S._id)===String(d));y&&(t.calendarDetail={type:"event",item:y},b())}),u.addEventListener("keydown",p=>{if(p.key!=="Enter"&&p.key!==" ")return;p.preventDefault();let d=u.dataset.eventId,y=t.data.events.find(S=>String(S.id||S._id)===String(d));y&&(t.calendarDetail={type:"event",item:y},b())})}),document.querySelectorAll('[data-action="show-calendar-task"]').forEach(u=>{u.addEventListener("click",p=>{if(p.target.closest('[data-action="delete-calendar-task"]'))return;let d=u.dataset.taskId,y=t.data.tasks.find(S=>String(S.id||S._id)===String(d));y&&(t.calendarDetail={type:"task",item:y},b())}),u.addEventListener("keydown",p=>{if(p.key!=="Enter"&&p.key!==" ")return;p.preventDefault();let d=u.dataset.taskId,y=t.data.tasks.find(S=>String(S.id||S._id)===String(d));y&&(t.calendarDetail={type:"task",item:y},b())})}),document.querySelectorAll('[data-action="delete-calendar-task"]').forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation();let d=u.dataset.taskId;d&&Re("Are you sure you want to delete this task?",async()=>{try{await q(`/api/tasks/${d}`,{method:"DELETE"}),t.data.tasks=t.data.tasks.filter(y=>String(y.id||y._id)!==String(d)),t.calendarCache.delete(t.selectedDate),t.calendarDetail=null,E("Task deleted successfully"),b()}catch(y){E(y.message||"Unable to delete task")}})})}),document.querySelectorAll('[data-action="delete-calendar-event"]').forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation();let d=u.dataset.eventId;d&&Re("Are you sure you want to delete this event?",async()=>{try{await q(`/api/events/${d}`,{method:"DELETE"}),t.data.events=t.data.events.filter(y=>String(y.id||y._id)!==String(d)),t.calendarCache.delete(t.selectedDate),t.calendarDetail=null,E("Event deleted successfully"),b()}catch(y){E(y.message||"Unable to delete event")}})})}),document.querySelectorAll('[data-action="close-calendar-detail"]').forEach(u=>{u.addEventListener("click",p=>{p.target.closest("[data-calendar-detail-content]")&&!p.target.closest('[data-action="close-calendar-detail"]')||(t.calendarDetail=null,b())})}),document.querySelectorAll('[data-action="open-add-entry"]').forEach(u=>{u.addEventListener("click",()=>{ri(u.dataset.type||"event")})}),document.querySelectorAll(".task-input").forEach(u=>{u.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),kn(u))})}),document.querySelectorAll('[data-action="quick-task-add"]').forEach(u=>{u.addEventListener("click",()=>{let p=document.querySelector(".task-input");kn(p)})}),document.querySelectorAll('[data-action="show-selected-day"]').forEach(u=>{u.addEventListener("click",()=>{na("calendar")})}),document.querySelectorAll("[data-task-filter]").forEach(u=>{u.addEventListener("click",()=>{t.todoFilter=u.dataset.taskFilter||"All",b()})}),document.querySelectorAll('[data-action="toggle-mood-picker"]').forEach(u=>{u.addEventListener("click",()=>{t.moodPickerOpen=!t.moodPickerOpen,b()})}),document.querySelectorAll("[data-mood-value]").forEach(u=>{u.addEventListener("click",async()=>{let p=u.dataset.moodValue;if(!p)return;t.moodPickerOpen=!1,b();let d=t.data.moods.find(y=>y.date===t.selectedDate);try{d?(await q(`/api/moods/${d.id||d._id}`,{method:"PUT",body:JSON.stringify({mood:p,energy:80,note:d.note||""})}),await ae()):await le("mood",{date:t.selectedDate,mood:p,energy:80,note:""})}catch(y){window.alert(y.message||"Unable to save mood")}})}),hn||(hn=!0,document.addEventListener("change",u=>{let p=u.target;p.getAttribute("data-action")==="finance-filter"&&(t.financeTypeFilter=p.value,Cn())}),document.addEventListener("input",u=>{let p=u.target.closest('[data-action="finance-search"]');if(p){let d=p.selectionStart??p.value.length;t.financeSearchQuery=p.value,Cn(),setTimeout(()=>{let y=document.querySelector('[data-action="finance-search"]');if(y){y.focus();let S=Math.min(d,y.value.length);y.setSelectionRange(S,S)}},0)}})),document.querySelectorAll('[data-action="edit-task"]').forEach(u=>{u.addEventListener("click",()=>{let p=t.data.tasks.find(d=>String(d.id||d._id)===String(u.dataset.taskId));p&&(t.entryModalOpen=!0,t.entryDraft={type:"task",id:p.id||p._id,title:p.title||"",description:p.description||"",date:p.date||t.selectedDate,time:p.time||"19:00",priority:p.priority||"Normal",status:p.status||"Pending",reminder:p.reminder||"",category:p.category||"General"},b())})}),document.querySelectorAll('[data-action="delete-task"]').forEach(u=>{u.addEventListener("click",()=>{let p=u.dataset.taskId;p&&Re("Are you sure you want to delete this task?",async()=>{let d=(t.data.tasks||[]).slice();t.data.tasks=d.filter(y=>String(y.id||y._id)!==String(p)),b();try{await q(`/api/tasks/${p}`,{method:"DELETE"}),E("Task deleted successfully")}catch(y){t.data.tasks=d,b(),E(y.message||"Unable to delete task")}})})}),document.querySelectorAll('[data-action="toggle-task"]').forEach(u=>{u.addEventListener("click",async()=>{let p=u.dataset.taskId,d=t.data.tasks.find(k=>String(k.id||k._id)===String(p));if(!d)return;let y=!(d.completed||d.status==="Completed"),S={...d};d.completed=y,d.status=y?"Completed":"Pending",b();try{await q(`/api/tasks/${p}`,{method:"PUT",body:JSON.stringify({title:d.title,description:d.description||"",date:d.date||t.selectedDate,time:d.time||null,priority:d.priority||"Normal",status:y?"Completed":"Pending",completed:y,reminder:d.reminder||"",category:d.category||"General"})})}catch(k){Object.assign(d,S),b(),window.alert(k.message||"Unable to update task")}})}),document.querySelectorAll('[data-action="copy-asset"]').forEach(u=>{u.addEventListener("click",p=>{let d=u.dataset.content||"";navigator.clipboard.writeText(d),u.textContent="Copied!",setTimeout(()=>{u.textContent="Copy"},2e3)})}),document.querySelectorAll('[data-action="close-entry-modal"]').forEach(u=>{u.addEventListener("click",()=>{sa()})}),document.querySelectorAll('[data-action="save-entry"]').forEach(u=>{u.addEventListener("click",async()=>{if(u.dataset.submitting==="true")return;u.dataset.originalLabel=u.dataset.originalLabel||u.textContent,u.dataset.submitting="true",u.disabled=!0,u.textContent="Saving\u2026";let p=()=>{u.dataset.submitting="false",u.disabled=!1,u.textContent=u.dataset.originalLabel||"Save"};document.querySelectorAll("[data-entry-field]").forEach(k=>{let T=k.dataset.entryField;T&&(t.entryDraft=t.entryDraft||{},t.entryDraft[T]=k.type==="checkbox"?k.checked:k.value)});let d=t.entryDraft||{},y=d.type||"event",S=d.date||t.selectedDate;if(y==="task"&&$e({title:d.title||d.name||""})){E("That test task name has been removed. Please enter a meaningful task title."),p();return}if((y==="event"||y==="task")&&jn(S)){window.alert("Tasks and events can only be added for today or future dates."),p();return}try{if(y==="event"){let k=(d.title||"").trim();if(!k){window.alert("Please enter an event title."),p();return}await le("event",{title:k,description:d.description||"",date:S,startTime:d.startTime||"09:00",endTime:d.endTime||"10:00",category:d.category||"General",reminder:d.reminder||""})}else if(y==="task"){let k=(d.title||"").trim();if(!k){window.alert("Please enter a task title."),p();return}let T={title:k,description:d.description||"",date:S,time:d.time||null,priority:d.priority||"Normal",status:d.status||"Pending",completed:d.completed||!1,reminder:d.reminder||"",category:d.category||"General"};if(d.id){let O=await q(`/api/tasks/${d.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(T)}),_=(t.data.tasks||[]).find(H=>String(H.id||H._id)===String(d.id));_&&Object.assign(_,O?.task||T)}else await le("task",T)}else if(y==="habit"){let k=(d.title||"").trim();if(!k){window.alert("Please enter a habit name."),p();return}await le("habit",{name:k,description:d.description||"",goal:Number(d.goal||1),progress:0,frequency:d.frequency||"Daily"})}else if(y==="goal"){let k=(d.title||"").trim();if(!k){window.alert("Please enter a goal title."),p();return}let T=Number(d.current||0),O=Math.max(Number(d.target||30),1);await le("goal",{title:k,description:d.description||"",duration:d.duration||"30 days",current:T,target:O,progress:Math.min(100,Math.round(T/O*100)),status:"Active"})}else if(y==="mood"){let k=d.mood||"\u{1F60A}";await le("mood",{date:S,mood:k,energy:80,note:d.note||""})}else if(y==="asset"||y==="note"){let k=(d.title||"").trim(),T=(d.description||d.content||"").trim();if(!k||!T){window.alert("Please enter a title and description."),p();return}let O={title:k,content:T,tags:d.tags||"Note"};if(d.id){let _=await q(`/api/assets/${d.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(O)}),H=(t.data.assets||[]).find(W=>String(W.id||W._id)===String(d.id));H&&Object.assign(H,_?.data||O)}else await le("asset",O)}else if(y==="expense"||y==="subscription"){let k=(d.title||"").trim(),T=Number(d.amount);if(!k){window.alert("Please enter a title."),p();return}if(!Number.isFinite(T)||T<=0){window.alert("Please enter a valid amount."),p();return}await le(y,{title:k,amount:T,date:d.date||t.selectedDate,renewalDate:d.renewalDate||t.selectedDate,category:d.category||"General"})}sa(),typeof E=="function"?E("Saved successfully!"):window.alert("Saved successfully!")}catch(k){console.error("Save entry failed:",k),p(),typeof E=="function"?E(k.message||"Unable to save item"):window.alert(k.message||"Unable to save item")}})}),document.querySelectorAll("[data-entry-field]").forEach(u=>{let p=u.dataset.entryField;if(!p)return;let d=y=>{let S=y.type==="checkbox"?y.checked:y.value;t.entryDraft={...t.entryDraft||{},[p]:S},p==="type"&&b()};u.addEventListener("input",()=>d(u)),u.addEventListener("change",()=>d(u))});let j=document.querySelector(".menu-button"),L=document.querySelector(".menu-panel");if(j&&L&&j.addEventListener("click",u=>{u.stopPropagation(),t.menuOpen=!t.menuOpen,L.classList.toggle("hidden",!t.menuOpen),L.classList.toggle("open",t.menuOpen)}),gn||(gn=!0,document.addEventListener("click",async u=>{let p=u.target.closest?.("[data-menu-action]");if(!p)return;let d=p.dataset.menuAction;if(d==="toggle-theme"){let y=t.themePreference==="system"?"light":t.themePreference==="light"?"dark":"system";t.menuOpen=!1,mt(y),b(),Zs(t.theme);return}if(t.menuOpen=!1,d==="profile"){t.profileModalOpen=!0,t.profileEditing=!1,t.profileSuccessMessage="",t.profileDraft={name:t.user?.name||"",dateOfBirth:t.user?.profile?.dateOfBirth?new Date(t.user.profile.dateOfBirth).toISOString().slice(0,10):""},b();return}if(d==="notifications"){t.menuOpen=!1,b(),await ei(),b();return}if(d==="privacy-security"){t.settingsInfoPanel=t.settingsInfoPanel==="privacy"?"":"privacy",b();return}if(d==="sync-now"){try{let y=await me();if(!t.localDatabaseReady){await ae({skipLocalSync:!0}),E("Online data refreshed. Local storage is still initializing.");return}y&&globalThis.navigator?.onLine&&await z.flush(y),await ae(),y&&globalThis.navigator?.onLine&&await z.flush(y),await Ee(),E("DaySync data sync finished.")}catch(y){E(y.message||"Unable to sync DaySync data.")}return}if(d==="exact-alarms"){try{if(!window.Capacitor?.isNativePlatform?.()){E("Timer alarm settings are available in the installed mobile app.");return}(await J.checkExactNotificationSetting()).exact_alarm!=="granted"?(await J.changeExactNotificationSetting(),E("Check Android alarm access, then return to DaySync.")):E("Precise timer alarms are already allowed.")}catch(y){E(y.message||"Unable to open Android alarm settings.")}return}d==="logout"&&(pe(),t.focusRunning=!1,t.focusEndsAt=null,clearInterval(ne),ne=null,oe(),await On(),localStorage.removeItem("sahraUser"),t.authenticated=!1,t.user={name:"DaySync User"},t.goalAchievementItems=de(),t.view="home",window.location.href=gt())})),!mn){let u=function(p,d){let y=document.createElement("div");y.className="notepad-confirm-overlay",y.style.cssText="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px);";let S=document.createElement("div");S.className="notepad-confirm-box",S.style.cssText="background: #1e293b; padding: 24px; border-radius: 16px; width: 85%; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid rgba(255,255,255,0.1);";let k=document.createElement("p");k.className="notepad-confirm-message",k.style.cssText="margin: 0 0 24px 0; font-size: 1.1rem; line-height: 1.5; color: #f8fafc; font-weight: 500;",k.innerText=p;let T=document.createElement("div");T.style.cssText="display: flex; gap: 12px; justify-content: center;";let O=document.createElement("button");O.innerText="Cancel",O.type="button",O.style.cssText="padding: 12px; border-radius: 10px; border: none; background: #334155; color: white; font-weight: 600; cursor: pointer; flex: 1;";let _=document.createElement("button");_.innerText="Delete",_.style.cssText="padding: 12px; border-radius: 10px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer; flex: 1; box-shadow: 0 4px 10px rgba(239,68,68,0.3);",O.onclick=()=>document.body.removeChild(y);let H=!1;_.onclick=async()=>{H||(H=!0,_.disabled=!0,_.textContent="Deleting...",_.style.opacity="0.6",_.style.pointerEvents="none",y.remove(),await d())},T.appendChild(O),T.appendChild(_),S.appendChild(k),S.appendChild(T),y.appendChild(S),document.body.appendChild(y)};mn=!0,document.addEventListener("click",p=>{if(!p.target.closest('[data-action="toggle-notepad-search"]'))return;let y=document.querySelector("#app"),S=y?y.scrollTop:0;t.notepadSearchOpen=!t.notepadSearchOpen,b(),requestAnimationFrame(()=>{let k=document.querySelector("#app");if(k&&(k.scrollTop=S),t.notepadSearchOpen){let T=document.querySelector('[data-action="notepad-search-input"]');T&&T.focus()}})}),document.addEventListener("input",p=>{let d=p.target.closest('[data-action="notepad-search-input"]');if(!d)return;let y=d.selectionStart??d.value.length,S=document.querySelector("#app"),k=S?S.scrollTop:0;t.noteSearchQuery=d.value,b(),requestAnimationFrame(()=>{let T=document.querySelector("#app");T&&(T.scrollTop=k);let O=document.querySelector('[data-action="notepad-search-input"]');if(!O)return;O.focus();let _=Math.min(y,O.value.length);O.setSelectionRange(_,_)})}),document.addEventListener("click",p=>{let d=p.target.closest('[data-action="edit-note"]');if(d){let y=d.dataset.noteId,k=(t.data.assets||t.data.notes||[]).find(T=>String(T.id||T._id)===String(y));if(!k)return;t.entryModalOpen=!0,t.entryDraft={type:"asset",id:k.id||k._id,title:k.title||"",content:k.content||k.description||"",description:k.content||k.description||"",tags:k.tags||"Note"},b()}}),document.addEventListener("click",p=>{let d=p.target.closest('[data-action="delete-note"]');if(d){p.preventDefault(),p.stopPropagation();let y=d.dataset.noteId;u("Are you sure you want to delete this note?",async()=>{let S=(t.data.assets||[]).slice(),k=(t.data.notes||[]).slice();t.data.assets=S.filter(T=>String(T.id||T._id)!==String(y)),t.data.notes=k.filter(T=>String(T.id||T._id)!==String(y)),b();try{await q(`/api/assets/${y}`,{method:"DELETE"}),typeof E=="function"&&E("Note deleted")}catch(T){t.data.assets=S,t.data.notes=k,b(),typeof E=="function"&&E(T.message||"Failed to delete note")}})}})}document.querySelectorAll('[data-action="back-home"]').forEach(u=>{u.addEventListener("click",()=>{t.profileModalOpen=!1,t.profileDraft=null,t.entryModalOpen=!1,t.entryDraft=null,t.view==="progress"||t.view==="more"?(t.view="menu",t.navigationHistory=(t.navigationHistory||[]).filter(p=>!["progress","more","menu"].includes(p))):(t.view="home",t.navigationHistory=(t.navigationHistory||[]).filter(p=>p!=="calendar"&&p!=="menu")),t.moreMenuOpen=!1,t.menuOpen=!1,b()})});let x=async(u,p,d=!0)=>{if(t.assistantLoading)return;if(navigator.onLine===!1){d&&t.assistantMessages.push({role:"user",text:u}),t.assistantMessages.push({role:"system",text:"You are offline. Please check your internet connection and try again."}),t.assistantForceScroll=!0,t.assistantLoading=!1,b();return}let y=t.assistantGeneration;d&&t.assistantMessages.push({role:"user",text:u}),t.assistantForceScroll=!0,t.assistantLoading=!0,b();try{let S;for(let k=0;k<2;k+=1){let T=new AbortController,O=setTimeout(()=>T.abort(),15e3);try{S=await q("/api/assistant/chat",{method:"POST",signal:T.signal,body:JSON.stringify({message:u,requestId:p})});break}catch(_){let H=!Number.isInteger(_.status)||_.status>=500||_.status===408;if(k===0&&H){await new Promise(W=>setTimeout(W,250));continue}throw _}finally{clearTimeout(O)}}if(y===t.assistantGeneration&&t.assistantMessages.push({role:"assistant",text:S.message||"Sahra is temporarily unavailable."}),y===t.assistantGeneration&&S.action==="requiresConfirmation"&&S.confirmationToken){let k=/delete/i.test(S.message||"")?"Delete task":/complete/i.test(S.message||"")?"Mark complete":/event/i.test(S.message||"")?"Add event":"Add task";Re("Do you want Sahra to perform this change?",async()=>{t.assistantLoading=!0,b();try{let T=await q("/api/assistant/execute",{method:"POST",body:JSON.stringify({confirmationToken:S.confirmationToken})});t.assistantMessages.push({role:"assistant",text:T.message||"The change was completed."}),await ae()}catch(T){t.assistantMessages.push({role:"assistant",text:T.message||"Sahra could not complete that change."})}finally{t.assistantLoading=!1,b()}},k)}else["createdTask","createdEvent","createdNote","createdTransaction"].includes(S.action)&&(await ae(),S.action==="createdTransaction"&&await Ee())}catch(S){let k=S.message||"Sahra is temporarily unavailable.",T=!Number.isInteger(S.status)||S.status>=500||S.status===408,O=navigator.onLine===!1||!Number.isInteger(S.status)&&/failed to fetch|networkerror|network request failed|load failed/i.test(k);y===t.assistantGeneration&&(O?t.assistantMessages.push({role:"system",text:"You are offline. Please check your internet connection and try again."}):t.assistantMessages.push({role:"assistant",text:T?`${k} You can retry safely.`:k,...T?{retryRequestId:p,retryMessage:u}:{}}))}finally{t.assistantLoading=!1,t.view==="assistant"&&(t.assistantForceScroll=!0),b()}};document.querySelectorAll(".composer-send").forEach(u=>{u.addEventListener("click",async()=>{let p=document.querySelector(".assistant-input"),d=p?.value?.trim();if(!d||t.assistantLoading)return;p&&(p.value="");let y=window.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;await x(d,y)})}),document.querySelectorAll("[data-assistant-retry]").forEach(u=>{u.addEventListener("click",async()=>{let p=u.dataset.retryMessage||"",d=u.dataset.assistantRetry||"";p&&d&&await x(p,d,!1)})}),document.querySelectorAll("[data-progress-month]").forEach(u=>{u.addEventListener("click",async p=>{p.stopPropagation();let d=Number(u.dataset.progressMonth);!Number.isInteger(d)||d<0||d>11||(t.currentMonth=d,t.progressPickerOpen=!1,t.progressLoading=!0,b(),await ve(!0))})}),document.querySelectorAll('[data-action="close-progress-picker"]').forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation(),t.progressPickerOpen=!1,b()})}),document.querySelectorAll('[data-action="progress-year-change"]').forEach(u=>{u.addEventListener("click",async p=>{p.stopPropagation();let d=Number(u.dataset.direction||0);d&&(t.currentYear+=d,t.progressData=null,b(),await ve(!0))})}),document.querySelectorAll('[data-action="progress-year-set"]').forEach(u=>{u.addEventListener("click",async p=>{p.stopPropagation();let d=Number(u.dataset.year);!Number.isInteger(d)||d<1900||d>2200||(t.currentYear=d,t.progressData=null,b(),await ve(!0))})}),document.querySelectorAll(".assistant-input").forEach(u=>{u.addEventListener("keydown",p=>{p.key==="Enter"&&!p.shiftKey&&(p.preventDefault(),document.querySelector(".composer-send")?.click())})}),document.querySelectorAll(".composer-mic").forEach(u=>{u.addEventListener("click",()=>{let p=window.SpeechRecognition||window.webkitSpeechRecognition;if(!p){window.alert("Voice input is not supported in this browser.");return}u.style.color="#ff4757";let d=new p;d.lang="en-US",d.interimResults=!1,d.onresult=y=>{let S=y.results[0][0].transcript,k=document.querySelector(".assistant-input"),T=document.querySelector(".composer-send");k&&(k.value=S),T&&T.click()},d.onend=()=>{u.style.color=""},d.start()})}),n.querySelectorAll('[data-action="close-more-menu"]').forEach(u=>{u.addEventListener("click",()=>{t.moreMenuOpen=!1,b()})}),Si()}finally{Zt=!1}}}function $i(){document.querySelectorAll(".bottom-nav .nav-item").forEach(n=>{n.addEventListener("click",async e=>{if(n.dataset.action==="toggle-more-menu"){e.stopPropagation(),t.entryModalOpen=!1,t.entryDraft=null,t.progressPickerOpen=!1,t.profileModalOpen=!1,t.moreMenuOpen=!1,t.menuOpen=!1,t.moodPickerOpen=!1,t.view="menu",b();return}let a=n.dataset.view;a&&(t.entryModalOpen=!1,t.entryDraft=null,t.progressPickerOpen=!1,t.profileModalOpen=!1,t.moreMenuOpen=!1,t.view!==a&&t.view!=="home"&&t.view!=="assistant"&&t.navigationHistory.push(t.view),t.view=a,b(),a==="progress"&&await ve(!0))})})}var Tn=!1,it=0,Dn=!1;function ba(n){return!!n?.matches?.('input:not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]')}function be(){let n=window.visualViewport,e=ba(document.activeElement),a=window.matchMedia?.("(max-width: 760px)").matches||window.innerWidth<=760,s=!!(n&&(window.innerHeight-n.height>120||n.height<window.innerHeight*.76)),i=!!(a&&e&&(s||document.activeElement));document.body.classList.toggle("keyboard-open",i),document.documentElement.classList.toggle("keyboard-open",i),document.querySelector(".bottom-nav")?.classList.toggle("keyboard-hidden",i),n&&document.documentElement.style.setProperty("--sahra-visual-height",`${Math.max(220,n.height)}px`)}function Ei(n){if(!ba(n))return;let e=n;[100,320,520].forEach(a=>{window.setTimeout(()=>{if(!e.isConnected||document.activeElement!==e)return;be();let s=window.visualViewport?.height||window.innerHeight,i=e.getBoundingClientRect();(i.bottom>s-26||i.top<10)&&e.scrollIntoView({block:"center",behavior:a>100?"smooth":"auto"})},a)})}function Ni(){if(Dn)return;Dn=!0;let n=document.getElementById("app"),e=document.querySelector(".bottom-nav");n&&e&&(it=n.scrollTop,n.addEventListener("scroll",()=>{let l=n.scrollTop;if(document.body.classList.contains("keyboard-open")){e.classList.add("keyboard-hidden"),it=l;return}let m=l-it;l<=8?e.classList.remove("scroll-hidden"):m>5?e.classList.add("scroll-hidden"):m<-5&&e.classList.remove("scroll-hidden"),it=l},{passive:!0})),document.addEventListener("scroll",l=>{let m=l.target;if(!m?.classList?.contains("assistant-chat"))return;let r=document.querySelector(".bottom-nav");if(!r||document.body.classList.contains("keyboard-open"))return;let h=m.scrollHeight-m.scrollTop-m.clientHeight;r.classList.toggle("scroll-hidden",h>72)},!0);let a=null,s=0,i=0,o='input, textarea, select, [contenteditable="true"], [role="slider"], input[type="range"], .assistant-fixed-composer, .bottom-nav, .month-picker-wrapper, .month-picker-popover, .focus-ring-wrap, .entry-modal-backdrop, .daysync-reset-modal-backdrop, .sahra-confirm-overlay, [data-no-swipe]';document.addEventListener("touchstart",l=>{if(a=null,l.touches?.length!==1||!["home","assistant","menu"].includes(t.view)||document.body.classList.contains("keyboard-open")||t.entryModalOpen||t.profileModalOpen||t.moreMenuOpen||t.menuOpen||(l.target instanceof Element?l.target:l.target?.parentElement)?.closest?.(o))return;let r=l.touches[0];a={identifier:r.identifier,x:r.clientX,y:r.clientY,startedAt:performance.now(),axis:null}},{passive:!0,capture:!0}),document.addEventListener("touchmove",l=>{if(!a||l.touches?.length!==1)return;let m=l.touches[0];if(m.identifier!==a.identifier)return;let r=Math.abs(m.clientX-a.x),h=Math.abs(m.clientY-a.y);r<9&&h<9||(r>h*1.12?a.axis="horizontal":h>r*1.05&&(a.axis="vertical"))},{passive:!0,capture:!0}),document.addEventListener("touchend",l=>{if(!a||l.changedTouches?.length!==1){a=null;return}let m=l.changedTouches[0];if(m.identifier!==a.identifier){a=null;return}let r=m.clientX-a.x,h=m.clientY-a.y,g=Math.max(1,performance.now()-a.startedAt),f=a.axis;if(a=null,f==="vertical"||Math.abs(r)<=Math.abs(h)*1.15||Math.abs(h)>76)return;let w=Math.abs(r),I=w/g,N=w>=Math.max(34,Math.min(46,window.innerWidth*.105)),D=w>=25&&g<=260&&I>=.34;if(!N&&!D)return;let v=performance.now();if(v-s<320)return;s=v;let C=null;t.view==="home"&&r<0?C="assistant":t.view==="assistant"&&r<0?C="menu":t.view==="menu"&&r>0?C="assistant":t.view==="assistant"&&r>0&&(C="home"),C&&(i=Date.now()+280,t.entryModalOpen=!1,t.entryDraft=null,t.moreMenuOpen=!1,t.menuOpen=!1,t.view=C,b())},{passive:!0,capture:!0}),document.addEventListener("touchcancel",()=>{a=null},{passive:!0,capture:!0}),document.addEventListener("click",l=>{Date.now()>=i||(l.preventDefault(),l.stopImmediatePropagation())},!0),document.addEventListener("focusin",l=>{ba(l.target)&&(be(),Ei(l.target))}),document.addEventListener("focusout",()=>{window.setTimeout(()=>{be(),document.body.classList.contains("keyboard-open")||document.querySelector(".bottom-nav")?.classList.remove("keyboard-hidden")},180)}),window.addEventListener("resize",be,{passive:!0}),window.visualViewport?.addEventListener("resize",be,{passive:!0}),window.visualViewport?.addEventListener("scroll",be,{passive:!0})}async function Ti(n,e){let a=ie[e]?.collections||[],s=new Set(a);e==="notepad"&&(s.add("notes"),s.add("assets")),e==="expenses"&&(s.add("transactions"),s.add("expenses"),s.add("subscriptions")),e==="calendar"&&(s.add("events"),s.add("reminders")),e==="progress"&&(s.add("goals"),s.add("habits"),s.add("habitLogs"),s.add("moods")),e==="goalAchievements"&&s.add("goalAchievements");for(let i of s)try{let o=await z.read(n,i);for(let l of o)await z.remove(n,i,l.id||l._id)}catch(o){console.warn(`Could not clear ${i} local cache after reset:`,o.message)}try{let i=await z.read(n,"syncOutbox"),o=e==="tasks"?["tasks"]:e==="notepad"?["assets","notes"]:e==="expenses"?["transactions","expenses","subscriptions"]:e==="calendar"?["events","reminders"]:e==="progress"?["goals","habits","habitlogs","habit-logs","moods"]:e==="goalAchievements"?["goal-achievements","goalachievements","goal_achievements"]:[];for(let l of i){let m=String(l?.resource?.collection||l?.resource||l?.root||l?.collection||"").toLowerCase(),r=e==="goalAchievements"&&(m==="goalachievements"||String(l?.path||"").toLowerCase().includes("/goal-achievements"));(o.includes(m)||r)&&await z.remove(n,"syncOutbox",l.id||l._id)}}catch(i){console.warn("Could not reconcile reset queue:",i.message)}}async function Di(){let n=Object.keys(ie).filter(a=>t.resetOptionsSelected?.[a]);if(!n.length){E("Select at least one data section to reset.");return}let e=await me();if(!e){E("Sign in again to reset saved data.");return}if(!globalThis.navigator?.onLine){E("Connect to the internet before resetting synced data.");return}if(!t.localDatabaseReady){E("Local storage is still initializing. Please try again in a moment.");return}t.resetOptionsBusy=!0,b();try{if((await z.flush(e))?.pending)throw new Error("Some offline changes are still waiting to sync. Reconnect and try again before resetting so deleted data cannot return.");let s=[];for(let o of n){let l=rt(o).length,m=o==="goalAchievements"?ua():[],h=await q(`/api/reset-data/${encodeURIComponent(o==="goalAchievements"?"goal-achievements":o)}`,{method:"DELETE"});if(await Ti(e,o),s.push({category:o,count:Math.max(Number(h.deletedCount||0),l)}),o==="goalAchievements"){await Promise.all(m.map(g=>ta({...g,status:"Completed",reminderTime:""}))),t.goalAchievementItems=[],t.data.goalAchievements=[];for(let g of _n())try{localStorage.removeItem(g)}catch{}try{localStorage.removeItem(la())}catch{}}if(o==="focus"){pe(),t.focusRunning=!1,t.focusEndsAt=null,t.focusStartedAt=null,t.focusAlarmActive=!1,t.focusAlarmStartedAt=null,t.focusSessionId=null,t.focusSeconds=t.focusInitialSeconds||1500,t.focusSessions=[],t.focusStatsData=null;try{localStorage.removeItem("sahraFocusSessions"),localStorage.removeItem(ma)}catch{}try{await J.cancel({notifications:[{id:7001}]})}catch{}}}n.includes("tasks")&&(t.data.tasks=[]),n.includes("notepad")&&(t.data.assets=[],t.data.notes=[]),n.includes("expenses")&&(t.financeData=[],t.data.expenses=[],t.data.subscriptions=[]),n.includes("calendar")&&(t.data.events=[],t.data.reminders=[],t.calendarCache=new Set),n.includes("progress")&&(t.data.goals=[],t.data.habits=[],t.data.habitLogs=[],t.data.moods=[],t.progressData=null),t.resetConfirmOpen=!1,t.resetOptionsSelected={tasks:!1,notepad:!1,expenses:!1,calendar:!1,progress:!1,goalAchievements:!1,focus:!1},await ae(),await Ee(),await ve(!1);try{await qe()}catch(o){console.warn("Notification reconciliation after reset failed:",o.message)}let i=s.map(o=>`${ie[o.category].title}: ${o.count}`).join(" \xB7 ");E(`Selected data reset. ${i}`),t.view="settings",b()}catch(a){console.error("DaySync reset operation failed:",a),E(a.message||"The reset could not finish. Check your connection and review the selected data.");try{await ae(),await Ee(),await ve(!1)}catch(s){console.warn("Unable to refresh after a partial reset:",s.message)}t.resetConfirmOpen=!0,b()}finally{t.resetOptionsBusy=!1,b()}}function Ci(){Tn||(Tn=!0,Ni(),document.addEventListener("submit",n=>{let e=n.target.closest('form[data-form="goal-achievement"], form[data-form="goal-achievement-edit"], form[data-form="goal-progress"]');if(!e)return;n.preventDefault();let a=[...t.goalAchievementItems||[]];if(e.dataset.form==="goal-achievement"||e.dataset.form==="goal-achievement-edit"){let h=new FormData(e),g=String(h.get("title")||"").trim(),f=Number(h.get("target")),w=String(h.get("targetDate")||"");if(!g||!Number.isFinite(f)||f<=0||f>1e6||!/^\d{4}-\d{2}-\d{2}$/.test(w)){E("Enter a goal name, positive target, and valid target date.");return}let I={title:g,description:String(h.get("description")||"").trim(),target:f,targetDate:w,unit:String(h.get("unit")||"items"),frequency:String(h.get("frequency")||"Daily"),reminderTime:String(h.get("reminderTime")||""),category:String(h.get("category")||"Personal")};if(e.dataset.form==="goal-achievement-edit"){let F=t.goalAchievementEditingId,j=a.findIndex(y=>String(y.id)===String(F));if(j<0){t.goalAchievementEditingId=null,t.view="goal-achievements";let y=t.navigationHistory||[];y[y.length-1]==="goal-achievements"&&y.pop(),E("This goal is no longer available."),b();return}let L=a[j],x={...L,...I},u=U(new Date);x.status=Number(x.current||0)>=f?"Completed":w<u?"Overdue":"Active",L.status!=="Completed"&&x.status==="Completed"&&(x.completedAt=new Date().toISOString());let p=[...a];if(p[j]=x,!at(p)){t.goalAchievementItems=a,b();return}t.goalAchievementEditingId=null,t.goalAchievementFilter="All",t.view="goal-achievements";let d=t.navigationHistory||[];d[d.length-1]==="goal-achievements"&&d.pop(),ta(x),E("Goal updated. Existing progress and achievements were preserved."),b();return}let D={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,current:0,xp:0,logs:[],currentStreak:0,bestStreak:0,status:"Active",createdAt:new Date().toISOString(),...I};D.status=Number(D.current)>=D.target?"Completed":D.targetDate<U(new Date)?"Overdue":"Active";let v=[D,...a];if(!at(v)){t.goalAchievementItems=a,b();return}t.goalAchievementEditingId=null,t.goalAchievementFilter="All",t.view="goal-achievements";let C=t.navigationHistory||[];C[C.length-1]==="goal-achievements"&&C.pop(),ta(D),E("Goal saved"),b();return}let s=a.find(h=>h.id===e.dataset.goalId);if(!s||s.status==="Completed")return;let i=Number(new FormData(e).get("amount"));if(!Number.isFinite(i)||i<=0){E("Enter a positive progress amount.");return}let o=U(new Date);s.logs=Array.isArray(s.logs)?s.logs:[];let l=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,m=s.logs[s.logs.length-1];if(m&&m.date===o&&Number(m.amount)===i&&Date.now()-new Date(m.createdAt||0).getTime()<8e3){E("That progress entry was just saved. Wait before submitting it again.");return}s.logs.push({id:l,date:o,amount:i,xp:10,createdAt:new Date().toISOString()}),s.current=Math.min(Number(s.target)||1,(Number(s.current)||0)+i),s.xp=(Number(s.xp)||0)+10,Ws(s);let r=s.status==="Completed";s.status=s.current>=s.target?"Completed":s.targetDate<o?"Overdue":"Active",!r&&s.status==="Completed"&&(s.completedAt=new Date().toISOString()),at(a),E(s.status==="Completed"?"Goal completed! Achievement unlocked.":"+10 XP \xB7 Progress saved"),b()}),document.addEventListener("click",async n=>{let e=n.target.closest('[data-action^="ga-"]');if(e){let u=e.dataset.action;if(u==="ga-back"){ye();return}if(u==="ga-filter"){t.goalAchievementFilter=e.dataset.filter||"All",b();return}if(u==="ga-cancel-create"){ye();return}if(u==="ga-open-create"){t.view!=="goal-create"&&(t.navigationHistory=Array.isArray(t.navigationHistory)?t.navigationHistory:[],t.navigationHistory.push(t.view||"goal-achievements"),t.view="goal-create"),b();return}if(u==="ga-cancel-edit"){ye();return}if(u==="ga-edit"){let p=(t.goalAchievementItems||[]).find(d=>String(d.id)===String(e.dataset.goalId));if(!p){E("This goal is no longer available."),b();return}t.goalAchievementEditingId=p.id,t.view!=="goal-edit"&&(t.navigationHistory.push(t.view||"goal-achievements"),t.view="goal-edit"),b();return}if(u==="ga-delete"){let p=(t.goalAchievementItems||[]).find(d=>d.id===e.dataset.goalId);if(!p)return;Re(`Delete the goal \u201C${p.title}\u201D and its progress history?`,async()=>{at((t.goalAchievementItems||[]).filter(d=>String(d.id)!==String(p.id))),window.Capacitor?.isNativePlatform?.()&&J?.cancel&&J.cancel({notifications:[{id:Mn(p.id)}]}).catch(()=>{}),t.goalAchievementEditingId=null,E("Goal deleted"),b()},"Delete");return}}if(n.target.closest('[data-action="shared-page-back"]')){ye();return}if(n.target.closest('[data-action="open-reset-options"]')){t.resetOptionsSelected={tasks:!1,notepad:!1,expenses:!1,calendar:!1,progress:!1,goalAchievements:!1,focus:!1},t.resetConfirmOpen=!1,na("reset-options");return}if(n.target.closest('[data-action="reset-back-settings"]')){t.resetConfirmOpen=!1;let u=Array.isArray(t.navigationHistory)?t.navigationHistory:[];u[u.length-1]==="settings"&&u.pop(),t.view="settings",b();return}let o=n.target.closest('[data-action="reset-toggle-category"]');if(o){let u=o.dataset.category;Object.prototype.hasOwnProperty.call(ie,u)&&(t.resetOptionsSelected={...t.resetOptionsSelected,[u]:!t.resetOptionsSelected[u]},b());return}if(n.target.closest('[data-action="reset-select-all"]')){let u=Object.keys(ie).every(p=>t.resetOptionsSelected?.[p]);t.resetOptionsSelected=Object.fromEntries(Object.keys(ie).map(p=>[p,!u])),b();return}if(n.target.closest('[data-action="reset-review"]')){if(!Object.keys(ie).some(p=>t.resetOptionsSelected?.[p])){E("Select at least one data section to reset.");return}t.resetConfirmOpen=!0,b();return}if(n.target.closest('[data-action="reset-cancel"]')){t.resetConfirmOpen=!1,b();return}if(n.target.closest('[data-action="reset-confirm"]')){if(t.resetOptionsBusy)return;let u=String(document.getElementById("reset-confirm-phrase")?.value||"").trim(),p=!!document.querySelector("[data-reset-acknowledge]")?.checked;if(u!=="DELETE"||!p){E("Check the permanent deletion acknowledgment and type DELETE to continue.");return}await Di();return}if(n.target.closest('[data-action="open-location-permission-settings"]')){Qt("openAppSettings");return}if(n.target.closest('[data-action="open-device-location-settings"]')){Qt("openLocationSettings");return}if(n.target.closest('[data-action="open-notification-permission-settings"]')){Qt("openNotificationSettings");return}if(n.target.closest('[data-action="open-settings"]')){t.menuOpen=!1,t.moreMenuOpen=!1,t.entryModalOpen=!1,t.entryDraft=null,na("settings");return}if(n.target.closest('[data-action="settings-back"]')){ye();return}if(n.target.closest('[data-action="clear-assistant-chat"]')){t.assistantGeneration+=1,t.assistantMessages=[{role:"assistant",text:"I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress."}],b();return}let v=n.target.closest(".month-picker-wrapper"),C=n.target.closest(".menu-panel, .menu-button"),F=n.target.closest(".mood-selector-wrap"),j=n.target.closest(".more-menu-panel"),L=n.target.closest('[data-action="toggle-more-menu"]'),x=!1;!C&&t.menuOpen&&(t.menuOpen=!1,x=!0),t.progressPickerOpen&&!v&&(t.progressPickerOpen=!1,x=!0),t.moodPickerOpen&&!F&&(t.moodPickerOpen=!1,x=!0),t.moreMenuOpen&&!j&&!L&&(t.moreMenuOpen=!1,x=!0),x&&b()}),document.addEventListener("keydown",n=>{if(n.key!=="Escape")return;let e=!1;t.resetConfirmOpen&&(t.resetConfirmOpen=!1,e=!0),t.progressPickerOpen&&(t.progressPickerOpen=!1,e=!0),t.menuOpen&&(t.menuOpen=!1,e=!0),t.moodPickerOpen&&(t.moodPickerOpen=!1,e=!0),t.moreMenuOpen&&(t.moreMenuOpen=!1,e=!0),e&&b()}))}function Cn(){b()}async function Ee(){if(t.authenticated)try{let n=await q("/api/transactions");t.financeData=Array.isArray(n)?n:n.transactions||[],b()}catch(n){if(console.error("Failed to load finance data:",n),t.localDatabaseReady)try{let e=await z.transactionFallback(await me());e.length&&(t.financeData=e,b())}catch(e){console.warn("Finance cache unavailable:",e.message)}}}var In=!1;function Ii(){In||(In=!0,document.addEventListener("click",async n=>{let e=n.target.closest("[data-action]");if(!e)return;let a=e.dataset.action;if(a==="quick-amount"){n.preventDefault();let s=document.getElementById("finance-amount"),i=Number(e.dataset.val);if(!s||!Number.isFinite(i)||i<=0)return;let o=Number.parseFloat(s.value),l=Number.isFinite(o)&&o>0?o:0;s.value=String(Number((l+i).toFixed(2))),s.dispatchEvent(new Event("input",{bubbles:!0})),s.dispatchEvent(new Event("change",{bubbles:!0})),e.classList.add("quick-amount-applied"),window.setTimeout(()=>e.classList.remove("quick-amount-applied"),240);return}if(a==="set-finance-view"){t.financeView=e.dataset.view||"dashboard",b();return}if(a==="set-finance-filter"){t.financeFilter=e.dataset.filter||"week",b();return}if(a==="select-finance-type"){t.tempFinanceType=e.dataset.type||"expense",t.financeView="add-expense",b();return}if(a==="show-finance-reset-confirm"){t.showFinanceResetConfirm=!0,b();return}if(a==="cancel-finance-reset"){t.showFinanceResetConfirm=!1,b();return}if(a==="confirm-finance-reset"){if(t.financeResetLoading)return;t.financeResetLoading=!0,b();let s=new AbortController,i=setTimeout(()=>s.abort(),15e3);try{let o=await q("/api/transactions",{method:"DELETE",signal:s.signal});t.financeData=[],t.financeDetail=null,t.showFinanceResetConfirm=!1,t.tempFinanceType=null,t.financeView="dashboard",E(`${o.deletedCount||0} transactions deleted`),b()}catch(o){console.error("Reset transactions error:",o),E(o.name==="AbortError"?"Reset timed out. Check your connection and retry.":o.message||"Unable to reset transactions")}finally{clearTimeout(i),t.financeResetLoading=!1,b()}return}if(a==="show-transaction-detail"){let s=e.dataset.id,i=t.financeData.find(o=>String(o._id||o.id)===String(s));if(!i)return;t.financeDetail=i,b();return}if(a==="close-transaction-detail"){t.financeDetail=null,b();return}if(a==="delete-finance-transaction"){let s=e.dataset.id;if(!s){E("Transaction ID is missing");return}if(e.dataset.deleting==="true")return;let i=t.financeData.findIndex(l=>String(l._id||l.id)===String(s));if(i===-1){E("Transaction not found");return}let o=t.financeData[i];e.dataset.deleting="true",e.disabled=!0,t.financeData.splice(i,1),t.financeDetail=null,b();try{await q(`/api/transactions/${s}`,{method:"DELETE"}),E("Transaction deleted successfully")}catch(l){console.error("Delete transaction error:",l),t.financeData.splice(i,0,o),t.financeDetail=o,b(),E(l.message||"Unable to delete transaction")}return}if(a==="save-finance-transaction"){if(e.dataset.submitting==="true")return;e.dataset.submitting="true",e.textContent="Saving...";let s=document.getElementById("finance-amount")?.value,i=document.getElementById("finance-category")?.value,o=document.getElementById("finance-date")?.value,l=document.getElementById("finance-note")?.value,m=document.getElementById("finance-payment-method")?.value||"Cash",r=e.dataset.type||t.tempFinanceType||"expense";if(!s||Number(s)<=0){E("Please enter a valid amount."),e.dataset.submitting="false",e.textContent="Save Transaction";return}try{let h=await q("/api/transactions",{method:"POST",body:JSON.stringify({amount:Number(s),category:i||"Other",date:o||new Date().toISOString(),note:l||"",type:r,paymentMethod:m})});h?.transaction&&(t.financeData=[h.transaction,...(t.financeData||[]).filter(g=>String(g.id||g._id)!==String(h.transaction.id||h.transaction._id))]),t.financeView="dashboard",t.tempFinanceType=null,b(),E("Transaction saved successfully")}catch(h){console.error(h),E(h.message||"Unable to save transaction"),e.dataset.submitting="false",e.textContent="Save Transaction"}return}}))}document.addEventListener("click",n=>{let e=n.target.closest('[data-action="open-weather"], [data-action="weather-back"], [data-action="weather-refresh"], [data-action="view-today-events"]');if(!e)return;let a=e.dataset.action;a==="open-weather"?(t.view="weather",t.entryModalOpen=!1,t.entryDraft=null,b(),ia()):a==="weather-back"?(t.view="home",b()):a==="weather-refresh"?ia():a==="view-today-events"&&(t.selectedDate=U(new Date),t.currentMonth=new Date().getMonth(),t.currentYear=new Date().getFullYear(),t.view="calendar",b())});document.addEventListener("submit",n=>{let e=n.target.closest("[data-weather-search-form]");if(!e)return;n.preventDefault();let a=String(new FormData(e).get("city")||"").trim();a.length>=2&&ia(a)});async function Pi(){mt(Ln()),Us(),$i(),Ci(),Ii(),window.addEventListener("daysync:permissions-updated",()=>{t.view==="settings"&&b()});let n=Ht(),e;try{e=await me()}catch(i){throw n.catch(()=>{}),i}if(t.authenticated=!!e,!e){n.catch(()=>{}),window.location.href=gt();return}t.authenticated=!0,window.SAHRA_APP_READY=!0,b(),xi(),window.SAHRA_FOCUS_TIMER_READY=!0,wi();let a=null,s=await Promise.race([n.then(()=>"ready").catch(i=>({error:i})),new Promise(i=>{a=window.setTimeout(()=>i("timeout"),3500)})]);a!==null&&window.clearTimeout(a),s==="ready"?(t.localDatabaseReady=!0,await ae({loadFinanceInBackground:!0})):(t.localDatabaseReady=!1,s==="timeout"?(console.warn("Local database is taking longer than expected; opening DaySync in online mode first."),await ae({skipLocalSync:!0}),n.then(()=>(t.localDatabaseReady=!0,ae({loadFinanceInBackground:!0}))).catch(i=>{console.warn("Offline storage is unavailable; online DaySync remains usable:",i.message)})):(console.warn("Local database could not be initialized; continuing in online mode:",s.error?.message||s.error),await ae({skipLocalSync:!0}))),window.SAHRA_NOTIFICATIONS?.isNative?.()&&window.SAHRA_NOTIFICATIONS.permissionStatus().then(()=>{t.view==="settings"&&b()}).catch(i=>console.warn("Notification permission status unavailable:",i.message)),window.Capacitor?.isNativePlatform()&&Promise.resolve().then(()=>(pn(),un)).then(({markSahraOtaReady:i})=>i()).catch(i=>console.warn("Sahra OTA readiness could not be updated:",i.message))}Pi().catch(n=>{console.error("App initialization failed:",n),E(n.message||"Unable to initialize DaySync."),b()});
