FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build ./build
CMD ["serve", "-s", "build"]