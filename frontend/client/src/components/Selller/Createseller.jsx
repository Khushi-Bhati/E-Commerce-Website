
import React, { useState } from 'react'

import "./../styles/customer.css"

import nouser from "./../../assets/images/logo/nouser.webp"
import API from '../../config/api.js';
import Swal from "sweetalert2"
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';





const Createseller = () => {
    const Navigate = useNavigate()

    const [formvalue, setFormvalue] = useState({
        name: "",
        address: "",
        mobileno: ""



    })
    const [profileimg, setProfileimg] = useState(null)
    const [profileimgurl, setUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormvalue({
            ...formvalue,
            [name]: value,
        })

    }

    const handelfilchange = (e) => {
        const imgfile = e.target.files[0]
        setProfileimg(imgfile)

        const imgurl = URL.createObjectURL(imgfile)
        setUrl(imgurl)

    }



    const handelsubmit = async (e) => {
        try {
            e.preventDefault();
            setLoading(true)
            const formdata = new FormData();
            formdata.append("address", formvalue.address)
            formdata.append("name", formvalue.name)
            formdata.append("mobileno", formvalue.mobileno)
            formdata.append("profileimg", profileimg)
            formdata.append("userID", localStorage.getItem("userID"))

            const createresponse = await API.post("/seller/sellerprofile",
                formdata
            )

            if (createresponse.data.status === "success") {
                setLoading(false)
                Swal.fire({
                    title: `${createresponse.data.message}`,
                    icon: "success",
                    draggable: true
                });
                Navigate("/seller/dashboard")

            }
            else {
                setLoading(false)
                Swal.fire({
                    icon: "error",
                    title: `${createresponse.data.message}`,


                });

            }




        } catch (error) {
            setLoading(false)
            console.log("create seller error", error)

        }

    }


    const handelValidation = () => {

        if (formvalue.mobileno.length !== 10) {

            setError(true)

        }
        else {
            setError(false)
        }

    }
    return (
        <div>

            <div className='main-div' style={{
                height:
                    "900px"
            }}>

                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={loading}

                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <div className="wrapper-div">
                    <div className="card">
                        <h2>Create Your Profile</h2>

                        <div className="upload-section">
                            <div className="profile-pic-container">
                                <img src={profileimgurl === null ? nouser : profileimgurl} alt="Profile" className="profile-pic" />

                                <label htmlFor="file-upload" className="upload-icon">+</label>


                            </div>

                            <input type="file" id="file-upload" className="fileinput" hidden onChange={handelfilchange} />
                        </div>
                        <form className="form" onSubmit={handelsubmit}>
                            <div className="input-group">
                                <input type="text" required placeholder='Name' name="name" onChange={handleChange} value={formvalue.name} />

                            </div>
                            {error && <p style={{ color: "red", fontSize: "15px", fontWeight: "bold", textAlign: "left", }}>Please enter 10 digit number</p>}

                            <div className="input-group">
                                <input type="text" required placeholder='Phone Number' maxLength='10' onBlur={handelValidation} name="mobileno" onChange={handleChange} value={formvalue.mobileno} />

                            </div>

                            <div className="input-group">
                                <input type='text' required placeholder='Address' name="address" onChange={handleChange} value={formvalue.address} />

                            </div>

                            <button type="submit" style={error ? { backgroundColor: 'grey' } : { backgroundColor: "#e91e63" }}

                                disabled={error}
                                className="submit-btn">Create Profile</button>
                        </form>


                    </div>
                </div>
            </div>
        </div>
    )
}

export default Createseller