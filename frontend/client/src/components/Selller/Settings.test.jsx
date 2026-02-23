import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Settings from "./Settings";

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

describe("Settings page", () => {
    const sellerId = "507f1f77bcf86cd799439011";

    beforeEach(() => {
        localStorage.setItem("loginid", sellerId);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("shows loading and then empty config state when defaults are returned", async () => {
        axios.get.mockResolvedValue({
            data: {
                status: "success",
                settings: {
                    storeName: "",
                    storeEmail: "",
                    storePhone: "",
                    storeAddress: "",
                    currency: "INR",
                    timezone: "Asia/Kolkata",
                    taxPercentage: 0
                }
            }
        });

        render(<Settings />);

        expect(screen.getByText(/Loading settings/i)).toBeTruthy();

        await waitFor(() => {
            expect(screen.getByText(/No store settings configured yet/i)).toBeTruthy();
        });

        expect(axios.get).toHaveBeenCalledWith(`/Easeincart/setting/${sellerId}`);
    });
});
