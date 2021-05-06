/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./react/auth/index.ts":
/*!*****************************!*\
  !*** ./react/auth/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.triggerAll = exports.trigger = exports.AuthProvider = exports.AuthDrivers = exports.AuthContext = void 0;
var AuthContext_1 = __webpack_require__(/*! ./src/AuthContext */ "./react/auth/src/AuthContext.ts");
Object.defineProperty(exports, "AuthContext", ({ enumerable: true, get: function () { return __importDefault(AuthContext_1).default; } }));
var AuthDrivers_1 = __webpack_require__(/*! ./src/AuthDrivers */ "./react/auth/src/AuthDrivers.ts");
Object.defineProperty(exports, "AuthDrivers", ({ enumerable: true, get: function () { return __importDefault(AuthDrivers_1).default; } }));
var AuthProvider_1 = __webpack_require__(/*! ./src/AuthProvider */ "./react/auth/src/AuthProvider.tsx");
Object.defineProperty(exports, "AuthProvider", ({ enumerable: true, get: function () { return __importDefault(AuthProvider_1).default; } }));
Object.defineProperty(exports, "trigger", ({ enumerable: true, get: function () { return AuthProvider_1.trigger; } }));
Object.defineProperty(exports, "triggerAll", ({ enumerable: true, get: function () { return AuthProvider_1.triggerAll; } }));


/***/ }),

/***/ "./react/auth/src/AuthContext.ts":
/*!***************************************!*\
  !*** ./react/auth/src/AuthContext.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(/*! react */ "react");
const AuthContext = react_1.createContext({});
AuthContext.displayName = 'ReactAuthContext';
exports.default = AuthContext;


/***/ }),

/***/ "./react/auth/src/AuthDrivers.ts":
/*!***************************************!*\
  !*** ./react/auth/src/AuthDrivers.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var AuthDrivers;
(function (AuthDrivers) {
    AuthDrivers["AUTH0"] = "auth0";
    AuthDrivers["FIREBASE_AUTH"] = "firebase";
})(AuthDrivers || (AuthDrivers = {}));
exports.default = AuthDrivers;


/***/ }),

/***/ "./react/auth/src/AuthProvider.tsx":
/*!*****************************************!*\
  !*** ./react/auth/src/AuthProvider.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.triggerAll = exports.trigger = void 0;
const omit_1 = __importDefault(__webpack_require__(/*! lodash-es/omit */ "lodash-es/omit"));
const each_1 = __importDefault(__webpack_require__(/*! lodash-es/each */ "lodash-es/each"));
const kind_of_1 = __importDefault(__webpack_require__(/*! kind-of */ "kind-of"));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const AuthContext_1 = __importDefault(__webpack_require__(/*! ./AuthContext */ "./react/auth/src/AuthContext.ts"));
const Auth0Client_1 = __importDefault(__webpack_require__(/*! ./clients/Auth0Client */ "./react/auth/src/clients/Auth0Client.ts"));
const FirebaseAuthClient_1 = __importDefault(__webpack_require__(/*! ./clients/FirebaseAuthClient */ "./react/auth/src/clients/FirebaseAuthClient.ts"));
const AuthDrivers_1 = __importDefault(__webpack_require__(/*! ./AuthDrivers */ "./react/auth/src/AuthDrivers.ts"));
const clients = {};
const AuthProvider = ({ children, withAuth0, withFirebase, onUserChange, onError }) => {
    const [auth, setAuth] = react_1.useState({});
    react_1.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const configMap = {
            [AuthDrivers_1.default.AUTH0]: {
                config: withAuth0,
                Client: Auth0Client_1.default
            },
            [AuthDrivers_1.default.FIREBASE_AUTH]: {
                config: withFirebase,
                Client: FirebaseAuthClient_1.default
            }
        };
        each_1.default(configMap, ({ config, Client }, driverId) => {
            if (kind_of_1.default(config) === 'object') {
                const client = new Client(config);
                client.on('user:set', (user) => {
                    onUserChange === null || onUserChange === void 0 ? void 0 : onUserChange(client.driverId, user);
                    setAuth(Object.assign(Object.assign({}, auth), { [client.driverId]: user }));
                });
                client.on('user:unset', (user) => {
                    onUserChange === null || onUserChange === void 0 ? void 0 : onUserChange(client.driverId, null);
                    setAuth(omit_1.default(auth, client.driverId));
                });
                client.on('error', (err) => {
                    onError === null || onError === void 0 ? void 0 : onError(client.driverId, err);
                });
                clients[driverId] = client;
            }
        });
        Object.values(clients).forEach(client => {
            client === null || client === void 0 ? void 0 : client.emit('init', clients);
        });
        Object.values(clients).forEach(client => {
            client === null || client === void 0 ? void 0 : client.emit('site:load', window);
        });
    }, []);
    return (react_1.default.createElement(AuthContext_1.default.Provider, { value: auth }, children));
};
exports.default = AuthProvider;
const trigger = (driver, event, params = undefined) => {
    var _a;
    (_a = clients[driver]) === null || _a === void 0 ? void 0 : _a.emit(event, params);
};
exports.trigger = trigger;
const triggerAll = (event, params = undefined) => {
    Object.values(clients).forEach(client => client === null || client === void 0 ? void 0 : client.emit(event, params));
};
exports.triggerAll = triggerAll;


/***/ }),

/***/ "./react/auth/src/clients/Auth0Client.ts":
/*!***********************************************!*\
  !*** ./react/auth/src/clients/Auth0Client.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const eventemitter3_1 = __importDefault(__webpack_require__(/*! eventemitter3 */ "eventemitter3"));
const kind_of_1 = __importDefault(__webpack_require__(/*! kind-of */ "kind-of"));
const auth0_js_1 = __webpack_require__(/*! auth0-js */ "auth0-js");
const get_1 = __importDefault(__webpack_require__(/*! lodash-es/get */ "lodash-es/get"));
const pick_1 = __importDefault(__webpack_require__(/*! lodash-es/pick */ "lodash-es/pick"));
const AuthDrivers_1 = __importDefault(__webpack_require__(/*! ../AuthDrivers */ "./react/auth/src/AuthDrivers.ts"));
class Auth0Client extends eventemitter3_1.default {
    constructor(options) {
        super();
        this.driverId = AuthDrivers_1.default.AUTH0;
        this.ssoInterval = null;
        this.options = Object.assign({
            responseType: 'token id_token',
            scope: 'openid profile email'
        }, options);
        if (['domain', 'clientId', 'redirectUri'].some(configKey => kind_of_1.default(get_1.default(this.options, configKey)) !== 'string')) {
            throw TypeError("Auth0Client requires 'domain', 'clientId' and 'redirectUri'");
        }
        this.client = new auth0_js_1.WebAuth(Object.assign({}, this.options, {
            clientID: this.options.clientId
        }));
        this.on('logout', () => this.onLogout());
        this.on('login', () => this.onLogin());
        this.on('signup', () => this.onLogin({
            screen_hint: 'signup'
        }));
        this.once('site:load', window => this.onSiteLoad(window));
        this.once('init', clients => {
            if (typeof clients[AuthDrivers_1.default.FIREBASE_AUTH] === 'undefined') {
                return;
            }
            const firebase = clients[AuthDrivers_1.default.FIREBASE_AUTH];
            this.on('user:set', user => firebase.emit('login:token', get_1.default(user, 'token')));
            this.on('user:unset', () => firebase.onLogout());
        });
    }
    onSiteLoad(window) {
        const { pathname, hash, origin } = get_1.default(window, 'location', {});
        if (pathname !== undefined &&
            this.options.redirectUri.replace(/\/$/, '') === `${origin}${pathname}`.replace(/\/$/, '')) {
            void this._handleCallback(hash);
        }
        else if (hash === '') {
            void this._handleSilentSSO();
        }
    }
    onLogin(options) {
        try {
            this.client.authorize(options);
        }
        catch (err) {
            this._reportError(err);
        }
    }
    onLogout() {
        try {
            this.client.logout({
                returnTo: window.location.origin,
                clientID: this.options.clientId
            });
            this.emit('user:unset');
        }
        catch (err) {
            this._reportError(err);
        }
    }
    _handleSilentSSO() {
        return __awaiter(this, void 0, void 0, function* () {
            const isFirstCall = this.ssoInterval === null;
            try {
                const result = yield this._checkSession();
                this.emit('user:set', this._getProfile(result));
                if (isFirstCall) {
                    this.ssoInterval = setInterval(() => {
                        void this._handleSilentSSO();
                    }, Auth0Client.SSO_DELAY);
                }
            }
            catch (err) {
                if (!isFirstCall) {
                    this.emit('user:unset');
                    this.onLogout();
                }
                else {
                    this._reportError(err);
                }
            }
        });
    }
    _handleCallback(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if ((hash === null || hash === void 0 ? void 0 : hash.includes('access_token=')) === true) {
                    const result = yield this._parseHash();
                    this.emit('user:set', this._getProfile(result));
                }
                else {
                    this.onLogin();
                }
            }
            catch (err) {
                this._reportError(err);
            }
        });
    }
    _parseHash() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                this.client.parseHash((err, result) => {
                    var _a;
                    if (err != null) {
                        return reject(err);
                    }
                    const token = (_a = get_1.default(result, 'idToken')) !== null && _a !== void 0 ? _a : '';
                    if (token === '') {
                        return reject(Error('No id token found'));
                    }
                    const profile = get_1.default(result, 'idTokenPayload', {});
                    const expiresAt = get_1.default(result, 'idTokenPayload.exp', 0) * 1000;
                    return resolve({
                        token,
                        profile,
                        expiresAt
                    });
                });
            });
        });
    }
    _checkSession() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                this.client.checkSession({}, (err, result) => {
                    var _a;
                    if (err != null) {
                        return reject(err);
                    }
                    const token = (_a = get_1.default(result, 'idToken')) !== null && _a !== void 0 ? _a : '';
                    if (token === '') {
                        return reject(Error('No id token found'));
                    }
                    const profile = get_1.default(result, 'idTokenPayload', {});
                    const expiresAt = get_1.default(result, 'idTokenPayload.exp', 0) * 1000;
                    return resolve({
                        token,
                        profile,
                        expiresAt
                    });
                });
            });
        });
    }
    _getProfile(result) {
        const profile = pick_1.default(result.profile, [
            'email',
            'name',
            'picture'
        ]);
        if (profile.name === profile.email) {
            profile.name = get_1.default(result.profile, 'nickname', profile.name);
        }
        const token = get_1.default(result, 'token');
        const tokenExpiresAt = get_1.default(result, 'expiresAt');
        const verified = get_1.default(result.profile, 'email_verified', 'verified');
        return Object.assign({
            token,
            tokenExpiresAt,
            verified
        }, profile);
    }
    _reportError(err) {
        if (err instanceof Error) {
            this.emit('error', err);
        }
        else {
            const message = get_1.default(err, 'error', get_1.default(err, 'errorDescription', 'unknown')).replace(/_/g, ' ');
            this.emit('error', Error(message));
        }
    }
}
exports.default = Auth0Client;
Auth0Client.SSO_DELAY = 20 * 60 * 1000;


/***/ }),

/***/ "./react/auth/src/clients/FirebaseAuthClient.ts":
/*!******************************************************!*\
  !*** ./react/auth/src/clients/FirebaseAuthClient.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const eventemitter3_1 = __importDefault(__webpack_require__(/*! eventemitter3 */ "eventemitter3"));
const AuthDrivers_1 = __importDefault(__webpack_require__(/*! ../AuthDrivers */ "./react/auth/src/AuthDrivers.ts"));
const get_1 = __importDefault(__webpack_require__(/*! lodash-es/get */ "lodash-es/get"));
class FirebaseAuthClient extends eventemitter3_1.default {
    constructor(options) {
        super();
        this.driverId = AuthDrivers_1.default.FIREBASE_AUTH;
        const { firebase, firebaseAuth, onAuthStateChanged } = options;
        if ([firebase, firebaseAuth, onAuthStateChanged].some(e => e === undefined)) {
            throw TypeError("FirebaseAuthClient requires 'firebase', 'firebaseAuth' client and 'onAuthStateChanged' callback");
        }
        this.firebase = firebase;
        this.client = firebaseAuth;
        this.on('logout', () => this.onLogout());
        this.on('login:token', token => {
            void this._loginWithCustomToken(token);
        });
        this.once('init', () => {
            onAuthStateChanged((user) => {
                if (user !== null && user !== undefined) {
                    user.getIdTokenResult(true).then((result) => {
                        const profile = {
                            id: user.uid,
                            token: result.token,
                            groups: get_1.default(result, 'claims.g', [])
                        };
                        this.emit('user:set', profile);
                    }).catch((err) => {
                        this.emit('error', err);
                    });
                }
                else {
                    this.emit('user:unset');
                }
            });
        });
    }
    onLogout() {
        try {
            this.client.signOut();
            this.emit('user:unset');
        }
        catch (err) {
            this.emit('error', err);
        }
    }
    _loginWithCustomToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exchangeToken = this.firebase.functions().httpsCallable('auth');
                const { data } = yield exchangeToken({ t: token });
                if (data.error === true) {
                    throw Error(data.message);
                }
                this.client.signInWithCustomToken(data.ct);
            }
            catch (err) {
                this.emit('error', err);
            }
        });
    }
}
exports.default = FirebaseAuthClient;


/***/ }),

/***/ "auth0-js":
/*!***************************!*\
  !*** external "auth0-js" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("auth0-js");;

/***/ }),

/***/ "eventemitter3":
/*!********************************!*\
  !*** external "eventemitter3" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("eventemitter3");;

/***/ }),

/***/ "kind-of":
/*!**************************!*\
  !*** external "kind-of" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("kind-of");;

/***/ }),

/***/ "lodash-es/each":
/*!*********************************!*\
  !*** external "lodash-es/each" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("lodash-es/each");;

/***/ }),

/***/ "lodash-es/get":
/*!********************************!*\
  !*** external "lodash-es/get" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("lodash-es/get");;

/***/ }),

/***/ "lodash-es/omit":
/*!*********************************!*\
  !*** external "lodash-es/omit" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("lodash-es/omit");;

/***/ }),

/***/ "lodash-es/pick":
/*!*********************************!*\
  !*** external "lodash-es/pick" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("lodash-es/pick");;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./react/auth/index.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvLi9yZWFjdC9hdXRoL2luZGV4LnRzIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy8uL3JlYWN0L2F1dGgvc3JjL0F1dGhDb250ZXh0LnRzIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy8uL3JlYWN0L2F1dGgvc3JjL0F1dGhEcml2ZXJzLnRzIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy8uL3JlYWN0L2F1dGgvc3JjL0F1dGhQcm92aWRlci50c3giLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzLy4vcmVhY3QvYXV0aC9zcmMvY2xpZW50cy9BdXRoMENsaWVudC50cyIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvLi9yZWFjdC9hdXRoL3NyYy9jbGllbnRzL0ZpcmViYXNlQXV0aENsaWVudC50cyIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJhdXRoMC1qc1wiIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy9leHRlcm5hbCBcImV2ZW50ZW1pdHRlcjNcIiIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJraW5kLW9mXCIiLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzL2V4dGVybmFsIFwibG9kYXNoLWVzL2VhY2hcIiIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJsb2Rhc2gtZXMvZ2V0XCIiLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzL2V4dGVybmFsIFwibG9kYXNoLWVzL29taXRcIiIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJsb2Rhc2gtZXMvcGlja1wiIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy9leHRlcm5hbCBcInJlYWN0XCIiLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsT0FBTyx3QkFBd0IsV0FBVztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxlQUFlOzs7Ozs7Ozs7OztBQzVFZixzQzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7O0FDQUEscUM7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VDdEJBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6InJlYWN0L2F1dGgvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMudHJpZ2dlckFsbCA9IGV4cG9ydHMudHJpZ2dlciA9IGV4cG9ydHMuQXV0aFByb3ZpZGVyID0gZXhwb3J0cy5BdXRoRHJpdmVycyA9IGV4cG9ydHMuQXV0aENvbnRleHQgPSB2b2lkIDA7XG52YXIgQXV0aENvbnRleHRfMSA9IHJlcXVpcmUoXCIuL3NyYy9BdXRoQ29udGV4dFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkF1dGhDb250ZXh0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfX2ltcG9ydERlZmF1bHQoQXV0aENvbnRleHRfMSkuZGVmYXVsdDsgfSB9KTtcbnZhciBBdXRoRHJpdmVyc18xID0gcmVxdWlyZShcIi4vc3JjL0F1dGhEcml2ZXJzXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQXV0aERyaXZlcnNcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9faW1wb3J0RGVmYXVsdChBdXRoRHJpdmVyc18xKS5kZWZhdWx0OyB9IH0pO1xudmFyIEF1dGhQcm92aWRlcl8xID0gcmVxdWlyZShcIi4vc3JjL0F1dGhQcm92aWRlclwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkF1dGhQcm92aWRlclwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gX19pbXBvcnREZWZhdWx0KEF1dGhQcm92aWRlcl8xKS5kZWZhdWx0OyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidHJpZ2dlclwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gQXV0aFByb3ZpZGVyXzEudHJpZ2dlcjsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInRyaWdnZXJBbGxcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEF1dGhQcm92aWRlcl8xLnRyaWdnZXJBbGw7IH0gfSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHJlYWN0XzEgPSByZXF1aXJlKFwicmVhY3RcIik7XG5jb25zdCBBdXRoQ29udGV4dCA9IHJlYWN0XzEuY3JlYXRlQ29udGV4dCh7fSk7XG5BdXRoQ29udGV4dC5kaXNwbGF5TmFtZSA9ICdSZWFjdEF1dGhDb250ZXh0JztcbmV4cG9ydHMuZGVmYXVsdCA9IEF1dGhDb250ZXh0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgQXV0aERyaXZlcnM7XG4oZnVuY3Rpb24gKEF1dGhEcml2ZXJzKSB7XG4gICAgQXV0aERyaXZlcnNbXCJBVVRIMFwiXSA9IFwiYXV0aDBcIjtcbiAgICBBdXRoRHJpdmVyc1tcIkZJUkVCQVNFX0FVVEhcIl0gPSBcImZpcmViYXNlXCI7XG59KShBdXRoRHJpdmVycyB8fCAoQXV0aERyaXZlcnMgPSB7fSkpO1xuZXhwb3J0cy5kZWZhdWx0ID0gQXV0aERyaXZlcnM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy50cmlnZ2VyQWxsID0gZXhwb3J0cy50cmlnZ2VyID0gdm9pZCAwO1xuY29uc3Qgb21pdF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gtZXMvb21pdFwiKSk7XG5jb25zdCBlYWNoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC1lcy9lYWNoXCIpKTtcbmNvbnN0IGtpbmRfb2ZfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwia2luZC1vZlwiKSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBBdXRoQ29udGV4dF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0F1dGhDb250ZXh0XCIpKTtcbmNvbnN0IEF1dGgwQ2xpZW50XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY2xpZW50cy9BdXRoMENsaWVudFwiKSk7XG5jb25zdCBGaXJlYmFzZUF1dGhDbGllbnRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9jbGllbnRzL0ZpcmViYXNlQXV0aENsaWVudFwiKSk7XG5jb25zdCBBdXRoRHJpdmVyc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0F1dGhEcml2ZXJzXCIpKTtcbmNvbnN0IGNsaWVudHMgPSB7fTtcbmNvbnN0IEF1dGhQcm92aWRlciA9ICh7IGNoaWxkcmVuLCB3aXRoQXV0aDAsIHdpdGhGaXJlYmFzZSwgb25Vc2VyQ2hhbmdlLCBvbkVycm9yIH0pID0+IHtcbiAgICBjb25zdCBbYXV0aCwgc2V0QXV0aF0gPSByZWFjdF8xLnVzZVN0YXRlKHt9KTtcbiAgICByZWFjdF8xLnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbmZpZ01hcCA9IHtcbiAgICAgICAgICAgIFtBdXRoRHJpdmVyc18xLmRlZmF1bHQuQVVUSDBdOiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiB3aXRoQXV0aDAsXG4gICAgICAgICAgICAgICAgQ2xpZW50OiBBdXRoMENsaWVudF8xLmRlZmF1bHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbQXV0aERyaXZlcnNfMS5kZWZhdWx0LkZJUkVCQVNFX0FVVEhdOiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiB3aXRoRmlyZWJhc2UsXG4gICAgICAgICAgICAgICAgQ2xpZW50OiBGaXJlYmFzZUF1dGhDbGllbnRfMS5kZWZhdWx0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGVhY2hfMS5kZWZhdWx0KGNvbmZpZ01hcCwgKHsgY29uZmlnLCBDbGllbnQgfSwgZHJpdmVySWQpID0+IHtcbiAgICAgICAgICAgIGlmIChraW5kX29mXzEuZGVmYXVsdChjb25maWcpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoY29uZmlnKTtcbiAgICAgICAgICAgICAgICBjbGllbnQub24oJ3VzZXI6c2V0JywgKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyQ2hhbmdlID09PSBudWxsIHx8IG9uVXNlckNoYW5nZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Vc2VyQ2hhbmdlKGNsaWVudC5kcml2ZXJJZCwgdXNlcik7XG4gICAgICAgICAgICAgICAgICAgIHNldEF1dGgoT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBhdXRoKSwgeyBbY2xpZW50LmRyaXZlcklkXTogdXNlciB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xpZW50Lm9uKCd1c2VyOnVuc2V0JywgKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyQ2hhbmdlID09PSBudWxsIHx8IG9uVXNlckNoYW5nZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Vc2VyQ2hhbmdlKGNsaWVudC5kcml2ZXJJZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHNldEF1dGgob21pdF8xLmRlZmF1bHQoYXV0aCwgY2xpZW50LmRyaXZlcklkKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xpZW50Lm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvciA9PT0gbnVsbCB8fCBvbkVycm9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkVycm9yKGNsaWVudC5kcml2ZXJJZCwgZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGllbnRzW2RyaXZlcklkXSA9IGNsaWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC52YWx1ZXMoY2xpZW50cykuZm9yRWFjaChjbGllbnQgPT4ge1xuICAgICAgICAgICAgY2xpZW50ID09PSBudWxsIHx8IGNsaWVudCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2xpZW50LmVtaXQoJ2luaXQnLCBjbGllbnRzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC52YWx1ZXMoY2xpZW50cykuZm9yRWFjaChjbGllbnQgPT4ge1xuICAgICAgICAgICAgY2xpZW50ID09PSBudWxsIHx8IGNsaWVudCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2xpZW50LmVtaXQoJ3NpdGU6bG9hZCcsIHdpbmRvdyk7XG4gICAgICAgIH0pO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4gKHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KEF1dGhDb250ZXh0XzEuZGVmYXVsdC5Qcm92aWRlciwgeyB2YWx1ZTogYXV0aCB9LCBjaGlsZHJlbikpO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IEF1dGhQcm92aWRlcjtcbmNvbnN0IHRyaWdnZXIgPSAoZHJpdmVyLCBldmVudCwgcGFyYW1zID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgdmFyIF9hO1xuICAgIChfYSA9IGNsaWVudHNbZHJpdmVyXSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmVtaXQoZXZlbnQsIHBhcmFtcyk7XG59O1xuZXhwb3J0cy50cmlnZ2VyID0gdHJpZ2dlcjtcbmNvbnN0IHRyaWdnZXJBbGwgPSAoZXZlbnQsIHBhcmFtcyA9IHVuZGVmaW5lZCkgPT4ge1xuICAgIE9iamVjdC52YWx1ZXMoY2xpZW50cykuZm9yRWFjaChjbGllbnQgPT4gY2xpZW50ID09PSBudWxsIHx8IGNsaWVudCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2xpZW50LmVtaXQoZXZlbnQsIHBhcmFtcykpO1xufTtcbmV4cG9ydHMudHJpZ2dlckFsbCA9IHRyaWdnZXJBbGw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZXZlbnRlbWl0dGVyM18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJldmVudGVtaXR0ZXIzXCIpKTtcbmNvbnN0IGtpbmRfb2ZfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwia2luZC1vZlwiKSk7XG5jb25zdCBhdXRoMF9qc18xID0gcmVxdWlyZShcImF1dGgwLWpzXCIpO1xuY29uc3QgZ2V0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC1lcy9nZXRcIikpO1xuY29uc3QgcGlja18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gtZXMvcGlja1wiKSk7XG5jb25zdCBBdXRoRHJpdmVyc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi9BdXRoRHJpdmVyc1wiKSk7XG5jbGFzcyBBdXRoMENsaWVudCBleHRlbmRzIGV2ZW50ZW1pdHRlcjNfMS5kZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZHJpdmVySWQgPSBBdXRoRHJpdmVyc18xLmRlZmF1bHQuQVVUSDA7XG4gICAgICAgIHRoaXMuc3NvSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHJlc3BvbnNlVHlwZTogJ3Rva2VuIGlkX3Rva2VuJyxcbiAgICAgICAgICAgIHNjb3BlOiAnb3BlbmlkIHByb2ZpbGUgZW1haWwnXG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICBpZiAoWydkb21haW4nLCAnY2xpZW50SWQnLCAncmVkaXJlY3RVcmknXS5zb21lKGNvbmZpZ0tleSA9PiBraW5kX29mXzEuZGVmYXVsdChnZXRfMS5kZWZhdWx0KHRoaXMub3B0aW9ucywgY29uZmlnS2V5KSkgIT09ICdzdHJpbmcnKSkge1xuICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiQXV0aDBDbGllbnQgcmVxdWlyZXMgJ2RvbWFpbicsICdjbGllbnRJZCcgYW5kICdyZWRpcmVjdFVyaSdcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGllbnQgPSBuZXcgYXV0aDBfanNfMS5XZWJBdXRoKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywge1xuICAgICAgICAgICAgY2xpZW50SUQ6IHRoaXMub3B0aW9ucy5jbGllbnRJZFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMub24oJ2xvZ291dCcsICgpID0+IHRoaXMub25Mb2dvdXQoKSk7XG4gICAgICAgIHRoaXMub24oJ2xvZ2luJywgKCkgPT4gdGhpcy5vbkxvZ2luKCkpO1xuICAgICAgICB0aGlzLm9uKCdzaWdudXAnLCAoKSA9PiB0aGlzLm9uTG9naW4oe1xuICAgICAgICAgICAgc2NyZWVuX2hpbnQ6ICdzaWdudXAnXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5vbmNlKCdzaXRlOmxvYWQnLCB3aW5kb3cgPT4gdGhpcy5vblNpdGVMb2FkKHdpbmRvdykpO1xuICAgICAgICB0aGlzLm9uY2UoJ2luaXQnLCBjbGllbnRzID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2xpZW50c1tBdXRoRHJpdmVyc18xLmRlZmF1bHQuRklSRUJBU0VfQVVUSF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZmlyZWJhc2UgPSBjbGllbnRzW0F1dGhEcml2ZXJzXzEuZGVmYXVsdC5GSVJFQkFTRV9BVVRIXTtcbiAgICAgICAgICAgIHRoaXMub24oJ3VzZXI6c2V0JywgdXNlciA9PiBmaXJlYmFzZS5lbWl0KCdsb2dpbjp0b2tlbicsIGdldF8xLmRlZmF1bHQodXNlciwgJ3Rva2VuJykpKTtcbiAgICAgICAgICAgIHRoaXMub24oJ3VzZXI6dW5zZXQnLCAoKSA9PiBmaXJlYmFzZS5vbkxvZ291dCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9uU2l0ZUxvYWQod2luZG93KSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aG5hbWUsIGhhc2gsIG9yaWdpbiB9ID0gZ2V0XzEuZGVmYXVsdCh3aW5kb3csICdsb2NhdGlvbicsIHt9KTtcbiAgICAgICAgaWYgKHBhdGhuYW1lICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZWRpcmVjdFVyaS5yZXBsYWNlKC9cXC8kLywgJycpID09PSBgJHtvcmlnaW59JHtwYXRobmFtZX1gLnJlcGxhY2UoL1xcLyQvLCAnJykpIHtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5faGFuZGxlQ2FsbGJhY2soaGFzaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaGFzaCA9PT0gJycpIHtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5faGFuZGxlU2lsZW50U1NPKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25Mb2dpbihvcHRpb25zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNsaWVudC5hdXRob3JpemUob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvbkxvZ291dCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50LmxvZ291dCh7XG4gICAgICAgICAgICAgICAgcmV0dXJuVG86IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICAgICAgICAgICAgY2xpZW50SUQ6IHRoaXMub3B0aW9ucy5jbGllbnRJZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3VzZXI6dW5zZXQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9oYW5kbGVTaWxlbnRTU08oKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBpc0ZpcnN0Q2FsbCA9IHRoaXMuc3NvSW50ZXJ2YWwgPT09IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHlpZWxkIHRoaXMuX2NoZWNrU2Vzc2lvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXNlcjpzZXQnLCB0aGlzLl9nZXRQcm9maWxlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIGlmIChpc0ZpcnN0Q2FsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNzb0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCB0aGlzLl9oYW5kbGVTaWxlbnRTU08oKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgQXV0aDBDbGllbnQuU1NPX0RFTEFZKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0Q2FsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VzZXI6dW5zZXQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkxvZ291dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfaGFuZGxlQ2FsbGJhY2soaGFzaCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoKGhhc2ggPT09IG51bGwgfHwgaGFzaCA9PT0gdm9pZCAwID8gdm9pZCAwIDogaGFzaC5pbmNsdWRlcygnYWNjZXNzX3Rva2VuPScpKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB5aWVsZCB0aGlzLl9wYXJzZUhhc2goKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1c2VyOnNldCcsIHRoaXMuX2dldFByb2ZpbGUocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTG9naW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9wYXJzZUhhc2goKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4geWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50LnBhcnNlSGFzaCgoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbiA9IChfYSA9IGdldF8xLmRlZmF1bHQocmVzdWx0LCAnaWRUb2tlbicpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChFcnJvcignTm8gaWQgdG9rZW4gZm91bmQnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZmlsZSA9IGdldF8xLmRlZmF1bHQocmVzdWx0LCAnaWRUb2tlblBheWxvYWQnLCB7fSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4cGlyZXNBdCA9IGdldF8xLmRlZmF1bHQocmVzdWx0LCAnaWRUb2tlblBheWxvYWQuZXhwJywgMCkgKiAxMDAwO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBpcmVzQXRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9jaGVja1Nlc3Npb24oKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4geWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50LmNoZWNrU2Vzc2lvbih7fSwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9rZW4gPSAoX2EgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2lkVG9rZW4nKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbiA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoRXJyb3IoJ05vIGlkIHRva2VuIGZvdW5kJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2lkVG9rZW5QYXlsb2FkJywge30pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBpcmVzQXQgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2lkVG9rZW5QYXlsb2FkLmV4cCcsIDApICogMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJlc0F0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfZ2V0UHJvZmlsZShyZXN1bHQpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHBpY2tfMS5kZWZhdWx0KHJlc3VsdC5wcm9maWxlLCBbXG4gICAgICAgICAgICAnZW1haWwnLFxuICAgICAgICAgICAgJ25hbWUnLFxuICAgICAgICAgICAgJ3BpY3R1cmUnXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAocHJvZmlsZS5uYW1lID09PSBwcm9maWxlLmVtYWlsKSB7XG4gICAgICAgICAgICBwcm9maWxlLm5hbWUgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdC5wcm9maWxlLCAnbmlja25hbWUnLCBwcm9maWxlLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gZ2V0XzEuZGVmYXVsdChyZXN1bHQsICd0b2tlbicpO1xuICAgICAgICBjb25zdCB0b2tlbkV4cGlyZXNBdCA9IGdldF8xLmRlZmF1bHQocmVzdWx0LCAnZXhwaXJlc0F0Jyk7XG4gICAgICAgIGNvbnN0IHZlcmlmaWVkID0gZ2V0XzEuZGVmYXVsdChyZXN1bHQucHJvZmlsZSwgJ2VtYWlsX3ZlcmlmaWVkJywgJ3ZlcmlmaWVkJyk7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgdG9rZW5FeHBpcmVzQXQsXG4gICAgICAgICAgICB2ZXJpZmllZFxuICAgICAgICB9LCBwcm9maWxlKTtcbiAgICB9XG4gICAgX3JlcG9ydEVycm9yKGVycikge1xuICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldF8xLmRlZmF1bHQoZXJyLCAnZXJyb3InLCBnZXRfMS5kZWZhdWx0KGVyciwgJ2Vycm9yRGVzY3JpcHRpb24nLCAndW5rbm93bicpKS5yZXBsYWNlKC9fL2csICcgJyk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgRXJyb3IobWVzc2FnZSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQXV0aDBDbGllbnQ7XG5BdXRoMENsaWVudC5TU09fREVMQVkgPSAyMCAqIDYwICogMTAwMDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBldmVudGVtaXR0ZXIzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV2ZW50ZW1pdHRlcjNcIikpO1xuY29uc3QgQXV0aERyaXZlcnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vQXV0aERyaXZlcnNcIikpO1xuY29uc3QgZ2V0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC1lcy9nZXRcIikpO1xuY2xhc3MgRmlyZWJhc2VBdXRoQ2xpZW50IGV4dGVuZHMgZXZlbnRlbWl0dGVyM18xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5kcml2ZXJJZCA9IEF1dGhEcml2ZXJzXzEuZGVmYXVsdC5GSVJFQkFTRV9BVVRIO1xuICAgICAgICBjb25zdCB7IGZpcmViYXNlLCBmaXJlYmFzZUF1dGgsIG9uQXV0aFN0YXRlQ2hhbmdlZCB9ID0gb3B0aW9ucztcbiAgICAgICAgaWYgKFtmaXJlYmFzZSwgZmlyZWJhc2VBdXRoLCBvbkF1dGhTdGF0ZUNoYW5nZWRdLnNvbWUoZSA9PiBlID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJGaXJlYmFzZUF1dGhDbGllbnQgcmVxdWlyZXMgJ2ZpcmViYXNlJywgJ2ZpcmViYXNlQXV0aCcgY2xpZW50IGFuZCAnb25BdXRoU3RhdGVDaGFuZ2VkJyBjYWxsYmFja1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpcmViYXNlID0gZmlyZWJhc2U7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gZmlyZWJhc2VBdXRoO1xuICAgICAgICB0aGlzLm9uKCdsb2dvdXQnLCAoKSA9PiB0aGlzLm9uTG9nb3V0KCkpO1xuICAgICAgICB0aGlzLm9uKCdsb2dpbjp0b2tlbicsIHRva2VuID0+IHtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5fbG9naW5XaXRoQ3VzdG9tVG9rZW4odG9rZW4pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbmNlKCdpbml0JywgKCkgPT4ge1xuICAgICAgICAgICAgb25BdXRoU3RhdGVDaGFuZ2VkKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIgIT09IG51bGwgJiYgdXNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXIuZ2V0SWRUb2tlblJlc3VsdCh0cnVlKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVzZXIudWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiByZXN1bHQudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBzOiBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2NsYWltcy5nJywgW10pXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1c2VyOnNldCcsIHByb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VzZXI6dW5zZXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9uTG9nb3V0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jbGllbnQuc2lnbk91dCgpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCd1c2VyOnVuc2V0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2xvZ2luV2l0aEN1c3RvbVRva2VuKHRva2VuKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2hhbmdlVG9rZW4gPSB0aGlzLmZpcmViYXNlLmZ1bmN0aW9ucygpLmh0dHBzQ2FsbGFibGUoJ2F1dGgnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRhdGEgfSA9IHlpZWxkIGV4Y2hhbmdlVG9rZW4oeyB0OiB0b2tlbiB9KTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5lcnJvciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNsaWVudC5zaWduSW5XaXRoQ3VzdG9tVG9rZW4oZGF0YS5jdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEZpcmViYXNlQXV0aENsaWVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImF1dGgwLWpzXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudGVtaXR0ZXIzXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJraW5kLW9mXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2gtZXMvZWFjaFwiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoLWVzL2dldFwiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoLWVzL29taXRcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC1lcy9waWNrXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWFjdFwiKTs7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vcmVhY3QvYXV0aC9pbmRleC50c1wiKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=