import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  useEffect(() => { load(); }, []);

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
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
    const topRevenue = Object.entries(itemsByProduct)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return { totalOrders, totalRevenue, avgOrderValue, mostOrdered, topRevenue };
  }, [orders, items]);

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Аналітика</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Від</Label>
            <Input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label>До</Label>
            <Input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Замовлення</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{summary.totalOrders}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Виторг</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">₴{summary.totalRevenue.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Середній чек</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">₴{summary.avgOrderValue.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="most-ordered">
        <TabsList>
          <TabsTrigger value="most-ordered">Найчастіше замовляють</TabsTrigger>
          <TabsTrigger value="top-revenue">Найбільший виторг</TabsTrigger>
        </TabsList>

        <TabsContent value="most-ordered">
          <Card>
            <CardHeader><CardTitle>ТОП-10 за кількістю</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>ТОП-10 за виторгом</CardTitle></CardHeader>
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


