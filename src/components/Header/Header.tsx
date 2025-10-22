import React from "react";
import './Header.css'
import Link from "next/link";


const Header = () => {
  return (
    <header className="header">
      <div className="header_container">
        <div className="logo">
          <Link href="/">
            <img src="/images/logo4.png" alt="logo" />
          </Link>
        </div>
        <Link href="tel:+15034387888" className="contact">
          (503) 438-7888
        </Link>
      </div>
    </header>
  );
};

export default Header;
