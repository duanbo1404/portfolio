import type { ReactElement } from 'react';
import { Download, MapPin } from 'lucide-react';
import { buttonStyles } from '@/components/common/Button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ContactForm } from '@/components/public/ContactForm';
import { CopyEmailButton } from '@/components/public/CopyEmailButton';
import { SocialLinks } from '@/components/public/SocialLinks';
import { useInView } from '@/hooks/useInView';
import type { Profile, SiteSettings } from '@/types';
import { cn } from '@/utils/cn';
import { DEFAULT_RESUME_URL } from '@/utils/constants';

interface ContactSectionProps {
  profile: Profile;
  settings: SiteSettings;
}

/** 联系区：邮箱复制 + 社交图标 + 简历下载 + 留言表单 */
export function ContactSection({ profile, settings }: ContactSectionProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>();
  const email = profile.email || settings.contactEmail;
  const resumeUrl = profile.resumeUrl || DEFAULT_RESUME_URL;

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-title"
      className="border-t border-line/60 py-16 sm:py-20 md:py-24"
    >
      <div
        className={cn(
          'container-page transition-all duration-500 ease-smooth motion-reduce:transition-none',
          inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <SectionHeading
          id="contact-title"
          eyebrow="Contact"
          title="聊一聊"
          description="有合适的机会或想一起做点东西，欢迎直接发邮件，也可以留下你的联系方式。"
        />

        <div className="mt-10 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
          <div className="min-w-0 space-y-6">
            <div>
              <p className="text-sm font-medium text-content-muted">邮箱</p>
              <CopyEmailButton email={email} className="mt-2 w-full sm:w-auto" />
            </div>

            <div>
              <p className="text-sm font-medium text-content-muted">社交</p>
              <SocialLinks socials={profile.socials} className="mt-2" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-content-muted">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} aria-hidden="true" />
                  {profile.location}
                </span>
              )}
              <a
                href={resumeUrl}
                download
                className="inline-flex items-center gap-1.5 text-accent transition-colors duration-150 hover:text-primary"
              >
                <Download size={14} aria-hidden="true" />
                下载简历
              </a>
            </div>

            <a
              href={`mailto:${email}`}
              className={buttonStyles({ variant: 'secondary', className: 'w-full sm:w-auto' })}
            >
              直接发邮件
            </a>
          </div>

          <div className="rounded-xl border border-line bg-surface/70 p-5 backdrop-blur-sm sm:p-6">
            <h3 className="text-[1rem] font-semibold text-content">给我留言</h3>
            <p className="mt-1 text-sm text-content-muted">收到后我会通过邮箱回复你。</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
