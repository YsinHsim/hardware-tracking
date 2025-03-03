import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { router } from '@inertiajs/react';
import ToastComponent from '../Components/ToastComponent';

export default function Edit({ user, estates, positions }) {
    // Toast state
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    // User form state
    const [userValues, setUserValues] = useState({
        user_name: user.user_name,
        user_position_id: user.user_position_id || "",
        estate_id: user.estate_id || "",
    });

    const handleChange = (e) => {
        const key = e.target.id;
        const value = e.target.value;
        setUserValues((values) => ({
            ...values,
            [key]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(`/users/${user.id}`, userValues, {
            onSuccess: () => {
                setToastMessage("User updated successfully!");
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Update failed:", errors);
                setToastMessage("Failed to update user. Please try again.");
                setToastType("alert-error");
            },
        });
    };

    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">User Management</p>
                <p className="text-sm font-normal animate-pulse">Edit & Update User Data.</p>
            </div>

            <div className="divider" />

            <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                <div className="card-body">
                    <h2 className="card-title text-primary">Edit User</h2>
                    <form onSubmit={handleSubmit} className="mt-1">
                        <div className="flex flex-col space-y-2">
                            <div>
                                <label className="text-sm font-semibold">User Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter User Name"
                                    className="input input-bordered w-full text-sm"
                                    id="user_name"
                                    value={userValues.user_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Position</label>
                                <select
                                    className="select select-bordered w-full"
                                    id="user_position_id"
                                    value={userValues.user_position_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Position</option>
                                    {positions.map((position) => (
                                        <option key={position.id} value={position.id}>
                                            {position.position_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Estate</label>
                                <select
                                    className="select select-bordered w-full"
                                    id="estate_id"
                                    value={userValues.estate_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Estate</option>
                                    {estates.map((estate) => (
                                        <option key={estate.id} value={estate.id}>
                                            {estate.estate_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="card-actions justify-end">
                                <button type="submit" className="btn btn-sm btn-primary px-8 py-1 mt-2">
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast Notification */}
            <ToastComponent
                message={toastMessage}
                type={toastType}
                onClose={() => setToastMessage("")} // Clear toast after closing
            />
        </Layout>
    );
}
