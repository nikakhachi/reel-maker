FROM mhart/alpine-node:16
RUN mkdir /app
WORKDIR /app
COPY package*.json /app/
RUN npm ci
COPY . /app/
RUN npm run build
COPY . /app/
EXPOSE 8080
CMD ["node", "./build/server.js"]