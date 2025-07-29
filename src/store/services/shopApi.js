// src/store/services/shopApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://192.168.1.22:8000/api';

export const shopApi = createApi({
  reducerPath: 'shopApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ShopChallenge', 'Purchase', 'Challenge', 'UserChallenges'],
  endpoints: (builder) => ({
    // Ottieni challenge disponibili nello shop
    getShopChallenges: builder.query({
      query: (userId) => `/shop/challenges/${userId}`,
      providesTags: ['ShopChallenge'],
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.challenges || response.data || [];
      },
    }),
    
    // Acquista una challenge
    purchaseChallenge: builder.mutation({
      query: ({ userId, challengeId, paymentData }) => ({
        url: `/shop/purchase`,
        method: 'POST',
        body: {
          userId,
          challengeId,
          paymentData
        }
      }),
      invalidatesTags: ['ShopChallenge', 'Challenge', 'UserChallenges', 'Purchase'],
    }),
    
    // Ottieni gli acquisti dell'utente
    getUserPurchases: builder.query({
      query: (userId) => `/shop/purchases/${userId}`,
      providesTags: ['Purchase'],
    }),
    
    // Calcola il prezzo di una challenge per un utente
    calculatePrice: builder.query({
      query: ({ userId, challengeId }) => 
        `/shop/price/${challengeId}?userId=${userId}`,
    }),
    
    // Verifica se l'utente può accedere a una challenge
    checkAccess: builder.query({
      query: ({ userId, challengeId }) => 
        `/shop/access/${challengeId}?userId=${userId}`,
    }),
  }),
});

export const {
  useGetShopChallengesQuery,
  usePurchaseChallengeMutation,
  useGetUserPurchasesQuery,
  useCalculatePriceQuery,
  useCheckAccessQuery,
} = shopApi;