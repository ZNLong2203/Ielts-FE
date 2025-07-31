"use client";
import { useState } from "react";
import AdminRoutes from "./adminRoutes";

const AdminNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <a
              href="/"
              className="flex items-center group transition-all duration-200 hover:scale-105"
            >
              <div className="relative rounded-2xl px-3 py-2.5 transition-all duration-300 hover:bg-blue-50/50 sm:px-4 lg:px-5 lg:py-3">
                {/* Hover effect background */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Logo SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="85"
                  height="24"
                  viewBox="0 0 85 24"
                  fill="none"
                  className="relative z-10 h-6 w-[85px] transition-all duration-200 group-hover:brightness-110 sm:h-7 sm:w-[95px]"
                >
                  <g clipPath="url(#clip0_30428_22879)">
                    <path
                      d="M29.3774 19.0263C29.282 18.9321 29.2344 18.8143 29.2344 18.6769V5.35796C29.2344 5.20879 29.2781 5.08318 29.3694 4.98897C29.4608 4.89476 29.58 4.84766 29.7309 4.84766H35.28C36.9483 4.84766 38.2631 5.23627 39.2124 6.0135C40.1657 6.79074 40.6424 7.92126 40.6424 9.40899C40.6424 10.8967 40.1657 11.9958 39.2124 12.7534C38.2591 13.5111 36.9483 13.8879 35.28 13.8879H32.2373V18.6769C32.2373 18.8261 32.1897 18.9478 32.0943 19.0341C31.999 19.1244 31.8719 19.1676 31.7209 19.1676H29.7349C29.5958 19.1676 29.4806 19.1205 29.3813 19.0223M35.1807 11.5954C35.9831 11.5954 36.5908 11.407 37.0118 11.0341C37.4329 10.6612 37.6434 10.1116 37.6434 9.38544C37.6434 8.65924 37.4408 8.12538 37.0317 7.72891C36.6226 7.33245 36.0069 7.13617 35.1767 7.13617H32.1936V11.5954H35.1767H35.1807Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M44.0805 19.0263C43.9852 18.9321 43.9375 18.8143 43.9375 18.6769V5.35796C43.9375 5.20879 43.9812 5.08318 44.0726 4.98897C44.1639 4.89476 44.2831 4.84766 44.434 4.84766H49.7964C51.4925 4.84766 52.8232 5.23627 53.7805 6.0135C54.7378 6.79074 55.2184 7.89378 55.2184 9.32656C55.2184 10.3236 54.9761 11.1558 54.4915 11.831C54.0069 12.5061 53.3316 12.9929 52.4617 13.2952L55.4647 18.512C55.5044 18.5945 55.5282 18.669 55.5282 18.7358C55.5282 18.8575 55.4845 18.9595 55.3932 19.042C55.3018 19.1244 55.2025 19.1637 55.0913 19.1637H53.1886C52.9662 19.1637 52.7954 19.1126 52.6723 19.0106C52.5491 18.9085 52.4379 18.775 52.3426 18.6102L49.6931 13.7623H46.857V18.673C46.857 18.8104 46.8094 18.9242 46.714 19.0223C46.6187 19.1165 46.4916 19.1637 46.3406 19.1637H44.434C44.295 19.1637 44.1798 19.1165 44.0805 19.0223M49.7329 11.4306C50.563 11.4306 51.1827 11.25 51.5958 10.8889C52.0089 10.5277 52.2155 9.9978 52.2155 9.30301C52.2155 8.60821 52.0089 8.07042 51.5958 7.69751C51.1827 7.32067 50.5591 7.13617 49.7329 7.13617H46.857V11.4345H49.7329V11.4306Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M59.0727 19.0263C58.9774 18.9321 58.9297 18.8143 58.9297 18.6769V5.35798C58.9297 5.20881 58.9734 5.08713 59.0647 4.98899C59.1561 4.89478 59.2753 4.84375 59.4262 4.84375H68.5582C68.7091 4.84375 68.8362 4.89085 68.9316 4.98899C69.0269 5.0832 69.0746 5.20881 69.0746 5.35798V6.72795C69.0746 6.87712 69.0269 6.9988 68.9316 7.08516C68.8362 7.17545 68.7091 7.21863 68.5582 7.21863H61.7658V10.7986H68.1014C68.2523 10.7986 68.3755 10.8457 68.4748 10.9438C68.5701 11.0381 68.6217 11.1637 68.6217 11.3128V12.6004C68.6217 12.7495 68.5741 12.8712 68.4748 12.9576C68.3794 13.0479 68.2523 13.0911 68.1014 13.0911H61.7658V16.7927H68.721C68.872 16.7927 68.9951 16.8359 69.0944 16.9262C69.1897 17.0165 69.2374 17.1342 69.2374 17.2834V18.673C69.2374 18.8222 69.1897 18.9438 69.0944 19.0302C68.9991 19.1205 68.872 19.1637 68.721 19.1637H59.4262C59.2872 19.1637 59.172 19.1166 59.0727 19.0224"
                      fill="#1F2937"
                    />
                    <path
                      d="M73.0063 19.0263C72.911 18.9321 72.8594 18.8143 72.8594 18.6769V5.35796C72.8594 5.20879 72.9031 5.08318 72.9944 4.98897C73.0858 4.89476 73.205 4.84766 73.3559 4.84766H78.905C80.5733 4.84766 81.8881 5.23627 82.8374 6.0135C83.7907 6.79074 84.2674 7.92126 84.2674 9.40899C84.2674 10.8967 83.7907 11.9958 82.8374 12.7534C81.8841 13.5111 80.5733 13.8879 78.905 13.8879H75.8623V18.6769C75.8623 18.8261 75.8147 18.9478 75.7154 19.0341C75.62 19.1244 75.4929 19.1676 75.342 19.1676H73.3559C73.2169 19.1676 73.1017 19.1205 73.0024 19.0223M78.7977 11.5954C79.5961 11.5954 80.2079 11.407 80.6289 11.0341C81.0499 10.6612 81.2605 10.1116 81.2605 9.38544C81.2605 8.65924 81.0579 8.12538 80.6488 7.72891C80.2396 7.33245 79.6239 7.13617 78.7977 7.13617H75.8147V11.5954H78.7977Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M0 4.80079V2.53582C0 1.13445 1.14795 0 2.56601 0H24.4605V21.4642C24.4605 22.8656 23.3125 24 21.8945 24H9.7834V19.2385H18.677C19.1656 19.2385 19.5628 18.8459 19.5628 18.3631V4.80079H0Z"
                      fill="#1479F3"
                    />
                    <path
                      d="M0 19.947V22.4828C0 23.8842 1.14795 23.998 2.56601 23.998H4.89369V9.59961H0V19.9509V19.947Z"
                      fill="#1479F3"
                    />
                    <path
                      d="M14.0156 9.58203H10.4446C10.0792 9.58203 9.78125 9.87251 9.78125 10.2376V13.7665C9.78125 14.1277 10.0752 14.4221 10.4446 14.4221H14.0156C14.381 14.4221 14.6789 14.1316 14.6789 13.7665V10.2376C14.6789 9.87644 14.381 9.58203 14.0156 9.58203Z"
                      fill="#FF9E00"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_30428_22879">
                      <rect width="85" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Routes */}
          <div className="hidden md:flex flex-1 justify-center">
            <AdminRoutes className="mx-6" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* User Profile/Settings (placeholder) */}
            <div className="hidden md:flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:scale-105 transition-transform duration-200">
                A
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`h-6 w-6 transition-transform duration-200 ${
                  isMobileMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 border-t border-gray-200"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-2 pt-4 pb-3 space-y-1 bg-white/95 backdrop-blur-md">
            <AdminRoutes isMobile={true} />

            {/* Mobile user section */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center px-4 py-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  A
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">
                    Admin User
                  </p>
                  <p className="text-sm text-gray-500">admin@prep.vn</p>
                </div>
              </div>
              <div className="mt-3 px-2">
                <button className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
