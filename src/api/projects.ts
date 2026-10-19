import { ApiError, now, validateWithSchema, withDelay } from '@/api/client';
import { KEYS, read, write } from '@/api/storage';
import { projectInputSchema } from '@/schemas/projectSchema';
import type { Project, ProjectInput } from '@/types';
import { createId } from '@/utils/id';

/** order 升序 → 开始时间倒序 */
function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return b.startDate.localeCompare(a.startDate);
  });
}

export interface ProjectListOptions {
  /** 仅返回 featured === true 的项目（首页精选用） */
  featuredOnly?: boolean;
}

export const projectsApi = {
  /** 项目列表；默认按 order → startDate 倒序 */
  async list(options?: ProjectListOptions): Promise<Project[]> {
    return withDelay(() => {
      const all = read<Project[]>(KEYS.projects, []);
      const filtered = options?.featuredOnly ? all.filter((project) => project.featured) : all;
      return sortProjects(filtered);
    });
  },

  /** 按 id 读取；不存在抛 NOT_FOUND */
  async getById(id: string): Promise<Project> {
    return withDelay(() => {
      const project = read<Project[]>(KEYS.projects, []).find((item) => item.id === id);
      if (!project) {
        throw new ApiError('项目不存在或已被删除', 'NOT_FOUND');
      }
      return project;
    });
  },

  /** 新建项目 */
  async create(input: ProjectInput): Promise<Project> {
    return withDelay(() => {
      const all = read<Project[]>(KEYS.projects, []);
      const parsed = validateWithSchema(projectInputSchema, input);
      const timestamp = now();
      const project: Project = {
        ...parsed,
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      write<Project[]>(KEYS.projects, [...all, project]);
      return project;
    });
  },

  /** 局部更新：合并 → 校验 → 写回，createdAt 保持不变 */
  async update(id: string, payload: Partial<ProjectInput>): Promise<Project> {
    return withDelay(() => {
      const all = read<Project[]>(KEYS.projects, []);
      const current = all.find((item) => item.id === id);
      if (!current) {
        throw new ApiError('项目不存在或已被删除', 'NOT_FOUND');
      }

      const parsed = validateWithSchema(projectInputSchema, { ...current, ...payload });
      const next: Project = {
        ...parsed,
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: now(),
      };
      write<Project[]>(
        KEYS.projects,
        all.map((item) => (item.id === id ? next : item)),
      );
      return next;
    });
  },

  /** 删除项目 */
  async remove(id: string): Promise<void> {
    return withDelay(() => {
      const all = read<Project[]>(KEYS.projects, []);
      if (!all.some((item) => item.id === id)) {
        throw new ApiError('项目不存在或已被删除', 'NOT_FOUND');
      }
      write<Project[]>(
        KEYS.projects,
        all.filter((item) => item.id !== id),
      );
    });
  },

  /** 按传入 id 顺序重写 order */
  async reorder(ids: string[]): Promise<Project[]> {
    return withDelay(() => {
      const all = read<Project[]>(KEYS.projects, []);
      const orderById = new Map<string, number>();
      ids.forEach((id, index) => {
        orderById.set(id, index);
      });

      const timestamp = now();
      const next = all.map((project) => {
        const order = orderById.get(project.id);
        return order === undefined ? project : { ...project, order, updatedAt: timestamp };
      });

      write<Project[]>(KEYS.projects, next);
      return sortProjects(next);
    });
  },
};
