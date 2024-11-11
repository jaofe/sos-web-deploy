"use client";

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface Log {
    id: number;
    nome: string;
    user_id: number;
    data: string;
    tipo: string;
    descricao: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/registro", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch logs");
                }
                const data = await response.json();
                setLogs(data);
                console.log(data);
            } catch (error) {
                toast.error("Erro ao buscar logs");
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="flex flex-col w-full h-full py-6">
            <span className="text-black text-2xl px-8 text-center">Logs do Sistema</span>
            <div className="flex justify-between items-center px-8 mt-4">
                <div className="flex bg-white rounded-lg px-4 py-2 gap-8 text-[#303030]">
                    <div className="flex items-center gap-2 bg-[#F3F3F3] rounded-lg px-4 py-2">
                        <FaSearch color="#303030" size={14} />
                        <input type="text" placeholder="Digite o nome do usuário" className="w-full outline-none bg-transparent text-base" />
                    </div>
                    <select name="type" id="type" className="w-fit pr-1 outline-none bg-transparent">
                        <option value="">Tipo</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <select name="date" id="date" className="w-fit pr-1 outline-none bg-transparent">
                        <option value="">Data</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-col px-8 mt-8">
                <table className="w-full border-collapse">
                    <thead className="bg-[#272c6b] text-white">
                        <tr>
                            <th className="py-[10px] rounded-tl-2xl">ID</th>
                            <th className="py-[10px] border-r border-[#272c6b]">Usuário</th>
                            <th className="py-[10px] border-r border-[#272c6b]">Data</th>
                            <th className="py-[10px] border-r border-[#272c6b]">Tipo</th>
                            <th className="py-[10px] rounded-tr-2xl">Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-4 text-center">
                                    <span className="text-gray-500">Sem logs registrados</span>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, index) => (
                                <tr key={log.id} className={`${index % 2 === 0 ? "bg-white" : "bg-[#E0E1EC]"} ${index === logs.length - 1 ? "border-b border-[#272c6b]" : ""}`}>
                                    <td className={`py-[10px] px-8 border-r border-l border-[#272c6b] text-center ${index === logs.length - 1 ? "rounded-bl-2xl" : ""}`}>{log.id}</td>
                                    <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">{log.user_id}</td>
                                    <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">
                                        {new Date(log.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {new Date(log.data).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">{log.tipo}</td>
                                    <td title={log.descricao} className={`py-[10px] px-8 border-r border-[#272c6b] text-center ${index === logs.length - 1 ? "rounded-br-2xl" : ""}`}>
                                        {log.descricao.length > 100 ? `${log.descricao.substring(0, 100)}...` : log.descricao}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-1 flex-col-reverse px-32 mt-20 mb-4">
                <span className="text-black text-center text-sm font-normal">© 2024 SOS Defesa Civil Maceió</span>
            </div>
        </div>
    );
}