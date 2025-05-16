FROM node:20 AS builder
WORKDIR /app
COPY . .

RUN npm install -g pnpm
RUN pnpm install
RUN npm run build

FROM node:20
RUN npm install -g serve
WORKDIR /app

COPY --from=builder /app/dist ./build
CMD ["serve", "-s", "build", "-l", "3000"]
