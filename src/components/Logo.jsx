// Import required modules and assets
import React from "react";
import itsigLogo from "../images/ITSIG.svg"; // Import the ITSIG logo image

// Logo Component
function Logo() {
  return (
    <div className="logo">
      <div className="logo-svg">
        <img src={itsigLogo} alt="" />
      </div>
    </div>
  );
}

// Export the Logo component 
export default Logo;
