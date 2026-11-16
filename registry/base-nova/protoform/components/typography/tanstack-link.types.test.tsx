import { test } from '@rstest/core';
import { createRootRoute, createRoute, createRouter, Link as RouterLink } from '@tanstack/react-router';
import { expectTypeOf } from 'expect-type';
import { type ComponentProps, createRef } from 'react';

import { Link } from '.';
import type { TanStackLink } from './tanstack-link';

const rootRoute = createRootRoute();
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts/$postId',
  validateSearch: (search: Record<string, unknown>) => ({ page: Number(search['page'] ?? 1) }),
});
const router = createRouter({ routeTree: rootRoute.addChildren([postRoute]) });

test('retains native anchor and legacy injected-router props and refs', () => {
  const ref = createRef<HTMLAnchorElement>();
  expectTypeOf(
    <Link href="/docs" ref={ref}>
      Docs
    </Link>
  ).toExtend<React.ReactElement>();
  expectTypeOf(
    <Link
      as={RouterLink}
      hash="intro"
      params={{ postId: '42' }}
      preload="viewport"
      ref={ref}
      replace
      search={{ page: 2 }}
      to="/posts/$postId"
    >
      Post
    </Link>
  ).toExtend<React.ReactElement>();
  expectTypeOf<{ children: string }>().not.toExtend<ComponentProps<typeof Link<'a'>>>();
});

test('preserves TanStack route, params, search, preload and anchor-ref contracts', () => {
  type PostLinkProps = ComponentProps<typeof TanStackLink<typeof router, string, '/posts/$postId'>>;
  interface ValidPostLinkProps {
    params: { postId: string };
    preload: 'intent';
    ref: React.RefObject<HTMLAnchorElement | null>;
    search: { page: number };
    testId: string;
    to: '/posts/$postId';
  }
  expectTypeOf<ValidPostLinkProps>().toExtend<PostLinkProps>();
  expectTypeOf<Omit<ValidPostLinkProps, 'params'>>().not.toExtend<PostLinkProps>();
  expectTypeOf<Omit<ValidPostLinkProps, 'params'> & { params: { wrongId: string } }>().not.toExtend<PostLinkProps>();
  expectTypeOf<Omit<ValidPostLinkProps, 'search'> & { search: { page: string } }>().not.toExtend<PostLinkProps>();
  expectTypeOf<Omit<ValidPostLinkProps, 'preload'> & { preload: 'unknown' }>().not.toExtend<PostLinkProps>();
  expectTypeOf<
    Omit<ValidPostLinkProps, 'ref'> & { ref: React.RefObject<HTMLButtonElement | null> }
  >().not.toExtend<PostLinkProps>();
  type InvalidRouteProps = ComponentProps<typeof TanStackLink<typeof router, string, '/missing'>>;
  expectTypeOf<{ to: '/missing' }>().not.toExtend<InvalidRouteProps>();
});
