import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Welcome() {
    // Get the current year dynamically
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head>
                <title>Hardware Tracking</title>
                <meta name="description" content="Simplify the way you track and manage hardware across multiple locations." />
            </Head>
            <div className="hero bg-base-200 h-screen">
                <div className="hero-content text-center">
                    <div className="bg-base-300 p-10 rounded-md shadow-md">
                        <h1 className="text-4xl text-primary mb-2">Hardware Tracking Application</h1>
                        <p className="text-sm font-light md:text-md  mb-4 text-gray-500">
                            Simplify the way you track and manage hardware across multiple locations.
                        </p>
                        <Link href="estates" className="btn btn-primary btn-sm px-4 py-2">
                            Proceed
                        </Link>
                    </div>
                </div>
            </div>

            {/* Fixed Footer */}
            <footer className="fixed bottom-0 left-0 w-full bg-base-300 p-4 text-center shadow-md">
                <p className="text-sm font-light">
                    © {currentYear} Hardware Tracking Application. All rights reserved.
                </p>
                <p className="text-xs font-light">
                    Created with Laravel, Inertia, React, Daisy UI and Tailwind CSS.
                </p>
            </footer>
        </>
    );

    {/* AN=Hardware_Tracking */ }
    {/* AK=base64:d7nRNcsZPIV4FYzsAOyj1iul6jrj+noWO69tT9Y1E/4= */ }
    {/* DBP=root */ }
}
