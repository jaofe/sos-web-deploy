"use client";

import { FaHouse, FaTriangleExclamation, FaFileSignature, FaRightFromBracket } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";

import SidebarItem from "./SidebarItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
    const url = usePathname().toLowerCase();

    return (
        <div className="flex flex-col w-52 h-auto bg-white">
            <div className="flex flex-col gap-2 items-center pt-8">
                <Link href="/">
                    <Image src="/logo_defesa_civil_maceio.png" alt="Logo" width={100} height={100} />
                </Link>
                <div className="text-black font-semibold text-center text-lg px-8">
                    <div>SOS Defesa Civil Maceió</div>
                    <div className="border-b border-black mt-4"></div>
                </div>
            </div>
            <div className="flex flex-col gap-8 w-full px-8 mt-6 items-start">
                <Link href="/">
                    <SidebarItem active={url === "/"} name="Home" icon={<FaHouse fontSize={32} />} />
                </Link>
                <Link href="/occurrences">
                    <SidebarItem active={url === "/occurrences"} name="Ocorrências" icon={<FaTriangleExclamation fontSize={30} />} />
                </Link>
                <Link href="/register">
                    <SidebarItem active={url === "/register"} name="Registrar" icon={<FaFileSignature fontSize={32} />} />
                </Link>
                <Link href="/logs">
                    <SidebarItem active={url === "/logs"} name="Registros" icon={<FaHistory fontSize={30} />} />
                </Link>
            </div>
            <div className="flex gap-3 w-full mb-6 items-center self-end flex-col-reverse flex-1">
                <Link href="/login">
                    <SidebarItem name="Sair" icon={<FaRightFromBracket fontSize={32} />} />
                </Link>
            </div>
        </div>
    );
}
