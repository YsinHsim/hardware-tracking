import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { router } from '@inertiajs/react';
import ToastComponent from '../Components/ToastComponent';

export default function Edit({ hardware, hardwareTypes, hardwareStatuses, estates, assignedUsers }) {

    {/* Handle Toast state */}
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    {/* HARDWARE STUFF START HERE ///////////////////// */}
    const [hardwareValues, setHardwareValues] = useState({
        hardware_no: hardware.hardware_no,
        hardware_serial_no: hardware.hardware_serial_no || "",
        assigned_user_id: hardware.assigned_user_id || "",
        hardware_type_id: hardware.hardware_type_id,
        hardware_status_id: hardware.hardware_status_id
    });

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        setHardwareValues(values => ({
            ...values,
            [key]: value,
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(`/hardwares/${hardware.id}`, hardwareValues, {
            onSuccess: () => {
                setToastMessage("Hardware updated successfully!");
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Update failed:", errors);
                setToastMessage("Failed to update hardware. Please try again.");
                setToastType("alert-error");
            }
        });
    };

    return (
        <Layout>
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">Hardware Management</p>
                    <p className="text-sm font-normal animate-pulse">Edit & Update Hardware Data.</p>
                </div>

                <div className="divider" />

                <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                    <div className="card-body">
                        <h2 className="card-title text-primary">Edit Hardware</h2>
                        <form onSubmit={handleSubmit} className="mt-1">
                            <div className="flex flex-col space-y-2">
                                <div>
                                    <label className="text-sm font-semibold">Hardware No</label>
                                    <input type="text" className="input input-bordered w-full text-sm"
                                        id="hardware_no" value={hardwareValues.hardware_no} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Serial No</label>
                                    <input type="text" className="input input-bordered w-full text-sm"
                                        id="hardware_serial_no" value={hardwareValues.hardware_serial_no} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Hardware Type</label>
                                    <select className="select select-bordered w-full"
                                        id="hardware_type_id" value={hardwareValues.hardware_type_id} onChange={handleChange} required>
                                        {hardwareTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.hardware_type_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Hardware Status</label>
                                    <select className="select select-bordered w-full"
                                        id="hardware_status_id" value={hardwareValues.hardware_status_id} onChange={handleChange} required>
                                        {hardwareStatuses.map(status => (
                                            <option key={status.id} value={status.id}>{status.hardware_status_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Assigned User</label>
                                    <select className="select select-bordered w-full"
                                        id="assigned_user_id" value={hardwareValues.assigned_user_id} onChange={handleChange}>
                                        <option value="">Unassigned</option>
                                        {estates.map(estate => (
                                            <optgroup key={estate.id} label={estate.estate_name}>
                                                {assignedUsers[estate.id]?.map(user => (
                                                    <option key={user.id} value={user.id}>{user.user_name}</option>
                                                ))}
                                            </optgroup>
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
    );
}
