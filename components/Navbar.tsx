"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Role-based navigation links
  const getNavLinks = () => {
    const links = [
      { href: "/", label: "Marketplace" },
    ];

    if (userRole === "ADMIN") {
      links.push({ href: "/dashboard", label: "Admin Dashboard" });
    }

    if (userRole === "SELLER" || userRole === "ADMIN") {
      links.push({ href: "/sell", label: "Sell" });
      links.push({ href: "/manage-products", label: "My Products" });
    }

    if (userRole === "CUSTOMER") {
      links.push({ href: "/profile", label: "My Orders" });
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-lg">
              R
            </span>
            <span className="gradient-text hidden sm:block">Riftshop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Role Badge */}
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${userRole === "ADMIN"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : userRole === "SELLER"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  }`}>
                  {userRole}
                </span>

                {/* User Email */}
                <span className="text-gray-300 text-sm hidden lg:block">
                  {session.user.email}
                </span>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm"
                >
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="border-gray-700" />

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${userRole === "ADMIN"
                        ? "bg-amber-500/20 text-amber-400"
                        : userRole === "SELLER"
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                      {userRole}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      {session.user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary mx-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}