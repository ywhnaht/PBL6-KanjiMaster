import React from "react";
import WordResult from "../WordResult";
import KanjiResult from "../KanjiResult";

export default function SearchResult({
  type,
  // eslint-disable-next-line no-unused-vars
  query,
  wordData,
  kanjiData,
  examples = [],
  compounds = [],
  relatedResults = [],
}) {
  return (
    <div className="w-full">
      {type === "word" ? (
        <WordResult {...wordData} />
      ) : (
        <KanjiResult
          kanjis={kanjiData}
          examples={examples}
          compounds={compounds}
          relatedResults={relatedResults}
        />
      )}
    </div>
  );
}
