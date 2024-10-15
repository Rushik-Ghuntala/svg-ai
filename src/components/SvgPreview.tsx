"use client";

import React from "react";

export default function SvgPreview({ code }: { code: string }) {
  return (
    <div className="p-4 rounded-md text-left">
      <div
        className="svg-preview"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </div>
  );
}
