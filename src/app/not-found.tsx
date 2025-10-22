"use client";

import Link from "next/link";
import './404.css'
import "./globals.css";
import "../styles/hero-permit.css";
import "../styles/tokens.css";
import "../styles/global.css"


export default function NotFound() {
  return (
    <div className="not_found">
    <h2>404 Page Not Found</h2>
    <button className="next-button hero-btn hompage_btn"><Link href="/">Home Page</Link></button>
</div>
  );
}