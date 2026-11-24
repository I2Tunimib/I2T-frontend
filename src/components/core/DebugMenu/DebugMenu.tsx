import { FC, PointerEvent, useRef, useState } from "react";
import { Fab, ListItemText, Menu, MenuItem, Switch } from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import {
  isDebugMenuEnabled,
  setDebugSetting,
  useDebugSettings,
} from "./debugSettings";

const POSITION_KEY = "debugMenuPosition";
const SIZE = 48;
const DRAG_THRESHOLD = 4;

type Position = { x: number; y: number };

const clamp = ({ x, y }: Position): Position => ({
  x: Math.min(Math.max(0, x), window.innerWidth - SIZE),
  y: Math.min(Math.max(0, y), window.innerHeight - SIZE),
});

const loadPosition = (): Position => {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITION_KEY) || "null");
    if (saved) return clamp(saved);
  } catch {
    // fall through to default
  }
  return clamp({ x: window.innerWidth - SIZE - 16, y: window.innerHeight - SIZE - 16 });
};

const DebugMenu: FC = () => {
  const [position, setPosition] = useState<Position>(loadPosition);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const settings = useDebugSettings();
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);

  if (!isDebugMenuEnabled()) return null;

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      dx: e.clientX - position.x,
      dy: e.clientY - position.y,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setPosition(clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy }));
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } else {
      setAnchorEl(e.currentTarget);
    }
  };

  return (
    <>
      <Fab
        size="medium"
        color="secondary"
        aria-label="debug-menu"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        sx={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 2000,
          touchAction: "none",
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
        }}
      >
        <BugReportIcon />
      </Fab>
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        sx={{ zIndex: 2001 }}
      >
        <MenuItem
          onClick={() =>
            setDebugSetting("disableWebsockets", !settings.disableWebsockets)
          }
        >
          <ListItemText
            primary="Disable websockets"
            secondary="Socket.IO uses HTTP polling only"
          />
          <Switch edge="end" checked={settings.disableWebsockets} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default DebugMenu;
