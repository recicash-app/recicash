import { Box } from "@mui/material";

function LeafBox({ sx, children, ...props }) {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: "195px 0px",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        opacity: 1,
        transform: "rotate(0deg)",
        position: "relative",
        boxShadow: "10px 8px 12.3px -4px #C4C4C480",
        display: "block",
        padding: theme.spacing(6, 12),
        boxSizing: "border-box",
        overflow: "hidden",
        ...sx,
      })}
      {...props}
    >
      {children}
    </Box>
  );
};

export default LeafBox;