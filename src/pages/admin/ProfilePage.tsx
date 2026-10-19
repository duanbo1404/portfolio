import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { ApiError } from '@/api';
import { EducationEditor } from '@/components/admin/EducationEditor';
import { ExperienceEditor } from '@/components/admin/ExperienceEditor';
import { ProfileBasicFields } from '@/components/admin/ProfileBasicFields';
import { SocialLinksEditor } from '@/components/admin/SocialLinksEditor';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { profileSchema } from '@/schemas/profileSchema';
import { useContentStore } from '@/store/contentStore';
import type { Profile, ProfileInput } from '@/types';
import { zodErrorsToMap, type FieldErrors } from '@/utils/formErrors';

/** 从 Profile 中剥离 id / updatedAt，得到表单可编辑的数据 */
function toProfileInput(profile: Profile): ProfileInput {
  return {
    name: profile.name,
    title: profile.title,
    tagline: profile.tagline,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    email: profile.email,
    location: profile.location,
    resumeUrl: profile.resumeUrl,
    socials: profile.socials,
    experiences: profile.experiences,
    educations: profile.educations,
  };
}

/**
 * 个人信息管理：基础资料 + 简介 + 社交链接 + 经历 + 教育。
 * 保存走 contentStore，成功写入后前台订阅同一份数据，无需刷新即可看到改动。
 */
export function ProfilePage(): ReactElement {
  const profile = useContentStore((state) => state.profile);
  const saveProfile = useContentStore((state) => state.saveProfile);
  const resetProfile = useContentStore((state) => state.resetProfile);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<ProfileInput | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  // store 中的数据变化（首次加载 / 保存成功 / 重置）后同步到表单
  useEffect(() => {
    if (profile) {
      setForm(toProfileInput(profile));
    }
  }, [profile]);

  const handleChange = useCallback(
    <K extends keyof ProfileInput,>(key: K, value: ProfileInput[K]): void => {
      setForm((current) => (current ? { ...current, [key]: value } : current));
      setErrors((current) => {
        const keyName = String(key);
        if (!(keyName in current)) {
          return current;
        }
        const next = { ...current };
        delete next[keyName];
        return next;
      });
    },
    [],
  );

  const handleSave = async (): Promise<void> => {
    if (!form || isSaving) {
      return;
    }

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const map = zodErrorsToMap(parsed.error);
      setErrors(map);
      toastError(`有 ${Object.keys(map).length} 处信息需要修正`);
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile(parsed.data);
      setErrors({});
      success('个人信息已保存，前台已同步');
    } catch (error) {
      console.error('[ProfilePage] 保存个人信息失败', error);
      toastError(error instanceof ApiError ? error.message : '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    setIsResetting(true);
    try {
      await resetProfile();
      setErrors({});
      setResetOpen(false);
      success('已重置为默认示例数据');
    } catch (error) {
      console.error('[ProfilePage] 重置个人信息失败', error);
      toastError(error instanceof ApiError ? error.message : '重置失败，请重试');
    } finally {
      setIsResetting(false);
    }
  };

  const errorCount = Object.keys(errors).length;

  if (!profile || !form) {
    return <p className="text-sm text-content-muted">个人信息暂时不可用，请刷新页面重试。</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">个人信息</h2>
          <p className="mt-1 text-sm text-content-muted">
            保存后会立即同步到前台首屏、关于区与页脚。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setResetOpen(true)}
            disabled={isSaving || isResetting}
          >
            <RotateCcw size={15} aria-hidden="true" />
            重置为默认示例数据
          </Button>
          <Button onClick={() => void handleSave()} isLoading={isSaving}>
            <Save size={15} aria-hidden="true" />
            保存
          </Button>
        </div>
      </div>

      <ProfileBasicFields value={form} errors={errors} onChange={handleChange} />

      <SocialLinksEditor
        value={form.socials}
        errors={errors}
        onChange={(socials) => handleChange('socials', socials)}
      />

      <ExperienceEditor
        value={form.experiences}
        errors={errors}
        onChange={(experiences) => handleChange('experiences', experiences)}
      />

      <EducationEditor
        value={form.educations}
        errors={errors}
        onChange={(educations) => handleChange('educations', educations)}
      />

      {/* 长表单底部固定保存条，避免每次保存都要滚回顶部 */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur">
        {errorCount > 0 && (
          <p role="alert" className="mr-auto text-xs text-danger">
            有 {errorCount} 处信息需要修正
          </p>
        )}
        <Button onClick={() => void handleSave()} isLoading={isSaving} size="sm">
          <Save size={15} aria-hidden="true" />
          保存更改
        </Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="重置个人信息"
        description={
          <>
            确定要把「{profile.name}」的个人信息重置为默认示例数据吗？当前填写的基础资料、社交链接、工作经历与教育背景都会被覆盖，且无法撤销。
          </>
        }
        confirmLabel="确认重置"
        isLoading={isResetting}
        onConfirm={() => void handleReset()}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
