// 一次性脚本：生成 public/resume.pdf 的占位简历，保证 Hero「下载简历」CTA 可用。
// 运行：node scripts/make-resume.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const lines = [
  ['F1', 24, 'Zhang San'],
  ['F1', 12, 'Frontend Engineer'],
  ['F1', 11, ''],
  ['F1', 11, 'Email: zhangsan@example.com'],
  ['F1', 11, 'Location: Shanghai, China'],
  ['F1', 11, 'Website: https://example.com'],
  ['F1', 11, ''],
  ['F1', 14, 'Experience'],
  ['F1', 11, 'Nebula Tech - Senior Frontend Engineer (2023.06 - Present)'],
  ['F1', 11, 'Blue Whale Network - Frontend Engineer (2020.07 - 2023.05)'],
  ['F1', 11, ''],
  ['F1', 14, 'Education'],
  ['F1', 11, 'Tongji University - Software Engineering (2016.09 - 2020.06)'],
  ['F1', 11, ''],
  ['F1', 9, 'This is a placeholder resume generated for the portfolio demo.'],
];

let commands = 'BT\n/F1 24 Tf\n72 770 Td\n';
let first = true;
for (const [font, size, text] of lines) {
  commands += first ? '' : '0 -24 Td\n';
  commands += `/${font} ${size} Tf\n(${text.replace(/([()\\])/g, '\\$1')}) Tj\n`;
  first = false;
}
commands += 'ET\n';

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(commands, 'latin1')} >>\nstream\n${commands}endstream`,
];

const header = '%PDF-1.4\n';
let body = '';
const offsets = [0];
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(header + body, 'latin1'));
  body += `${index + 1} 0 obj\n${object}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(header + body, 'latin1');
let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let index = 1; index <= objects.length; index += 1) {
  xref += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
}
const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

const target = resolve(process.cwd(), 'public/resume.pdf');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, Buffer.from(header + body + xref + trailer, 'latin1'));
console.log(`wrote ${target}`);
