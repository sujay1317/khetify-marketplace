FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Khetify.sln .
COPY src/Khetify.Domain/Khetify.Domain.csproj src/Khetify.Domain/
COPY src/Khetify.Application/Khetify.Application.csproj src/Khetify.Application/
COPY src/Khetify.Infrastructure/Khetify.Infrastructure.csproj src/Khetify.Infrastructure/
COPY src/Khetify.API/Khetify.API.csproj src/Khetify.API/
RUN dotnet restore

# Copy everything and build
COPY . .
RUN dotnet publish src/Khetify.API/Khetify.API.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Khetify.API.dll"]
