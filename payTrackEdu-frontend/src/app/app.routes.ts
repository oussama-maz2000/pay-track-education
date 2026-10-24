import { Routes } from '@angular/router';
import { noAuthChildGuard, noAuthGuard } from './core/guards/noauth.guard';

const noAuthGuards = {
  canActivate: [noAuthGuard],
  canActivateChild: [noAuthChildGuard],
};

export const routes: Routes = [
  {
    path: '',

    /*
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    */

    loadComponent: () =>
      import('./shared/layout/app-layout/app-layout.component').then(
        (m) => m.AppLayoutComponent,
      ),

    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard/student/student.component').then(
            (m) => m.StudentComponent,
          ),
        title: 'Étudiants',
      },

      {
        path: 'form-elements',
        loadComponent: () =>
          import('./pages/forms/form-elements/form-elements.component').then(
            (m) => m.FormElementsComponent,
          ),
        title: 'Form Elements',
      },

      {
        path: 'academic-years',
        loadComponent: () =>
          import('./pages/dashboard/academic_year/academic.component').then(
            (m) => m.AcademicYearComponent,
          ),
        title: 'Années universitaires',
      },

      {
        path: 'promotions',
        loadComponent: () =>
          import('./pages/dashboard/promotion/promotion.component').then(
            (m) => m.PromotionComponent,
          ),
        title: 'Promotions',
      },

      {
        path: 'promotion-sessions',
        loadComponent: () =>
          import('./pages/dashboard/promotion_session/promotion-session.component').then(
            (m) => m.PromotionSessionComponent,
          ),
        title: 'Sessions de promotion',
      },

      {
        path: 'payment-plans',
        loadComponent: () =>
          import('./pages/dashboard/payment_plan/payment-plan.component').then(
            (m) => m.PaymentPlanComponent,
          ),
        title: 'Plans de paiement',
      },

      {
        path: 'payment-plan-installments',
        loadComponent: () =>
          import('./pages/dashboard/payment_plan_installment/payment-plan-installment.component').then(
            (m) => m.PaymentPlanInstallmentComponent,
          ),
        title: 'Échéances des plans de paiement',
      },

      {
        path: 'students',
        loadComponent: () =>
          import('./pages/dashboard/student/student.component').then(
            (m) => m.StudentComponent,
          ),
        title: 'Étudiants',
      },

      {
        path: 'enrollments',
        loadComponent: () =>
          import('./pages/dashboard/enrollment/enrollment.component').then(
            (m) => m.EnrollmentComponent,
          ),
        title: 'Inscriptions',
      },

      {
        path: 'enrollments/:enrollmentId/installments',
        loadComponent: () =>
          import('./pages/dashboard/enrollment_installment/enrollment-installment.component').then(
            (m) => m.EnrollmentInstallmentComponent,
          ),
        title: 'Échéances de l’inscription',
      },

      {
        path: 'enrollments/:enrollmentId/payments',
        loadComponent: () =>
          import('./pages/dashboard/payment/payment.component').then(
            (m) => m.PaymentComponent,
          ),
        title: 'Paiements de l’inscription',
      },
    ],
  },

  {
    ...noAuthGuards,
    path: 'signin',
    loadComponent: () =>
      import('./pages/auth-pages/sign-in/sign-in.component').then(
        (m) => m.SignInComponent,
      ),
    title: 'Sign In',
  },

  {
    ...noAuthGuards,
    path: 'signup',
    loadComponent: () =>
      import('./pages/auth-pages/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent,
      ),
    title: 'Sign Up',
  },

  {
    ...noAuthGuards,
    path: '**',
    loadComponent: () =>
      import('./pages/other-page/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Not Found',
  },
];
