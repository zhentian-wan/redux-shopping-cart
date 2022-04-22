import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "../../app/store";
import * as productsSlice from "../products/productsSlice";

export enum CheckoutEnmus {
  LOADING = "LOADING",
  READY = "READY",
  ERROR = "ERROR",
}
type CheckoutState = keyof typeof CheckoutEnmus;

export interface CartState {
  items: { [producetID: string]: number };
  checkoutState: CheckoutState;
}

const initialState: CartState = {
  items: {},
  checkoutState: "READY",
};

// Slices
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id]++;
      } else {
        state.items[id] = 1;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.items[id];
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity;
    },
  },
  extraReducers: function (builder) {
    builder.addCase("cart/checkout/pending", (state, action) => {
      state.checkoutState = CheckoutEnmus.LOADING;
    });
    builder.addCase("cart/checkout/fulfilled", (state, action) => {
      state.checkoutState = CheckoutEnmus.READY;
    });
  },
});

// Thunks
export function checkout() {
  return function checkoutThunk(dispatch: AppDispatch) {
    dispatch({
      type: "cart/checkout/pending",
    });

    setTimeout(() => {
      dispatch({
        type: "cart/checkout/fulfilled",
      });
    }, 3000);
  };
}

// Actions
export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;

// Selectors
export const getCart = (state: RootState) => state.cart;
export const getCartItems = createSelector(getCart, (cart) => cart.items);
export const getCartItemsIds = createSelector(getCartItems, (items) =>
  Object.keys(items)
);
export const getItemCounts = createSelector(getCartItems, (items) =>
  Object.values(items)
);
export const getNumItems = createSelector(getItemCounts, (counts) =>
  counts.reduce((acc, count) => acc + count, 0)
);
export const getTotalPrice = createSelector(
  getCartItems,
  productsSlice.selectEntities,
  (items, products) =>
    Object.keys(items)
      .reduce((total, id) => total + (products[id]?.price ?? 0) * items[id], 0)
      .toFixed(2)
);
export const getCheckoutState = createSelector(
  getCart,
  (cart) => cart.checkoutState
);

// Reducer
export default cartSlice.reducer;
