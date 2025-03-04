import React, { useState } from "react";
import Layout from "../Layouts/Layout";
import { Link, router } from "@inertiajs/react";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertComponent from "../Components/AlertComponent";
import ToastComponent from "../Components/ToastComponent";

export default function Index({ users }) {
    {
        /* Handle Alert state */
    }
    const [showAlert, setShowAlert] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    {
        /* Handle Toast state */
    }
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowAlert(true);
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(`/users/${selectedUser.id}`, {
                onSuccess: () => {
                    setToastMessage("User deleted successfully!");
                    setToastType("alert-success");
                    setShowAlert(false);
                    setSelectedEstate(null);
                },
                onError: () => {
                    setToastMessage("Failed to delete user. Please try again.");
                    setToastType("alert-error");
                    setShowAlert(false);
                },
            });
        }
    };

    return (
        <Layout>
            <div>
                <div className="mx-4 mt-1">
                    <p className="text-3xl font-bold text-primary">
                        User Management
                    </p>
                    <p className="text-sm font-normal animate-pulse">
                        Hardware's User Management.
                    </p>
                </div>

                <div className="divider" />

                {users.data.length > 0 ? (
                    <>
                        <div className="mx-4">
                            <div className="flex">
                                <p className="text-xl font-semibold">
                                    User List
                                </p>
                                <Link
                                    href="/users/create"
                                    className="btn btn-sm btn-neutral px-4 ml-auto"
                                >
                                    Create User
                                </Link>
                            </div>

                            {/* Table for Estate */}
                            <div className="overflow-x-auto bg-base-300 mt-2">
                                <table className="table table-sm">
                                    {/* head */}
                                    <thead>
                                        <tr className="text-primary border-b-2 border-b-base-100">
                                            <th>User</th>
                                            <th>Position</th>
                                            <th>Estate</th>
                                            <th className="text-center">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.user_name}</td>
                                                <td>
                                                    {user.user_position
                                                        ?.position_name ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    {user.estate?.estate_name ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    <div className="flex gap-1 justify-center">
                                                        <Link
                                                            href={`/users/${user.id}`}
                                                            className="btn btn-ghost btn-sm rounded-md"
                                                        >
                                                            <ReadMoreIcon className="text-primary hover:text-primary/75" />
                                                        </Link>
                                                        <button
                                                            className="btn btn-ghost btn-sm rounded-md"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user
                                                                )
                                                            }
                                                        >
                                                            <DeleteIcon className="text-error hover:text-error/75" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center mt-3 justify-end">
                            {users.links?.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    className={`btn btn-sm mx-1 ${
                                        link.active
                                            ? "btn-primary"
                                            : "btn-neutral"
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="mx-4">
                        <p className="text-xl mb-2">No user data exist.</p>
                        <Link
                            href="/users/create"
                            className="btn btn-sm btn-primary px-4"
                        >
                            Create User
                        </Link>
                    </div>
                )}

                {/* Delete Confirmation Alert */}
                {showAlert && (
                    <AlertComponent
                        message={`Are you sure you want to delete user ${selectedUser?.user_name}?`}
                        type="warning"
                        onConfirm={confirmDelete}
                        onCancel={() => setShowAlert(false)}
                    />
                )}

                {/* Toast Notification */}
                <ToastComponent
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastMessage("")} // Clear the toast message after closing
                />
            </div>
        </Layout>
    );
}
