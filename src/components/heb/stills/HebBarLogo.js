import React from 'react';

function HebBarLogo() {
  return (
    <img
      className="heb-bar-logo"
      src={`${process.env.PUBLIC_URL}/images/heb/heb-logo.png`}
      alt=""
    />
  );
}

export default HebBarLogo;
