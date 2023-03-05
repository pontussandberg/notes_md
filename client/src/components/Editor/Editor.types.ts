export type DocumentFileRowSectionStyles = {
  fontSize: number;
  fontFamily: string;
  fontStyle: 'normal' | 'bold' | 'italic';
}

export type DocumentFileRowRenderData = DocumentFileRowSectionStyles & {
  content: string;
};

export type DocumentFile = {
  rows: DocumentFileRowRenderData[][];
}
