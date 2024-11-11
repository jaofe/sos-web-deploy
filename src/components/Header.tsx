"use client";

import { usePathname } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/ocurrences": "Tabela de Ocorrências",
    "/ocurrences/*": "Detalhes da Ocorrência", // TODO: use regex to accept any path after ocurrences
    "/register": "Registrar Ocorrência",
    "/config": "Configurações",
};

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const title = titleMap[pathname as keyof typeof titleMap];

    const [nome, setNome] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("http://localhost:8000/api/me", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch user data");
                    }

                    const data = await response.json();
                    setNome(data.nome); // Assuming the response contains a "nome" field
                    localStorage.setItem("id", data.id);
                } catch (error) {
                    toast.error("Erro ao buscar dados do usuário");
                    localStorage.removeItem("token");
                    localStorage.removeItem("id");
                    router.push("/login");
                }
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="flex justify-between items-center bg-white text-black w-full px-8 py-4">
            <span className="text-black text-2xl font-medium">{title}</span>
            <div className="flex flex-row gap-2 items-center">
                <FaUserCircle fontSize={40} color="orange" />
                <span>{nome}</span>
            </div>
        </div>
    );
}
