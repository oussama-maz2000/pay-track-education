import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Application } from '../../model/application.model';

export const selectAppState =
  createFeatureSelector<Application>('APPLICATION_STORE');
export const selectApp = createSelector(selectAppState, (state) => state);

export const selectAppProp = <K extends keyof Application>(prop: K) =>
  createSelector(selectAppState, (state) => state[prop]);
