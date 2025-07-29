// src/store/services/challengeApi.js - VERSIONE OTTIMIZZATA
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://192.168.1.22:8000/api';

export const challengeApi = createApi({
  reducerPath: 'challengeApi',
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
  tagTypes: ['Challenge', 'Game', 'UserChallenges'],
  endpoints: (builder) => ({
    // Lista tutte le challenge
    getChallenges: builder.query({
      query: () => '/challenges',
      providesTags: ['Challenge'],
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.challenges || response.data || [];
      },
    }),
    
    // Dettaglio singola challenge
    getChallenge: builder.query({
      query: (id) => `/challenges/${id}`,
      providesTags: (result, error, id) => [{ type: 'Challenge', id }],
    }),
    
    // ✅ CORREZIONE: Join challenge con invalidazione ottimizzata
    joinChallenge: builder.mutation({
      query: (challengeId) => ({
        url: `/challenges/${challengeId}/join`,
        method: 'POST',
      }),
      // ✅ SOLUZIONE: Invalidazione mirata invece di aggiornamento ottimistico complesso
      invalidatesTags: (result, error, challengeId) => [
        'Challenge', // Invalida tutte le challenge per aggiornare i contatori
        'UserChallenges', // Invalida le challenge dell'utente
        { type: 'Challenge', id: challengeId } // Invalida la challenge specifica
      ],
      // ❌ RIMOSSO: onQueryStarted complesso che causava problemi
    }),
    
    // Lista challenge dell'utente
    getUserChallenges: builder.query({
      query: (userId) => `/challenges/user/${userId}`,
      providesTags: ['UserChallenges'],
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.challenges || response.data || [];
      },
    }),
    
    // Lista tutti i games disponibili
    getGames: builder.query({
      query: () => '/games',
      providesTags: ['Game'],
    }),
    
    // Metadata di un tipo di gioco
    getGameMetadata: builder.query({
      query: (gameType) => `/games/metadata/${gameType}`,
      providesTags: (result, error, gameType) => [{ type: 'Game', id: gameType }],
    }),
    
    // Crea una nuova challenge (per admin)
    createChallenge: builder.mutation({
      query: (challengeData) => ({
        url: '/challenges',
        method: 'POST',
        body: challengeData,
      }),
      invalidatesTags: ['Challenge'],
    }),
    
    // Aggiorna una challenge (per admin)
    updateChallenge: builder.mutation({
      query: ({ id, ...challengeData }) => ({
        url: `/challenges/${id}`,
        method: 'PUT',
        body: challengeData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Challenge', id },
        'Challenge'
      ],
    }),
    
    // Elimina una challenge (per admin)
    deleteChallenge: builder.mutation({
      query: (id) => ({
        url: `/challenges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Challenge'],
    }),
  }),
});

export const {
  useGetChallengesQuery,
  useGetChallengeQuery,
  useGetUserChallengesQuery,
  useGetGamesQuery,
  useGetGameMetadataQuery,
  useJoinChallengeMutation,
  useCreateChallengeMutation,
  useUpdateChallengeMutation,
  useDeleteChallengeMutation,
  useLazyGetChallengesQuery,
  useLazyGetChallengeQuery,
  useLazyGetUserChallengesQuery,
} = challengeApi;