
import './App.css';
import { Outlet} from 'react-router-dom'
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory,setAllSubCategory,setLoadingCategory } from './store/productslice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import GlobalProvider  from './provider/GlobalProvider';

const sortByName = (a, b) => a.name.localeCompare(b.name)

function App() {
  const dispatch = useDispatch()
  const fetchUser = async()=>{
    const userData = await fetchUserDetails()
    if(!userData){
      return
    }
    dispatch(setUserDetails(userData.data))
  }
  const fetchCategory = async()=>{
    try {
        dispatch(setLoadingCategory(true))
        const response = await Axios({
            ...SummaryApi.getCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllCategory(responseData.data.sort(sortByName))) 
        }
    } catch (error) {
        
    }finally{
      dispatch(setLoadingCategory(false))
    }
  }

  const fetchSubCategory = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.getSubCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllSubCategory(responseData.data.sort(sortByName))) 
        }
    } catch (error) {
        
    }finally{
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUser(), fetchCategory(), fetchSubCategory()]);
    };

    fetchData();
  }, [dispatch]);
  return (
    <>
    <GlobalProvider> 
        <Header />
        <main className='min-h-[78vh]'>
              <Outlet/>
          </main>
        <Footer/>
        <Toaster />
    </GlobalProvider> 
   </>

  )
}


export default App;
