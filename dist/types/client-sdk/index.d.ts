export declare class ClientSdk {
    private readonly serviceUrl;
    private readonly versionPrefix;
    static healthPathname: string;
    healthUrl: URL;
    constructor(serviceUrl: string, versionPrefix?: string);
    avialable(): Promise<boolean>;
    throwErrorIfServiceNotAvailable(): Promise<import("axios").AxiosResponse<any, any>>;
    _getFullUrl(pathname: string): string;
}
//# sourceMappingURL=index.d.ts.map