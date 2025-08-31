import axios from 'axios';
export class ClientSdk {
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
            await axios.get(this.healthUrl.href);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async throwErrorIfServiceNotAvailable() {
        return await axios.get(this.healthUrl.href);
    }
    _getFullUrl(pathname) {
        if (!pathname.startsWith('/')) {
            pathname = '/' + pathname;
        }
        const fullUrl = new URL(this.versionPrefix + pathname, this.serviceUrl);
        return fullUrl.href;
    }
}
ClientSdk.healthPathname = '/health';
//# sourceMappingURL=index.js.map