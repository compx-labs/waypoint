FROM node:22-alpine AS build-env
COPY . /app/
WORKDIR /app
RUN npm ci
RUN npm run build

FROM node:22-alpine
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev
COPY --from=build-env /app/dist /app/dist
WORKDIR /app
CMD ["npm", "run", "start"]