import styled from '@emotion/styled';

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #FFF;
  border-top: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  border-radius: 6px;
`;

export const TableHead = styled.thead`
  position: sticky;
  top: 10px;
  z-index: 10;
  background-color: inherit;
`;

export const TableRow = styled.tr`
  background-color: inherit;
  &:hover {
    background-color: #f9f9f9;
  }
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
    ${({ sorted }) => (sorted ? 'visibility: visible' : 'visibility: hidden')}
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
      transition: background-color .3s;
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
  
  .MuiRadio-root{
    padding: 0;
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
