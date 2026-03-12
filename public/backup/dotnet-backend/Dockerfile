FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Khetify.API/Khetify.API.csproj", "Khetify.API/"]
COPY ["src/Khetify.Application/Khetify.Application.csproj", "Khetify.Application/"]
COPY ["src/Khetify.Domain/Khetify.Domain.csproj", "Khetify.Domain/"]
COPY ["src/Khetify.Infrastructure/Khetify.Infrastructure.csproj", "Khetify.Infrastructure/"]
RUN dotnet restore "Khetify.API/Khetify.API.csproj"
COPY src/ .
WORKDIR "/src/Khetify.API"
RUN dotnet build "Khetify.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Khetify.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Khetify.API.dll"]
