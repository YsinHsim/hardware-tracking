import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ComputerIcon from '@mui/icons-material/Computer';
import LanIcon from '@mui/icons-material/Lan';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Layout({ children }) {
    const [isNavVisible, setIsNavVisible] = useState(false);

    return (
        <>
            <Head title="Hardware Tracking" />
            <div className="flex h-screen bg-base-200 relative">
                {/* Sidebar (Overlay) */}
                <aside className={`fixed inset-0 bg-base-300 shadow-lg w-64 min-h-screen p-6 transition-transform transform ${isNavVisible ? 'translate-x-0' : '-translate-x-full'} z-50`}>
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/" className="text-3xl font-bold text-primary hover:animate-pulse">HTS</Link>
                        <button onClick={() => setIsNavVisible(false)} className="btn btn-ghost">
                            <CloseIcon />
                        </button>
                    </div>
                    <nav className="space-y-2">
                        <Link href="/hardwares" className="flex items-center px-4 py-3 rounded-lg hover:bg-base-100 transition">
                            <ComputerIcon className="mr-3" /> Hardwares
                        </Link>
                        <Link href="/users" className="flex items-center px-4 py-3 rounded-lg hover:bg-base-100 transition">
                            <PeopleIcon className="mr-3" /> Users
                        </Link>
                        <Link href="/estates" className="flex items-center px-4 py-3 rounded-lg hover:bg-base-100 transition">
                            <HomeIcon className="mr-3" /> Estates
                        </Link>
                        <Link href="/system-data" className="flex items-center px-4 py-3 rounded-lg hover:bg-base-100 transition">
                            <LanIcon className="mr-3" /> System Data
                        </Link>
                    </nav>
                </aside>

                {/* Overlay Background */}
                {isNavVisible && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsNavVisible(false)}
                    ></div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    <div className="navbar bg-base-100 shadow-md p-4 flex items-center">
                        <button onClick={() => setIsNavVisible(true)} className="btn btn-ghost">
                            <MenuIcon />
                        </button>
                        <h1 className="text-xl font-bold text-primary ml-4">Hardware Tracking</h1>
                    </div>
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </>
    );
}
