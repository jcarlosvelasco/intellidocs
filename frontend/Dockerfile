FROM node:lts-alpine

WORKDIR /frontend

RUN npm install -g pnpm

COPY package.json .
RUN pnpm install

COPY . .

CMD ["pnpm", "run", "dev"]
