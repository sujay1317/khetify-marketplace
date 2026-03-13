using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Khetify.Infrastructure.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // ===== Enum =====
        migrationBuilder.Sql("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN CREATE TYPE app_role AS ENUM ('customer', 'seller', 'admin'); END IF; END $$;");

        // ===== Users =====
        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                password_hash = table.Column<string>(type: "text", nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table => table.PrimaryKey("pk_users", x => x.id));

        migrationBuilder.CreateIndex(name: "ix_users_email", table: "users", column: "email", unique: true);

        // ===== Profiles =====
        migrationBuilder.CreateTable(
            name: "profiles",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                full_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                avatar_url = table.Column<string>(type: "text", nullable: true),
                shop_image = table.Column<string>(type: "text", nullable: true),
                free_delivery = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_profiles", x => x.id);
                table.ForeignKey(name: "fk_profiles_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_profiles_user_id", table: "profiles", column: "user_id", unique: true);

        // ===== User Roles =====
        migrationBuilder.CreateTable(
            name: "user_roles",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                role = table.Column<string>(type: "text", nullable: false, defaultValue: "customer"),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_roles", x => x.id);
                table.ForeignKey(name: "fk_user_roles_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_user_roles_user_id_role", table: "user_roles", columns: new[] { "user_id", "role" }, unique: true);

        // ===== Products =====
        migrationBuilder.CreateTable(
            name: "products",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                seller_id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                name_hi = table.Column<string>(type: "text", nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                description_hi = table.Column<string>(type: "text", nullable: true),
                price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                original_price = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                category = table.Column<string>(type: "text", nullable: false),
                image = table.Column<string>(type: "text", nullable: true),
                unit = table.Column<string>(type: "text", nullable: false, defaultValue: "kg"),
                stock = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                is_organic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_approved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_products", x => x.id);
                table.ForeignKey(name: "fk_products_users_seller_id", column: x => x.seller_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_products_seller_id", table: "products", column: "seller_id");
        migrationBuilder.CreateIndex(name: "ix_products_category", table: "products", column: "category");
        migrationBuilder.CreateIndex(name: "ix_products_is_approved", table: "products", column: "is_approved");

        // ===== Product Images =====
        migrationBuilder.CreateTable(
            name: "product_images",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                product_id = table.Column<Guid>(type: "uuid", nullable: false),
                image_url = table.Column<string>(type: "text", nullable: false),
                display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_product_images", x => x.id);
                table.ForeignKey(name: "fk_product_images_products_product_id", column: x => x.product_id, principalTable: "products", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        // ===== Orders =====
        migrationBuilder.CreateTable(
            name: "orders",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                total = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                status = table.Column<string>(type: "text", nullable: false, defaultValue: "pending"),
                payment_method = table.Column<string>(type: "text", nullable: false, defaultValue: "cod"),
                shipping_address = table.Column<string>(type: "jsonb", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_orders", x => x.id);
                table.ForeignKey(name: "fk_orders_users_customer_id", column: x => x.customer_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_orders_customer_id", table: "orders", column: "customer_id");
        migrationBuilder.CreateIndex(name: "ix_orders_status", table: "orders", column: "status");

        // ===== Order Items =====
        migrationBuilder.CreateTable(
            name: "order_items",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                order_id = table.Column<Guid>(type: "uuid", nullable: false),
                product_id = table.Column<Guid>(type: "uuid", nullable: true),
                seller_id = table.Column<Guid>(type: "uuid", nullable: true),
                product_name = table.Column<string>(type: "text", nullable: false),
                quantity = table.Column<int>(type: "integer", nullable: false),
                price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_order_items", x => x.id);
                table.ForeignKey(name: "fk_order_items_orders_order_id", column: x => x.order_id, principalTable: "orders", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_order_items_products_product_id", column: x => x.product_id, principalTable: "products", principalColumn: "id", onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(name: "ix_order_items_seller_id", table: "order_items", column: "seller_id");

        // ===== Order Tracking =====
        migrationBuilder.CreateTable(
            name: "order_tracking",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                order_id = table.Column<Guid>(type: "uuid", nullable: false),
                status = table.Column<string>(type: "text", nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_order_tracking", x => x.id);
                table.ForeignKey(name: "fk_order_tracking_orders_order_id", column: x => x.order_id, principalTable: "orders", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        // ===== Reviews =====
        migrationBuilder.CreateTable(
            name: "reviews",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                product_id = table.Column<Guid>(type: "uuid", nullable: false),
                rating = table.Column<int>(type: "integer", nullable: false),
                comment = table.Column<string>(type: "text", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_reviews", x => x.id);
                table.ForeignKey(name: "fk_reviews_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_reviews_products_product_id", column: x => x.product_id, principalTable: "products", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_reviews_user_id_product_id", table: "reviews", columns: new[] { "user_id", "product_id" }, unique: true);

        // ===== Wishlists =====
        migrationBuilder.CreateTable(
            name: "wishlists",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                product_id = table.Column<Guid>(type: "uuid", nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wishlists", x => x.id);
                table.ForeignKey(name: "fk_wishlists_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_wishlists_products_product_id", column: x => x.product_id, principalTable: "products", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_wishlists_user_id_product_id", table: "wishlists", columns: new[] { "user_id", "product_id" }, unique: true);

        // ===== Coupons =====
        migrationBuilder.CreateTable(
            name: "coupons",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                code = table.Column<string>(type: "text", nullable: false),
                discount_type = table.Column<string>(type: "text", nullable: false, defaultValue: "percentage"),
                discount_value = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                min_order_amount = table.Column<decimal>(type: "numeric(10,2)", nullable: true, defaultValue: 0),
                max_uses = table.Column<int>(type: "integer", nullable: true),
                used_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                valid_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "now()"),
                valid_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table => table.PrimaryKey("pk_coupons", x => x.id));

        migrationBuilder.CreateIndex(name: "ix_coupons_code", table: "coupons", column: "code", unique: true);

        // ===== Notifications =====
        migrationBuilder.CreateTable(
            name: "notifications",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                title = table.Column<string>(type: "text", nullable: false),
                message = table.Column<string>(type: "text", nullable: false),
                type = table.Column<string>(type: "text", nullable: false, defaultValue: "info"),
                is_read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                order_id = table.Column<Guid>(type: "uuid", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_notifications", x => x.id);
                table.ForeignKey(name: "fk_notifications_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_notifications_orders_order_id", column: x => x.order_id, principalTable: "orders", principalColumn: "id", onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(name: "ix_notifications_user_id", table: "notifications", column: "user_id");

        // ===== Forum Posts =====
        migrationBuilder.CreateTable(
            name: "forum_posts",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                title = table.Column<string>(type: "text", nullable: false),
                content = table.Column<string>(type: "text", nullable: false),
                category = table.Column<string>(type: "text", nullable: false, defaultValue: "general"),
                likes_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                comments_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                is_pinned = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_forum_posts", x => x.id);
                table.ForeignKey(name: "fk_forum_posts_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_forum_posts_category", table: "forum_posts", column: "category");

        // ===== Forum Comments =====
        migrationBuilder.CreateTable(
            name: "forum_comments",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                post_id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                content = table.Column<string>(type: "text", nullable: false),
                likes_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_forum_comments", x => x.id);
                table.ForeignKey(name: "fk_forum_comments_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_forum_comments_forum_posts_post_id", column: x => x.post_id, principalTable: "forum_posts", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        // ===== Forum Likes =====
        migrationBuilder.CreateTable(
            name: "forum_likes",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                post_id = table.Column<Guid>(type: "uuid", nullable: true),
                comment_id = table.Column<Guid>(type: "uuid", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_forum_likes", x => x.id);
                table.ForeignKey(name: "fk_forum_likes_users_user_id", column: x => x.user_id, principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_forum_likes_forum_posts_post_id", column: x => x.post_id, principalTable: "forum_posts", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey(name: "fk_forum_likes_forum_comments_comment_id", column: x => x.comment_id, principalTable: "forum_comments", principalColumn: "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "ix_forum_likes_user_id_post_id", table: "forum_likes", columns: new[] { "user_id", "post_id" }, unique: true, filter: "post_id IS NOT NULL");
        migrationBuilder.CreateIndex(name: "ix_forum_likes_user_id_comment_id", table: "forum_likes", columns: new[] { "user_id", "comment_id" }, unique: true, filter: "comment_id IS NOT NULL");

        // ===== Trigger: updated_at auto-update =====
        migrationBuilder.Sql(@"
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            CREATE TRIGGER tr_forum_comments_updated_at BEFORE UPDATE ON forum_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ");

        // ===== Helper function: has_role =====
        migrationBuilder.Sql(@"
            CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role text)
            RETURNS boolean AS $$
                SELECT EXISTS (
                    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
                );
            $$ LANGUAGE sql STABLE;
        ");

        // ===== Seed admin user =====
        migrationBuilder.Sql(@"
            -- Create admin user (password: Admin@123 - BCrypt hash)
            INSERT INTO users (id, email, password_hash) VALUES 
                ('00000000-0000-0000-0000-000000000001', 'admin@khetify.com', '$2a$11$rICGcU1UqPx3L8n7O.X.0uTAOjF4YfDv1kQd5eMhKdGh.S/VvO4Iy')
            ON CONFLICT DO NOTHING;

            INSERT INTO profiles (user_id, full_name) VALUES 
                ('00000000-0000-0000-0000-000000000001', 'Khetify Admin')
            ON CONFLICT DO NOTHING;

            INSERT INTO user_roles (user_id, role) VALUES 
                ('00000000-0000-0000-0000-000000000001', 'admin')
            ON CONFLICT DO NOTHING;
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "forum_likes");
        migrationBuilder.DropTable(name: "forum_comments");
        migrationBuilder.DropTable(name: "forum_posts");
        migrationBuilder.DropTable(name: "notifications");
        migrationBuilder.DropTable(name: "wishlists");
        migrationBuilder.DropTable(name: "reviews");
        migrationBuilder.DropTable(name: "order_tracking");
        migrationBuilder.DropTable(name: "order_items");
        migrationBuilder.DropTable(name: "orders");
        migrationBuilder.DropTable(name: "coupons");
        migrationBuilder.DropTable(name: "product_images");
        migrationBuilder.DropTable(name: "products");
        migrationBuilder.DropTable(name: "user_roles");
        migrationBuilder.DropTable(name: "profiles");
        migrationBuilder.DropTable(name: "users");

        migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;");
        migrationBuilder.Sql("DROP FUNCTION IF EXISTS has_role CASCADE;");
        migrationBuilder.Sql("DROP TYPE IF EXISTS app_role;");
    }
}
