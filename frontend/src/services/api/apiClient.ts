import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://sigopsmetrics-api.dot.ga.gov';

class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for any auth headers or common modifications
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Add any auth tokens or headers here
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor for common error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle common errors (401, 403, etc.)
                return Promise.reject(error);
            }
        );
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }
}

export const apiClient = ApiClient.getInstance(); 