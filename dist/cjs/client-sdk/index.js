"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSdk = void 0;
const axios_1 = __importDefault(require("axios"));
class ClientSdk {
    constructor(serviceUrl, versionPrefix = '/api/v1') {
        this.serviceUrl = serviceUrl;
        this.versionPrefix = versionPrefix;
        if (!this.serviceUrl.startsWith('http')) {
            this.serviceUrl = 'http://' + this.serviceUrl;
        }
        this.healthUrl = new URL(ClientSdk.healthPathname, this.serviceUrl);
    }
    async avialable() {
        try {
            // URL (path, base)
            // .href => base + path
            await axios_1.default.get(this.healthUrl.href);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async throwErrorIfServiceNotAvailable() {
        return await axios_1.default.get(this.healthUrl.href);
    }
    _getFullUrl(pathname) {
        if (!pathname.startsWith('/')) {
            pathname = '/' + pathname;
        }
        const fullUrl = new URL(this.versionPrefix + pathname, this.serviceUrl);
        return fullUrl.href;
    }
}
exports.ClientSdk = ClientSdk;
ClientSdk.healthPathname = '/health';
//# sourceMappingURL=index.js.map