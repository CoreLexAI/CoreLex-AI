export type Agent = {
    id: string;
    name: string;
    description: string;
    configuration: {
        prompt: string;
        model: string;
    };
};

export type Service = {
    id: string;
    name: string;
    pricing: {
        pricing_type: "per_call" | "per_token";
        price_amount: string;
        payment_address: string;
    };
    description: string;
    endpoint: string;
    input_schema: unknown;
    return_schema: unknown;
};

export type Authorization = {
    service_id: string;
    signature: string;
};

export interface APIErrorResponse {
    error: string;
    details?: unknown;
}

export interface APIResponse<T> {
    data?: T;
    error?: APIErrorResponse;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface ServiceSearchParams extends PaginationParams {
    q?: string;
    maxPrice?: number;
}

export interface AgentInferenceResponse {
    result: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: string;
    };
    metadata: {
        timestamp: string;
        latency: number;
    };
}

export declare class CoreLexClient {
    private baseUrl: string;
    private signer: string;

    constructor(config: {
        baseUrl: string;
        privateKey: string;
    }) {
        this.baseUrl = config.baseUrl;
        this.signer = config.privateKey;
    }

    private async signRequest(payload: object): Promise<string> {
        // Simulate signing logic for Solana
        // Add your wallet/signing integration here
        return "signed_payload";
    }

    private async request<T>(endpoint: string, method: string, body?: object): Promise<APIResponse<T>> {
        const signedPayload = body ? await this.signRequest(body) : undefined;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: JSON.stringify({ ...body, signedPayload }),
        });

        return response.json();
    }

    async createAgent(agent: Agent): Promise<APIResponse<Agent>> {
        return this.request<Agent>("/agents", "POST", agent);
    }

    async getAgent(agentId: string): Promise<APIResponse<Agent>> {
        return this.request<Agent>(`/agents/${agentId}`, "GET");
    }

    async updateAgent(agentId: string, update: Partial<Agent>): Promise<APIResponse<Agent>> {
        return this.request<Agent>(`/agents/${agentId}`, "PATCH", update);
    }

    async deleteAgent(agentId: string): Promise<APIResponse<void>> {
        return this.request<void>(`/agents/${agentId}`, "DELETE");
    }

    async listMyAgents(params?: PaginationParams): Promise<APIResponse<{ agents: Agent[] }>> {
        return this.request<{ agents: Agent[] }>("/agents", "GET", params);
    }

    async generateAgentConfig(specification: string): Promise<APIResponse<{ configuration: Agent }>> {
        return this.request<{ configuration: Agent }>("/agents/config", "POST", { specification });
    }

    async inferAgent(agentId: string, input: string, threadId: string): Promise<APIResponse<AgentInferenceResponse>> {
        return this.request<AgentInferenceResponse>(`/agents/${agentId}/infer`, "POST", { input, threadId });
    }

    async createService(service: Service): Promise<APIResponse<Service>> {
        return this.request<Service>("/services", "POST", service);
    }

    async getService(serviceId: string): Promise<APIResponse<Service>> {
        return this.request<Service>(`/services/${serviceId}`, "GET");
    }

    async updateService(serviceId: string, update: Partial<Service>): Promise<APIResponse<Service>> {
        return this.request<Service>(`/services/${serviceId}`, "PATCH", update);
    }

    async searchServices(params?: ServiceSearchParams): Promise<APIResponse<{ services: Service[] }>> {
        return this.request<{ services: Service[] }>("/services", "GET", params);
    }

    async authorizeService(serviceId: string, authorization: Authorization): Promise<APIResponse<{ auth_token: string }>> {
        return this.request<{ auth_token: string }>("/services/authorize", "POST", authorization);
    }
}
