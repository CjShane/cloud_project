export type HighlightNote = {
  id: string;
  bookId: string;
  chapter: number;
  translation: string;
  startVerse: number;
  endVerse: number;
  startOffset: number;
  endOffset: number;
  text: string;
  note: string;
  createdAt: number;
  updatedAt: number;
};

export type ReaderProgress = {
  bookId: string;
  chapter: number;
  translation: string;
};
