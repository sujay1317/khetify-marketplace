# Khetify - Azure DevOps Deployment Guide

## 🏗️ Your Azure Resources (Already Created)

| Resource | Name | Details |
|----------|------|---------|
| **PostgreSQL** | `khetify-db-server` | PostgreSQL 18, Burstable B2s, Central India |
| **App Service** | `khetify-api` | .NET 10, Linux, Basic SKU |
| **Resource Group** | `khetify-rg` | Central India |
| **DB Host** | `khetify-db-server.postgres.database.azure.com` | Password Auth + AD Auth |
| **API URL** | `https://khetify-api-dve2hrdcbubfemdn.centralindia-01.azurewebsites.net` | HTTPS enabled |

---

## 🚀 Step 1: Create Database on PostgreSQL Server

Your server is ready but you need to create the `khetify` database:

```bash
# Connect to the server using psql
psql "host=khetify-db-server.postgres.database.azure.com port=5432 dbname=postgres user=khetifyadmin sslmode=require"

# Create the database
CREATE DATABASE khetify;
\q
```

Or via Azure Portal: Go to **khetify-db-server** → **Databases** → **+ Add** → Name: `khetify`

---

## 🔗 Step 2: Set App Service Configuration

```bash
# Set environment variables on the App Service
az webapp config appsettings set \
  --name khetify-api \
  --resource-group khetify-rg \
  --settings \
    "ConnectionStrings__DefaultConnection=Host=khetify-db-server.postgres.database.azure.com;Port=5432;Database=khetify;Username=khetifyadmin;Password=YOUR_DB_PASSWORD;SSL Mode=Require;Trust Server Certificate=true" \
    "Jwt__Secret=GENERATE-A-STRONG-SECRET-KEY-MINIMUM-32-CHARACTERS" \
    "Jwt__Issuer=Khetify" \
    "Jwt__Audience=KhetifyApp" \
    "Cors__AllowedOrigins__0=http://localhost:5173" \
    "Cors__AllowedOrigins__1=https://khetify-api-dve2hrdcbubfemdn.centralindia-01.azurewebsites.net" \
    "ASPNETCORE_ENVIRONMENT=Production"
```

⚠️ Replace `YOUR_DB_PASSWORD` with the actual password you set for `khetifyadmin`.

---

## 🗃️ Step 3: Push Code to Azure DevOps

### Create Azure DevOps Project
1. Go to https://dev.azure.com
2. **New Project** → Name: `Khetify` → Private → Create

### Push Backend Code
```bash
cd public/backup/dotnet-backend

git init
git add .
git commit -m "Khetify .NET 10 backend"

# Add your Azure DevOps remote
git remote add origin https://dev.azure.com/{YOUR_ORG}/Khetify/_git/Khetify-Backend
git push -u origin main
```

### Push Frontend Code
```bash
cd public/backup/frontend

# Create .env for production
echo "VITE_API_URL=https://khetify-api-dve2hrdcbubfemdn.centralindia-01.azurewebsites.net/api" > .env

git init
git add .
git commit -m "Khetify React frontend"
git remote add origin https://dev.azure.com/{YOUR_ORG}/Khetify/_git/Khetify-Frontend
git push -u origin main
```

---

## ⚙️ Step 4: Configure Pipeline Variables

Go to **Pipelines** → **Library** → **+ Variable Group** → Name: `khetify-secrets`

| Variable | Value | Secret? |
|----------|-------|---------|
| `AZURE_SUBSCRIPTION` | Your Azure service connection name | No |
| `AZURE_WEBAPP_NAME` | `khetify-api` | No |
| `AZURE_SQL_CONNECTION_STRING` | `Host=khetify-db-server.postgres.database.azure.com;Port=5432;Database=khetify;Username=khetifyadmin;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true` | 🔒 Yes |
| `JWT_SECRET_KEY` | Your 32+ char secret | 🔒 Yes |

---

## 📊 Step 5: Create & Run Pipeline

1. Go to **Pipelines** → **New Pipeline**
2. Select **Azure Repos Git** → Select your backend repo
3. Choose **Existing Azure Pipelines YAML file** → Select `/azure-pipelines.yml`
4. Click **Run**

---

## 🔄 Step 6: Run EF Core Migration (First Time)

After the API deploys, run the migration to create all 15 tables:

```bash
# Locally with the Azure DB connection string
cd public/backup/dotnet-backend

export ConnectionStrings__DefaultConnection="Host=khetify-db-server.postgres.database.azure.com;Port=5432;Database=khetify;Username=khetifyadmin;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"

dotnet tool install --global dotnet-ef

dotnet ef database update \
  --project src/Khetify.Infrastructure/Khetify.Infrastructure.csproj \
  --startup-project src/Khetify.API/Khetify.API.csproj
```

This creates all tables, triggers, indexes, and seeds the admin user.

---

## ✅ Step 7: Verify Deployment

```bash
# Test the API
curl https://khetify-api-dve2hrdcbubfemdn.centralindia-01.azurewebsites.net/api/products

# Test login
curl -X POST https://khetify-api-dve2hrdcbubfemdn.centralindia-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@khetify.com","password":"Admin@123"}'
```

---

## 🔒 Default Admin Credentials

- **Email**: `admin@khetify.com`
- **Password**: `Admin@123`

⚠️ **Change this immediately in production!**

---

## 📁 Tables Created by Migration

| # | Table | Description |
|---|-------|-------------|
| 1 | `users` | Authentication & credentials |
| 2 | `profiles` | User profile details |
| 3 | `user_roles` | Role assignments (admin/seller/customer) |
| 4 | `products` | Product catalog |
| 5 | `product_images` | Product gallery images |
| 6 | `orders` | Customer orders |
| 7 | `order_items` | Order line items |
| 8 | `order_tracking` | Shipment tracking history |
| 9 | `reviews` | Product reviews & ratings |
| 10 | `wishlists` | User wishlists |
| 11 | `coupons` | Discount coupons |
| 12 | `notifications` | User notifications |
| 13 | `forum_posts` | Community forum posts |
| 14 | `forum_comments` | Forum replies |
| 15 | `forum_likes` | Post/comment likes |

---

## 🌐 Frontend Deployment (Azure Static Web Apps)

```bash
az staticwebapp create \
  --name khetify-frontend \
  --resource-group khetify-rg \
  --source "https://dev.azure.com/{ORG}/Khetify/_git/Khetify-Frontend" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

Once deployed, add the Static Web App URL to CORS in App Service:
```bash
az webapp config appsettings set \
  --name khetify-api \
  --resource-group khetify-rg \
  --settings "Cors__AllowedOrigins__2=https://YOUR-STATIC-WEBAPP-URL.azurestaticapps.net"
```
