// import { SelectionIndexes } from "./Editor.types";

// type SelectionHighlightProps = {
//   forceDisable: boolean;
//   selection: SelectionIndexes;
//   rowsLastSelectionIndex: number[];
//   textRows: string[];
//   selectionStartRowIndex: number,
//   selectionEndRowIndex: number,
// }

// const SelectionHighlight = ({
//   forceDisable,
//   selection,
//   rowsLastSelectionIndex,
//   textRows,
//   selectionStartRowIndex,
//   selectionEndRowIndex,
// }: SelectionHighlightProps) => {

//   if (forceDisable) {
//     return null
//   }

//   if (selection.start === selection.end) {
//     return null;
//   }

//   const getRowSelectionIndexByBodySelectionIndex = (bodySelectionIndex: number, rowIndex: number) => {
//     const prevRowLastBodyIndex = rowsLastSelectionIndex[rowIndex - 1];

//     if (!prevRowLastBodyIndex) {
//       return bodySelectionIndex;
//     }

//     return bodySelectionIndex - prevRowLastBodyIndex - 1;
//   };

//   const selectionStartRowCharacterIndex = getRowSelectionIndexByBodySelectionIndex(selection.start, selectionStartRowIndex);
//   const selectionEndRowCharacterIndex = getRowSelectionIndexByBodySelectionIndex(selection.end, selectionEndRowIndex);

//   /**
//    * Build hightlight render data array.
//    */
//   const selectionHighlightRowData = documentFile.rows.map((row, i) => {
//     if (i < selectionStartRowIndex) {
//       return {
//         width: 0,
//         left: 0,
//         rowMaxHeight: getRenderDimensionsForRow(row, 0, row.length).maxHeightPx,
//       };
//     } else if (i > selectionEndRowIndex) {
//       return null;
//     }

//     const isFirst = i === selectionStartRowIndex;
//     const isLast = i === selectionEndRowIndex;

//     const highlightStartIndex = isFirst ? selectionStartRowCharacterIndex : 0;
//     const highlightEndIndex = isLast ? selectionEndRowCharacterIndex : textRows[i].length;

//     const highlightContentDimesions = getRenderDimensionsForRow(
//       row,
//       highlightStartIndex,
//       highlightEndIndex,
//     );

//     const beforeHighlightContentDimesions = getRenderDimensionsForRow(
//       row,
//       0,
//       highlightStartIndex,
//     );

//     return {
//       left: beforeHighlightContentDimesions.widthPx,
//       width: highlightContentDimesions.widthPx,
//       rowMaxHeight: Math.max(beforeHighlightContentDimesions.maxHeightPx, highlightContentDimesions.maxHeightPx),
//     };
//   }).filter((renderData): renderData is {left: number, width: number, rowMaxHeight: number} => renderData !== null);

//   let prevRowsTotalHeight = 0;
//   return selectionHighlightRowData.map((data, i) => {
//     const result = (
//       <div
//         key={i}
//         className={styles.selectionHighlight}
//         style={{
//           width: `${data.width}px`,
//           left: `${data.left}px`,
//           height: `${data.rowMaxHeight}px`,
//           top: `${prevRowsTotalHeight}px`,
//           position: 'absolute',
//         }}
//       ></div>
//     );

//     prevRowsTotalHeight += data.rowMaxHeight;

//     return result;
//   }
//   );
// };
