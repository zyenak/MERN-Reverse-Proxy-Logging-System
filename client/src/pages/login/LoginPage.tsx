import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="https://ability.com.pk/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-secondary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <img src="/src/assets/ability.png" alt="Ability" className="size-4" />
          </div>
          Ability
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
