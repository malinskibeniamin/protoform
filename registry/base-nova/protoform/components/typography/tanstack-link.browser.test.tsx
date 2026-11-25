import { page } from '@rstest/browser';
import { afterEach, expect, rs, test } from '@rstest/core';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link as RouterLink,
  RouterProvider,
} from '@tanstack/react-router';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';

import { Link } from '.';

afterEach(cleanup);

test('preserves router preloading, refs and client navigation', async () => {
  const ref = createRef<HTMLAnchorElement>();
  const loadPost = rs.fn(() => 'Loaded');
  const linkProps = {
    className: 'mt-2',
    hash: 'details',
    params: { postId: '42' },
    preload: 'intent',
    preloadDelay: 0,
    ref,
    replace: true,
    search: { page: 2 },
    testId: 'post-link',
    to: '/posts/$postId',
  } as const;
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <Link as={RouterLink} {...linkProps}>
          Read post
        </Link>
        <Outlet />
      </>
    ),
  });
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <h1>Home</h1> });
  const postRoute = createRoute({
    component: () => <h1>Post loaded</h1>,
    getParentRoute: () => rootRoute,
    loader: loadPost,
    path: '/posts/$postId',
    validateSearch: (search: Record<string, unknown>) => ({ page: Number(search['page'] ?? 1) }),
  });
  const history = createMemoryHistory({ initialEntries: ['/'] });
  const router = createRouter({ history, routeTree: rootRoute.addChildren([indexRoute, postRoute]) });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByRole('heading', { name: 'Home' });
  const link = screen.getByRole('link', { name: 'Read post' });
  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(ref.current).toBe(link);
  expect(link).toHaveAttribute('href', '/posts/42?page=2#details');
  expect(link).toHaveAttribute('data-testid', 'post-link');
  expect(link).toHaveClass('font-medium', 'text-primary', 'underline', 'mt-2');
  expect(link).not.toHaveAttribute('as');
  expect(loadPost).not.toHaveBeenCalled();
  await page.getByRole('link', { name: 'Read post' }).hover();
  await waitFor(() => expect(loadPost).toHaveBeenCalledTimes(1));
  expect(router.state.location.pathname).toBe('/');
  await page.getByRole('link', { name: 'Read post' }).click();
  await screen.findByRole('heading', { name: 'Post loaded' });
  expect(router.state.location.pathname).toBe('/posts/42');
  expect(router.state.location.search).toEqual({ page: 2 });
  expect(router.state.location.hash).toBe('details');
  expect(history.length).toBe(1);
});
