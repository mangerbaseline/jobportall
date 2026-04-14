
import { SignupForm } from "@/components/signup-form"


export default function Login() {

    return (

        <div className="relative flex items-center justify-center max-h-screen">
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
                }}
            />
            
            <SignupForm className="relative z-10 w-full max-w-sm my-2" />
        </div>




    )

}