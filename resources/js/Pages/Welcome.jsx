import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
        <Head title="Hardware Tracking" />
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content text-center">
                <div className="bg-base-300 p-6 rounded-md shadow-md">
                    <h1 className="text-4xl text-primary mb-2">Hardware Tracking Application</h1>
                    <p className="text-sm font-light md:text-md  mb-2">
                        Simplify the way you track and manage hardware across multiple locations.
                    </p>
                    <Link href="estates" className="btn btn-primary btn-sm px-4 py-2">
                        Proceed
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}
