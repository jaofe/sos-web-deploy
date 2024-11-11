import React, { useState } from "react";
import { FaChevronDown, FaXmark } from "react-icons/fa6";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status?: string) => void;
    type: "update" | "delete" | "end";
    currentStatuses?: string[];
}

const TypeInfo: Record<ModalProps["type"], { title: string }> = {
    update: {
        title: "Atualizar Status",
    },
    delete: {
        title: "Apagar Ocorrência?",
    },
    end: {
        title: "Finalizar Ocorrência?",
    },
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, type, currentStatuses }) => {
    const [status, setStatus] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10" onClick={onClose}>
            <div className="bg-white flex flex-col rounded-lg p-4 w-96" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-normal">{TypeInfo[type].title}</h2>
                    <FaXmark size={24} color="#828080" className="cursor-pointer" onClick={onClose} />
                </div>
                {type !== "update" ? (
                    <div className="flex flex-col gap-2 justify-between">
                        <button className="bg-[#4B77CC] text-white py-2 px-4 rounded-lg w-full" onClick={() => onConfirm()}>
                            Confirmar
                        </button>
                        <button className="bg-[#EEEEEE] text-black py-2 px-4 rounded-lg w-full" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 justify-between">
                        <div className="relative">
                            <select className="bg-[#EEEEEE] text-black py-2 px-4 rounded-lg w-full appearance-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option selected value="">
                                    Status da Ocorrência
                                </option>
                                {!currentStatuses?.includes("analyzing") && <option value="analyzing">Em Análise</option>}
                                {!currentStatuses?.includes("in_progress") && <option value="in_progress">Solucionando</option>}
                                {!currentStatuses?.includes("finished") && <option value="finished">Finalizada</option>}
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>
                        <button className="bg-[#4B77CC] text-white py-2 px-4 rounded-lg w-full" onClick={() => onConfirm(status)}>
                            Confirmar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
