import { ComponentPropsWithoutRef } from "react";
import { ReactMarkdownProps } from "react-markdown/lib/complex-types";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import html from "react-syntax-highlighter/dist/cjs/languages/prism/markup";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import styles from "@/styles/components/Code.module.css";

// Hand-authored replacement for react-syntax-highlighter's stock `prism` theme.
// The `style` object is applied as inline styles on the rendered elements, so
// panel background/border-radius/etc still live in Code.module.css, but
// anything token-level or structural (color, font, white-space) must be set
// here — a CSS class can never win against these inline styles.
const codeTheme = {
  'code[class*="language-"]': {
    color: "#FAF8F0",
    fontFamily: "var(--font-mono)",
    fontSize: "0.85em",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    lineHeight: "1.5",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#FAF8F0",
    fontFamily: "var(--font-mono)",
    fontSize: "0.85em",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    lineHeight: "1.5",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
  },
  variable: { color: "#FAF8F0" },
  punctuation: { color: "#D9D2C4" },
  operator: { color: "#D9D2C4" },
  comment: { color: "#79A08F" },
  prolog: { color: "#79A08F" },
  keyword: { color: "#EEC767" },
  atrule: { color: "#EEC767" },
  string: { color: "#D9B8CE" },
  char: { color: "#D9B8CE" },
  "attr-value": { color: "#D9B8CE" },
  function: { color: "#8FCDB0" },
  "class-name": { color: "#8FCDB0" },
  number: { color: "#E08E6D" },
  boolean: { color: "#E08E6D" },
  constant: { color: "#E08E6D" },
};

SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("html", html);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("javascript", javascript);

type CodeProps = ComponentPropsWithoutRef<"code"> &
  ReactMarkdownProps & {
    inline?: boolean;
  };

const Code = ({ inline, className, children, ...props }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || "");

  return !inline ? (
    <div className={styles.codeBlockWrapper}>
      <SyntaxHighlighter
        style={codeTheme as any}
        language={match?.[1] ?? "text"}
        PreTag="pre"
        tabIndex={0}
        className={`${styles.codeBlock} ${className || ""}`}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={`${styles.inlineCode} ${className || ""}`} {...props}>
      {children}
    </code>
  );
};

export default Code;
