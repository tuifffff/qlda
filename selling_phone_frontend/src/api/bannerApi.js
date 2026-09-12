import { axiosClient } from './axiosClient.js';

export const bannerApi = {
  getActive: () => axiosClient.get('/api/banner/active'),
};
