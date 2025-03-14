import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import ThemeSwitcher from "@/Pages/Components/ThemeSwitcher";
import AlertErrorComponent from "./Components/AlertErrorComponent";

export default function Login() {
    const { errors } = usePage().props;
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    // Hide loading spinner after a brief delay on page refresh.
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();

        router.post(
            "/login",
            { password },
            {
                onError: (error) => {
                    console.error("Login error:", error.password);
                },
            }
        );
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-base-200">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="loading loading-spinner loading-lg text-primary" />
                </div>
            )}

            <div className="absolute top-4 right-4">
                <ThemeSwitcher />
            </div>

            {errors.password && (
                <div className="absolute top-20 w-100 flex justify-center">
                    <AlertErrorComponent message={errors.password} />
                </div>
            )}

            <div className="w-full max-w-sm">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title justify-center">Login</h2>
                        <form onSubmit={handleLogin}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className="input input-bordered"
                                    required
                                />
                            </div>
                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
