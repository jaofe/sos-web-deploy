export default function ActionButton({
    text,
    icon,
    callback,
    disabled = false,
}: {
    text: string;
    icon: React.ReactNode;
    callback: (event: React.MouseEvent | React.FormEvent) => void;
    disabled?: boolean;
}) {
    return (
        <div className={`bg-white flex gap-4 p-4 rounded-lg items-center select-none ${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`} onClick={callback}>
            {icon}
            <span className={`text-lg ${disabled ? "text-[#808080]" : "text-[#292E6C]"}`}>{text}</span>
        </div>
    );
}
