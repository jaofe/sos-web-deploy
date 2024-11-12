/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            });
            if (!response.ok) {
                throw new Error("Erro ao fazer login");
            }

            const data = await response.json();
            console.log(data);
            localStorage.setItem("token", data.access_token);
            router.push("/");
            toast.success("Login realizado com sucesso!");
        } catch (err: any) {
            toast.error("Erro ao fazer login");
        }
    };

    return (
        <div className="flex h-screen">
            <div className="flex-1 flex items-center justify-center bg-white">
                <Image src="/logo_defesa_civil_maceio.png" alt="Defesa Civil Brasil" width={100} height={100} className="w-1/3" quality={100} />
            </div>
            <div className="flex-1 flex items-center justify-center bg-[#272C6B]">
                <div className="bg-white p-12 rounded-2xl shadow-md w-3/5">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-xl pl-2 font-medium text-[#606060]" htmlFor="email">
                                E-mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="mt-2 block w-full border-2 border-[#4B77CC] rounded-full p-2 pl-4 shadow-xl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="my-6">
                            <label className="block text-xl pl-2 font-medium text-[#606060]" htmlFor="password">
                                Senha
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="mt-2 block w-full border-2 border-[#4B77CC] rounded-full p-2 pl-4 shadow-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#272C6B] text-lg text-white py-2.5 rounded-full hover:brightness-125 transition">
                            Entrar
                        </button>
                        <div className="mt-2 text-right">
                            <a href="#" className="text-xl text-[#606060] hover:underline">
                                Esqueci a senha
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
