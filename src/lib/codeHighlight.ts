import React from "react";

export function highlightCode(code: string): React.ReactNode {
  const styles: Array<{ regex: RegExp; className: string }> = [
    { regex: new RegExp("//.*$", "gm"), className: "text-[#6b7280] italic" },
    { regex: new RegExp("(['\"`])(?:(?!\\1|\\\\).|\\\\.)*?\\1", "g"), className: "text-[#fbbf24]" },
    { regex: new RegExp("\\b(import|from|export|async|await|function|const|let|var|return|if|else|while|for|of|new|class|true|false|null|undefined)\\b", "g"), className: "text-[#818cf8]" },
    { regex: new RegExp("\\b(\\d+)\\b", "g"), className: "text-[#f472b6]" },
    { regex: new RegExp("//.*$", "gm"), className: "text-[#6b7280]" },
  ];

  const lines = code.split("\n");
  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];

    const matchedSpans: Array<{ start: number; end: number; className: string }> = [];
    for (const style of styles) {
      let match: RegExpExecArray | null;
      const regex = new RegExp(style.regex.source, "g");
      while ((match = regex.exec(line)) !== null) {
        matchedSpans.push({
          start: match.index,
          end: match.index + match[0].length,
          className: style.className,
        });
      }
    }

    matchedSpans.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    for (const span of matchedSpans) {
      if (span.start < lastIndex) continue;
      if (span.start > lastIndex) {
        parts.push(
          React.createElement("span", { key: `${lineIdx}-${lastIndex}` }, line.slice(lastIndex, span.start)),
        );
      }
      parts.push(
        React.createElement("span", { key: `${lineIdx}-${span.start}`, className: span.className }, line.slice(span.start, span.end)),
      );
      lastIndex = span.end;
    }
    if (lastIndex < line.length) {
      parts.push(
        React.createElement("span", { key: `${lineIdx}-${lastIndex}` }, line.slice(lastIndex)),
      );
    }

    return React.createElement(
      "div",
      { key: lineIdx, className: "flex" },
      React.createElement("span", { className: "text-[#4b5563] w-8 text-right select-none mr-4 flex-shrink-0" }, lineIdx + 1),
      React.createElement("span", null, parts.length > 0 ? parts : line || " "),
    );
  });
}