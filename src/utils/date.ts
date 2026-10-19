import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 全站中文日期展示：月份简写、星期等均跟随该 locale
dayjs.locale('zh-cn');

export const DATE_FORMAT = 'YYYY-MM-DD';
export const MONTH_FORMAT = 'YYYY-MM';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

/** 把 ISO 字符串或 Date 格式化为模板字符串；非法值返回空串，避免渲染出 Invalid Date */
export function formatDate(
  value: string | Date | null | undefined,
  template: string = DATE_FORMAT,
): string {
  if (!value) {
    return '';
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(template) : '';
}

/** 格式化到月，用于「2024-03」这类经历 / 项目起止时间 */
export function formatMonth(value: string | Date | null | undefined): string {
  return formatDate(value, MONTH_FORMAT);
}

/** 格式化到分钟，用于后台列表的更新时间 */
export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, DATE_TIME_FORMAT);
}

/** 起止区间文案：结束时间为空时显示「至今」 */
export function formatMonthRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const start = formatMonth(startDate);
  if (!start) {
    return '';
  }
  return `${start} - ${endDate ? formatMonth(endDate) : '至今'}`;
}

/** 判断 ISO 时间是否已过期；无法解析的时间按已过期处理，避免放行损坏 token */
export function isExpired(isoDate: string): boolean {
  const timestamp = Date.parse(isoDate);
  return Number.isNaN(timestamp) || timestamp <= Date.now();
}

/** 当前月份的 "YYYY-MM" 字符串，用于新建项目 / 经历时预填起始时间 */
export function currentMonth(): string {
  return dayjs().format(MONTH_FORMAT);
}

/**
 * ISO 时间 → `<input type="datetime-local">` 需要的本地时间格式。
 * 必须按本地时区格式化，直接截取 toISOString 会偏移时区。
 */
export function toDateTimeLocal(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : '';
}

/** `<input type="datetime-local">` 的本地时间 → ISO 字符串；非法值回退当前时间 */
export function fromDateTimeLocal(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate().toISOString() : new Date().toISOString();
}
