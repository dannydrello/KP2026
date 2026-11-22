import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

const s = {
  page: {
    background: '#FDF6E3',
    minHeight: '100vh',
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: '#1c1917',
  },
  main: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '56px 24px 80px',
  },
  tagline: {
    display: 'block',
    textAlign: 'center',
    fontSize: '10px',
    letterSpacing: '0.45em',
    textTransform: 'uppercase',
    color: '#78716c',
    marginBottom: '16px',
  },
  title: {
    textAlign: 'center',
    fontSize: '44px',
    fontWeight: 400,
    color: '#292524',
    letterSpacing: '0.04em',
    margin: 0,
    lineHeight: 1.2,
  },
  ornamentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    margin: '20px 0',
  },
  rule: {
    flex: '0 0 80px',
    height: '1px',
    background: '#a8a29e',
    border: 'none',
  },
  ornament: {
    color: '#78716c',
    fontSize: '16px',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#78716c',
    fontStyle: 'italic',
    marginBottom: '56px',
  },
  categoryWrap: {
    marginBottom: '40px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  categoryRule: {
    flex: 1,
    height: '1px',
    background: '#d6d3d1',
    border: 'none',
  },
  categoryLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    color: '#57534e',
    whiteSpace: 'nowrap',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginBottom: '14px',
  },
  itemName: {
    fontSize: '15px',
    color: '#1c1917',
    flexShrink: 0,
  },
  itemDesc: {
    fontSize: '11px',
    color: '#78716c',
    fontStyle: 'italic',
    flexShrink: 0,
  },
  dots: {
    flex: 1,
    borderBottom: '1px dotted #c8b89a',
    marginBottom: '3px',
    minWidth: '20px',
  },
  price: {
    fontSize: '13px',
    color: '#44403c',
    flexShrink: 0,
    fontWeight: 500,
  },
  footerDeco: {
    marginTop: '60px',
    textAlign: 'center',
  },
  footerRule: {
    flex: '0 0 48px',
    height: '1px',
    background: '#d6d3d1',
    border: 'none',
  },
  footerOrnament: {
    color: '#a8a29e',
    fontSize: '13px',
    letterSpacing: '0.4em',
  },
  thankYou: {
    marginTop: '20px',
    fontSize: '10px',
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    color: '#a8a29e',
  },
};

const formatPrice = (price) => `₦${Number(price).toLocaleString('en-NG')}`;

const MenuSecretPage = () => {
  const [cafeProducts, setCafeProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('section', 'cafe')
        .order('display_order');

      if (error) {
        console.error('Failed to load menu', error.message);
        return;
      }

      setCafeProducts((data || []).map((p) => ({ ...p, price: formatPrice(p.price) })));
    };

    loadProducts();
  }, []);

  const categories = cafeProducts.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const categoryKeys = Object.keys(categories).sort((a, b) => a.localeCompare(b));

  return (
    <div style={s.page}>
      <Helmet>
        <title>Kitchen Pastries — Cafe Menu</title>
      </Helmet>
      <Header />

      <main style={s.main}>
        <span style={s.tagline}>Est. Kitchen Pastries</span>
        <h1 style={s.title}>Café Menu</h1>

        <div style={s.ornamentRow}>
          <hr style={s.rule} />
          <span style={s.ornament}>✦</span>
          <hr style={s.rule} />
        </div>

        <p style={s.subtitle}>
          Freshly baked favourites, handcrafted treats &amp; comforting drinks
        </p>

        {categoryKeys.map((cat) => (
          <div key={cat} style={s.categoryWrap}>
            <div style={s.categoryHeader}>
              <hr style={s.categoryRule} />
              <span style={s.categoryLabel}>{cat}</span>
              <hr style={s.categoryRule} />
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {categories[cat].map((item) => (
                <li key={item.id} style={s.itemRow}>
                  <span style={s.itemName}>{item.name}</span>
                  {item.description && (
                    <span style={s.itemDesc}>— {item.description}</span>
                  )}
                  <span style={s.dots} />
                  {item.price && (
                    <span style={s.price}>{item.price}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={s.footerDeco}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <hr style={s.footerRule} />
            <span style={s.footerOrnament}>✦ ✦ ✦</span>
            <hr style={s.footerRule} />
          </div>
          <p style={s.thankYou}>Thank you for dining with us</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MenuSecretPage;
