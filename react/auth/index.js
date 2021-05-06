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
const get_1 = __importDefault(__webpack_require__(/*! lodash-es/get */ "lodash-es/get"));
const kind_of_1 = __importDefault(__webpack_require__(/*! kind-of */ "kind-of"));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const AuthContext_1 = __importDefault(__webpack_require__(/*! ./AuthContext */ "./react/auth/src/AuthContext.ts"));
const Auth0Driver_1 = __importDefault(__webpack_require__(/*! ./drivers/Auth0Driver */ "./react/auth/src/drivers/Auth0Driver.ts"));
const FirebaseAuthDriver_1 = __importDefault(__webpack_require__(/*! ./drivers/FirebaseAuthDriver */ "./react/auth/src/drivers/FirebaseAuthDriver.ts"));
const AuthDrivers_1 = __importDefault(__webpack_require__(/*! ./AuthDrivers */ "./react/auth/src/AuthDrivers.ts"));
const clients = {};
const AuthProvider = ({ children, withAuth0, withFirebase, onUserChange, onError }) => {
    const [auth, setAuth] = react_1.useState({});
    react_1.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (kind_of_1.default(withFirebase) === 'object' && withFirebase !== undefined) {
            clients[AuthDrivers_1.default.FIREBASE_AUTH] = new FirebaseAuthDriver_1.default(withFirebase);
        }
        if (kind_of_1.default(withAuth0) === 'object' && withAuth0 !== undefined) {
            const auth0 = new Auth0Driver_1.default(withAuth0);
            if (typeof clients[AuthDrivers_1.default.FIREBASE_AUTH] !== 'undefined') {
                const firebase = clients[AuthDrivers_1.default.FIREBASE_AUTH];
                auth0.on('user:set', user => {
                    firebase === null || firebase === void 0 ? void 0 : firebase.emit('login:token', get_1.default(user, 'token'));
                });
                auth0.on('user:unset', () => firebase === null || firebase === void 0 ? void 0 : firebase.onLogout());
            }
            clients[AuthDrivers_1.default.AUTH0] = auth0;
        }
        Object.values(clients).forEach(driver => {
            if (driver === undefined) {
                return;
            }
            driver.on('user:set', user => {
                onUserChange === null || onUserChange === void 0 ? void 0 : onUserChange(driver.driverId, user);
                setAuth(Object.assign(Object.assign({}, auth), { [driver.driverId]: user }));
            });
            driver.on('user:unset', user => {
                onUserChange === null || onUserChange === void 0 ? void 0 : onUserChange(driver.driverId, null);
                setAuth(omit_1.default(auth, driver.driverId));
            });
            driver.on('error', err => {
                onError === null || onError === void 0 ? void 0 : onError(driver.driverId, err);
            });
        });
        Object.values(clients).forEach(driver => {
            driver === null || driver === void 0 ? void 0 : driver.emit('site:load', window);
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
    Object.values(clients).forEach(driver => driver === null || driver === void 0 ? void 0 : driver.emit(event, params));
};
exports.triggerAll = triggerAll;


/***/ }),

/***/ "./react/auth/src/drivers/Auth0Driver.ts":
/*!***********************************************!*\
  !*** ./react/auth/src/drivers/Auth0Driver.ts ***!
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
class Auth0Driver extends eventemitter3_1.default {
    constructor(options) {
        super();
        this.driverId = AuthDrivers_1.default.AUTH0;
        this.ssoInterval = null;
        this.options = Object.assign({
            responseType: 'token id_token',
            scope: 'openid profile email'
        }, options);
        if (['domain', 'clientId', 'redirectUri'].some(configKey => kind_of_1.default(get_1.default(this.options, configKey)) !== 'string')) {
            throw TypeError("Auth0Driver requires 'domain', 'clientId' and 'redirectUri'");
        }
        this.client = new auth0_js_1.WebAuth(Object.assign({}, this.options, {
            clientID: this.options.clientId
        }));
        this.on('site:load', window => this.onSiteLoad(window));
        this.on('logout', () => this.onLogout());
        this.on('login', () => this.onLogin());
        this.on('signup', () => this.onLogin({
            screen_hint: 'signup'
        }));
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
                    }, Auth0Driver.SSO_DELAY);
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
exports.default = Auth0Driver;
Auth0Driver.SSO_DELAY = 20 * 60 * 1000;


/***/ }),

/***/ "./react/auth/src/drivers/FirebaseAuthDriver.ts":
/*!******************************************************!*\
  !*** ./react/auth/src/drivers/FirebaseAuthDriver.ts ***!
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
class FirebaseAuthDriver extends eventemitter3_1.default {
    constructor(options) {
        super();
        this.driverId = AuthDrivers_1.default.FIREBASE_AUTH;
        const { firebase, firebaseAuth, onAuthStateChanged } = options;
        if ([firebase, firebaseAuth, onAuthStateChanged].some(e => e === undefined)) {
            throw TypeError("FirebaseAuthDriver requires 'firebase', 'firebaseAuth' client and 'onAuthStateChanged' callback");
        }
        this.firebase = firebase;
        this.client = firebaseAuth;
        this.on('logout', () => this.onLogout());
        this.on('login:token', token => {
            void this._loginWithCustomToken(token);
        });
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
exports.default = FirebaseAuthDriver;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvLi9yZWFjdC9hdXRoL2luZGV4LnRzIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy8uL3JlYWN0L2F1dGgvc3JjL0F1dGhDb250ZXh0LnRzIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy8uL3JlYWN0L2F1dGgvc3JjL0F1dGhEcml2ZXJzLnRzIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy8uL3JlYWN0L2F1dGgvc3JjL0F1dGhQcm92aWRlci50c3giLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzLy4vcmVhY3QvYXV0aC9zcmMvZHJpdmVycy9BdXRoMERyaXZlci50cyIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvLi9yZWFjdC9hdXRoL3NyYy9kcml2ZXJzL0ZpcmViYXNlQXV0aERyaXZlci50cyIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJhdXRoMC1qc1wiIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy9leHRlcm5hbCBcImV2ZW50ZW1pdHRlcjNcIiIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJraW5kLW9mXCIiLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzL2V4dGVybmFsIFwibG9kYXNoLWVzL2dldFwiIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy9leHRlcm5hbCBcImxvZGFzaC1lcy9vbWl0XCIiLCJ3ZWJwYWNrOi8vQHRla3UvYmxvY2tzL2V4dGVybmFsIFwibG9kYXNoLWVzL3BpY2tcIiIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3MvZXh0ZXJuYWwgXCJyZWFjdFwiIiwid2VicGFjazovL0B0ZWt1L2Jsb2Nrcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9AdGVrdS9ibG9ja3Mvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQTZDLENBQUMsY0FBYyxFQUFD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c0M7Ozs7Ozs7Ozs7QUNBQSwyQzs7Ozs7Ozs7OztBQ0FBLHFDOzs7Ozs7Ozs7O0FDQUEsMkM7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7O0FDQUEsbUM7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUN0QkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoicmVhY3QvYXV0aC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy50cmlnZ2VyQWxsID0gZXhwb3J0cy50cmlnZ2VyID0gZXhwb3J0cy5BdXRoUHJvdmlkZXIgPSBleHBvcnRzLkF1dGhEcml2ZXJzID0gZXhwb3J0cy5BdXRoQ29udGV4dCA9IHZvaWQgMDtcbnZhciBBdXRoQ29udGV4dF8xID0gcmVxdWlyZShcIi4vc3JjL0F1dGhDb250ZXh0XCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQXV0aENvbnRleHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9faW1wb3J0RGVmYXVsdChBdXRoQ29udGV4dF8xKS5kZWZhdWx0OyB9IH0pO1xudmFyIEF1dGhEcml2ZXJzXzEgPSByZXF1aXJlKFwiLi9zcmMvQXV0aERyaXZlcnNcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJBdXRoRHJpdmVyc1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gX19pbXBvcnREZWZhdWx0KEF1dGhEcml2ZXJzXzEpLmRlZmF1bHQ7IH0gfSk7XG52YXIgQXV0aFByb3ZpZGVyXzEgPSByZXF1aXJlKFwiLi9zcmMvQXV0aFByb3ZpZGVyXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQXV0aFByb3ZpZGVyXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfX2ltcG9ydERlZmF1bHQoQXV0aFByb3ZpZGVyXzEpLmRlZmF1bHQ7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0cmlnZ2VyXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBBdXRoUHJvdmlkZXJfMS50cmlnZ2VyOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidHJpZ2dlckFsbFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gQXV0aFByb3ZpZGVyXzEudHJpZ2dlckFsbDsgfSB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVhY3RfMSA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbmNvbnN0IEF1dGhDb250ZXh0ID0gcmVhY3RfMS5jcmVhdGVDb250ZXh0KHt9KTtcbkF1dGhDb250ZXh0LmRpc3BsYXlOYW1lID0gJ1JlYWN0QXV0aENvbnRleHQnO1xuZXhwb3J0cy5kZWZhdWx0ID0gQXV0aENvbnRleHQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBBdXRoRHJpdmVycztcbihmdW5jdGlvbiAoQXV0aERyaXZlcnMpIHtcbiAgICBBdXRoRHJpdmVyc1tcIkFVVEgwXCJdID0gXCJhdXRoMFwiO1xuICAgIEF1dGhEcml2ZXJzW1wiRklSRUJBU0VfQVVUSFwiXSA9IFwiZmlyZWJhc2VcIjtcbn0pKEF1dGhEcml2ZXJzIHx8IChBdXRoRHJpdmVycyA9IHt9KSk7XG5leHBvcnRzLmRlZmF1bHQgPSBBdXRoRHJpdmVycztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnRyaWdnZXJBbGwgPSBleHBvcnRzLnRyaWdnZXIgPSB2b2lkIDA7XG5jb25zdCBvbWl0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC1lcy9vbWl0XCIpKTtcbmNvbnN0IGdldF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gtZXMvZ2V0XCIpKTtcbmNvbnN0IGtpbmRfb2ZfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwia2luZC1vZlwiKSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBBdXRoQ29udGV4dF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0F1dGhDb250ZXh0XCIpKTtcbmNvbnN0IEF1dGgwRHJpdmVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZHJpdmVycy9BdXRoMERyaXZlclwiKSk7XG5jb25zdCBGaXJlYmFzZUF1dGhEcml2ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9kcml2ZXJzL0ZpcmViYXNlQXV0aERyaXZlclwiKSk7XG5jb25zdCBBdXRoRHJpdmVyc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL0F1dGhEcml2ZXJzXCIpKTtcbmNvbnN0IGNsaWVudHMgPSB7fTtcbmNvbnN0IEF1dGhQcm92aWRlciA9ICh7IGNoaWxkcmVuLCB3aXRoQXV0aDAsIHdpdGhGaXJlYmFzZSwgb25Vc2VyQ2hhbmdlLCBvbkVycm9yIH0pID0+IHtcbiAgICBjb25zdCBbYXV0aCwgc2V0QXV0aF0gPSByZWFjdF8xLnVzZVN0YXRlKHt9KTtcbiAgICByZWFjdF8xLnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChraW5kX29mXzEuZGVmYXVsdCh3aXRoRmlyZWJhc2UpID09PSAnb2JqZWN0JyAmJiB3aXRoRmlyZWJhc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2xpZW50c1tBdXRoRHJpdmVyc18xLmRlZmF1bHQuRklSRUJBU0VfQVVUSF0gPSBuZXcgRmlyZWJhc2VBdXRoRHJpdmVyXzEuZGVmYXVsdCh3aXRoRmlyZWJhc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChraW5kX29mXzEuZGVmYXVsdCh3aXRoQXV0aDApID09PSAnb2JqZWN0JyAmJiB3aXRoQXV0aDAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgYXV0aDAgPSBuZXcgQXV0aDBEcml2ZXJfMS5kZWZhdWx0KHdpdGhBdXRoMCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNsaWVudHNbQXV0aERyaXZlcnNfMS5kZWZhdWx0LkZJUkVCQVNFX0FVVEhdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcmViYXNlID0gY2xpZW50c1tBdXRoRHJpdmVyc18xLmRlZmF1bHQuRklSRUJBU0VfQVVUSF07XG4gICAgICAgICAgICAgICAgYXV0aDAub24oJ3VzZXI6c2V0JywgdXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpcmViYXNlID09PSBudWxsIHx8IGZpcmViYXNlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmaXJlYmFzZS5lbWl0KCdsb2dpbjp0b2tlbicsIGdldF8xLmRlZmF1bHQodXNlciwgJ3Rva2VuJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGF1dGgwLm9uKCd1c2VyOnVuc2V0JywgKCkgPT4gZmlyZWJhc2UgPT09IG51bGwgfHwgZmlyZWJhc2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGZpcmViYXNlLm9uTG9nb3V0KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xpZW50c1tBdXRoRHJpdmVyc18xLmRlZmF1bHQuQVVUSDBdID0gYXV0aDA7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LnZhbHVlcyhjbGllbnRzKS5mb3JFYWNoKGRyaXZlciA9PiB7XG4gICAgICAgICAgICBpZiAoZHJpdmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcml2ZXIub24oJ3VzZXI6c2V0JywgdXNlciA9PiB7XG4gICAgICAgICAgICAgICAgb25Vc2VyQ2hhbmdlID09PSBudWxsIHx8IG9uVXNlckNoYW5nZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Vc2VyQ2hhbmdlKGRyaXZlci5kcml2ZXJJZCwgdXNlcik7XG4gICAgICAgICAgICAgICAgc2V0QXV0aChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGF1dGgpLCB7IFtkcml2ZXIuZHJpdmVySWRdOiB1c2VyIH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZHJpdmVyLm9uKCd1c2VyOnVuc2V0JywgdXNlciA9PiB7XG4gICAgICAgICAgICAgICAgb25Vc2VyQ2hhbmdlID09PSBudWxsIHx8IG9uVXNlckNoYW5nZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25Vc2VyQ2hhbmdlKGRyaXZlci5kcml2ZXJJZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgc2V0QXV0aChvbWl0XzEuZGVmYXVsdChhdXRoLCBkcml2ZXIuZHJpdmVySWQpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZHJpdmVyLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgb25FcnJvciA9PT0gbnVsbCB8fCBvbkVycm9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkVycm9yKGRyaXZlci5kcml2ZXJJZCwgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhjbGllbnRzKS5mb3JFYWNoKGRyaXZlciA9PiB7XG4gICAgICAgICAgICBkcml2ZXIgPT09IG51bGwgfHwgZHJpdmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkcml2ZXIuZW1pdCgnc2l0ZTpsb2FkJywgd2luZG93KTtcbiAgICAgICAgfSk7XG4gICAgfSwgW10pO1xuICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoQXV0aENvbnRleHRfMS5kZWZhdWx0LlByb3ZpZGVyLCB7IHZhbHVlOiBhdXRoIH0sIGNoaWxkcmVuKSk7XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gQXV0aFByb3ZpZGVyO1xuY29uc3QgdHJpZ2dlciA9IChkcml2ZXIsIGV2ZW50LCBwYXJhbXMgPSB1bmRlZmluZWQpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgKF9hID0gY2xpZW50c1tkcml2ZXJdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZW1pdChldmVudCwgcGFyYW1zKTtcbn07XG5leHBvcnRzLnRyaWdnZXIgPSB0cmlnZ2VyO1xuY29uc3QgdHJpZ2dlckFsbCA9IChldmVudCwgcGFyYW1zID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgT2JqZWN0LnZhbHVlcyhjbGllbnRzKS5mb3JFYWNoKGRyaXZlciA9PiBkcml2ZXIgPT09IG51bGwgfHwgZHJpdmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkcml2ZXIuZW1pdChldmVudCwgcGFyYW1zKSk7XG59O1xuZXhwb3J0cy50cmlnZ2VyQWxsID0gdHJpZ2dlckFsbDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBldmVudGVtaXR0ZXIzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImV2ZW50ZW1pdHRlcjNcIikpO1xuY29uc3Qga2luZF9vZl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJraW5kLW9mXCIpKTtcbmNvbnN0IGF1dGgwX2pzXzEgPSByZXF1aXJlKFwiYXV0aDAtanNcIik7XG5jb25zdCBnZXRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibG9kYXNoLWVzL2dldFwiKSk7XG5jb25zdCBwaWNrXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC1lcy9waWNrXCIpKTtcbmNvbnN0IEF1dGhEcml2ZXJzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL0F1dGhEcml2ZXJzXCIpKTtcbmNsYXNzIEF1dGgwRHJpdmVyIGV4dGVuZHMgZXZlbnRlbWl0dGVyM18xLmRlZmF1bHQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5kcml2ZXJJZCA9IEF1dGhEcml2ZXJzXzEuZGVmYXVsdC5BVVRIMDtcbiAgICAgICAgdGhpcy5zc29JbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgcmVzcG9uc2VUeXBlOiAndG9rZW4gaWRfdG9rZW4nLFxuICAgICAgICAgICAgc2NvcGU6ICdvcGVuaWQgcHJvZmlsZSBlbWFpbCdcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChbJ2RvbWFpbicsICdjbGllbnRJZCcsICdyZWRpcmVjdFVyaSddLnNvbWUoY29uZmlnS2V5ID0+IGtpbmRfb2ZfMS5kZWZhdWx0KGdldF8xLmRlZmF1bHQodGhpcy5vcHRpb25zLCBjb25maWdLZXkpKSAhPT0gJ3N0cmluZycpKSB7XG4gICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJBdXRoMERyaXZlciByZXF1aXJlcyAnZG9tYWluJywgJ2NsaWVudElkJyBhbmQgJ3JlZGlyZWN0VXJpJ1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsaWVudCA9IG5ldyBhdXRoMF9qc18xLldlYkF1dGgoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCB7XG4gICAgICAgICAgICBjbGllbnRJRDogdGhpcy5vcHRpb25zLmNsaWVudElkXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5vbignc2l0ZTpsb2FkJywgd2luZG93ID0+IHRoaXMub25TaXRlTG9hZCh3aW5kb3cpKTtcbiAgICAgICAgdGhpcy5vbignbG9nb3V0JywgKCkgPT4gdGhpcy5vbkxvZ291dCgpKTtcbiAgICAgICAgdGhpcy5vbignbG9naW4nLCAoKSA9PiB0aGlzLm9uTG9naW4oKSk7XG4gICAgICAgIHRoaXMub24oJ3NpZ251cCcsICgpID0+IHRoaXMub25Mb2dpbih7XG4gICAgICAgICAgICBzY3JlZW5faGludDogJ3NpZ251cCdcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBvblNpdGVMb2FkKHdpbmRvdykge1xuICAgICAgICBjb25zdCB7IHBhdGhuYW1lLCBoYXNoLCBvcmlnaW4gfSA9IGdldF8xLmRlZmF1bHQod2luZG93LCAnbG9jYXRpb24nLCB7fSk7XG4gICAgICAgIGlmIChwYXRobmFtZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucmVkaXJlY3RVcmkucmVwbGFjZSgvXFwvJC8sICcnKSA9PT0gYCR7b3JpZ2lufSR7cGF0aG5hbWV9YC5yZXBsYWNlKC9cXC8kLywgJycpKSB7XG4gICAgICAgICAgICB2b2lkIHRoaXMuX2hhbmRsZUNhbGxiYWNrKGhhc2gpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGhhc2ggPT09ICcnKSB7XG4gICAgICAgICAgICB2b2lkIHRoaXMuX2hhbmRsZVNpbGVudFNTTygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uTG9naW4ob3B0aW9ucykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jbGllbnQuYXV0aG9yaXplKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25Mb2dvdXQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNsaWVudC5sb2dvdXQoe1xuICAgICAgICAgICAgICAgIHJldHVyblRvOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICAgICAgICAgIGNsaWVudElEOiB0aGlzLm9wdGlvbnMuY2xpZW50SWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCd1c2VyOnVuc2V0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfaGFuZGxlU2lsZW50U1NPKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgaXNGaXJzdENhbGwgPSB0aGlzLnNzb0ludGVydmFsID09PSBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB5aWVsZCB0aGlzLl9jaGVja1Nlc3Npb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VzZXI6c2V0JywgdGhpcy5fZ2V0UHJvZmlsZShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGaXJzdENhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zc29JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgdGhpcy5faGFuZGxlU2lsZW50U1NPKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIEF1dGgwRHJpdmVyLlNTT19ERUxBWSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmICghaXNGaXJzdENhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1c2VyOnVuc2V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Mb2dvdXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2hhbmRsZUNhbGxiYWNrKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKChoYXNoID09PSBudWxsIHx8IGhhc2ggPT09IHZvaWQgMCA/IHZvaWQgMCA6IGhhc2guaW5jbHVkZXMoJ2FjY2Vzc190b2tlbj0nKSkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geWllbGQgdGhpcy5fcGFyc2VIYXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXNlcjpzZXQnLCB0aGlzLl9nZXRQcm9maWxlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkxvZ2luKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcGFyc2VIYXNoKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWVudC5wYXJzZUhhc2goKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9rZW4gPSAoX2EgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2lkVG9rZW4nKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbiA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoRXJyb3IoJ05vIGlkIHRva2VuIGZvdW5kJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2lkVG9rZW5QYXlsb2FkJywge30pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBpcmVzQXQgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2lkVG9rZW5QYXlsb2FkLmV4cCcsIDApICogMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJlc0F0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfY2hlY2tTZXNzaW9uKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWVudC5jaGVja1Nlc3Npb24oe30sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuID0gKF9hID0gZ2V0XzEuZGVmYXVsdChyZXN1bHQsICdpZFRva2VuJykpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW4gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KEVycm9yKCdObyBpZCB0b2tlbiBmb3VuZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0gZ2V0XzEuZGVmYXVsdChyZXN1bHQsICdpZFRva2VuUGF5bG9hZCcsIHt9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwaXJlc0F0ID0gZ2V0XzEuZGVmYXVsdChyZXN1bHQsICdpZFRva2VuUGF5bG9hZC5leHAnLCAwKSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyZXNBdFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2dldFByb2ZpbGUocmVzdWx0KSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSBwaWNrXzEuZGVmYXVsdChyZXN1bHQucHJvZmlsZSwgW1xuICAgICAgICAgICAgJ2VtYWlsJyxcbiAgICAgICAgICAgICduYW1lJyxcbiAgICAgICAgICAgICdwaWN0dXJlJ1xuICAgICAgICBdKTtcbiAgICAgICAgaWYgKHByb2ZpbGUubmFtZSA9PT0gcHJvZmlsZS5lbWFpbCkge1xuICAgICAgICAgICAgcHJvZmlsZS5uYW1lID0gZ2V0XzEuZGVmYXVsdChyZXN1bHQucHJvZmlsZSwgJ25pY2tuYW1lJywgcHJvZmlsZS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IGdldF8xLmRlZmF1bHQocmVzdWx0LCAndG9rZW4nKTtcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmVzQXQgPSBnZXRfMS5kZWZhdWx0KHJlc3VsdCwgJ2V4cGlyZXNBdCcpO1xuICAgICAgICBjb25zdCB2ZXJpZmllZCA9IGdldF8xLmRlZmF1bHQocmVzdWx0LnByb2ZpbGUsICdlbWFpbF92ZXJpZmllZCcsICd2ZXJpZmllZCcpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgIHRva2VuRXhwaXJlc0F0LFxuICAgICAgICAgICAgdmVyaWZpZWRcbiAgICAgICAgfSwgcHJvZmlsZSk7XG4gICAgfVxuICAgIF9yZXBvcnRFcnJvcihlcnIpIHtcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRfMS5kZWZhdWx0KGVyciwgJ2Vycm9yJywgZ2V0XzEuZGVmYXVsdChlcnIsICdlcnJvckRlc2NyaXB0aW9uJywgJ3Vua25vd24nKSkucmVwbGFjZSgvXy9nLCAnICcpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIEVycm9yKG1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEF1dGgwRHJpdmVyO1xuQXV0aDBEcml2ZXIuU1NPX0RFTEFZID0gMjAgKiA2MCAqIDEwMDA7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZXZlbnRlbWl0dGVyM18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJldmVudGVtaXR0ZXIzXCIpKTtcbmNvbnN0IEF1dGhEcml2ZXJzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL0F1dGhEcml2ZXJzXCIpKTtcbmNvbnN0IGdldF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gtZXMvZ2V0XCIpKTtcbmNsYXNzIEZpcmViYXNlQXV0aERyaXZlciBleHRlbmRzIGV2ZW50ZW1pdHRlcjNfMS5kZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZHJpdmVySWQgPSBBdXRoRHJpdmVyc18xLmRlZmF1bHQuRklSRUJBU0VfQVVUSDtcbiAgICAgICAgY29uc3QgeyBmaXJlYmFzZSwgZmlyZWJhc2VBdXRoLCBvbkF1dGhTdGF0ZUNoYW5nZWQgfSA9IG9wdGlvbnM7XG4gICAgICAgIGlmIChbZmlyZWJhc2UsIGZpcmViYXNlQXV0aCwgb25BdXRoU3RhdGVDaGFuZ2VkXS5zb21lKGUgPT4gZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiRmlyZWJhc2VBdXRoRHJpdmVyIHJlcXVpcmVzICdmaXJlYmFzZScsICdmaXJlYmFzZUF1dGgnIGNsaWVudCBhbmQgJ29uQXV0aFN0YXRlQ2hhbmdlZCcgY2FsbGJhY2tcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXJlYmFzZSA9IGZpcmViYXNlO1xuICAgICAgICB0aGlzLmNsaWVudCA9IGZpcmViYXNlQXV0aDtcbiAgICAgICAgdGhpcy5vbignbG9nb3V0JywgKCkgPT4gdGhpcy5vbkxvZ291dCgpKTtcbiAgICAgICAgdGhpcy5vbignbG9naW46dG9rZW4nLCB0b2tlbiA9PiB7XG4gICAgICAgICAgICB2b2lkIHRoaXMuX2xvZ2luV2l0aEN1c3RvbVRva2VuKHRva2VuKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9uQXV0aFN0YXRlQ2hhbmdlZCgodXNlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZXIgIT09IG51bGwgJiYgdXNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdXNlci5nZXRJZFRva2VuUmVzdWx0KHRydWUpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVzZXIudWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHJlc3VsdC50b2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwczogZ2V0XzEuZGVmYXVsdChyZXN1bHQsICdjbGFpbXMuZycsIFtdKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VzZXI6c2V0JywgcHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXNlcjp1bnNldCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb25Mb2dvdXQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNsaWVudC5zaWduT3V0KCk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3VzZXI6dW5zZXQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfbG9naW5XaXRoQ3VzdG9tVG9rZW4odG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhjaGFuZ2VUb2tlbiA9IHRoaXMuZmlyZWJhc2UuZnVuY3Rpb25zKCkuaHR0cHNDYWxsYWJsZSgnYXV0aCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0geWllbGQgZXhjaGFuZ2VUb2tlbih7IHQ6IHRva2VuIH0pO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmVycm9yID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKGRhdGEubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50LnNpZ25JbldpdGhDdXN0b21Ub2tlbihkYXRhLmN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRmlyZWJhc2VBdXRoRHJpdmVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYXV0aDAtanNcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50ZW1pdHRlcjNcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImtpbmQtb2ZcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC1lcy9nZXRcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaC1lcy9vbWl0XCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2gtZXMvcGlja1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVhY3RcIik7OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3JlYWN0L2F1dGgvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9