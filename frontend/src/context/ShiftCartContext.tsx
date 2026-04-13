import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParsedFixture } from '../types';
import { SHIFT_KEY } from '../config';
import { storage } from '../storage';

// 1. Define the shape of our context
interface ShiftCartContextType {
    cartFixtures: ParsedFixture[];
    addToCart: (fixture: ParsedFixture) => void;
    removeFromCart: (fixtureId: string) => void;
    isInCart: (fixtureId: string) => boolean;
    clearCart: () => void;
    shiftDate: string | null;
}

const ShiftCartContext = createContext<ShiftCartContextType | undefined>(undefined);

// 2. The Provider component
export function ShiftCartProvider({ children }: { children: React.ReactNode }) {
    const [cartFixtures, setCartFixtures] = useState<ParsedFixture[]>(() => {
        const saved = storage.get(SHIFT_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    // Keep localStorage in sync with our one source of truth
    useEffect(() => {
        storage.set(SHIFT_KEY, JSON.stringify(cartFixtures));
    }, [cartFixtures]);

    function addToCart(fixture: ParsedFixture) {
        if (isInCart(fixture.id)) return; // Prevent duplicates
        setCartFixtures((prev) => {
            const newCart = [...prev, fixture];
            return newCart;
        });
    }
    function removeFromCart(fixtureId: string) {
        setCartFixtures((prev) => {
            const newCart = prev.filter((f) => f.id !== fixtureId);
            return newCart;
        });
    }

    const isInCart = (fixtureId: string) => cartFixtures.some(f => f.id === fixtureId);

    const clearCart = () => setCartFixtures([]);

    const shiftDate = cartFixtures[0]?.date ?? null;

    return (
        <ShiftCartContext.Provider value={{ cartFixtures, addToCart, removeFromCart, isInCart, clearCart, shiftDate }}>
            {children}
        </ShiftCartContext.Provider>
    );
}

// 3. Easy-to-use hook for our components
export function useShiftCart() {
    const context = useContext(ShiftCartContext);
    if (!context) throw new Error("useShiftCart must be used within a ShiftCartProvider");
    return context;
}