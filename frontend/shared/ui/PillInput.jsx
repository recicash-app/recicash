import { Box, InputBase } from "@mui/material";

function PillInput({ 
  children,
  select = false,
  ...props 
}) {
  return (
    <Box
      sx={{
        bgcolor: "#FFF",
        borderRadius: "30px",
        p: "4px 12px 4px 28px",
        display: "flex",
        alignItems: "center",
        mb: 2,
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      {select ? (
        <select
          {...props}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "1rem",
            color: "#5E6282",
            padding: "12px 0",
          }}
        >
          {children}
        </select>
      ) : (
        <InputBase
          {...props}
          sx={{
            flex: 1,
            color: "#5E6282",
            fontSize: "1rem",
            py: 1,
          }}
        />
      )}
    </Box>
  );
}

export default PillInput;
