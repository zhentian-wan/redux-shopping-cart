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
  const products = useAppSelector(productSlice.selectAll);
  return (
    <main className="page">
      <ul className={styles.products}>
        {products.map((product) => {
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
