# Next 16 요구사항: Node >= 20.9
FROM node:22-slim AS base
WORKDIR /app

# 의존성 설치 (lockfile 기준, 레이어 캐시 활용)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 개발용: 소스는 compose bind mount로 주입되므로 COPY 불필요
FROM deps AS dev
EXPOSE 3001
CMD ["npx", "next", "dev", "-p", "3001", "-H", "0.0.0.0"]

# 프로덕션 빌드
FROM deps AS builder
COPY . .
RUN npm run build

# 프로덕션 러너 (standalone 산출물만 복사)
FROM base AS runner
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["node", "server.js"]
