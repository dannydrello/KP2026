import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, LogOut, Ban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import OrdersPanel from './OrdersPanel.jsx';

const TABS = { orders: 'Orders', menu: 'Menu' };

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(undefined); // undefined = not checked yet, null = no session
  const [products, setProducts] = useState([]);
  const [editedPrices, setEditedPrices] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  // Supabase issues a new session object on every tab refocus; only react to the user changing.
  const userId = session === undefined ? undefined : session?.user.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      navigate('/admin/login');
      return;
    }
    loadProducts();
  }, [userId]);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('section')
      .order('display_order');

    if (error) {
      toast({ title: 'Failed to load products', description: error.message, variant: 'destructive' });
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const handlePriceChange = (id, value) => {
    setEditedPrices((prev) => ({ ...prev, [id]: value }));
  };

  const handleSavePrice = async (product) => {
    const newPrice = parseFloat(editedPrices[product.id]);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({ title: 'Invalid price', variant: 'destructive' });
      return;
    }

    setSavingId(product.id);
    const { error } = await supabase.from('products').update({ price: newPrice }).eq('id', product.id);
    setSavingId(null);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }

    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, price: newPrice } : p)));
    setEditedPrices((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    toast({ title: 'Price updated', description: `${product.name} is now ₦${newPrice.toLocaleString('en-NG')}` });
  };

  const handleToggleAvailability = async (product) => {
    setTogglingId(product.id);
    const nextActive = !product.active;
    const { error } = await supabase.from('products').update({ active: nextActive }).eq('id', product.id);
    setTogglingId(null);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }

    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: nextActive } : p)));
    toast({
      title: nextActive ? 'Back in stock' : 'Marked out of order',
      description: `${product.name} is now ${nextActive ? 'available' : 'unavailable'} on the menu.`,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (session === undefined || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = products.reduce((acc, p) => {
    acc[p.section_title] = acc[p.section_title] || [];
    acc[p.section_title].push(p);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Kitchen Pastries</title>
      </Helmet>
      <div className="min-h-screen bg-secondary/40">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            {Object.entries(TABS).map(([key, label]) => (
              <Button key={key} variant={activeTab === key ? 'default' : 'outline'} onClick={() => setActiveTab(key)}>
                {label}
              </Button>
            ))}
          </div>

          {activeTab === 'orders' && <OrdersPanel />}

          {activeTab === 'menu' && Object.entries(sections).map(([sectionTitle, items]) => (
            <div key={sectionTitle} className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">{sectionTitle}</h2>
              <div className="bg-background rounded-xl shadow-soft overflow-hidden">
                {items.map((product) => {
                  const isEdited = editedPrices[product.id] !== undefined;
                  const displayValue = isEdited ? editedPrices[product.id] : product.price;
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between gap-4 px-4 py-3 border-b border-border last:border-b-0 ${!product.active ? 'bg-destructive/5' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs capitalize">
                          <span className="text-muted-foreground">{product.category}</span>
                          {!product.active && <span className="text-destructive font-semibold"> · Out of Order</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground">₦</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={displayValue}
                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          disabled={!isEdited || savingId === product.id}
                          onClick={() => handleSavePrice(product)}
                          title="Save price"
                        >
                          {savingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={product.active ? 'outline' : 'default'}
                          disabled={togglingId === product.id}
                          onClick={() => handleToggleAvailability(product)}
                          title={product.active ? 'Mark out of order' : 'Mark back in stock'}
                        >
                          {togglingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : product.active ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
