import React, { useState } from "react";

const styles = {
    container: {
        width: "80%",
        margin: "40px auto",
        padding: "20px",
        border: "2px solid #000",
        fontFamily: "'Times New Roman', Times, serif",
        color: "#000",
        backgroundColor: "#fff",
        textAlign: "justify",
    },
    header: {
        textAlign: "center",
        fontSize: "26px",
        fontWeight: "bold",
        marginBottom: "20px",
        textTransform: "uppercase",
    },
    subHeader: {
        textAlign: "center",
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    date: {
        textAlign: "right",
        fontSize: "16px",
        marginBottom: "20px",
    },
    reportTable: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
    },
    row: {
        borderBottom: "1px solid #000",
    },
    cell: {
        padding: "10px",
        fontSize: "18px",
    },
    label: {
        fontWeight: "bold",
        width: "40%",
    },
    footer: {
        marginTop: "40px",
        textAlign: "left",
        fontSize: "18px",
    },
    signature: {
        marginTop: "60px",
        fontSize: "18px",
        textAlign: "left",
    },
    printButton: {
        padding: "10px 20px",
        backgroundColor: "#004085",
        color: "#fff",
        fontSize: "18px",
        border: "none",
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "background-color 0.3s ease",
    },
    printButtonHover: {
        backgroundColor: "#002752",
    },
};

const Report = ({ hardware_id, hardware_no, hardware_serial_no, hardware_user, hardware_type, hardware_status, estate_name }) => {
    const [isHovered, setIsHovered] = useState(false);
    const currentDate = new Date().toLocaleDateString();

    return (
        <>
            <div style={styles.container}>
                <h1 style={styles.header}>Official Hardware Report</h1>
                <p style={styles.subHeader}>Agri-Teck Department</p>
                <p style={styles.date}>Date: {currentDate}</p>

                <table style={styles.reportTable}>
                    <tbody>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>Hardware ID:</td>
                            <td style={styles.cell}>{hardware_id}</td>
                        </tr>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>Hardware Number:</td>
                            <td style={styles.cell}>{hardware_no}</td>
                        </tr>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>Serial Number:</td>
                            <td style={styles.cell}>{hardware_serial_no}</td>
                        </tr>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>User:</td>
                            <td style={styles.cell}>{hardware_user}</td>
                        </tr>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>Hardware Type:</td>
                            <td style={styles.cell}>{hardware_type}</td>
                        </tr>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>Status:</td>
                            <td style={styles.cell}>{hardware_status}</td>
                        </tr>
                        <tr style={styles.row}>
                            <td style={{ ...styles.cell, ...styles.label }}>Status:</td>
                            <td style={styles.cell}>{estate_name}</td>
                        </tr>
                    </tbody>
                </table>

                <p style={styles.footer}>This report serves as an official document verifying the details of the mentioned hardware.</p>

                <div style={styles.signature}>
                    <p>__________________________</p>
                    <p>Name:</p>
                    <p>Position:</p>
                </div>
            </div>

            {/* Print Button - Placed Outside Report */}
            <div className="mb-6 mt-2 text-center">
                <button
                    id="printButton"
                    style={{
                        ...styles.printButton,
                        backgroundColor: isHovered ? styles.printButtonHover.backgroundColor : styles.printButton.backgroundColor,
                    }}
                    onClick={() => window.print()}
                    onMouseOver={() => setIsHovered(true)}
                    onMouseOut={() => setIsHovered(false)}
                >
                    Print Report
                </button>
            </div>

            {/* CSS for Hiding Button in Print Mode */}
            <style>
                {`
                    @media print {
                        #printButton {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default Report;
