import { create } from 'zustand';
import { api, ApiError } from '@/api';
import type {
  ContactMessage,
  Post,
  PostInput,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  SiteSettings,
  SiteSettingsInput,
  Skill,
  SkillInput,
} from '@/types';

interface ContentState {
  profile: Profile | null;
  skills: Skill[];
  /** 含草稿，后台与统计使用；前台展示时按 status 过滤 */
  posts: Post[];
  projects: Project[];
  settings: SiteSettings | null;
  /** 访客留言：仅后台使用，不在 loadAll 中加载，避免前台多读一次本地数据 */
  messages: ContactMessage[];
  messagesLoaded: boolean;
  messagesLoading: boolean;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

interface LoadAllOptions {
  /** 为 true 时忽略 loaded 标记强制刷新 */
  force?: boolean;
}

interface ContentActions {
  loadAll: (options?: LoadAllOptions) => Promise<void>;
  loadProfile: () => Promise<Profile>;
  saveProfile: (payload: Partial<ProfileInput>) => Promise<Profile>;
  /** 重置为默认示例数据（后台需二次确认后调用） */
  resetProfile: () => Promise<Profile>;
  upsertSkill: (input: SkillInput, id?: string) => Promise<Skill>;
  deleteSkill: (id: string) => Promise<void>;
  upsertProject: (input: ProjectInput, id?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  upsertPost: (input: PostInput, id?: string) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  saveSettings: (payload: Partial<SiteSettingsInput>) => Promise<SiteSettings>;
  /** 后台按需加载留言列表 */
  loadMessages: (options?: LoadAllOptions) => Promise<void>;
  /** 单条留言标记已读 / 未读 */
  markMessageRead: (id: string, read: boolean) => Promise<ContactMessage>;
  /** 全部标记已读 */
  markAllMessagesRead: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export type ContentStore = ContentState & ContentActions;

/** 按 id 覆盖或追加，保持其余项顺序不变 */
function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index === -1) {
    return [...list, item];
  }
  const next = [...list];
  next[index] = item;
  return next;
}

/** 文章按发布时间倒序，保证 store 内顺序与 api 返回一致 */
function sortPostsDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** 统一错误文案：ApiError 直接用其 message，未知错误记录原始信息后兜底 */
function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  console.error('[contentStore] 未预期的错误', error);
  return '操作失败，请重试';
}

export const useContentStore = create<ContentStore>((set, get) => ({
  profile: null,
  skills: [],
  posts: [],
  projects: [],
  settings: null,
  messages: [],
  messagesLoaded: false,
  messagesLoading: false,
  loaded: false,
  loading: false,
  error: null,

  loadAll: async ({ force = false }: LoadAllOptions = {}) => {
    if (get().loading) {
      return;
    }
    if (get().loaded && !force) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const [profile, skills, projects, posts, settings] = await Promise.all([
        api.profile.get(),
        api.skills.list(),
        api.projects.list(),
        api.posts.list({ includeDrafts: true }),
        api.settings.get(),
      ]);
      set({ profile, skills, projects, posts, settings, loading: false, loaded: true });
    } catch (error) {
      console.error('[contentStore] 加载内容失败', error);
      set({ loading: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  loadProfile: async () => {
    try {
      const profile = await api.profile.get();
      set({ profile, error: null });
      return profile;
    } catch (error) {
      console.error('[contentStore] 读取个人信息失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  saveProfile: async (payload) => {
    try {
      const profile = await api.profile.update(payload);
      set({ profile, error: null });
      return profile;
    } catch (error) {
      console.error('[contentStore] 保存个人信息失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  resetProfile: async () => {
    try {
      const profile = await api.profile.reset();
      set({ profile, error: null });
      return profile;
    } catch (error) {
      console.error('[contentStore] 重置个人信息失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  upsertSkill: async (input, id) => {
    try {
      const skill = id ? await api.skills.update(id, input) : await api.skills.create(input);
      set((state) => ({ skills: upsertById(state.skills, skill), error: null }));
      return skill;
    } catch (error) {
      console.error('[contentStore] 保存技能失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  deleteSkill: async (id) => {
    try {
      await api.skills.remove(id);
      set((state) => ({
        skills: state.skills.filter((skill) => skill.id !== id),
        error: null,
      }));
    } catch (error) {
      console.error('[contentStore] 删除技能失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  upsertProject: async (input, id) => {
    try {
      const project = id ? await api.projects.update(id, input) : await api.projects.create(input);
      set((state) => ({ projects: upsertById(state.projects, project), error: null }));
      return project;
    } catch (error) {
      console.error('[contentStore] 保存项目失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.projects.remove(id);
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        error: null,
      }));
    } catch (error) {
      console.error('[contentStore] 删除项目失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  upsertPost: async (input, id) => {
    try {
      const post = id ? await api.posts.update(id, input) : await api.posts.create(input);
      set((state) => ({ posts: sortPostsDesc(upsertById(state.posts, post)), error: null }));
      return post;
    } catch (error) {
      console.error('[contentStore] 保存文章失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      await api.posts.remove(id);
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
        error: null,
      }));
    } catch (error) {
      console.error('[contentStore] 删除文章失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  saveSettings: async (payload) => {
    try {
      const settings = await api.settings.update(payload);
      set({ settings, error: null });
      return settings;
    } catch (error) {
      console.error('[contentStore] 保存站点设置失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  loadMessages: async ({ force = false }: LoadAllOptions = {}) => {
    if (get().messagesLoading) {
      return;
    }
    if (get().messagesLoaded && !force) {
      return;
    }

    set({ messagesLoading: true });
    try {
      const messages = await api.messages.list();
      set({ messages, messagesLoaded: true, messagesLoading: false });
    } catch (error) {
      console.error('[contentStore] 加载留言失败', error);
      set({ messagesLoading: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  markMessageRead: async (id, read) => {
    try {
      const message = await api.messages.markRead(id, read);
      set((state) => ({
        messages: state.messages.map((item) => (item.id === id ? message : item)),
        error: null,
      }));
      return message;
    } catch (error) {
      console.error('[contentStore] 更新留言已读状态失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  markAllMessagesRead: async () => {
    try {
      const messages = await api.messages.markAllRead();
      set({ messages, error: null });
    } catch (error) {
      console.error('[contentStore] 批量标记留言已读失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },

  deleteMessage: async (id) => {
    try {
      await api.messages.remove(id);
      set((state) => ({
        messages: state.messages.filter((message) => message.id !== id),
        error: null,
      }));
    } catch (error) {
      console.error('[contentStore] 删除留言失败', error);
      set({ error: toErrorMessage(error) });
      throw error;
    }
  },
}));
