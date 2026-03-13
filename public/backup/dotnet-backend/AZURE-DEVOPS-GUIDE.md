# Khetify - Azure DevOps Deployment Guide

## 📋 Prerequisites
- Azure DevOps account (https://dev.azure.com)
- Azure subscription with:
  - Azure App Service (Linux)
  - Azure Database for PostgreSQL Flexible Server
  - Azure Static Web Apps (for frontend)
- .NET 10 SDK installed locally
- Git installed

---

## 🚀 Step 1: Create Azure DevOps Project

1. Go to https://dev.azure.com
2. Click **New Project** → Name: `Khetify` → Visibility: Private → Create
3. Go to **Repos** → Initialize or push existing repo

---

## 🔗 Step 2: Push Code to Azure DevOps

```bash
# From the dotnet-backend folder
cd public/backup/dotnet-backend

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Khetify .NET 10 backend"

# Add Azure DevOps remote
git remote add origin https://dev.azure.com/{YOUR_ORG}/{YOUR_PROJECT}/_git/Khetify

# Push
git push -u origin main
```

### Push Frontend separately:
```bash
cd public/backup/frontend

git init
git add .
git commit -m "Initial commit - Khetify React frontend"

# Create a separate repo or use a monorepo subfolder
git remote add origin https://dev.azure.com/{YOUR_ORG}/{YOUR_PROJECT}/_git/Khetify-Frontend
git push -u origin main
```

---

## 🗄️ Step 3: Set Up Azure Database for PostgreSQL

1. **Azure Portal** → Create resource → Azure Database for PostgreSQL Flexible Server
2. Settings:
   - Server name: `khetify-db`
   - Version: PostgreSQL 16
   - Compute: Burstable B1ms (dev) or General Purpose D2s (prod)
   - Storage: 32 GB
3. Copy the connection string:
   ```
   Host=khetify-db.postgres.database.azure.com;Database=khetify;Username=khetifyadmin;Password={YOUR_PASSWORD};SSL Mode=Require;
   ```

---

## ⚙️ Step 4: Configure Pipeline Variables

Go to **Pipelines** → **Library** → **+ Variable Group** → Name: `khetify-secrets`

Add these variables (mark sensitive ones as secret 🔒):

| Variable | Value | Secret? |
|----------|-------|---------|
| `AZURE_SUBSCRIPTION` | Your Azure service connection name | No |
| `AZURE_WEBAPP_NAME` | `khetify-api` | No |
| `AZURE_SQL_CONNECTION_STRING` | PostgreSQL connection string | 🔒 Yes |
| `AZURE_SQL_CONNECTION_STRING_STAGING` | Staging DB connection string | 🔒 Yes |
| `JWT_SECRET_KEY` | Random 256-bit key | 🔒 Yes |
| `API_URL` | `https://khetify-api.azurewebsites.net/api` | No |
| `AZURE_STATIC_WEBAPP_TOKEN` | From Azure Static Web App | 🔒 Yes |

---

## 🏗️ Step 5: Create Azure App Service

```bash
# Create resource group
az group create --name khetify-rg --location centralindia

# Create App Service Plan (Linux)
az appservice plan create \
  --name khetify-plan \
  --resource-group khetify-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name khetify-api \
  --resource-group khetify-rg \
  --plan khetify-plan \
  --runtime "DOTNETCORE:10.0"

# Set environment variables
az webapp config appsettings set \
  --name khetify-api \
  --resource-group khetify-rg \
  --settings \
    ConnectionStrings__DefaultConnection="YOUR_PG_CONNECTION_STRING" \
    Jwt__Key="YOUR_JWT_SECRET" \
    Jwt__Issuer="khetify-api" \
    Jwt__Audience="khetify-app" \
    ASPNETCORE_ENVIRONMENT="Production"
```

---

## 🗃️ Step 6: Run Initial Database Migration

```bash
# Locally (one-time setup)
cd src/Khetify.API

# Set connection string
export ConnectionStrings__DefaultConnection="Host=khetify-db.postgres.database.azure.com;Database=khetify;Username=khetifyadmin;Password=YOUR_PASSWORD;SSL Mode=Require;"

# Install EF tools
dotnet tool install --global dotnet-ef

# Apply migration
dotnet ef database update \
  --project ../Khetify.Infrastructure/Khetify.Infrastructure.csproj \
  --startup-project .
```

This creates all 14 tables, triggers, functions, indexes, and seeds the admin user.

---

## 🌐 Step 7: Deploy Frontend to Azure Static Web Apps

```bash
# Create Static Web App
az staticwebapp create \
  --name khetify-frontend \
  --resource-group khetify-rg \
  --source "https://dev.azure.com/{ORG}/{PROJECT}/_git/Khetify-Frontend" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

---

## 📊 Step 8: Run the Pipeline

1. Go to **Pipelines** → **New Pipeline**
2. Select **Azure Repos Git** → Select your repo
3. Choose **Existing Azure Pipelines YAML file** → Select `/azure-pipelines.yml`
4. Click **Run**

---

## 🔄 Pipeline Flow

```
main branch push → Build Backend + Frontend → Deploy to Production
develop branch push → Build Backend + Frontend → Deploy to Staging
PR to main → Build & Test only (no deploy)
```

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

## 🔒 Default Admin Credentials

After migration, login with:
- **Email**: `admin@khetify.com`
- **Password**: `Admin@123`

⚠️ **Change this immediately in production!**

---

## 🧪 Test Endpoints

```bash
# Health check
curl https://khetify-api.azurewebsites.net/api/products

# Login
curl -X POST https://khetify-api.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@khetify.com","password":"Admin@123"}'
```
