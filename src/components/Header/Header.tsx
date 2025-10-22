import React from "react";
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header_container">
        <div className="logo">
          <a href="/">
            <img src="/images/logo4.png" alt="logo" />
          </a>
        </div>
        <a href="tel:+15034387888" className="contact">
          (503) 438-7888
        </a>
      </div>
    </header>
  );
};

export default Header;
