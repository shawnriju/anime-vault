# Stage 1 — Build
# Uses the full SDK image to compile the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies first
# Docker caches this layer — if .csproj hasn't changed, restore is skipped on rebuild
COPY AnimeVault.Catalog.csproj .
RUN dotnet restore

# Copy the rest of the source and publish a release build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2 — Runtime
# Uses only the lightweight runtime image — SDK tools are discarded
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# App Runner expects the container to listen on port 8080
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "AnimeVault.Catalog.dll"]