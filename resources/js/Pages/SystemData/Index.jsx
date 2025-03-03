import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToastComponent from '../Components/ToastComponent';
import SystemDataDeleteAlert from '../Components/SystemDataDeleteAlert'; // Import the new delete confirmation component

export default function Index({ userPositions = [], hardwareStatuses = [], hardwareTypes = [] }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemType, setItemType] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const handleDeleteClick = (item, type) => {
        setSelectedItem(item);
        setItemType(type);
    };

    const handleDeleteConfirm = () => {
        if (selectedItem && itemType) {
            router.delete(`/system-data/${itemType}/${selectedItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedItem(null); // Close the modal properly
                }
            });
        }
    };

    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">System Data Management</p>
                <p className="text-sm font-normal animate-pulse">Manage User Positions, Hardware Statuses, and Hardware Types.</p>
            </div>
            <div className="divider" />

            <div className="mx-4 mt-4">
                <div className="join join-vertical w-full">
                    {[{ label: 'User Positions', data: userPositions, type: 'user_positions' },
                    { label: 'Hardware Statuses', data: hardwareStatuses, type: 'hardware_statuses' },
                    { label: 'Hardware Types', data: hardwareTypes, type: 'hardware_types' }].map(({ label, data, type }, index) => (
                        <div key={type} className="collapse collapse-arrow bg-base-200 mb-2 shadow-lg">
                            <input type="radio" name="accordion" defaultChecked={index === 0} />
                            <div className="collapse-title text-xl font-semibold flex items-center text-primary">
                                {label}
                            </div>
                            <div className="collapse-content">
                                <div className="overflow-x-auto bg-base-300 mt-2">
                                    <div className="collapse-title text-xl font-semibold flex items-center bg-base-200">
                                        {label}'s List
                                        <Link href={`/system-data/create/${type}`} className="btn btn-sm btn-neutral px-4 ml-auto">
                                            Create {label.slice(0, -1)}
                                        </Link>
                                    </div>
                                    <table className="table">
                                        <thead>
                                            <tr className="text-primary border-b-2 border-b-base-100">
                                                <th>Name</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(data) && data.length > 0 ? (data.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.name}</td>
                                                    <td>
                                                        <div className="flex gap-1 justify-center">
                                                            <Link href={`/system-data/${type}/${item.id}/edit`} className="btn btn-ghost btn-sm rounded-md">
                                                                <EditIcon className="text-primary hover:text-primary/75" />
                                                            </Link>
                                                            <button className="btn btn-ghost btn-sm rounded-md" onClick={() => handleDeleteClick(item, type)}>
                                                                <DeleteIcon className="text-error hover:text-error/75" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center">No {label.toLowerCase()} available.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <SystemDataDeleteAlert 
                    item={selectedItem} 
                    type={itemType} 
                    onDelete={handleDeleteConfirm} 
                    onCancel={() => setSelectedItem(null)} 
                />
            )}

            <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
        </Layout>
    );
}
