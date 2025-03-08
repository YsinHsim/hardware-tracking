import React from 'react';
import Layout from './Layouts/Layout';
import GitHubIcon from '@mui/icons-material/GitHub';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function About() {
    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">Hardware Tracking System</p>
                <p className="text-sm font-normal animate-pulse">
                    Simplify the way you track and manage hardware across multiple locations.
                </p>
            </div>

            <div className="divider" />

            {/* Technologies Used Section */}
            <div className="mx-4 mt-1">
                <p className="text-xl font-semibold">Technologies Used</p>
                <ul className="list-disc list-inside text-sm mt-2">
                    <li><span className="font-semibold">Backend:</span> Laravel & Inertia.js</li>
                    <li><span className="font-semibold">Frontend:</span> React & Tailwind CSS</li>
                    <li><span className="font-semibold">Database:</span> MariaDB</li>
                    <li><span className="font-semibold">UI Components:</span> Daisy UI</li>
                </ul>
            </div>

            <div className="divider" />

            {/* Developer Section */}
            <div>
                <p className="text-xl font-semibold mx-4">Developer</p>
                <div className="flex mx-4 mt-1 space-x-2">
                    <div className="card card-side bg-base-100 shadow-xl flex-1">
                        <figure>
                            <img src="/images/profile02.jpg" className=" ml-4 rounded w-32 h-32 object-cover" />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">Yasin Hassim</h2>
                            <p><span className="font-semibold">Role:</span> Fullstack Developer</p>
                            <div className="mt-1 space-x-2">
                                <a href="https://github.com/YsinHsim" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <GitHubIcon className="" />
                                </a>
                                <a href="https://wa.me/60128507469" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <WhatsAppIcon className="" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="card card-side bg-base-100 shadow-xl flex-1">
                        <figure>
                            <img src="/images/khai-profile01.jpeg" className=" ml-4 rounded w-32 h-32 object-cover" />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">Khairulazhar</h2>
                            <p><span className="font-semibold">Role:</span> Front-end Developer</p>
                            <div className="mt-1 space-x-2">
                                <a href="https://github.com/khai218" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <GitHubIcon className="" />
                                </a>
                                <a href="https://wa.me/60135552635" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <WhatsAppIcon className="" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
