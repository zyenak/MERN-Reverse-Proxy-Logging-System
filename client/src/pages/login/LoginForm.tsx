import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useLogin } from "@/hooks/useAuth"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, clearError } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }

    const result = await login(username, password);
    if (result.success) {
      toast.success("Login successful!");
      // Redirect will happen automatically via AuthContext state change
    } else {
      toast.error(result.error || "Login failed");
      // Clear password on failed login
      setPassword("");
    }
  };

  return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username" className="mb-2">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="mb-2">Password</Label>
                                    <span className="ml-auto text-sm text-muted-foreground cursor-not-allowed">
                                        Forgot your password?
                                    </span>
                                </div>
                                                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                            </div>
                                            <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="https://ability.com.pk/" target="_blank" rel="noopener noreferrer">Terms of Service</a>{" "}
                and <a href="https://ability.com.pk/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </div>
        </div>
    )
}
