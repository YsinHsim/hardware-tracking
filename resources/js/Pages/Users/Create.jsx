import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react'
import Layout from '../Layouts/Layout';
import ToastComponent from '../Components/ToastComponent';

export default function Create({ positions, estates, users }) {

    {/* STATE FOR TOAST MESSAGE */ }
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState(""); // "success" or "warning"

    {/* ESTATE STUFF START HERE /////////////////////   */ }
    const [values, setValues] = useState({
        user_name: "",
        user_position_id: "",
        estate_id: ""
    })

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value
        setValues(values => ({
            ...values,
            [key]: value,
        }))
    }

    function handleSubmit(e) {
        e.preventDefault();

        console.log('\n\n Send Data to Back-end: \nuser_name: ' + values.user_name + '\nuser_position_id: ' + values.user_position_id + '\nestate_id: ' + values.estate_id);

        router.post('/users', values, {
            onSuccess: () => {
                setValues({ user_name: "", user_position_id: "", estate_id: "" }); // Reset form
                setToastMessage("New user created successfully!");
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Error submitting user:", errors);
                setToastMessage("Failed to create user. Please check your input.");
                setToastType("alert-warning");
            }
        });
    }

    return (
        <Layout>
            {toastMessage && (
                <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
            )}
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">User Management</p>
                    <p className="text-sm font-normal animate-pulse">Create Hardware's User.</p>
                </div>

                <div className="divider" />

                <div className="mx-4 mt-1">
                    <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                        <div className="card-body">
                            <h2 className="card-title text-primary">Create Hardware's User</h2>
                            <form onSubmit={handleSubmit} className="mt-1">
                                <div className="flex flex-col space-y-2">
                                    {users?.length > 0 && (
                                        <div className="mt-2 mb-4">
                                            <p className="text-xl font-semibold">Recent Created Users</p>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {users
                                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by recent date
                                                    .slice(0, 3) // Take the first 3 (most recent)
                                                    .map(user => (
                                                        <Link
                                                            key={user.id}
                                                            href={`/users/${user.id}`}
                                                            className="btn btn-neutral rounded-md"
                                                        >
                                                            {user.user_name}
                                                        </Link>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    <input type="text" placeholder="Username *" className="input input-bordered w-full text-sm"
                                        id="user_name" value={values.user_name} onChange={handleChange} required />
                                    <select className="select select-bordered w-full"
                                        id="user_position_id" value={values.user_position_id} onChange={handleChange} required>
                                        <option value="">Select Position *</option>
                                        {positions.map(position => (
                                            <option key={position.id} value={position.id}>{position.position_name}</option>
                                        ))}
                                    </select>
                                    <select className="select select-bordered w-full"
                                        id="estate_id" value={values.estate_id} onChange={handleChange} required>
                                        <option value="">Select Estate *</option>
                                        {estates.map(estate => (
                                            <option key={estate.id} value={estate.id}>{estate.estate_name}</option>
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

            </div>
        </Layout>
    )
}