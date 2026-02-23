import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    customerprofile: null,
    sellerprofile: null,
    userID: localStorage.getItem("userID") || null,
    role: localStorage.getItem("role") || null,
    token: localStorage.getItem("token") || null,
    isProfileCreated: localStorage.getItem("isProfileCreated") === "true",
};

const Customerslice = createSlice({
    name: "Customer",
    initialState,
    reducers: {
        setProfiledata: (state, action) => {
            state.customerprofile = action.payload;
        },
        sellerprofiledata: (state, action) => {
            state.sellerprofile = action.payload;
        },
        loginSuccess: (state, action) => {
            const { token, userID, role, isProfileCreated } = action.payload;
            state.token = token;
            state.userID = userID;
            state.role = role;
            state.isProfileCreated = isProfileCreated;
            // Persist to localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userID", userID);
            localStorage.setItem("role", role);
            localStorage.setItem("isProfileCreated", isProfileCreated);
        },
        logout: (state) => {
            state.token = null;
            state.userID = null;
            state.role = null;
            state.isProfileCreated = false;
            state.customerprofile = null;
            state.sellerprofile = null;
            localStorage.removeItem("token");
            localStorage.removeItem("userID");
            localStorage.removeItem("role");
            localStorage.removeItem("isProfileCreated");
        },
        setProfileCreated: (state) => {
            state.isProfileCreated = true;
            localStorage.setItem("isProfileCreated", "true");
        },
    }
});

export const {
    setProfiledata,
    sellerprofiledata,
    loginSuccess,
    logout,
    setProfileCreated
} = Customerslice.actions;

export const Customerreducer = Customerslice.reducer;
