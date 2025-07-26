// src/store/services/challengeApi.js (AGGIORNATO)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const challengeApi = createApi({
  reducerPath: 'challengeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://192.168.1.8:8000/api', // Usa il tuo IP
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Challenge', 'Game'],
  endpoints: (builder) => ({
    // Lista challenge
    getChallenges: builder.query({
      query: () => '/challenges',
      providesTags: ['Challenge'],
      transformResponse: (response) => {
        // Se la risposta è un array, la restituisci così com'è
        // Se è un oggetto con una proprietà, estrai quella
        return Array.isArray(response) ? response : (response.challenges || response.data || []);
      },
    }),
    
    // Dettaglio challenge
    getChallenge: builder.query({
      query: (id) => `/challenges/${id}`,
      providesTags: (result, error, id) => [{ type: 'Challenge', id }],
    }),
    
    // Join challenge
    joinChallenge: builder.mutation({
      query: (challengeId) => ({
        url: `/challenges/${challengeId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, challengeId) => [
        { type: 'Challenge', id: challengeId },
        'Challenge',
      ],
    }),
    
    // Lista games
    getGames: builder.query({
      query: () => '/games',
      providesTags: ['Game'],
    }),
  }),
});

export const {
  useGetChallengesQuery,
  useGetChallengeQuery,
  useJoinChallengeMutation,
  useGetGamesQuery,
} = challengeApi;