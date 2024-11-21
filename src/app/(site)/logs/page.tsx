"use client";

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { FaCircleXmark } from "react-icons/fa6";

interface Log {
    id: number;
    username: string;
    user_id: number;
    data: string;
    tipo: string;
    descricao: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [dateValue, setDateValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registro`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch logs");
                }
                const data = await response.json();
                setLogs(data);
                setFilteredLogs(data);
            } catch (error) {
                toast.error("Erro ao buscar logs");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    useEffect(() => {
        let result = logs;

        if (searchTerm) {
            result = result.filter((log) => log.username.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (typeFilter) {
            result = result.filter((log) => log.tipo === typeFilter);
        }

        if (dateFilter) {
            result = result.filter((log) => {
                const logDate = new Date(log.data).toLocaleDateString("pt-BR");
                return logDate === dateFilter;
            });
        }

        setFilteredLogs(result);
    }, [searchTerm, typeFilter, dateFilter, logs]);

    return (
        <div className="flex flex-col w-full h-full py-6">
            <span className="text-black text-2xl px-8 text-center">Logs do Sistema</span>
            <div className="flex justify-between items-center px-8 mt-4">
                <div className="flex bg-white rounded-lg px-4 py-2 gap-8 text-[#303030]">
                    <div className="flex items-center gap-2 bg-[#F3F3F3] rounded-lg px-4 py-2">
                        <FaSearch color="#303030" size={14} />
                        <input
                            type="text"
                            placeholder="Digite o nome do usuário"
                            className="w-full outline-none bg-transparent text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select name="type" id="type" className={`${typeFilter ? "w-fit" : "w-16"} pr-1 outline-none bg-transparent`} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="">Tipo</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <input
                        type="date"
                        name="date"
                        id="date"
                        className="pr-1 outline-none bg-transparent cursor-pointer"
                        value={dateValue}
                        onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            if (date) {
                                setDateFilter(date.toLocaleDateString("pt-BR"));
                            } else {
                                setDateFilter("");
                            }
                            setDateValue(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col px-8 mt-8">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#E0E1EC] rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#272c6b] rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <span className="text-[#272c6b] text-lg">Carregando...</span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-4 mt-4 text-center">
                        <span className="text-gray-500 text-2xl font-semibold">Sem logs registrados</span>
                        <FaCircleXmark className="inline ml-2 -mt-2" color="#6C757D" size={32} />
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead className="bg-[#272c6b] text-white">
                            <tr>
                                <th className="py-[10px] rounded-tl-2xl">ID</th>
                                <th className="py-[10px]">Usuário</th>
                                <th className="py-[10px]">Data</th>
                                <th className="py-[10px]">Tipo</th>
                                <th className="py-[10px] rounded-tr-2xl">Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr key={log.id} className={`${index % 2 === 0 ? "bg-white" : "bg-[#E0E1EC]"}`}>
                                    <td className={`py-[10px] px-8 text-center ${index === filteredLogs.length - 1 ? "rounded-bl-2xl" : ""}`}>{log.id}</td>
                                    <td className="py-[10px] px-8 text-center">{log.username}</td>
                                    <td className="py-[10px] px-8 text-center">
                                        {new Date(log.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {new Date(log.data).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="py-[10px] px-8 text-center">{log.tipo}</td>
                                    <td title={log.descricao} className={`py-[10px] px-8 text-center ${index === filteredLogs.length - 1 ? "rounded-br-2xl" : ""}`}>
                                        {log.descricao.length > 100 ? `${log.descricao.substring(0, 100)}...` : log.descricao}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="flex flex-1 flex-col-reverse px-32 mt-20 mb-4">
                <span className="text-black text-center text-sm font-normal">© 2024 SOS Defesa Civil Maceió</span>
            </div>
        </div>
    );
}
