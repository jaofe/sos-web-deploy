export default function StatusItem({ title, date }: { title: string; date: string }) {
    const formattedDate = new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const formattedTime = new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="flex flex-col min-w-60">
            <div className="bg-[#4B77CC] rounded-t-2xl p-3 text-center">
                <span className="text-white font-medium text-lg">{title}</span>
            </div>
            <div className="bg-white rounded-b-2xl p-4 text-center">
                <span className="text-[#303030]">
                    {formattedDate}
                    <br />
                    {formattedTime}
                </span>
            </div>
        </div>
    );
}
