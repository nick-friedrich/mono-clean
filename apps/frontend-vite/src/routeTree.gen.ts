/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ResetPasswordImport } from './routes/reset-password'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginEmailImport } from './routes/login-email'
import { Route as LoginImport } from './routes/login'
import { Route as ForgotPasswordImport } from './routes/forgot-password'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const ResetPasswordRoute = ResetPasswordImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => rootRoute,
} as any)

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginEmailRoute = LoginEmailImport.update({
  id: '/login-email',
  path: '/login-email',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const ForgotPasswordRoute = ForgotPasswordImport.update({
  id: '/forgot-password',
  path: '/forgot-password',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/forgot-password': {
      id: '/forgot-password'
      path: '/forgot-password'
      fullPath: '/forgot-password'
      preLoaderRoute: typeof ForgotPasswordImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/login-email': {
      id: '/login-email'
      path: '/login-email'
      fullPath: '/login-email'
      preLoaderRoute: typeof LoginEmailImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/reset-password': {
      id: '/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof ResetPasswordImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/login-email': typeof LoginEmailRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/login-email': typeof LoginEmailRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/login-email': typeof LoginEmailRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/forgot-password'
    | '/login'
    | '/login-email'
    | '/register'
    | '/reset-password'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/forgot-password'
    | '/login'
    | '/login-email'
    | '/register'
    | '/reset-password'
  id:
    | '__root__'
    | '/'
    | '/forgot-password'
    | '/login'
    | '/login-email'
    | '/register'
    | '/reset-password'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ForgotPasswordRoute: typeof ForgotPasswordRoute
  LoginRoute: typeof LoginRoute
  LoginEmailRoute: typeof LoginEmailRoute
  RegisterRoute: typeof RegisterRoute
  ResetPasswordRoute: typeof ResetPasswordRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ForgotPasswordRoute: ForgotPasswordRoute,
  LoginRoute: LoginRoute,
  LoginEmailRoute: LoginEmailRoute,
  RegisterRoute: RegisterRoute,
  ResetPasswordRoute: ResetPasswordRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/forgot-password",
        "/login",
        "/login-email",
        "/register",
        "/reset-password"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/forgot-password": {
      "filePath": "forgot-password.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/login-email": {
      "filePath": "login-email.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/reset-password": {
      "filePath": "reset-password.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
