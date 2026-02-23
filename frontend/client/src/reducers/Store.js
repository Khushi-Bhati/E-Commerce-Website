import { configureStore } from '@reduxjs/toolkit';
import { Customerreducer } from './Reducers.js';

const Store = configureStore({
    reducer: {
        customer: Customerreducer,
    }
});

export default Store;
