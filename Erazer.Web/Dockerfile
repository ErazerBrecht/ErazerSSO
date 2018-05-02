FROM node:10-alpine AS base
WORKDIR /app
USER node
EXPOSE 8888

FROM node:10-alpine AS build
WORKDIR /src
COPY . Erazer.Web/
RUN chown -R node:node Erazer.Web
USER node
WORKDIR /src/Erazer.Web
RUN npm run install:all
RUN npm run release

FROM node:10-alpine AS publish
WORKDIR /dist
USER node
COPY --from=build /src/Erazer.Web/node_modules ./node_modules
COPY --from=build /src/Erazer.Web/wwwroot ./wwwroot
COPY --from=build /src/Erazer.Web/*.js ./
COPY --from=build /src/Erazer.Web/middleware ./middleware


FROM base AS final
WORKDIR /app
USER node
COPY --from=publish /dist .
ENV host=10.0.75.1
ENV NODE_ENV=production
ENTRYPOINT ["node", "index.js"]
