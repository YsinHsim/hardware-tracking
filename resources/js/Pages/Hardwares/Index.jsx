import React, { useState } from "react";
import Layout from "../Layouts/Layout";
import { Link, router } from "@inertiajs/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertComponent from "../Components/AlertComponent";
import ToastComponent from "../Components/ToastComponent";

export default function Index({ hardwares }) {
    const [showAlert, setShowAlert] = useState(false);
    const [selectedHardware, setSelectedHardware] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const handleDelete = (hardware) => {
        setSelectedHardware(hardware);
        setShowAlert(true);
    };

    const confirmDelete = () => {
        if (!selectedHardware) return;

        router.delete(`/hardwares/${selectedHardware.id}`, {
            onSuccess: () => {
                setToastMessage("Hardware deleted successfully!");
                setToastType("alert-success");
                setShowAlert(false);
                setSelectedHardware(null);
            },
            onError: () => {
                setToastMessage("Failed to delete hardware. Please try again.");
                setToastType("alert-error");
                setShowAlert(false);
            },
        });
    };

    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">Hardware Management</p>
                <p className="text-sm font-normal animate-pulse">View & Manage Hardware Data.</p>
            </div>

            <div className="divider" />

            {hardwares.data.length > 0 ? (
                <>
                    <div className="mx-4">
                        <div className="flex">
                            <p className="text-xl font-semibold">Hardware List</p>
                            <Link href="/hardwares/create" className="btn btn-sm btn-neutral px-4 ml-auto">
                                Add Hardware
                            </Link>
                        </div>

                        <div className="overflow-x-auto bg-base-300 mt-2">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="text-primary border-b-2 border-b-base-100">
                                        <th>Hardware No</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Assigned User</th>
                                        <th>Estate</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hardwares.data.map((hardware) => (
                                        <tr key={hardware.id}>
                                            <td>{hardware.hardware_no}</td>
                                            <td>{hardware.hardware_type?.hardware_type_name || "Unknown Type"}</td>
                                            <td>{hardware.hardware_status?.hardware_status_name || "Unknown Status"}</td>
                                            <td>
                                                {hardware.assigned_user?.id ? (
                                                    <Link
                                                        href={`/users/${hardware.assigned_user.id}`}
                                                        className="btn btn-ghost btn-sm rounded-md"
                                                    >
                                                        {hardware.assigned_user?.user_name || "Unknown User"}
                                                    </Link>
                                                ) : (
                                                    <span>Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                {hardware.assigned_user?.estate?.estate_name || "Unknown Estate"}
                                            </td>
                                            <td>
                                                <div className="flex gap-1 justify-center">
                                                    <Link
                                                        href={`/hardwares/${hardware.id}/edit`}
                                                        className="btn btn-ghost btn-sm rounded-md"
                                                    >
                                                        <EditIcon className="text-primary hover:text-primary/75" />
                                                    </Link>
                                                    <button
                                                        className="btn btn-ghost btn-sm rounded-md"
                                                        onClick={() => handleDelete(hardware)}
                                                    >
                                                        <DeleteIcon className="text-error hover:text-error/75" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center mt-3 justify-end">
                        {hardwares.links?.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || "#"}
                                className={`btn btn-sm mx-1 ${link.active ? "btn-primary" : "btn-neutral"}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="mx-4">
                    <p className="text-xl mb-2">No hardware data exists.</p>
                    <Link href="/hardwares/create" className="btn btn-sm btn-primary px-4">
                        Add Hardware
                    </Link>
                </div>
            )}

            {showAlert && (
                <AlertComponent
                    message={`Are you sure you want to delete ${selectedHardware?.hardware_no}?`}
                    type="warning"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowAlert(false)}
                />
            )}

            <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
        </Layout>
    );
}
