FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY ./Frontend/frontend/package*.json ./

RUN npm install

COPY ./Frontend/frontend /app

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend /app

COPY --from=frontend-build /app/dist /app/public

CMD ["node","server.js"]

