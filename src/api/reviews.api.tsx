import api from "./axios";

export const ReviewsApi = {
  addReview: (vetId: string, data: { rating: number; comment: string }) =>
    api.post(`/reviews/${vetId}`, data),

  getVetReviews: (vetId: string) =>
    api.get(`/reviews/${vetId}`),
};
