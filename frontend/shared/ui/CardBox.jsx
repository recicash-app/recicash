import { Box } from "@mui/material";

function QuarterEllipseGreen() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 50C0 22.3858 22.3858 0 50 0H100V50C100 77.6142 77.6142 100 50 100H0V50Z"
        fill="#3A5B22"
      />
    </svg>
  );
}

function CardBox({ sx, children, focused = false, ...props }) {
  const shadows = [
    "0px 1.85px 3.15px 0px #00000001",
    "0px 8.15px 6.52px 0px #00000002",
    "0px 20px 13px 0px #00000003",
    "0px 38.52px 25.48px 0px #00000003",
    "0px 64.81px 46.85px 0px #00000004",
    "0px 100px 80px 0px #00000005",
  ];

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      {/* Leaf Decoration */}
      {focused && (
        <Box
          sx={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: 120,
            height: 120,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <QuarterEllipseGreen />
        </Box>
      )}

      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          p: 3,
          width: 267,
          height: 314,
          borderRadius: "36px",
          backgroundColor: theme.palette.background.paper,
          boxShadow: shadows.join(", "),
          overflow: "hidden",
          ...sx,
        })}
        {...props}
      >
        {children}
      </Box>
    </Box>
  );
}

export default CardBox;