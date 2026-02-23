import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Analytics from "./Analytics";

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));
jest.mock("./Sidebar", () => () => <div>Sidebar</div>);
jest.mock("./Rightside", () => () => <div>Rightside</div>);

describe("Analytics page", () => {
    const sellerId = "507f1f77bcf86cd799439011";

    beforeEach(() => {
        localStorage.setItem("loginid", sellerId);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("shows loading and then empty analytics state when all metrics are zero", async () => {
        axios.get.mockResolvedValue({
            data: {
                status: "success",
                analytics: {
                    totalOrders: 0,
                    pendingOrders: 0,
                    deliveredOrders: 0,
                    totalRevenue: 0,
                    totalProducts: 0,
                    totalCustomers: 0,
                    totalReviews: 0
                }
            }
        });

        render(<Analytics />);

        expect(screen.getByText(/Loading analytics/i)).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByText(/No analytics data available yet/i)).toBeTruthy();
        });

        expect(axios.get).toHaveBeenCalledWith(`/Easeincart/analytics/seller/${sellerId}`);
    });
});
