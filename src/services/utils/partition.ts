type PartitionOutput<T> = {
  filterTrue: T[];
  filterFalse: T[];
}

const partition = <T>(items: T[], predicateFn: (item: T) => boolean): PartitionOutput<T> => {
  return items.reduce((acc, item) => {
    if (predicateFn(item)) {
      acc.filterTrue.push(item);
    } else {
      acc.filterFalse.push(item);
    }
    return acc;
  }, { filterTrue: [], filterFalse: [] } as PartitionOutput<T>);
};

export default partition;
