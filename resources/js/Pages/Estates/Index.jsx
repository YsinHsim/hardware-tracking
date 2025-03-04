import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertComponent from '../Components/AlertComponent';
import ToastComponent from '../Components/ToastComponent';

export default function Index({ estates }) {

    {/* Handle Alert state */ }
    const [showAlert, setShowAlert] = useState(false);
    const [selectedEstate, setSelectedEstate] = useState(null);

    {/* Handle Toast state */ }
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const handleDelete = (estate) => {
        setSelectedEstate(estate);
        setShowAlert(true);
    };

    const confirmDelete = () => {
        if (selectedEstate) {
            router.delete(`/estates/${selectedEstate.id}`, {
                onSuccess: () => {
                    setToastMessage("Estate deleted successfully!");
                    setToastType("alert-success");
                    setShowAlert(false);
                    setSelectedEstate(null);
                },
                onError: () => {
                    setToastMessage("Failed to delete estate. Please try again.");
                    setToastType("alert-error");
                    setShowAlert(false);
                }
            });
        }
    }

    return (
        <Layout>
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">Estate Management</p>
                    <p className="text-sm font-normal animate-pulse">Estate & Region Management.</p>
                </div>

                <div className="divider" />

                {estates.data.length > 0 ? (
                    <div className="mx-4">
                        <div className="flex">
                            <p className="text-xl font-semibold">Estate List</p>
                            <Link href="/estates/create" className="btn btn-sm btn-neutral px-4 ml-auto">
                                Create Estate
                            </Link>
                        </div>

                        {/* Table for Estate */}
                        <div className="overflow-x-auto bg-base-300 mt-2">
                            <table className="table">
                                {/* Table Head */}
                                <thead>
                                    <tr className="text-primary border-b-2 border-b-base-100">
                                        <th>Estate</th>
                                        <th>Region</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estates.data.map((estate) => (
                                        <tr key={estate.id}>
                                            <td>{estate.estate_name}</td>
                                            <td>{estate.region.region_name}</td>
                                            <td>
                                                <div className="flex gap-1 justify-center">
                                                    <Link href={`/estates/${estate.id}/edit`} className="btn btn-ghost btn-sm rounded-md">
                                                        <EditIcon className="text-primary hover:text-primary/75" />
                                                    </Link>
                                                    <button
                                                        className="btn btn-ghost btn-sm rounded-md"
                                                        onClick={() => handleDelete(estate)}
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

                        {/* Pagination */}
                        <div className="flex items-center mt-3 justify-end">
                            {estates.links?.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    className={`btn btn-sm mx-1 ${link.active ? "btn-primary" : "btn-neutral"}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mx-4">
                        <p className="text-xl mb-2">No estate data exist.</p>
                        <Link href="/estates/create" className="btn btn-sm btn-primary px-4">
                            Create Estate
                        </Link>
                    </div>
                )}

                {/* Delete Confirmation Alert */}
                {showAlert && (
                    <AlertComponent
                        message={`Are you sure you want to delete ${selectedEstate?.estate_name}?`}
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

            </div>
        </Layout>
    )
}