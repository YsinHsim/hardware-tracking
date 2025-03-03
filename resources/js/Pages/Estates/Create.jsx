import React, { useState } from 'react';
import { router } from '@inertiajs/react'
import Layout from '../Layouts/Layout';
import ToastComponent from '../Components/ToastComponent';

export default function Create({ estates, regions }) {

    {/* STATE FOR TOAST MESSAGE */ }
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState(""); // "success" or "warning"

    {/* ESTATE STUFF START HERE /////////////////////   */ }
    const [estateValues, setEstateValues] = useState({
        estate_name: "",
        region_id: "",
    })

    function handleChangeEstate(e) {
        const key = e.target.id;
        const value = e.target.value
        setEstateValues(values => ({
            ...values,
            [key]: value,
        }))
    }

    function handleSubmitEstate(e) {
        e.preventDefault();

        router.post('/estates', estateValues, {
            onSuccess: () => {
                setEstateValues({ estate_name: "", region_id: "" }); // Reset form
                setToastMessage("New estate created successfully!");
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Error submitting estate:", errors);
                setToastMessage("Failed to create estate. Please check your input.");
                setToastType("alert-warning");
            }
        });
    }

    {/* ///////////////////////////////////// */ }
    {/* REGION STUFF START HERE /////////////////////   */ }
    const [regionValues, setRegionValues] = useState({
        region_name: "",
    });

    function handleChangeRegion(e) {
        const key = e.target.id;
        const value = e.target.value;
        setRegionValues(values => ({
            ...values,
            [key]: value,
        }));
    }

    function handleSubmitRegion(e) {
        e.preventDefault();

        router.post('/regions', regionValues, {
            onSuccess: () => {
                setRegionValues({ region_name: "" }); // Reset form
                setToastMessage("New region created successfully!");
                setToastType("success");
            },
            onError: (errors) => {
                console.error("Error submitting form:", errors);
                setToastMessage("Failed to submit. Please check your input.");
                setToastType("warning");
            }
        });
    }
    {/* ///////////////////////////////////// */ }



    return (
        <Layout>
            {toastMessage && (
                <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">Estate Management</p>
                    <p className="text-sm font-normal animate-pulse">Create Estate & Region.</p>
                </div>

                <div className="divider" />

                <div className="mx-4 mt-1">
                    <div className="md:flex gap-2">

                        {regions?.length > 0 && (
                            <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                                <div className="card-body">
                                    <h2 className="card-title text-primary">Create Estate</h2>
                                    <form onSubmit={handleSubmitEstate} className="mt-1">
                                        <div className="flex flex-col space-y-2">
                                            {estates?.length > 0 && (
                                                <div className="mt-2 mb-4">
                                                    <p className="text-xl font-semibold">Recent Created Estates</p>
                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        {estates
                                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by recent date
                                                            .slice(0, 3) // Take the first 4 (most recent)
                                                            .map(estate => (
                                                                <div key={estate.id} className="btn btn-neutral rounded-md">
                                                                    {estate.estate_name}
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                            <input type="text" placeholder="Estate Name *" className="input input-bordered w-full text-sm"
                                                id="estate_name" value={estateValues.estate_name} onChange={handleChangeEstate} required />
                                            <select className="select select-bordered w-full"
                                                id="region_id" value={estateValues.region_id} onChange={handleChangeEstate} required>
                                                <option value="">Select Region *</option>
                                                {regions.map(region => (
                                                    <option key={region.id} value={region.id}>{region.region_name}</option>
                                                ))}
                                            </select>
                                            <div className="card-actions justify-end">
                                                <button type="submit" className="btn btn-sm btn-primary px-8 py-1">Create</button>
                                            </div>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        )}

                        <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                            <div className="card-body">
                                {regions?.length > 0 && (
                                    <h2 className="card-title text-primary">Create Region</h2>
                                )}
                                <form onSubmit={handleSubmitRegion} className="mt-1">
                                    <div className="flex flex-col space-y-2">
                                        {regions?.length > 0 ? (
                                            <div className="mt-2 mb-4">
                                                <p className="text-xl font-semibold">Region List</p>
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    {regions.map(region => (
                                                        <div key={region.id} className="btn btn-neutral rounded-md">{region.region_name}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hero bg-base-300 rounded-sm">
                                                <div className="hero-content text-left">
                                                    <h2 className="text-xl text-secondary animate-pulse">Region don't exist. Please create one.</h2>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            {regions?.length <= 0 && (
                                                <p className="text-2xl mb-1">Create Region</p>
                                            )}
                                            <input type="text" placeholder="Region Name *" className="input input-bordered w-full text-sm"
                                                id="region_name" value={regionValues.region_name} onChange={handleChangeRegion} required />
                                        </div>
                                        <div className="card-actions justify-end">
                                            <button type="submit" className="btn btn-sm btn-primary px-8 py-1">Create</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    )
}