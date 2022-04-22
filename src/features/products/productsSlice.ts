import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { Product } from "../../app/api";
import { RootState } from "../../app/store";

export interface ProductsState {
  products: { [id: string]: Product };
}
// Adapter
const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product.id,
});

// Slices
const productsSlice = createSlice({
  name: "products",
  initialState: productsAdapter.getInitialState(),
  reducers: {
    receivedProducts(state, action: PayloadAction<Product[]>) {
      const products = action.payload;
      productsAdapter.setAll(state, products);
    },
  },
});

// Selectors
const productsSelector = productsAdapter.getSelectors<RootState>(
  (state) => state.products
);
export const { selectAll, selectEntities } = productsSelector;

// Actions
export const { receivedProducts } = productsSlice.actions;

// Reducer
export default productsSlice.reducer;
