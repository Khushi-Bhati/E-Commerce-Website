import React from 'react';
import ReactDOM from 'react-dom/client';
import "./../src/index.css";

import App from './App';
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Provider } from "react-redux";
import Store from './reducers/Store.js';

// Auth
import Login from './components/User/Login';
import Register from './components/User/Register';
import ResetPassword from './components/User/ResetPassword';

// Customer pages
import Home from './components/Customer/Home';
import Createcustomer from './components/Customer/Createcustomer';
import Cart from './components/Customer/Cart.jsx';
import CategoryPage from './components/Customer/CategoryPage';
import BlogPage from './components/Customer/BlogPage';
import HotOffersPage from './components/Customer/HotOffersPage';
import PaymentSuccess from './components/Customer/PaymentSuccess';
import CheckoutPage from './components/Customer/CheckoutPage';

// Seller pages
import Createseller from './components/Selller/Createseller.jsx';
import Dashboard from './components/Selller/Dashboard.jsx';
import Addproduct from './components/Selller/Addproduct.jsx';
import Productlist from './components/Selller/Productlist.jsx';
import Orders from './components/Selller/Orders.jsx';
import Customers from './components/Selller/Customers.jsx';
import Payments from './components/Selller/Payments.jsx';
import Analytics from './components/Selller/Analytics.jsx';
import Reviews from './components/Selller/Reviews.jsx';
import Settings from './components/Selller/Settings.jsx';

// Route guard
import ProtectedRoute from './components/ProtectedRoute.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      {/* Root redirect → Login */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/reset-password' element={<ResetPassword />} />

      {/* Customer protected routes */}
      <Route path='/customer/home' element={<ProtectedRoute role="buyer"><Home /></ProtectedRoute>} />
      <Route path='/customer/category/:categoryName' element={<ProtectedRoute role="buyer"><CategoryPage /></ProtectedRoute>} />
      <Route path='/customer/blog' element={<ProtectedRoute role="buyer"><BlogPage /></ProtectedRoute>} />
      <Route path='/customer/hotoffers' element={<ProtectedRoute role="buyer"><HotOffersPage /></ProtectedRoute>} />
      <Route path='/customer/cart' element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>} />
      <Route path='/customer/payment-success' element={<ProtectedRoute role="buyer"><PaymentSuccess /></ProtectedRoute>} />
      <Route path='/customer/checkout' element={<ProtectedRoute role="buyer"><CheckoutPage /></ProtectedRoute>} />
      <Route path='/customer/createprofile' element={<ProtectedRoute role="buyer"><Createcustomer /></ProtectedRoute>} />

      {/* Seller profile creation (protected but no role check since profile doesn't exist yet) */}
      <Route path='/seller/sellerprofile' element={<ProtectedRoute role="seller"><Createseller /></ProtectedRoute>} />

      {/* Seller authenticated routes */}
      <Route path='/seller/dashboard' element={<ProtectedRoute role="seller"><Dashboard /></ProtectedRoute>} />
      <Route path='/seller/addproduct' element={<ProtectedRoute role="seller"><Addproduct /></ProtectedRoute>} />
      <Route path='/seller/productlist' element={<ProtectedRoute role="seller"><Productlist /></ProtectedRoute>} />
      <Route path='/seller/orders' element={<ProtectedRoute role="seller"><Orders /></ProtectedRoute>} />
      <Route path='/seller/customers' element={<ProtectedRoute role="seller"><Customers /></ProtectedRoute>} />
      <Route path='/seller/payments' element={<ProtectedRoute role="seller"><Payments /></ProtectedRoute>} />
      <Route path='/seller/analytics' element={<ProtectedRoute role="seller"><Analytics /></ProtectedRoute>} />
      <Route path='/seller/reviews' element={<ProtectedRoute role="seller"><Reviews /></ProtectedRoute>} />
      <Route path='/seller/settings' element={<ProtectedRoute role="seller"><Settings /></ProtectedRoute>} />
    </Route>
  )
);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={Store}>
    <RouterProvider router={router} />
  </Provider>
);
