import React, { useEffect, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { FaArrowLeft } from 'react-icons/fa';
import { MdClear } from 'react-icons/md'; // Icon for clear button
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

// Optional: Debounce utility (if you want to reduce frequent navigation calls)
// const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => {
//       func.apply(this, args);
//     }, delay);
//   };
// };

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSearchPage = location.pathname === '/search';
  // State for the input value on the search page
  const [currentQuery, setCurrentQuery] = useState('');

  // Determine if on /search page and get initial query
  useEffect(() => {
    if (isSearchPage) {
      const queryParams = new URLSearchParams(location.search);
      setCurrentQuery(queryParams.get('q') || '');
    }
  }, [isSearchPage, location.search]);

  const redirectToSearchPage = () => {
    navigate('/search');
  };

  // Handles input change and navigates
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentQuery(value);
    // Update URL as user types
    // For high-traffic sites or complex search logic, consider debouncing this navigation
    navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
  };

  // Debounced version - uncomment this and debounce utility if needed
  // const debouncedNavigate = useCallback(
  //   debounce((value) => {
  //     navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
  //   }, 300), // 300ms delay
  //   [navigate]
  // );
  // const handleInputChange = (e) => {
  //   const value = e.target.value;
  //   setCurrentQuery(value);
  //   debouncedNavigate(value);
  // };


  const clearSearch = () => {
    setCurrentQuery('');
    navigate('/search?q=', { replace: true });
    // Optionally, focus the input again after clearing
    // document.getElementById('searchInputField')?.focus();
  };

  return (
    <div
      className={`w-full min-w-[280px] sm:min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border border-neutral-300 overflow-hidden flex items-center bg-white group
                  focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-50 transition-all duration-200 shadow-sm
                  ${isSearchPage ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}`}
    >
      {/* Left Icon: Back Arrow or Search Icon */}
      <div className="flex-shrink-0 h-full flex items-center">
        {isSearchPage ? (
          <Link
            to="/"
            aria-label="Go back to homepage"
            className="flex justify-center items-center h-9 w-9 ml-1.5 text-neutral-600 hover:text-primary-600 transition-colors"
          >
            <FaArrowLeft size={18} />
          </Link>
        ) : (
          <div
            onClick={redirectToSearchPage} // Make icon clickable to navigate if not on search page
            className="flex justify-center items-center h-full px-3 text-neutral-500 cursor-pointer group-focus-within:text-primary-500"
            aria-label="Open search page"
          >
            <IoSearch size={22} />
          </div>
        )}
      </div>

      {/* Input Field or TypeAnimation */}
      <div className="w-full h-full flex items-center">
        {!isSearchPage ? (
          <div
            onClick={redirectToSearchPage}
            className="w-full h-full flex items-center pl-1 pr-3 cursor-text text-neutral-500 text-sm"
          >
            <TypeAnimation
              sequence={[
                'Search "milk"', 1200,
                'Search "bread"', 1200,
                'Search "organic eggs"', 1200,
                'Search "fresh vegetables"', 1200,
                'Search "chicken breast"', 1200,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              cursor={true}
              className="truncate" // Prevents long text from breaking layout
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center relative">
            <input
              id="searchInputField"
              type="text"
              placeholder="Search for products..."
              autoFocus
              value={currentQuery}
              onChange={handleInputChange}
              className="bg-transparent w-full h-full outline-none px-2 text-neutral-800 placeholder-neutral-400 text-sm"
            />
            {currentQuery && (
              <button
                onClick={clearSearch}
                aria-label="Clear search query"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <MdClear size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;