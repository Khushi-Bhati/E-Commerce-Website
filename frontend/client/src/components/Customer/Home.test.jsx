import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import axios from "axios";
import Store from "../../reducers/Store";
import Home from "./Home";

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn()
    }
}));
jest.mock("sweetalert2", () => ({
    fire: jest.fn()
}));
jest.mock("./Header", () => (props) => <div>Header cart:{props.cartCount}</div>);
jest.mock("./Footer", () => () => <div>Footer</div>);
jest.mock("./Banner", () => () => <div>Banner</div>);
jest.mock("./Category", () => (props) => <div>Category items:{props.categoryStats.length}</div>);
jest.mock("./Sidebar", () => (props) => <div>Sidebar best:{props.bestSellerProducts.length}</div>);
jest.mock("./Productminimal", () => (props) => <div>Productminimal count:{props.products.length} loading:{String(props.loading)}</div>);
jest.mock("./Productfeatured", () => (props) => <div>Productfeatured count:{props.products.length} loading:{String(props.loading)}</div>);
jest.mock("./Productgrid", () => (props) => <div>Productgrid count:{props.products.length} loading:{String(props.loading)}</div>);
jest.mock("./Testimonials", () => () => <div>Testimonials</div>);
jest.mock("./Blog", () => () => <div>Blog</div>);

describe("Customer Home page", () => {
    const loginId = "507f1f77bcf86cd799439011";

    beforeEach(() => {
        localStorage.setItem("loginid", loginId);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("loads products and renders empty product state in sections", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("/Easeincart/customer/getprofile/")) {
                return Promise.resolve({
                    data: { status: "success", profile: { userID: { email: "buyer@test.com" } } }
                });
            }
            if (url.includes("/Easeincart/cart/get/")) {
                return Promise.resolve({
                    data: { status: "success", totals: { itemCount: 0 } }
                });
            }
            if (url === "/Easeincart/product/getproducts") {
                return Promise.resolve({
                    data: { status: "success", products: [] }
                });
            }
            return Promise.resolve({ data: { status: "success" } });
        });

        render(
            <Provider store={Store}>
                <Home />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Productgrid count:0 loading:false/i)).toBeTruthy();
        });

        expect(axios.get).toHaveBeenCalledWith("/Easeincart/product/getproducts");
        expect(screen.getByText(/Header cart:0/i)).toBeTruthy();
    });
});
