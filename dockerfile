
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY ./Frontend/frontend/package*.json ./

RUN npm install

COPY ./Frontend/frontend .

RUN npm run build


FROM node:20-alpine

WORKDIR /app

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend .


COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3000

CMD ["node", "server.js"]