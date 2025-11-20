import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('main-categories', 'routes/main-categories.tsx'),
  route('categories', 'routes/categories.tsx'),
  route('sub-categories', 'routes/sub-categories.tsx'),
  route('hierarchy-categories', 'routes/hierarchy-categories.tsx'),
  route('products', 'routes/products.tsx'),
  route('users', 'routes/users.tsx'),
] satisfies RouteConfig;
