import { useState, useMemo, useEffect } from "react";
import {
  Box,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const GAP = 12;

export default function Carousel({
  items = [],
  itemsPerBreakpoint = { xs: 1, sm: 2, md: 3, lg: 4 },
  itemWidth = 267,
  itemHeight = 400,
}) {
  const theme = useTheme();

  // Responsive logic
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  // Determine number of visible items
  const itemsPerPage = useMemo(() => {
    if (isXs) return itemsPerBreakpoint.xs || 1;
    if (isSm) return itemsPerBreakpoint.sm || 2;
    if (isMd) return itemsPerBreakpoint.md || 3;
    if (isLg) return itemsPerBreakpoint.lg || 4;
    return 4;
  }, [isXs, isSm, isMd, isLg, itemsPerBreakpoint]);

  // Derived values
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const viewportWidth =
    itemsPerPage * itemWidth + (itemsPerPage - 1) * GAP;

  // State
  const [activePage, setActivePage] = useState(0);
  const [direction, setDirection] = useState("left");

  // Reset if items change
  useEffect(() => {
    if (activePage >= totalPages) setActivePage(0);
  }, [items, totalPages, activePage]);

  // Handlers
  const handleNext = () => {
    setDirection("left");
    setActivePage((prev) => Math.min(prev + 1, totalPages - 1));
  };
  const handlePrev = () => {
    setDirection("right");
    setActivePage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        mt: 5,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: viewportWidth,
          height: itemHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "width 0.3s ease",
        }}
      >
        {/* Prev */}
        <IconButton
          onClick={handlePrev}
          disabled={activePage === 0}
          sx={{
            position: "absolute",
            left: -(40 + GAP),
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            "&:hover": { backgroundColor: "grey.100" },
          }}
        >
          <NavigateBeforeIcon />
        </IconButton>

        {/* Viewport */}
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageItems = items.slice(
              pageIndex * itemsPerPage,
              (pageIndex + 1) * itemsPerPage
            );

            return (
              <Box
                key={pageIndex}
                sx={{
                  display: activePage === pageIndex ? "block" : "none",
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <Slide
                  direction={direction}
                  in={activePage === pageIndex}
                  mountOnEnter
                  unmountOnExit
                >
                  <Stack
                    direction="row"
                    spacing={GAP / 8}
                    sx={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "flex-start"
                    }}
                  >
                    {pageItems.map((item, i) => (
                      <Box key={i} sx={{ width: itemWidth }}>
                        {item}
                      </Box>
                    ))}
                  </Stack>
                </Slide>
              </Box>
            );
          })}
        </Box>

        {/* Next */}
        <IconButton
          onClick={handleNext}
          disabled={activePage >= totalPages - 1}
          sx={{
            position: "absolute",
            right: -(40 + GAP),
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            "&:hover": { backgroundColor: "grey.100" },
          }}
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
