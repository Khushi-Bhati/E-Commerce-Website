import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Reviews from "./Reviews";

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));
jest.mock("./Sidebar", () => () => <div>Sidebar</div>);
jest.mock("./Rightside", () => () => <div>Rightside</div>);

describe("Reviews page", () => {
    const sellerId = "507f1f77bcf86cd799439011";

    beforeEach(() => {
        localStorage.setItem("loginid", sellerId);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("shows loading and then empty state when no reviews are returned", async () => {
        axios.get.mockResolvedValue({
            data: {
                status: "success",
                reviews: []
            }
        });

        render(<Reviews />);

        expect(screen.getByText(/Loading reviews/i)).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByText(/No reviews found for this seller/i)).toBeTruthy();
        });

        expect(axios.get).toHaveBeenCalledWith(`/Easeincart/review/seller/${sellerId}`);
    });
});
