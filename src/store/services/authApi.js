// src/store/services/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://192.168.1.22:8000/api';

export const authApi = createApi({
  reducerPath: 'authApi',
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
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
      }),
      // ✅ RIMOSSO: onQueryStarted che causava refetch automatici
      invalidatesTags: ['User'],
    }),
    
    // Register
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      // ✅ RIMOSSO: onQueryStarted che causava refetch automatici
      invalidatesTags: ['User'],
    }),
    
    // Get current user profile
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
      // ✅ RIMOSSO: transformResponse con console.log
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi;