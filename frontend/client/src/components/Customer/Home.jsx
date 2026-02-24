import React, { useCallback, useEffect, useMemo, useState } from 'react'
import "./../styles/css/style-prefix.css"
import "./../styles/css/style.css"
import "./../styles/customer-home.css"
import Header from './Header';
import Footer from './Footer';
import Category from './Category';
import Blog from './Blog';
import Testimonials from './Testimonials';
import Banner from './Banner';
import Sidebar from './Sidebar';
import Productminimal from './Productminimal';
import Productfeatured from './Productfeatured';
import Productgrid from './Productgrid';
import API from '../../config/api.js';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setProfiledata } from '../../reducers/Reducers.js';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';


const Home = () => {
  const location = useLocation()
  useSelector((state) => state.customer.customerprofile)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [cartLoadingById, setCartLoadingById] = useState({})

  // Read initial search term and category from URL
  const getInitialSearchTerm = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get("search") || ""
  }
  const getInitialCategory = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get("category") || "all"
  }

  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm)
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)

    const urlSearch = params.get("search") || ""
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch)
    }

    const urlCategory = params.get("category") || "all"
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])


  const Dispatch = useDispatch()
  const loginId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

  const getprofile = useCallback(async () => {
    if (!loginId) return;

    try {
      const profileresponse = await API.get(`/customer/getprofile/${loginId}`);

      if (profileresponse.data.status === "success") {
        Dispatch(setProfiledata(profileresponse.data.profile))

      }
      else {
        console.log("something wents wromng")
      }


    } catch (error) {
      console.log("error is", error)


    }

  }, [Dispatch, loginId])



  useEffect(() => {
    getprofile()

  }, [getprofile])

  const getCart = useCallback(async () => {
    if (!loginId) {
      setCartCount(0);
      return;
    }
    try {
      const response = await API.get(`/cart/get/${loginId}`);
      if (response.data.status === "success") {
        setCartCount(response.data?.totals?.itemCount || 0);
      }
    } catch (error) {
      console.log("get cart error", error);
      setCartCount(0);
    }
  }, [loginId]);

  const getProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      setProductsError("");
      const response = await API.get("/product/getproducts");
      if (response.data.status === "success") {
        setProducts(response.data.products || []);
      }
      else {
        setProductsError("Failed to load products");
      }
    } catch (error) {
      console.log("get products error", error);
      setProductsError("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    getProducts();
    getCart();
  }, [getCart, getProducts]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.classList.add("customer-home-menu-open");
    } else {
      document.body.classList.remove("customer-home-menu-open");
    }

    return () => {
      document.body.classList.remove("customer-home-menu-open");
    };
  }, [isSidebarOpen]);

  const normalizeCategory = (value) => (value || "").toString().trim().toLowerCase();

  const categoryStats = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      const categoryKey = normalizeCategory(product.category);
      if (!categoryKey) return;
      counts[categoryKey] = (counts[categoryKey] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([key, count]) => ({
        key,
        label: key
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const categoryKey = normalizeCategory(product.category);
      const matchesCategory = selectedCategory === "all" || categoryKey === selectedCategory;
      if (!matchesCategory) return false;

      if (!keyword) return true;

      const searchableText = [
        product.productname,
        product.category,
        product.brand,
        product.description
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [products, searchTerm, selectedCategory]);

  const bestSellerProducts = useMemo(() => {
    return [...filteredProducts]
      .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
      .slice(0, 4);
  }, [filteredProducts]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const handleSidebarCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!loginId) {
      Swal.fire({
        icon: "warning",
        title: "Please login first"
      });
      return;
    }
    try {
      setCartLoadingById((prev) => ({ ...prev, [productId]: true }));
      const response = await API.post("/cart/add", {
        userId: loginId,
        productId,
        quantity: 1
      });

      if (response.data.status === "success") {
        setCartCount(response.data?.totals?.itemCount || 0);
        const selectedProduct = products.find((item) => item._id === productId) || filteredProducts.find((item) => item._id === productId);
        Swal.fire({
          icon: "success",
          title: "Added to cart",
          html: `
            <div style="text-align:left">
              <p><b>Name:</b> ${selectedProduct?.productname || "-"}</p>
              <p><b>Category:</b> ${selectedProduct?.category || "-"}</p>
              <p><b>Price:</b> Rs ${selectedProduct?.discount || selectedProduct?.price || "-"}</p>
              <p><b>Quantity:</b> 1</p>
            </div>
          `
        });
      } else {
        Swal.fire({
          icon: "error",
          title: response.data.message || "Failed to add to cart"
        });
      }
    } catch (error) {
      console.log("add to cart error", error);
      Swal.fire({
        icon: "error",
        title: error?.response?.data?.message || "Failed to add to cart"
      });
    } finally {
      setCartLoadingById((prev) => ({ ...prev, [productId]: false }));
    }
  };





  return (
    <>
      <Header
        cartCount={cartCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />


      <main>
        {/*
- BANNER
    */}
        <Banner />
        {/*
- CATEGORY
    */}
        <Category
          categoryStats={categoryStats}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        {/*
- PRODUCT
    */}
        <div className="product-container">
          <div className="container customer-home-mobile-menu-row">
           
          </div>
          {isSidebarOpen && (
            <button
              type="button"
              className="customer-home-sidebar-overlay"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close category menu"
            />
          )}
          <div className="container">
            {/*
    - SIDEBAR
  */}
            <Sidebar
              categoryStats={categoryStats}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSidebarCategorySelect}
              bestSellerProducts={bestSellerProducts}
              loading={productsLoading}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <div className="product-box">
              <div className="customer-home-toolbar">
                <p className="customer-home-result">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
                {(searchTerm.trim() || selectedCategory !== "all") && (
                  <button type="button" className="customer-home-clear" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
              {/*
      - PRODUCT MINIMAL
    */}
              <Productminimal
                products={filteredProducts}
                loading={productsLoading}
                error={productsError}
                onAddToCart={handleAddToCart}
                cartLoadingById={cartLoadingById}
              />
              {/*
      - PRODUCT FEATURED
    */}
              <Productfeatured
                products={filteredProducts}
                loading={productsLoading}
                error={productsError}
                onAddToCart={handleAddToCart}
                cartLoadingById={cartLoadingById}
              />
              {/*
      - PRODUCT GRID
    */}
              {/* <Productgrid
                products={filteredProducts}
                loading={productsLoading}
                error={productsError}
                onAddToCart={handleAddToCart}
                cartLoadingById={cartLoadingById}
              /> */}
            </div>
          </div>
        </div>
        {/*
- TESTIMONIALS, CTA & SERVICE
    */}
        <Testimonials />
        {/*
- BLOG
    */}
        <Blog />
      </main>



      <Footer />
    </>
  )
}

export default Home;
