import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import styled from '@emotion/styled';
import { FC, useState, MouseEvent, useEffect } from 'react';
import { ButtonShortcut } from '@components/kit';
import { Box, ClickAwayListener, Popper, Typography } from '@mui/material';

export type TagSelectProps = {
  tags: Tag[],
  onClick?: () => void;
  onChange?: (tag: Tag) => void;
}

export type Tag = {
  label: string;
  value: string;
  description: string;
}

const TagSelectContainer = styled.button({
  height: '100%',
  display: 'flex',
  padding: '10px',
  outline: 'none',
  border: 'none',
  alignItems: 'center',
  borderRight: '1px solid #e0e0e0',
  borderTopLeftRadius: '7px',
  borderBottomLeftRadius: '7px',
  backgroundColor: 'transparent',
  boxSizing: 'border-box',

  '&:hover': {
    backgroundColor: '#e9e9e9'
  },
  '&:focus': {
    backgroundColor: '#e9e9e9'
  }
});

const StyledPopper = styled(Popper)({
  zIndex: 100
});

const PopperContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FFF',
  boxShadow: 'rgb(0 0 0 / 20%) 0px 2px 4px -1px, rgb(0 0 0 / 14%) 0px 4px 5px 0px, rgb(0 0 0 / 12%) 0px 1px 10px 0px',
  borderRadius: '7px',
  overflow: 'hidden'
});

const PopperItem = styled.button({
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  border: 'none',
  gap: '10px',
  padding: '10px',
  backgroundColor: '#FFF',
  '&:not(:last-child)': {
    borderBottom: '1px solid #dbdbdb'
  },
  '&:hover': {
    backgroundColor: '#f0f0f0'
  }
});

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 5]
    }
  }
];

const TagSelect: FC<TagSelectProps> = ({
  tags,
  onClick,
  onChange
}) => {
  const [state, setState] = useState<Tag>(tags[0]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (onChange) {
      onChange(state);
    }
  }, [state]);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    if (onClick) {
      onClick();
    }
    event.stopPropagation();
  };
  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (tag: Tag) => {
    setAnchorEl(null);
    setState(tag);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <>
      <TagSelectContainer onClick={handleClick}>
        <ButtonShortcut variant="flat" color="white" text={state.label} />
        <ArrowDropDownRoundedIcon sx={{
          color: '#9b9b9b'
        }} />
      </TagSelectContainer>
      <ClickAwayListener onClickAway={handleClickAway}>
        <StyledPopper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          modifiers={modifiers}>
          <PopperContainer>
            {tags.map((tag, index) => (
              <PopperItem key={index} onClick={() => handleItemClick(tag)}>
                <ButtonShortcut variant="flat" color="white" text={tag.label} />
                <Typography color="textSecondary" variant="body2">{tag.description}</Typography>
              </PopperItem>
            ))}
          </PopperContainer>
        </StyledPopper>
      </ClickAwayListener>
    </>
  );
};

export default TagSelect;
