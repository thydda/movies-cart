import { createSelector } from '@ngrx/store';
import { createCartActions, createCartReducer, createCartSelectors } from '@thydda/cart-state';
import type { Movie } from '@thydda/movies-contracts';

export const cartFeatureKey = 'cart';
const getId = (movie: Movie): number => movie.id;

export const cartActions = createCartActions<Movie>('Movies cart');
export const cartReducer = createCartReducer<Movie>(cartActions, getId);

const selectors = createCartSelectors<Movie>(cartFeatureKey, getId);

// Preserve numeric movie IDs in the domain API despite the generic factory's union ID type.
export const cartSelectors = {
  ...selectors,
  selectItemIds: createSelector(selectors.selectItems, (movies): number[] => movies.map(getId)),
};
