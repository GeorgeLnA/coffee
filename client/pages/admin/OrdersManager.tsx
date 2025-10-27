import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

type Order = {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  total_price: number;
  currency: string | null;
  notes: string | null;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
};

export function OrdersManager() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: oData, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (oErr) throw oErr;
      
      const ordersList = (oData || []) as Order[];
      
      // Load items for each order
      const ordersWithItems = await Promise.all(
        ordersList.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          return { ...order, items: items || [] };
        })
      );
      
      setOrders(ordersWithItems);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      load();
    } catch (e: any) {
      alert('Помилка оновлення статусу: ' + e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Виконано';
      case 'processing': return 'В обробці';
      case 'pending': return 'Очікує';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.customer_name?.toLowerCase().includes(query) ||
        o.customer_email?.toLowerCase().includes(query) ||
        o.customer_phone?.toLowerCase().includes(query) ||
        String(o.id).includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'total_desc': return b.total_price - a.total_price;
        case 'total_asc': return a.total_price - b.total_price;
        default: return 0;
      }
    });

    return filtered;
  }, [orders, statusFilter, searchQuery, sortBy]);

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Замовлення ({filteredAndSorted.length})</h2>
        <button 
          onClick={load} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Оновити
        </button>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Пошук</Label>
              <Input
                placeholder="ID, ім'я, email, телефон..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі</SelectItem>
                  <SelectItem value="pending">Очікує</SelectItem>
                  <SelectItem value="processing">В обробці</SelectItem>
                  <SelectItem value="completed">Виконано</SelectItem>
                  <SelectItem value="cancelled">Скасовано</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Сортування</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Найновіші</SelectItem>
                  <SelectItem value="oldest">Найстаріші</SelectItem>
                  <SelectItem value="total_desc">За суммою (↓)</SelectItem>
                  <SelectItem value="total_asc">За суммою (↑)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {filteredAndSorted.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Замовлення #{order.id}
                </CardTitle>
                <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                  <SelectTrigger className={`w-40 ${getStatusColor(order.status)} text-white border-0`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Очікує</SelectItem>
                    <SelectItem value="processing">В обробці</SelectItem>
                    <SelectItem value="completed">Виконано</SelectItem>
                    <SelectItem value="cancelled">Скасовано</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-2">Клієнт</h4>
                  <p className="text-sm"><strong>Ім'я:</strong> {order.customer_name || '—'}</p>
                  <p className="text-sm"><strong>Email:</strong> {order.customer_email || '—'}</p>
                  <p className="text-sm"><strong>Телефон:</strong> {order.customer_phone || '—'}</p>
                  <p className="text-sm mt-2"><strong>Адреса:</strong> {order.shipping_address || '—'}</p>
                  {order.notes && (
                    <p className="text-sm mt-2"><strong>Примітки:</strong> {order.notes}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-bold mb-2">Товари</h4>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-gray-500">×{item.quantity} • ₴{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Немає товарів</p>
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-lg font-bold">
                      Всього: ₴{order.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== "all" ? "Не знайдено замовлень за заданими фільтрами" : "Немає замовлень"}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

