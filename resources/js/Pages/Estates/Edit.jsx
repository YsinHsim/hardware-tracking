import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import ToastComponent from '../Components/ToastComponent';

export default function Edit({ estate, regions }) {

    {/* Handle Toast state */ }
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    {/* ESTATE STUFF START HERE /////////////////////   */ }
    const [estateValues, setEstateValues] = useState({
        estate_name: estate.estate_name,
        region_id: estate.region_id
    });

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value
        setEstateValues(values => ({
            ...values,
            [key]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(`/estates/${estate.id}`, estateValues, {
            onSuccess: () => {
                setToastMessage("Estate updated successfully!");
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Update failed:", errors);
                setToastMessage("Failed to update estate. Please try again.");
                setToastType("alert-error");
            }
        });
    };


    return (
        <Layout>
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">Estate Management</p>
                    <p className="text-sm font-normal animate-pulse">Edit & Update Estate Data.</p>
                </div>

                <div className="divider" />

                <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                    <div className="card-body">
                        <h2 className="card-title text-primary">Edit Estate</h2>
                        <form onSubmit={handleSubmit} className="mt-1">
                            <div className="flex flex-col space-y-2">
                                <div>
                                    <label className="text-sm font-semibold">Estate Name</label>
                                    <input type="text" placeholder="Enter Estate Name" className="input input-bordered w-full text-sm"
                                        id="estate_name" value={estateValues.estate_name} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Region</label>
                                    <select className="select select-bordered w-full"
                                        id="region_id"
                                        value={estateValues.region_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        {/* Show the current region_name as the first option */}
                                        <option value={estateValues.region_id}>
                                            {regions.find(region => region.id === estateValues.region_id)?.region_name || "Select a Region"}
                                        </option>

                                        {/* List all available regions, except the selected one (optional) */}
                                        {regions
                                            .filter(region => region.id !== estateValues.region_id)
                                            .map(region => (
                                                <option key={region.id} value={region.id}>{region.region_name}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="card-actions justify-end">
                                    <button type="submit" className="btn btn-sm btn-primary px-8 py-1 mt-2">Update</button>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>

                {/* Toast Notification */}
                <ToastComponent
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastMessage("")} // Clear the toast message after closing
                />

            </div>
        </Layout>
    )
}