FROM node:10-alpine AS base
WORKDIR /app
EXPOSE 8888

FROM node:10-alpine AS build
WORKDIR /src
# COPY Erazer.Web/ Erazer.Web/
COPY Erazer.Web .
WORKDIR /src/Erazer.Web
RUN npm run release
COPY wwwroot /dist
COPY node_modules /dist
COPY app.js /dist
COPY index.js /dist

FROM base AS final
WORKDIR /app
COPY --from=build /dist .
ENTRYPOINT ["node", "index.js"]
