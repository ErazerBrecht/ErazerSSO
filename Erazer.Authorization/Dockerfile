FROM microsoft/aspnetcore:2.0 AS base
WORKDIR /app
EXPOSE 5000

FROM microsoft/aspnetcore-build:2.0 AS build
WORKDIR /src
COPY Erazer.Authorization.csproj .
RUN dotnet restore Erazer.Authorization.csproj
COPY . .
RUN dotnet build Erazer.Authorization.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish Erazer.Authorization.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Erazer.Authorization.dll"]
