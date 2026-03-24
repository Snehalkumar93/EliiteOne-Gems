import { useState, useContext } from 'react'
import { StoreContext } from './Context/StoreContext'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import Product from './pages/Product/Product'
import NotFound from './pages/NotFound/NotFound'
import Profile from './pages/Profile/Profile'
import Support from './pages/Support/Support'
import MySupport from './pages/MySupport/MySupport'
import LiveChatWidget from './components/LiveChatWidget/LiveChatWidget'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure/PaymentFailure'
import VerifyEmail from './pages/Auth/VerifyEmail'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/pages/Dashboard/Dashboard'
import Add from './admin/pages/Add/Add'
import List from './admin/pages/List/List'
import Orders from './admin/pages/Orders/Orders'
import AdminSupport from './admin/pages/AdminSupport/AdminSupport'
import ReviewManagement from './admin/pages/Reviews/ReviewManagement'
import Coupons from './admin/pages/Coupons/Coupons'

const App = () => {

  const [showLogin,setShowLogin] = useState(false);
  const { role, token } = useContext(StoreContext);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  const ProtectedCart = () => {
    if (!token) {
      toast.error("Please login to access your cart.", { toastId: 'cart-guest-error' });
      return <Navigate to="/" replace />;
    }
    return <Cart />;
  };

  return (
    <>
    <div className='main-theme-container'>
    <ToastContainer/>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className={isAdminPath ? 'admin-app-wrapper' : 'app'}>
        {!isAdminPath && <Navbar setShowLogin={setShowLogin}/>}
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/cart' element={<ProtectedCart />}/>
          <Route path='/order' element={<PlaceOrder />}/>
          <Route path='/myorders' element={<MyOrders />}/>
          <Route path='/verify' element={<Verify />}/>
          <Route path='/product/:id' element={<Product />}/>
          <Route path='/profile' element={<Profile />}/>
          <Route path='/support' element={<Support />}/>
          <Route path='/my-support' element={<MySupport />}/>
          <Route path='/forgot-password' element={<ForgotPassword />}/>
          <Route path='/reset-password/:token' element={<ResetPassword />}/>
          <Route path='/payment-success' element={<PaymentSuccess />}/>
          <Route path='/payment-failure' element={<PaymentFailure />}/>
          <Route path='/verify-email/:token' element={<VerifyEmail />}/>
          
          {/* Admin Routes */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<Dashboard />}/>
            <Route path='add' element={<Add />}/>
            <Route path='list' element={<List />}/>
            <Route path='orders' element={<Orders />}/>
            <Route path='support' element={<AdminSupport />}/>
            <Route path='reviews' element={<ReviewManagement />}/>
            <Route path='coupons' element={<Coupons />}/>
            <Route path='profile' element={<Profile />}/>
            <Route path='billing' element={<Dashboard />}/> {/* Dummy route for billing */}
          </Route>

          <Route path='*' element={<NotFound />}/>
        </Routes>
      </div>
      {!isAdminPath && role !== 'admin' && <LiveChatWidget />}
      {!isAdminPath && <Footer />}
    </div>
    </>
  )
}

export default App
