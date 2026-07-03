import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        let socketInstance: Socket;

        // Fetch the JWT token from the server (reads the httpOnly cookie)
        fetch("/api/auth/token")
            .then((res) => res.json())
            .then(({ token }) => {
                if (!token) {
                    console.warn("No auth token found. Socket connection skipped.");
                    return;
                }

                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
                socketInstance = io(socketUrl, {
                    auth: { token }
                });

                socketInstance.on("connect", () => {
                    console.log("Connected to chat server. Socket ID:", socketInstance.id);
                });

                socketInstance.on("connect_error", (err) => {
                    console.error("Socket connection error:", err.message);
                });

                setSocket(socketInstance);
            })
            .catch((err) => {
                console.error("Failed to fetch auth token:", err);
            });

        return () => {
            socketInstance?.disconnect();
        };
    }, []);

    return socket;
};