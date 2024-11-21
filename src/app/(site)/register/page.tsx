import dynamic from "next/dynamic";

const Register = dynamic(() => import("./Register"), { ssr: false });

export default Register;
