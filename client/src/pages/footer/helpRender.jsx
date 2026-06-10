import { Fragment } from 'react';
import { Link } from 'react-router-dom';

const TOKEN = /\[([^\]]+)\]\((article|route):([^)]+)\)|\*\*([^*]+)\*\*/g;
const LIST_ITEM = /^(?:- |\d+\.\s+)/;

function renderInline(text, onSelectArticle, keyPrefix = '') {
  const parts = [];
  let lastIndex = 0;
  let i = 0;
  let match;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, linkText, kind, target, boldText] = match;
    if (boldText) {
      parts.push(
        <strong
          key={`${keyPrefix}b${i++}`}
          style={{ color: 'var(--bridge-text)', fontWeight: 600 }}
        >
          {boldText}
        </strong>,
      );
    } else if (kind === 'article') {
      parts.push(
        <button
          key={`${keyPrefix}a${i++}`}
          type="button"
          onClick={() => onSelectArticle(target)}
          className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
          style={{ color: 'var(--color-primary)' }}
        >
          {linkText}
        </button>,
      );
    } else {
      parts.push(
        <Link
          key={`${keyPrefix}r${i++}`}
          to={target}
          className="font-semibold underline underline-offset-4 transition hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          {linkText}
        </Link>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.map((p, idx) =>
    typeof p === 'string' ? <Fragment key={`${keyPrefix}t${idx}`}>{p}</Fragment> : p,
  );
}

function stripListMarker(line) {
  return line.replace(/^- /, '').replace(/^\d+\.\s+/, '');
}

// Group consecutive list-item lines into runs. Plain lines remain plain.
function groupBlock(lines) {
  const groups = [];
  let buffer = null;
  for (const line of lines) {
    if (LIST_ITEM.test(line)) {
      if (!buffer || buffer.type !== 'list') {
        buffer = { type: 'list', items: [] };
        groups.push(buffer);
      }
      buffer.items.push(stripListMarker(line));
    } else {
      if (!buffer || buffer.type !== 'text') {
        buffer = { type: 'text', lines: [] };
        groups.push(buffer);
      }
      buffer.lines.push(line);
    }
  }
  return groups;
}

export function renderArticleBody(body, onSelectArticle) {
  return body.split('\n\n').map((block, bi) => {
    const lines = block.split('\n');
    const groups = groupBlock(lines);
    return (
      <div key={bi} className="space-y-3">
        {groups.map((g, gi) => {
          if (g.type === 'list') {
            return (
              <ul key={gi} className="space-y-1.5">
                {g.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
                    />
                    <span>{renderInline(item, onSelectArticle, `${bi}-${gi}-${ii}-`)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={gi}>
              {g.lines.map((line, li) => (
                <Fragment key={li}>
                  {li > 0 && <br />}
                  {renderInline(line, onSelectArticle, `${bi}-${gi}-${li}-`)}
                </Fragment>
              ))}
            </p>
          );
        })}
      </div>
    );
  });
}
