import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      tokenType: 'Bearer',
      expiresIn: 0,
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          tokenType: auth.tokenType,
          expiresIn: auth.expiresIn,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          tokenType: 'Bearer',
          expiresIn: 0,
        }),
    }),
    { name: 'selling-phone-auth' },
  ),
);
