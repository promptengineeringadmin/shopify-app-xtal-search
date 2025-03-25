FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
RUN npm remove @shopify/cli

COPY . .

# Ensure the build directory is created
RUN npm run build

# Double-check if the build folder exists
RUN ls -la /app/build

CMD ["npm", "run", "docker-start"]
