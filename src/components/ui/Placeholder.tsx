import { Fragment } from "react";

/** Renders text, marking any [placeholder] so unfinished data is easy to spot. */
export function Placeholder({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) =>
        /^\[.*\]$/.test(part) ? (
          <span key={i} className="ph">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
