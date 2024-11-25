/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { toast } from "react-hot-toast";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { icons } from "@/constants/Icons";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface User {
    id: string;
    admin: boolean;
    name: string;
}

interface ChartDataItem {
    tipo: keyof typeof icons;
    count: number;
}

interface MonthlyChartItem {
    tipo: keyof typeof icons;
    year: number;
    month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    count: number;
}

interface PieChartData {
    data: ChartDataItem[];
}

interface MonthlyChartData {
    data: MonthlyChartItem[];
}

const monthNames = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
};

const Home = () => {
    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [totalAccesses, setTotalAccesses] = useState(0);
    const [totalOccurrences, setTotalOccurrences] = useState(0);
    const [totalLikes, setTotalLikes] = useState(0);

    const [dailyAccesses, setDailyAccesses] = useState(0);
    const [dailyOccurrences, setDailyOccurrences] = useState(0);
    const [dailyLikes, setDailyLikes] = useState(0);

    const [yesterdayAccesses, setYesterdayAccesses] = useState(0);
    const [yesterdayOccurrences, setYesterdayOccurrences] = useState(0);
    const [yesterdayLikes, setYesterdayLikes] = useState(0);

    const [lastWeekAccesses, setLastWeekAccesses] = useState(0);
    const [lastWeekOccurrences, setLastWeekOccurrences] = useState(0);
    const [lastWeekLikes, setLastWeekLikes] = useState(0);

    const [pieData, setPieData] = useState<{ labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string[] }[] }>({
        labels: [],
        datasets: [],
    });
    const [barData, setBarData] = useState<{
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
        }[];
    }>({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchAdminUsers = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar usuários");
                }
                const users: User[] = await response.json();
                const filteredAdminUsers = users.filter((user) => user.admin);
                setAdminUsers(filteredAdminUsers);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }
        };

        const fetchDashboardData = async () => {
            try {
                const [accessResponse, occurrenceResponse, likeResponse, pieResponse, monthlyResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/sessions-card`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/ocorrencias-card`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/curtidas-card`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/pie-chart`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/monthly-chart`),
                ]);

                if (!accessResponse.ok || !occurrenceResponse.ok || !likeResponse.ok || !pieResponse.ok || !monthlyResponse.ok) {
                    throw new Error("Erro ao buscar dados do dashboard");
                }

                const accessData = await accessResponse.json();
                const occurrenceData = await occurrenceResponse.json();
                const likeData = await likeResponse.json();
                const pieChartData: PieChartData = await pieResponse.json();
                const monthlyChartData: MonthlyChartData = await monthlyResponse.json();

                setTotalAccesses(accessData.total);
                setTotalOccurrences(occurrenceData.total);
                setTotalLikes(likeData.total);

                setDailyAccesses(accessData.today);
                setDailyOccurrences(occurrenceData.today);
                setDailyLikes(likeData.today);

                setYesterdayAccesses(accessData.yesterdayPercent.toFixed(2));
                setYesterdayOccurrences(occurrenceData.yesterdayPercent.toFixed(2));
                setYesterdayLikes(likeData.yesterdayPercent.toFixed(2));

                setLastWeekAccesses(accessData.lastWeekPercent.toFixed(2));
                setLastWeekOccurrences(occurrenceData.lastWeekPercent.toFixed(2));
                setLastWeekLikes(likeData.lastWeekPercent.toFixed(2));

                setPieData({
                    labels: pieChartData.data.map((item) => icons[item.tipo].name),
                    datasets: [
                        {
                            label: "Ocorrências por Tipo",
                            data: pieChartData.data.map((item) => item.count),
                            backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(255, 159, 64, 0.6)", "rgba(255, 205, 86, 0.6)", "rgba(75, 192, 192, 0.6)", "rgba(54, 162, 235, 0.6)"],
                        },
                    ],
                });

                const groupedData = new Map<string, Map<string, number>>();
                const types = new Set<string>();

                monthlyChartData.data.forEach((item) => {
                    const monthKey = `${monthNames[item.month]}/${item.year}`;
                    if (!groupedData.has(monthKey)) {
                        groupedData.set(monthKey, new Map());
                    }
                    groupedData.get(monthKey)?.set(icons[item.tipo].name, item.count);
                    types.add(icons[item.tipo].name);
                });

                const labels = Array.from(groupedData.keys());
                const datasets = Array.from(types).map((type, index) => ({
                    label: type,
                    data: labels.map((month) => groupedData.get(month)?.get(type) || 0),
                    backgroundColor: `rgba(${54 + index * 40}, ${162 - index * 20}, ${235 - index * 30}, 0.6)`,
                }));

                setBarData({
                    labels,
                    datasets,
                });
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
                toast.error("Erro ao carregar dados do dashboard");
            }
        };

        fetchAdminUsers();
        fetchDashboardData();
    }, []);

    return (
        <div className="flex flex-col w-full h-full py-6">
            <div className="flex justify-between items-center border-b border-gray-300 pb-6">
                <span className="text-black font-semibold text-2xl px-8">
                    Admins Membros <span className="font-normal">({adminUsers.length})</span>
                </span>
                <div className="flex items-center ml-4 px-8">
                    {adminUsers.slice(0, 4).map((user, index) => (
                        <FaUserCircle key={index} fontSize={50} color={["#FFA500", "#F47560", "#61CDBB", "#E8C1A0"][index]} className="-mr-3" />
                    ))}
                    {adminUsers.length > 4 && <span className="bg-blue-500 text-white px-3.5 py-3 rounded-full -mr-3">+{adminUsers.length - 4}</span>}
                </div>
            </div>
            <div className="flex flex-col px-8 mt-8">
                <div className="flex gap-24 w-full">
                    <div className="flex flex-col w-full">
                        <div className="bg-white flex-col p-4 pb-2 rounded-t-2xl">
                            <div className="flex flex-col items-start flex-1 gap-2">
                                <span className="text-gray-600 text-center font-normal text-base">Total de Acessos</span>
                                <span className="text-black text-center font-bold text-3xl">{totalAccesses}</span>
                            </div>
                            <div className="flex justify-between mt-7">
                                <span className="flex gap-2 text-center font-normal text-base text-[#606060]">
                                    Semana passada:
                                    <span className="font-bold text-black flex gap-1 items-center">
                                        {lastWeekAccesses}% <BsChevronUp color="green" />
                                    </span>
                                </span>
                                <span className="flex gap-2 text-center font-normal text-base text-[#606060]">
                                    Ontem:
                                    <span className="font-bold text-black flex gap-1 items-center">
                                        {yesterdayAccesses}% <BsChevronDown color="red" />
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#4B77CC] flex justify-between p-4 rounded-b-2xl items-center">
                            <span className="text-white text-center text-lg">Acessos Diários: </span>
                            <span className="text-white text-center font-semibold text-2xl">{dailyAccesses}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="bg-white flex-col p-4 pb-2 rounded-t-2xl">
                            <div className="flex flex-col items-start flex-1 gap-2">
                                <span className="text-gray-600 text-center font-normal text-base">Total de Ocorrências</span>
                                <span className="text-black text-center font-bold text-3xl">{totalOccurrences}</span>
                            </div>
                            <div className="flex justify-between mt-7">
                                <span className="flex gap-2 text-center font-normal text-base text-[#606060]">
                                    Semana passada:
                                    <span className="font-bold text-black flex gap-1 items-center">
                                        {lastWeekOccurrences}% <BsChevronUp color="green" />
                                    </span>
                                </span>
                                <span className="flex gap-2 text-center font-normal text-base text-[#606060]">
                                    Ontem:
                                    <span className="font-bold text-black flex gap-1 items-center">
                                        {yesterdayOccurrences}% <BsChevronDown color="red" />
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#CC4B4B] flex justify-between p-4 rounded-b-2xl items-center">
                            <span className="text-white text-center text-lg">Ocorrências Diárias: </span>
                            <span className="text-white text-center font-semibold text-2xl">{dailyOccurrences}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="bg-white flex-col p-4 pb-2 rounded-t-2xl">
                            <div className="flex flex-col items-start flex-1 gap-2">
                                <span className="text-gray-600 text-center font-normal text-base">Total de Curtidas</span>
                                <span className="text-black text-center font-bold text-3xl">{totalLikes}</span>
                            </div>
                            <div className="flex justify-between mt-7">
                                <span className="flex gap-2 text-center font-normal text-base text-[#606060]">
                                    Semana passada:
                                    <span className="font-bold text-black flex gap-1 items-center">
                                        {lastWeekLikes}% <BsChevronUp color="green" />
                                    </span>
                                </span>
                                <span className="flex gap-2 text-center font-normal text-base text-[#606060]">
                                    Ontem:
                                    <span className="font-bold text-black flex gap-1 items-center">
                                        {yesterdayLikes}% <BsChevronDown color="red" />
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#934BCC] flex justify-between p-4 rounded-b-2xl items-center">
                            <span className="text-white text-center text-lg">Curtidas Diárias: </span>
                            <span className="text-white text-center font-semibold text-2xl">{dailyLikes}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 mt-12">
                    <div className="flex flex-col w-1/2">
                        <span className="bg-[#4B77CC] text-white px-4 py-2 rounded-t-2xl text-lg font-semibold">Ocorrências de desastres por tipos</span>
                        <div className="max-h-96 flex justify-center items-center bg-white rounded-b-2xl py-4">
                            <Pie data={pieData} width={500} height={800} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <span className="bg-[#4B77CC] text-white px-4 py-2 rounded-t-2xl text-lg font-semibold">Ocorrências de desastres no meses do ano</span>
                        <div className="max-h-96 flex justify-center items-center bg-white rounded-b-2xl py-4">
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        x: {
                                            stacked: false,
                                        },
                                        y: {
                                            ticks: {
                                                callback: function (tickValue: string | number) {
                                                    if (typeof tickValue === "number" && Number.isInteger(tickValue)) {
                                                        return tickValue;
                                                    }
                                                    return "";
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-col-reverse px-32 mt-12 mb-4">
                <span className="text-black text-center text-sm font-normal">© 2024 SOS Defesa Civil Maceió</span>
            </div>
        </div>
    );
};

export default Home;
