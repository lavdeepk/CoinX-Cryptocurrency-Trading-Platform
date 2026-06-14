import React, { memo } from "react";

// ─── Regex patterns ────────────────────────────────────────────────────────────
const INLINE_TOKEN_REGEX =
  /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*\n]+)\*)/g;

// ─── Inline markdown renderer ──────────────────────────────────────────────────
const renderInlineMarkdown = (text, keyPrefix) => {
  const parts = [];
  let lastIndex = 0;
  let matchIndex = 0;
  let match;

  while ((match = INLINE_TOKEN_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // [link text](url)
      parts.push(
        <a
          key={`${keyPrefix}-link-${matchIndex}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-[#8bc2ff] underline decoration-[#5f89bb] underline-offset-2 hover:text-[#b1d8ff]"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      // **bold**
      parts.push(
        <strong key={`${keyPrefix}-strong-${matchIndex}`} className="font-semibold text-slate-50">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // `inline code`
      parts.push(
        <code
          key={`${keyPrefix}-code-${matchIndex}`}
          className="rounded bg-[#0c1626] px-1 py-0.5 font-mono text-[12px] text-[#b6f3d0]"
        >
          {match[5]}
        </code>
      );
    } else if (match[6]) {
      // *italic*
      parts.push(
        <em key={`${keyPrefix}-em-${matchIndex}`} className="italic text-slate-200">
          {match[6]}
        </em>
      );
    }

    lastIndex = INLINE_TOKEN_REGEX.lastIndex;
    matchIndex += 1;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  INLINE_TOKEN_REGEX.lastIndex = 0;
  return parts.length ? parts : text;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const MarkdownMessage = ({ text }) => {
  const content = text || "";
  const lines = content.split("\n");

  const elements = [];
  let listItems = [];
  let orderedItems = [];
  let codeLines = [];
  let inCodeBlock = false;

  const flushUnorderedList = (index) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5 text-slate-100">
        {listItems.map((item, i) => (
          <li key={`ul-item-${index}-${i}`}>{renderInlineMarkdown(item, `ul-li-${index}-${i}`)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushOrderedList = (index) => {
    if (!orderedItems.length) return;
    elements.push(
      <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-5 text-slate-100">
        {orderedItems.map((item, i) => (
          <li key={`ol-item-${index}-${i}`}>{renderInlineMarkdown(item, `ol-li-${index}-${i}`)}</li>
        ))}
      </ol>
    );
    orderedItems = [];
  };

  const flushCodeBlock = (index) => {
    if (!codeLines.length) return;
    elements.push(
      <pre
        key={`code-${index}`}
        className="overflow-x-auto rounded-xl border border-[#2a3d59] bg-[#0f1a2c] p-3 text-xs leading-relaxed text-[#b8d9ff]"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  };

  const flushAll = (index) => {
    flushUnorderedList(index);
    flushOrderedList(index);
    flushCodeBlock(index);
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine ?? "";

    // ── Code fences ──────────────────────────────────────────────────────────
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock(index);
      } else {
        flushUnorderedList(index);
        flushOrderedList(index);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // ── Horizontal rule ──────────────────────────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      flushAll(index);
      elements.push(
        <hr key={`hr-${index}`} className="border-slate-700 my-1" />
      );
      return;
    }

    // ── Blockquote ───────────────────────────────────────────────────────────
    if (/^>\s/.test(line)) {
      flushAll(index);
      const quoteText = line.replace(/^>\s*/, "");
      elements.push(
        <blockquote
          key={`bq-${index}`}
          className="border-l-2 border-slate-500 pl-3 italic text-slate-400"
        >
          {renderInlineMarkdown(quoteText, `bq-${index}`)}
        </blockquote>
      );
      return;
    }

    // ── Unordered list ───────────────────────────────────────────────────────
    if (/^\s*[-*]\s+/.test(line)) {
      flushOrderedList(index);
      listItems.push(line.replace(/^\s*[-*]\s+/, ""));
      return;
    }

    // ── Ordered list ─────────────────────────────────────────────────────────
    const orderedMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      flushUnorderedList(index);
      orderedItems.push(orderedMatch[2]);
      return;
    }

    flushAll(index);

    // ── Blank line ───────────────────────────────────────────────────────────
    if (!line.trim()) {
      elements.push(<div key={`spacer-${index}`} className="h-1" />);
      return;
    }

    // ── Headings ─────────────────────────────────────────────────────────────
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-sm font-semibold text-slate-50">
          {renderInlineMarkdown(line.slice(4), `h3-${index}`)}
        </h3>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-sm font-semibold text-slate-50">
          {renderInlineMarkdown(line.slice(3), `h2-${index}`)}
        </h2>
      );
      return;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-base font-semibold text-slate-50">
          {renderInlineMarkdown(line.slice(2), `h1-${index}`)}
        </h1>
      );
      return;
    }

    // ── Regular paragraph ────────────────────────────────────────────────────
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed text-slate-100">
        {renderInlineMarkdown(line, `p-${index}`)}
      </p>
    );
  });

  flushAll("end");

  return <div className="space-y-2">{elements}</div>;
};

export default memo(MarkdownMessage);
