FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY Erazer.IdentityProvider.csproj .
RUN dotnet restore Erazer.IdentityProvider.csproj
COPY . .
RUN dotnet build Erazer.IdentityProvider.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish Erazer.IdentityProvider.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
CMD ASPNETCORE_URLS=http://*:$PORT dotnet Erazer.IdentityProvider.dll
