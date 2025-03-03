import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import ToastComponent from '../Components/ToastComponent';

export default function Create({ estates, assignedUsers, hardwareTypes, hardwareStatuses }) {
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");
    const [selectedEstate, setSelectedEstate] = useState("");

    const [hardwareValues, setHardwareValues] = useState({
        hardware_no: "",
        hardware_serial_no: "",
        assigned_user_id: "",
        hardware_type_id: "",
        hardware_status_id: "",
    });

    function handleChange(e) {
        const { id, value } = e.target;
        setHardwareValues((values) => ({
            ...values,
            [id]: value,
        }));
    }

    function handleEstateChange(e) {
        setSelectedEstate(e.target.value);
        setHardwareValues((values) => ({
            ...values,
            assigned_user_id: "", // Reset assigned user selection when estate changes
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        router.post('/hardwares', hardwareValues, {
            onSuccess: () => {
                setHardwareValues({
                    hardware_no: "",
                    hardware_serial_no: "",
                    assigned_user_id: "",
                    hardware_type_id: "",
                    hardware_status_id: "",
                });
                setToastMessage("New hardware added successfully!");
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Error submitting hardware:", errors);
                setToastMessage("Failed to add hardware. Please check your input.");
                setToastType("alert-warning");
            }
        });
    }

    function getFilteredUsers(assignedUsers, selectedEstate) {
        console.log("estate_id:", selectedEstate);
        
        if (!selectedEstate || typeof assignedUsers !== "object") {
            console.log("Returned");
            return [];
        }
    
        return assignedUsers[selectedEstate] || []; // Return the array or an empty array
    }

    // Usage inside the component:
    const filteredUsers = getFilteredUsers(assignedUsers, selectedEstate);

    return (
        <Layout>
            {toastMessage && (
                <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">Hardware Management</p>
                <p className="text-sm font-normal animate-pulse">Add new hardware details.</p>
            </div>
            <div className="divider" />
            <div className="mx-4 mt-1">
                <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                    <div className="card-body">
                        <h2 className="card-title text-primary">Create Hardware</h2>
                        <form onSubmit={handleSubmit} className="mt-1">
                            <div className="flex flex-col space-y-2">
                                <input type="text" placeholder="Hardware No *" className="input input-bordered w-full text-sm"
                                    id="hardware_no" value={hardwareValues.hardware_no} onChange={handleChange} required />
                                <input type="text" placeholder="Serial No *" className="input input-bordered w-full text-sm"
                                    id="hardware_serial_no" value={hardwareValues.hardware_serial_no} onChange={handleChange} required />
                                <select className="select select-bordered w-full" onChange={handleEstateChange} required>
                                    <option value="">Select Estate *</option>
                                    {estates.map(estate => (
                                        <option key={estate.id} value={estate.id}>{estate.estate_name}</option>
                                    ))}
                                </select>
                                <select className="select select-bordered w-full" id="hardware_type_id" value={hardwareValues.hardware_type_id} onChange={handleChange} required>
                                    <option value="">Select Hardware Type *</option>
                                    {hardwareTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.hardware_type_name}</option>
                                    ))}
                                </select>
                                <select className="select select-bordered w-full" id="hardware_status_id" value={hardwareValues.hardware_status_id} onChange={handleChange} required>
                                    <option value="">Select Hardware Status *</option>
                                    {hardwareStatuses.map(status => (
                                        <option key={status.id} value={status.id}>{status.hardware_status_name}</option>
                                    ))}
                                </select>
                                <select className="select select-bordered w-full" id="assigned_user_id" value={hardwareValues.assigned_user_id} onChange={handleChange} disabled={!selectedEstate}>
                                    <option value="">Select Assigned User (Optional)</option>
                                    {filteredUsers.map(user => (
                                        <option key={user.id} value={user.id}>{user.user_name}</option>
                                    ))}
                                </select>
                                <div className="card-actions justify-end">
                                    <button type="submit" className="btn btn-sm btn-primary px-8 py-1">Create</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
