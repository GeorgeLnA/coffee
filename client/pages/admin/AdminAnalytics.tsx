import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, parseISO, eachDayOfInterval } from "date-fns";

// NOTE: This page assumes you will later add order and analytics tables/events.
// We compute metrics from available data and placeholders for traffic/events.

type Order = {
  id: number;
  created_at: string;
  total_price: number;
  currency: string | null;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | string;
  product_name: string;
  quantity: number;
  price: number;
};

export function AdminAnalytics() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to query orders table, but handle if it doesn't exist
      let q = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1000);
      if (dateFrom) q = q.gte('created_at', dateFrom);
      if (dateTo) q = q.lte('created_at', dateTo);
      const { data: oData, error: oErr } = await q;
      
      if (oErr) {
        // If table doesn't exist, just show empty state
        if (oErr.message && oErr.message.includes('could not find the table')) {
          console.log('Orders table not found - showing placeholder data');
          setOrders([]);
          setItems([]);
          setLoading(false);
          return;
        }
        throw oErr;
      }
      
      setOrders((oData as any) || []);

      const orderIds = ((oData as any[]) || []).map(o => o.id);
      if (orderIds.length) {
        const { data: iData, error: iErr } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        
        if (iErr) {
          // If order_items table doesn't exist, just continue with empty items
          if (iErr.message && iErr.message.includes('could not find the table')) {
            console.log('Order items table not found - showing placeholder data');
          } else {
            throw iErr;
          }
        }
        
        setItems((iData as any) || []);
      } else {
        setItems([]);
      }
    } catch (e: any) {
      setError(e.message);
      setOrders([]);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [dateFrom, dateTo]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const itemsByProduct: Record<string, { name: string; qty: number; revenue: number; }> = {};
    for (const it of items) {
      const key = String(it.product_id);
      if (!itemsByProduct[key]) itemsByProduct[key] = { name: it.product_name, qty: 0, revenue: 0 };
      itemsByProduct[key].qty += it.quantity || 0;
      itemsByProduct[key].revenue += (it.quantity || 0) * (it.price || 0);
    }
    const mostOrdered = Object.entries(itemsByProduct)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty);
    const topRevenue = Object.entries(itemsByProduct)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    return { totalOrders, totalRevenue, avgOrderValue, mostOrdered, topRevenue };
  }, [orders, items]);

  // Filter items by selected product
  const filteredItems = useMemo(() => {
    if (selectedProduct === "all") return items;
    return items.filter(item => String(item.product_id) === selectedProduct);
  }, [items, selectedProduct]);

  // Get unique products for filter dropdown
  const uniqueProducts = useMemo(() => {
    const productsMap = new Map<string, string>();
    items.forEach(item => {
      const id = String(item.product_id);
      if (!productsMap.has(id)) {
        productsMap.set(id, item.product_name);
      }
    });
    return Array.from(productsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  // Prepare sales over time chart data (filtered by product if selected)
  const salesOverTimeData = useMemo(() => {
    if (orders.length === 0) return [];

    // Get date range
    const orderDates = orders
      .map(o => new Date(o.created_at))
      .filter(d => !isNaN(d.getTime()));
    
    if (orderDates.length === 0) return [];

    const minDate = new Date(Math.min(...orderDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...orderDates.map(d => d.getTime())));
    
    // Create date range
    const dates = eachDayOfInterval({ start: minDate, end: maxDate });
    
    // Group sales by date
    const salesByDate = new Map<string, { revenue: number; orders: number }>();
    
    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      salesByDate.set(dateStr, { revenue: 0, orders: 0 });
    });

    // Calculate revenue and orders per day
    if (selectedProduct === "all") {
      // Use full order totals
      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dateStr = format(orderDate, 'yyyy-MM-dd');
        const existing = salesByDate.get(dateStr) || { revenue: 0, orders: 0 };
        existing.revenue += order.total_price || 0;
        existing.orders += 1;
        salesByDate.set(dateStr, existing);
      });
    } else {
      // Calculate revenue only from selected product items
      const itemsByDate = new Map<string, { revenue: number; orderIds: Set<number> }>();
      
      filteredItems.forEach(item => {
        const order = orders.find(o => o.id === item.order_id);
        if (!order) return;
        
        const orderDate = new Date(order.created_at);
        const dateStr = format(orderDate, 'yyyy-MM-dd');
        
        if (!itemsByDate.has(dateStr)) {
          itemsByDate.set(dateStr, { revenue: 0, orderIds: new Set() });
        }
        
        const dayData = itemsByDate.get(dateStr)!;
        dayData.revenue += (item.quantity || 0) * (item.price || 0);
        dayData.orderIds.add(order.id);
      });

      // Merge into salesByDate
      itemsByDate.forEach((data, dateStr) => {
        const existing = salesByDate.get(dateStr) || { revenue: 0, orders: 0 };
        existing.revenue += data.revenue;
        existing.orders = data.orderIds.size;
        salesByDate.set(dateStr, existing);
      });
    }

    return Array.from(salesByDate.entries())
      .map(([date, data]) => ({
        date: format(parseISO(date), 'dd.MM'),
        fullDate: date,
        revenue: Number(data.revenue.toFixed(2)),
        orders: data.orders,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [orders, selectedProduct, filteredItems]);

  // Prepare product sales chart data
  const productSalesData = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredItems.forEach(item => {
      const key = String(item.product_id);
      if (!productMap.has(key)) {
        productMap.set(key, { name: item.product_name, quantity: 0, revenue: 0 });
      }
      const product = productMap.get(key)!;
      product.quantity += item.quantity || 0;
      product.revenue += (item.quantity || 0) * (item.price || 0);
    });

    return Array.from(productMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name.length > 20 ? data.name.substring(0, 20) + '...' : data.name,
        fullName: data.name,
        quantity: data.quantity,
        revenue: Number(data.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue); // All products
  }, [filteredItems]);

  // Chart configuration
  const salesChartConfig = {
    revenue: {
      label: "Виторг",
      color: "#361c0c",
    },
    orders: {
      label: "Замовлення",
      color: "#f59e0b",
    },
  };

  const productChartConfig = {
    revenue: {
      label: "Виторг",
      color: "#361c0c",
    },
    quantity: {
      label: "Кількість",
      color: "#3b82f6",
    },
  };

  // Custom Tooltip Component for better formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border-2 border-gray-200 shadow-2xl rounded-xl px-5 py-4 min-w-[200px]">
        {label && (
          <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
            {label}
          </div>
        )}
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => {
            const value = entry.value;
            const dataKey = entry.dataKey || entry.name;
            let formattedValue = '';
            let displayLabel = '';

            if (dataKey === 'revenue') {
              formattedValue = `₴ ${Number(value).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              displayLabel = 'Виторг';
            } else if (dataKey === 'orders') {
              formattedValue = `${value} шт.`;
              displayLabel = 'Замовлення';
            } else if (dataKey === 'quantity') {
              formattedValue = `${value} од.`;
              displayLabel = 'Кількість';
            } else {
              formattedValue = String(value);
              displayLabel = entry.name || dataKey || 'Значення';
            }

            return (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: entry.color || entry.fill || '#361c0c' }}
                  />
                  <span className="text-sm text-gray-600 font-medium">{displayLabel}:</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono tabular-nums whitespace-nowrap">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Memoized formatters for better performance
  const revenueFormatter = useCallback((value: any) => {
    return `₴ ${Number(value).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const ordersFormatter = useCallback((value: any) => {
    return `${value} шт.`;
  }, []);

  const quantityFormatter = useCallback((value: any) => {
    return `${value} од.`;
  }, []);

  // Simple tooltip formatter for line chart
  const lineChartTooltipFormatter = useCallback((value: any, name: string) => {
    if (name === "revenue") return [revenueFormatter(value), "Виторг"];
    if (name === "orders") return [ordersFormatter(value), "Замовлення"];
    return [value, name];
  }, [revenueFormatter, ordersFormatter]);

  // Simple tooltip formatter for bar charts
  const revenueBarTooltipFormatter = useCallback((value: any, name: string, props: any) => {
    return [revenueFormatter(value), props.payload.fullName || props.payload.name];
  }, [revenueFormatter]);

  const quantityBarTooltipFormatter = useCallback((value: any, name: string, props: any) => {
    return [quantityFormatter(value), props.payload.fullName || props.payload.name];
  }, [quantityFormatter]);

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Аналітика</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Від</Label>
            <Input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label>До</Label>
            <Input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <Label>Продукт</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі продукти</SelectItem>
                {uniqueProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-600">Замовлення</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="text-5xl font-black mb-4 leading-tight" style={{ color: '#361c0c' }}>
              {summary.totalOrders.toLocaleString('uk-UA')}
            </div>
            <p className="text-sm text-gray-500 mt-4">всього замовлень</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-600">Виторг</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="text-5xl font-black mb-4 leading-tight flex items-baseline" style={{ color: '#361c0c' }}>
              <span className="text-4xl font-black mr-2">₴</span>
              <span>{summary.totalRevenue.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">загальний дохід</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-lg font-semibold text-gray-600">Середній чек</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="text-5xl font-black mb-4 leading-tight flex items-baseline" style={{ color: '#361c0c' }}>
              <span className="text-4xl font-black mr-2">₴</span>
              <span>{summary.avgOrderValue.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">на замовлення</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Over Time Chart */}
      {salesOverTimeData.length > 0 && (
        <Card className="border-2 border-gray-100 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold mb-2">Продажі за період</CardTitle>
                <p className="text-sm text-gray-500">
                  Динаміка продажів • Коричнева лінія — виторг (₴) • Помаранчева лінія — кількість замовлень
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-8 px-8">
            <ChartContainer config={salesChartConfig} className="h-[550px] w-full">
              <LineChart 
                data={salesOverTimeData} 
                margin={{ top: 30, right: 50, left: 90, bottom: 110 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#361c0c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#361c0c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0" 
                  vertical={false}
                  strokeWidth={1}
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 13, fill: '#666' }}
                  angle={-35}
                  textAnchor="end"
                  height={110}
                  stroke="#999"
                  tickLine={{ stroke: '#999' }}
                />
                <YAxis 
                  yAxisId="revenue"
                  tick={{ fontSize: 13, fill: '#666' }}
                  tickFormatter={(value) => `₴${Number(value).toLocaleString('uk-UA')}`}
                  stroke="#999"
                  tickLine={{ stroke: '#999' }}
                  width={90}
                />
                <YAxis 
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 13, fill: '#666' }}
                  stroke="#999"
                  tickLine={{ stroke: '#999' }}
                  width={90}
                />
                <ChartTooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#361c0c', strokeWidth: 1, strokeDasharray: '3 3' }}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <ChartLegend 
                  content={<ChartLegendContent className="pt-4" />} 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#361c0c" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#361c0c", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, fill: "#361c0c", strokeWidth: 3, stroke: "#fff" }}
                  name="Виторг"
                  animationDuration={300}
                  isAnimationActive={true}
                />
                <Line 
                  yAxisId="orders"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#f59e0b" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, fill: "#f59e0b", strokeWidth: 3, stroke: "#fff" }}
                  name="Замовлення"
                  animationDuration={300}
                  isAnimationActive={true}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Product Sales Charts */}
      {productSalesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-gray-100 shadow-lg flex flex-col h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold mb-2">ТОП продуктів за виторгом</CardTitle>
              <p className="text-sm text-gray-500">
                Найбільший дохід від продажу • Висота стовпця = сума виторгу
              </p>
            </CardHeader>
            <CardContent className="pt-2 pb-8 px-6 flex-1 flex flex-col">
              <ChartContainer config={productChartConfig} className="flex-1 w-full min-h-[500px]">
                <BarChart 
                  data={productSalesData} 
                  margin={{ top: 20, right: 20, left: 60, bottom: 100 }}
                  width={undefined}
                  height={undefined}
                >
                  <defs>
                    <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#361c0c" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4a2817" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f0f0f0" 
                    vertical={false}
                    strokeWidth={1}
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#666' }}
                    angle={-35}
                    textAnchor="end"
                    height={130}
                    stroke="#999"
                    tickLine={{ stroke: '#999' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: '#666' }}
                    tickFormatter={(value) => `₴${Number(value).toLocaleString('uk-UA')}`}
                    stroke="#999"
                    tickLine={{ stroke: '#999' }}
                    width={85}
                  />
                  <ChartTooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(54, 28, 12, 0.1)' }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#revenueBarGradient)"
                    radius={[6, 6, 0, 0]}
                    name="Виторг"
                    animationDuration={200}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100 shadow-lg flex flex-col h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold mb-2">ТОП продуктів за кількістю</CardTitle>
              <p className="text-sm text-gray-500">
                Найпопулярніші товари • Висота стовпця = кількість проданих одиниць
              </p>
            </CardHeader>
            <CardContent className="pt-2 pb-8 px-6 flex-1 flex flex-col">
              <ChartContainer config={productChartConfig} className="flex-1 w-full min-h-[500px]">
                <BarChart 
                  data={productSalesData} 
                  margin={{ top: 20, right: 20, left: 60, bottom: 100 }}
                  width={undefined}
                  height={undefined}
                >
                  <defs>
                    <linearGradient id="quantityBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f0f0f0" 
                    vertical={false}
                    strokeWidth={1}
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#666' }}
                    angle={-35}
                    textAnchor="end"
                    height={130}
                    stroke="#999"
                    tickLine={{ stroke: '#999' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: '#666' }}
                    stroke="#999"
                    tickLine={{ stroke: '#999' }}
                    width={85}
                  />
                  <ChartTooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill="url(#quantityBarGradient)"
                    radius={[6, 6, 0, 0]}
                    name="Кількість"
                    animationDuration={200}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="most-ordered">
        <TabsList>
          <TabsTrigger value="most-ordered">Найчастіше замовляють</TabsTrigger>
          <TabsTrigger value="top-revenue">Найбільший виторг</TabsTrigger>
        </TabsList>

        <TabsContent value="most-ordered">
          <Card>
            <CardHeader><CardTitle>ТОП за кількістю</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {summary.mostOrdered.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    <span className="tabular-nums">×{p.qty}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-revenue">
          <Card>
            <CardHeader><CardTitle>ТОП за виторгом</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {summary.topRevenue.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    <span className="tabular-nums">₴{p.revenue.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


