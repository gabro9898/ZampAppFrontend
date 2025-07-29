// src/store/services/gameApi.js - VERSIONE CORRETTA SENZA ERRORI DI TAG
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://192.168.1.22:8000/api', // Usa il tuo IP
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['TimerAttempt', 'Leaderboard'], // SOLO I TAG DI gameApi
  endpoints: (builder) => ({
    // Verifica se può giocare SENZA polling automatico
    checkAttemptStatus: builder.query({
      query: (challengeId) => `/challenges/${challengeId}/timer/status`,
      providesTags: (result, error, challengeId) => [
        { type: 'TimerAttempt', id: challengeId }
      ],
    }),
    
    // Invia tentativo - SENZA invalidare tag di altre API
    submitTimerAttempt: builder.mutation({
      query: ({ challengeId, attemptData }) => ({
        url: `/challenges/${challengeId}/timer/attempt`,
        method: 'POST',
        body: attemptData,
      }),
      // IMPORTANTE: Invalida SOLO i tag che appartengono a gameApi
      invalidatesTags: (result, error, { challengeId }) => [
        { type: 'TimerAttempt', id: challengeId },
        { type: 'Leaderboard', id: challengeId },
        // NON METTERE 'Challenge' o 'UserChallenges' qui!
      ],
    }),
    
    // Leaderboard generale - SENZA polling continuo
    getLeaderboard: builder.query({
      query: (challengeId) => `/challenges/${challengeId}/timer/leaderboard`,
      providesTags: (result, error, challengeId) => [
        { type: 'Leaderboard', id: challengeId }
      ],
    }),
    
    // Leaderboard giornaliera - SENZA polling continuo
    getDailyLeaderboard: builder.query({
      query: ({ challengeId, date }) => ({
        url: `/challenges/${challengeId}/timer/daily-leaderboard`,
        params: date ? { date } : undefined,
      }),
      providesTags: (result, error, { challengeId }) => [
        { type: 'Leaderboard', id: `${challengeId}-daily` }
      ],
    }),
  }),
});

export const {
  useCheckAttemptStatusQuery,
  useSubmitTimerAttemptMutation,
  useGetLeaderboardQuery,
  useGetDailyLeaderboardQuery,
} = gameApi;