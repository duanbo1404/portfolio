import { useCallback, useEffect, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { ApiError } from '@/api';
import { FormField } from '@/components/admin/FormField';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Switch } from '@/components/common/Switch';
import { Textarea } from '@/components/common/Textarea';
import { useToast } from '@/hooks/useToast';
import { settingsSchema } from '@/schemas/settingsSchema';
import { useContentStore } from '@/store/contentStore';
import type { SiteSettings, SiteSettingsInput, StarDensity } from '@/types';
import { zodErrorsToMap, type FieldErrors } from '@/utils/formErrors';

interface SettingsFormState {
  siteName: string;
  siteDescription: string;
  footerText: string;
  icp: string;
  contactEmail: string;
  enableStarfield: boolean;
  starDensity: StarDensity;
}

/** Profile / Settings 的可选字段用空串表示未填写，提交时再转成 undefined */
function toFormState(settings: SiteSettings): SettingsFormState {
  return {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    footerText: settings.footerText,
    icp: settings.icp ?? '',
    contactEmail: settings.contactEmail,
    enableStarfield: settings.enableStarfield,
    starDensity: settings.starDensity,
  };
}

const DENSITY_OPTIONS: { value: StarDensity; label: string; hint: string }[] = [
  { value: 'auto', label: '自动', hint: '按视口面积计算，移动端自动减少' },
  { value: 'low', label: '低', hint: '粒子更稀疏，性能优先' },
  { value: 'high', label: '高', hint: '粒子更密集，视觉更丰富' },
];

/**
 * 站点设置：站点名、描述、页脚文案、备案信息、联系邮箱与星空背景。
 * 保存后立即写入 store，前台导航品牌、页脚与星空密度会同步更新。
 */
export function SettingsPage(): ReactElement {
  const settings = useContentStore((state) => state.settings);
  const saveSettings = useContentStore((state) => state.saveSettings);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<SettingsFormState | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // store 中的数据变化（首次加载 / 保存成功）后同步到表单
  useEffect(() => {
    if (settings) {
      setForm(toFormState(settings));
    }
  }, [settings]);

  const updateForm = useCallback((patch: Partial<SettingsFormState>): void => {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!form || isSaving) {
      return;
    }

    const candidate: SiteSettingsInput = {
      siteName: form.siteName,
      siteDescription: form.siteDescription,
      footerText: form.footerText,
      contactEmail: form.contactEmail,
      enableStarfield: form.enableStarfield,
      starDensity: form.starDensity,
      // 备案信息留空时写入 undefined，前台按「未填写」处理
      icp: form.icp.trim() || undefined,
    };

    const parsed = settingsSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(zodErrorsToMap(parsed.error));
      toastError('请检查表单中的错误项');
      return;
    }

    setIsSaving(true);
    try {
      // 先写入 store，前台订阅同一份数据，无需刷新即可生效
      await saveSettings(parsed.data);
      setErrors({});
      success('站点设置已保存，前台已同步');
    } catch (error) {
      console.error('[SettingsPage] 保存站点设置失败', error);
      toastError(error instanceof ApiError ? error.message : '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  if (!form) {
    return <p className="text-sm text-content-muted">站点设置暂时不可用，请刷新页面重试。</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">站点设置</h2>
        <p className="mt-1 text-sm text-content-muted">
          影响前台导航品牌、页脚、SEO 描述与星空背景，保存后立即生效。
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface/60 p-5">
        <h2 className="text-[1rem] font-semibold text-content">基础信息</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="站点名称" error={errors.siteName} required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={form.siteName}
                onChange={(event) => updateForm({ siteName: event.target.value })}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="如 段博的个人网站"
              />
            )}
          </FormField>

          <FormField label="联系邮箱" error={errors.contactEmail} required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                type="email"
                value={form.contactEmail}
                onChange={(event) => updateForm({ contactEmail: event.target.value })}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="you@example.com"
              />
            )}
          </FormField>

          <FormField
            label="站点描述"
            error={errors.siteDescription}
            hint="写入 meta description，最多 160 字。"
            required
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <Textarea
                id={id}
                rows={3}
                value={form.siteDescription}
                onChange={(event) => updateForm({ siteDescription: event.target.value })}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="一句话说明这个站点展示什么内容"
              />
            )}
          </FormField>

          <FormField
            label="页脚文案"
            error={errors.footerText}
            hint="展示在页脚站点名下方，最多 120 字。"
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={form.footerText}
                onChange={(event) => updateForm({ footerText: event.target.value })}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="用 React、TypeScript 与一点星光搭建。"
              />
            )}
          </FormField>

          <FormField
            label="备案信息"
            error={errors.icp}
            hint="可留空；填写后展示在页脚版权行。"
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={form.icp}
                onChange={(event) => updateForm({ icp: event.target.value })}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="如 沪ICP备00000000号"
              />
            )}
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[1rem] font-semibold text-content">
              <Sparkles size={16} className="text-accent" aria-hidden="true" />
              星空背景
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              全屏 Canvas 粒子背景；系统开启「减少动态效果」时会自动降级为静态。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-content-muted">
              {form.enableStarfield ? '已开启' : '已关闭'}
            </span>
            <Switch
              checked={form.enableStarfield}
              ariaLabel="启用星空背景"
              onChange={(enableStarfield) => updateForm({ enableStarfield })}
            />
          </div>
        </div>

        <div className="mt-5">
          <FormField label="粒子密度" error={errors.starDensity}>
            {({ id, describedBy, hasError }) => (
              <>
                <Select
                  id={id}
                  value={form.starDensity}
                  disabled={!form.enableStarfield}
                  onChange={(event) =>
                    updateForm({ starDensity: event.target.value as StarDensity })
                  }
                  hasError={hasError}
                  aria-describedby={describedBy}
                >
                  {DENSITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} — {option.hint}
                    </option>
                  ))}
                </Select>
                <p className="mt-2 text-xs text-content-muted">
                  移动端粒子数固定降至 40%，并关闭鼠标视差。
                </p>
              </>
            )}
          </FormField>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur">
        <Button type="submit" isLoading={isSaving}>
          <Save size={15} aria-hidden="true" />
          保存设置
        </Button>
      </div>
    </form>
  );
}
