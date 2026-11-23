import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (foodItem, quantity = 1, notes = '') => {
    setItems(prev => {
      const existing = prev.find(i => i.foodItem.id === foodItem.id);
      if (existing) {
        return prev.map(i =>
          i.foodItem.id === foodItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { foodItem, quantity, notes }];
    });
  };

  const removeFromCart = (foodItemId) => {
    setItems(prev => prev.filter(i => i.foodItem.id !== foodItemId));
  };

  const updateQuantity = (foodItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodItemId);
      return;
    }
    setItems(prev =>
      prev.map(i => i.foodItem.id === foodItemId ? { ...i, quantity } : i)
    );
  };

  const updateNotes = (foodItemId, notes) => {
    setItems(prev =>
      prev.map(i => i.foodItem.id === foodItemId ? { ...i, notes } : i)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (parseFloat(i.foodItem.price) * i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, updateNotes, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
