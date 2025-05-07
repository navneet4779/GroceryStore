import React from 'react';
import banner from '../assets/banner.jpg';
import bannerMobile from '../assets/banner-mobile.jpg';
import { useSelector } from 'react-redux';
import { valideURLConvert } from '../utils/valideURLConvert';
import { useNavigate } from 'react-router-dom';
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay';
import { motion } from 'framer-motion'; // Import for animations

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();

  const handleRedirectProductListpage = (categoryId, subCategoryId, categoryName, subCategoryName) => {
    const url = `/${valideURLConvert(categoryName)}-${categoryId}/${valideURLConvert(subCategoryName)}-${subCategoryId}`;
    navigate(url);
  };

  const bannerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const categoryTitleVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.2 } },
  };

  const subCategoryItemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const loadingItemVariants = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1, transition: { duration: 0.8, yoyo: Infinity } },
  };

  return (
    <motion.section
      className="bg-gray-50 py-8" // Softer background
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
    >
      <div className="container mx-auto mb-8">
        <motion.div
          className={`w-full h-full min-h-48 rounded-lg overflow-hidden shadow-md ${!banner && 'bg-gray-200 animate-pulse my-2'}`} // Added shadow and overflow
          variants={bannerVariants}
          initial="initial"
          animate="animate"
        >
          <img src={banner} className="w-full h-full hidden lg:block object-cover" alt="banner" /> {/* object-cover for better image fit */}
          <img src={bannerMobile} className="w-full h-full lg:hidden object-cover" alt="banner" /> {/* object-cover for better image fit */}
        </motion.div>
      </div>

      {/*** Display category product */}
      {categoryData?.map((c, index) => (
        <CategoryWiseProductDisplay
          key={c?.id + "CategorywiseProduct"}
          id={c?.id}
          name={c?.name}
        />
      ))}

      <div className="container mx-auto px-4 py-8"> {/* Added more vertical padding */}
        {loadingCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {new Array(12).fill(null).map((_, index) => (
              <motion.div
                key={index + 'loadingcategory'}
                className="bg-white rounded-lg p-4 min-h-36 shadow animate-pulse" // Added rounded-lg and shadow
                variants={loadingItemVariants}
                initial="initial"
                animate="animate"
              >
                <div className="bg-gray-300 min-h-24 rounded-md"></div> {/* Softer loading color */}
                <div className="bg-gray-300 h-8 rounded-md mt-2"></div> {/* Softer loading color */}
              </motion.div>
            ))}
          </div>
        ) : (
          categoryData.map((category) => (
            <div key={category.id + 'category'} className="mb-10"> {/* Increased margin for better separation */}
              {/* Category Name */}
              <motion.h2
                className="text-2xl font-semibold mb-6 text-gray-800" // More prominent heading
                variants={categoryTitleVariants}
                initial="initial"
                animate="animate"
              >
                {category.name}
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"> {/* Increased gap */}
                {/* Subcategories */}
                {subCategoryData
                  .filter((sub) => sub.category?.id === category.id)
                  .map((subCategory) => (
                    <motion.div
                      key={subCategory.id + 'subcategory'}
                      className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition duration-300" // Added rounded-lg, shadow, and transition
                      onClick={() =>
                        handleRedirectProductListpage(category.id, subCategory.id, category.name, subCategory.name)
                      }
                      variants={subCategoryItemVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <div className="relative w-full h-32 overflow-hidden rounded-t-lg bg-gray-100"> {/* Added overflow and background */}
                        <img
                          src={subCategory.image || 'https://via.placeholder.com/150'}
                          alt={subCategory.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-center font-medium text-gray-700 truncate">{subCategory.name}</p> {/* Added text color and truncate */}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default Home;