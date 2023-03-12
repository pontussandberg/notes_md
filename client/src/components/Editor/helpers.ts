import { DocumentFile } from "./Editor.types";


  /**
   * Document content as rows.
   */
  const getTextRows = (rows: DocumentFile['rows']) => {
    return rows.map(sections => {
      return sections.reduce((acc2, section) => acc2 + section.content, '');
    });
  };


/**
 * Get rows last index position - each row represents the last selection index of that row
 *
 * @example getRowCharCount(['a', 'bb', 'c', 'abc']); --> [1, 4, 6, 10].
 * @example getRowCharCount(['', '', 'a', 'abc', 'def']); --> [0, 1, 3, 7, 11].
 */
const rowsLastSelectionIndex = (rows: DocumentFile['rows']) => {
  const textRows = getTextRows(rows);

  const rowCharIndexes: number[] = [];
  let charCount = 0;

  for (const [i, row] of textRows.entries()) {
    const newRowAddition = 0 < i ? 1 : 0;
    charCount += row.length + newRowAddition;
    rowCharIndexes.push(charCount);
  }

  return rowCharIndexes;
};


// Binary search, find row for selectionIndex.
export const findRowIndex = (selectionIndex: number, body: string) => {
  let curr = [...rowsLastSelectionIndex()];

  while (curr.length > 1) {
    const half = Math.ceil(curr.length / 2);
    const firstHalf = curr.slice(0, half)
    const secondHalf = curr.slice(half)

    if (firstHalf[firstHalf.length - 1] >= selectionIndex) {
      curr = firstHalf;
    } else {
      curr = secondHalf;
    }
  }

  return rowsLastSelectionIndex.indexOf(curr[0]);
});