// src/store/services/gameApi.js - VERSIONE CORRETTA SENZA POLLING ECCESSIVO
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
  tagTypes: ['TimerAttempt', 'Leaderboard'],
  endpoints: (builder) => ({
    // ✅ CORREZIONE: Verifica se può giocare SENZA polling automatico
    checkAttemptStatus: builder.query({
      query: (challengeId) => `/challenges/${challengeId}/timer/status`,
      providesTags: (result, error, challengeId) => [
        { type: 'TimerAttempt', id: challengeId }
      ],
      // ❌ RIMOSSO: Qualsiasi polling automatico
      // Le query vengono aggiornate solo quando necessario tramite invalidatesTags
    }),
    
    // ✅ CORREZIONE: Invia tentativo con invalidazione corretta dei tag
    submitTimerAttempt: builder.mutation({
      query: ({ challengeId, attemptData }) => ({
        url: `/challenges/${challengeId}/timer/attempt`,
        method: 'POST',
        body: attemptData,
      }),
      // ✅ IMPORTANTE: Invalida i tag per aggiornare le query correlate
      invalidatesTags: (result, error, { challengeId }) => [
        { type: 'TimerAttempt', id: challengeId },
        { type: 'Leaderboard', id: challengeId },
        // ✅ AGGIUNTO: Invalida anche i tag delle challenge per aggiornare lo stato
        'Challenge',
        'UserChallenges'
      ],
      // ✅ OTTIMIZZAZIONE: Aggiornamento ottimistico per una UX migliore
      async onQueryStarted({ challengeId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          
          // ✅ Dopo il submit, forza il refresh dello stato del gioco
          dispatch(
            gameApi.util.invalidateTags([{ type: 'TimerAttempt', id: challengeId }])
          );
        } catch (error) {
          console.log('❌ Submit attempt failed:', error);
        }
      },
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