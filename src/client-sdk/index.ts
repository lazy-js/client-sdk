import axios from 'axios';

export class ClientSdk {
  static healthPathname = '/health';
  public healthUrl: URL;
  constructor(
    private readonly serviceUrl: string,
    private readonly versionPrefix: string = '/api/v1',
  ) {
    if (!this.serviceUrl.startsWith('http')) {
      this.serviceUrl = 'http://' + this.serviceUrl;
    }
    this.healthUrl = new URL(ClientSdk.healthPathname, this.serviceUrl);
  }

  async avialable(): Promise<boolean> {
    try {
      // URL (path, base)
      // .href => base + path

      await axios.get(this.healthUrl.href);
      return true;
    } catch (err) {
      return false;
    }
  }

  async throwErrorIfServiceNotAvailable() {
    return await axios.get(this.healthUrl.href);
  }

  _getFullUrl(pathname: string): string {
    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }
    const fullUrl = new URL(this.versionPrefix + pathname, this.serviceUrl);
    return fullUrl.href;
  }
}
