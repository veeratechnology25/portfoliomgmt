// authService.ts
export const authService = {
  getAuthToken () {
    return localStorage.getItem('access_token');
  },
};
