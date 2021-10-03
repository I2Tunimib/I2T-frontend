import {
  IconButton, IconButtonProps,
  SvgIconTypeMap, Tooltip
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { FC } from 'react';

interface IconButtonTooltipProps extends IconButtonProps {
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  tooltipText: string;
}

/**
 * Icon button with tooltip text. The tooltip is shown even if the button is disabled.
 */
const IconButtonTooltip: FC<IconButtonTooltipProps> = ({
  Icon,
  tooltipText,
  ...buttonProps
}) => {
  return (
    <Tooltip title={tooltipText} arrow>
      {/* Add div element so that tooltip shows even when button is disabled */}
      <div>
        <IconButton {...buttonProps} size="small">
          <Icon />
        </IconButton>
      </div>
    </Tooltip>
  );
};

export default IconButtonTooltip;
