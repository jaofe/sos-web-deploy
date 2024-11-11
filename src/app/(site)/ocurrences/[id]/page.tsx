"use client";

import ActionButton from "@/components/ActionButton";
import Modal from "@/components/Modal";
import StatusItem from "@/components/StatusItem";
import React, { useState, useEffect } from "react";
import { FaCheck, FaCommentDots, FaTrash, FaPaperclip } from "react-icons/fa6";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Feedback {
    titulo: string;
    descricao: string;
    status: string;
    data_registro: string;
    user_id: number;
    oc_id: number;
    id: number;
}

interface Occurrence {
    id: number;
    tipo: string;
    bairro: string;
    latitude: number;
    longitude: number;
    descricao: string;
    data_registro: string;
    ultima_atualizacao: string;
    curtidas_count: number;
    midias: string[];
    feedbacks: Feedback[];
}

const statusOptions = {
    analyzing: "Ocorrência em Análise",
    in_progress: "Solucionando Ocorrência",
    finished: "Ocorrência Finalizada",
};

export default function OcurrencePage({ params }: { params: { id: string } }) {
    const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [occurrenceData, setOccurrenceData] = useState<Occurrence | null>(null);
    const router = useRouter();

    const handleEndOccurrence = async () => {
        const loadingToast = toast.loading("Finalizando ocorrência...");
        try {
            const response = await fetch(`http://localhost:8000/api/ocorrencia/${params.id}/finalizar`, {
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

    const handleUpdateOccurrence = async (status?: string) => {
        if (!status) {
            toast.error("Por favor, selecione um status");
            return;
        }

        const loadingToast = toast.loading("Atualizando ocorrência...");
        try {
            const response = await fetch("http://localhost:8000/api/feedback/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    titulo: statusOptions[status as keyof typeof statusOptions],
                    descricao: `${statusOptions[status as keyof typeof statusOptions]}`,
                    status: status,
                    data_registro: new Date().toISOString(),
                    user_id: localStorage.getItem("id"),
                    oc_id: params.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar ocorrência");
            }

            const fetchOccurrence = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/ocorrencia/${params.id}/`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch occurrence");
                    }
                    const data: Occurrence = await response.json();
                    setOccurrenceData(data);
                } catch (error) {
                    toast.error("Erro ao buscar ocorrência");
                }
            };

            await fetchOccurrence();

            toast.success("Ocorrência atualizada com sucesso!", { id: loadingToast });
            setIsUpdateModalOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Erro ao atualizar ocorrência", { id: loadingToast });
        }
    };

    const handleDeleteOccurrence = async () => {
        const loadingToast = toast.loading("Deletando ocorrência...");
        try {
            const response = await fetch(`http://localhost:8000/api/ocorrencia/${params.id}/`, {
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
            setIsDeleteModalOpen(false);
            router.push("/ocurrences");
        } catch (error) {
            toast.error("Erro ao deletar ocorrência", { id: loadingToast });
        }
    };

    useEffect(() => {
        const fetchOccurrence = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/ocorrencia/${params.id}/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch occurrence");
                }
                const data: Occurrence = await response.json();
                setOccurrenceData(data);
            } catch (error) {
                toast.error("Erro ao buscar ocorrência");
            }
        };

        fetchOccurrence();
    }, [params.id]);

    return (
        <>
            <Modal isOpen={isEndModalOpen} onClose={() => setIsEndModalOpen(false)} onConfirm={handleEndOccurrence} type="end" />
            <Modal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onConfirm={handleUpdateOccurrence}
                type="update"
                currentStatuses={occurrenceData?.feedbacks.filter((feedback) => feedback.status !== "finished").map((feedback) => feedback.status)}
            />
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteOccurrence} type="delete" />
            {occurrenceData && (
                <div className="flex flex-col w-full h-full px-8 py-6">
                    <span className="text-black text-2xl font-semibold">Ocorrência nº {occurrenceData.id}</span>
                    <div className="flex gap-8 px-14 mt-8">
                        <div className="w-[600px]">
                            <MapContainer
                                center={[occurrenceData.latitude, occurrenceData.longitude]}
                                zoom={13}
                                className="w-full h-[500px] relative overflow-hidden z-0"
                                whenReady={() => {
                                    setTimeout(() => {
                                        window.dispatchEvent(new Event("resize"));
                                    }, 200);
                                }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[occurrenceData.latitude, occurrenceData.longitude]} icon={L.icon({ iconUrl: "/marker.png", iconSize: [30, 30] })} />
                            </MapContainer>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <span className="flex gap-4">
                                <span className="font-semibold text-lg">Tipo:</span>
                                <span className="text-lg">{occurrenceData.tipo === "tipo1" ? "Incêndio" : occurrenceData.tipo === "tipo2" ? "Inundação" : "Queda de Árvore"}</span>
                            </span>
                            <span className="flex flex-col gap-2">
                                <span className="font-semibold text-lg">Localização:</span>
                                <p className="text-justify text-lg">{occurrenceData.bairro}</p>
                            </span>
                            <span className="flex gap-4">
                                <span className="font-semibold text-lg">Coordenadas:</span>
                                <span className="text-lg">
                                    {occurrenceData.latitude}, {occurrenceData.longitude}
                                </span>
                            </span>
                            <span className="flex gap-4">
                                <span className="font-semibold text-lg">Curtidas:</span>
                                <p className="text-justify text-lg">{occurrenceData.curtidas_count}</p>
                            </span>
                            <span className="flex gap-4">
                                <span className="font-semibold text-lg">Criado em:</span>
                                <span className="text-lg">{new Date(occurrenceData.data_registro).toLocaleString()}</span>
                            </span>
                            <span className="flex gap-4">
                                <span className="font-semibold text-lg">Atualizado em:</span>
                                <span className="text-lg">{new Date(occurrenceData.ultima_atualizacao).toLocaleString()}</span>
                            </span>
                            <span className="flex flex-col gap-2">
                                <span className="font-semibold text-lg">Descrição:</span>
                                <p className="text-justify text-lg">{occurrenceData.descricao}</p>
                            </span>
                            <span className="flex flex-col gap-2">
                                <span className="font-semibold text-lg">Anexos:</span>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        {occurrenceData.midias.map((midia) => (
                                            <div key={midia} className="bg-[#4B77CC] rounded-lg p-2 w-fit">
                                                <Link href={`http://localhost:8000${midia}`} target="_blank">
                                                    <FaPaperclip color="white" size={20} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 px-14 mt-8">
                        <span className="text-black text-2xl font-semibold">Histórico de Atualizações: </span>
                        <div className="flex gap-4 items-center w-full mt-4 justify-start px-4">
                            {occurrenceData.feedbacks
                                .slice()
                                .reverse()
                                .map((feedback, index, array) => (
                                    <>
                                        <StatusItem key={feedback.id} title={feedback.titulo} date={feedback.data_registro} />
                                        {index < array.length - 1 && <div className="bg-[#4B77CC] h-0.5 w-12 mx-4" />}
                                    </>
                                ))}
                        </div>
                    </div>
                    <div className="flex justify-between w-4/6 px-[4.5rem] mt-16">
                        <ActionButton
                            text="Finalizar Ocorrência"
                            icon={<FaCheck fontSize={32} color={occurrenceData.feedbacks.some((feedback) => feedback.status === "finished") ? "#808080" : "#292E6C"} />}
                            callback={() => setIsEndModalOpen(true)}
                            disabled={occurrenceData.feedbacks.some((feedback) => feedback.status === "finished")}
                        />
                        <ActionButton
                            text="Dar Retorno da Ocorrência"
                            icon={<FaCommentDots fontSize={32} color={occurrenceData.feedbacks.some((feedback) => feedback.status === "finished") ? "#808080" : "#292E6C"} />}
                            callback={() => setIsUpdateModalOpen(true)}
                            disabled={occurrenceData.feedbacks.some((feedback) => feedback.status === "finished")}
                        />
                        <ActionButton text="Apagar Ocorrência" icon={<FaTrash fontSize={32} color="#292E6C" />} callback={() => setIsDeleteModalOpen(true)} />
                    </div>
                    <div className="flex flex-1 flex-col-reverse px-32 mt-20 mb-4">
                        <span className="text-black text-center text-sm font-normal">© 2024 SOS Defesa Civil Maceió</span>
                    </div>
                </div>
            )}
        </>
    );
}
