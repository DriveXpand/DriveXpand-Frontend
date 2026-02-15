import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api.ts"

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const user = await login({ username, password });

            console.log("Logged in as:", user.username);

            // 2. Redirect to home
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Invalid username or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome Back</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="username" style={styles.label}>Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && <div style={styles.errorMessage}>{error}</div>}

                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: isLoading ? 0.7 : 1 }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Simple inline styles to make it look decent without external CSS
const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f3f4f6",
    },
    card: {
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
    },
    title: {
        textAlign: "center" as const,
        marginBottom: "1.5rem",
        color: "#1f2937",
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
    form: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "1rem",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "0.5rem",
    },
    label: {
        fontSize: "0.875rem",
        color: "#374151",
        fontWeight: 500,
    },
    input: {
        padding: "0.75rem",
        borderRadius: "4px",
        border: "1px solid #d1d5db",
        fontSize: "1rem",
    },
    button: {
        backgroundColor: "#2563eb",
        color: "white",
        padding: "0.75rem",
        borderRadius: "4px",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "0.5rem",
    },
    errorMessage: {
        color: "#dc2626",
        fontSize: "0.875rem",
        textAlign: "center" as const,
        backgroundColor: "#fee2e2",
        padding: "0.5rem",
        borderRadius: "4px",
    },
};
