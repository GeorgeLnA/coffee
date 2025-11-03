import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

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

type Client = {
  email: string;
  name: string | null;
  phone: string | null;
  orders: (Order & { items?: OrderItem[] })[];
  totalSpent: number;
  orderCount: number;
  averageDaysBetweenOrders: number | null;
  lastOrderDate: string | null;
  firstOrderDate: string | null;
};

export function OrdersManager() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedTab, setSelectedTab] = useState<string>("orders");
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>("");
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [deleteClientEmail, setDeleteClientEmail] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteOrder = async (orderId: number) => {
    setIsDeleting(true);
    try {
      // Delete order (order_items will be deleted via CASCADE)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) throw error;
      
      // If we're viewing a client and this was their last order, go back to clients list
      if (selectedClientEmail) {
        const remainingOrders = orders.filter(o => 
          o.customer_email?.toLowerCase() === selectedClientEmail && o.id !== orderId
        );
        if (remainingOrders.length === 0) {
          setSelectedClientEmail(null);
          setSelectedTab("clients");
        }
      }
      
      load();
      setDeleteOrderId(null);
    } catch (e: any) {
      alert('Помилка видалення замовлення: ' + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteClientOrders = async (email: string) => {
    setIsDeleting(true);
    try {
      // Delete all orders for this client (order_items will be deleted via CASCADE)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('customer_email', email);
      
      if (error) throw error;
      
      // Go back to clients list
      setSelectedClientEmail(null);
      setSelectedTab("clients");
      load();
      setDeleteClientEmail(null);
    } catch (e: any) {
      alert('Помилка видалення замовлень клієнта: ' + e.message);
    } finally {
      setIsDeleting(false);
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

  // Group orders by email to create clients
  const clients = useMemo(() => {
    const clientMap = new Map<string, Client>();

    orders.forEach(order => {
      if (!order.customer_email) return;

      const email = order.customer_email.toLowerCase();
      
      if (!clientMap.has(email)) {
        clientMap.set(email, {
          email: order.customer_email,
          name: order.customer_name,
          phone: order.customer_phone,
          orders: [],
          totalSpent: 0,
          orderCount: 0,
          averageDaysBetweenOrders: null,
          lastOrderDate: null,
          firstOrderDate: null,
        });
      }

      const client = clientMap.get(email)!;
      client.orders.push(order);
      client.totalSpent += order.total_price;
      client.orderCount++;
      
      // Update name/phone if current order has more complete info
      if (!client.name && order.customer_name) client.name = order.customer_name;
      if (!client.phone && order.customer_phone) client.phone = order.customer_phone;
    });

    // Calculate average days between orders for each client
    clientMap.forEach(client => {
      if (client.orders.length > 1) {
        // Sort orders by date
        const sortedOrders = [...client.orders].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        client.firstOrderDate = sortedOrders[0].created_at;
        client.lastOrderDate = sortedOrders[sortedOrders.length - 1].created_at;

        // Calculate average days between consecutive orders
        let totalDays = 0;
        for (let i = 1; i < sortedOrders.length; i++) {
          const daysDiff = differenceInDays(
            new Date(sortedOrders[i].created_at),
            new Date(sortedOrders[i - 1].created_at)
          );
          totalDays += daysDiff;
        }
        client.averageDaysBetweenOrders = Math.round(totalDays / (sortedOrders.length - 1));
      } else if (client.orders.length === 1) {
        client.firstOrderDate = client.orders[0].created_at;
        client.lastOrderDate = client.orders[0].created_at;
      }
    });

    return Array.from(clientMap.values());
  }, [orders]);

  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    if (clientSearchQuery) {
      const query = clientSearchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.email.toLowerCase().includes(query) ||
        c.name?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      );
    }

    // Sort by total spent descending by default
    filtered.sort((a, b) => b.totalSpent - a.totalSpent);

    return filtered;
  }, [clients, clientSearchQuery]);

  // Handle order click - navigate to client view
  const handleOrderClick = (order: Order & { items?: OrderItem[] }) => {
    if (order.customer_email) {
      const email = order.customer_email.toLowerCase();
      setSelectedClientEmail(email);
      setSelectedTab("clients");
    }
  };

  // Sync tab when selectedClientEmail changes
  useEffect(() => {
    if (selectedClientEmail) {
      setSelectedTab("clients");
    }
  }, [selectedClientEmail]);

  // Get selected client's orders
  const selectedClient = useMemo(() => {
    if (!selectedClientEmail) return null;
    return clients.find(c => c.email.toLowerCase() === selectedClientEmail);
  }, [clients, selectedClientEmail]);

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">
          {selectedTab === "orders" ? `Замовлення (${filteredAndSorted.length})` : `Клієнти (${filteredClients.length})`}
        </h2>
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="orders">Замовлення</TabsTrigger>
          <TabsTrigger value="clients">Клієнти</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
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
              <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOrderClick(order)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Замовлення #{order.id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)} onClick={(e) => e.stopPropagation()}>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteOrderId(order.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Search */}
          {!selectedClient && (
            <Card>
              <CardContent className="p-4">
                <Label>Пошук клієнтів</Label>
                <Input
                  placeholder="Email, ім'я, телефон..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {selectedClient ? (
            // Client Detail View
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{selectedClient.name || selectedClient.email}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteClientEmail(selectedClient.email);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Видалити всі замовлення
                      </Button>
                      <button
                        onClick={() => {
                          setSelectedClientEmail(null);
                          setClientSearchQuery("");
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Назад до списку
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2">Контактна інформація</h4>
                      <p className="text-sm"><strong>Email:</strong> {selectedClient.email}</p>
                      <p className="text-sm"><strong>Ім'я:</strong> {selectedClient.name || '—'}</p>
                      <p className="text-sm"><strong>Телефон:</strong> {selectedClient.phone || '—'}</p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Статистика</h4>
                      <p className="text-sm"><strong>Всього замовлень:</strong> {selectedClient.orderCount}</p>
                      <p className="text-sm"><strong>Всього витрачено:</strong> ₴{selectedClient.totalSpent.toFixed(2)}</p>
                      <p className="text-sm"><strong>Середній чек:</strong> ₴{(selectedClient.totalSpent / selectedClient.orderCount).toFixed(2)}</p>
                      {selectedClient.averageDaysBetweenOrders !== null && (
                        <p className="text-sm"><strong>Частота:</strong> ~{selectedClient.averageDaysBetweenOrders} днів між замовленнями</p>
                      )}
                      {selectedClient.firstOrderDate && (
                        <p className="text-sm"><strong>Перше замовлення:</strong> {format(new Date(selectedClient.firstOrderDate), 'dd.MM.yyyy')}</p>
                      )}
                      {selectedClient.lastOrderDate && (
                        <p className="text-sm"><strong>Останнє замовлення:</strong> {format(new Date(selectedClient.lastOrderDate), 'dd.MM.yyyy')}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-semibold mb-4">Всі замовлення клієнта ({selectedClient.orders.length})</h3>
                <div className="grid grid-cols-1 gap-6">
                  {selectedClient.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Замовлення #{order.id}</CardTitle>
                          <div className="flex items-center gap-2">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteOrderId(order.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                            <h4 className="font-bold mb-2">Адреса доставки</h4>
                            <p className="text-sm">{order.shipping_address || '—'}</p>
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
              </div>
            </div>
          ) : (
            // Clients List View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card 
                  key={client.email} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedClientEmail(client.email.toLowerCase())}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{client.name || client.email}</CardTitle>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Замовлень:</span>
                        <span className="text-sm font-bold">{client.orderCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Всього витрачено:</span>
                        <span className="text-sm font-bold">₴{client.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Середній чек:</span>
                        <span className="text-sm font-bold">₴{(client.totalSpent / client.orderCount).toFixed(2)}</span>
                      </div>
                      {client.averageDaysBetweenOrders !== null && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Частота:</span>
                          <span className="text-sm font-bold">~{client.averageDaysBetweenOrders} днів</span>
                        </div>
                      )}
                      {client.lastOrderDate && (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-sm text-gray-600">Останнє замовлення:</span>
                          <span className="text-sm">{format(new Date(client.lastOrderDate), 'dd.MM.yyyy')}</span>
                        </div>
                      )}
                      {client.phone && (
                        <p className="text-sm text-gray-500 mt-2">{client.phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!selectedClient && filteredClients.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                {clientSearchQuery ? "Не знайдено клієнтів за заданими фільтрами" : "Немає клієнтів"}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Order Confirmation Dialog */}
      <AlertDialog open={deleteOrderId !== null} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити замовлення?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити замовлення #{deleteOrderId}? Ця дія незворотна і також видалить всі товари в замовленні.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderId && deleteOrder(deleteOrderId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Видалення...' : 'Видалити'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Client Orders Confirmation Dialog */}
      <AlertDialog open={deleteClientEmail !== null} onOpenChange={(open) => !open && setDeleteClientEmail(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити всі замовлення клієнта?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити всі замовлення для клієнта {deleteClientEmail}? Ця дія незворотна і також видалить всі товари в цих замовленнях. Клієнт буде видалений зі списку після видалення всіх його замовлень.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientEmail && deleteClientOrders(deleteClientEmail)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Видалення...' : 'Видалити все'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

