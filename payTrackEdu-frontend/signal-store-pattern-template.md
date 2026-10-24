# NgRx SignalStore Pattern — Template for Codex

Use this file as the reference pattern when generating a new `<Entity>SignalStore`.
Follow the structure and naming conventions EXACTLY, only replacing the placeholders.

## Placeholders to replace

| Placeholder      | Meaning                                    | Example (from reference)   |
|-------------------|--------------------------------------------|-----------------------------|
| `Entity`          | PascalCase entity name                     | `Branch`                    |
| `entity`          | camelCase entity name (singular)           | `branch`                    |
| `entities`        | camelCase entity name (plural)             | `branches`                  |
| `EntityService`   | Angular service for this entity            | `BranchService`             |
| `AddEntity`       | DTO type used to create the entity         | `AddBranch`                 |
| `EntityModel`     | Entity type/model                          | `Branch`                    |
| `entityFilterType`| Filter type for the list query (or `unknown`/`{}` if none) | `UserFilter` (adjust per entity) |

## Rules Codex must follow

1. Always structure the store in this exact order: `withState` → `withProps` →
   `withComputed` → `withMethods` (add `withHooks` only if lifecycle logic — e.g.
   auto-load on init — is explicitly requested).
2. `initialState` always includes: the list array, a `pagination` object
   (`page`, `size`, `totalElements`, `totalPages`), a `loading<Entity>` boolean,
   a `saving<Entity>` boolean, a `saveSuccess` boolean, an `error: string | null`,
   and a `filter` object.
3. `withProps` injects the entity's service AND the global NgRx `Store<State>`
   (used only to dispatch cross-cutting `ApplicationActions`, e.g. toasts/errors —
   never for entity-specific state).
4. `withComputed` exposes at minimum: `<entities>List` (raw list) and
   `paginationVm` (`pageIndex`, `pageSize`, `totalItems`) mapped from `pagination`.
5. Read operations (`load<Entities>`, `get<Entity>ById`, search/filter) use
   `switchMap` — new request cancels the previous one.
6. Write operations (`create<Entity>`, `update<Entity>`, `delete<Entity>`) use
   `exhaustMap` — ignore new triggers while one is in flight (prevents duplicate
   submits).
7. Every `rxMethod` uses `tapResponse` with explicit `next` / `error` /
   `finalize` (or `complete` for read methods that don't need `finalize`
   semantics — match the reference: reads use `complete` to flip the loading
   flag off, writes use `finalize` since they can error).
8. On write success: patch `saveSuccess: true`, dispatch
   `ApplicationActions.handleSuccess({ message: '...' })` via `store.storeNgrx`,
   reset pagination to page 0 if the list should reflect the new item, and call
   the load method again to refresh the list.
9. On write error: log to console with a `🔴` prefix and a descriptive label,
   patch `error` with a human-readable message, and set `saveSuccess: false`.
10. Expose only thin public methods from `withMethods`'s return object
    (`() => load<Entities>()`, `(payload) => create<Entity>(payload)`) — never
    return the raw `rxMethod` reference directly if it needs wrapping for
    clarity/typing.
11. Name the exported store `<Entity>SignalStore` and register it with
    `{ providedIn: 'root' }`.

## Reference implementation

```typescript
import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Store } from "@ngrx/store";
import { exhaustMap, pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { ApplicationActions } from "../../../core/data-access/application/application.action";
import { State } from "../../../core/data-access/store";
import { AddEntity, EntityModel } from "../../../core/model/entity.model";
import { EntityService } from "../../../core/services/entity.service";

const initialState = {
  entities: [] as EntityModel[],

  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },

  loadingEntity: false,
  savingEntity: false,
  saveSuccess: false,

  error: null as string | null,

  filter: {},
};

export const EntitySignalStore = signalStore(
  { providedIn: "root" },

  withState(initialState),

  withProps(() => ({
    entityService: inject(EntityService),
    storeNgrx: inject(Store<State>),
  })),

  withComputed((store) => ({
    entitiesList: computed(() => store.entities()),
    paginationVm: computed(() => ({
      pageIndex: store.pagination().page,
      pageSize: store.pagination().size,
      totalItems: store.pagination().totalElements,
    })),
  })),

  withMethods((store) => {
    const loadEntities = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingEntity: true, error: null })),
        switchMap(() =>
          store.entityService
            .getFilterEntities(
              store.filter(),
              store.pagination().page,
              store.pagination().size
            )
            .pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    entities: res.content,
                    pagination: {
                      page: res.number,
                      size: res.size,
                      totalElements: res.totalElements,
                      totalPages: res.totalPages,
                    },
                  }),
                error: () =>
                  patchState(store, { error: "Failed to load entities" }),
                complete: () => patchState(store, { loadingEntity: false }),
              })
            )
        )
      )
    );

    const createEntity = rxMethod<AddEntity>(
      pipe(
        tap(() =>
          patchState(store, {
            savingEntity: true,
            error: null,
            saveSuccess: false,
          })
        ),
        exhaustMap((entity) =>
          store.entityService.createEntity(entity).pipe(
            tapResponse({
              next: () => {
                store.storeNgrx.dispatch(
                  ApplicationActions.handleSuccess({
                    message: "Entity has been added successfully",
                  })
                );
                patchState(store, {
                  saveSuccess: true,
                  pagination: { ...store.pagination(), page: 0 },
                });
                loadEntities();
              },
              error: (err) => {
                console.log("🔴 Create Entity ERROR:", err);
                patchState(store, {
                  error: "Failed to create entity",
                  saveSuccess: false,
                });
              },
              finalize: () => patchState(store, { savingEntity: false }),
            })
          )
        )
      )
    );

    return {
      loadEntities: () => loadEntities(),
      createEntity: (entity: AddEntity) => createEntity(entity),
    };
  })
);
```

## Prompt to give Codex

> Using `signal-store-pattern-template.md` as the strict reference pattern,
> generate a `<EntityName>SignalStore` for the entity `<EntityName>` with model
> `<ModelPath>` and service `<ServicePath>`. Include `load<EntityName>s`,
> `create<EntityName>`, and additionally `update<EntityName>` and
> `delete<EntityName>` following the same write-method conventions
> (`exhaustMap`, `tapResponse`, success toast via `ApplicationActions`,
> reload list on success). Keep the exact block order and naming rules from
> the template.
