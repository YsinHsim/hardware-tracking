import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToastComponent from '../Components/ToastComponent';
import SystemDataDeleteAlert from '../Components/SystemDataDeleteAlert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function Index({ userPositions = [], hardwareStatuses = [], hardwareTypes = [] }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemType, setItemType] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const [openSections, setOpenSections] = useState({
        user_positions: false,
        hardware_statuses: false,
        hardware_types: false
    });

    const toggleSection = (type) => {
        setOpenSections((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleDeleteClick = (item, type) => {
        setSelectedItem(item);
        setItemType(type);
    };

    const handleDeleteConfirm = () => {
        if (selectedItem && itemType) {
            router.delete(`/system-data/${itemType}/${selectedItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedItem(null);
                }
            });
        }
    };

    return (
        <Layout>
            <div className="mx-6 mt-6">
                <p className="text-3xl font-bold text-primary">System Data Management</p>
                <p className="text-sm font-normal animate-pulse">Manage User Positions, Hardware Statuses, and Hardware Types.</p>
            </div>
            <div className="divider" />

            <div className="mx-6 mt-4">
                <div className="join join-vertical w-full">
                    {[{ label: 'User Positions', data: userPositions, type: 'user_positions' },
                    { label: 'Hardware Statuses', data: hardwareStatuses, type: 'hardware_statuses' },
                    { label: 'Hardware Types', data: hardwareTypes, type: 'hardware_types' }].map(({ label, data, type }) => (
                        <div key={type} className="bg-base-200 mb-4 shadow-lg rounded-lg">
                            {/* Toggle Button (Medium Drop Box) */}
                            <button
                                onClick={() => toggleSection(type)}
                                className="w-full text-left px-5 py-4 bg-base-300 rounded-t-lg text-xl font-semibold text-primary min-h-[60px]"
                            >
                                <div className="flex">
                                    {label}
                                    <div className="flex justify-end flex-1">
                                        {/* {openSections[type] ? "▲" : "▼"} */}
                                        {openSections[type] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </div>
                                </div>
                            </button>

                            {/* Drop-down Content (Unchanged) */}
                            {openSections[type] && (
                                <div className="p-3 bg-base-100 rounded-b-lg shadow-inner">
                                    <div className="overflow-x-auto bg-base-300 mt-2 rounded-lg">
                                        <div className="flex items-center justify-between bg-base-200 px-4 py-3 rounded-t-lg">
                                            <span className="text-lg font-semibold">{label}'s List</span>
                                            <Link href={`/system-data/create/${type}`} className="btn btn-sm outline-2 px-4">
                                                Create {label.slice(0, -1)}
                                            </Link>
                                        </div>
                                        <table className="table">
                                            <thead>
                                                <tr className="text-primary border-b-2 border-b-base-100">
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="text-center px-4 py-2">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.length > 0 ? (
                                                    data.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-2">{item.name}</td>
                                                            <td className="px-4 py-2">
                                                                <div className="flex gap-2 justify-center">
                                                                    <div className="tooltip tooltip-left" data-tip="Edit">
                                                                        <Link href={`/system-data/${type}/${item.id}/edit`} className="btn btn-ghost btn-sm rounded-md">
                                                                            <EditIcon className="text-primary hover:text-primary/75" />
                                                                        </Link>
                                                                    </div>
                                                                    <div className="tooltip tooltip-right" data-tip="Delete">
                                                                        <button className="btn btn-ghost btn-sm rounded-md" onClick={() => handleDeleteClick(item, type)}>
                                                                            <DeleteIcon className="text-error hover:text-error/75" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2" className="text-center px-4 py-2">No {label.toLowerCase()} available.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
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
