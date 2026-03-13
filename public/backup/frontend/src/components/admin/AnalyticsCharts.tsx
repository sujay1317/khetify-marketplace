import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Order {
  id: string;
  total: number;
  created_at: string;
  status: string | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number | null;
}

interface AnalyticsChartsProps {
  orders: Order[];
  products: Product[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ orders, products }) => {
  // Revenue over time (last 7 days)
  const revenueData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = orders.filter(o => o.created_at.split('T')[0] === date);
      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue,
        orders: dayOrders.length,
      };
    });
  }, [orders]);

  // Order status distribution
  const statusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      const status = o.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Category distribution
  const categoryData = React.useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  // Low stock products
  const lowStockProducts = React.useMemo(() => {
    return products
      .filter(p => (p.stock || 0) < 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5);
  }, [products]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Revenue Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Orders Chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Daily Orders (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Order Status Pie */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Order Status Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">No orders yet</p>
          )}
        </div>
      </Card>

      {/* Low Stock Alert */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-destructive">⚠️ Low Stock Alerts</h3>
        {lowStockProducts.length > 0 ? (
          <div className="space-y-3">
            {lowStockProducts.map(product => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <span className="font-medium">{product.name}</span>
                <span className={`font-bold ${(product.stock || 0) === 0 ? 'text-destructive' : 'text-yellow-600'}`}>
                  {product.stock || 0} left
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">All products are well stocked! ✓</p>
        )}
      </Card>

      {/* Top Categories */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-semibold mb-4">Products by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs capitalize" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
