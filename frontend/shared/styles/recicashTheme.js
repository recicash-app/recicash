import { createTheme } from "@mui/material/styles";

const recicashTheme = createTheme({
  palette: {
    primary: {
      main: "#93B17D", // main light green
      contrastText: "#FFFFFF",
    },
    
    secondary: {
      main: "#3A5B22", // dark green
      contrastText: "#FFFFFF", // text on green buttons
    },
    
    background: {
      default: "#FFFFFF", // general background
      paper: "#FFFFFF", // card backgrounds
    },
    
    text: {
      primary: "#000000", // titles on white background
      secondary: "#5E6282", // regular text
      hint: "#181E4B", // additional text color
    },
  },

  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',

    h1: {
      fontFamily: '"Volkhov", serif',
      fontWeight: 700,
      fontSize: "3rem",
      color: "#000000",
    },

    h2: {
      fontFamily: '"Volkhov", serif',
      fontWeight: 700,
      fontSize: "2.25rem",
      color: "#000000",
    },
    
    h3: {
      fontFamily: '"Volkhov", serif',
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#000000",
    },
    
    h4: {
      fontFamily: '"Volkhov", serif',
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#000000",
    },
    
    h5: {
      fontFamily: '"Volkhov", serif',
      fontWeight: 600,
      fontSize: "1.25rem",
      color: "#000000",
    },
    
    h6: {
      fontFamily: '"Volkhov", serif',
      fontWeight: 500,
      fontSize: "1rem",
      color: "#000000",
    },
    
    body1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 400,
      fontSize: "1rem",
      color: "#5E6282",
    },
    
    body2: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 400,
      fontSize: "0.875rem",
      color: "#5E6282",
    },
    
    button: {
      textTransform: "none",
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 700,
      color: "#FFFFFF",
    },
  },

  shadows: [
    "none",
    "0px 4px 4px 0px #00000040",
    "0px 20px 35px 0px #F1A50126",
    ...Array(22).fill("none"), // keep MUI's default 25 shadows
  ],

  // Custom component overrides
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          padding: "10px",
          fontFamily: '"Poppins", sans-serif',
          transition: "all 0.3s ease",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 4px 0px #00000040",
          },
        },
      },

      // Custom Recicash variants
      variants: [
        // Primary (dark green)
        {
          props: { variant: "recicashPrimary" },
          style: {
            width: 404,
            height: 32,
            backgroundColor: "#3A5B22",
            color: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid transparent",
            gap: "10px",
            "&:hover": {
              backgroundColor: "#2E471B",
            },
          },
        },

        // Secondary (light green)
        {
          props: { variant: "recicashSecondary" },
          style: {
            width: 163,
            height: 26,
            backgroundColor: "#93B17D",
            color: "#FFFFFF",
            borderRadius: "5px",
            "&:hover": {
              backgroundColor: "#7FA56D",
            },
          },
        },

        // CTA (large, call-to-action)
        {
          props: { variant: "recicashCTA" },
          style: {
            width: 170,
            height: 60,
            backgroundColor: "#3A5B22",
            color: "#FFFFFF",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "#2E471B",
              boxShadow: "none"
            },
          },
        },

        // Outlined (dark outline)
        {
          props: { variant: "recicashOutlined" },
          style: {
            width: 123,
            height: 40,
            borderRadius: "5px",
            color: "#212832",
            border: "1px solid #212832",
            backgroundColor: "transparent",
          },
        },
        
        // Soft Outlined (light subtle border)
        {
          props: { variant: "recicashSoftOutlined" },
          style: ({ state }) => ({
            width: 139,
            height: 50,
            borderRadius: "11px",
            backgroundColor: "transparent",
            border: "1px solid rgba(217, 217, 217, 0.38)",
            color: "#212832",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(217, 217, 217, 0.1)",
            },
            ...(state.active && {
              border: "1px solid #D9D9D9",
              boxShadow: "0px 4px 4px 0px #00000040",
            }),
          }),
        },
      ],
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          // You don't usually add `border` here because it conflicts with the notchedOutline
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D9D9D9",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#999",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#212832",
          },
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        input: {
          fontFamily: '"Poppins", sans-serif',
          fontSize: "1rem",
          "::placeholder": {
            color: "#d3d3d3",
            opacity: 1,
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#222222",
        }
      }
    }
  },
});

export default recicashTheme;
