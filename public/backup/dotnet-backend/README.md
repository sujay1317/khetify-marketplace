# Khetify .NET 10 Backend

## Complete backend implementation for the Khetify agricultural marketplace.

### Architecture
```
Khetify.sln
├── src/Khetify.Domain/         # Entities, Enums (no dependencies)
├── src/Khetify.Application/    # DTOs, Interfaces (depends on Domain)
├── src/Khetify.Infrastructure/ # DbContext, Services, JWT (depends on Domain + Application)
├── src/Khetify.API/            # Controllers, Program.cs (depends on all)
├── Dockerfile
└── docker-compose.yml
```

### Quick Start

```bash
# Option 1: Docker (recommended)
docker-compose up -d

# Option 2: Manual
cd src/Khetify.API
dotnet ef migrations add InitialCreate --project ../Khetify.Infrastructure
dotnet ef database update --project ../Khetify.Infrastructure
dotnet run
```

### API Endpoints (40+)

| Area | Endpoints |
|------|-----------|
| Auth | POST /api/auth/register, /login, /change-password, /reset-password, GET /me |
| Products | GET /api/products, /{id}, /seller/{id}, /my-products, /pending; POST, PUT, DELETE |
| Orders | POST /api/orders; GET /my-orders, /seller-orders, /all; PATCH /{id}/status |
| Users | GET/PUT /api/users/profile; GET /sellers; Admin: /admin/all, /create-seller, /delete |
| Reviews | GET /api/reviews/product/{id}; POST, PUT, DELETE |
| Wishlist | GET, POST, DELETE /api/wishlist |
| Coupons | GET /active, /validate; Admin: CRUD |
| Notifications | GET, PATCH /read, /read-all, DELETE |
| Forum | Posts CRUD, Comments CRUD, Likes toggle |
| Upload | POST /product-image, /shop-image |

### Configuration

Update `appsettings.json`:
- `ConnectionStrings:DefaultConnection` — PostgreSQL connection string
- `Jwt:Secret` — Minimum 32-character secret key
- `Cors:AllowedOrigins` — Frontend URLs

### Seed Admin User

After first run, insert admin manually:
```sql
-- Create user first via /api/auth/register, then:
UPDATE user_roles SET role = 'Admin' WHERE user_id = '<user-id>';
```

### Tech Stack
- .NET 10, EF Core, PostgreSQL 16
- JWT Authentication + BCrypt
- Clean Architecture (4 layers)
- Docker + docker-compose
