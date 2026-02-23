import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from '../../config/api.js';
import Swal from "sweetalert2";
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import "./../styles/Seller/Settings.css";

const DEFAULT_SETTINGS = {
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    taxPercentage: 0
};

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP"];
const TIMEZONE_OPTIONS = [
    "Asia/Kolkata",
    "UTC",
    "America/New_York",
    "Europe/London",
    "Asia/Dubai",
    "Asia/Singapore"
];

const Settings = () => {
    const sellerId = localStorage.getItem("userID") || "";

    const [formValue, setFormValue] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const getSettings = useCallback(async () => {
        if (!sellerId) {
            setFormValue(DEFAULT_SETTINGS);
            setError("Seller session not found. Please login again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await API.get(`/setting/${sellerId}`);
            if (response.data.status === "success") {
                setFormValue({
                    ...DEFAULT_SETTINGS,
                    ...(response.data.settings || {})
                });
            } else {
                setFormValue(DEFAULT_SETTINGS);
                setError(response.data.message || "Failed to load settings.");
            }
        } catch (requestError) {
            setFormValue(DEFAULT_SETTINGS);
            setError(requestError?.response?.data?.message || "Failed to load settings. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        getSettings();
    }, [getSettings]);

    const hasConfiguredSettings = useMemo(() => {
        const tax = Number(formValue.taxPercentage || 0);
        return Boolean(
            formValue.storeName?.trim() ||
            formValue.storeEmail?.trim() ||
            formValue.storePhone?.trim() ||
            formValue.storeAddress?.trim() ||
            formValue.currency !== DEFAULT_SETTINGS.currency ||
            formValue.timezone !== DEFAULT_SETTINGS.timezone ||
            tax > 0
        );
    }, [formValue]);

    const validateForm = () => {
        const errors = {};

        const email = formValue.storeEmail.trim();
        const phone = formValue.storePhone.trim();
        const tax = Number(formValue.taxPercentage);

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.storeEmail = "Enter a valid email address.";
        }

        if (phone && !/^\d{7,15}$/.test(phone)) {
            errors.storePhone = "Phone must contain 7 to 15 digits.";
        }

        if (Number.isNaN(tax) || tax < 0 || tax > 100) {
            errors.taxPercentage = "Tax % must be between 0 and 100.";
        }

        if (formValue.currency && !CURRENCY_OPTIONS.includes(formValue.currency)) {
            errors.currency = "Select a valid currency.";
        }

        if (formValue.timezone && !TIMEZONE_OPTIONS.includes(formValue.timezone)) {
            errors.timezone = "Select a valid timezone.";
        }

        return errors;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValue((prev) => ({
            ...prev,
            [name]: value
        }));

        setValidationErrors((prev) => {
            if (!prev[name]) {
                return prev;
            }
            const nextErrors = { ...prev };
            delete nextErrors[name];
            return nextErrors;
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();

        const errors = validateForm();
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            setSaving(true);
            const payload = {
                storeName: formValue.storeName.trim(),
                storeEmail: formValue.storeEmail.trim(),
                storePhone: formValue.storePhone.trim(),
                storeAddress: formValue.storeAddress.trim(),
                currency: formValue.currency,
                timezone: formValue.timezone,
                taxPercentage: Number(formValue.taxPercentage || 0)
            };

            const response = await API.put(`/setting/${sellerId}`, payload);
            if (response.data.status === "success") {
                setFormValue({
                    ...DEFAULT_SETTINGS,
                    ...(response.data.settings || payload)
                });
                Swal.fire({
                    icon: "success",
                    title: response.data.message || "Settings updated"
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: response.data.message || "Failed to update settings"
                });
            }
        } catch (requestError) {
            Swal.fire({
                icon: "error",
                title: requestError?.response?.data?.message || "Failed to update settings"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-wrapper">
            <Sidebar />
            <main className="settings-main">
                <div className="settings-header">
                    <h1>Settings</h1>
                    <button type="button" className="settings-refresh-btn" onClick={getSettings} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {loading && <div className="settings-state-card">Loading settings...</div>}

                {!loading && error && (
                    <div className="settings-state-card settings-error-card">
                        <p>{error}</p>
                        <button type="button" className="settings-retry-btn" onClick={getSettings}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && !hasConfiguredSettings && (
                    <div className="settings-state-card">No store settings configured yet.</div>
                )}

                {!loading && !error && (
                    <form className="settings-form-card" onSubmit={handleSave}>
                        <div className="settings-grid">
                            <div>
                                <label htmlFor="storeName">Store Name</label>
                                <input
                                    id="storeName"
                                    name="storeName"
                                    value={formValue.storeName}
                                    onChange={handleChange}
                                    placeholder="e.g. EaseinCart Official Store"
                                />
                            </div>

                            <div>
                                <label htmlFor="storeEmail">Store Email</label>
                                <input
                                    id="storeEmail"
                                    name="storeEmail"
                                    value={formValue.storeEmail}
                                    onChange={handleChange}
                                    placeholder="e.g. store@example.com"
                                />
                                {validationErrors.storeEmail && <small>{validationErrors.storeEmail}</small>}
                            </div>

                            <div>
                                <label htmlFor="storePhone">Store Phone</label>
                                <input
                                    id="storePhone"
                                    name="storePhone"
                                    value={formValue.storePhone}
                                    onChange={handleChange}
                                    placeholder="Digits only"
                                />
                                {validationErrors.storePhone && <small>{validationErrors.storePhone}</small>}
                            </div>

                            <div>
                                <label htmlFor="currency">Currency</label>
                                <select id="currency" name="currency" value={formValue.currency} onChange={handleChange}>
                                    {CURRENCY_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.currency && <small>{validationErrors.currency}</small>}
                            </div>

                            <div>
                                <label htmlFor="timezone">Timezone</label>
                                <select id="timezone" name="timezone" value={formValue.timezone} onChange={handleChange}>
                                    {TIMEZONE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.timezone && <small>{validationErrors.timezone}</small>}
                            </div>

                            <div>
                                <label htmlFor="taxPercentage">Tax Percentage</label>
                                <input
                                    id="taxPercentage"
                                    name="taxPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formValue.taxPercentage}
                                    onChange={handleChange}
                                />
                                {validationErrors.taxPercentage && <small>{validationErrors.taxPercentage}</small>}
                            </div>

                            <div className="settings-full">
                                <label htmlFor="storeAddress">Store Address</label>
                                <textarea
                                    id="storeAddress"
                                    name="storeAddress"
                                    value={formValue.storeAddress}
                                    onChange={handleChange}
                                    placeholder="Store full address"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </form>
                )}
            </main>
            <Rightside />
        </div>
    );
};

export default Settings;
