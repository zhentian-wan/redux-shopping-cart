import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "../../app/store";
import * as productsSlice from "../products/productsSlice";
import { checkout, CartItems } from "../../app/api";

export enum CheckoutEnmus {
  LOADING = "LOADING",
  READY = "READY",
  ERROR = "ERROR",
}
type CheckoutState = keyof typeof CheckoutEnmus;

export interface CartState {
  items: { [producetID: string]: number };
  checkoutState: CheckoutState;
  errorMessage: string;
}

const initialState: CartState = {
  items: {},
  checkoutState: "READY",
  errorMessage: "",
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
    builder.addCase(checkoutCart.pending, (state) => {
      state.checkoutState = CheckoutEnmus.LOADING;
    });
    builder.addCase(
      checkoutCart.fulfilled,
      (state, action: PayloadAction<{ success: boolean }>) => {
        const { success } = action.payload;
        if (success) {
          state.checkoutState = CheckoutEnmus.READY;
          state.items = {};
        } else {
          state.checkoutState = CheckoutEnmus.ERROR;
        }
      }
    );
    // action for rejected promise has a payload of type Error
    builder.addCase(checkoutCart.rejected, (state, action) => {
      state.checkoutState = CheckoutEnmus.ERROR;
      state.errorMessage = action.error.message || "";
    });
  },
});

// Thunks
// export function checkout() {
//   return function checkoutThunk(dispatch: AppDispatch) {
//     dispatch({
//       type: "cart/checkout/pending",
//     });

//     setTimeout(() => {
//       dispatch({
//         type: "cart/checkout/fulfilled",
//       });
//     }, 3000);
//   };
// }

// export const checkoutCart = createAsyncThunk(
//   "cart/checkout",
//   async (items: CartItems) => {
//     const response = await checkout(items);
//     return response;
//   }
// );

export const checkoutCart = createAsyncThunk(
  "cart/checkout",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const items = state.cart.items;
    const response = await checkout(items);
    return response;
  }
);

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
export const getCartErrorMessage = createSelector(
  getCart,
  (cart) => cart.errorMessage
);

// middleware
export const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
  actionCreator: cartSlice.actions.addToCart,
  effect: async (action: PayloadAction<string>, listenerApi) => {
    console.log("Added cart item", JSON.stringify(action.payload));
    listenerApi.cancelActiveListeners();
    if (await listenerApi.condition(() => action.payload === "207")) {
      console.log("Detected item is 207");
      const task = listenerApi.fork(async (forkApi) => {
        await forkApi.delay(1000);
        return Math.random() > 0.5;
      });
      const result = await task.result;
      if (result.status === "ok") {
        // Logs the `42` result value that was returned
        console.log("Child succeeded: ", result.value);
        if (!result.value) {
          console.log("Remove item from cart");
          listenerApi.dispatch(
            cartSlice.actions.removeFromCart(action.payload)
          );
        }
      }
    }
  },
});

// Reducer
export default cartSlice.reducer;
