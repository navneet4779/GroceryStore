import React from 'react';
import banner from '../assets/banner.jpg';
import bannerMobile from '../assets/banner-mobile.jpg';
import { useSelector } from 'react-redux';
import { valideURLConvert } from '../utils/valideURLConvert';
import { useNavigate } from 'react-router-dom';
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay';

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();

  const handleRedirectProductListpage = (categoryId, subCategoryId, categoryName, subCategoryName) => {
    const url = `/${valideURLConvert(categoryName)}-${categoryId}/${valideURLConvert(subCategoryName)}-${subCategoryId}`;
    navigate(url);
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto">
        <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && 'animate-pulse my-2'}`}>
          <img src={banner} className="w-full h-full hidden lg:block" alt="banner" />
          <img src={bannerMobile} className="w-full h-full lg:hidden" alt="banner" />
        </div>
      </div>

        {/***display category product */}
         {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?.id+"CategorywiseProduct"} 
              id={c?.id} 
              name={c?.name}
            />
          )
        })
      }

      <div className="container mx-auto px-4 my-4">
        {loadingCategory ? (
          new Array(12).fill(null).map((_, index) => (
            <div key={index + 'loadingcategory'} className="bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse">
              <div className="bg-blue-100 min-h-24 rounded"></div>
              <div className="bg-blue-100 h-8 rounded"></div>
            </div>
          ))
        ) : (
          categoryData.map((category) => (
            <div key={category.id + 'category'} className="mb-6">
              {/* Category Name */}
              <h2 className="text-xl font-bold mb-4">{category.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Subcategories */}
                {subCategoryData
                  .filter((sub) => sub.category?.id === category.id)
                  .map((subCategory) => (
                    <div
                      key={subCategory.id + 'subcategory'}
                      className="bg-white rounded p-4 shadow cursor-pointer hover:shadow-lg"
                      onClick={() =>
                        handleRedirectProductListpage(category.id, subCategory.id, category.name, subCategory.name)
                      }
                    >
                      <div className="w-full h-24 bg-blue-100 rounded mb-2">
                        <img
                          src={subCategory.image || 'https://via.placeholder.com/150'}
                          alt={subCategory.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <p className="text-center font-medium">{subCategory.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Home;