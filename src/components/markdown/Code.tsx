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
const cream = "#FAF8F0";
const literalGreen = "#9FD3BA";
// Opacities are the lowest that keep 4.5:1 against the panel (see the design doc).
const punctuationCream = "rgba(250, 248, 240, 0.65)";
const commentCream = "rgba(250, 248, 240, 0.6)";

const codeTheme = {
  'code[class*="language-"]': {
    color: cream,
    fontFamily: "var(--font-mono)",
    fontSize: "1em",
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
    color: cream,
    fontFamily: "var(--font-mono)",
    // The figure inherits 1.1rem (17.6px) from the post body, so this is 13.5px.
    fontSize: "0.767em",
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
  variable: { color: cream },
  function: { color: cream },
  "class-name": { color: cream },
  keyword: { color: cream, fontWeight: 600 },
  atrule: { color: cream, fontWeight: 600 },
  string: { color: literalGreen },
  char: { color: literalGreen },
  "attr-value": { color: literalGreen },
  number: { color: literalGreen },
  boolean: { color: literalGreen },
  constant: { color: literalGreen },
  punctuation: { color: punctuationCream },
  operator: { color: punctuationCream },
  comment: { color: commentCream },
  prolog: { color: commentCream },
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
  const language = match?.[1];

  // The figcaption names the figure, so screen readers announce the language
  // before the code. The language is uppercased in CSS so it's read as a word.
  return !inline ? (
    <figure className={styles.codeBlockWrapper}>
      <figcaption className={styles.caption}>
        <span className={styles.captionSymbol} aria-hidden="true">
          {"</>"}
        </span>
        {language && <span>{language}</span>}
      </figcaption>
      <SyntaxHighlighter
        style={codeTheme as any}
        language={language ?? "text"}
        PreTag="pre"
        tabIndex={0}
        className={`${styles.codeBlock} ${className || ""}`}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </figure>
  ) : (
    <code className={`${styles.inlineCode} ${className || ""}`} {...props}>
      {children}
    </code>
  );
};

export default Code;
