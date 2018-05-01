FROM microsoft/aspnetcore:2.0 AS base
WORKDIR /app
EXPOSE 5002

FROM microsoft/aspnetcore-build:2.0 AS build
WORKDIR /src
COPY Erazer.API.csproj .
RUN dotnet restore Erazer.API.csproj
COPY . .
RUN dotnet build Erazer.API.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish Erazer.API.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Erazer.API.dll"]
