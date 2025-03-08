import React from 'react';
import Layout from './Layouts/Layout';
import { Link } from '@inertiajs/react';

export default function Documentation() {

    // Get the current year dynamically
    const currentYear = new Date().getFullYear();

    return (
        <Layout>
            <>
                <div className="flex min-h-full bg-base-200">
                    {/* Main Content */}
                    <div>
                        <div id="introduction" className="mx-4 mt-1">
                            <p className="text-3xl font-bold text-primary">Welcome to the Hardware Tracking Application</p>
                            <p className="text-sm mt-4">
                                The <span className="font-bold">Hardware Tracking Application</span> is a web-based tool designed to help you manage and track hardware assets (e.g., devices, tools, equipment) across multiple locations. With this application, you can easily add, update, and delete assets, as well as search and filter them based on specific criteria.
                            </p>
                        </div>

                        <div className="divider" />

                        {/* Estates Section */}
                        <div id="estates" className="mx-4 mt-1">
                            <p className="text-lg font-semibold text-primary">Estates</p>
                            <p className="text-sm mt-2">
                                Estates represent locations or groups where hardware is stored or used. Before you can add hardware or assign users, you need to create an estate.
                            </p>
                            <div className="mt-4">
                                <p className="text-md font-medium">How to Create an Estate:</p>
                                <ol className="list-decimal list-inside text-sm ml-4">
                                    <li>Go to the <Link href="/estates" className="text-primary hover:text-accent transition duration-500">Estates</Link> page.</li>
                                    <li>Click the <strong>Create Estate</strong> button.</li>
                                    <li>You may create a <span className="font-semibold">Region</span> first if the Region don't exist, after that you may proceed to create <span className="font-semibold">Estate</span>.</li>
                                    <li>For <span className="font-semibold">Estate</span>, fill the <strong>Estate Name</strong> and <strong>Select Region</strong> field.</li>
                                    <li>Click <strong>Create</strong> button to create the estate.</li>
                                </ol>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Assigned Users Section */}
                        <div id="assigned-users" className="mx-4 mt-1">
                            <p className="text-lg font-semibold text-primary">Assigned Users</p>
                            <p className="text-sm mt-2">
                                Assigned users are individuals responsible for hardware assets. Each user must be linked to an estate.
                            </p>
                            <div className="mt-4">
                                <p className="text-md font-medium">How to Create an Assigned User:</p>
                                <ol className="list-decimal list-inside text-sm ml-4">
                                    <li>Go to the <Link href="/users" className="text-primary hover:text-accent transition duration-500">Assigned Users</Link> page.</li>
                                    <li>Click the <strong>Add User</strong> button.</li>
                                    <li>Fill out the form with the user details (e.g., name, email).</li>
                                    <li>Select the estate the user belongs to.</li>
                                    <li>Click <strong>Save</strong> to create the user.</li>
                                </ol>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Hardware Section */}
                        <div id="hardwares" className="mx-4 mt-1">
                            <p className="text-lg font-semibold text-primary">Hardware</p>
                            <p className="text-sm mt-2">
                                Hardware represents the physical assets you want to track. Each hardware item must be assigned to a user.
                            </p>
                            <div className="mt-4">
                                <p className="text-md font-medium">How to Add Hardware:</p>
                                <ol className="list-decimal list-inside text-sm ml-4">
                                    <li>Go to the <Link href="/hardwares" className="text-primary hover:text-accent transition duration-500">Hardware</Link> page.</li>
                                    <li>Click the <strong>Add Hardware</strong> button.</li>
                                    <li>
                                        Fill out the form with the hardware details:
                                        <ul className="list-disc list-inside ml-6">
                                            <li>Hardware No</li>
                                            <li>Serial No</li>
                                            <li>Select Estate</li>
                                            <li>Select Hardware Type</li>
                                            <li>Select Hardware Status</li>
                                        </ul>
                                    </li>
                                    <li>Select the assigned user for the hardware.</li>
                                    <li>Click <strong>Create</strong> to add the hardware.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Table of Contents */}
                    <div className="w-1/4">
                        <div className="sticky top-4 bg-base-300 rounded-md p-4">
                            <h4 className="text-primary font-semibold">On This Page</h4>
                            <ul className="mt-4 text-sm">
                                <li className="mt-1">
                                    <a href="#introduction" className="transition duration-500 hover:text-accent">Introduction</a>
                                </li>
                                <li className="mt-1">
                                    <a href="#estates" className="transition duration-500 hover:text-accent">Estates</a>
                                </li>
                                <li className="mt-1">
                                    <a href="#assigned-users" className="transition duration-500 hover:text-accent">Assigned Users</a>
                                </li>
                                <li className="mt-1">
                                    <a href="#hardwares" className="transition duration-500 hover:text-accent">Hardware</a>
                                </li>
                                <li className="mt-1">
                                    <a href="#about" className="transition duration-500 hover:text-accent">About</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <footer className="bottom-0 left-0 w-full bg-base-300 shadow-md flex">
                    <div id="about" className="text-center flex-1 p-4">
                        <p className="text-sm font-light">
                            © {currentYear} Hardware Tracking Application. All rights reserved.
                        </p>
                        <p className="text-xs font-light">
                            Created with Laravel, Inertia, React, Daisy UI and Tailwind CSS.
                        </p>
                        <Link href="/about" class="font-light hover:font-normal text-primary animate-pulse">
                            About Us
                        </Link>
                    </div>
                </footer>
            </>

        </Layout>
    );
}