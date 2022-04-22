### Config store

`app/store.ts`

```ts
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({ reducer: {} });
```

`main.tsx`

```diff
import React from "react";
import ReactDOM from "react-dom";
+ import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
+ import { store } from "./app/store";

ReactDOM.render(
  <React.StrictMode>
+    <Provider store={store}>
      <App />
+    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
```

### Slices

`Slice` is a concept that each slice needs to own the shape of its part of the data and is generally responsible for owning any reducers, selectors or thunks that primarily access or maniulate that information.

`app/features/cart/cartSlice.ts`

```tsx
import { createSlice } from "@reduxjs/toolkit";

export interface CartState {
  items: { [producetID: string]: number };
}

const initialState: CartState = {
  items: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
});

export default cartSlice.reducer;
```

`app/features/products/productsSlice.ts`

```ts
import { createSlice } from "@reduxjs/toolkit";
import { Product } from "../../app/api";

export interface ProductsState {
  products: { [id: string]: Product };
}

const initialState: ProductsState = {
  products: {},
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
});

export default productsSlice.reducer;
```

`app/store.ts`

```diff
import { configureStore } from "@reduxjs/toolkit";
+ import cartReducer from "../features/cart/cartSlice";
+ import productsReducer from "../features/products/productsSlice";

export const store = configureStore({
  reducer: {
+    cart: cartReducer,
+    products: productsReducer,
  },
});
```

### Type-aware hooks

`app/store.ts`

```diff
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/cartSlice";
import productsReducer from "../features/products/productsSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
  },
});

+ export type RootState = ReturnType<typeof store.getState>;
+ export type AppDispatch = typeof store.dispatch;
```

`app/hooks.ts`

```ts
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

update to use `useAppSelector` in `app/features/products/Products.tsx`

```diff
- import React, { useEffect, useState } from "react";
- import { getProducts, Product } from "../../app/api";
+ import React from "react";
import styles from "./Products.module.css";
+ import { useAppSelector } from "../../app/hooks";

export function Products() {
+  const products = useAppSelector((state) => state.products.products);
-  const [products, setProducts] = useState<Product[]>([]);
-  useEffect(() => {
-    getProducts().then((products) => {
-      setProducts(products);
-    });
-  }, []);
  return (
    <main className="page">
      <ul className={styles.products}>
-        {products.map((product) => (
+        {Object.values(products).map((product) => (
          <li key={product.id}>
            <article className={styles.product}>
              <figure>
                <img src={product.imageURL} alt={product.imageAlt} />
                <figcaption className={styles.caption}>
                  {product.imageCredit}
                </figcaption>
              </figure>
              <div>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p>${product.price}</p>
                <button>Add to Cart 🛒</button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### First reducer method

`app/features/products/productsSlice.ts`

```diff
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../app/api";

export interface ProductsState {
  products: { [id: string]: Product };
}

const initialState: ProductsState = {
  products: {},
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
+    receivedProducts(state, action: PayloadAction<Product[]>) {
+      const products = action.payload;
+      products.forEach((product) => {
+        state.products[product.id] = product;
+      });
+    },
  },
});

+ export const { receivedProducts } = productsSlice.actions;
export default productsSlice.reducer;
```

`app/feature/Products.tsx`

```diff
export function Products() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    getProducts().then((products) => {
+      dispatch(receivedProducts(products));
    });
  });

  ...
```

### Using Adapter

[Entity adapter docs](https://redux-toolkit.js.org/api/createEntityAdapter#crud-functions)

```diff
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

+ const productsAdapter = createEntityAdapter<Product>({
+  selectId: (product) => product.id,
+ });

const productsSlice = createSlice({
  name: "products",
+  initialState: productsAdapter.getInitialState(),
  reducers: {
    receivedProducts(state, action: PayloadAction<Product[]>) {
      const products = action.payload;
+      productsAdapter.setAll(state, products);
    },
  },
});

+ const productsSelector = productsAdapter.getSelectors<RootState>(
+   (state) => state.products
+ );
+ export const { selectAll } = productsSelector;
export const { receivedProducts } = productsSlice.actions;
export default productsSlice.reducer;
```

`app/feature/Products.tsx`

```diff
import React, { useEffect } from "react";
import styles from "./Products.module.css";
import { receivedProducts } from "./productsSlice";
import * as productSlice from "./productsSlice";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { getProducts } from "../../app/api";

export function Products() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    getProducts().then((products) => {
      dispatch(receivedProducts(products));
    });
  });
+  const products = useAppSelector(productSlice.selectAll);
  return (
    <main className="page">
      <ul className={styles.products}>
+        {products.map((product) => {
          return (
            product && (
              <li key={product.id}>
                <article className={styles.product}>
                  <figure>
                    <img src={product.imageURL} alt={product.imageAlt} />
                    <figcaption className={styles.caption}>
                      {product.imageCredit}
                    </figcaption>
                  </figure>
                  <div>
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>
                    <p>${product.price}</p>
                    <button>Add to Cart 🛒</button>
                  </div>
                </article>
              </li>
            )
          );
        })}
      </ul>
    </main>
  );
}
```

### Another flow example

`app/features/cart/cartSlice.ts`

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface CartState {
  items: { [producetID: string]: number };
}

const initialState: CartState = {
  items: {},
};

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
  },
});

export const { addToCart } = cartSlice.actions;
export default cartSlice.reducer;

export function getNumItems(state: RootState) {
  let numItems = 0;
  for (let id in state.cart.items) {
    numItems += state.cart.items[id];
  }
  return numItems;
}
```

`app/features/products/Products.tsx`

```tsx
import { addToCart } from "../cart/cartSlice";
...
<button onClick={() => dispatch(addToCart(product.id))}>Add to Cart 🛒</button>;
```

`app/features/products/Products.tsx`

```diff
import React from "react";
import { Link } from "react-router-dom";
import styles from "./CartLink.module.css";
+ import { getNumItems } from "./cartSlice";
+ import { useAppSelector } from "../../app/hooks";

export function CartLink() {
+  const numItems = useAppSelector(getNumItems);
  return (
    <Link to="/cart" className={styles.link}>
      <span className={styles.text}>
+        🛒&nbsp;&nbsp;{numItems ? numItems : "Cart"}
      </span>
    </Link>
  );
}
```

### createSelector

In previous section we wrote

```ts
export function getNumItems(state: RootState) {
  let numItems = 0;
  for (let id in state.cart.items) {
    numItems += state.cart.items[id];
  }
  return numItems;
}
```

This function actually get called whenever store get updated. But we only want to call this function when items in cart changes.

`app/features/cart/cartSlice.ts`

```ts
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
...
export const getNumItemsMemo = createSelector(
  (state: RootState) => state.cart.items,
  (items) => {
    let numItems = 0;
    for (let id in items) {
      numItems += items[id];
    }
    return numItems;
  }
);
```

### Aggregate values from multi slices

`app/features/prodcuts/productsSlice.ts`

```diff
+ export const { selectAll, selectEntities } = productsSelector;
```

`app/features/cart/cartSlice.ts`

```ts
export const getTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  productsSlice.selectEntities,
  (items, products) => {
    let total = 0;
    for (let id in items) {
      total += (products[id]?.price ?? 0) * items[id];
    }
    return total.toFixed(2);
  }
);
```

### extraReducers

Everything we added to `reducers` will be exported to Action.

```ts
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
});
// Actions
export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;
```

So what is some action you want custom action creator or you don't want action being created automatically.

`app/features/cart/cartSlice.ts`

```diff
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
+  extraReducers: function (builder) {
+    builder.addCase("cart/checkout/pending", (state, action) => {
+      state.checkoutState = "LOADING";
+    });
+  },
});
```

`app/features/cart/Cart.tsx`

```tsx
function onCheckout(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  dispatch({
    type: "cart/checkout/pending",
  });
}

<form onSubmit={onCheckout}>
  <button className={styles.button} type="submit">
    Checkout
  </button>
</form>;
```

### Thunk

Redux toolkit has intergated thunk already.

`app/features/cart/cartSlice.ts`

```ts
extraReducers: function (builder) {
  builder.addCase("cart/checkout/pending", (state, action) => {
    state.checkoutState = CheckoutEnmus.LOADING;
  });
  builder.addCase("cart/checkout/fulfilled", (state, action) => {
    state.checkoutState = CheckoutEnmus.READY;
  });
},
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
```

`app/features/cart/Cart.tsx`

```tsx
import {
  getTotalPrice,
  removeFromCart,
  updateQuantity,
  getCheckoutState,
  CheckoutEnmus,
  checkout,
} from "./cartSlice";

function onCheckout(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  dispatch(checkout());
}

<form onSubmit={onCheckout}>
  <button className={styles.button} type="submit">
    Checkout
  </button>
</form>;
```
