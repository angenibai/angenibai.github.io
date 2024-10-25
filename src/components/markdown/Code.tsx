import { ComponentPropsWithoutRef } from "react";
import { ReactMarkdownProps } from "react-markdown/lib/complex-types";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
import prism from "react-syntax-highlighter/dist/cjs/styles/prism/prism";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import html from "react-syntax-highlighter/dist/cjs/languages/prism/markup";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import styles from "@/styles/components/Code.module.css";

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

  return !inline && match ? (
    <SyntaxHighlighter
      style={prism}
      language={match[1]}
      PreTag="div"
      className={className}
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default Code;
