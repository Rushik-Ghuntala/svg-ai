"use client";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function CodeViewer({
  code,
}: {
  code: string;
}) {
  return (
    <div className="p-4 rounded-md bg-gray-900 text-left">
      <SyntaxHighlighter 
        language="typescript" 
        style={dracula} 
        showLineNumbers 
        customStyle={{ textAlign: "left" }} // Ensure the text is aligned left
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
