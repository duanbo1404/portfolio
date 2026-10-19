import { ApiError, now, validateWithSchema, withDelay } from '@/api/client';
import { KEYS, read, write } from '@/api/storage';
import { postInputSchema } from '@/schemas/postSchema';
import type { Post, PostInput } from '@/types';
import { createId } from '@/utils/id';
import { estimateReadingTime } from '@/utils/readingTime';
import { isValidSlug, normalizeSlug } from '@/utils/slug';

/** 按发布时间倒序 */
function sortByPublishedAtDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export interface PostListOptions {
  /** 是否包含草稿；前台列表传 false（默认） */
  includeDrafts?: boolean;
  /** 按标签精确过滤 */
  tag?: string;
}

export const postsApi = {
  /** 文章列表；默认仅返回已发布文章，按 publishedAt 倒序 */
  async list(options?: PostListOptions): Promise<Post[]> {
    return withDelay(() => {
      const all = read<Post[]>(KEYS.posts, []);
      const includeDrafts = options?.includeDrafts ?? false;
      const tag = options?.tag;

      const filtered = all.filter((post) => {
        if (!includeDrafts && post.status !== 'published') {
          return false;
        }
        if (tag && !post.tags.includes(tag)) {
          return false;
        }
        return true;
      });

      return sortByPublishedAtDesc(filtered);
    });
  },

  /** 按 id 读取（后台编辑使用，草稿也可读取） */
  async getById(id: string): Promise<Post> {
    return withDelay(() => {
      const post = read<Post[]>(KEYS.posts, []).find((item) => item.id === id);
      if (!post) {
        throw new ApiError('文章不存在或已被删除', 'NOT_FOUND');
      }
      return post;
    });
  },

  /** 前台按 slug 读取；草稿与不存在的文章统一抛 NOT_FOUND，避免泄露草稿 */
  async getBySlug(slug: string): Promise<Post> {
    return withDelay(() => {
      const normalized = normalizeSlug(slug);
      const post = read<Post[]>(KEYS.posts, []).find((item) => item.slug === normalized);
      if (!post || post.status !== 'published') {
        throw new ApiError('文章不存在或未发布', 'NOT_FOUND');
      }
      return post;
    });
  },

  /** 新建：归一化 slug、校验唯一性，并由正文计算 readingTime */
  async create(input: PostInput): Promise<Post> {
    return withDelay(() => {
      const all = read<Post[]>(KEYS.posts, []);
      const parsed = validateWithSchema(postInputSchema, {
        ...input,
        slug: normalizeSlug(input.slug),
      });

      if (all.some((post) => post.slug === parsed.slug)) {
        throw new ApiError(`slug「${parsed.slug}」已被使用，请更换`, 'VALIDATION');
      }

      const timestamp = now();
      const post: Post = {
        ...parsed,
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        readingTime: estimateReadingTime(parsed.content),
      };
      write<Post[]>(KEYS.posts, [...all, post]);
      return post;
    });
  },

  /** 局部更新；草稿首次发布且未指定发布时间时，自动写入当前时间 */
  async update(id: string, payload: Partial<PostInput>): Promise<Post> {
    return withDelay(() => {
      const all = read<Post[]>(KEYS.posts, []);
      const current = all.find((item) => item.id === id);
      if (!current) {
        throw new ApiError('文章不存在或已被删除', 'NOT_FOUND');
      }

      const raw: Record<string, unknown> = { ...current, ...payload };
      if (typeof raw.slug === 'string') {
        raw.slug = normalizeSlug(raw.slug);
      }
      const parsed = validateWithSchema(postInputSchema, raw);

      if (parsed.slug !== current.slug && all.some((post) => post.slug === parsed.slug && post.id !== id)) {
        throw new ApiError(`slug「${parsed.slug}」已被使用，请更换`, 'VALIDATION');
      }

      const publishedAt =
        current.status === 'draft' && parsed.status === 'published' && payload.publishedAt === undefined
          ? now()
          : parsed.publishedAt;

      const next: Post = {
        ...parsed,
        publishedAt,
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: now(),
        readingTime: estimateReadingTime(parsed.content),
      };
      write<Post[]>(
        KEYS.posts,
        all.map((item) => (item.id === id ? next : item)),
      );
      return next;
    });
  },

  /** 删除文章 */
  async remove(id: string): Promise<void> {
    return withDelay(() => {
      const all = read<Post[]>(KEYS.posts, []);
      if (!all.some((item) => item.id === id)) {
        throw new ApiError('文章不存在或已被删除', 'NOT_FOUND');
      }
      write<Post[]>(
        KEYS.posts,
        all.filter((item) => item.id !== id),
      );
    });
  },

  /** 校验 slug 是否可用；格式非法直接返回 false */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    return withDelay(() => {
      const normalized = normalizeSlug(slug);
      if (!isValidSlug(normalized)) {
        return false;
      }
      return !read<Post[]>(KEYS.posts, []).some(
        (post) => post.slug === normalized && post.id !== excludeId,
      );
    });
  },
};
