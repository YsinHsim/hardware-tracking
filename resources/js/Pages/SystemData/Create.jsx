import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { router } from '@inertiajs/react';

export default function Create({ type }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const placeholders = {
        user_positions: "Enter position name",
        hardware_statuses: "Enter hardware status",
        hardware_types: "Enter hardware type",
    };

    const labels = {
        user_positions: "Position Name",
        hardware_statuses: "Hardware Status",
        hardware_types: "Hardware Type",
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(`/system-data/${type}`, { name }, {
            onSuccess: () => router.visit('/system-data'),
            onError: (errors) => setError(errors.name),
        });
    };

    return (
        <Layout>
            <div className="mx-4 mt-4">
                <p className="text-3xl font-bold text-primary">Create {type.replace("_", " ")}</p>
            </div>
            <div className="divider" />
            <form onSubmit={handleSubmit} className="mx-4">
                <div className="form-control">
                    <label className="text-sm font-semibold">{labels[type] || "Name"}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input input-bordered"
                        placeholder={placeholders[type] || "Enter name"}
                        required
                    />
                    {error && <p className="text-error">{error}</p>}
                </div>
                <button type="submit" className="btn btn-primary mt-4">Save</button>
            </form>
        </Layout>
    );
}
