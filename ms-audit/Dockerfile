# Etapa 1: Construcción (Build) - AHORA USAMOS NODE 20
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Ejecución (Producción) - AHORA USAMOS NODE 20
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]