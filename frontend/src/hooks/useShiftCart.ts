import { useEffect, useState } from "react";
import { ParsedFixture } from "../types";
import { SHIFT_KEY } from "../config";

export function useShiftCart() {
  const [cartFixtures, setCartFixtures] = useState<ParsedFixture[]>(() => {
    const saved = localStorage.getItem(SHIFT_KEY);
    return saved ? JSON.parse(saved) : []; // Default to empty array
  });

  // 2. This "Watchdog" handles the disk writing automatically
  useEffect(() => {
    localStorage.setItem(SHIFT_KEY, JSON.stringify(cartFixtures));
  }, [cartFixtures]); // Runs every time cartFixtures changes

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

  function isInCart(fixtureId: string): boolean {
    return cartFixtures.some((f) => f.id === fixtureId);
  }

  function clearCart() {
    setCartFixtures([])
  }

  const shiftDate = cartFixtures[0]?.date ?? null

  return { cartFixtures, addToCart, removeFromCart, isInCart, clearCart, shiftDate };
}
