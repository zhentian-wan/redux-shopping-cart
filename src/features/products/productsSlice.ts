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

const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product.id,
});

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

const productsSelector = productsAdapter.getSelectors<RootState>(
  (state) => state.products
);
export const { selectAll } = productsSelector;
export const { receivedProducts } = productsSlice.actions;
export default productsSlice.reducer;
