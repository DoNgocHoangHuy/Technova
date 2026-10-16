# TECHNOVA: Express serves both backend API and static frontend.
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/backend

# Install production dependencies only.
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Keep the project paths expected by backend/src/app.js.
COPY backend/ ./
COPY frontend/ /app/frontend/

# Writable persistent upload directory is mounted by Compose.
RUN mkdir -p /app/backend/uploads && chown -R node:node /app
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
