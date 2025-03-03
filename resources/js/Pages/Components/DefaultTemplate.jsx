import React,{ useState } from 'react';
import Layout from '../Layouts/Layout';
import { Link, router } from '@inertiajs/react';
import AlertComponent from '../Components/AlertComponent';
import ToastComponent from '../Components/ToastComponent';

export default function DefaultTemplate() {

    {/* Handle Alert state */}
    const [showAlert, setShowAlert] = useState(false);
    const [selectedEstate, setSelectedEstate] = useState(null);

    {/* Handle Toast state */}
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    
    return (
        <Layout>
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">Estate Management</p>
                    <p className="text-sm font-normal animate-pulse">Estate & Region Management.</p>
                </div>

                <div className="divider" />



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