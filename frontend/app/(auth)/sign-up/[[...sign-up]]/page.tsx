import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
