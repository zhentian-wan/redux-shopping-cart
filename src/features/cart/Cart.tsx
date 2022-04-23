import React from "react";
import classNames from "classnames";
import styles from "./Cart.module.css";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import * as productsSlice from "../products/productsSlice";
import {
  getTotalPrice,
  removeFromCart,
  updateQuantity,
  getCheckoutState,
  CheckoutEnmus,
  checkoutCart,
  getCartErrorMessage,
} from "./cartSlice";

export function Cart() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(productsSlice.selectAll);
  const items = useAppSelector((state) => state.cart.items);
  const totalPrice = useAppSelector(getTotalPrice);
  const checkoutState = useAppSelector(getCheckoutState);
  const errorMessage = useAppSelector(getCartErrorMessage);

  function onQuantityChanged(
    e: React.FocusEvent<HTMLInputElement>,
    id: string
  ) {
    const quantity = Number(e.target.value) || 0;
    dispatch(updateQuantity({ id, quantity }));
  }

  function onCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(checkoutCart());
  }

  const tableClasses = classNames({
    [styles.table]: true,
    [styles.checkoutError]: checkoutState === CheckoutEnmus.ERROR,
    [styles.checkoutLoading]: checkoutState === CheckoutEnmus.LOADING,
  });

  return (
    <main className="page">
      <h1>Shopping Cart</h1>
      <table className={tableClasses}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(items).map(([id, count]) => {
            const product = products.find((p) => p.id === id);
            return (
              product && (
                <tr key={id}>
                  <td>{product.name}</td>
                  <td>
                    <input
                      type="text"
                      onBlur={(e) => onQuantityChanged(e, id)}
                      className={styles.input}
                      defaultValue={count}
                    />
                  </td>
                  <td>{product.price}</td>
                  <td>
                    <button
                      onClick={() => dispatch(removeFromCart(product.id))}
                      aria-label={`Remove ${product.name} from Shopping Cart`}
                    >
                      X
                    </button>
                  </td>
                </tr>
              )
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td></td>
            <td className={styles.total}>${totalPrice}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <form onSubmit={onCheckout}>
        {checkoutState === "ERROR" && errorMessage ? (
          <p className={styles.errorBox}>{errorMessage}</p>
        ) : null}
        <button className={styles.button} type="submit">
          Checkout
        </button>
      </form>
    </main>
  );
}
