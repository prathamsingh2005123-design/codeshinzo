# Fix 502 Bad Gateway for /api/user/check-auth

## Steps:
- [ ] 1. Start backend server: `npm start` (runs on port 3000)
- [ ] 2. Ensure Frontend vite dev server running: `cd Frontend && npm run dev`
- [x] 3. Fix vite.config.js proxy target to localhost:3000
- [x] 4. Fix src/routes/userAuth.js route path to "/check-auth"
- [ ] 5. Test: Reload app, check Network tab for 200 OK on check-auth
- [ ] 6. If issues: Verify .env JWT_SECRET_KEY, cookies, userMiddleware
