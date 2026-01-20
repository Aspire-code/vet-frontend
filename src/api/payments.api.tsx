import api from "./axios";

export interface DepositPayload {
  client_id: string;
  vet_id: string;
  amount: number;
  currency: string;
  description: string;
  client_phone: string;
  appointment_time: string; // ISO 8601 string
}
export interface DepositResponse {
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
}

export const PaymentsApi = {
  
  createDeposit: async (data: DepositPayload): Promise<DepositResponse> => {
    try {
      const response = await api.post<DepositResponse>("/payments/deposit", data);
      return response.data;
    } catch (error: any) {
  
      console.error("Deposit API error:", error.response?.data || error.message);
      throw error;
    }
  },
};
