// src/store/services/subscriptionApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://192.168.1.22:8000/api';

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
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
  tagTypes: ['Subscription', 'PaymentMethod', 'Transaction'],
  endpoints: (builder) => ({
    // Ottieni info abbonamento corrente
    getCurrentSubscription: builder.query({
      query: () => '/subscriptions/current',
      providesTags: ['Subscription'],
    }),
    
    // Upgrade pacchetto
    upgradePackage: builder.mutation({
      query: ({ packageType, paymentMethod }) => ({
        url: '/subscriptions/upgrade',
        method: 'POST',
        body: {
          packageType,
          paymentMethod
        }
      }),
      invalidatesTags: ['Subscription', 'User', 'Transaction'],
    }),
    
    // Cancella abbonamento
    cancelSubscription: builder.mutation({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Ottieni metodi di pagamento
    getPaymentMethods: builder.query({
      query: () => '/subscriptions/payment-methods',
      providesTags: ['PaymentMethod'],
    }),
    
    // Aggiungi metodo di pagamento
    addPaymentMethod: builder.mutation({
      query: (paymentMethod) => ({
        url: '/subscriptions/payment-methods',
        method: 'POST',
        body: { paymentMethod }
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
    
    // Ottieni storico transazioni
    getTransactionHistory: builder.query({
      query: () => '/subscriptions/transactions',
      providesTags: ['Transaction'],
    }),
    
    // Valida ricevuta IAP
    validateReceipt: builder.mutation({
      query: ({ platform, receipt, productId, purchaseToken }) => ({
        url: '/subscriptions/validate-receipt',
        method: 'POST',
        body: {
          platform,
          receipt,
          productId,
          purchaseToken
        }
      }),
      invalidatesTags: ['Subscription', 'User', 'Transaction'],
    }),
    
    // Ripristina acquisti
    restorePurchases: builder.mutation({
      query: ({ platform, receipts }) => ({
        url: '/subscriptions/restore-purchases',
        method: 'POST',
        body: {
          platform,
          receipts
        }
      }),
      invalidatesTags: ['Subscription', 'User', 'Transaction'],
    }),
  }),
});

export const {
  useGetCurrentSubscriptionQuery,
  useUpgradePackageMutation,
  useCancelSubscriptionMutation,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useGetTransactionHistoryQuery,
  useValidateReceiptMutation,
  useRestorePurchasesMutation,
} = subscriptionApi;