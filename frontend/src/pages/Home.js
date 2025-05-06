import React from 'react'
import banner from '../assets/banner.jpg'
import bannerMobile from '../assets/banner-mobile.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import {Link, useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()
  const handleRedirectProductListpage = (id,cat)=>{
      const subcategory = subCategoryData.find(sub => sub.category?.id === id);
      if (!subcategory) {
          console.error("No subcategory found for category ID:", id);
          return "/";
      }
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory.id}`

      navigate(url)
      console.log(url)
  }


  return (
   <section className='bg-white'>
      <div className='container mx-auto'>
          <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2" } `}>
              <img
                src={banner}
                className='w-full h-full hidden lg:block'
                alt='banner' 
              />
              <img
                src={bannerMobile}
                className='w-full h-full lg:hidden'
                alt='banner' 
              />
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10  gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat,index)=>{
                return(
                  <div key={cat.id+"displayCategory"} className='w-full h-full' onClick={()=>handleRedirectProductListpage(cat.id,cat.name)}>
                    <div>
                        <img 
                          src='https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.swiggy.com%2Finstamart%2Fp%2Famul-gold-pasteurised-full-cream-milk-TYF3262KU8&psig=AOvVaw2oYbqTrzpreItJKY7p9upG&ust=1746027046667000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOD78ODH_YwDFQAAAAAdAAAAABAE'
                          className='w-full h-full object-scale-down'
                        />
                    </div>
                  </div>
                )
              })
              
            )
          }
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



   </section>
  )
}

export default Home