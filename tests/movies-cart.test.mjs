import '@angular/compiler';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cartActions, cartFeatureKey, cartReducer, cartSelectors } from '@thydda/movies-cart';

const movie = Object.freeze({ id: 1, title: 'Arrival', director: 'Denis Villeneuve', year: 2016, summary: 'Visitors arrive.', poster: '/arrival.jpg' });

test('registers an empty movie cart under the shared feature key', () => {
  const state = { [cartFeatureKey]: cartReducer(undefined, { type: 'init' }) };
  assert.deepEqual(cartSelectors.selectItems(state), []);
  assert.deepEqual(cartSelectors.selectItemIds(state), []);
  assert.equal(cartSelectors.selectCount(state), 0);
});

test('selection updates the movies, numeric IDs and header count from one state', () => {
  const action = cartActions.itemAdded({ item: movie });
  assert.equal(action.type, '[Movies cart] Item added');
  const cart = cartReducer(undefined, action);
  const state = { [cartFeatureKey]: cart };
  assert.deepEqual(cartSelectors.selectItems(state), [movie]);
  assert.deepEqual(cartSelectors.selectItemIds(state), [1]);
  assert.equal(cartSelectors.selectCount(state), 1);
  assert.equal(cartSelectors.selectItems(state)[0], movie);
  assert.equal('selected' in movie, false);
});

test('duplicate movie IDs do not increase the header count', () => {
  const cart = cartReducer(undefined, cartActions.itemAdded({ item: movie }));
  const next = cartReducer(cart, cartActions.itemAdded({ item: { ...movie, title: 'Duplicate' } }));
  assert.equal(cartSelectors.selectCount({ [cartFeatureKey]: next }), 1);
  assert.deepEqual(next.items, [movie]);
});

test('deselection removes a movie and updates every derived view', () => {
  const cart = cartReducer(undefined, cartActions.itemAdded({ item: movie }));
  const next = cartReducer(cart, cartActions.itemRemoved({ itemId: movie.id }));
  const state = { [cartFeatureKey]: next };
  assert.deepEqual(cartSelectors.selectItems(state), []);
  assert.deepEqual(cartSelectors.selectItemIds(state), []);
  assert.equal(cartSelectors.selectCount(state), 0);
  assert.deepEqual(cart.items, [movie]);
});
