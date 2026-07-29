FROM node:20.19.5-alpine3.22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.28.0-alpine3.21 AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx/conf.d

USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
