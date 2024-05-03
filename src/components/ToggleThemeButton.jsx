// Import React and required components
import React from "react";
import { Button } from "antd";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";

function ToggleThemeButton({ darkTheme, toggleTheme }) {
  return (
    // Container for the toggle theme button
    <div className="toggle-theme-btn">
      <Button onClick={toggleTheme}>
        {darkTheme ? <HiOutlineSun /> : <HiOutlineMoon />}
      </Button>
    </div>
  );
}

// Export the ToggleThemeButton 
export default ToggleThemeButton;
