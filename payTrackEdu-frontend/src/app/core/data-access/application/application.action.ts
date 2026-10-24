import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ApplicationActions = createActionGroup({
  source: 'APPLICATION',
  events: {
    handleError: props<{ message: string }>(),
    handleSuccessWithRouting: props<{ message: string; navigateTo: string }>(),
    handleSuccess: props<{ message: string }>(),
    init: emptyProps(),
    initUnauthenticated: emptyProps(),
    setLoading: props<{ loading: boolean }>(),
  },
});
