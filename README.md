# @thydda/movies-cart

**Current version: 0.1.1**

Shared NgRx movie cart configuration for the shell and movie
microfrontend. Built on `@thydda/cart-state`; no dependency on `web-components`.
This is an ESM npm library, not a remote or a server.

## Public API

| Export | Purpose |
| --- | --- |
| `Movie` | Movie data: numeric `id`, `title`, `director`, `year`, `summary`, `poster` |
| `cartFeatureKey` | Shared feature key: `cart` |
| `cartActions.itemAdded({ item })` | Add a movie; existing IDs are not duplicated or replaced |
| `cartActions.itemRemoved({ itemId })` | Remove a movie using its numeric ID |
| `cartReducer` | Manage `{ items: readonly Movie[] }`, initially empty |
| `cartSelectors.selectCartState` | Read the registered cart feature |
| `cartSelectors.selectItems` | Read the movies |
| `cartSelectors.selectItemIds` | Derive `number[]` for movie selection |
| `cartSelectors.selectCount` | Derive the header cart count |

The action namespace is `Movies cart`. Movie data contains no UI selection flag.
The cart determines selection by membership. State is in memory; persistence,
quantities and backend calls are not implemented.

The `Movie` type is imported and re-exported from `@thydda/movies-contracts@0.1.0`.
It is structurally compatible with the current Web Component `Movie`.
Consumers can migrate their model imports to this package without adding a visual
library dependency to the state packages. Consumers use the shared contract rather than maintaining a duplicate model.

## Dependencies

Dependencies: `@thydda/cart-state@0.1.0` and `@thydda/movies-contracts@0.1.0`
from GitHub Packages.
Peers: `@angular/core ^22.1.0`, `@ngrx/store ^22.0.1`, `rxjs ^7.8.0`.
Development uses TypeScript `~6.0.2`, Angular core/compiler `22.2.3` and the Node
test runner. Use Node.js compatible with Angular 22; Node 24 is used for validation.

## Install the published package

In each consumer (`shell` and `mfe1`), configure the scope in `.npmrc`:

```ini
@thydda:registry=https://npm.pkg.github.com
```

Authenticate with a GitHub personal access token (classic) with `read:packages`
and access to the package, then install a published version:

```sh
npm login --scope=@thydda --registry=https://npm.pkg.github.com --auth-type=legacy
npm install @thydda/movies-cart@0.1.1 --save-exact
```

The package must be published first. Do not commit tokens or install from sibling
source folders. Consumers download the versioned package with npm.

## Register in both application startups

Replace the application-local `cart.config.ts` exports and any imports from the
old `mfe1/features/cart/state` files with this public package API.

In both `app.config.ts` files, preserve the existing providers and add the feature:

```ts
import { provideState, provideStore } from '@ngrx/store';
import { cartFeatureKey, cartReducer } from '@thydda/movies-cart';

// In the existing providers array:
provideStore(),
provideState({ name: cartFeatureKey, reducer: cartReducer }),
```

Keep only one root Store registration and one cart feature registration per app.
Remove the cart registration from movie routes if it was registered there.

When hosted, the shell creates the Store and registers the cart; the remote uses
it. The remote's `app.config.ts` runs only when it boots independently. Share
compatible Angular and `@ngrx/store` dependencies as singletons in Native
Federation. Keep the same package version in both consumers, with consistent
sharing configuration. The domain library is consumed as an npm package and does
not need a Native Federation `exposes` entry. Separate tabs have separate state.

## Read selection and dispatch from the movie list

```ts
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { cartActions, cartSelectors, type Movie } from '@thydda/movies-cart';

// Inside the component:
private readonly store = inject(Store);
readonly selectedMovieIds = this.store.selectSignal(cartSelectors.selectItemIds);

onSelection(movie: Movie, selected: boolean): void {
  this.store.dispatch(
    selected
      ? cartActions.itemAdded({ item: movie })
      : cartActions.itemRemoved({ itemId: movie.id }),
  );
}
```

Bind `[selectedMovieIds]="selectedMovieIds()"` to the movie Web Component.
Its selection handler passes the event's movie and requested next selection state
to `onSelection`. Keep the event adapter in the application.

## Read the header count

```ts
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { cartSelectors } from '@thydda/movies-cart';

// Inside the header component:
readonly cartCount = inject(Store).selectSignal(cartSelectors.selectCount);
```

```html
<span>Cart: {{ cartCount() }}</span>
```

All views derive data from the same cart. Do not store a second copy of IDs or count.

## Development, compilation and tests

```sh
npm ci
npm run check
npm run build
npm pack --dry-run
```

| Script | Behavior |
| --- | --- |
| `build` | Clean `dist/` and compile strict TypeScript to ESM JavaScript and declarations |
| `test` | Build and run `node --test tests/*.test.mjs` |
| `check` | Run compilation and tests |
| `prepack` | Build before packaging |
| `prepublishOnly` | Run checks before publishing |

Tests use the public API to verify initialization, addition, duplicate IDs,
removal and derived selection/count values. Tests do not validate hosted browser
integration. Relative TypeScript imports use `.js` extensions with NodeNext.

## Versioning and publication

Create `https://github.com/thydda/movies-cart` and push reviewed source before
release; repository metadata does not create the GitHub repository.
Authenticate using a classic token with `write:packages` and `read:packages` and
appropriate access to the `thydda` namespace:

```sh
npm login --scope=@thydda --registry=https://npm.pkg.github.com --auth-type=legacy
npm view @thydda/movies-cart versions --json --registry=https://npm.pkg.github.com
```

Check lookup errors rather than assuming a failed request means no published
package. Use a new version for every release. For a compatible fix after `0.1.0`:

```sh
npm version patch --no-git-tag-version
```

This updates the manifest and lockfile without creating a Git commit/tag. Use
minor increments for features; document breaking changes explicitly while the API
is in `0.x`. Review and commit release changes before publication.

For the current release, use `0.1.1` if it is available:

```sh
npm run check
npm pack --dry-run
npm publish
npm view @thydda/movies-cart@0.1.1 version --registry=https://npm.pkg.github.com
```

`publishConfig` selects GitHub Packages. Inspect the dry-run file list for
`dist/index.js`, `dist/index.d.ts` and the modules they reference. `prepublishOnly`
repeats checks before publishing. No publication is performed by creating this
package. After release, install the same version in both consumers, rebuild and
verify standalone movies plus hosted navigation and header updates.

See [GitHub Packages npm registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
