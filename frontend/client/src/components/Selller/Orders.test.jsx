import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Orders from "./Orders";

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        put: jest.fn()
    }
}));
jest.mock("sweetalert2", () => ({
    fire: jest.fn()
}));
jest.mock("./Sidebar", () => () => <div>Sidebar</div>);
jest.mock("./Rightside", () => () => <div>Rightside</div>);

describe("Orders page", () => {
    const sellerId = "507f1f77bcf86cd799439011";

    beforeEach(() => {
        localStorage.setItem("loginid", sellerId);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("shows loading and then empty state when no orders are returned", async () => {
        axios.get.mockResolvedValue({
            data: {
                status: "success",
                orders: []
            }
        });

        render(<Orders />);

        expect(screen.getByText(/Loading orders/i)).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByText(/No orders found for this seller/i)).toBeTruthy();
        });

        expect(axios.get).toHaveBeenCalledWith(`/Easeincart/order/seller/${sellerId}`);
    });
});
