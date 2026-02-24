import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import Rightside from './Rightside';
import { useDispatch, useSelector } from 'react-redux';
import { sellerprofiledata } from "./../../reducers/Reducers.js"
import API from '../../config/api.js';
import "./../styles/Seller/Dasbaord.css"
import { Link } from "react-router-dom";


const Dashboard = () => {
  useSelector((state) => state.customer.sellerprofile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const Dispatch = useDispatch()

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const getprofile = async () => {
    try {
      const profileresponse = await API.get(`/seller/getprofile/${localStorage.getItem("userID")}`);

      if (profileresponse.data.status === "success") {
        Dispatch(sellerprofiledata(profileresponse.data.profile))
      }
      else {
        console.log("something went wrong")
      }
    } catch (error) {
      console.log("error is ", error)
    }
  }

  useEffect(() => {
    getprofile()
  }, [])

  return (
    <div className='main-wrapper'>
      <Sidebar isOpen={isSidebarOpen} onOpen={openSidebar} onClose={closeSidebar} />

      <main>
        <h1 className="dashboard-page-title">Dashboard</h1>
        <div className="date">
          <input type="date" />
        </div>
        <div className="insights">
          {/* Total Sales */}
          <div className="sales">
            <span className="material-symbols-sharp">trending_up</span>
            <div className="middle">
              <div className="left">
                <h3>Total Sales</h3>
                <h1>$25,024</h1>
              </div>
              <div className="progress">
                <svg>
                  <circle r={30} cy={40} cx={40} />
                </svg>
                <div className="number"><p>80%</p></div>
              </div>
            </div>
            <small>Last 24 Hours</small>
          </div>

          {/* Total Expenses */}
          <div className="expenses">
            <span className="material-symbols-sharp">local_mall</span>
            <div className="middle">
              <div className="left">
                <h3>Total Expenses</h3>
                <h1>$8,420</h1>
              </div>
              <div className="progress">
                <svg>
                  <circle r={30} cy={40} cx={40} />
                </svg>
                <div className="number"><p>62%</p></div>
              </div>
            </div>
            <small>Last 24 Hours</small>
          </div>

          {/* Net Income */}
          <div className="income">
            <span className="material-symbols-sharp">stacked_line_chart</span>
            <div className="middle">
              <div className="left">
                <h3>Net Income</h3>
                <h1>$16,604</h1>
              </div>
              <div className="progress">
                <svg>
                  <circle r={30} cy={40} cx={40} />
                </svg>
                <div className="number"><p>91%</p></div>
              </div>
            </div>
            <small>Last 24 Hours</small>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent_order">
          <h2>Recent Orders</h2>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Order #</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Mini USB Cable</td>
                  <td>#4563</td>
                  <td>Paid</td>
                  <td className="warning">Pending</td>
                  <td className="primary">Details</td>
                </tr>
                <tr>
                  <td>Bluetooth Speaker</td>
                  <td>#4564</td>
                  <td>Due</td>
                  <td className="warning">Processing</td>
                  <td className="primary">Details</td>
                </tr>
                <tr>
                  <td>Wireless Mouse</td>
                  <td>#4565</td>
                  <td>Paid</td>
                  <td className="warning">Shipped</td>
                  <td className="primary">Details</td>
                </tr>
                <tr>
                  <td>USB-C Hub</td>
                  <td>#4566</td>
                  <td>Paid</td>
                  <td className="warning">Pending</td>
                  <td className="primary">Details</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Link to="/seller/orders">Show All Orders →</Link>
        </div>
      </main>
      <Rightside isSidebarOpen={isSidebarOpen} onOpenSidebar={openSidebar} onCloseSidebar={closeSidebar} />
    </div>
  )
}

export default Dashboard;
