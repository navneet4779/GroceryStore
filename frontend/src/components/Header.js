import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp  } from "react-icons/go";
import logo from '../assets/logo.png';
import UserMenu from './UserMenu';
import Search from './Search'
import { BsCart4 } from 'react-icons/bs';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';




const Header = () => {
    const user = useSelector((state)=> state.user)
    const [openUserMenu,setOpenUserMenu] = useState(false)
    const navigate = useNavigate()
    const cartItem = useSelector(state => state.cartItem.cart)
    const [openCartSection,setOpenCartSection] = useState(false)
    const { totalPrice, totalQty} = useGlobalContext()



    const redirectToLoginPage = ()=>{
        navigate("/login")
    }

    const handleCloseUserMenu = ()=>{
        setOpenUserMenu(false)
    }

    return (
        <header className="h-28 lg:h-24 lg:shadow-md sticky top-0 z-40 flex flex-col justify-center gap-1 bg-white">
            <div className="container mx-auto flex items-center px-4 justify-between">
                {/** Logo Section */}
                <div className="h-full">
                    <Link to="/" className="h-full flex justify-center items-center">
                        <img
                            src={logo}
                            alt="logo"
                            className="hidden lg:block object-contain h-full max-h-24"
                        />
                        <img
                            src={logo}
                            alt="logo"
                            className="lg:hidden object-contain h-full max-h-20"
                        />
                    </Link>
                </div>

                {/**Search */}
                <div className='hidden lg:block'>
                    <Search/>
                </div>

                {/** Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-10">
                    {user.id ? (
                        <div className="relative">
                            <div
                                onClick={() => setOpenUserMenu((prev) => !prev)}
                                className="flex select-none items-center gap-1 cursor-pointer"
                            >
                                <p>Account</p>
                                {openUserMenu ? (
                                    <GoTriangleUp size={20} />
                                ) : (
                                    <GoTriangleDown size={20} />
                                )}
                            </div>
                            {
                                openUserMenu && (
                                    <div className='absolute right-0 top-12'>
                                        <div className='bg-white rounded p-4 min-w-52 lg:shadow-lg'>
                                            <UserMenu close={handleCloseUserMenu}/>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                        <button
                            onClick={redirectToLoginPage}
                            className="text-lg px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Login
                        </button>
                    )}
                    <button onClick={()=>setOpenCartSection(true)} className='flex items-center gap-2 bg-green-800 hover:bg-green-700 px-3 py-2 rounded text-white'>
                                            {/**add to card icons */}
                                            <div className='animate-bounce'>
                                                <BsCart4 size={26}/>
                                            </div>
                                            <div className='font-semibold text-sm'>
                                                {
                                                    cartItem[0] ? (
                                                        <div>
                                                            <p>{totalQty} Items</p>
                                                            <p>{DisplayPriceInRupees(totalPrice)}</p>
                                                        </div>
                                                    ) : (
                                                        <p>My Cart</p>
                                                    )
                                                }
                                            </div>    
                                        </button>
                </div>
            </div>
            <div className='container mx-auto px-2 lg:hidden'>
            <Search/>
            </div>

            {
                openCartSection && (
                    <DisplayCartItem close={()=>setOpenCartSection(false)}/>
                )
            }
        </header>
    );
};

export default Header;