"use client";

import ActionButton from "@/components/ActionButton";
import React, { useState, useEffect } from "react";
import { FaCheck, FaChevronDown, FaUpload } from "react-icons/fa";
import { FaWater, FaFire, FaTree, FaQuestionCircle, FaSearch } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const icons = {
    tipo2: {
        icon: <FaWater color="white" size={24} />,
        color: "bg-[#007BFF]",
    },
    tipo1: {
        icon: <FaFire color="white" size={24} />,
        color: "bg-[#FF5733]",
    },
    tipo3: {
        icon: <FaTree color="white" size={24} />,
        color: "bg-[#28A745]",
    },
    outros: {
        icon: <FaQuestionCircle color="white" size={24} />,
        color: "bg-[#6C757D]",
    },
};

function LocationMarker({ setCoordinates }: { setCoordinates: (coordinates: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setCoordinates(e.latlng);
        },
    });

    return null;
}

export default function OccurrenceRegister() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState("tipo1");
    const [coordinates, setCoordinates] = useState<L.LatLng | null>(null);
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(event.target.value);
    };

    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(event.target.value);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
            toast.success(`${event.target.files.length} arquivo(s) selecionado(s)`);
        }
    };

    const handleAddressSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (address) {
            const loadingToast = toast.loading("Buscando endereço...");
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
                const data = await response.json();
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    const latLng = L.latLng(lat, lon);
                    setCoordinates(latLng);
                    toast.success("Endereço encontrado!", { id: loadingToast });
                } else {
                    toast.error("Endereço não encontrado", { id: loadingToast });
                }
            } catch (error) {
                toast.error("Erro ao buscar endereço", { id: loadingToast });
            }
        }
    };

    const fetchAddress = async (latlng: L.LatLng) => {
        const loadingToast = toast.loading("Buscando endereço...");
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();
            setAddress(data.display_name);
            toast.success("Endereço encontrado!", { id: loadingToast });
        } catch (error) {
            toast.error("Erro ao buscar endereço", { id: loadingToast });
        }
    };

    const customIcon = new L.Icon({
        iconUrl: "/marker.png",
        iconSize: [30, 30],
    });

    useEffect(() => {
        if (coordinates) {
            fetchAddress(coordinates);
        }
    }, [coordinates]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!coordinates) {
            toast.error("Por favor, selecione um local no mapa");
            return;
        }

        const loadingToast = toast.loading("Registrando ocorrência...");
        try {
            const occurrenceData = {
                tipo: selectedType,
                bairro: address,
                descricao: description,
                data_registro: new Date().toISOString(),
                ultima_atualizacao: new Date().toISOString(),
                user_id: localStorage.getItem("id"),
                latitude: coordinates.lat,
                longitude: coordinates.lng,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ocorrencia/`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(occurrenceData),
            });

            if (!response.ok) {
                throw new Error("Failed to create occurrence");
            }

            const result = await response.json();
            const occurrenceId = result.id;

            if (files.length > 0) {
                const formData = new FormData();
                files.forEach((file) => {
                    formData.append("midias", file);
                });

                const mediaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/midia/?ocorrencia_id=${occurrenceId}&tipo=image`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                });

                if (!mediaResponse.ok) {
                    try {
                        const errorData = await mediaResponse.json();
                        throw new Error(errorData.detail);
                    } catch (error) {
                        throw new Error("Failed to upload media");
                    }
                }
            }

            toast.success("Ocorrência registrada com sucesso!", { id: loadingToast });
            router.push("/occurrences");
        } catch (error) {
            toast.error("Erro ao registrar ocorrência", { id: loadingToast });
            console.error("Error creating occurrence:", error);
        }
    };

    return (
        <>
            <div className="flex flex-col w-full h-full px-8 py-6">
                <span className="text-black text-2xl font-semibold">Selecione o local:</span>
                <div className="px-14">
                    <MapContainer center={[-9.590717, -35.7584107]} zoom={13} className="w-full h-96 mt-8">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                        <LocationMarker setCoordinates={(latlng) => setCoordinates(latlng)} />
                        {coordinates && <Marker position={coordinates} icon={customIcon} />}
                    </MapContainer>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-8 justify-between px-32 mt-8">
                    <div className="flex flex-col gap-2 w-full">
                        <label htmlFor="address-input" className="text-[#000] text-2xl font-normal">
                            Endereço*:
                        </label>
                        <div className="relative">
                            <FaSearch color="#505050" fontSize={18} className="absolute left-4 top-1/2 transform -translate-y-1/2" />
                            <input
                                id="address-input"
                                type="text"
                                className="w-full h-12 text-lg rounded-lg px-4 pl-11"
                                placeholder="Digite o endereço"
                                value={address}
                                onChange={handleAddressChange}
                                onKeyDown={(e) => e.key === "Enter" && handleAddressSubmit(e)}
                            />
                        </div>
                        <label htmlFor="type-input" className="text-[#000] text-2xl font-normal">
                            Tipo de Ocorrência*:
                        </label>
                        <div className="relative">
                            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded ${icons[selectedType as keyof typeof icons].color}`}>
                                {icons[selectedType as keyof typeof icons].icon}
                            </div>
                            <select id="type-input" className="relative w-full bg-white h-16 text-lg rounded-lg px-6 pl-16 appearance-none" value={selectedType} onChange={handleSelectChange}>
                                <option value="tipo1">Incêndio</option>
                                <option value="tipo2">Inundação</option>
                                <option value="tipo3">Queda de Árvore</option>
                                <option value="outros">Outros</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="description-input" className="text-[#000] text-2xl font-normal">
                                Descrição*:
                            </label>
                            <textarea
                                id="description-input"
                                rows={6}
                                className="w-full text-lg rounded-lg px-4 py-2"
                                placeholder="Digite a descrição"
                                value={description}
                                onChange={handleDescriptionChange}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <span className="text-[#000] text-2xl font-normal">Anexos de Mídia*: </span>
                            <div className="relative">
                                <input type="file" id="file-input" className="hidden z-20" multiple onChange={handleFileChange} />
                                <FaUpload color="#505050" fontSize={18} className="absolute left-6 top-1/2 transform -translate-y-1/2" />
                                <label htmlFor="file-input" className="bg-white flex items-center w-max h-14 text-lg rounded-lg px-8 pl-16 cursor-pointer">
                                    Anexe os arquivos de mídia
                                </label>
                            </div>
                            {files.length > 0 && <span className="text-black text-sm font-normal mt-1">{files.length} arquivo(s) selecionado(s)</span>}
                        </div>
                    </div>
                </form>
                <div className="flex justify-end mt-8 px-32">
                    <ActionButton text="Registrar Ocorrência" icon={<FaCheck fontSize={32} color="#292E6C" />} callback={(event: React.FormEvent) => handleSubmit(event)} />
                </div>
                <div className="flex flex-1 flex-col-reverse px-32 mt-20 mb-4">
                    <span className="text-black text-center text-sm font-normal">© 2024 SOS Defesa Civil Maceió</span>
                </div>
            </div>
        </>
    );
}
