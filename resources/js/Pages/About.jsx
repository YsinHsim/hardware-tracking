import React from 'react';
import Layout from './Layouts/Layout';
import GitHubIcon from '@mui/icons-material/GitHub';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LaunchIcon from '@mui/icons-material/Launch';
import TvIcon from '@mui/icons-material/Tv';
import PaletteIcon from '@mui/icons-material/Palette';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

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
                <p className="text-xl font-semibold text-primary">Technologies Used</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mt-2">
                    <div className="card bg-base-100 hover:shadow-lg p-4">
                        <div className="flex mb-4">
                            <div className="flex items-center mx-8 h-full">
                                <button className="text-primary animate-pulse">
                                    <CodeIcon sx={{ fontSize: 40 }} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-xl">Backend</p>
                                <p className="text-md"><ArrowRightIcon className="text-primary" />Laravel & Inertia.js</p>
                            </div>
                        </div>
                        <p className="text-sm font-light">A powerful combination for building modern web applications. Laravel handles the backend with robust features like authentication and database management, while Inertia.js bridges the gap between Laravel and React, allowing seamless, single-page app development without the complexity of a full API.</p>
                    </div>

                    <div className="card bg-base-100 hover:shadow-lg p-4">
                        <div className="flex mb-4">
                            <div className="flex items-center mx-8 h-full">
                                <button className="text-primary animate-pulse">
                                    <TvIcon sx={{ fontSize: 40 }} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-xl">Frontend</p>
                                <p className="text-md"><ArrowRightIcon className="text-primary" />React & Tailwind CSS</p>
                            </div>
                        </div>
                        <p className="text-sm font-light">A dynamic duo for building fast and responsive UIs. React powers the frontend with its component-based architecture, making state management and interactivity seamless, while Tailwind CSS provides utility-first styling for rapid and consistent design without writing custom CSS.</p>
                    </div>

                    <div className="card bg-base-100 hover:shadow-lg p-4">
                        <div className="flex mb-4">
                            <div className="flex items-center mx-8 h-full">
                                <button className="text-primary animate-pulse">
                                    <StorageIcon sx={{ fontSize: 40 }} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-xl">Database</p>
                                <p className="text-md"><ArrowRightIcon className="text-primary" />MariaDB</p>
                            </div>
                        </div>
                        <p className="text-sm font-light">A fast, open-source relational database management system (RDBMS) that is a drop-in replacement for MySQL. It offers high performance, scalability, and strong security features, making it ideal for modern applications.</p>
                    </div>

                    <div className="card bg-base-100 hover:shadow-lg p-4">
                        <div className="flex mb-4">
                            <div className="flex items-center mx-8 h-full">
                                <button className="text-primary animate-pulse">
                                    <PaletteIcon sx={{ fontSize: 40 }} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-xl">UI Components</p>
                                <p className="text-md"><ArrowRightIcon className="text-primary" />Daisy UI</p>
                            </div>
                        </div>
                        <p className="text-sm font-light">A Tailwind CSS-based component library that simplifies UI development with pre-designed, customizable components. It enhances Tailwind by adding themes, responsive design, and utility classes, making UI development faster and more efficient.</p>
                    </div>

                </div>
            </div>

            <div className="divider" />

            {/* Developer Section */}
            <div>
                <p className="text-xl font-semibold mx-4 text-primary">Developer</p>
                <div className="flex mx-4 mt-1 space-x-4">
                    <div className="card bg-base-100 shadow-xl flex-1">
                        <div className="card-body">
                            <div className="flex items-center p-4">
                                <figure>
                                    <img src="/images/profile02.jpg" className="rounded w-32 h-32 object-cover" />
                                </figure>
                                <div className="px-4">
                                    <h2 className="text-3xl font-medium mb-4">Yasin Hassim</h2>
                                    <p><span className="font-semibold">Role:</span> Fullstack Developer</p>
                                    <p><span className="font-semibold">Persona:</span> Tank, Support - Mobile Legend | Camper, Sniper - CODM</p>
                                </div>
                            </div>
                            <p className="font-light italic">I fix printers, code apps, and occasionally talk to computers like they understand me. When I'm not debugging, I'm probably debugging my own life decisions.</p>
                            <div className="mt-1 space-x-2">
                                <a href="https://github.com/YsinHsim" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <GitHubIcon />
                                </a>
                                <a href="https://wa.me/60128507469" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <WhatsAppIcon />
                                </a>
                                <a href="mailto:yasinhassim43@gmail.com" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <EmailIcon />
                                </a>
                                <a href="https://yasinhassim.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <LaunchIcon />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl flex-1">
                        <div className="card-body">
                            <div className="flex items-center p-4">
                                <figure>
                                    <img src="/images/khai-profile01.jpeg" className="rounded w-32 h-32 object-cover" />
                                </figure>
                                <div className="px-4">
                                    <h2 className="text-3xl font-medium mb-4">Khairulazhar</h2>
                                    <p><span className="font-semibold">Role:</span> Front-end Developer, UI & UX Designer</p>
                                    <p><span className="font-semibold">Persona:</span> Hyper, Mage, Marksman - Mobile Legend</p>
                                </div>
                            </div>
                            <p className="font-light italic">I'm just a humble Intern.</p>
                            <div className="mt-1 space-x-2">
                                <a href="https://github.com/khai218" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <GitHubIcon />
                                </a>
                                <a href="https://wa.me/60135552635" target="_blank" rel="noopener noreferrer" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <WhatsAppIcon />
                                </a>
                                <a href="mailto:khairulazhar2004@gmail.com" className="btn btn-circle shadow-md hover:animate-pulse hover:bg-base-300 animate duration-500 hover:text-primary">
                                    <EmailIcon />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
