import { createReducer, on } from '@ngrx/store';
import { Application } from '../../model/application.model';
import { ApplicationActions } from './application.action';

export const initialApp: Application = {
  loading: false,
  error: null,
  success: null,
};

export const applicationReducer = createReducer(
  initialApp,
  on(ApplicationActions.setLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),
);
