const CJK_PATTERN = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g;
const LATIN_WORD_PATTERN = /[A-Za-z0-9]+/g;

/** 中文阅读速度（字/分钟）；取常见技术文章的中位值 */
const CJK_CHARS_PER_MINUTE = 350;
/** 英文阅读速度（词/分钟） */
const LATIN_WORDS_PER_MINUTE = 200;

/** 去掉 Markdown 结构符号与代码块，避免把语法字符计入字数 */
function toPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|]/g, ' ');
}

/**
 * 估算阅读时长（分钟，向上取整，最小 1）。
 * 中英文混排时分别按各自速度累加，代码块不计入正文。
 */
export function estimateReadingTime(content: string): number {
  if (!content.trim()) {
    return 1;
  }

  const plain = toPlainText(content);
  const cjkCount = (plain.match(CJK_PATTERN) ?? []).length;
  const latinCount = (plain.replace(CJK_PATTERN, ' ').match(LATIN_WORD_PATTERN) ?? []).length;

  const minutes = cjkCount / CJK_CHARS_PER_MINUTE + latinCount / LATIN_WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(minutes));
}
