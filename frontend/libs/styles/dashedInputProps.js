export const getDashedInputProps = (isEditing) => ({
  disableUnderline: true,
  style: {
    padding: "8px",
    outline: "none",
    resize: "none",
    border: isEditing ? "2px solid transparent" : "none",
    borderImage: isEditing
      ? "repeating-linear-gradient(45deg, #B0B0B0 0 16px, transparent 16px 32px) 1"
      : "none",
    borderImageRepeat: "round",
    background: isEditing ? "#D9D9D961" : "transparent",
  },
});
