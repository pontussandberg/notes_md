
export type DocumentFileRowSectionStyles = {
  fontFamily: string;
  fontStyle: 'normal' | 'bold' | 'italic';
  fontSize: number;
  letterSpacing: number;
}

export type DocumentFileRowRenderData = {
  style: DocumentFileRowSectionStyles;
  content: string;
};

export type DocumentFile = {
  rows: DocumentFileRowRenderData[][];
}
