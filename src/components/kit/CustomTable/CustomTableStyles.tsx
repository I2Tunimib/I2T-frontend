import styled from "@emotion/styled";

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  border-radius: 6px;
`;

type TableHeadProps = {
  stickyHeaderTop: string;
};

export const TableHead = styled.thead<TableHeadProps>`
  position: sticky;
  top: ${({ stickyHeaderTop }) => stickyHeaderTop};
  z-index: 10;
  background-color: inherit;
`;

export const TableRow = styled.tr`
  background-color: inherit;
  &:hover {
    background-color: #f9f9f9;
  }
`;

export const TableSubRow = styled(TableRow)`
  background-color: #f9f9f9;
`;

export const TableHeaderCell = styled.th<{ sorted: boolean }>`
  position: relative;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  text-transform: capitalize;
  width: 1px;

  &:hover {
    svg {
      visibility: visible;
    }
  }

  svg {
    ${({ sorted }) => (sorted ? "visibility: visible" : "visibility: hidden")}
  }

  &:last-child {
    width: 100%;
  }

  &:not(:last-child) {
    &::before {
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 1.6em;
      background-color: #0000000f;
      transform: translateY(-50%);
      transition: background-color 0.3s;
      content: "";
    }
  }
`;

export const TableRowCell = styled.td`
  padding: 9px 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  font-size: 0.875rem;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;

  .MuiRadio-root {
    padding: 0;
  }

  /* Style for expandable row content - allows horizontal scrolling */
  &[colspan] {
    white-space: normal;
    overflow-x: auto;
    max-width: none;

    /* Make the content scrollable horizontally */
    .expanded-content {
      display: block;
      min-width: 100%;
      overflow-x: auto;
      padding-bottom: 6px;

      /* Add a subtle scrollbar style */
      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    }
  }
`;

export const TableLoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(255 255 255 / 70%);
  z-index: 999;
`;
