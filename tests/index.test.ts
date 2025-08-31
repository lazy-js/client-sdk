import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { ClientSdk } from '../src/client-sdk';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

describe('ClientSdk', () => {
  let clientSdk: ClientSdk;
  const mockServiceUrl = 'https://api.example.com';
  const mockVersionPrefix = '/api/v1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with service URL and default version prefix', () => {
      clientSdk = new ClientSdk(mockServiceUrl);

      expect(clientSdk.healthUrl.href).toBe('https://api.example.com/health');
    });

    it('should initialize with service URL and custom version prefix', () => {
      const customPrefix = '/api/v2';
      clientSdk = new ClientSdk(mockServiceUrl, customPrefix);

      expect(clientSdk.healthUrl.href).toBe('https://api.example.com/health');
    });

    it('should handle service URL with trailing slash', () => {
      clientSdk = new ClientSdk('https://api.example.com/');

      expect(clientSdk.healthUrl.href).toBe('https://api.example.com/health');
    });

    it('should handle service URL without protocol', () => {
      clientSdk = new ClientSdk('api.example.com');

      expect(clientSdk.healthUrl.href).toBe('http://api.example.com/health');
    });
  });

  describe('avialable() method', () => {
    beforeEach(() => {
      clientSdk = new ClientSdk(mockServiceUrl, mockVersionPrefix);
    });

    it('should return true when health endpoint responds successfully', async () => {
      vi.mocked(mockedAxios.get).mockResolvedValueOnce({
        status: 200,
        data: 'OK',
      });

      const result = await clientSdk.avialable();

      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should return false when health endpoint throws an error', async () => {
      vi.mocked(mockedAxios.get).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const result = await clientSdk.avialable();

      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should return false when health endpoint returns 404', async () => {
      vi.mocked(mockedAxios.get).mockRejectedValueOnce({
        response: { status: 404 },
        message: 'Request failed with status code 404',
      });

      const result = await clientSdk.avialable();

      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
    });

    it('should return false when health endpoint returns 500', async () => {
      vi.mocked(mockedAxios.get).mockRejectedValueOnce({
        response: { status: 500 },
        message: 'Request failed with status code 500',
      });

      const result = await clientSdk.avialable();

      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
    });
  });

  describe('throwErrorIfServiceNotAvailable() method', () => {
    beforeEach(() => {
      clientSdk = new ClientSdk(mockServiceUrl, mockVersionPrefix);
    });

    it('should return axios response when health endpoint is available', async () => {
      const mockResponse = { status: 200, data: 'Service is healthy' };
      vi.mocked(mockedAxios.get).mockResolvedValueOnce(mockResponse);

      const result = await clientSdk.throwErrorIfServiceNotAvailable();

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error when health endpoint is not available', async () => {
      const mockError = new Error('Service unavailable');
      vi.mocked(mockedAxios.get).mockRejectedValueOnce(mockError);

      await expect(clientSdk.throwErrorIfServiceNotAvailable()).rejects.toThrow(
        'Service unavailable',
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
    });

    it('should throw error with proper status code when service returns 404', async () => {
      const mockError = {
        response: { status: 404, statusText: 'Not Found' },
        message: 'Request failed with status code 404',
      };
      vi.mocked(mockedAxios.get).mockRejectedValueOnce(mockError);

      await expect(clientSdk.throwErrorIfServiceNotAvailable()).rejects.toEqual(
        mockError,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/health',
      );
    });
  });

  describe('_getFullUrl() method', () => {
    beforeEach(() => {
      clientSdk = new ClientSdk(mockServiceUrl, mockVersionPrefix);
    });

    it('should construct full URL with version prefix and pathname', () => {
      const pathname = '/users';
      const result = clientSdk._getFullUrl(pathname);

      expect(result).toBe('https://api.example.com/api/v1/users');
    });

    it('should handle pathname with leading slash', () => {
      const pathname = '/products/123';
      const result = clientSdk._getFullUrl(pathname);

      expect(result).toBe('https://api.example.com/api/v1/products/123');
    });

    it('should handle pathname without leading slash', () => {
      const pathname = 'orders';
      const result = clientSdk._getFullUrl(pathname);

      expect(result).toBe('https://api.example.com/api/v1/orders');
    });

    it('should handle empty pathname', () => {
      const pathname = '';
      const result = clientSdk._getFullUrl(pathname);

      expect(result).toBe('https://api.example.com/api/v1/');
    });

    it('should handle pathname with query parameters', () => {
      const pathname = '/search?q=test&limit=10';
      const result = clientSdk._getFullUrl(pathname);

      expect(result).toBe(
        'https://api.example.com/api/v1/search?q=test&limit=10',
      );
    });

    it('should work with custom version prefix', () => {
      const customClientSdk = new ClientSdk(mockServiceUrl, '/api/v2');
      const pathname = '/data';
      const result = customClientSdk._getFullUrl(pathname);

      expect(result).toBe('https://api.example.com/api/v2/data');
    });

    it('should work with empty version prefix', () => {
      const customClientSdk = new ClientSdk(mockServiceUrl, '');
      const pathname = '/direct';
      const result = customClientSdk._getFullUrl(pathname);

      expect(result).toBe('https://api.example.com/direct');
    });
  });

  describe('Static properties', () => {
    it('should have correct healthPathname', () => {
      expect(ClientSdk.healthPathname).toBe('/health');
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      clientSdk = new ClientSdk(mockServiceUrl, mockVersionPrefix);
    });

    it('should handle service URL with port number', () => {
      const clientWithPort = new ClientSdk('https://localhost:3000', '/api/v1');

      expect(clientWithPort.healthUrl.href).toBe(
        'https://localhost:3000/health',
      );
      expect(clientWithPort._getFullUrl('/test')).toBe(
        'https://localhost:3000/api/v1/test',
      );
    });

    it('should handle complex service URLs', () => {
      const complexUrl = 'https://api.subdomain.example.com:8080/base';
      const clientWithComplexUrl = new ClientSdk(complexUrl, '/v3');

      expect(clientWithComplexUrl.healthUrl.href).toBe(
        'https://api.subdomain.example.com:8080/health',
      );
      expect(clientWithComplexUrl._getFullUrl('/endpoint')).toBe(
        'https://api.subdomain.example.com:8080/v3/endpoint',
      );
    });
  });
});
