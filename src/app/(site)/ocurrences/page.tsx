/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaEye, FaFileCsv, FaQuestionCircle, FaSearch, FaTrash, FaWater, FaFire, FaTree } from "react-icons/fa";
import { FaCheck, FaCircleXmark } from "react-icons/fa6";
import { LiaPaperclipSolid } from "react-icons/lia";
import { toast } from "react-hot-toast";
import Modal from "@/components/Modal";

interface Occurrence {
    id: number;
    tipo: keyof typeof icons;
    bairro: string;
    latitude: number;
    longitude: number;
    data_registro: string;
    ultima_atualizacao: string;
    likes: number;
    midias_count: number;
}

const icons = {
    tipo2: {
        icon: <FaWater color="#007BFF" size={24} />,
        name: "Inundação",
        color: "bg-[#007BFF]",
    },
    tipo1: {
        icon: <FaFire color="#FF5733" size={24} />,
        name: "Incêndio",
        color: "bg-[#FF5733]",
    },
    tipo3: {
        icon: <FaTree color="#28A745" size={24} />,
        name: "Queda de Árvore",
        color: "bg-[#28A745]",
    },
    outros: {
        icon: <FaQuestionCircle color="#6C757D" size={24} />,
        name: "Outros",
        color: "bg-[#6C757D]",
    },
};

export default function Occurrences() {
    const [occurrenceData, setOccurrenceData] = useState<Occurrence[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOccurrences = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/ocorrencias/list/");
                if (!response.ok) {
                    throw new Error("Erro ao buscar ocorrências");
                }
                const data: Occurrence[] = await response.json();
                setOccurrenceData(data);
            } catch (error) {
                console.error("Erro ao buscar ocorrências:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOccurrences();
    }, []);

    const handleDeleteClick = (id: number) => {
        setSelectedOccurrenceId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedOccurrenceId) return;

        const loadingToast = toast.loading("Deletando ocorrência...");
        try {
            const response = await fetch(`http://localhost:8000/api/ocorrencia/${selectedOccurrenceId}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao deletar ocorrência");
            }

            toast.success("Ocorrência deletada com sucesso!", { id: loadingToast });
            setOccurrenceData((prevData) => prevData.filter((occurrence) => occurrence.id !== selectedOccurrenceId));
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Erro ao deletar ocorrência", { id: loadingToast });
            console.error("Erro ao deletar ocorrência:", error);
        }
    };

    const handleExportCSV = () => {
        const csvRows = [];
        const headers = ["Tipo", "Localização", "Coordenadas", "Criado em", "Última Atualização", "Curtidas", "Anexo"];
        csvRows.push(headers.join(","));

        occurrenceData.forEach((occurrence) => {
            const row = [
                icons[occurrence.tipo].name,
                occurrence.bairro,
                `${occurrence.latitude}, ${occurrence.longitude}`,
                new Date(occurrence.data_registro).toLocaleString(),
                new Date(occurrence.ultima_atualizacao).toLocaleString(),
                occurrence.likes || 0,
                occurrence.midias_count > 0 ? "Sim" : "Não",
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "ocorrencias.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} type="delete" />
            <div className="flex flex-col w-full h-full py-6">
                <span className="text-black text-2xl px-8 text-center">Ocorrências Recentes</span>
                <div className="flex justify-between items-center px-8 mt-4">
                    <div className="flex bg-white rounded-lg px-4 py-2 gap-8 text-[#303030]">
                        <div className="flex items-center gap-2 bg-[#F3F3F3] rounded-lg px-4 py-2">
                            <FaSearch color="#303030" size={14} />
                            <input type="text" placeholder="Digite a Localização" className="w-full outline-none bg-transparent text-base" />
                        </div>
                        <select name="type" id="type" className="w-fit pr-1 outline-none bg-transparent">
                            <option selected value="">
                                Tipo
                            </option>
                        </select>
                        <select name="date" id="date" className="w-fit pr-1 outline-none bg-transparent">
                            <option selected value="">
                                Data
                            </option>
                        </select>
                        <select name="author" id="author" className="w-fit pr-1 outline-none bg-transparent">
                            <option selected value="">
                                Autor
                            </option>
                        </select>
                        <select name="attachment" id="attachment" className="w-fit pr-1 outline-none bg-transparent">
                            <option selected value="">
                                Anexo
                            </option>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                        </select>
                    </div>
                    <button className="bg-[#272c6b] text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2" onClick={handleExportCSV}>
                        <FaFileCsv />
                        Exportar .CSV
                    </button>
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
                    ) : (
                        <table className="w-full border-collapse">
                            <thead className="bg-[#272c6b] text-white">
                                <tr>
                                    <th className="py-[10px] rounded-tl-2xl">Tipo</th>
                                    <th className="py-[10px] border-r border-[#272c6b]">Localização</th>
                                    <th className="py-[10px] border-r border-[#272c6b]">Coordenadas</th>
                                    <th className="py-[10px] border-r border-[#272c6b]">Criado em</th>
                                    <th className="py-[10px] border-r border-[#272c6b]">Última Atualização</th>
                                    <th className="py-[10px] border-r border-[#272c6b]">Curtidas</th>
                                    <th className="py-[10px] border-r border-[#272c6b]">Anexo</th>
                                    <th className="py-[10px] rounded-tr-2xl">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {occurrenceData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-4 text-center">
                                            <span className="text-gray-500">Sem ocorrências registradas</span>
                                            <FaCircleXmark className="inline ml-2" color="#6C757D" size={24} />
                                        </td>
                                    </tr>
                                ) : (
                                    occurrenceData.map((occurrence, index) => (
                                        <tr key={occurrence.id} className={`${index % 2 === 0 ? "bg-white" : "bg-[#E0E1EC]"} ${index === occurrenceData.length - 1 ? "" : ""}`}>
                                            <td className={`py-[10px] px-8 border-r border-l border-[#272c6b] ${index === occurrenceData.length - 1 ? "rounded-bl-2xl" : ""}`}>
                                                <span className="flex justify-center gap-2">
                                                    {icons[occurrence.tipo].icon}
                                                    {icons[occurrence.tipo].name}
                                                </span>
                                            </td>
                                            <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">
                                                {occurrence.bairro.length > 20 ? occurrence.bairro.substring(0, 20) + "..." : occurrence.bairro}
                                            </td>
                                            <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">{`${occurrence.latitude}, ${occurrence.longitude}`}</td>
                                            <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">
                                                {new Date(occurrence.data_registro).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} -{" "}
                                                {new Date(occurrence.data_registro).toLocaleDateString("pt-BR")}
                                            </td>
                                            <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">
                                                {new Date(occurrence.ultima_atualizacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} -{" "}
                                                {new Date(occurrence.ultima_atualizacao).toLocaleDateString("pt-BR")}
                                            </td>
                                            <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">{occurrence.likes || 0}</td>
                                            <td className="py-[10px] px-8 border-r border-[#272c6b] text-center">
                                                {occurrence.midias_count > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        {occurrence.midias_count}
                                                        <LiaPaperclipSolid title={`${occurrence.midias_count} anexos`} color="#272c6b" fontSize={24} />
                                                    </div>
                                                ) : (
                                                    "---"
                                                )}
                                            </td>
                                            <td className={`py-[10px] px-8 flex gap-2 border-r border-[#272c6b] justify-center ${index === occurrenceData.length - 1 ? "rounded-br-2xl" : ""}`}>
                                                <Link href={`/ocurrences/${occurrence.id}`}>
                                                    <FaEye className="cursor-pointer" fontSize={24} color="272c6b" />
                                                </Link>
                                                <FaCheck className="cursor-pointer" fontSize={24} color="272c6b" />
                                                <FaTrash className="cursor-pointer" fontSize={24} color="272c6b" onClick={() => handleDeleteClick(occurrence.id)} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
