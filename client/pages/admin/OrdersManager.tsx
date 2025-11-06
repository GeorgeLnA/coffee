import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Trash2, Edit2, Check, X, Plus, XCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

type Order = {
  id: number;
  order_id: string | null; // Order number (e.g., "cm-1234567890-abc123")
  created_at: string;
  updated_at: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null; // Legacy field for backward compatibility
  shipping_city: string | null;
  shipping_city_ref: string | null;
  shipping_street_address: string | null;
  shipping_warehouse_ref: string | null;
  shipping_department: string | null;
  shipping_method: string | null;
  payment_method: string | null;
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
  variant: string | null; // Grind type, size, etc.
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

type PipelineColumn = {
  id: string;
  status: string;
  title: string;
  bgColor: string;
  badgeColor: string;
};

// Draggable Order Card Component
function DraggableOrderCard({
  order,
  onDelete,
  badgeText,
  badgeColor,
}: {
  order: Order & { items?: OrderItem[] };
  onDelete: (orderId: number) => void;
  badgeText: string;
  badgeColor: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: order.id.toString(),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const formatVariantDisplay = (variant: string | null): string => {
    if (!variant) return 'В зернах';
    const gramsMatch = variant.match(/(\d+g)/);
    const grams = gramsMatch ? gramsMatch[1] : '';
    const isBeans = variant.includes('В зернах') || variant.includes('beans') || variant.toLowerCase().includes('зерн');
    const isGround = variant.includes('Мелена') || variant.includes('ground') || variant.toLowerCase().includes('мелен');
    const grindType = isBeans ? 'В зернах' : isGround ? 'Мелена' : '';
    if (grams && grindType) {
      return `${grams} ${grindType}`;
    } else if (grams) {
      return grams;
    } else if (grindType) {
      return grindType;
    } else {
      return variant;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className={`mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">
                Замовлення #{order.id}
              </CardTitle>
              {order.order_id && (
                <p className="text-xs text-gray-600 mt-1 font-mono">
                  {order.order_id}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(order.id);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-red-600 hover:text-red-700 h-6 w-6 p-0 pointer-events-auto"
              style={{ touchAction: 'none' }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">
              {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {/* Customer Name */}
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <strong>Ім'я:</strong>
              <span className="flex-1">{order.customer_name || '—'}</span>
            </div>
          </div>

          {/* Customer Email */}
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <strong>Email:</strong>
              <span className="flex-1 text-xs">{order.customer_email || '—'}</span>
            </div>
          </div>

          {/* Customer Phone */}
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <strong>Телефон:</strong>
              <span className="flex-1 text-xs">{order.customer_phone || '—'}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="text-sm">
            <div className="flex items-start gap-2">
              <strong>Примітки:</strong>
              <span className="flex-1 text-xs">{order.notes || '—'}</span>
            </div>
          </div>

          {/* Items Summary */}
          {order.items && order.items.length > 0 && (
            <div className="text-xs pt-2 border-t">
              <strong>Товари:</strong>
              <div className="mt-1 space-y-1">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    {item.product_name} ({formatVariantDisplay(item.variant)}) ×{item.quantity}
                  </div>
                ))}
                {order.items.length > 3 && <div>+{order.items.length - 3} більше</div>}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="text-sm font-bold pt-2 border-t">
            Всього: ₴{order.total_price.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Pipeline Column Component
function PipelineColumn({
  title,
  status,
  orders,
  onDelete,
  bgColor,
  badgeColor,
  badgeText,
  isEditingTitle,
  editingTitleValue,
  onStartEditTitle,
  onSaveTitle,
  onCancelEditTitle,
  onTitleChange,
}: {
  title: string;
  status: string;
  orders: (Order & { items?: OrderItem[] })[];
  onDelete: (orderId: number) => void;
  bgColor: string;
  badgeColor: string;
  badgeText: string;
  isEditingTitle: boolean;
  editingTitleValue: string;
  onStartEditTitle: () => void;
  onSaveTitle: (newTitle: string) => void;
  onCancelEditTitle: () => void;
  onTitleChange: (value: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: status,
  });

  return (
    <div className={`${bgColor} rounded-lg p-4 flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-1">
            <Input
              value={editingTitleValue}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSaveTitle(editingTitleValue);
                } else if (e.key === 'Escape') {
                  onCancelEditTitle();
                }
              }}
              className="h-8 text-lg font-semibold"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSaveTitle(editingTitleValue)}
              className="h-8 w-8 p-0 text-green-600"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditTitle}
              className="h-8 w-8 p-0 text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEditTitle}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
        )}
        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
          {orders.length}
        </span>
      </div>
      <div className="mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex-1 overflow-y-auto min-h-[200px] ${isOver ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''}`}
      >
        {orders.length > 0 ? (
          orders.map((order) => (
            <DraggableOrderCard
              key={order.id}
              order={order}
              onDelete={onDelete}
              badgeText={badgeText}
              badgeColor={badgeColor}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-8 text-sm h-full flex items-center justify-center min-h-[200px]">
            Перетягніть замовлення сюди
          </div>
        )}
      </div>
    </div>
  );
}

export function OrdersManager() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedTab, setSelectedTab] = useState<string>("orders");
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>("");
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [deleteClientEmail, setDeleteClientEmail] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Default columns
  const defaultColumns: PipelineColumn[] = [
    { id: 'ordered', status: 'ordered', title: 'Замовлено', bgColor: 'bg-gray-50', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'processing', status: 'processing', title: 'Обробляється', bgColor: 'bg-yellow-50', badgeColor: 'bg-yellow-100 text-yellow-800' },
    { id: 'done', status: 'done', title: 'Виконано', bgColor: 'bg-green-50', badgeColor: 'bg-green-100 text-green-800' },
  ];

  // Column configuration state
  const [columns, setColumns] = useState<PipelineColumn[]>(defaultColumns);

  // Editing state for column titles
  const [editingColumnTitle, setEditingColumnTitle] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState<string>("");

  // State for adding new column
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnStatus, setNewColumnStatus] = useState("");
  const [newColumnBgColor, setNewColumnBgColor] = useState("bg-gray-50");
  const [newColumnBadgeColor, setNewColumnBadgeColor] = useState("bg-gray-100 text-gray-800");

  // Edit mode state for showing/hiding delete buttons
  const [isEditMode, setIsEditMode] = useState(false);

  // dnd-kit sensors for better drag behavior
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    })
  );

  // Load column configuration from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('pipeline_columns');
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setColumns(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved columns:', e);
      }
    }
  }, []);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pipeline_columns', JSON.stringify(columns));
  }, [columns]);

  // Helper function to format variant display (grams + grind type)
  const formatVariantDisplay = (variant: string | null): string => {
    if (!variant) return 'В зернах';
    
    // Extract grams (e.g., "250g", "500g")
    const gramsMatch = variant.match(/(\d+g)/);
    const grams = gramsMatch ? gramsMatch[1] : '';
    
    // Extract grind type
    const isBeans = variant.includes('В зернах') || variant.includes('beans') || variant.toLowerCase().includes('зерн');
    const isGround = variant.includes('Мелена') || variant.includes('ground') || variant.toLowerCase().includes('мелен');
    
    const grindType = isBeans ? 'В зернах' : isGround ? 'Мелена' : '';
    
    // Combine grams and grind type
    if (grams && grindType) {
      return `${grams} ${grindType}`;
    } else if (grams) {
      return grams;
    } else if (grindType) {
      return grindType;
    } else {
      return variant; // Fallback to full variant if parsing fails
    }
  };

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
      
      // Load items for each order with all fields including variant
      const ordersWithItems = await Promise.all(
        ordersList.map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('id, order_id, product_id, product_name, product_image, quantity, price, variant')
            .eq('order_id', order.id);
          if (itemsError) {
            console.error('Error loading order items:', itemsError);
          } else {
            // Debug: Log what we're getting from database
            console.log(`Order #${order.id} items:`, items?.map((it: any) => ({
              name: it.product_name,
              variant: it.variant,
              hasVariant: !!it.variant,
            })));
          }
          return { ...order, items: items || [] };
        })
      );
      
      // Debug: Log order data to verify what we're getting
      console.log('Loaded orders sample:', ordersWithItems.slice(0, 2).map((o: any) => ({
        id: o.id,
        order_id: o.order_id,
        shipping_department: o.shipping_department,
        shipping_method: o.shipping_method,
        payment_method: o.payment_method,
        itemsCount: o.items?.length,
        firstItemVariant: o.items?.[0]?.variant,
      })));
      
      setOrders(ordersWithItems);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const renumberOrders = async () => {
    if (!confirm('Ви впевнені, що хочете перенумерувати всі замовлення? Це оновить ID замовлень (Замовлення #1, #2, #3...). Ця операція незворотна!')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Call serverless function via API route (redirects to function)
      const response = await fetch('/api/orders/renumber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response has content before parsing
      const text = await response.text();
      let data;
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        throw new Error('Сервер повернув невалідну відповідь. Перевірте консоль для деталей.');
      }

      if (!response.ok) {
        // If 404, the function might not be deployed yet
        if (response.status === 404) {
          throw new Error('Функція перенумерації не знайдена. Будь ласка, переконайтеся, що функція розгорнута на Netlify.');
        }
        throw new Error(data.error || data.message || 'Помилка перенумерації');
      }

      alert(`Успішно перенумеровано ${data.count || 0} замовлень!`);
      await load(); // Reload orders
    } catch (e: any) {
      setError(`Помилка перенумерації: ${e.message}`);
      console.error('Renumber error:', e);
      alert(`Помилка: ${e.message}. Будь ласка, перезавантажте сторінку.`);
    }
    setLoading(false);
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

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state immediately
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
      ));
    } catch (e: any) {
      console.error('Error updating order status:', e);
      alert('Помилка оновлення статусу: ' + e.message);
      // Reload orders on error to ensure consistency
      load();
    }
  };

  // Helper function to get status label based on order status
  const getStatusLabel = (status: string | null): string => {
    const column = columns.find(col => {
      if (col.status === 'ordered' && (!status || status === 'ordered' || status === 'pending')) {
        return true;
      }
      return col.status === status;
    });
    return column?.title || status || '—';
  };

  // Handlers for editing column titles
  const handleStartEditTitle = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column) {
      setEditingColumnTitle(columnId);
      setEditingTitleValue(column.title);
    }
  };

  const handleSaveTitle = (columnId: string, newTitle: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
    setEditingColumnTitle(null);
    setEditingTitleValue("");
  };

  const handleCancelEditTitle = () => {
    setEditingColumnTitle(null);
    setEditingTitleValue("");
  };

  // Handler for adding new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim() || !newColumnStatus.trim()) {
      alert('Будь ласка, введіть назву та статус колонки');
      return;
    }
    
    // Check if status already exists
    if (columns.some(col => col.status === newColumnStatus)) {
      alert('Колонка з таким статусом вже існує');
      return;
    }

    const newColumn: PipelineColumn = {
      id: `column-${Date.now()}`,
      status: newColumnStatus,
      title: newColumnTitle,
      bgColor: newColumnBgColor,
      badgeColor: newColumnBadgeColor,
    };

    setColumns(prev => [...prev, newColumn]);
    setIsAddingColumn(false);
    setNewColumnTitle("");
    setNewColumnStatus("");
    setNewColumnBgColor("bg-gray-50");
    setNewColumnBadgeColor("bg-gray-100 text-gray-800");
  };

  // Handler for removing column
  const handleRemoveColumn = (columnId: string) => {
    if (columns.length <= 1) {
      alert('Не можна видалити останню колонку');
      return;
    }

    if (confirm('Ви впевнені, що хочете видалити цю колонку?')) {
      setColumns(prev => prev.filter(col => col.id !== columnId));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const orderId = parseInt(active.id as string);
    const targetStatus = over.id as string;
    
    // Check if target is a valid column
    const targetColumn = columns.find(col => col.status === targetStatus);
    if (!targetColumn) return;
    
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;
    
    // Check if status changed
    const currentStatus = currentOrder.status;
    const isOrderedColumn = targetStatus === 'ordered';
    const currentIsOrdered = !currentStatus || currentStatus === 'ordered' || currentStatus === 'pending';
    
    if (isOrderedColumn && !currentIsOrdered) {
      // Moving to ordered
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'ordered', updated_at: new Date().toISOString() } : o
      ));
      updateOrderStatus(orderId, 'ordered');
    } else if (!isOrderedColumn && currentStatus !== targetStatus) {
      // Moving to other status
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: targetStatus, updated_at: new Date().toISOString() } : o
      ));
      updateOrderStatus(orderId, targetStatus);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = [...orders];

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
  }, [orders, searchQuery, sortBy]);

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
        <div className="flex items-center gap-2">
          <button 
            onClick={renumberOrders} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            Перенумерувати
          </button>
          <button 
            onClick={load} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Оновити
          </button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="orders">Замовлення</TabsTrigger>
          <TabsTrigger value="pipeline">Пайплайн</TabsTrigger>
          <TabsTrigger value="clients">Клієнти</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Пошук</Label>
                  <Input
                    placeholder="ID, ім'я, email, телефон..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                    <div>
                      <CardTitle className="text-lg">
                        Замовлення #{order.id}
                      </CardTitle>
                      {order.order_id && (
                        <p className="text-sm text-gray-600 mt-1 font-mono">
                          Номер замовлення: <span className="font-semibold text-blue-600">{order.order_id}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-500">
                      {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
                    </span>
                    {order.status && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.status === 'ordered' || order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'done' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(order.status)}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2">Клієнт</h4>
                      <p className="text-sm"><strong>Ім'я:</strong> {order.customer_name || '—'}</p>
                      <p className="text-sm"><strong>Email:</strong> {order.customer_email || '—'}</p>
                      <p className="text-sm"><strong>Телефон:</strong> {order.customer_phone || '—'}</p>
                      <div className="text-sm mt-2">
                        <strong>Адреса доставки:</strong>
                        <div className="ml-4 mt-1 space-y-1">
                          {order.shipping_city && <p>Місто: {order.shipping_city}</p>}
                          {order.shipping_street_address && <p>Адреса: {order.shipping_street_address}</p>}
                          {order.shipping_method && (
                            <p>Спосіб: {
                              order.shipping_method === 'nova_department' ? 'Нова Пошта (Відділення)' :
                              order.shipping_method === 'nova_postomat' ? 'Нова Пошта (Поштомат)' :
                              order.shipping_method === 'nova_courier' ? 'Нова Пошта (Кур\'єр)' :
                              order.shipping_method === 'own_courier' ? 'Власний кур\'єр' :
                              order.shipping_method
                            }</p>
                          )}
                          {(order.shipping_department || order.shipping_warehouse_ref) && (
                            <>
                              {order.shipping_department ? (
                                <p><strong>Відділення:</strong> №{order.shipping_department}</p>
                              ) : (
                                order.shipping_method === 'nova_postomat' ? (
                                  <p><strong>Поштомат:</strong> {order.shipping_warehouse_ref}</p>
                                ) : (
                                  order.shipping_warehouse_ref && <p><strong>Warehouse Ref:</strong> {order.shipping_warehouse_ref}</p>
                                )
                              )}
                            </>
                          )}
                          {!order.shipping_city && !order.shipping_street_address && order.shipping_address && (
                            <p className="text-gray-500">{order.shipping_address}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mt-2">
                        <strong>Спосіб оплати:</strong> {
                          order.payment_method ? (
                            order.payment_method === 'liqpay' ? 'Онлайн оплата (LiqPay)' :
                            order.payment_method === 'apple_pay' ? 'Apple Pay' :
                            order.payment_method === 'google_pay' ? 'Google Pay' :
                            order.payment_method === 'cash' ? 'Готівка' :
                            order.payment_method
                          ) : '—'
                        }
                      </p>
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
                                <p className="text-xs font-semibold text-blue-600 mt-1">
                                  {formatVariantDisplay(item.variant)}
                                </p>
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
                {searchQuery ? "Не знайдено замовлень за заданими фільтрами" : "Немає замовлень"}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Пайплайн</h3>
              <p className="text-sm text-gray-600">Всього замовлень: {orders.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? "default" : "outline"}
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {isEditMode ? "Завершити редагування" : "Редагувати"}
              </Button>
              <Button
                onClick={() => setIsAddingColumn(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Додати колонку
              </Button>
            </div>
          </div>

          {isAddingColumn && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Додати нову колонку</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Назва колонки</Label>
                  <Input
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Наприклад: На перевірці"
                  />
                </div>
                <div>
                  <Label>Статус (унікальний ідентифікатор)</Label>
                  <Input
                    value={newColumnStatus}
                    onChange={(e) => setNewColumnStatus(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="Наприклад: review"
                  />
                  <p className="text-xs text-gray-500 mt-1">Буде використано для зберігання статусу замовлень</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Колір фону</Label>
                    <Select value={newColumnBgColor} onValueChange={setNewColumnBgColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bg-gray-50">Сірий</SelectItem>
                        <SelectItem value="bg-blue-50">Синій</SelectItem>
                        <SelectItem value="bg-yellow-50">Жовтий</SelectItem>
                        <SelectItem value="bg-green-50">Зелений</SelectItem>
                        <SelectItem value="bg-purple-50">Фіолетовий</SelectItem>
                        <SelectItem value="bg-pink-50">Рожевий</SelectItem>
                        <SelectItem value="bg-red-50">Червоний</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Колір бейджа</Label>
                    <Select value={newColumnBadgeColor} onValueChange={setNewColumnBadgeColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bg-gray-100 text-gray-800">Сірий</SelectItem>
                        <SelectItem value="bg-blue-100 text-blue-800">Синій</SelectItem>
                        <SelectItem value="bg-yellow-100 text-yellow-800">Жовтий</SelectItem>
                        <SelectItem value="bg-green-100 text-green-800">Зелений</SelectItem>
                        <SelectItem value="bg-purple-100 text-purple-800">Фіолетовий</SelectItem>
                        <SelectItem value="bg-pink-100 text-pink-800">Рожевий</SelectItem>
                        <SelectItem value="bg-red-100 text-red-800">Червоний</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddColumn}>
                    <Check className="w-4 h-4 mr-2" />
                    Додати
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnTitle("");
                    setNewColumnStatus("");
                    setNewColumnBgColor("bg-gray-50");
                    setNewColumnBadgeColor("bg-gray-100 text-gray-800");
                  }}>
                    <X className="w-4 h-4 mr-2" />
                    Скасувати
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={`grid gap-4 h-[calc(100vh-300px)]`} style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(250px, 1fr))` }}>
              {columns.map((column) => {
                const columnOrders = orders.filter(o => {
                  if (column.status === 'ordered') {
                    return !o.status || o.status === 'ordered' || o.status === 'pending';
                  }
                  return o.status === column.status;
                });

                return (
                  <div key={column.id} className="relative">
                    {isEditMode && columns.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveColumn(column.id)}
                        className="absolute -top-2 -right-2 z-10 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <PipelineColumn
                      title={column.title}
                      status={column.status}
                      orders={columnOrders}
                      onDelete={(orderId) => setDeleteOrderId(orderId)}
                      bgColor={column.bgColor}
                      badgeColor={column.badgeColor}
                      badgeText={column.title}
                      isEditingTitle={editingColumnTitle === column.id}
                      editingTitleValue={editingTitleValue}
                      onStartEditTitle={() => handleStartEditTitle(column.id)}
                      onSaveTitle={(newTitle) => handleSaveTitle(column.id, newTitle)}
                      onCancelEditTitle={handleCancelEditTitle}
                      onTitleChange={setEditingTitleValue}
                    />
                  </div>
                );
              })}
            </div>
            <DragOverlay>
              {activeId ? (() => {
                const draggedOrder = orders.find(o => o.id.toString() === activeId);
                return draggedOrder ? (
                  <Card className="w-64 shadow-2xl border-2 border-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Замовлення #{draggedOrder.id}</CardTitle>
                      {draggedOrder.customer_name && (
                        <p className="text-sm text-gray-600">{draggedOrder.customer_name}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-bold">₴{draggedOrder.total_price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-blue-500">
                    <p className="font-semibold">Замовлення #{activeId}</p>
                  </div>
                );
              })() : null}
            </DragOverlay>
          </DndContext>
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
                          <div>
                            <CardTitle className="text-lg">Замовлення #{order.id}</CardTitle>
                            {order.order_id && (
                              <p className="text-sm text-gray-600 mt-1 font-mono">
                                Номер замовлення: <span className="font-semibold text-blue-600">{order.order_id}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
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
                          <span className="text-sm text-gray-500">
                            {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold mb-2">Адреса доставки</h4>
                            <div className="text-sm space-y-1">
                              {order.shipping_city && <p>Місто: {order.shipping_city}</p>}
                              {order.shipping_street_address && <p>Адреса: {order.shipping_street_address}</p>}
                              {order.shipping_method && (
                                <p>Спосіб: {
                                  order.shipping_method === 'nova_department' ? 'Нова Пошта (Відділення)' :
                                  order.shipping_method === 'nova_postomat' ? 'Нова Пошта (Поштомат)' :
                                  order.shipping_method === 'nova_courier' ? 'Нова Пошта (Кур\'єр)' :
                                  order.shipping_method === 'own_courier' ? 'Власний кур\'єр' :
                                  order.shipping_method
                                }</p>
                              )}
                              {(order.shipping_department || order.shipping_warehouse_ref) && (
                                <>
                                  {order.shipping_department ? (
                                    <p><strong>Відділення:</strong> №{order.shipping_department}</p>
                                  ) : (
                                    order.shipping_method === 'nova_postomat' ? (
                                      <p><strong>Поштомат:</strong> {order.shipping_warehouse_ref}</p>
                                    ) : (
                                      order.shipping_warehouse_ref && <p><strong>Warehouse Ref:</strong> {order.shipping_warehouse_ref}</p>
                                    )
                                  )}
                                </>
                              )}
                              {!order.shipping_city && !order.shipping_street_address && order.shipping_address && (
                                <p className="text-gray-500">{order.shipping_address}</p>
                              )}
                              {!order.shipping_city && !order.shipping_street_address && !order.shipping_address && <p>—</p>}
                            </div>
                            <p className="text-sm mt-2">
                              <strong>Спосіб оплати:</strong> {
                                order.payment_method ? (
                                  order.payment_method === 'liqpay' ? 'Онлайн оплата (LiqPay)' :
                                  order.payment_method === 'apple_pay' ? 'Apple Pay' :
                                  order.payment_method === 'google_pay' ? 'Google Pay' :
                                  order.payment_method === 'cash' ? 'Готівка' :
                                  order.payment_method
                                ) : '—'
                              }
                            </p>
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
                                      <p className="text-xs font-semibold text-blue-600 mt-1">
                                        {formatVariantDisplay(item.variant)}
                                      </p>
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

