import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Cart, CartItem } from '../../models/shop/cart.model';
import { LocalService } from '@share/services';
import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    cart$ = new BehaviorSubject<any[]>(
        (this._localService.getLocalStorage(environment.lscartitems)
          ? JSON.parse(this._localService.getLocalStorage(environment.lscartitems))
          : [])
    );

    constructor(
        private _localService: LocalService,
    ) { }

    get cart(): any[] {
        return this.cart$.getValue();
    }

    addToCart(item: CartItem): void {
        const items = [...this.cart];

        const itemInCart = items.find((_item) => _item.id === item.id);
        if (itemInCart) {
            itemInCart.quantity += 1;
        } else {
            items.push(item);
        }

        this._localService.setLocalStorage(
            environment.lscartitems,
            JSON.stringify(items)
        );
        this.cart$.next(items);
    }

    removeFromCart(item: CartItem, updateCart = true): CartItem[] {
        const filteredItems = this.cart.filter(
            (_item) => _item.id !== item.id
        );

        if (updateCart) {
            this.cart$.next(filteredItems);
            
        }

        return filteredItems;
    }

    removeQuantity(item: CartItem): void {
        let itemForRemoval!: CartItem;

        let filteredItems = this.cart.map((_item) => {
            if (_item.id === item.id) {
                _item.quantity--;
                if (_item.quantity === 0) {
                    itemForRemoval = _item;
                }
            }

            return _item;
        });

        if (itemForRemoval) {
            filteredItems = this.removeFromCart(itemForRemoval, false);
        }

        this.cart$.next(filteredItems);
    }

    clearCart(): void {
        this.cart$.next([]);
    }

    getTotal(items: CartItem[]): number {
        return items
            .map((item) => item.price * item.quantity)
            .reduce((prev, current) => prev + current, 0);
    }

    updateCart(cart: any[] = []) {
        this._localService.setLocalStorage(
          environment.lscartitems,
          JSON.stringify(cart)
        );
        this.cart$.next(cart);
    }
}