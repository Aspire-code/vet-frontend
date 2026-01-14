import api from "./axios";

export interface DepositPayload {
  client_id: string;
  vet_id: string;
  amount: number;
  currency: string;
  description: string;
  client_phone: string;
  appointment_time: string; // ISO 8601 string or similar format
}

export interface DepositResponse {
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
}

export const PaymentsApi = {
  /**
   * Sends a request to the backend to process a booking deposit.
   * Targets POST /api/payments/deposit
   */
  createDeposit: (data: DepositPayload) => 
    api.post<DepositResponse>("/payments/deposit", data),
};