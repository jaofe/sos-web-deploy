interface SidebarItemProps {
    name: string;
    icon: React.ReactNode;
    active?: boolean;
}

export default function SidebarItem({ icon, name, active }: SidebarItemProps) {
    return (
        <div className={`flex items-center cursor-pointer w-full text-lg ${active ? "text-[#272C6B]" : "hover:text-[#272C6B] text-[#828080]"} transition group`}>
            {icon}
            <span className="text-md pl-3">{name}</span>
        </div>
    );
}
