import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AlertComponent from '../Components/AlertComponent';
import ToastComponent from '../Components/ToastComponent';

export default function Show({ hardware }) {
    const [showAlert, setShowAlert] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");
    const [viewMode, setViewMode] = useState("table"); // "table" or "timeline"

    const toggleView = () => {
        setViewMode((prev) => (prev === "table" ? "timeline" : "table"));
    };

    const handleDelete = () => {
        setShowAlert(true);
    };

    const confirmDelete = () => {
        router.delete(`/hardwares/${hardware.id}`, {
            onSuccess: () => {
                setToastMessage("Hardware deleted successfully!");
                setToastType("alert-success");
                setShowAlert(false);
                setTimeout(() => {
                    router.visit('/hardwares'); // Redirect to Hardwares list after deletion
                }, 1500);
            },
            onError: () => {
                setToastMessage("Failed to delete hardware. Please try again.");
                setToastType("alert-error");
                setShowAlert(false);
            }
        });
    };

    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">Hardware Details</p>
                <p className="text-sm font-normal animate-pulse">
                    Detailed information for {hardware.hardware_no} ({hardware.hardware_serial_no}).
                </p>
            </div>

            <div className="divider" />

            <div className="mx-4 bg-base-300 p-4 rounded-lg shadow">
                <p className="text-xl font-semibold text-primary">Hardware Information</p>
                <div className="flex space-x-2">
                    <div className="mt-2 flex-1">
                        <p><span className="font-semibold">Hardware No:</span> {hardware.hardware_no}</p>
                        <p><span className="font-semibold">Serial No:</span> {hardware.hardware_serial_no}</p>
                        <p><span className="font-semibold">Type:</span> {hardware.hardware_type?.hardware_type_name || "N/A"}</p>
                        <p><span className="font-semibold">Status:</span> {hardware.hardware_status?.hardware_status_name || "N/A"}</p>
                        <p><span className="font-semibold">Assigned User:</span>
                            <Link href={`/users/${hardware.assigned_user?.id}`} className="btn btn-ghost btn-sm rounded-md hover:text-accent hover:bg-transparent">
                                {hardware.assigned_user?.user_name || "Unassigned"}
                            </Link>
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 justify-end">
                        {/* Edit Button */}
                        <Link href={`/hardwares/${hardware.id}/edit`} className="btn btn-ghost btn-sm rounded-md">
                            <EditIcon className="text-primary hover:text-primary/75" />
                        </Link>
                        {/* Delete Button */}
                        <button
                            className="btn btn-ghost btn-sm rounded-md"
                            onClick={handleDelete}
                        >
                            <DeleteIcon className="text-error hover:text-error/75" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Update Records Section */}
            <div className="mx-4 mt-4 bg-base-300 p-4 rounded-lg shadow">
                <div className="flex justify-between">
                    <p className="text-xl font-semibold text-primary">Hardware History</p>
                    <button className="btn btn-sm btn-ghost rounded-md" onClick={toggleView}>
                        {viewMode === "table" ? "Switch to Timeline" : "Switch to Table"}
                    </button>
                </div>

                {hardware.update_records && hardware.update_records.length > 0 ? (
                    viewMode === "table" ? (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full mt-2">
                                <thead>
                                    <tr className="text-primary">
                                        <th>Record Name</th>
                                        <th>Remarks</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hardware.update_records.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.record_name}</td>
                                            <td>{record.record_desc}</td>
                                            <td>{new Date(record.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {hardware.update_records.map((record) => (
                                <div key={record.id} className="bg-base-200 p-4 rounded-lg hover:shadow-xl border-2 border-transparent hover:border-dotted hover:border-neutral">
                                    <p className="font-bold text-primary">{record.record_name}</p>
                                    <p className="text-sm">{record.record_desc}</p>
                                    <p className="text-xs mt-2">{new Date(record.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <p className="text-sm text-gray-500 mt-2">No update records available.</p>
                )}
            </div>

            {/* Delete Confirmation Alert */}
            {showAlert && (
                <AlertComponent
                    message={`Are you sure you want to delete ${hardware.hardware_no}?`}
                    type="warning"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowAlert(false)}
                />
            )}

            {/* Toast Notification */}
            <ToastComponent
                message={toastMessage}
                type={toastType}
                onClose={() => setToastMessage("")} // Clear the toast message after closing
            />
        </Layout>
    );
}
