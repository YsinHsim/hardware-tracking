import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ComputerIcon from '@mui/icons-material/Computer';
import LanIcon from '@mui/icons-material/Lan';

export default function Layout({ children }) {

    useEffect(() => {
        setIsSidebarOpen(false);
    }, []);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <Head title="Hardware Tracking" />
            <div className="flex h-screen bg-base-200">
                <aside className="bg-base-300 p-4 shadow-lg w-60">
                    <div className="my-4">
                        <Link href="/" className="text-4xl font-bold text-primary ml-8 hover:animate-pulse">HTS</Link>
                    </div>
                    <nav className="flex flex-col space-y-1">
                    <Link href="/hardwares" className="w-full font-semibold hover:bg-base-100 px-8 py-2 rounded-md">
                            <ComputerIcon />
                            <span className="ml-2 whitespace-nowrap">Hardwares</span>
                        </Link>
                        <Link href="/users" className="w-full font-semibold hover:bg-base-100 px-8 py-2 rounded-md">
                            <PeopleIcon />
                            <span className="ml-2">Users</span>
                        </Link>
                        <Link href="/estates" className="w-full font-semibold hover:bg-base-100 px-8 py-2 rounded-md">
                            <HomeIcon />
                            <span className="ml-2">Estates</span>
                        </Link>
                        <Link href="/system-data" className="w-full font-semibold hover:bg-base-100 px-8 py-2 rounded-md">
                            <LanIcon />
                            <span className="ml-2">System Data</span>
                        </Link>
                    </nav>
                </aside>
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    <main className="bg-base-200 min-h-screen p-4">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
