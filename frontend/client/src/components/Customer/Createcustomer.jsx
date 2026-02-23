import React, { useState, useEffect } from 'react'
import "./../styles/customer.css"
import nouser from "./../../assets/images/logo/nouser.webp"
import API from '../../config/api.js';
import Swal from "sweetalert2"
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProfiledata, setProfileCreated } from '../../reducers/Reducers.js';

const Createcustomer = () => {
    const Navigate = useNavigate()
    const dispatch = useDispatch()

    // Pull existing profile from Redux (may already be loaded by login/header)
    const existingProfile = useSelector((state) => state.customer.customerprofile)
    const userID = useSelector((state) => state.customer.userID) || localStorage.getItem("userID")
    const isProfileCreated = useSelector((state) => state.customer.isProfileCreated)

    const isEditMode = !!existingProfile || (isProfileCreated === true)

    const [formvalue, setFormvalue] = useState({
        name: "",
        shippingaddress: "",
        mobileno: ""
    })
    const [profileimg, setProfileimg] = useState(null)
    const [profileimgurl, setUrl] = useState(null)    // preview URL
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [error, setError] = useState(false)

    // ── Pre-fill form with existing profile data ──────────────────────────
    useEffect(() => {
        if (existingProfile) {
            setFormvalue({
                name: existingProfile.name || "",
                mobileno: existingProfile.mobileno || "",
                shippingaddress: Array.isArray(existingProfile.shippingaddress)
                    ? existingProfile.shippingaddress[0] || ""
                    : existingProfile.shippingaddress || "",
            })
            // Show existing photo as preview
            if (existingProfile.profileimg) setUrl(existingProfile.profileimg)
        }
    }, [existingProfile])

    // ── Fetch profile if not yet in Redux but user has a profile ──────────
    useEffect(() => {
        if (!existingProfile && userID && isProfileCreated) {
            setFetching(true)
            API.get(`/customer/getprofile/${userID}`)
                .then(res => {
                    if (res.data.status === 'success' && res.data.profile) {
                        dispatch(setProfiledata(res.data.profile))
                        // form will update via the above effect
                    }
                })
                .catch(() => { })
                .finally(() => setFetching(false))
        }
    }, [existingProfile, userID, isProfileCreated, dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormvalue({ ...formvalue, [name]: value })
    }

    const handelfilchange = (e) => {
        const imgfile = e.target.files[0]
        if (!imgfile) return
        setProfileimg(imgfile)
        setUrl(URL.createObjectURL(imgfile))
    }

    const handelValidation = () => {
        setError(formvalue.mobileno.length !== 10)
    }

    const handelsubmit = async (e) => {
        e.preventDefault()
        if (error) return

        try {
            setLoading(true)
            const formdata = new FormData()
            formdata.append("name", formvalue.name)
            formdata.append("mobileno", formvalue.mobileno)
            formdata.append("shippingaddress", formvalue.shippingaddress)
            formdata.append("userID", userID)
            if (profileimg) formdata.append("profileimg", profileimg)

            let response;
            if (isEditMode) {
                // Update existing profile
                response = await API.put("/customer/profile", formdata)
            } else {
                // Create new profile — image required
                if (!profileimg) {
                    Swal.fire({ icon: 'warning', title: 'Please upload a profile photo' })
                    setLoading(false)
                    return
                }
                response = await API.post("/customer/profile", formdata)
            }

            if (response.data.status === "success") {
                // Update Redux immediately — header reflects change right away
                const profile = response.data.profile
                dispatch(setProfiledata(profile))
                dispatch(setProfileCreated())

                Swal.fire({
                    title: response.data.message,
                    icon: "success",
                    timer: 1800,
                    showConfirmButton: false,
                })
                Navigate("/customer/home")
            } else {
                Swal.fire({ icon: "error", title: response.data.message })
            }

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: err.response?.data?.message || err.message,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Header />
            <div className='main-div'>
                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={loading || fetching}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                <div className="wrapper-div">
                    <div className="card">
                        <div className="card-inner">
                            <h2>{isEditMode ? 'Update Your Profile' : 'Complete Your Profile'}</h2>
                            <p className="card-subtitle">
                                {isEditMode
                                    ? 'Change your details below and save'
                                    : 'Tell us a bit about yourself to get started'}
                            </p>

                            {/* ── Avatar upload ── */}
                            <div className="upload-section">
                                <div className="profile-pic-container">
                                    <img
                                        src={profileimgurl || nouser}
                                        alt="Profile"
                                        className="profile-pic"
                                    />
                                    <label htmlFor="file-upload" className="upload-icon">
                                        {isEditMode ? '✎' : '+'}
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="fileinput"
                                    hidden
                                    accept="image/*"
                                    onChange={handelfilchange}
                                />
                                {isEditMode && (
                                    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>
                                        Click the pencil to change photo (optional)
                                    </p>
                                )}
                            </div>

                            <form className="form" onSubmit={handelsubmit}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        required
                                        placeholder='Full Name'
                                        name="name"
                                        onChange={handleChange}
                                        value={formvalue.name}
                                    />
                                </div>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        required
                                        placeholder='Phone Number (10 digits)'
                                        maxLength='10'
                                        onBlur={handelValidation}
                                        name="mobileno"
                                        onChange={handleChange}
                                        value={formvalue.mobileno}
                                    />
                                </div>
                                {error && (
                                    <p className="mobile-error">⚠ Please enter a valid 10-digit phone number</p>
                                )}

                                <div className="input-group">
                                    <input
                                        type='text'
                                        required
                                        placeholder='Shipping Address'
                                        name="shippingaddress"
                                        onChange={handleChange}
                                        value={formvalue.shippingaddress}
                                    />
                                </div>

                                <button type="submit" disabled={error || loading} className="submit-btn">
                                    {loading
                                        ? (isEditMode ? 'Updating...' : 'Creating...')
                                        : (isEditMode ? 'Save Changes →' : 'Complete Profile →')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Createcustomer;