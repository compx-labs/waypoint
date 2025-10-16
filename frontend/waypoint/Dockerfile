FROM node:22-alpine AS build-env
COPY . /app/
WORKDIR /app
# Clean install with explicit optional dependencies for Alpine Linux
RUN rm -rf node_modules package-lock.json && npm install
RUN npm run build

FROM node:22-alpine
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm install --omit=dev
COPY --from=build-env /app/dist /app/dist
WORKDIR /app
CMD ["npm", "run", "start"]