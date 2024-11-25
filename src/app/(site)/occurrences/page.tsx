/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaEye, FaFileCsv, FaSearch, FaTrash } from "react-icons/fa";
import { FaCheckToSlot, FaCircleXmark } from "react-icons/fa6";
import { LiaPaperclipSolid } from "react-icons/lia";
import { toast } from "react-hot-toast";
import Modal from "@/components/Modal";
import Image from "next/image";
import { icons } from "@/constants/Icons";
import { useRouter } from "next/navigation";

interface Occurrence {
    id: number;
    tipo:
        | "alagamentos"
        | "colapso_barragens"
        | "colapso_edificios"
        | "colapso_solo"
        | "deslizamentos"
        | "enxurradas"
        | "erosao_costeira"
        | "erosao_margem_fluvial"
        | "inundacoes"
        | "liberacao_quimicos"
        | "tempestade_raios"
        | "tombamentos_rolamentos"
        | "tremor_terra";
    bairro: string;
    latitude: number;
    longitude: number;
    username: string;
    data_registro: string;
    likes: number;
    midias_count: number;
    status: "open" | "analyzing" | "in_progress" | "finished";
}

const statusOptions = {
    open: "Ocorrência Criada",
    analyzing: "Ocorrência em Análise",
    in_progress: "Solucionando Ocorrência",
    finished: "Ocorrência Finalizada",
};

export default function Occurrences() {
    const [occurrenceData, setOccurrenceData] = useState<Occurrence[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deleteOccurrenceId, setDeleteOccurrenceId] = useState<number | null>(null);
    const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false);
    const [endOccurrenceId, setEndOccurrenceId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [dateValue, setDateValue] = useState("");
    const [attachmentFilter, setAttachmentFilter] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [filteredOccurrences, setFilteredOccurrences] = useState<Occurrence[]>([]);
    const [authors, setAuthors] = useState<string[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchOccurrences = async () => {
            try {
                const offset = (currentPage - 1) * itemsPerPage;
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocorrencias/list?limit=${itemsPerPage}&offset=${offset}`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar ocorrências");
                }
                const data = await response.json();
                setOccurrenceData(data.results);
                setTotalCount(data.count);

                const uniqueAuthors: string[] = Array.from(new Set(data.results.map((occurrence: Occurrence) => occurrence.username)));
                setAuthors(uniqueAuthors);
            } catch (error) {
                console.error("Erro ao buscar ocorrências:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOccurrences();
    }, [currentPage]);

    useEffect(() => {
        let result = occurrenceData;

        if (searchTerm) {
            result = result.filter((occurrence) => occurrence.bairro.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (typeFilter) {
            result = result.filter((occurrence) => occurrence.tipo === typeFilter);
        }

        if (dateFilter) {
            result = result.filter((occurrence) => {
                const occurrenceDate = new Date(occurrence.data_registro).toLocaleDateString("pt-BR");
                return occurrenceDate === dateFilter;
            });
        }

        if (authorFilter) {
            result = result.filter((occurrence) => occurrence.username === authorFilter);
        }

        if (attachmentFilter) {
            result = result.filter((occurrence) => {
                if (attachmentFilter === "true") return occurrence.midias_count > 0;
                return occurrence.midias_count === 0;
            });
        }

        setFilteredOccurrences(result);
    }, [searchTerm, typeFilter, dateFilter, attachmentFilter, authorFilter, occurrenceData]);

    const handleDeleteClick = (id: number) => {
        setDeleteOccurrenceId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteOccurrenceId) return;

        const loadingToast = toast.loading("Deletando ocorrência...");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocorrencia/${deleteOccurrenceId}/`, {
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
            setOccurrenceData((prevData) => prevData.filter((occurrence) => occurrence.id !== deleteOccurrenceId));
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Erro ao deletar ocorrência", { id: loadingToast });
            console.error("Erro ao deletar ocorrência:", error);
        }
    };

    const handleEndClick = (id: number) => {
        setEndOccurrenceId(id);
        setIsEndModalOpen(true);
    };

    const handleEndOccurrence = async () => {
        const loadingToast = toast.loading("Finalizando ocorrência...");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocorrencia/${endOccurrenceId}/finalizar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao finalizar ocorrência");
            }

            toast.success("Ocorrência finalizada com sucesso!", { id: loadingToast });
            setIsEndModalOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Erro ao finalizar ocorrência", { id: loadingToast });
        }
    };

    const handleExportCSV = async () => {
        const loadingToast = toast.loading("Exportando CSV...");

        const csvRows = [];
        const headers = ["Tipo", "Localização", "Coordenadas", "Criado em", "Última Atualização", "Curtidas", "Anexo"];
        csvRows.push(headers.join(","));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocorrencias/list?limit=${totalCount}`);

        const data = await response.json();
        const csvOcurrences = data.results;

        csvOcurrences.forEach((occurrence: Occurrence) => {
            const row = [
                icons[occurrence.tipo].name,
                occurrence.bairro,
                `${occurrence.latitude}, ${occurrence.longitude}`,
                new Date(occurrence.data_registro).toLocaleString(),
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
        toast.success("CSV exportado com sucesso!", { id: loadingToast });
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <>
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} type="delete" />
            <Modal isOpen={isEndModalOpen} onClose={() => setIsEndModalOpen(false)} onConfirm={handleEndOccurrence} type="end" />
            <div className="flex flex-col w-full h-full py-6">
                <span className="text-black text-2xl px-8 text-center">Ocorrências Recentes</span>
                <div className="flex justify-between items-center px-8 mt-4">
                    <div className="flex bg-white rounded-lg px-4 py-2 gap-8 text-[#303030]">
                        <div className="flex items-center gap-2 bg-[#F3F3F3] rounded-lg px-4 py-2">
                            <FaSearch color="#303030" size={14} />
                            <input
                                type="text"
                                placeholder="Digite a Localização"
                                className="w-full outline-none bg-transparent text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            name="type"
                            id="type"
                            className={`${typeFilter ? "w-fit" : "w-16"} pr-1 outline-none bg-transparent`}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Tipo</option>
                            {Object.entries(icons).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.name}
                                </option>
                            ))}
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
                                    console.log(e.target.value);
                                    setDateFilter(date.toLocaleDateString("pt-BR"));
                                } else {
                                    setDateFilter("");
                                }
                                setDateValue(e.target.value);
                            }}
                        />
                        <select
                            name="author"
                            id="author"
                            className={`${authorFilter ? "w-fit" : "w-20"} pr-1 outline-none bg-transparent`}
                            value={authorFilter}
                            onChange={(e) => setAuthorFilter(e.target.value)}
                        >
                            <option value="">Autor</option>
                            {authors.map((author) => (
                                <option key={author} value={author}>
                                    {author}
                                </option>
                            ))}
                        </select>
                        <select name="attachment" id="attachment" className="w-fit pr-1 outline-none bg-transparent" value={attachmentFilter} onChange={(e) => setAttachmentFilter(e.target.value)}>
                            <option value="">Anexo</option>
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
                        <>
                            {!filteredOccurrences || filteredOccurrences.length === 0 ? (
                                <div className="py-4 mt-4 text-center">
                                    <span className="text-gray-500 text-2xl font-semibold">Sem ocorrências registradas</span>
                                    <FaCircleXmark className="inline ml-2 -mt-2" color="#6C757D" size={32} />
                                </div>
                            ) : (
                                <table className="w-full border-collapse">
                                    <thead className="bg-[#272c6b] text-white">
                                        <tr>
                                            <th className="py-[10px] rounded-tl-2xl">Tipo</th>
                                            <th className="py-[10px]">Localização</th>
                                            <th className="py-[10px]">Última Atualização</th>
                                            <th className="py-[10px]">Criado em</th>
                                            <th className="py-[10px]">Autor</th>
                                            <th className="py-[10px]">Curtidas</th>
                                            <th className="py-[10px]">Anexo</th>
                                            <th className="py-[10px] rounded-tr-2xl">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOccurrences.map((occurrence, index) => (
                                            <tr key={occurrence.id} className={`${index % 2 === 0 ? "bg-white" : "bg-[#E0E1EC]"}`}>
                                                <td className={`py-[12px] px-8 justify-center items-center ${index === filteredOccurrences.length - 1 ? "rounded-bl-2xl" : ""}`}>
                                                    <span className="flex ml-10 -mr-10 gap-2">
                                                        <Image src={icons[occurrence.tipo].icon} alt={icons[occurrence.tipo].name} width={24} height={24} className="h-6 w-6" />
                                                        {icons[occurrence.tipo].name}
                                                    </span>
                                                </td>
                                                <td title={occurrence.bairro} className="py-[10px] cursor-pointer px-8 text-center">
                                                    {occurrence.bairro.length > 20 ? occurrence.bairro.substring(0, 20) + "..." : occurrence.bairro}
                                                </td>
                                                <td className="py-[10px] px-8 text-center">{statusOptions[occurrence.status]}</td>
                                                <td className="py-[10px] px-8 text-center">
                                                    {new Date(occurrence.data_registro).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} -{" "}
                                                    {new Date(occurrence.data_registro).toLocaleDateString("pt-BR")}
                                                </td>
                                                <td className="py-[10px] px-8 text-center">{occurrence.username}</td>
                                                <td className="py-[10px] px-8 text-center">{occurrence.likes || 0}</td>
                                                <td className="py-[10px] px-8 text-center">
                                                    {occurrence.midias_count > 0 ? (
                                                        <div className="flex items-center justify-center">
                                                            <LiaPaperclipSolid title={`${occurrence.midias_count} anexos`} color="#272c6b" fontSize={24} />
                                                        </div>
                                                    ) : (
                                                        "---"
                                                    )}
                                                </td>
                                                <td className={`py-[12px] px-8 ${index === filteredOccurrences.length - 1 ? "rounded-br-2xl" : ""}`}>
                                                    <div className="flex gap-2 justify-center">
                                                        <Link title="Ver ocorrência" href={`/occurrences/${occurrence.id}`}>
                                                            <FaEye className="cursor-pointer" fontSize={24} color="272c6b" />
                                                        </Link>
                                                        <FaCheckToSlot
                                                            title="Finalizar ocorrência"
                                                            className="cursor-pointer"
                                                            fontSize={24}
                                                            color="272c6b"
                                                            onClick={() => handleEndClick(occurrence.id)}
                                                        />
                                                        <FaTrash title="Deletar ocorrência" className="cursor-pointer" fontSize={24} color="272c6b" onClick={() => handleDeleteClick(occurrence.id)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {totalPages > 1 && filteredOccurrences.length > 0 && !typeFilter && !dateFilter && !authorFilter && !attachmentFilter && (
                                <div className="flex justify-center mt-4 gap-2">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-[#272c6b] text-white rounded-lg disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-4 py-2">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-[#272c6b] text-white rounded-lg disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
