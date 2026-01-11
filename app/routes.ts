import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('app', 'routes/app.tsx', [
    index('routes/app-home.tsx'),
    route('main-categories', 'routes/main-categories.tsx'),
    route('categories', 'routes/categories.tsx'),
    route('sub-categories', 'routes/sub-categories.tsx'),
    route('hierarchy-categories', 'routes/hierarchy-categories.tsx'),
    route('products', 'routes/products.tsx'),
    route('add-new-product', 'routes/add-new-product.tsx'),
    route('product/:productId', 'routes/product.tsx'),
    route('edit-product/:productId', 'routes/edit-product.tsx'),
    route('users', 'routes/users.tsx'),
    route('contents', 'routes/contents.tsx'),
    route('new-content', 'routes/new-content.tsx'),
    route('edit-content/:name', 'routes/edit-content.tsx'),
    route('orders', 'routes/orders.tsx'),
    route('order/:orderId', 'routes/order.tsx'),
    route('promocodes', 'routes/promocodes.tsx'),
  ]),
] satisfies RouteConfig;
