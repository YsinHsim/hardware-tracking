import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AlertComponent from '../Components/AlertComponent';
import ToastComponent from '../Components/ToastComponent';

export default function Show({ user }) {
    const [showAlert, setShowAlert] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const handleDelete = () => {
        setShowAlert(true);
    };

    const confirmDelete = () => {
        router.delete(`/users/${user.id}`, {
            onSuccess: () => {
                setToastMessage("User deleted successfully!");
                setToastType("alert-success");
                setShowAlert(false);
                setTimeout(() => {
                    router.visit('/users'); // Redirect to Users list after deletion
                }, 1500);
            },
            onError: () => {
                setToastMessage("Failed to delete user. Please try again.");
                setToastType("alert-error");
                setShowAlert(false);
            }
        });
    };

    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">User Details</p>
                <p className="text-sm font-normal animate-pulse">
                    Detailed information for {user.user_name} from {user.estate?.estate_name}.
                </p>
            </div>

            <div className="divider" />

            <div className="mx-4 bg-base-300 p-4 rounded-lg shadow">
                <p className="text-xl font-semibold text-primary">User Information</p>
                <div className="flex space-x-2">
                    <div className="mt-2 flex-1">
                        <p><span className="font-semibold">Name:</span> {user.user_name}</p>
                        <p><span className="font-semibold">Position:</span> {user.user_position?.position_name || "N/A"}</p>
                        <p><span className="font-semibold">Estate:</span> {user.estate?.estate_name || "N/A"}</p>
                        <p><span className="font-semibold">Region:</span> {user.estate?.region?.region_name || "N/A"}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        {/* Edit Button */}
                        <Link href={`/users/${user.id}/edit`} className="btn btn-ghost btn-sm rounded-md">
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

            {/* Assigned Hardware Section */}
            <div className="mx-4 mt-4 bg-base-300 p-4 rounded-lg shadow">
                <p className="text-xl font-semibold text-primary">Assigned Hardware</p>
                {user.hardwares && user.hardwares.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full mt-2">
                            <thead>
                                <tr className="text-primary">
                                    <th>Hardware No</th>
                                    <th>Hardware Serial No</th>
                                    <th>Hardware Type</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.hardwares.map((hw) => (
                                    <tr key={hw.id}>
                                        <td>{hw.hardware_no}</td>
                                        <td>{hw.hardware_serial_no}</td>
                                        <td>{hw?.hardware_type?.hardware_type_name || "N/A"}</td>
                                        <td>{hw?.hardware_status?.hardware_status_name || "N/A"}</td>
                                        <td>{new Date(hw.updated_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mt-2">No hardware assigned to this user.</p>
                )}
            </div>

            {/* Delete Confirmation Alert */}
            {showAlert && (
                <AlertComponent
                    message={`Are you sure you want to delete ${user.user_name}?`}
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
