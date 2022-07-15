FROM mhart/alpine-node:14 as react-build
RUN mkdir /app/
WORKDIR /app/
COPY package*.json /app/
RUN npm ci
COPY . /app/
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=react-build /app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]