import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Cart from "./Cart";

jest.mock(
    "react-router-dom",
    () => ({
        Link: ({ children, to }) => <a href={to}>{children}</a>
    }),
    { virtual: true }
);
jest.mock("axios", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        post: jest.fn()
    }
}));
jest.mock("sweetalert2", () => ({
    fire: jest.fn()
}));
jest.mock("./Header", () => (props) => <div>Header cart:{props.cartCount}</div>);
jest.mock("./Footer", () => () => <div>Footer</div>);

describe("Cart page", () => {
    const userId = "507f1f77bcf86cd799439011";

    beforeEach(() => {
        localStorage.setItem("loginid", userId);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("loads and shows empty cart state", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("/Easeincart/cart/get/")) {
                return Promise.resolve({
                    data: {
                        status: "success",
                        cart: { items: [] },
                        totals: { itemCount: 0, subTotal: 0 }
                    }
                });
            }

            if (url.includes("/Easeincart/customer/getprofile/")) {
                return Promise.resolve({
                    data: {
                        status: "success",
                        profile: { shippingaddress: ["Address line 1"] }
                    }
                });
            }

            return Promise.resolve({ data: { status: "success" } });
        });

        render(<Cart />);

        expect(screen.getByText(/Loading cart/i)).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByText(/Your cart is empty/i)).toBeTruthy();
        });

        expect(axios.get).toHaveBeenCalledWith(`/Easeincart/cart/get/${userId}`);
        expect(screen.getByText(/Header cart:0/i)).toBeTruthy();
    });
});
