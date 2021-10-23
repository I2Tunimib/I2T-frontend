import {
  ButtonGroup, Popper, Grow,
  ClickAwayListener, MenuList,
  MenuItem, Button, Paper,
  ButtonGroupProps
} from '@mui/material';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import {
  FC, useState,
  useRef, MouseEvent, HTMLAttributes
} from 'react';

interface SplitButtonProps {
  prefix: string;
  options: any[];
  disabled: boolean;
  handleClick: (option: string) => void;
}

const SplitButton: FC<SplitButtonProps> = ({
  prefix,
  options,
  disabled,
  handleClick
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // const handleClick = () => {
  //   console.info(`You clicked ${options[selectedIndex]}`);
  // };

  const handleMenuItemClick = (
    event: MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current
      && anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        size="small"
        variant="contained"
        disabled={disabled}
        sx={{
          boxShadow: 'none'
        }}
        ref={anchorRef}>
        <Button
          sx={{
            textTransform: 'none'
          }}
          onClick={() => handleClick(options[selectedIndex])}>
          {`${prefix} ${options[selectedIndex]}`}
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}>
          <ArrowDropDownRoundedIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'sameWidth',
            enabled: true,
            fn: ({ state }) => {
              state.styles.popper.width = `${state.rects.reference.width}px`;
            },
            phase: 'beforeWrite',
            requires: ['computeStyles']
          }
        ]}
        style={{
          zIndex: 10
        }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom'
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}>
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default SplitButton;
