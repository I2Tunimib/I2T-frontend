const timeAgoFormatter = (
  value: number,
  _unit: string,
  suffix: string,
): string => {
  if (_unit === 'second' && value < 60) {
    return 'Last change: just now';
  }
  const unit = value !== 1 ? `${_unit}s` : _unit;

  return `Last change: ${value} ${unit} ${suffix}`;
};

export default timeAgoFormatter;
